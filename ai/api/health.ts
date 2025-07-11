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
        const status = await productionAIService.checkHealth()
        res.json({
            status: status ? 'healthy' : 'unhealthy',
            timestamp: Date.now(),
            service: 'AI Backend',
            version: '1.0.0'
        })
    } catch (error) {
        console.error('Health check failed:', error)
        res.status(500).json({
            status: 'unhealthy',
            timestamp: Date.now(),
            error: 'Internal server error'
        })
    }
}
