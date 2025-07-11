import { useState, useEffect } from 'react'
import { useReadContract } from 'wagmi'
import { AI_VAULT_ABI } from '@/lib/abis'
import { formatEther } from 'viem'

const AI_VAULT_ADDRESS = process.env.NEXT_PUBLIC_AI_VAULT_ADDRESS as `0x${string}` || '0x742d35cc6bf00532e51b2cf8713ee8c65b4bd52d' as `0x${string}`

export interface ProtocolAllocation {
    protocol: string
    amount: bigint
    amountETH: string
    amountUSD: string
    percentage: number
    apy: number
    description: string
    color: string
    icon: string
}

export interface PortfolioBreakdown {
    allocations: ProtocolAllocation[]
    totalValueETH: string
    totalValueUSD: string
    isLoading: boolean
    error: string | null
}

export function usePortfolioBreakdown(agentId: bigint | undefined): PortfolioBreakdown {
    const [error, setError] = useState<string | null>(null)

    // Get allocation data from contract
    const { data: allocationData, isLoading, refetch } = useReadContract({
        address: AI_VAULT_ADDRESS,
        abi: AI_VAULT_ABI as any,
        functionName: 'getAllocationWithUSD' as any,
        args: agentId !== undefined ? [agentId] : undefined,
        query: {
            enabled: agentId !== undefined,
        }
    })

    const parseAllocationData = (data: any): PortfolioBreakdown => {
        if (!data) {
            return {
                allocations: [],
                totalValueETH: '0.0000',
                totalValueUSD: '$0.00',
                isLoading: true,
                error: null
            }
        }

        try {
            const [
                allocation,
                lidoStakingUSD,
                aaveLendingUSD,
                uniswapLPUSD,
                compoundLendingUSD,
                curveLPUSD,
                cashReserveUSD,
                totalValueUSD
            ] = data

            const totalETH = parseFloat(formatEther(
                allocation.lidoStaking +
                allocation.aaveLending +
                allocation.uniswapLP +
                allocation.compoundLending +
                allocation.curveLP +
                allocation.cashReserve
            ))

            const allocations: ProtocolAllocation[] = []

            // Lido Staking
            if (allocation.lidoStaking > 0n) {
                const amountETH = parseFloat(formatEther(allocation.lidoStaking))
                allocations.push({
                    protocol: 'Lido Staking',
                    amount: allocation.lidoStaking,
                    amountETH: amountETH.toFixed(4),
                    amountUSD: `$${(Number(lidoStakingUSD) / 100).toFixed(2)}`,
                    percentage: totalETH > 0 ? (amountETH / totalETH) * 100 : 0,
                    apy: 4.0,
                    description: 'Ethereum 2.0 staking through Lido protocol',
                    color: 'from-blue-500 to-blue-600',
                    icon: '⟠'
                })
            }

            // Aave Lending
            if (allocation.aaveLending > 0n) {
                const amountETH = parseFloat(formatEther(allocation.aaveLending))
                allocations.push({
                    protocol: 'Aave Lending',
                    amount: allocation.aaveLending,
                    amountETH: amountETH.toFixed(4),
                    amountUSD: `$${(Number(aaveLendingUSD) / 100).toFixed(2)}`,
                    percentage: totalETH > 0 ? (amountETH / totalETH) * 100 : 0,
                    apy: 3.0,
                    description: 'Decentralized lending on Aave protocol',
                    color: 'from-purple-500 to-purple-600',
                    icon: '👻'
                })
            }

            // Uniswap LP
            if (allocation.uniswapLP > 0n) {
                const amountETH = parseFloat(formatEther(allocation.uniswapLP))
                allocations.push({
                    protocol: 'Uniswap V3 LP',
                    amount: allocation.uniswapLP,
                    amountETH: amountETH.toFixed(4),
                    amountUSD: `$${(Number(uniswapLPUSD) / 100).toFixed(2)}`,
                    percentage: totalETH > 0 ? (amountETH / totalETH) * 100 : 0,
                    apy: 8.0,
                    description: 'Liquidity provision on Uniswap V3',
                    color: 'from-pink-500 to-pink-600',
                    icon: '🦄'
                })
            }

            // Compound Lending
            if (allocation.compoundLending > 0n) {
                const amountETH = parseFloat(formatEther(allocation.compoundLending))
                allocations.push({
                    protocol: 'Compound',
                    amount: allocation.compoundLending,
                    amountETH: amountETH.toFixed(4),
                    amountUSD: `$${(Number(compoundLendingUSD) / 100).toFixed(2)}`,
                    percentage: totalETH > 0 ? (amountETH / totalETH) * 100 : 0,
                    apy: 3.5,
                    description: 'Algorithmic money markets on Compound',
                    color: 'from-green-500 to-green-600',
                    icon: '🏦'
                })
            }

            // Curve LP
            if (allocation.curveLP > 0n) {
                const amountETH = parseFloat(formatEther(allocation.curveLP))
                allocations.push({
                    protocol: 'Curve Finance',
                    amount: allocation.curveLP,
                    amountETH: amountETH.toFixed(4),
                    amountUSD: `$${(Number(curveLPUSD) / 100).toFixed(2)}`,
                    percentage: totalETH > 0 ? (amountETH / totalETH) * 100 : 0,
                    apy: 7.0,
                    description: 'Stablecoin and asset pools on Curve',
                    color: 'from-yellow-500 to-yellow-600',
                    icon: '📈'
                })
            }

            // Cash Reserve
            if (allocation.cashReserve > 0n) {
                const amountETH = parseFloat(formatEther(allocation.cashReserve))
                allocations.push({
                    protocol: 'Cash Reserve',
                    amount: allocation.cashReserve,
                    amountETH: amountETH.toFixed(4),
                    amountUSD: `$${(Number(cashReserveUSD) / 100).toFixed(2)}`,
                    percentage: totalETH > 0 ? (amountETH / totalETH) * 100 : 0,
                    apy: 0.0,
                    description: 'ETH held in reserve for rebalancing',
                    color: 'from-gray-500 to-gray-600',
                    icon: '💰'
                })
            }

            return {
                allocations: allocations.sort((a, b) => b.percentage - a.percentage),
                totalValueETH: totalETH.toFixed(4),
                totalValueUSD: `$${(Number(totalValueUSD) / 100).toFixed(2)}`,
                isLoading: false,
                error: null
            }
        } catch (err) {
            console.error('Error parsing allocation data:', err)
            setError('Failed to parse portfolio data')
            return {
                allocations: [],
                totalValueETH: '0.0000',
                totalValueUSD: '$0.00',
                isLoading: false,
                error: 'Failed to parse portfolio data'
            }
        }
    }

    const portfolioData = parseAllocationData(allocationData)

    return {
        ...portfolioData,
        isLoading: isLoading || portfolioData.isLoading,
        error: error || portfolioData.error
    }
}

export function getProtocolExplorerLink(protocol: string): string {
    switch (protocol) {
        case 'Lido Staking':
            return 'https://stake.lido.fi/'
        case 'Aave Lending':
            return 'https://app.aave.com/'
        case 'Uniswap V3 LP':
            return 'https://app.uniswap.org/'
        case 'Compound':
            return 'https://app.compound.finance/'
        case 'Curve Finance':
            return 'https://curve.fi/'
        default:
            return '#'
    }
}
