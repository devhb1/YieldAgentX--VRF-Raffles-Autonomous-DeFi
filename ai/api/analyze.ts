import { VercelRequest, VercelResponse } from '@vercel/node'
import productionAIService from '../services/ProductionAIService'

interface PortfolioData {
  portfolioValue: number
  currentAllocations: Record<string, number>
  riskTolerance: 'conservative' | 'balanced' | 'aggressive'
  timeHorizon?: string
  strategy?: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
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

    res.json({
      success: true,
      data: analysis
    })
  } catch (error) {
    console.error('Portfolio analysis failed:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
