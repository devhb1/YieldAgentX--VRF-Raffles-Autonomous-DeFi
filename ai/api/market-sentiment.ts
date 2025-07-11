import { VercelRequest, VercelResponse } from '@vercel/node'
import productionAIService from '../services/ProductionAIService'
import { setCorsHeaders, handleOptions } from '../utils/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    setCorsHeaders(req, res)

    if (req.method === 'OPTIONS') {
        handleOptions(res)
        return
    }

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' })
        return
    }

    try {
        const sentiment = await productionAIService.getMarketSentiment()

        // Format response to match frontend expectations
        const result = {
            overall_sentiment: sentiment.sentiment,
            confidence_score: sentiment.confidence,
            indicators: sentiment.indicators,
            overall: sentiment.analysis,
            eth_price: 3200, // Mock ETH price
            defi_tvl: 50000000000, // Mock DeFi TVL
            volatility: 25, // Mock volatility percentage
            timestamp: Date.now()
        }

        res.json({
            success: true,
            data: result
        })
    } catch (error) {
        console.error('Market sentiment analysis failed:', error)
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}
