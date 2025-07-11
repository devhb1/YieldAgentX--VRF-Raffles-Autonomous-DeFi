import { VercelRequest, VercelResponse } from '@vercel/node'
import productionAIService from '../services/ProductionAIService'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' })
        return
    }

    try {
        const sentiment = await productionAIService.getMarketSentiment()
        res.json({
            success: true,
            data: sentiment
        })
    } catch (error) {
        console.error('Market sentiment analysis failed:', error)
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}
