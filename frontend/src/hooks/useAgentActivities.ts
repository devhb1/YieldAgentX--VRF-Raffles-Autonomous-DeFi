import { useState, useEffect } from 'react'
import { usePublicClient } from 'wagmi'
import { formatEther, parseAbiItem } from 'viem'
import { AgentActivity } from './useAgentActivity'

const AI_VAULT_ADDRESS = process.env.NEXT_PUBLIC_AI_VAULT_ADDRESS as `0x${string}` || '0x299bB7655582f94f4293BB64775C9E1fcE210F3b' as `0x${string}`

// Define event ABIs for the contract
const EVENT_ABIS = [
    parseAbiItem('event AgentCreated(uint256 indexed agentId, address indexed owner, string name, uint8 strategy)'),
    parseAbiItem('event FundsDeposited(uint256 indexed agentId, uint256 amount, uint256 totalValue)'),
    parseAbiItem('event AllocationExecuted(uint256 indexed agentId, uint8 protocol, uint256 amount)'),
    parseAbiItem('event RebalanceExecuted(uint256 indexed agentId, string reason)'),
    parseAbiItem('event WithdrawalExecuted(uint256 indexed agentId, uint256 amount)'),
    parseAbiItem('event YieldHarvested(uint256 indexed agentId, uint256 amount)')
]

const PROTOCOL_NAMES = {
    0: 'Lido Staking',
    1: 'Aave Lending',
    2: 'Uniswap V3 LP',
    3: 'Compound',
    4: 'Curve Finance'
}

// Helper function to fetch block timestamp with caching
const blockTimestampCache = new Map<string, Date>()

const getBlockTimestamp = async (publicClient: any, blockNumber: bigint): Promise<Date> => {
    const blockKey = blockNumber.toString()
    if (blockTimestampCache.has(blockKey)) {
        return blockTimestampCache.get(blockKey)!
    }

    try {
        const block = await publicClient.getBlock({ blockNumber })
        const timestamp = new Date(Number(block.timestamp) * 1000)
        blockTimestampCache.set(blockKey, timestamp)
        return timestamp
    } catch (error) {
        console.warn('Failed to fetch block timestamp:', error)
        return new Date() // Fallback to current time
    }
}

export function useAgentActivities(agentIds: bigint[]) {
    const [activities, setActivities] = useState<{ [key: string]: { activities: AgentActivity[], isLoading: boolean } }>({})
    const publicClient = usePublicClient()

    useEffect(() => {
        if (!publicClient || !agentIds.length) return

        const fetchRealActivities = async () => {
            for (const agentId of agentIds) {
                const agentIdStr = agentId.toString()

                // Skip if already loaded
                if (activities[agentIdStr]) continue

                // Set loading state
                setActivities(prev => ({
                    ...prev,
                    [agentIdStr]: { activities: [], isLoading: true }
                }))

                try {
                    console.log(`🔍 Fetching real onchain activities for Agent ${agentId}...`)

                    // Get current block and search in recent blocks
                    const currentBlock = await publicClient.getBlockNumber()
                    const fromBlock = currentBlock - 10000n // Look back 10,000 blocks (~1-2 days on Sepolia)

                    console.log(`Searching blocks ${fromBlock} to ${currentBlock} for Agent ${agentId}`)

                    const allActivities: AgentActivity[] = []

                    // Fetch events for each event type
                    for (const eventAbi of EVENT_ABIS) {
                        try {
                            const logs = await publicClient.getLogs({
                                address: AI_VAULT_ADDRESS,
                                event: eventAbi,
                                fromBlock,
                                toBlock: 'latest',
                                args: {
                                    agentId // Filter by specific agent
                                }
                            })

                            console.log(`Found ${logs.length} ${eventAbi.name} events for Agent ${agentId}`)

                            // Process each log
                            for (const log of logs) {
                                const timestamp = await getBlockTimestamp(publicClient, log.blockNumber)

                                let activity: AgentActivity | null = null

                                switch (log.eventName) {
                                    case 'AgentCreated':
                                        activity = {
                                            id: `${agentId}-creation-${log.blockNumber}-${log.logIndex}`,
                                            type: 'creation',
                                            txHash: log.transactionHash,
                                            blockNumber: log.blockNumber,
                                            timestamp,
                                            status: 'success',
                                            description: `Agent "${log.args?.name || 'Unknown'}" created with strategy ${log.args?.strategy}`,
                                            etherscanUrl: `https://sepolia.etherscan.io/tx/${log.transactionHash}`
                                        }
                                        break

                                    case 'FundsDeposited':
                                        activity = {
                                            id: `${agentId}-deposit-${log.blockNumber}-${log.logIndex}`,
                                            type: 'deposit',
                                            txHash: log.transactionHash,
                                            blockNumber: log.blockNumber,
                                            timestamp,
                                            amount: log.args?.amount as bigint,
                                            status: 'success',
                                            description: `Deposited ${formatEther(log.args?.amount as bigint)} ETH`,
                                            etherscanUrl: `https://sepolia.etherscan.io/tx/${log.transactionHash}`
                                        }
                                        break

                                    case 'AllocationExecuted':
                                        const protocol = PROTOCOL_NAMES[log.args?.protocol as keyof typeof PROTOCOL_NAMES] || `Protocol ${log.args?.protocol}`
                                        activity = {
                                            id: `${agentId}-allocation-${log.blockNumber}-${log.logIndex}`,
                                            type: 'allocation',
                                            txHash: log.transactionHash,
                                            blockNumber: log.blockNumber,
                                            timestamp,
                                            amount: log.args?.amount as bigint,
                                            protocol,
                                            status: 'success',
                                            description: `Allocated ${formatEther(log.args?.amount as bigint)} ETH to ${protocol}`,
                                            etherscanUrl: `https://sepolia.etherscan.io/tx/${log.transactionHash}`
                                        }
                                        break

                                    case 'WithdrawalExecuted':
                                        activity = {
                                            id: `${agentId}-withdrawal-${log.blockNumber}-${log.logIndex}`,
                                            type: 'withdrawal',
                                            txHash: log.transactionHash,
                                            blockNumber: log.blockNumber,
                                            timestamp,
                                            amount: log.args?.amount as bigint,
                                            status: 'success',
                                            description: `Withdrew ${formatEther(log.args?.amount as bigint)} ETH`,
                                            etherscanUrl: `https://sepolia.etherscan.io/tx/${log.transactionHash}`
                                        }
                                        break

                                    case 'RebalanceExecuted':
                                        activity = {
                                            id: `${agentId}-rebalance-${log.blockNumber}-${log.logIndex}`,
                                            type: 'rebalance',
                                            txHash: log.transactionHash,
                                            blockNumber: log.blockNumber,
                                            timestamp,
                                            status: 'success',
                                            description: `Rebalance: ${log.args?.reason || 'Automated rebalancing'}`,
                                            etherscanUrl: `https://sepolia.etherscan.io/tx/${log.transactionHash}`
                                        }
                                        break

                                    case 'YieldHarvested':
                                        activity = {
                                            id: `${agentId}-yield-${log.blockNumber}-${log.logIndex}`,
                                            type: 'yield',
                                            txHash: log.transactionHash,
                                            blockNumber: log.blockNumber,
                                            timestamp,
                                            amount: log.args?.amount as bigint,
                                            status: 'success',
                                            description: `Harvested ${formatEther(log.args?.amount as bigint)} ETH yield`,
                                            etherscanUrl: `https://sepolia.etherscan.io/tx/${log.transactionHash}`
                                        }
                                        break
                                }

                                if (activity) {
                                    allActivities.push(activity)
                                }
                            }
                        } catch (eventError) {
                            console.warn(`Failed to fetch ${eventAbi.name} events:`, eventError)
                        }
                    }

                    // Sort by block number (newest first) and limit to 10
                    allActivities.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber))
                    const latest10Activities = allActivities.slice(0, 10)

                    console.log(`✅ Found ${latest10Activities.length} real activities for Agent ${agentId}`)

                    setActivities(prev => ({
                        ...prev,
                        [agentIdStr]: {
                            activities: latest10Activities.length > 0 ? latest10Activities : [{
                                id: `${agentId}-no-activity`,
                                type: 'creation',
                                txHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
                                blockNumber: BigInt(0),
                                timestamp: new Date(),
                                status: 'success',
                                description: 'No onchain activity found. This agent may be newly created or inactive.',
                                etherscanUrl: `https://sepolia.etherscan.io/address/${AI_VAULT_ADDRESS}`
                            }],
                            isLoading: false
                        }
                    }))

                } catch (error) {
                    console.error(`❌ Error fetching activities for Agent ${agentId}:`, error)

                    // Show error state
                    setActivities(prev => ({
                        ...prev,
                        [agentIdStr]: {
                            activities: [{
                                id: `${agentId}-error`,
                                type: 'creation',
                                txHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
                                blockNumber: BigInt(0),
                                timestamp: new Date(),
                                status: 'failed',
                                description: 'Failed to load onchain activities. Network error or invalid agent.',
                                etherscanUrl: `https://sepolia.etherscan.io/address/${AI_VAULT_ADDRESS}`
                            }],
                            isLoading: false
                        }
                    }))
                }
            }
        }

        fetchRealActivities()
    }, [publicClient, agentIds.join(',')]) // Use join to create stable dependency

    return activities
}
