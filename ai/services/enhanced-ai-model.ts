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
  private providers: Map<number, ethers.JsonRpcProvider> = new Map();

  constructor() {
    this.bedrockClient = new BedrockRuntime({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize providers for different chains
    const chains = [
      { chainId: 11155111, rpc: process.env.SEPOLIA_RPC_URL },
      { chainId: 43113, rpc: process.env.FUJI_RPC_URL },
      { chainId: 80001, rpc: process.env.MUMBAI_RPC_URL }
    ];

    chains.forEach(chain => {
      if (chain.rpc) {
        this.providers.set(chain.chainId, new ethers.JsonRpcProvider(chain.rpc));
      }
    });
  }

  async generateAllocationStrategy(
    strategyType: 'Conservative' | 'Balanced' | 'HighRisk',
    marketData: MarketData,
    portfolioData: PortfolioData,
    chainId: number = 11155111
  ): Promise<AIAllocationDecision> {
    const prompt = this.buildPrompt(strategyType, marketData, portfolioData);

    try {
      const response = await this.bedrockClient.invokeModel({
        modelId: this.modelId,
        body: JSON.stringify({
          prompt: prompt,
          max_tokens_to_sample: 1500,
          temperature: 0.3,
          top_p: 0.9,
        }),
        contentType: 'application/json',
        accept: 'application/json',
      });

      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return this.parseAIResponse(responseBody.completion, strategyType, marketData);
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
- Aave APY: ${marketData.aaveAPY}%
- Uniswap 24h Fees: $${marketData.uniswapFees24h}M
- ETH Staking APY: ${marketData.stakingAPY}%

CURRENT PORTFOLIO:
- Total Value: $${portfolioData.totalValueUSD}
- Current Allocations:
  * Aave Lending: ${portfolioData.currentAllocations.aave}%
  * Uniswap V3 LP: ${portfolioData.currentAllocations.uniswapV3}%
  * ETH Staking: ${portfolioData.currentAllocations.staking}%
  * Active Trading: ${portfolioData.currentAllocations.trading}%
  * Stable Reserve: ${portfolioData.currentAllocations.stableReserve}%
- 7d Performance: ${portfolioData.performance7d}%
- 30d Performance: ${portfolioData.performance30d}%
- Total Yield: $${portfolioData.totalYieldEarned}
- Risk Score: ${portfolioData.riskScore}/100

STRATEGY GUIDELINES:
${this.getStrategyGuidelines(strategyType)}

Please provide a JSON response with the following structure:
{
  "allocations": {
    "aave": <percentage>,
    "uniswapV3": <percentage>,
    "staking": <percentage>,
    "trading": <percentage>,
    "stableReserve": <percentage>
  },
  "reasoning": "<detailed explanation>",
  "confidence": <0-100>,
  "expectedAPY": <percentage>,
  "riskScore": <0-100>,
  "marketConditions": "<brief market assessment>"
}

The allocations must sum to 100%. Focus on real DeFi protocols and provide actionable recommendations.
`;
  }

  private getStrategyGuidelines(strategyType: string): string {
    switch (strategyType) {
      case 'Conservative':
        return `
- Prioritize capital preservation and stable yields
- Maximum 60% in Aave lending for safe returns
- Limited exposure to impermanent loss (max 20% Uniswap)
- Significant ETH staking allocation (15-25%)
- No active trading
- Maintain 5-10% stable reserve
- Target APY: 3-6%
- Risk Score: < 30`;

      case 'Balanced':
        return `
- Balance risk and reward
- Moderate Aave allocation (30-50%)
- Higher Uniswap LP exposure (25-40%)
- Balanced ETH staking (15-25%)
- Limited trading opportunities (5-10%)
- Maintain reasonable reserve (5%)
- Target APY: 6-12%
- Risk Score: 30-60`;

      case 'HighRisk':
        return `
- Maximize yield potential
- Lower Aave allocation (15-30%)
- High Uniswap LP exposure (35-50%)
- Moderate ETH staking (10-20%)
- Active trading strategies (15-25%)
- Minimal reserve (5%)
- Target APY: 12-25%
- Risk Score: 60-90`;

      default:
        return 'Use balanced approach with moderate risk exposure.';
    }
  }

  private parseAIResponse(
    completion: string,
    strategyType: 'Conservative' | 'Balanced' | 'HighRisk',
    marketData: MarketData
  ): AIAllocationDecision {
    try {
      // Extract JSON from completion
      const jsonMatch = completion.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // Validate and normalize allocations
        const allocations = this.normalizeAllocations(parsed.allocations);

        return {
          strategyType,
          allocations,
          reasoning: parsed.reasoning || 'AI-generated allocation strategy',
          confidence: Math.min(Math.max(parsed.confidence || 75, 0), 100),
          expectedAPY: parsed.expectedAPY || this.estimateAPY(allocations, marketData),
          riskScore: parsed.riskScore || this.calculateRiskScore(allocations),
          marketConditions: parsed.marketConditions || 'Market analysis unavailable',
          protocolRecommendations: this.generateProtocolActions(allocations, strategyType)
        };
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }

    return this.getFallbackStrategy(strategyType, marketData);
  }

  private normalizeAllocations(allocations: any): {
    aave: number;
    uniswapV3: number;
    staking: number;
    trading: number;
    stableReserve: number;
  } {
    const total = (allocations.aave || 0) +
                  (allocations.uniswapV3 || 0) +
                  (allocations.staking || 0) +
                  (allocations.trading || 0) +
                  (allocations.stableReserve || 0);

    if (total === 0) {
      // Return default balanced allocation
      return { aave: 40, uniswapV3: 30, staking: 20, trading: 5, stableReserve: 5 };
    }

    // Normalize to 100%
    return {
      aave: Math.round((allocations.aave || 0) * 100 / total),
      uniswapV3: Math.round((allocations.uniswapV3 || 0) * 100 / total),
      staking: Math.round((allocations.staking || 0) * 100 / total),
      trading: Math.round((allocations.trading || 0) * 100 / total),
      stableReserve: Math.round((allocations.stableReserve || 0) * 100 / total)
    };
  }

  private getFallbackStrategy(
    strategyType: 'Conservative' | 'Balanced' | 'HighRisk',
    marketData: MarketData
  ): AIAllocationDecision {
    const strategies = {
      Conservative: {
        allocations: { aave: 60, uniswapV3: 20, staking: 15, trading: 0, stableReserve: 5 },
        expectedAPY: 4.5,
        riskScore: 25
      },
      Balanced: {
        allocations: { aave: 40, uniswapV3: 30, staking: 20, trading: 5, stableReserve: 5 },
        expectedAPY: 8.2,
        riskScore: 45
      },
      HighRisk: {
        allocations: { aave: 20, uniswapV3: 40, staking: 15, trading: 20, stableReserve: 5 },
        expectedAPY: 15.7,
        riskScore: 75
      }
    };

    const strategy = strategies[strategyType];

    return {
      strategyType,
      allocations: strategy.allocations,
      reasoning: `Fallback ${strategyType} strategy due to AI service unavailability. Based on current market conditions with ETH at $${marketData.ethPrice}.`,
      confidence: 65,
      expectedAPY: strategy.expectedAPY,
      riskScore: strategy.riskScore,
      marketConditions: `ETH: $${marketData.ethPrice}, Volatility: ${marketData.marketVolatility}%, Gas: ${marketData.gasPrice} gwei`,
      protocolRecommendations: this.generateProtocolActions(strategy.allocations, strategyType)
    };
  }

  private generateProtocolActions(
    allocations: { aave: number; uniswapV3: number; staking: number; trading: number; stableReserve: number },
    strategyType: string
  ): ProtocolAction[] {
    const actions: ProtocolAction[] = [];

    if (allocations.aave > 0) {
      actions.push({
        protocol: 'aave',
        action: 'deposit',
        amount: (allocations.aave / 100).toFixed(2),
        reasoning: `Allocate ${allocations.aave}% to Aave for stable lending yield`,
        priority: 'high',
        estimatedGas: '150000',
        estimatedYield: 3.5
      });
    }

    if (allocations.uniswapV3 > 0) {
      actions.push({
        protocol: 'uniswap',
        action: 'deposit',
        amount: (allocations.uniswapV3 / 100).toFixed(2),
        reasoning: `Provide ${allocations.uniswapV3}% liquidity to Uniswap V3 pools`,
        priority: 'medium',
        estimatedGas: '250000',
        estimatedYield: 8.0
      });
    }

    if (allocations.trading > 0) {
      actions.push({
        protocol: 'uniswap',
        action: 'swap',
        amount: (allocations.trading / 100).toFixed(2),
        reasoning: `Use ${allocations.trading}% for active trading strategies`,
        priority: 'low',
        estimatedGas: '180000',
        estimatedYield: 12.0
      });
    }

    return actions;
  }

  private estimateAPY(
    allocations: { aave: number; uniswapV3: number; staking: number; trading: number; stableReserve: number },
    marketData: MarketData
  ): number {
    return (
      (allocations.aave / 100) * marketData.aaveAPY +
      (allocations.uniswapV3 / 100) * 8.0 + // Estimated Uniswap APY
      (allocations.staking / 100) * marketData.stakingAPY +
      (allocations.trading / 100) * 15.0 + // Estimated trading APY
      (allocations.stableReserve / 100) * 1.0 // Stable reserve minimal yield
    );
  }

  private calculateRiskScore(allocations: {
    aave: number;
    uniswapV3: number;
    staking: number;
    trading: number;
    stableReserve: number;
  }): number {
    return Math.round(
      allocations.aave * 0.2 +         // Aave is low risk
      allocations.uniswapV3 * 0.6 +    // Uniswap has impermanent loss risk
      allocations.staking * 0.3 +      // Staking has moderate risk
      allocations.trading * 0.9 +      // Trading is high risk
      allocations.stableReserve * 0.1  // Stable reserve is very low risk
    );
  }

  // Real-time market data integration
  async getMarketData(chainId: number = 11155111): Promise<MarketData> {
    try {
      const provider = this.providers.get(chainId);
      if (!provider) {
        throw new Error(`No provider for chain ${chainId}`);
      }

      // For demo purposes, using mock data
      // In production, integrate with real APIs like CoinGecko, DeFiPulse, etc.
      return {
        ethPrice: 3200,
        marketVolatility: 25.4,
        gasPrice: 45,
        fearGreedIndex: 62,
        defiTVL: 85.7,
        aaveAPY: 3.2,
        uniswapFees24h: 12.5,
        stakingAPY: 4.1
      };
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      // Return fallback data
      return {
        ethPrice: 3200,
        marketVolatility: 20,
        gasPrice: 30,
        fearGreedIndex: 50,
        defiTVL: 80,
        aaveAPY: 3.5,
        uniswapFees24h: 10,
        stakingAPY: 4.0
      };
    }
  }

  // Multi-chain support
  async executeAllocation(
    decision: AIAllocationDecision,
    agentId: number,
    chainId: number = 11155111
  ): Promise<boolean> {
    try {
      const provider = this.providers.get(chainId);
      if (!provider) {
        throw new Error(`No provider for chain ${chainId}`);
      }

      // In a real implementation, this would interact with the smart contract
      console.log(`Executing allocation for agent ${agentId} on chain ${chainId}:`, decision);

      // Log protocol actions
      decision.protocolRecommendations.forEach(action => {
        console.log(`- ${action.protocol}: ${action.action} ${action.amount} ETH (${action.reasoning})`);
      });

      return true;
    } catch (error) {
      console.error('Failed to execute allocation:', error);
      return false;
    }
  }

  // Risk assessment
  async assessPortfolioRisk(portfolioData: PortfolioData): Promise<{
    riskLevel: 'Low' | 'Medium' | 'High';
    recommendations: string[];
    shouldRebalance: boolean;
  }> {
    const riskScore = this.calculateRiskScore(portfolioData.currentAllocations);

    let riskLevel: 'Low' | 'Medium' | 'High';
    if (riskScore < 30) riskLevel = 'Low';
    else if (riskScore < 60) riskLevel = 'Medium';
    else riskLevel = 'High';

    const recommendations: string[] = [];

    if (portfolioData.performance7d < -10) {
      recommendations.push('Consider reducing high-risk allocations due to recent losses');
    }

    if (portfolioData.currentAllocations.trading > 30) {
      recommendations.push('Trading allocation is very high - consider reducing for stability');
    }

    if (portfolioData.currentAllocations.stableReserve < 5) {
      recommendations.push('Increase stable reserve for emergency liquidity');
    }

    const shouldRebalance = portfolioData.performance7d < -15 ||
                           riskScore > 80 ||
                           recommendations.length > 2;

    return {
      riskLevel,
      recommendations,
      shouldRebalance
    };
  }
}

export default AIModelService;

// Export singleton instance
export const aiModelService = new AIModelService();
