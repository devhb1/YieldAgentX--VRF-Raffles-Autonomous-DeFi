import { useState, useEffect } from 'react'
import { useReadContract } from 'wagmi'

// Chainlink ETH/USD Price Feed on Ethereum Mainnet
const ETH_USD_PRICE_FEED = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419' as const

const PRICE_FEED_ABI = [
    {
        inputs: [],
        name: 'latestRoundData',
        outputs: [
            { internalType: 'uint80', name: 'roundId', type: 'uint80' },
            { internalType: 'int256', name: 'answer', type: 'int256' },
            { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
            { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
            { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' }
        ],
        stateMutability: 'view',
        type: 'function'
    }
] as const

export interface PriceData {
    price: number
    lastUpdated: Date
    roundId: string
}

export function useChainlinkPrice() {
    const [ethPrice, setEthPrice] = useState<PriceData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { data: priceData, isError, refetch } = useReadContract({
        address: ETH_USD_PRICE_FEED,
        abi: PRICE_FEED_ABI,
        functionName: 'latestRoundData',
        query: {
            refetchInterval: 30000, // Refetch every 30 seconds
        }
    })

    useEffect(() => {
        if (priceData && Array.isArray(priceData)) {
            try {
                const [roundId, answer, , updatedAt] = priceData
                const price = Number(answer) / 1e8 // Chainlink returns price with 8 decimals
                const lastUpdated = new Date(Number(updatedAt) * 1000)

                setEthPrice({
                    price,
                    lastUpdated,
                    roundId: roundId.toString()
                })
                setIsLoading(false)
                setError(null)
            } catch (err) {
                setError('Failed to parse price data')
                setIsLoading(false)
            }
        } else if (isError) {
            setError('Failed to fetch price data')
            setIsLoading(false)
        }
    }, [priceData, isError])

    return {
        ethPrice,
        isLoading,
        error,
        refetch
    }
}

// Helper function to format USD value
export function formatUSD(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value)
}

// Helper function to calculate USD value from ETH
export function calculateUSDValue(ethAmount: number, ethPrice: number): number {
    return ethAmount * ethPrice
}
