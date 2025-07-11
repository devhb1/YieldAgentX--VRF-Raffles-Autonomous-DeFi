import { useReadContract, useWriteContract, useAccount, useReadContracts } from 'wagmi'
import { AI_VAULT_ABI } from '@/lib/abis'
import { parseEther, formatEther, encodeAbiParameters } from 'viem'
import { useMemo, useState, useEffect } from 'react'
import type { Abi } from 'viem'

const AI_VAULT_ADDRESS = process.env.NEXT_PUBLIC_AI_VAULT_ADDRESS as `0x${string}` || '0x742d35cc6bf00532e51b2cf8713ee8c65b4bd52d' as `0x${string}`

export interface Agent {
    id: bigint
    owner: string
    name: string
    strategy: number
    totalDeposited: bigint
    currentValue: bigint
    totalYield: bigint
    lastRebalance: bigint
    createdAt: bigint
    isActive: boolean
    paused: boolean
}

export interface AgentMetrics {
    totalValue: string
    totalYield: string
    performance: string
    apr: string
    isPositive: boolean
    strategy: string
    address: string
    status: string
}

// Read hooks
export function useUserAgents() {
    const { address } = useAccount()

    console.log('🔍 useUserAgents debug:', {
        address,
        contractAddress: AI_VAULT_ADDRESS,
        isAddressValid: !!address
    });

    const { data: agentIds, isLoading: isLoadingIds, refetch: refetchIds, error: idsError } = useReadContract({
        address: AI_VAULT_ADDRESS,
        abi: AI_VAULT_ABI as any,
        functionName: 'getUserAgents' as any,
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
        }
    })

    console.log('📊 getUserAgents result:', {
        agentIds,
        isLoadingIds,
        error: idsError,
        agentIdsType: typeof agentIds,
        agentIdsArray: Array.isArray(agentIds) ? agentIds.map(id => id.toString()) : 'not array'
    });

    // Get detailed data for each agent using getAgent function
    const agentContracts = useMemo(() => {
        if (!agentIds || !Array.isArray(agentIds)) return []
        return agentIds.map((id: bigint) => ({
            address: AI_VAULT_ADDRESS,
            abi: AI_VAULT_ABI as any,
            functionName: 'getAgent' as any,
            args: [id] as const,
        }))
    }, [agentIds])

    const { data: agentsData, isLoading: isLoadingAgents, refetch: refetchAgents } = useReadContracts({
        contracts: agentContracts,
        query: {
            enabled: agentContracts.length > 0,
        }
    })

    const agents = useMemo(() => {
        if (!agentIds || !agentsData) {
            console.log('🚫 No agentIds or agentsData:', { agentIds, agentsData });
            return []
        }

        const processedAgents = agentsData.map((result, index) => {
            console.log(`🔍 Processing agent ${index}:`, {
                status: result.status,
                hasResult: !!result.result,
                result: result.result
            });

            if (result.status === 'success' && result.result) {
                // getAgent returns a tuple/struct with named properties
                const data = result.result as {
                    id: bigint
                    owner: string
                    name: string
                    strategy: number
                    totalDeposited: bigint
                    currentValue: bigint
                    totalYield: bigint
                    lastRebalance: bigint
                    createdAt: bigint
                    isActive: boolean
                }

                console.log('✅ Valid agent data:', {
                    id: data.id.toString(),
                    name: data.name,
                    owner: data.owner,
                    strategy: data.strategy
                });

                return {
                    id: data.id,
                    owner: data.owner,
                    name: data.name,
                    strategy: Number(data.strategy),
                    totalDeposited: data.totalDeposited,
                    currentValue: data.currentValue,
                    totalYield: data.totalYield,
                    lastRebalance: data.lastRebalance,
                    createdAt: data.createdAt,
                    isActive: data.isActive,
                    paused: !data.isActive // Assuming isActive is opposite of paused
                } as Agent
            }
            return null
        }).filter(Boolean) as Agent[]

        console.log('🎯 Final processed agents:', processedAgents.length, processedAgents);
        return processedAgents;
    }, [agentIds, agentsData])

    const result = {
        agents,
        isLoading: isLoadingIds || isLoadingAgents,
        refetch: () => {
            refetchIds()
            refetchAgents()
        }
    }

    console.log('📤 useUserAgents returning:', {
        agentsCount: result.agents.length,
        isLoading: result.isLoading,
        agents: result.agents
    });

    return result
}

export function useAgent(agentId: bigint | undefined) {
    return useReadContract({
        address: AI_VAULT_ADDRESS,
        abi: AI_VAULT_ABI as any,
        functionName: 'getAgent' as any,
        args: agentId !== undefined ? [agentId] : undefined,
        query: {
            enabled: agentId !== undefined,
        }
    })
}

export function useAgentAllocation(agentId: bigint | undefined) {
    return useReadContract({
        address: AI_VAULT_ADDRESS,
        abi: AI_VAULT_ABI as any,
        functionName: 'getAllocationWithUSD' as any,
        args: agentId !== undefined ? [agentId] : undefined,
        query: {
            enabled: agentId !== undefined,
        }
    })
}

export function useContractStats() {
    return useReadContract({
        address: AI_VAULT_ADDRESS,
        abi: AI_VAULT_ABI as any,
        functionName: 'getContractStats' as any,
    })
}

// Write hooks
export function useCreateAgent() {
    const { writeContract, isPending, isSuccess, error } = useWriteContract()

    const createAgent = (name: string, strategy: number) => {
        writeContract({
            address: AI_VAULT_ADDRESS,
            abi: AI_VAULT_ABI as any,
            functionName: 'createAgent' as any,
            args: [name, strategy],
        })
    }

    return {
        createAgent,
        isLoading: isPending,
        isSuccess,
        error
    }
}

export function useDepositToAgent() {
    const { writeContract, isPending, isSuccess, error } = useWriteContract()

    const deposit = (agentId: bigint, amount: string) => {
        writeContract({
            address: AI_VAULT_ADDRESS,
            abi: AI_VAULT_ABI as any,
            functionName: 'depositToAgent' as any,
            args: [agentId],
            value: parseEther(amount),
        })
    }

    return {
        deposit,
        isLoading: isPending,
        isSuccess,
        error
    }
}

export function useWithdrawFromAgent() {
    const { writeContract, isPending, isSuccess, error } = useWriteContract()

    const withdraw = (agentId: bigint, amount: string) => {
        writeContract({
            address: AI_VAULT_ADDRESS,
            abi: AI_VAULT_ABI as any,
            functionName: 'withdrawFromAgent' as any,
            args: [agentId, parseEther(amount)],
        })
    }

    return {
        withdraw,
        isLoading: isPending,
        isSuccess,
        error
    }
}

export function useToggleAgentPause() {
    const { writeContract, isPending } = useWriteContract()

    const togglePause = (agentId: bigint, isPaused: boolean) => {
        const functionName = isPaused ? 'emergencyUnpause' : 'emergencyPause'
        writeContract({
            address: AI_VAULT_ADDRESS,
            abi: AI_VAULT_ABI as any,
            functionName,
            args: [agentId],
        })
    }

    return {
        togglePause,
        isLoading: isPending
    }
}

export function useCheckUpkeep() {
    const { data, ...rest } = useReadContract({
        address: AI_VAULT_ADDRESS,
        abi: AI_VAULT_ABI as Abi,
        functionName: 'checkUpkeep' as any,
        args: ["0x"], // Empty data
    })

    // checkUpkeep returns (bool upkeepNeeded, bytes performData)
    const typedData = data as readonly [boolean, `0x${string}`] | undefined

    return {
        data: typedData,
        ...rest
    }
}

export function usePerformUpkeep() {
    const { writeContract, isPending, isSuccess, error } = useWriteContract()

    const performUpkeep = (performData: `0x${string}` = "0x") => {
        writeContract({
            address: AI_VAULT_ADDRESS,
            abi: AI_VAULT_ABI as Abi,
            functionName: 'performUpkeep' as any,
            args: [performData],
        })
    }

    return {
        performUpkeep,
        isLoading: isPending,
        isSuccess,
        error
    }
}

// Manual rebalance for a specific agent
export function useManualRebalance() {
    const { writeContractAsync, isPending, isSuccess, error } = useWriteContract()

    const manualRebalance = async (agentId: bigint) => {
        // Create performData for this specific agent - encode as array of agent IDs
        const agentIds = [agentId]
        const performData = encodeAbiParameters(
            [{ type: 'uint256[]' }],
            [agentIds]
        )

        return await writeContractAsync({
            address: AI_VAULT_ADDRESS,
            abi: AI_VAULT_ABI as Abi,
            functionName: 'performUpkeep' as any,
            args: [performData],
        })
    }

    return {
        manualRebalance,
        isLoading: isPending,
        isSuccess,
        error
    }
}

// Check if agent needs rebalancing based on contract logic
export function useAgentRebalanceInfo(agentId: bigint | undefined) {
    return useReadContract({
        address: AI_VAULT_ADDRESS,
        abi: AI_VAULT_ABI as Abi,
        functionName: 'checkUpkeep' as any,
        args: ["0x"],
        query: {
            enabled: agentId !== undefined,
        }
    })
}

// Utility functions
export function formatAgentMetrics(agent: Agent): AgentMetrics {
    const totalValue = formatEther(agent.currentValue)
    const totalYield = formatEther(agent.totalYield)
    const totalDeposited = formatEther(agent.totalDeposited)

    const performance = agent.totalDeposited > 0n
        ? ((Number(agent.currentValue) - Number(agent.totalDeposited)) / Number(agent.totalDeposited) * 100)
        : 0

    // Calculate APR based on time elapsed and yield
    const timeElapsed = Date.now() / 1000 - Number(agent.createdAt)
    const yearsElapsed = timeElapsed / (365 * 24 * 60 * 60)
    const apr = yearsElapsed > 0 && agent.totalDeposited > 0n
        ? (Number(agent.totalYield) / Number(agent.totalDeposited) / yearsElapsed * 100)
        : 0

    // Generate short address
    const address = `0x${agent.id.toString(16).padStart(8, '0')}...${agent.id.toString(16).slice(-4)}`

    return {
        totalValue: parseFloat(totalValue).toFixed(4),
        totalYield: parseFloat(totalYield).toFixed(4),
        performance: performance.toFixed(2),
        apr: apr.toFixed(1),
        isPositive: performance >= 0,
        strategy: getStrategyName(agent.strategy),
        address,
        status: agent.paused ? 'Paused' : (agent.isActive ? 'Active' : 'Inactive')
    }
}

export function getStrategyName(strategy: number): string {
    switch (strategy) {
        case 0: return 'Conservative'
        case 1: return 'Balanced'
        case 2: return 'Aggressive'
        default: return 'Unknown'
    }
}

export function getStrategyDescription(strategy: number): string {
    switch (strategy) {
        case 0: return 'Low-risk strategy focusing on stable yields'
        case 1: return 'Moderate risk with balanced exposure'
        case 2: return 'High-risk, high-reward strategy'
        default: return 'Unknown strategy'
    }
}

export function getStrategyColor(strategy: number): string {
    switch (strategy) {
        case 0: return 'from-green-400 to-green-600'
        case 1: return 'from-blue-400 to-blue-600'
        case 2: return 'from-red-400 to-red-600'
        default: return 'from-gray-400 to-gray-600'
    }
}

export function getStrategyBorderColor(strategy: number): string {
    switch (strategy) {
        case 0: return 'border-green-500/30'
        case 1: return 'border-blue-500/30'
        case 2: return 'border-red-500/30'
        default: return 'border-gray-500/30'
    }
}