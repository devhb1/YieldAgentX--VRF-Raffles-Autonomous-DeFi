import { useState, useEffect, useCallback } from 'react'
import { useUserAgents, formatAgentMetrics } from './useAIVault'

const AI_BACKEND_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:3001'

export interface PortfolioInsights {
    totalValue: number
    totalYield: number
    averageAPR: number
    totalReturn: number
    riskScore: number
    marketSentiment: 'bullish' | 'bearish' | 'neutral'
    confidence: number
    rebalanceStatus: 'optimal' | 'needs-rebalance' | 'critical'
    recommendations: string[]
    riskFactors: string[]
    lastUpdate: Date
}

export interface MarketData {
    sentiment: 'bullish' | 'bearish' | 'neutral'
    confidence: number
    ethPrice: number
    defiTvl: number
    volatility: number
}

// Hook for AI-powered portfolio insights
export function useAIInsights() {
    const { agents, isLoading: isLoadingAgents } = useUserAgents()
    const [insights, setInsights] = useState<PortfolioInsights | null>(null)
    const [marketData, setMarketData] = useState<MarketData | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const generateInsights = useCallback(async () => {
        if (!agents || agents.length === 0) return

        setIsLoading(true)
        setError(null)

        try {
            // Format agent data for AI analysis
            const portfolioData = agents.map(agent => formatAgentMetrics(agent))

            // Calculate portfolio metrics
            const totalValue = portfolioData.reduce((sum, agent) => sum + parseFloat(agent.totalValue), 0)
            const totalYield = portfolioData.reduce((sum, agent) => sum + parseFloat(agent.totalYield), 0)
            const averageAPR = portfolioData.reduce((sum, agent) => sum + parseFloat(agent.apr), 0) / portfolioData.length
            const totalReturn = portfolioData.reduce((sum, agent) => sum + parseFloat(agent.performance), 0) / portfolioData.length

            // Call real AI backend for analysis
            const aiAnalysisResponse = await fetch(`${AI_BACKEND_URL}/api/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    portfolioValue: totalValue,
                    currentAllocations: portfolioData.reduce((acc, agent) => {
                        acc[`agent_${agent.address}`] = parseFloat(agent.totalValue)
                        return acc
                    }, {} as Record<string, number>),
                    riskTolerance: averageAPR > 15 ? 'aggressive' : averageAPR > 10 ? 'balanced' : 'conservative'
                })
            })

            if (!aiAnalysisResponse.ok) {
                throw new Error('Failed to get AI analysis')
            }

            const aiAnalysisData = await aiAnalysisResponse.json()
            const aiInsights = aiAnalysisData.success ? aiAnalysisData.data : null

            if (!aiInsights) {
                throw new Error('Invalid AI analysis response')
            }

            setInsights({
                totalValue,
                totalYield,
                averageAPR,
                totalReturn,
                riskScore: aiInsights.riskScore || 50,
                marketSentiment: aiInsights.marketSentiment || 'neutral',
                confidence: aiInsights.confidence || 75,
                rebalanceStatus: aiInsights.rebalanceNeeded ? 'needs-rebalance' : 'optimal',
                recommendations: aiInsights.recommendations || ['Consider diversifying your portfolio', 'Monitor market conditions closely'],
                riskFactors: aiInsights.riskFactors || ['Market volatility', 'Protocol risks'],
                lastUpdate: new Date()
            })

            // Fetch market data from AI service
            const marketResponse = await fetch(`${AI_BACKEND_URL}/api/market-sentiment`)
            if (marketResponse.ok) {
                const marketResponseData = await marketResponse.json()
                const marketData = marketResponseData.success ? marketResponseData.data : null
                if (marketData) {
                    setMarketData({
                        sentiment: marketData.overall_sentiment || 'neutral',
                        confidence: marketData.confidence_score || 75,
                        ethPrice: marketData.eth_price || 3000,
                        defiTvl: marketData.defi_tvl || 50000000000,
                        volatility: marketData.volatility || 25
                    })
                }
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate insights')
        } finally {
            setIsLoading(false)
        }
    }, [agents])

    useEffect(() => {
        if (!isLoadingAgents && agents && agents.length > 0) {
            generateInsights()
        }
    }, [isLoadingAgents, agents, generateInsights])

    return {
        insights,
        marketData,
        isLoading: isLoading || isLoadingAgents,
        error,
        refetch: generateInsights
    }
}

// Hook for real-time market sentiment
export function useMarketSentiment() {
    const [sentiment, setSentiment] = useState<{
        overall: 'bullish' | 'bearish' | 'neutral'
        confidence: number
        factors: string[]
    } | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const fetchSentiment = async () => {
        setIsLoading(true)
        try {
            const response = await fetch(`${AI_BACKEND_URL}/api/market-sentiment`)
            if (response.ok) {
                const responseData = await response.json()
                const marketData = responseData.success ? responseData.data : null
                if (marketData) {
                    setSentiment({
                        overall: marketData.overall_sentiment || 'neutral',
                        confidence: marketData.confidence_score || 75,
                        factors: marketData.factors || [
                            'ETH price momentum',
                            'DeFi TVL trends',
                            'Yield farming opportunities',
                            'Market volatility analysis'
                        ]
                    })
                }
            }
        } catch (error) {
            console.error('Failed to fetch sentiment:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSentiment()
        const interval = setInterval(fetchSentiment, 60000) // Update every minute
        return () => clearInterval(interval)
    }, [])

    return {
        sentiment,
        isLoading,
        refetch: fetchSentiment
    }
}
