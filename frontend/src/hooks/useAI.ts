import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'

const AI_BACKEND_URL = process.env.NEXT_PUBLIC_AI_BACKEND_URL || 'http://localhost:3001'

interface AIAnalysis {
    riskLevel: 'low' | 'moderate' | 'high'
    marketSentiment: 'bullish' | 'bearish' | 'neutral'
    portfolioScore: number
    rebalanceNeeded: boolean
    recommendations: string[]
    lastUpdated: number
}

interface PortfolioAnalysis {
    totalValue: number
    totalYield: number
    performancePercent: number
    allocation: {
        [protocol: string]: number
    }
    agents: Array<{
        id: number
        name: string
        value: number
        yield: number
        allocation: { [protocol: string]: number }
    }>
}

export function useAIAnalysis() {
    const { address } = useAccount()
    const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchAnalysis = useCallback(async () => {
        if (!address) return

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${AI_BACKEND_URL}/api/analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userAddress: address }),
            })

            if (!response.ok) {
                throw new Error('Failed to fetch AI analysis')
            }

            const data = await response.json()
            setAnalysis(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }, [address])

    useEffect(() => {
        if (address) {
            fetchAnalysis()
        }
    }, [address, fetchAnalysis])

    return {
        analysis,
        loading,
        error,
        refetch: fetchAnalysis,
    }
}

export function usePortfolioAnalysis() {
    const { address } = useAccount()
    const [portfolio, setPortfolio] = useState<PortfolioAnalysis | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchPortfolio = useCallback(async () => {
        if (!address) return

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${AI_BACKEND_URL}/api/portfolio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userAddress: address }),
            })

            if (!response.ok) {
                throw new Error('Failed to fetch portfolio analysis')
            }

            const data = await response.json()
            setPortfolio(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }, [address])

    useEffect(() => {
        if (address) {
            fetchPortfolio()
        }
    }, [address, fetchPortfolio])

    return {
        portfolio,
        loading,
        error,
        refetch: fetchPortfolio,
    }
}

export function useStrategyRecommendation(strategyType: 0 | 1 | 2) {
    const [recommendation, setRecommendation] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchRecommendation = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`${AI_BACKEND_URL}/api/strategy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ strategy: strategyType }),
            })

            if (!response.ok) {
                throw new Error('Failed to fetch strategy recommendation')
            }

            const data = await response.json()
            setRecommendation(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }, [strategyType])

    useEffect(() => {
        fetchRecommendation()
    }, [strategyType, fetchRecommendation])

    return {
        recommendation,
        loading,
        error,
        refetch: fetchRecommendation,
    }
}
