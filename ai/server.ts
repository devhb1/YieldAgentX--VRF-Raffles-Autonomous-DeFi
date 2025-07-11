import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productionAIService from './services/ProductionAIService';
import contractServiceInstance from './services/ContractService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express.json());

// Types matching frontend expectations
interface PortfolioData {
    portfolioValue: number;
    currentAllocations: Record<string, number>;
    riskTolerance: 'conservative' | 'balanced' | 'aggressive';
    timeHorizon?: string;
    strategy?: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
}

interface AIAnalysisResult {
    riskScore: number;
    rebalanceNeeded: boolean;
    recommendations: string[];
    provider: string;
    timestamp: number;
}

interface MarketSentiment {
    overall_sentiment: 'bullish' | 'bearish' | 'neutral';
    confidence_score: number;
    indicators: Array<{
        name: string;
        value: string | number;
    }>;
    overall: string;
    eth_price: number;
    defi_tvl: number;
    volatility: number;
    timestamp: number;
}

interface RiskAssessment {
    riskLevel: 'low' | 'moderate' | 'high';
    factors: Array<{
        name: string;
        impact: string;
    }>;
    timestamp: number;
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const status = await productionAIService.checkHealth();
        res.json({
            status: status ? 'healthy' : 'unhealthy',
            timestamp: Date.now(),
            service: 'AI Backend',
            version: '1.0.0'
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'unhealthy',
            timestamp: Date.now(),
            error: 'Internal server error'
        });
    }
});

// Portfolio analysis endpoint
app.post('/api/analyze', async (req, res) => {
    try {
        const portfolioData: PortfolioData = req.body;

        if (!portfolioData || typeof portfolioData.portfolioValue !== 'number') {
            return res.status(400).json({
                success: false,
                error: 'Invalid portfolio data provided'
            });
        }

        const analysis = await productionAIService.analyzePortfolio(portfolioData);

        const result: AIAnalysisResult = {
            riskScore: analysis.riskScore,
            rebalanceNeeded: analysis.rebalanceNeeded,
            recommendations: analysis.recommendations,
            provider: 'Hugging Face AI',
            timestamp: Date.now()
        };

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Portfolio analysis failed:', error);
        res.status(500).json({
            success: false,
            error: 'Portfolio analysis failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Market sentiment endpoint
app.get('/api/market-sentiment', async (req, res) => {
    try {
        const sentiment = await productionAIService.getMarketSentiment();

        const result: MarketSentiment = {
            overall_sentiment: sentiment.sentiment,
            confidence_score: sentiment.confidence,
            indicators: sentiment.indicators,
            overall: sentiment.analysis,
            eth_price: 3200, // Mock ETH price
            defi_tvl: 50000000000, // Mock DeFi TVL
            volatility: 25, // Mock volatility percentage
            timestamp: Date.now()
        };

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Market sentiment analysis failed:', error);
        res.status(500).json({
            success: false,
            error: 'Market sentiment analysis failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Risk assessment endpoint
app.post('/api/risk-assessment', async (req, res) => {
    try {
        const portfolioData: PortfolioData = req.body;

        if (!portfolioData || typeof portfolioData.portfolioValue !== 'number') {
            return res.status(400).json({
                success: false,
                error: 'Invalid portfolio data provided'
            });
        }

        const riskData = await productionAIService.assessRisk(portfolioData);

        const result: RiskAssessment = {
            riskLevel: riskData.riskLevel,
            factors: riskData.factors,
            timestamp: Date.now()
        };

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Risk assessment failed:', error);
        res.status(500).json({
            success: false,
            error: 'Risk assessment failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Agent data endpoint (for backward compatibility)
app.get('/api/agents/:id', async (req, res) => {
    try {
        const agentId = parseInt(req.params.id);

        if (isNaN(agentId)) {
            return res.status(400).json({
                error: 'Invalid agent ID'
            });
        }

        // Get agent data from contract service
        const agentData = await contractServiceInstance.getAgentData(agentId);

        if (!agentData) {
            return res.status(404).json({
                error: 'Agent not found'
            });
        }

        res.json(agentData);
    } catch (error) {
        console.error('Agent data retrieval failed:', error);
        res.status(500).json({
            error: 'Agent data retrieval failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Contract interaction endpoints
app.get('/api/contract/agents', async (req, res) => {
    try {
        const agents = await contractServiceInstance.getAllAgents();
        res.json(agents);
    } catch (error) {
        console.error('Failed to get agents:', error);
        res.status(500).json({
            error: 'Failed to retrieve agents',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

app.get('/api/contract/balance/:address', async (req, res) => {
    try {
        const address = req.params.address;
        const balance = await contractServiceInstance.getBalance(address);
        res.json({ balance });
    } catch (error) {
        console.error('Failed to get balance:', error);
        res.status(500).json({
            error: 'Failed to retrieve balance',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message || 'Unknown error occurred'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🤖 AI Backend Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔍 Portfolio analysis: http://localhost:${PORT}/api/analyze`);
    console.log(`📈 Market sentiment: http://localhost:${PORT}/api/market-sentiment`);
    console.log(`⚠️  Risk assessment: http://localhost:${PORT}/api/risk-assessment`);

    // Environment status
    console.log('\n🔧 Environment Status:');
    console.log(`├── Hugging Face API: ${process.env.HUGGINGFACE_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`├── OpenAI API: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`├── CORS Origin: ${process.env.CORS_ORIGIN || 'Default'}`);
    console.log(`└── Node Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
