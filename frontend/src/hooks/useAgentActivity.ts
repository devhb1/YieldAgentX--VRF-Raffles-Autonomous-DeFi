import { useState, useEffect, useCallback } from 'react'
import { usePublicClient } from 'wagmi'
import { parseAbiItem, formatEther, decodeEventLog } from 'viem'
import { AI_VAULT_ABI } from '@/lib/abis'

export interface AgentActivity {
    id: string
    type: 'deposit' | 'withdraw' | 'withdrawal' | 'rebalance' | 'creation' | 'pause' | 'unpause' | 'allocation' | 'yield_harvest' | 'yield' | 'strategy_change'
    txHash: string
    blockNumber: bigint
    timestamp: Date
    amount?: bigint
    protocol?: string
    from?: string
    to?: string
    gasUsed?: bigint
    status: 'success' | 'failed'
    description?: string
    apy?: number
    etherscanUrl?: string
}

const AI_VAULT_ADDRESS = process.env.NEXT_PUBLIC_AI_VAULT_ADDRESS as `0x${string}` || '0x742d35cc6bf00532e51b2cf8713ee8c65b4bd52d' as `0x${string}`

// Event definitions (matching the actual contract events)
const EVENT_ABIS = [
    parseAbiItem('event AgentCreated(uint256 indexed agentId, address indexed owner, string name, uint8 strategy)'),
    parseAbiItem('event FundsDeposited(uint256 indexed agentId, uint256 amount, uint256 totalValue)'),
    parseAbiItem('event FundsWithdrawn(uint256 indexed agentId, uint256 amount, uint256 remainingValue)'),
    parseAbiItem('event AllocationExecuted(uint256 indexed agentId, uint8 protocol, uint256 amount)'),
    parseAbiItem('event YieldHarvested(uint256 indexed agentId, uint256 totalYield)'),
    parseAbiItem('event RebalanceExecuted(uint256 indexed agentId, string reason)'),
    parseAbiItem('event StrategyChanged(uint256 indexed agentId, uint8 oldStrategy, uint8 newStrategy)')
]

// Protocol mapping
const PROTOCOL_NAMES = {
    0: 'Lido Staking',
    1: 'Aave Lending',
    2: 'Uniswap V3 LP',
    3: 'Compound',
    4: 'Curve Finance'
}

const PROTOCOL_APYS = {
    0: 4.0,   // Lido
    1: 3.0,   // Aave
    2: 8.0,   // Uniswap
    3: 3.5,   // Compound
    4: 7.0    // Curve
}

const STRATEGY_NAMES = {
    0: 'Conservative',
    1: 'Balanced',
    2: 'Aggressive'
}

export function useAgentActivity(agentId: bigint) {
    const [activities, setActivities] = useState<AgentActivity[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const publicClient = usePublicClient()

    const fetchAgentActivity = useCallback(async () => {
        if (!publicClient || !agentId) return

        setIsLoading(true)
        setError(null)

        try {
            // Get the current block number
            const currentBlock = await publicClient.getBlockNumber()
            const fromBlock = currentBlock - 10000n // Look back ~10000 blocks (~2 days)

            const allLogs = []

            // Fetch logs for each event type
            for (const eventAbi of EVENT_ABIS) {
                try {
                    const logs = await publicClient.getLogs({
                        address: AI_VAULT_ADDRESS,
                        event: eventAbi,
                        args: {
                            agentId: agentId
                        },
                        fromBlock,
                        toBlock: currentBlock
                    })
                    allLogs.push(...logs)
                } catch (logError) {
                    console.warn(`Failed to fetch logs for event:`, logError)
                }
            }

            // Sort logs by block number (most recent first)
            allLogs.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber))

            // Transform logs into activity objects
            const activities: AgentActivity[] = []

            for (const log of allLogs) {
                try {
                    // Get block info for timestamp
                    const block = await publicClient.getBlock({ blockNumber: log.blockNumber })

                    // Get transaction receipt for gas info
                    const receipt = await publicClient.getTransactionReceipt({ hash: log.transactionHash })

                    // Decode the event log to get event name and args
                    let decodedLog: any = null
                    let eventName = ''

                    for (const eventAbi of EVENT_ABIS) {
                        try {
                            decodedLog = decodeEventLog({
                                abi: [eventAbi],
                                data: log.data,
                                topics: log.topics
                            })
                            eventName = decodedLog.eventName
                            break
                        } catch {
                            // Continue to next event ABI
                        }
                    }

                    if (!decodedLog) {
                        console.warn('Could not decode log:', log)
                        continue
                    }

                    const activity: AgentActivity = {
                        id: `${log.transactionHash}-${log.logIndex}`,
                        type: getActivityType(eventName),
                        txHash: log.transactionHash,
                        blockNumber: log.blockNumber,
                        timestamp: new Date(Number(block.timestamp) * 1000),
                        gasUsed: receipt.gasUsed,
                        status: receipt.status === 'success' ? 'success' : 'failed'
                    }

                    // Extract specific data based on event type
                    if (decodedLog.args) {
                        const args = decodedLog.args as any

                        if (eventName === 'FundsDeposited' || eventName === 'FundsWithdrawn') {
                            activity.amount = args.amount
                        } else if (eventName === 'AllocationExecuted') {
                            activity.amount = args.amount
                            activity.protocol = PROTOCOL_NAMES[args.protocol as keyof typeof PROTOCOL_NAMES] || `Protocol ${args.protocol}`
                            activity.apy = PROTOCOL_APYS[args.protocol as keyof typeof PROTOCOL_APYS] || 0
                        } else if (eventName === 'YieldHarvested') {
                            activity.amount = args.totalYield
                        } else if (eventName === 'RebalanceExecuted') {
                            activity.description = `Rebalanced: ${args.reason}`
                        } else if (eventName === 'AgentCreated') {
                            activity.from = args.owner
                            activity.description = `Agent "${args.name}" created with ${STRATEGY_NAMES[args.strategy as keyof typeof STRATEGY_NAMES] || 'Unknown'} strategy`
                        } else if (eventName === 'StrategyChanged') {
                            const oldStrategy = STRATEGY_NAMES[args.oldStrategy as keyof typeof STRATEGY_NAMES] || 'Unknown'
                            const newStrategy = STRATEGY_NAMES[args.newStrategy as keyof typeof STRATEGY_NAMES] || 'Unknown'
                            activity.description = `Strategy changed from ${oldStrategy} to ${newStrategy}`
                        }
                    }

                    activities.push(activity)
                } catch (activityError) {
                    console.warn('Failed to process activity log:', activityError)
                }
            }

            setActivities(activities)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch agent activity')
            console.error('Error fetching agent activity:', err)
        } finally {
            setIsLoading(false)
        }
    }, [publicClient, agentId])

    useEffect(() => {
        if (agentId && agentId > 0n) {
            fetchAgentActivity()
        }
    }, [agentId, publicClient, fetchAgentActivity])

    return {
        activities,
        isLoading,
        error,
        refetch: fetchAgentActivity
    }
}

function getActivityType(eventName: string): AgentActivity['type'] {
    switch (eventName) {
        case 'AgentCreated':
            return 'creation'
        case 'FundsDeposited':
            return 'deposit'
        case 'FundsWithdrawn':
            return 'withdraw'
        case 'AllocationExecuted':
            return 'allocation'
        case 'YieldHarvested':
            return 'yield_harvest'
        case 'RebalanceExecuted':
            return 'rebalance'
        case 'StrategyChanged':
            return 'strategy_change'
        default:
            return 'creation'
    }
}

// Helper function to get activity icon
export function getActivityIcon(type: AgentActivity['type']): string {
    switch (type) {
        case 'creation':
            return '🎯'
        case 'deposit':
            return '💰'
        case 'withdraw':
        case 'withdrawal':
            return '💸'
        case 'allocation':
            return '🔄'
        case 'yield_harvest':
        case 'yield':
            return '🌾'
        case 'rebalance':
            return '⚖️'
        case 'strategy_change':
            return '📊'
        case 'pause':
            return '⏸️'
        case 'unpause':
            return '▶️'
        default:
            return '📄'
    }
}

// Helper function to format activity description
export function formatActivityDescription(activity: AgentActivity): string {
    if (activity.description) {
        return activity.description
    }

    switch (activity.type) {
        case 'creation':
            return 'Agent created'
        case 'deposit':
            return `Deposited ${activity.amount ? formatEther(activity.amount) : '0'} ETH`
        case 'withdraw':
            return `Withdrew ${activity.amount ? formatEther(activity.amount) : '0'} ETH`
        case 'allocation':
            return `Allocated ${activity.amount ? formatEther(activity.amount) : '0'} ETH to ${activity.protocol || 'protocol'}`
        case 'yield_harvest':
            return `Harvested ${activity.amount ? formatEther(activity.amount) : '0'} ETH in yield`
        case 'rebalance':
            return `Portfolio rebalanced`
        case 'strategy_change':
            return 'Investment strategy updated'
        case 'pause':
            return 'Agent paused'
        case 'unpause':
            return 'Agent resumed'
        default:
            return 'Unknown activity'
    }
}
