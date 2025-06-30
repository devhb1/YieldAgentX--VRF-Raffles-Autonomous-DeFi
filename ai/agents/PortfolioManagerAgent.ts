import { BaseAgent, AgentConfig, AgentDecision, AgentStatus, MarketData } from './BaseAgent';
import { GeminiAIService, PortfolioAnalysis, createGeminiAIService } from '../services/GeminiAIService';

export class PortfolioManagerAgent extends BaseAgent {
  private portfolioData: any = null;
  private rebalanceThreshold: number = 0.05; // 5% threshold for rebalancing
  private geminiService: GeminiAIService | null = null;

  constructor(config: AgentConfig) {
    super(config);
    try {
      this.geminiService = createGeminiAIService();
    } catch (error) {
      console.warn('Google Gemini service initialization failed, fallback mode enabled:', error);
      // Continue without Gemini service - fallback will be used
    }
  }

  async analyze(marketData?: MarketData[]): Promise<AgentDecision> {
    try {
      // Fetch current portfolio state
      await this.updatePortfolioData();

      // Use Google Gemini for enhanced AI analysis
      let geminiAnalysis: PortfolioAnalysis | null = null;
      try {
        if (this.geminiService) {
          console.log('🤖 Requesting Google Gemini portfolio analysis...');
          geminiAnalysis = await this.geminiService.analyzePortfolio({
            totalValue: this.portfolioData.totalValue,
            allocations: this.portfolioData.allocations,
            protocols: this.portfolioData.protocols,
            chains: this.portfolioData.chains,
            riskTolerance: this.config.riskTolerance,
            marketConditions: marketData ? this.formatMarketData(marketData) : 'Unknown'
          });
          console.log('✅ Google Gemini analysis completed:', {
            riskScore: geminiAnalysis?.riskScore,
            rebalanceNeeded: geminiAnalysis?.rebalanceNeeded,
            recommendationsCount: geminiAnalysis?.recommendations.length
          });
        } else {
          console.log('⚠️ Google Gemini not available, using traditional analysis only');
        }
      } catch (error: any) {
        console.error('❌ Google Gemini analysis failed:', error.message);
        console.log('🔄 Falling back to traditional portfolio analysis...');
      }

      // Analyze current allocation vs optimal allocation (traditional method)
      const allocationAnalysis = this.analyzeAllocation();

      // Determine if rebalancing is needed (combine AI and traditional analysis)
      let shouldRebalance = this.shouldRebalance(allocationAnalysis);

      // Override with Gemini recommendation if available
      if (geminiAnalysis && geminiAnalysis.rebalanceNeeded) {
        shouldRebalance = true;
        console.log('🎯 Google Gemini recommends rebalancing - overriding traditional analysis');
      }

      // Calculate confidence based on market conditions and allocation drift
      let confidence = this.calculateConfidence(allocationAnalysis, marketData);

      // Adjust confidence with Gemini insights
      if (geminiAnalysis) {
        // Use Gemini's risk score to adjust confidence
        const geminiConfidence = Math.max(0.1, Math.min(1.0, (100 - geminiAnalysis.riskScore) / 100));
        confidence = (confidence + geminiConfidence) / 2; // Average traditional and AI confidence
      }

      const decision: AgentDecision = {
        agentId: 'portfolio-manager',
        agentName: this.config.name,
        decision: shouldRebalance ? 'REBALANCE' : 'HOLD',
        confidence,
        reasoning: this.generateReasoning(allocationAnalysis, shouldRebalance, geminiAnalysis),
        recommendedAction: shouldRebalance ? this.generateRebalanceAction(allocationAnalysis) : undefined,
        timestamp: Date.now(),
        executionCost: shouldRebalance ? this.estimateRebalanceCost() : 0,
        expectedReturn: shouldRebalance ? this.estimateExpectedReturn(allocationAnalysis) : 0
      };

      return decision;
    } catch (error) {
      console.error('Portfolio analysis failed:', error);
      throw error;
    }
  }

  async execute(decision: AgentDecision): Promise<boolean> {
    if (decision.decision !== 'REBALANCE') {
      return true; // No action needed for HOLD
    }

    try {
      console.log(`Executing portfolio rebalance: ${decision.recommendedAction}`);

      // In a real implementation, this would:
      // 1. Calculate exact amounts to move
      // 2. Execute trades through DeFi protocols
      // 3. Update portfolio state
      // 4. Log execution results

      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate success/failure (90% success rate)
      const success = Math.random() > 0.1;

      if (success) {
        console.log('Portfolio rebalance executed successfully');
        await this.updatePortfolioData(); // Refresh portfolio state
      } else {
        console.error('Portfolio rebalance failed');
      }

      return success;
    } catch (error) {
      console.error('Portfolio execution failed:', error);
      return false;
    }
  }

  getStatus(): AgentStatus {
    const recentDecisions = this.getRecentDecisions();
    const successfulExecutions = recentDecisions.filter(d => d.confidence >= this.config.riskTolerance).length;

    return {
      id: 'portfolio-manager',
      name: this.config.name,
      isActive: this.isActive,
      lastUpdate: this.lastUpdate,
      executionCount: this.executionCount,
      recentPerformance: this.calculatePerformanceScore(),
      totalDecisions: this.decisions.length,
      successRate: this.decisions.length > 0 ? (successfulExecutions / this.decisions.length) * 100 : 0
    };
  }

  // Private helper methods
  private async updatePortfolioData(): Promise<void> {
    // Simulate fetching portfolio data from blockchain
    // In production, this would query smart contracts
    this.portfolioData = {
      totalValue: 100000 + Math.random() * 50000, // $100k-150k portfolio
      allocations: {
        ethereum: 0.4 + (Math.random() - 0.5) * 0.1,
        polygon: 0.3 + (Math.random() - 0.5) * 0.1,
        avalanche: 0.3 + (Math.random() - 0.5) * 0.1
      },
      yields: {
        ethereum: 0.08 + Math.random() * 0.05, // 8-13% APY
        polygon: 0.12 + Math.random() * 0.08, // 12-20% APY
        avalanche: 0.10 + Math.random() * 0.06 // 10-16% APY
      },
      lastRebalance: Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000) // Last 7 days
    };
  }

  private analyzeAllocation(): any {
    if (!this.portfolioData) return null;

    // Calculate optimal allocation based on yield-adjusted returns
    const { yields, allocations } = this.portfolioData;

    const optimalAllocations = {
      ethereum: 0.35, // Lower risk, stable yield
      polygon: 0.35, // Medium risk, higher yield
      avalanche: 0.30 // Medium risk, good yield
    };

    const allocationDrift = {
      ethereum: Math.abs(allocations.ethereum - optimalAllocations.ethereum),
      polygon: Math.abs(allocations.polygon - optimalAllocations.polygon),
      avalanche: Math.abs(allocations.avalanche - optimalAllocations.avalanche)
    };

    const maxDrift = Math.max(...Object.values(allocationDrift));

    return {
      current: allocations,
      optimal: optimalAllocations,
      drift: allocationDrift,
      maxDrift,
      yields
    };
  }

  private shouldRebalance(analysis: any): boolean {
    if (!analysis) return false;
    return analysis.maxDrift > this.rebalanceThreshold;
  }

  private calculateConfidence(analysis: any, marketData?: MarketData[]): number {
    if (!analysis) return 0;

    let confidence = 70; // Base confidence

    // Increase confidence if drift is significant
    if (analysis.maxDrift > this.rebalanceThreshold * 2) {
      confidence += 15;
    }

    // Adjust based on market volatility
    if (marketData && marketData.length > 0) {
      const avgVolatility = marketData.reduce((sum, data) => sum + data.volatility, 0) / marketData.length;
      if (avgVolatility < 0.3) confidence += 10; // Low volatility = higher confidence
      if (avgVolatility > 0.7) confidence -= 15; // High volatility = lower confidence
    }

    return Math.min(100, Math.max(0, confidence));
  }

  private generateReasoning(analysis: any, shouldRebalance: boolean, geminiAnalysis: PortfolioAnalysis | null = null): string {
    if (!analysis) return 'Unable to analyze portfolio allocation';

    let reasoning = '';

    if (shouldRebalance) {
      const maxDriftChain = Object.entries(analysis.drift as { [key: string]: number })
        .reduce((max, [chain, drift]) => (drift as number) > max.drift ? { chain, drift: drift as number } : max, { chain: '', drift: 0 });

      reasoning = `Portfolio allocation has drifted significantly. ${maxDriftChain.chain} allocation is ${(maxDriftChain.drift * 100).toFixed(1)}% away from optimal. Current market conditions favor rebalancing to maximize yield-adjusted returns.`;
    } else {
      reasoning = `Portfolio allocation is within acceptable range. Maximum drift is ${(analysis.maxDrift * 100).toFixed(1)}%, below the ${(this.rebalanceThreshold * 100).toFixed(1)}% threshold. Maintaining current positions.`;
    }

    // Enhance with Google Gemini insights if available
    if (geminiAnalysis) {
      reasoning += `\n\n🤖 Google Gemini AI Analysis:\nRisk Score: ${geminiAnalysis.riskScore}/100\nProvider: ${geminiAnalysis.provider}\nAI Reasoning: ${geminiAnalysis.reasoning}`;

      if (geminiAnalysis.recommendations.length > 0) {
        reasoning += `\nAI Recommendations: ${geminiAnalysis.recommendations.slice(0, 3).join(', ')}`;
      }
    }

    return reasoning;
  }

  private generateRebalanceAction(analysis: any): string {
    if (!analysis) return 'No action required';

    const actions: string[] = [];
    const { current, optimal } = analysis;

    for (const [chain, currentAlloc] of Object.entries(current as { [key: string]: number })) {
      const optimalAlloc = (optimal as { [key: string]: number })[chain];
      const diff = optimalAlloc - (currentAlloc as number);

      if (Math.abs(diff) > this.rebalanceThreshold) {
        const action = diff > 0 ? 'Increase' : 'Decrease';
        const percentage = Math.abs(diff * 100);
        actions.push(`${action} ${chain} allocation by ${percentage.toFixed(1)}%`);
      }
    }

    return actions.join(', ');
  }

  private estimateRebalanceCost(): number {
    // Estimate gas costs and trading fees
    return Math.random() * 50 + 10; // $10-60 in fees
  }

  private estimateExpectedReturn(analysis: any): number {
    if (!analysis) return 0;

    // Calculate expected additional return from rebalancing
    const { yields, maxDrift } = analysis;
    const avgYield = Object.values(yields as { [key: string]: number }).reduce((sum: number, yieldValue: number) => sum + yieldValue, 0) / Object.values(yields).length;

    // Estimate additional return based on drift magnitude
    return maxDrift * avgYield * 1000; // Simplified calculation
  }

  private calculatePerformanceScore(): number {
    if (!this.portfolioData) return 0;

    // Calculate performance based on recent yield and allocation efficiency
    const { yields, allocations } = this.portfolioData;

    let weightedYield = 0;
    for (const [chain, allocation] of Object.entries(allocations as { [key: string]: number })) {
      weightedYield += (allocation as number) * (yields as { [key: string]: number })[chain];
    }

    // Convert to percentage and cap at 100
    return Math.min(100, weightedYield * 100);
  }

  private formatMarketData(marketData: MarketData[]): string {
    if (!marketData || marketData.length === 0) {
      return 'No market data available';
    }

    const summary = marketData.map(data => {
      return `${data.chain}: $${data.price} (${data.trend}) Vol: ${data.volatility.toFixed(2)}`;
    }).join(', ');

    return `Market conditions: ${summary}`;
  }
}
