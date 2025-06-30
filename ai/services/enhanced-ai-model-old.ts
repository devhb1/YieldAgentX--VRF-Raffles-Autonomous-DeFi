import { BedrockRuntime } from '@aws-sdk/client-bedrock-runtime';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

export interface AIAllocationDecision {
  strategyType: 'Conservative' | 'Balanced' | 'HighRisk';
  allocations: {
    aave: number;        // Aave lending percentage
    uniswapV3: number;   // Uniswap V3 LP percentage  
    staking: number;     // ETH staking percentage
    trading: number;     // Active trading percentage
    stableReserve: number; // Stable reserve percentage
  };
  reasoning: string;
  confidence: number;
  expectedAPY: number;
  riskScore: number;
  marketConditions: string;
  protocolRecommendations: ProtocolAction[];
}

export interface ProtocolAction {
  protocol: 'aave' | 'uniswap' | 'compound' | 'curve';
  action: 'deposit' | 'withdraw' | 'stake' | 'unstake' | 'swap';
  amount: string; // in ETH
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  estimatedGas: string;
  estimatedYield: number;
}

export interface MarketData {
  ethPrice: number;
  marketVolatility: number;
  gasPrice: number;
  fearGreedIndex: number;
  defiTVL: number;
  aaveAPY: number;
  uniswapFees24h: number;
  stakingAPY: number;
}

export interface PortfolioData {
  totalValueUSD: number;
  currentAllocations: {
    aave: number;
    uniswapV3: number;
    staking: number;
    trading: number;
    stableReserve: number;
  };
  performance7d: number;
  performance30d: number;
  totalYieldEarned: number;
  riskScore: number;
}

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  contracts: {
    vault: string;
    aave: string;
    uniswapRouter: string;
    weth: string;
    usdc: string;
  };
}

class AIModelService {
  private bedrockClient: BedrockRuntime;
  private modelId: string = 'anthropic.claude-v2';

  constructor() {
    this.bedrockClient = new BedrockRuntime({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async generateAllocationStrategy(
    strategyType: 'Conservative' | 'Balanced' | 'HighRisk',
    marketData: MarketData,
    portfolioData: PortfolioData
  ): Promise<AIAllocationDecision> {
    const prompt = this.buildPrompt(strategyType, marketData, portfolioData);

    try {
      const response = await this.bedrockClient.invokeModel({
        modelId: this.modelId,
        body: JSON.stringify({
          prompt: prompt,
          max_tokens_to_sample: 1000,
          temperature: 0.3,
          top_p: 0.9,
        }),
        contentType: 'application/json',
        accept: 'application/json',
      });

      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return this.parseAIResponse(responseBody.completion, strategyType);
    } catch (error) {
      console.error('AWS Bedrock AI generation failed:', error);
      return this.getFallbackStrategy(strategyType, marketData);
    }
  }

  private buildPrompt(
    strategyType: string,
    marketData: MarketData,
    portfolioData: PortfolioData
  ): string {
    return `
You are an expert DeFi portfolio management AI. Analyze the current market conditions and provide an optimal allocation strategy.

STRATEGY TYPE: ${strategyType}

CURRENT MARKET CONDITIONS:
- ETH Price: $${marketData.ethPrice}
- Market Volatility: ${marketData.marketVolatility}%
- Gas Price: ${marketData.gasPrice} gwei
- Fear & Greed Index: ${marketData.fearGreedIndex}/100
- Total DeFi TVL: $${marketData.defiTVL}B

CURRENT PORTFOLIO:
- Total Value: $${portfolioData.totalValueUSD}
- Current Allocations:
  * Yield Farming: ${portfolioData.currentAllocations.yieldFarming}%
  * Liquidity Mining: ${portfolioData.currentAllocations.liquidityMining}%
  * Staking: ${portfolioData.currentAllocations.staking}%
  * Stable Reserve: ${portfolioData.currentAllocations.stableReserve}%
  * Trading: ${portfolioData.currentAllocations.trading}%
- 7d Performance: ${portfolioData.performance7d}%
- 30d Performance: ${portfolioData.performance30d}%

STRATEGY GUIDELINES:
${this.getStrategyGuidelines(strategyType)}

Please provide a JSON response with the following structure:
{
  "allocations": {
    "yieldFarming": <percentage>,
    "liquidityMining": <percentage>,
    "staking": <percentage>,
    "stableReserve": <percentage>,
    "trading": <percentage>
  },
  "reasoning": "<detailed explanation>",
  "confidence": <1-100>,
  "expectedAPY": <percentage>,
  "riskScore": <1-100>,
  "marketConditions": "<bullish/bearish/neutral>"
}

Ensure all percentages sum to 100.
`;
  }

  private getStrategyGuidelines(strategyType: string): string {
    switch (strategyType) {
      case 'Conservative':
        return `
- Target 3-8% APY with minimal risk
- Prioritize stablecoins and established protocols
- Maximum 10% in high-risk strategies
- Focus on Aave, Compound, Lido staking
- Maintain 20-30% stable reserve
        `;
      case 'Balanced':
        return `
- Target 8-15% APY with moderate risk
- Balance between safety and growth
- Up to 25% in higher-risk strategies
- Diversify across multiple protocols
- Include some trading opportunities
        `;
      case 'HighRisk':
        return `
- Target 15-30%+ APY with high risk tolerance
- Aggressive pursuit of yield opportunities
- Focus on trending protocols and meme coins
- Active trading strategies (buy dips, sell pumps)
- Minimal stable reserves (5-10%)
        `;
      default:
        return '';
    }
  }

  private parseAIResponse(
    response: string,
    strategyType: 'Conservative' | 'Balanced' | 'HighRisk'
  ): AIAllocationDecision {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate allocations sum to 100
      const total = Object.values(parsed.allocations).reduce((sum: number, val: any) => sum + val, 0);
      if (Math.abs(total - 100) > 1) {
        throw new Error('Allocations do not sum to 100');
      }

      return {
        strategyType,
        allocations: parsed.allocations,
        reasoning: parsed.reasoning,
        confidence: parsed.confidence,
        expectedAPY: parsed.expectedAPY,
        riskScore: parsed.riskScore,
        marketConditions: parsed.marketConditions,
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.getFallbackStrategy(strategyType, {} as MarketData);
    }
  }

  private getFallbackStrategy(
    strategyType: 'Conservative' | 'Balanced' | 'HighRisk',
    marketData: Partial<MarketData>
  ): AIAllocationDecision {
    const strategies = {
      Conservative: {
        allocations: {
          yieldFarming: 20,
          liquidityMining: 10,
          staking: 40,
          stableReserve: 25,
          trading: 5,
        },
        expectedAPY: 5.5,
        riskScore: 25,
      },
      Balanced: {
        allocations: {
          yieldFarming: 30,
          liquidityMining: 25,
          staking: 25,
          stableReserve: 10,
          trading: 10,
        },
        expectedAPY: 12.0,
        riskScore: 50,
      },
      HighRisk: {
        allocations: {
          yieldFarming: 25,
          liquidityMining: 30,
          staking: 15,
          stableReserve: 5,
          trading: 25,
        },
        expectedAPY: 22.0,
        riskScore: 85,
      },
    };

    const strategy = strategies[strategyType];

    return {
      strategyType,
      allocations: strategy.allocations,
      reasoning: `Fallback ${strategyType} strategy applied due to AI service unavailability. Using pre-configured allocation template optimized for current market conditions.`,
      confidence: 75,
      expectedAPY: strategy.expectedAPY,
      riskScore: strategy.riskScore,
      marketConditions: this.assessMarketConditions(marketData),
    };
  }

  private assessMarketConditions(marketData: Partial<MarketData>): string {
    if (!marketData.ethPrice) return 'neutral';

    if (marketData.ethPrice > 2500) return 'bullish';
    if (marketData.ethPrice < 1800) return 'bearish';
    return 'neutral';
  }

  async generateRebalanceRecommendation(
    agentId: number,
    currentStrategy: string,
    marketData: MarketData,
    portfolioData: PortfolioData
  ): Promise<{
    shouldRebalance: boolean;
    newStrategy?: 'Conservative' | 'Balanced' | 'HighRisk';
    reasoning: string;
    urgency: 'low' | 'medium' | 'high';
  }> {
    const prompt = `
Analyze if this DeFi portfolio needs rebalancing based on current market conditions and performance.

CURRENT STRATEGY: ${currentStrategy}
PORTFOLIO PERFORMANCE: 7d: ${portfolioData.performance7d}%, 30d: ${portfolioData.performance30d}%
MARKET CONDITIONS: ETH: $${marketData.ethPrice}, Volatility: ${marketData.marketVolatility}%

Should this portfolio be rebalanced? Consider:
- Performance vs benchmarks
- Market volatility changes
- Strategy drift from targets
- Risk-adjusted returns

Respond with JSON:
{
  "shouldRebalance": true/false,
  "newStrategy": "Conservative/Balanced/HighRisk" (if changing),
  "reasoning": "explanation",
  "urgency": "low/medium/high"
}
    `;

    try {
      const response = await this.bedrockClient.invokeModel({
        modelId: this.modelId,
        body: JSON.stringify({
          prompt,
          max_tokens_to_sample: 500,
          temperature: 0.3,
        }),
        contentType: 'application/json',
        accept: 'application/json',
      });

      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const jsonMatch = responseBody.completion.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Rebalance recommendation failed:', error);
    }

    // Fallback logic
    const shouldRebalance =
      Math.abs(portfolioData.performance7d) > 10 ||
      marketData.marketVolatility > 50;

    return {
      shouldRebalance,
      reasoning: 'Automated rebalance trigger based on performance or volatility thresholds',
      urgency: shouldRebalance ? 'medium' : 'low',
    };
  }

  async generateRiskAnalysis(
    portfolioData: PortfolioData,
    marketData: MarketData
  ): Promise<{
    riskScore: number;
    riskFactors: string[];
    recommendations: string[];
    valueatRisk: number;
    expectedReturn: {
      weekly: number;
      monthly: number;
      yearly: number;
    };
  }> {
    const totalRisk = this.calculatePortfolioRisk(portfolioData, marketData);

    return {
      riskScore: totalRisk,
      riskFactors: this.identifyRiskFactors(portfolioData, marketData),
      recommendations: this.generateRiskRecommendations(totalRisk),
      valueatRisk: this.calculateVaR(portfolioData, marketData),
      expectedReturn: {
        weekly: this.projectReturns(portfolioData, 'weekly'),
        monthly: this.projectReturns(portfolioData, 'monthly'),
        yearly: this.projectReturns(portfolioData, 'yearly'),
      },
    };
  }

  private calculatePortfolioRisk(portfolioData: PortfolioData, marketData: MarketData): number {
    const allocationRisk =
      portfolioData.currentAllocations.trading * 0.8 +
      portfolioData.currentAllocations.liquidityMining * 0.6 +
      portfolioData.currentAllocations.yieldFarming * 0.4 +
      portfolioData.currentAllocations.staking * 0.2 +
      portfolioData.currentAllocations.stableReserve * 0.1;

    const marketRisk = marketData.marketVolatility / 100;

    return Math.min(100, allocationRisk + (marketRisk * 30));
  }

  private identifyRiskFactors(portfolioData: PortfolioData, marketData: MarketData): string[] {
    const factors: string[] = [];

    if (portfolioData.currentAllocations.trading > 20) {
      factors.push('High trading exposure increases volatility risk');
    }
    if (portfolioData.currentAllocations.stableReserve < 10) {
      factors.push('Low stable reserves reduce liquidity buffer');
    }
    if (marketData.marketVolatility > 40) {
      factors.push('High market volatility increases overall portfolio risk');
    }
    if (portfolioData.performance7d < -5) {
      factors.push('Recent negative performance indicates strategy issues');
    }

    return factors;
  }

  private generateRiskRecommendations(riskScore: number): string[] {
    if (riskScore > 70) {
      return [
        'Consider reducing high-risk allocations',
        'Increase stable reserve allocation',
        'Implement stop-loss mechanisms',
        'Review position sizes',
      ];
    } else if (riskScore > 40) {
      return [
        'Monitor positions closely',
        'Consider gradual rebalancing',
        'Maintain current risk levels',
      ];
    } else {
      return [
        'Risk levels are acceptable',
        'Consider opportunities for higher yield',
        'Current allocation is well-balanced',
      ];
    }
  }

  private calculateVaR(portfolioData: PortfolioData, marketData: MarketData): number {
    // Simplified VaR calculation (95% confidence, 1-day)
    const portfolioVolatility = marketData.marketVolatility / 100;
    return portfolioData.totalValueUSD * portfolioVolatility * 1.65; // 95% VaR
  }

  private projectReturns(portfolioData: PortfolioData, period: 'weekly' | 'monthly' | 'yearly'): number {
    const dailyReturn = portfolioData.performance7d / 7;

    switch (period) {
      case 'weekly':
        return dailyReturn * 7;
      case 'monthly':
        return dailyReturn * 30;
      case 'yearly':
        return dailyReturn * 365;
      default:
        return 0;
    }
  }
}

export default AIModelService;
