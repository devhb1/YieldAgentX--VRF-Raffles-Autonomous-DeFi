import dotenv from 'dotenv';
import { ethers } from 'ethers';

// Load environment variables
dotenv.config();

export interface AllocationDecision {
  protocol: string;
  percentage: number;
  reasoning: string;
  expectedAPY: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  action: 'STAKE' | 'LEND' | 'LIQUIDITY' | 'YIELD_FARM' | 'STABLE';
}

export interface YieldForecast {
  weekly: number;
  monthly: number;
  yearly: number;
  confidence: number;
  marketCondition: 'BULL' | 'BEAR' | 'SIDEWAYS';
}

export interface PortfolioAnalysis {
  riskScore: number;
  recommendations: string[];
  rebalanceNeeded: boolean;
  reasoning: string;
  provider: string;
  allocationStrategy: AllocationDecision[];
  yieldPrediction: YieldForecast;
  timestamp: number;
}

export interface MarketData {
  ethPrice: number;
  gasPrice: number;
  aaveAPY: number;
  lidoAPY: number;
  uniswapVolume: number;
  volatilityIndex: number;
  timestamp: number;
}

export interface AgentStrategy {
  type: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
  riskTolerance: number;
  targetYield: number;
  maxDrawdown: number;
}

export class EnhancedAIPortfolioService {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta';
  private model: string;
  private providers: Map<number, ethers.JsonRpcProvider> = new Map();

  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY || '';
    this.model = process.env.GOOGLE_MODEL || 'gemini-1.5-flash';

    if (!this.apiKey) {
      console.warn('Google AI API key not found. Using fallback analysis.');
    }

    this.initializeProviders();
    console.log(`Enhanced AI Portfolio Service initialized`);
  }

  private initializeProviders() {
    const networks = [
      { chainId: 11155111, rpc: process.env.SEPOLIA_RPC_URL },
      { chainId: 43113, rpc: process.env.FUJI_RPC_URL }
    ];

    networks.forEach(network => {
      if (network.rpc) {
        this.providers.set(network.chainId, new ethers.JsonRpcProvider(network.rpc));
      }
    });
  }

  /**
   * Enhanced portfolio analysis with real DeFi integration
   */
  async analyzePortfolio(
    portfolioData: any,
    marketData: MarketData,
    strategy: AgentStrategy
  ): Promise<PortfolioAnalysis> {
    try {
      const geminiAnalysis = await this.getGeminiAnalysis(portfolioData, marketData, strategy);
      const allocationStrategy = this.generateAllocationStrategy(strategy, marketData);
      const yieldPrediction = this.predictYield(allocationStrategy, marketData);

      return {
        riskScore: this.calculateRiskScore(portfolioData, marketData, strategy),
        recommendations: geminiAnalysis.recommendations,
        rebalanceNeeded: geminiAnalysis.rebalanceNeeded,
        reasoning: geminiAnalysis.reasoning,
        provider: 'enhanced-ai-gemini',
        allocationStrategy,
        yieldPrediction,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('AI analysis failed, using fallback:', error);
      return this.getFallbackAnalysis(portfolioData, marketData, strategy);
    }
  }

  /**
   * Generate allocation strategy based on agent type and market conditions
   */
  private generateAllocationStrategy(
    strategy: AgentStrategy,
    marketData: MarketData
  ): AllocationDecision[] {
    const allocations: AllocationDecision[] = [];

    switch (strategy.type) {
      case 'CONSERVATIVE':
        allocations.push(
          {
            protocol: 'Lido',
            percentage: 60,
            reasoning: 'Safe ETH staking with 4-5% APY',
            expectedAPY: marketData.lidoAPY || 4.2,
            riskLevel: 'LOW',
            action: 'STAKE'
          },
          {
            protocol: 'Aave',
            percentage: 25,
            reasoning: 'Stable lending with guaranteed returns',
            expectedAPY: marketData.aaveAPY || 3.5,
            riskLevel: 'LOW',
            action: 'LEND'
          },
          {
            protocol: 'USDC Reserve',
            percentage: 15,
            reasoning: 'Stable reserve for market volatility',
            expectedAPY: 0,
            riskLevel: 'LOW',
            action: 'STABLE'
          }
        );
        break;

      case 'BALANCED':
        allocations.push(
          {
            protocol: 'Lido',
            percentage: 40,
            reasoning: 'Balanced ETH staking exposure',
            expectedAPY: marketData.lidoAPY || 4.2,
            riskLevel: 'LOW',
            action: 'STAKE'
          },
          {
            protocol: 'Aave',
            percentage: 25,
            reasoning: 'Lending for stable yield',
            expectedAPY: marketData.aaveAPY || 3.5,
            riskLevel: 'LOW',
            action: 'LEND'
          },
          {
            protocol: 'Uniswap V3',
            percentage: 25,
            reasoning: 'Liquidity provision for higher yield',
            expectedAPY: 8.5,
            riskLevel: 'MEDIUM',
            action: 'LIQUIDITY'
          },
          {
            protocol: 'USDC Reserve',
            percentage: 10,
            reasoning: 'Emergency reserve',
            expectedAPY: 0,
            riskLevel: 'LOW',
            action: 'STABLE'
          }
        );
        break;

      case 'AGGRESSIVE':
        allocations.push(
          {
            protocol: 'Yield Farming',
            percentage: 40,
            reasoning: 'High-yield farming strategies',
            expectedAPY: 15.0,
            riskLevel: 'HIGH',
            action: 'YIELD_FARM'
          },
          {
            protocol: 'Uniswap V3',
            percentage: 30,
            reasoning: 'Active liquidity management',
            expectedAPY: 12.0,
            riskLevel: 'MEDIUM',
            action: 'LIQUIDITY'
          },
          {
            protocol: 'Lido',
            percentage: 20,
            reasoning: 'Base staking exposure',
            expectedAPY: marketData.lidoAPY || 4.2,
            riskLevel: 'LOW',
            action: 'STAKE'
          },
          {
            protocol: 'Aave',
            percentage: 10,
            reasoning: 'Lending for stability',
            expectedAPY: marketData.aaveAPY || 3.5,
            riskLevel: 'LOW',
            action: 'LEND'
          }
        );
        break;
    }

    return allocations;
  }

  /**
   * Predict yield based on allocation strategy and market conditions
   */
  private predictYield(
    allocations: AllocationDecision[],
    marketData: MarketData
  ): YieldForecast {
    let weightedAPY = 0;
    for (const allocation of allocations) {
      weightedAPY += (allocation.percentage / 100) * allocation.expectedAPY;
    }

    // Adjust for market conditions
    let marketMultiplier = 1;
    if (marketData.volatilityIndex > 0.3) {
      marketMultiplier = 0.8; // Bear market
    } else if (marketData.volatilityIndex < 0.15) {
      marketMultiplier = 1.2; // Bull market
    }

    const adjustedAPY = weightedAPY * marketMultiplier;

    return {
      weekly: adjustedAPY / 52,
      monthly: adjustedAPY / 12,
      yearly: adjustedAPY,
      confidence: this.calculateConfidence(allocations, marketData),
      marketCondition: this.getMarketCondition(marketData)
    };
  }

  /**
   * Calculate portfolio risk score
   */
  private calculateRiskScore(
    portfolioData: any,
    marketData: MarketData,
    strategy: AgentStrategy
  ): number {
    let baseRisk = 0;

    switch (strategy.type) {
      case 'CONSERVATIVE':
        baseRisk = 25;
        break;
      case 'BALANCED':
        baseRisk = 50;
        break;
      case 'AGGRESSIVE':
        baseRisk = 75;
        break;
    }

    // Adjust for market volatility
    const volatilityAdjustment = marketData.volatilityIndex * 30;

    // Adjust for gas prices (higher gas = higher risk for smaller portfolios)
    const gasRisk = Math.min(marketData.gasPrice / 10, 10);

    const finalRisk = Math.min(100, Math.max(0, baseRisk + volatilityAdjustment + gasRisk));
    return Math.round(finalRisk);
  }

  /**
   * Get Gemini AI analysis
   */
  private async getGeminiAnalysis(
    portfolioData: any,
    marketData: MarketData,
    strategy: AgentStrategy
  ): Promise<{ recommendations: string[]; rebalanceNeeded: boolean; reasoning: string }> {
    if (!this.apiKey) {
      return this.getFallbackGeminiAnalysis(portfolioData, marketData, strategy);
    }

    try {
      const prompt = this.buildAnalysisPrompt(portfolioData, marketData, strategy);
      const response = await this.callGeminiAPI(prompt);
      return this.parseGeminiResponse(response);
    } catch (error) {
      console.error('Gemini API call failed:', error);
      return this.getFallbackGeminiAnalysis(portfolioData, marketData, strategy);
    }
  }

  /**
   * Build comprehensive analysis prompt for Gemini
   */
  private buildAnalysisPrompt(
    portfolioData: any,
    marketData: MarketData,
    strategy: AgentStrategy
  ): string {
    return `
You are a DeFi portfolio management AI. Analyze this portfolio and provide recommendations.

Portfolio Data:
- Strategy: ${strategy.type}
- Risk Tolerance: ${strategy.riskTolerance}%
- Current Value: ${portfolioData.totalValue || 0} USD
- Target Yield: ${strategy.targetYield}%

Market Conditions:
- ETH Price: $${marketData.ethPrice}
- Gas Price: ${marketData.gasPrice} gwei
- Aave APY: ${marketData.aaveAPY}%
- Lido APY: ${marketData.lidoAPY}%
- Market Volatility: ${marketData.volatilityIndex}

Provide analysis in this JSON format:
{
  "recommendations": ["rec1", "rec2", "rec3"],
  "rebalanceNeeded": boolean,
  "reasoning": "detailed explanation of your analysis",
  "marketOutlook": "bullish|bearish|neutral",
  "urgency": "low|medium|high"
}

Focus on:
1. Risk assessment based on current market conditions
2. Yield optimization opportunities
3. Protocol security considerations
4. Gas efficiency recommendations
5. Portfolio diversification analysis
`;
  }

  /**
   * Call Gemini API
   */
  private async callGeminiAPI(prompt: string): Promise<string> {
    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json() as any;
    return data.candidates[0].content.parts[0].text;
  }

  /**
   * Parse Gemini response
   */
  private parseGeminiResponse(content: string): {
    recommendations: string[];
    rebalanceNeeded: boolean;
    reasoning: string
  } {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          recommendations: parsed.recommendations || [],
          rebalanceNeeded: parsed.rebalanceNeeded || false,
          reasoning: parsed.reasoning || content
        };
      }
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
    }

    // Fallback text parsing
    return {
      recommendations: this.extractRecommendationsFromText(content),
      rebalanceNeeded: /rebalanc/i.test(content),
      reasoning: content
    };
  }

  /**
   * Extract recommendations from text
   */
  private extractRecommendationsFromText(content: string): string[] {
    const recommendations: string[] = [];
    const lines = content.split('\n');

    for (const line of lines) {
      if (line.match(/^[-*•]\s+/) || line.match(/^\d+\.\s+/)) {
        recommendations.push(line.replace(/^[-*•\d.\s]+/, '').trim());
      }
    }

    return recommendations.length > 0 ? recommendations : [
      'Monitor market conditions for rebalancing opportunities',
      'Consider gas optimization during low network activity',
      'Diversify across multiple DeFi protocols for risk reduction'
    ];
  }

  /**
   * Fallback analysis when Gemini is unavailable
   */
  private getFallbackAnalysis(
    portfolioData: any,
    marketData: MarketData,
    strategy: AgentStrategy
  ): PortfolioAnalysis {
    const allocationStrategy = this.generateAllocationStrategy(strategy, marketData);
    const yieldPrediction = this.predictYield(allocationStrategy, marketData);

    return {
      riskScore: this.calculateRiskScore(portfolioData, marketData, strategy),
      recommendations: [
        'Portfolio optimized for ' + strategy.type.toLowerCase() + ' strategy',
        'Current market conditions suggest ' + this.getMarketCondition(marketData).toLowerCase() + ' outlook',
        'Consider rebalancing if market volatility exceeds 30%',
        'Monitor gas prices for optimal transaction timing'
      ],
      rebalanceNeeded: marketData.volatilityIndex > 0.25,
      reasoning: `Fallback analysis: ${strategy.type} strategy with ${this.calculateRiskScore(portfolioData, marketData, strategy)}% risk score`,
      provider: 'fallback-analysis',
      allocationStrategy,
      yieldPrediction,
      timestamp: Date.now()
    };
  }

  /**
   * Fallback Gemini analysis
   */
  private getFallbackGeminiAnalysis(
    portfolioData: any,
    marketData: MarketData,
    strategy: AgentStrategy
  ): { recommendations: string[]; rebalanceNeeded: boolean; reasoning: string } {
    const recommendations = [
      `Optimize ${strategy.type.toLowerCase()} strategy allocation`,
      'Monitor protocol yields for rebalancing opportunities',
      'Consider market volatility in position sizing'
    ];

    if (marketData.gasPrice > 50) {
      recommendations.push('High gas prices detected - batch transactions for efficiency');
    }

    if (marketData.volatilityIndex > 0.3) {
      recommendations.push('High volatility - consider increasing stable reserves');
    }

    return {
      recommendations,
      rebalanceNeeded: marketData.volatilityIndex > 0.25,
      reasoning: `Market analysis: ETH at $${marketData.ethPrice}, volatility at ${(marketData.volatilityIndex * 100).toFixed(1)}%`
    };
  }

  /**
   * Helper methods
   */
  private calculateConfidence(allocations: AllocationDecision[], marketData: MarketData): number {
    let confidence = 85; // Base confidence

    // Reduce confidence for high volatility
    if (marketData.volatilityIndex > 0.3) {
      confidence -= 15;
    }

    // Reduce confidence for high-risk allocations
    const highRiskPercentage = allocations
      .filter(a => a.riskLevel === 'HIGH')
      .reduce((sum, a) => sum + a.percentage, 0);

    confidence -= highRiskPercentage * 0.2;

    return Math.max(60, Math.min(95, confidence));
  }

  private getMarketCondition(marketData: MarketData): 'BULL' | 'BEAR' | 'SIDEWAYS' {
    if (marketData.volatilityIndex > 0.3) {
      return 'BEAR';
    } else if (marketData.volatilityIndex < 0.15 && marketData.uniswapVolume > 1000000) {
      return 'BULL';
    }
    return 'SIDEWAYS';
  }

  /**
   * Generate real-time market analysis
   */
  async generateRealTimeAllocation(
    agentId: number,
    depositAmount: number,
    strategy: AgentStrategy,
    chainId: number = 11155111
  ): Promise<AllocationDecision[]> {
    try {
      const marketData = await this.fetchRealTimeMarketData();
      const analysis = await this.analyzePortfolio({ totalValue: depositAmount }, marketData, strategy);

      console.log(`🤖 AI Analysis for Agent ${agentId}:`);
      console.log(`   Risk Score: ${analysis.riskScore}/100`);
      console.log(`   Expected Yearly Yield: ${analysis.yieldPrediction.yearly.toFixed(2)}%`);
      console.log(`   Recommendations: ${analysis.recommendations.length} items`);

      return analysis.allocationStrategy;
    } catch (error) {
      console.error('Real-time allocation failed:', error);
      return this.generateAllocationStrategy(strategy, {
        ethPrice: 2500,
        gasPrice: 30,
        aaveAPY: 3.5,
        lidoAPY: 4.2,
        uniswapVolume: 1000000,
        volatilityIndex: 0.2,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Fetch real-time market data
   */
  private async fetchRealTimeMarketData(): Promise<MarketData> {
    // In production, integrate with real APIs
    return {
      ethPrice: 2500 + (Math.random() - 0.5) * 200, // Simulate price movement
      gasPrice: 20 + Math.random() * 40,
      aaveAPY: 3.2 + Math.random() * 1.5,
      lidoAPY: 4.0 + Math.random() * 0.8,
      uniswapVolume: 800000 + Math.random() * 400000,
      volatilityIndex: 0.15 + Math.random() * 0.2,
      timestamp: Date.now()
    };
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.apiKey) {
      console.log('No Gemini API key - using fallback mode');
      return false;
    }

    try {
      const response = await this.callGeminiAPI('Test connection. Respond with "AI service working"');
      return response.toLowerCase().includes('working');
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }

  /**
   * Get service status
   */
  getStatus(): any {
    return {
      provider: 'enhanced-ai-gemini',
      model: this.model,
      hasApiKey: !!this.apiKey,
      providersCount: this.providers.size,
      isConfigured: !!this.apiKey,
      capabilities: [
        'Portfolio Analysis',
        'Risk Assessment',
        'Yield Prediction',
        'Allocation Strategy',
        'Market Analysis'
      ]
    };
  }
}

// Export singleton instance
export const enhancedAIService = new EnhancedAIPortfolioService();

// Export factory function
export function createEnhancedAIService(): EnhancedAIPortfolioService {
  return new EnhancedAIPortfolioService();
}
