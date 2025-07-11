import { VercelRequest, VercelResponse } from '@vercel/node'
import productionAIService from '../services/ProductionAIService'
import { setCorsHeaders, handleOptions } from '../utils/cors'

interface PortfolioData {
    portfolioValue: number
    currentAllocations: Record<string, number>
    riskTolerance: 'conservative' | 'balanced' | 'aggressive'
    timeHorizon?: string
    strategy?: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    setCorsHeaders(req, res)

    if (req.method === 'OPTIONS') {
        handleOptions(res)
        return
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' })
        return
    }

    try {
        const portfolioData: PortfolioData = req.body

        if (!portfolioData || typeof portfolioData.portfolioValue !== 'number') {
            return res.status(400).json({
                error: 'Invalid portfolio data provided'
            })
        }

        // Generate AI analysis
        const analysis = await productionAIService.analyzePortfolio(portfolioData)

        // Format response to match frontend expectations
        const result = {
            riskScore: analysis.riskScore,
            rebalanceNeeded: analysis.rebalanceNeeded,
            recommendations: analysis.recommendations,
            riskFactors: analysis.riskFactors || ['Market volatility', 'Protocol risks'],
            marketSentiment: analysis.marketSentiment || 'neutral',
            confidence: analysis.confidence || 75,
            provider: 'AI Analysis Service',
            timestamp: Date.now()
        }

        res.json({
            success: true,
            data: result
        })
    } catch (error) {
        console.error('Portfolio analysis failed:', error)
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}
