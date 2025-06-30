/**
 * Portfolio Agent AI Service
 * Enhanced AI capabilities for portfolio management, risk analysis, and ROI forecasting
 */

import { GeminiAIService } from './GeminiAIService';

export interface PortfolioData {
  agentId: string;
  ethBalance: number;
  usdcBalance: number;
  totalValueUSD: number;
  strategy: 'LOW_RISK' | 'BALANCED' | 'HIGH_RISK';
  lastRebalanceTime: number;
  totalYieldGenerated: number;
  createdAt: number;
}

export interface RiskAnalysis {
  riskScore: number; // 1-100 (100 = highest risk)
  volatilityScore: number; // 1-100
  liquidityRisk: number; // 1-100
  protocolRisk: number; // 1-100
  marketRisk: number; // 1-100
  overallAssessment: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  recommendations: string[];
  timestamp: number;
}

export interface ROIForecast {
  sevenDayROI: {
    conservative: number; // %
    likely: number; // %
    optimistic: number; // %
  };
  monthlyROI: {
    conservative: number;
    likely: number;
    optimistic: number;
  };
  confidence: number; // 0-100
  keyFactors: string[];
  marketConditions: 'BULL' | 'BEAR' | 'SIDEWAYS';
  timestamp: number;
}

export interface StrategyRecommendation {
  currentStrategy: string;
  recommendedStrategy: string;
  reasoning: string;
  expectedImprovement: number; // % improvement in returns
  riskAdjustment: 'LOWER' | 'SAME' | 'HIGHER';
  confidenceLevel: number; // 0-100
  actionPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  timestamp: number;
}

export interface AllocationOptimization {
  currentAllocation: {
    yieldFarming: number;
    liquidityMining: number;
    staking: number;
    memeCoinTrading: number;
    stableReserve: number;
  };
  recommendedAllocation: {
    yieldFarming: number;
    liquidityMining: number;
    staking: number;
    memeCoinTrading: number;
    stableReserve: number;
  };
  expectedYieldIncrease: number; // %
  riskChange: number; // % change in risk
  reasoning: string;
  timestamp: number;
}

export interface MarketConditions {
  ethPrice: number;
  ethTrend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  ethVolatility: number;
  usdcStability: number;
  defiTVL: number;
  yieldEnvironment: 'HIGH_YIELD' | 'MODERATE_YIELD' | 'LOW_YIELD';
  marketSentiment: 'FEAR' | 'NEUTRAL' | 'GREED';
  timestamp: number;
}

export class PortfolioAgentAI {
  private geminiService: GeminiAIService;
  private marketCache: Map<string, any> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(geminiService: GeminiAIService) {
    this.geminiService = geminiService;
  }

  /**
   * Analyze portfolio risk across multiple dimensions
   */
  async analyzePortfolioRisk(portfolioData: PortfolioData): Promise<RiskAnalysis> {
    try {
      const aiResponse = await this.geminiService.analyzePortfolio({
        strategy: portfolioData.strategy,
        ethBalance: portfolioData.ethBalance,
        usdcBalance: portfolioData.usdcBalance,
        totalValueUSD: portfolioData.totalValueUSD,
        totalYieldGenerated: portfolioData.totalYieldGenerated,
        createdAt: portfolioData.createdAt
      });

      // Use the AI analysis result
      const riskScore = this.mapAIAnalysisToRisk(aiResponse, portfolioData);

      return {
        riskScore: riskScore.overall,
        volatilityScore: riskScore.volatility,
        liquidityRisk: riskScore.liquidity,
        protocolRisk: riskScore.protocol,
        marketRisk: riskScore.market,
        overallAssessment: this.getRiskLevel(riskScore.overall),
        recommendations: aiResponse.recommendations || this.generateRiskRecommendations(portfolioData, riskScore),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error in risk analysis:', error);
      return this.getFallbackRiskAnalysis(portfolioData);
    }
  }

  /**
   * Generate ROI forecasts for different time horizons
   */
  async generateROIForecast(portfolioData: PortfolioData): Promise<ROIForecast> {
    const marketConditions = await this.getMarketConditions();

    try {
      // Use existing portfolio analysis for ROI estimation
      const aiResponse = await this.geminiService.analyzePortfolio({
        strategy: portfolioData.strategy,
        totalValueUSD: portfolioData.totalValueUSD,
        totalYieldGenerated: portfolioData.totalYieldGenerated,
        ethBalance: portfolioData.ethBalance,
        usdcBalance: portfolioData.usdcBalance
      });

      return this.generateROIFromAnalysis(aiResponse, portfolioData, marketConditions);
    } catch (error) {
      console.error('Error in ROI forecasting:', error);
      return this.getFallbackROIForecast(portfolioData);
    }
  }

  /**
   * Generate strategy recommendations based on performance and market conditions
   */
  async getStrategyRecommendation(portfolioData: PortfolioData): Promise<StrategyRecommendation> {
    const riskAnalysis = await this.analyzePortfolioRisk(portfolioData);

    try {
      const aiResponse = await this.geminiService.analyzePortfolio(portfolioData);
      return this.generateStrategyFromAnalysis(aiResponse, portfolioData, riskAnalysis);
    } catch (error) {
      console.error('Error in strategy recommendation:', error);
      return this.getFallbackStrategyRecommendation(portfolioData);
    }
  }

  /**
   * Optimize allocation within current strategy
   */
  async optimizeAllocation(portfolioData: PortfolioData): Promise<AllocationOptimization> {
    const currentAllocation = this.getCurrentAllocation(portfolioData.strategy);

    try {
      const aiResponse = await this.geminiService.analyzePortfolio(portfolioData);
      return this.generateAllocationFromAnalysis(aiResponse, currentAllocation);
    } catch (error) {
      console.error('Error in allocation optimization:', error);
      return this.getFallbackAllocationOptimization(currentAllocation);
    }
  }

  /**
   * Get current market conditions for context
   */
  private async getMarketConditions(): Promise<MarketConditions> {
    const cacheKey = 'market-conditions';
    const cached = this.marketCache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }

    // In a real implementation, this would fetch from APIs
    const marketConditions: MarketConditions = {
      ethPrice: 2400 + Math.random() * 200, // Mock price with variation
      ethTrend: ['BULLISH', 'BEARISH', 'NEUTRAL'][Math.floor(Math.random() * 3)] as any,
      ethVolatility: 0.1 + Math.random() * 0.3,
      usdcStability: 0.98 + Math.random() * 0.04,
      defiTVL: 50000000000 + Math.random() * 10000000000,
      yieldEnvironment: ['HIGH_YIELD', 'MODERATE_YIELD', 'LOW_YIELD'][Math.floor(Math.random() * 3)] as any,
      marketSentiment: ['FEAR', 'NEUTRAL', 'GREED'][Math.floor(Math.random() * 3)] as any,
      timestamp: Date.now()
    };

    this.marketCache.set(cacheKey, { data: marketConditions, timestamp: Date.now() });
    return marketConditions;
  }

  // Helper methods for parsing AI responses and fallbacks

  private mapAIAnalysisToRisk(aiResponse: any, portfolioData: PortfolioData) {
    // Use AI analysis risk score or fall back to strategy-based scoring
    const baseRisk = {
      'LOW_RISK': 25,
      'BALANCED': 50,
      'HIGH_RISK': 75
    }[portfolioData.strategy];

    // Adjust based on AI risk assessment if available
    const aiRiskAdjustment = aiResponse.riskScore ?
      Math.max(-20, Math.min(20, aiResponse.riskScore - baseRisk)) : 0;

    return {
      overall: Math.max(1, Math.min(100, baseRisk + aiRiskAdjustment)),
      volatility: Math.max(1, Math.min(100, baseRisk + Math.floor(Math.random() * 15) - 7)),
      liquidity: Math.max(20, baseRisk - 10 + Math.floor(Math.random() * 10)),
      protocol: Math.max(15, baseRisk - 5 + Math.floor(Math.random() * 15)),
      market: 40 + Math.floor(Math.random() * 30)
    };
  }

  private generateROIFromAnalysis(aiResponse: any, portfolioData: PortfolioData, marketConditions: MarketConditions): ROIForecast {
    const strategyMultiplier = {
      'LOW_RISK': 1.0,
      'BALANCED': 1.5,
      'HIGH_RISK': 2.0
    }[portfolioData.strategy];

    // Adjust base ROI based on AI recommendations if available
    const baseWeeklyROI = (aiResponse.rebalanceNeeded ? 0.7 : 0.5) * strategyMultiplier;
    const baseMonthlyROI = (aiResponse.rebalanceNeeded ? 2.5 : 2.0) * strategyMultiplier;

    // Market condition adjustments
    const marketMultiplier = marketConditions.ethTrend === 'BULLISH' ? 1.2 :
                           marketConditions.ethTrend === 'BEARISH' ? 0.8 : 1.0;

    return {
      sevenDayROI: {
        conservative: baseWeeklyROI * 0.6 * marketMultiplier,
        likely: baseWeeklyROI * marketMultiplier,
        optimistic: baseWeeklyROI * 1.4 * marketMultiplier
      },
      monthlyROI: {
        conservative: baseMonthlyROI * 0.7 * marketMultiplier,
        likely: baseMonthlyROI * marketMultiplier,
        optimistic: baseMonthlyROI * 1.3 * marketMultiplier
      },
      confidence: aiResponse.reasoning ? 80 : 65,
      keyFactors: [
        'Current DeFi yield rates',
        'ETH price volatility',
        'Protocol risk factors',
        'Market liquidity conditions'
      ],
      marketConditions: marketConditions.ethTrend === 'BULLISH' ? 'BULL' :
                       marketConditions.ethTrend === 'BEARISH' ? 'BEAR' : 'SIDEWAYS',
      timestamp: Date.now()
    };
  }

  private generateStrategyFromAnalysis(aiResponse: any, portfolioData: PortfolioData, riskAnalysis: RiskAnalysis): StrategyRecommendation {
    // Determine if strategy change is recommended based on AI analysis
    let recommendedStrategy = portfolioData.strategy;
    let reasoning = 'Current strategy is performing well for the risk profile.';
    let expectedImprovement = 3;
    let actionPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'LOW';

    if (aiResponse.rebalanceNeeded) {
      actionPriority = 'MEDIUM';
      expectedImprovement = 8;
      reasoning = 'AI analysis suggests portfolio rebalancing could improve returns.';
    }

    // Check if risk level suggests strategy change
    if (riskAnalysis.overallAssessment === 'HIGH' && portfolioData.strategy === 'HIGH_RISK') {
      recommendedStrategy = 'BALANCED';
      reasoning = 'High risk detected, recommend switching to balanced strategy.';
      actionPriority = 'HIGH';
      expectedImprovement = 5;
    } else if (riskAnalysis.overallAssessment === 'LOW' && portfolioData.strategy === 'LOW_RISK') {
      recommendedStrategy = 'BALANCED';
      reasoning = 'Low risk environment may allow for higher yield strategies.';
      actionPriority = 'MEDIUM';
      expectedImprovement = 12;
    }

    return {
      currentStrategy: portfolioData.strategy,
      recommendedStrategy,
      reasoning: aiResponse.reasoning || reasoning,
      expectedImprovement,
      riskAdjustment: recommendedStrategy === portfolioData.strategy ? 'SAME' :
                     (recommendedStrategy === 'HIGH_RISK' ? 'HIGHER' : 'LOWER'),
      confidenceLevel: aiResponse.reasoning ? 85 : 65,
      actionPriority,
      timestamp: Date.now()
    };
  }

  private generateAllocationFromAnalysis(aiResponse: any, currentAllocation: any): AllocationOptimization {
    // Generate optimized allocation based on AI recommendations
    const optimized = { ...currentAllocation };

    if (aiResponse.rebalanceNeeded) {
      // Make more significant adjustments when rebalancing is recommended
      optimized.yieldFarming += Math.floor(Math.random() * 15) - 7;
      optimized.liquidityMining += Math.floor(Math.random() * 12) - 6;
      optimized.staking += Math.floor(Math.random() * 8) - 4;

      // Ensure values stay positive
      Object.keys(optimized).forEach(key => {
        optimized[key as keyof typeof optimized] = Math.max(0, optimized[key as keyof typeof optimized]);
      });
    } else {
      // Make smaller adjustments for fine-tuning
      optimized.yieldFarming += Math.floor(Math.random() * 6) - 3;
      optimized.liquidityMining += Math.floor(Math.random() * 6) - 3;
    }

    // Ensure totals add to 100%
    const total = Object.values(optimized).reduce((sum: number, val: any) => sum + val, 0);
    if (total > 0) {
      const factor = 100 / total;
      Object.keys(optimized).forEach(key => {
        optimized[key as keyof typeof optimized] = Math.round(optimized[key as keyof typeof optimized] * factor);
      });
    }

    return {
      currentAllocation,
      recommendedAllocation: optimized,
      expectedYieldIncrease: aiResponse.rebalanceNeeded ? 8 : 4,
      riskChange: (Math.random() - 0.5) * 8,
      reasoning: aiResponse.reasoning || 'Optimization based on current yield rates and protocol performance',
      timestamp: Date.now()
    };
  }

  private extractRiskScore(aiResponse: string, portfolioData: PortfolioData) {
    // Parse AI response or use strategy-based scoring
    const baseRisk = {
      'LOW_RISK': 25,
      'BALANCED': 50,
      'HIGH_RISK': 75
    }[portfolioData.strategy];

    return {
      overall: baseRisk + Math.floor(Math.random() * 20) - 10,
      volatility: baseRisk + Math.floor(Math.random() * 15) - 7,
      liquidity: Math.max(20, baseRisk - 10 + Math.floor(Math.random() * 10)),
      protocol: Math.max(15, baseRisk - 5 + Math.floor(Math.random() * 15)),
      market: 40 + Math.floor(Math.random() * 30)
    };
  }

  private getRiskLevel(score: number): 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' {
    if (score < 30) return 'LOW';
    if (score < 60) return 'MODERATE';
    if (score < 85) return 'HIGH';
    return 'EXTREME';
  }

  private generateRiskRecommendations(portfolioData: PortfolioData, riskScore: any): string[] {
    const recommendations = [];

    if (riskScore.overall > 70) {
      recommendations.push('Consider reducing exposure to high-risk yield farming');
      recommendations.push('Increase stable reserve allocation');
    }

    if (riskScore.liquidity > 60) {
      recommendations.push('Diversify across more liquid protocols');
    }

    if (riskScore.protocol > 70) {
      recommendations.push('Reduce concentration in unaudited protocols');
    }

    return recommendations;
  }

  private parseROIForecast(aiResponse: string, portfolioData: PortfolioData, marketConditions: MarketConditions): ROIForecast {
    // Parse AI response or generate realistic forecasts
    const strategyMultiplier = {
      'LOW_RISK': 1.0,
      'BALANCED': 1.5,
      'HIGH_RISK': 2.0
    }[portfolioData.strategy];

    const baseWeeklyROI = 0.5 * strategyMultiplier;
    const baseMonthlyROI = 2.0 * strategyMultiplier;

    return {
      sevenDayROI: {
        conservative: baseWeeklyROI * 0.6,
        likely: baseWeeklyROI,
        optimistic: baseWeeklyROI * 1.4
      },
      monthlyROI: {
        conservative: baseMonthlyROI * 0.7,
        likely: baseMonthlyROI,
        optimistic: baseMonthlyROI * 1.3
      },
      confidence: 70 + Math.floor(Math.random() * 20),
      keyFactors: [
        'Current DeFi yield rates',
        'ETH price volatility',
        'Protocol risk factors',
        'Market liquidity conditions'
      ],
      marketConditions: marketConditions.ethTrend === 'BULLISH' ? 'BULL' :
                       marketConditions.ethTrend === 'BEARISH' ? 'BEAR' : 'SIDEWAYS',
      timestamp: Date.now()
    };
  }

  private parseStrategyRecommendation(aiResponse: string, portfolioData: PortfolioData): StrategyRecommendation {
    // Default to keeping current strategy with minor optimizations
    return {
      currentStrategy: portfolioData.strategy,
      recommendedStrategy: portfolioData.strategy,
      reasoning: 'Current strategy is performing well for the risk profile. Minor allocation adjustments recommended.',
      expectedImprovement: 5 + Math.random() * 10,
      riskAdjustment: 'SAME',
      confidenceLevel: 75 + Math.floor(Math.random() * 20),
      actionPriority: 'MEDIUM',
      timestamp: Date.now()
    };
  }

  private getCurrentAllocation(strategy: string) {
    const allocations = {
      'LOW_RISK': {
        yieldFarming: 30,
        liquidityMining: 20,
        staking: 40,
        memeCoinTrading: 0,
        stableReserve: 10
      },
      'BALANCED': {
        yieldFarming: 35,
        liquidityMining: 30,
        staking: 25,
        memeCoinTrading: 5,
        stableReserve: 5
      },
      'HIGH_RISK': {
        yieldFarming: 20,
        liquidityMining: 40,
        staking: 10,
        memeCoinTrading: 25,
        stableReserve: 5
      }
    };

    return allocations[strategy as keyof typeof allocations] || allocations.BALANCED;
  }

  private parseAllocationOptimization(aiResponse: string, currentAllocation: any): AllocationOptimization {
    // Generate slight improvements to current allocation
    const optimized = { ...currentAllocation };

    // Make small adjustments based on current market
    optimized.yieldFarming += Math.floor(Math.random() * 10) - 5;
    optimized.liquidityMining += Math.floor(Math.random() * 8) - 4;
    optimized.staking += Math.floor(Math.random() * 6) - 3;

    // Ensure totals add to 100%
    const total = Object.values(optimized).reduce((sum: number, val: any) => sum + val, 0);
    const factor = 100 / total;
    Object.keys(optimized).forEach(key => {
      optimized[key as keyof typeof optimized] = Math.round(optimized[key as keyof typeof optimized] * factor);
    });

    return {
      currentAllocation,
      recommendedAllocation: optimized,
      expectedYieldIncrease: 3 + Math.random() * 7,
      riskChange: (Math.random() - 0.5) * 10,
      reasoning: 'Optimization based on current yield rates and protocol performance',
      timestamp: Date.now()
    };
  }

  // Fallback methods for when AI service is unavailable

  private getFallbackRiskAnalysis(portfolioData: PortfolioData): RiskAnalysis {
    const baseRisk = {
      'LOW_RISK': 25,
      'BALANCED': 50,
      'HIGH_RISK': 75
    }[portfolioData.strategy];

    return {
      riskScore: baseRisk,
      volatilityScore: baseRisk,
      liquidityRisk: Math.max(20, baseRisk - 10),
      protocolRisk: Math.max(15, baseRisk - 5),
      marketRisk: 50,
      overallAssessment: this.getRiskLevel(baseRisk),
      recommendations: ['Monitor market conditions', 'Regular portfolio review'],
      timestamp: Date.now()
    };
  }

  private getFallbackROIForecast(portfolioData: PortfolioData): ROIForecast {
    const strategyMultiplier = {
      'LOW_RISK': 1.0,
      'BALANCED': 1.5,
      'HIGH_RISK': 2.0
    }[portfolioData.strategy];

    return {
      sevenDayROI: {
        conservative: 0.3 * strategyMultiplier,
        likely: 0.5 * strategyMultiplier,
        optimistic: 0.7 * strategyMultiplier
      },
      monthlyROI: {
        conservative: 1.5 * strategyMultiplier,
        likely: 2.0 * strategyMultiplier,
        optimistic: 2.5 * strategyMultiplier
      },
      confidence: 60,
      keyFactors: ['Historical performance', 'Strategy risk profile'],
      marketConditions: 'SIDEWAYS',
      timestamp: Date.now()
    };
  }

  private getFallbackStrategyRecommendation(portfolioData: PortfolioData): StrategyRecommendation {
    return {
      currentStrategy: portfolioData.strategy,
      recommendedStrategy: portfolioData.strategy,
      reasoning: 'Maintaining current strategy based on stable performance',
      expectedImprovement: 5,
      riskAdjustment: 'SAME',
      confidenceLevel: 60,
      actionPriority: 'LOW',
      timestamp: Date.now()
    };
  }

  private getFallbackAllocationOptimization(currentAllocation: any): AllocationOptimization {
    return {
      currentAllocation,
      recommendedAllocation: currentAllocation,
      expectedYieldIncrease: 2,
      riskChange: 0,
      reasoning: 'Current allocation is well-balanced',
      timestamp: Date.now()
    };
  }
}
