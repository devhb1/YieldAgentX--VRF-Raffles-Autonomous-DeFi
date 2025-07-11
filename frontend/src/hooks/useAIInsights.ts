import { useState, useEffect, useCallback } from 'react'
import { useUserAgents, formatAgentMetrics } from './useAIVault'

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

            // Simulate AI analysis (in a real app, this would call your AI service)
            const aiInsights = await analyzePortfolioWithAI(portfolioData)

            setInsights({
                totalValue,
                totalYield,
                averageAPR,
                totalReturn,
                riskScore: aiInsights.riskScore,
                marketSentiment: aiInsights.marketSentiment,
                confidence: aiInsights.confidence,
                rebalanceStatus: aiInsights.rebalanceStatus,
                recommendations: aiInsights.recommendations,
                riskFactors: aiInsights.riskFactors,
                lastUpdate: new Date()
            })

            // Fetch market data
            const market = await fetchMarketData()
            setMarketData(market)

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

// Simulated AI analysis function (replace with real AI service call)
async function analyzePortfolioWithAI(portfolioData: any[]): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const totalValue = portfolioData.reduce((sum, agent) => sum + parseFloat(agent.totalValue), 0)
    const avgPerformance = portfolioData.reduce((sum, agent) => sum + parseFloat(agent.performance), 0) / portfolioData.length

    // Calculate risk score based on strategy distribution and performance
    const strategyDistribution = portfolioData.reduce((acc, agent) => {
        acc[agent.strategy] = (acc[agent.strategy] || 0) + 1
        return acc
    }, {})

    const aggressiveCount = strategyDistribution['Aggressive'] || 0
    const conservativeCount = strategyDistribution['Conservative'] || 0
    const balancedCount = strategyDistribution['Balanced'] || 0

    const riskScore = Math.min(10, Math.max(1,
        (aggressiveCount * 8 + balancedCount * 5 + conservativeCount * 2) / portfolioData.length
    ))

    // Generate recommendations based on portfolio analysis
    const recommendations = []
    if (aggressiveCount > portfolioData.length * 0.6) {
        recommendations.push('Consider reducing aggressive strategies for better risk management')
    }
    if (avgPerformance < 0) {
        recommendations.push('Current market conditions suggest defensive positioning')
    }
    if (totalValue > 1000) {
        recommendations.push('Portfolio size allows for diversification into new protocols')
    }

    // Risk factors
    const riskFactors = []
    if (riskScore > 7) riskFactors.push('High concentration in aggressive strategies')
    if (avgPerformance < -5) riskFactors.push('Negative performance trend detected')
    if (portfolioData.length < 3) riskFactors.push('Limited diversification')

    return {
        riskScore: Math.round(riskScore),
        marketSentiment: avgPerformance > 5 ? 'bullish' : avgPerformance < -2 ? 'bearish' : 'neutral',
        confidence: Math.round(70 + Math.random() * 20), // 70-90% confidence
        rebalanceStatus: avgPerformance < -10 ? 'critical' : avgPerformance < 0 ? 'needs-rebalance' : 'optimal',
        recommendations,
        riskFactors
    }
}

// Simulated market data fetch (replace with real market data API)
async function fetchMarketData(): Promise<MarketData> {
    await new Promise(resolve => setTimeout(resolve, 800))

    return {
        sentiment: ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)] as any,
        confidence: Math.round(60 + Math.random() * 30),
        ethPrice: 2200 + Math.random() * 400,
        defiTvl: 45000000000 + Math.random() * 10000000000,
        volatility: 0.3 + Math.random() * 0.4
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
            // Simulate sentiment analysis
            await new Promise(resolve => setTimeout(resolve, 1000))

            const sentiments = ['bullish', 'bearish', 'neutral'] as const
            const overall = sentiments[Math.floor(Math.random() * 3)]

            setSentiment({
                overall,
                confidence: Math.round(65 + Math.random() * 25),
                factors: [
                    'ETH price momentum',
                    'DeFi TVL trends',
                    'Yield farming opportunities',
                    'Market volatility analysis'
                ]
            })
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
