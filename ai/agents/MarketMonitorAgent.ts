import { BaseAgent, AgentConfig, AgentDecision, AgentStatus, MarketData } from './BaseAgent';

export class MarketMonitorAgent extends BaseAgent {
  private marketData: MarketData[] = [];
  private priceHistory: { [chain: string]: number[] } = {};
  private volumeHistory: { [chain: string]: number[] } = {};

  constructor(config: AgentConfig) {
    super(config);
  }

  async analyze(marketData?: MarketData[]): Promise<AgentDecision> {
    try {
      // Update market data
      await this.updateMarketData(marketData);
      
      // Analyze market trends
      const marketAnalysis = this.analyzeMarketTrends();
      
      // Identify opportunities and threats
      const opportunities = this.identifyOpportunities(marketAnalysis);
      
      // Determine market action
      const decision = this.determineMarketAction(marketAnalysis, opportunities);
      
      // Calculate confidence based on signal strength
      const confidence = this.calculateMarketConfidence(marketAnalysis, opportunities);
      
      const agentDecision: AgentDecision = {
        agentId: 'market-monitor',
        agentName: this.config.name,
        decision,
        confidence,
        reasoning: this.generateMarketReasoning(marketAnalysis, opportunities),
        recommendedAction: this.generateMarketAction(decision, opportunities),
        timestamp: Date.now(),
        expectedReturn: this.estimateExpectedReturn(opportunities)
      };

      return agentDecision;
    } catch (error) {
      console.error('Market analysis failed:', error);
      throw error;
    }
  }

  async execute(decision: AgentDecision): Promise<boolean> {
    if (decision.decision === 'HOLD') {
      return true; // No action needed
    }

    try {
      console.log(`Executing market-based action: ${decision.recommendedAction}`);
      
      // In a real implementation, this would:
      // 1. Execute trades based on market signals
      // 2. Adjust allocations based on market trends
      // 3. Enter/exit positions based on opportunities
      // 4. Set alerts for market conditions
      
      // Simulate execution
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      // Market-based actions have moderate success rate
      const success = Math.random() > 0.15; // 85% success rate
      
      if (success) {
        console.log('Market-based action executed successfully');
      } else {
        console.error('Market-based action failed');
      }
      
      return success;
    } catch (error) {
      console.error('Market execution failed:', error);
      return false;
    }
  }

  getStatus(): AgentStatus {
    const recentDecisions = this.getRecentDecisions();
    const successfulExecutions = recentDecisions.filter(d => d.confidence >= this.config.riskTolerance).length;
    
    return {
      id: 'market-monitor',
      name: this.config.name,
      isActive: this.isActive,
      lastUpdate: this.lastUpdate,
      executionCount: this.executionCount,
      recentPerformance: this.calculateMarketPerformance(),
      totalDecisions: this.decisions.length,
      successRate: this.decisions.length > 0 ? (successfulExecutions / this.decisions.length) * 100 : 0
    };
  }

  // Market-specific public methods
  public getCurrentMarketSentiment(): string {
    const recentAnalysis = this.analyzeMarketTrends();
    if (!recentAnalysis) return 'NEUTRAL';
    
    const { overallTrend } = recentAnalysis;
    return overallTrend;
  }

  public getMarketSummary(): any {
    return {
      marketData: this.marketData,
      trends: this.analyzeMarketTrends(),
      opportunities: this.marketData.length > 0 ? this.identifyOpportunities(this.analyzeMarketTrends()) : []
    };
  }

  // Private helper methods
  private async updateMarketData(externalData?: MarketData[]): Promise<void> {
    // Use external data if provided, otherwise simulate
    if (externalData && externalData.length > 0) {
      this.marketData = externalData;
    } else {
      // Simulate market data for different chains
      this.marketData = this.generateSimulatedMarketData();
    }

    // Update price and volume history
    this.updateHistories();
  }

  private generateSimulatedMarketData(): MarketData[] {
    const chains = ['ethereum', 'polygon', 'avalanche', 'arbitrum'];
    
    return chains.map(chain => {
      // Simulate realistic price movements
      const basePrice = this.getLastPrice(chain) || (Math.random() * 3000 + 1000);
      const priceChange = (Math.random() - 0.5) * 0.1; // ±5% change
      const newPrice = basePrice * (1 + priceChange);
      
      // Simulate volume and volatility
      const volume = Math.random() * 1000000 + 500000; // $500k-1.5M
      const volatility = Math.abs(priceChange) + Math.random() * 0.2;
      
      // Determine trend based on recent price action
      const trend = this.calculateTrend(chain, newPrice);
      
      return {
        price: newPrice,
        volume,
        volatility,
        trend,
        chain,
        timestamp: Date.now()
      };
    });
  }

  private getLastPrice(chain: string): number | null {
    const history = this.priceHistory[chain];
    return history && history.length > 0 ? history[history.length - 1] : null;
  }

  private calculateTrend(chain: string, currentPrice: number): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    const history = this.priceHistory[chain];
    if (!history || history.length < 3) return 'NEUTRAL';
    
    const recentPrices = history.slice(-3);
    const avgRecent = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
    
    const changePercent = (currentPrice - avgRecent) / avgRecent;
    
    if (changePercent > 0.02) return 'BULLISH';
    if (changePercent < -0.02) return 'BEARISH';
    return 'NEUTRAL';
  }

  private updateHistories(): void {
    this.marketData.forEach(data => {
      const { chain, price, volume } = data;
      
      // Initialize arrays if needed
      if (!this.priceHistory[chain]) this.priceHistory[chain] = [];
      if (!this.volumeHistory[chain]) this.volumeHistory[chain] = [];
      
      // Add new data
      this.priceHistory[chain].push(price);
      this.volumeHistory[chain].push(volume);
      
      // Keep only last 20 data points
      if (this.priceHistory[chain].length > 20) {
        this.priceHistory[chain] = this.priceHistory[chain].slice(-20);
      }
      if (this.volumeHistory[chain].length > 20) {
        this.volumeHistory[chain] = this.volumeHistory[chain].slice(-20);
      }
    });
  }

  private analyzeMarketTrends(): any {
    if (this.marketData.length === 0) return null;

    // Calculate overall market metrics
    const totalVolume = this.marketData.reduce((sum, data) => sum + data.volume, 0);
    const avgVolatility = this.marketData.reduce((sum, data) => sum + data.volatility, 0) / this.marketData.length;
    
    // Determine overall trend
    const bullishCount = this.marketData.filter(data => data.trend === 'BULLISH').length;
    const bearishCount = this.marketData.filter(data => data.trend === 'BEARISH').length;
    
    let overallTrend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    if (bullishCount > bearishCount) {
      overallTrend = 'BULLISH';
    } else if (bearishCount > bullishCount) {
      overallTrend = 'BEARISH';
    } else {
      overallTrend = 'NEUTRAL';
    }

    // Calculate momentum indicators
    const momentum = this.calculateMomentum();
    const volumeSignal = this.analyzeVolumePatterns();
    
    return {
      overallTrend,
      totalVolume,
      avgVolatility,
      momentum,
      volumeSignal,
      strongTrends: this.marketData.filter(data => data.volatility > 0.3),
      timestamp: Date.now()
    };
  }

  private calculateMomentum(): { [chain: string]: number } {
    const momentum: { [chain: string]: number } = {};
    
    Object.entries(this.priceHistory).forEach(([chain, prices]) => {
      if (prices.length < 5) {
        momentum[chain] = 0;
        return;
      }
      
      // Calculate price momentum over last 5 periods
      const recent = prices.slice(-5);
      const earlier = prices.slice(-10, -5);
      
      if (earlier.length === 0) {
        momentum[chain] = 0;
        return;
      }
      
      const recentAvg = recent.reduce((sum, price) => sum + price, 0) / recent.length;
      const earlierAvg = earlier.reduce((sum, price) => sum + price, 0) / earlier.length;
      
      momentum[chain] = (recentAvg - earlierAvg) / earlierAvg;
    });
    
    return momentum;
  }

  private analyzeVolumePatterns(): string {
    const volumeChanges = Object.entries(this.volumeHistory).map(([chain, volumes]) => {
      if (volumes.length < 2) return 0;
      
      const current = volumes[volumes.length - 1];
      const previous = volumes[volumes.length - 2];
      
      return (current - previous) / previous;
    });
    
    const avgVolumeChange = volumeChanges.reduce((sum, change) => sum + change, 0) / volumeChanges.length;
    
    if (avgVolumeChange > 0.1) return 'INCREASING';
    if (avgVolumeChange < -0.1) return 'DECREASING';
    return 'STABLE';
  }

  private identifyOpportunities(analysis: any): any[] {
    if (!analysis) return [];
    
    const opportunities: any[] = [];
    
    // Identify high momentum opportunities
    Object.entries(analysis.momentum as { [key: string]: number }).forEach(([chain, momentum]) => {
      if (Math.abs(momentum as number) > 0.05) {
        opportunities.push({
          type: (momentum as number) > 0 ? 'BREAKOUT' : 'REVERSAL',
          chain,
          strength: Math.abs(momentum as number),
          direction: (momentum as number) > 0 ? 'UP' : 'DOWN'
        });
      }
    });
    
    // Identify volume-based opportunities
    if (analysis.volumeSignal === 'INCREASING') {
      opportunities.push({
        type: 'VOLUME_SURGE',
        chain: 'MARKET_WIDE',
        strength: 0.7,
        direction: 'UP'
      });
    }
    
    // Identify low volatility opportunities (good for entering positions)
    const lowVolChains = this.marketData.filter(data => data.volatility < 0.2);
    lowVolChains.forEach(data => {
      opportunities.push({
        type: 'LOW_VOLATILITY',
        chain: data.chain,
        strength: 0.5,
        direction: 'STABLE'
      });
    });
    
    return opportunities.sort((a, b) => b.strength - a.strength);
  }

  private determineMarketAction(analysis: any, opportunities: any[]): 'BUY' | 'SELL' | 'HOLD' | 'REBALANCE' {
    if (!analysis || opportunities.length === 0) return 'HOLD';

    const { overallTrend, avgVolatility } = analysis;
    const strongOpportunities = opportunities.filter(opp => opp.strength > 0.6);
    
    // High volatility = be cautious
    if (avgVolatility > 0.5) {
      return overallTrend === 'BEARISH' ? 'SELL' : 'HOLD';
    }
    
    // Strong opportunities = take action
    if (strongOpportunities.length > 0) {
      const topOpp = strongOpportunities[0];
      if (topOpp.direction === 'UP' && overallTrend !== 'BEARISH') {
        return 'BUY';
      }
      if (topOpp.direction === 'DOWN' && overallTrend === 'BEARISH') {
        return 'SELL';
      }
      return 'REBALANCE';
    }
    
    // Default based on overall trend
    if (overallTrend === 'BULLISH' && avgVolatility < 0.3) return 'BUY';
    if (overallTrend === 'BEARISH' && avgVolatility > 0.3) return 'SELL';
    
    return 'HOLD';
  }

  private calculateMarketConfidence(analysis: any, opportunities: any[]): number {
    if (!analysis) return 0;

    let confidence = 60; // Base confidence
    
    // Strong trends increase confidence
    if (analysis.overallTrend !== 'NEUTRAL') {
      confidence += 15;
    }
    
    // Multiple opportunities increase confidence
    if (opportunities.length > 2) {
      confidence += 10;
    }
    
    // High volatility decreases confidence
    if (analysis.avgVolatility > 0.5) {
      confidence -= 20;
    }
    
    // Volume confirmation increases confidence
    if (analysis.volumeSignal !== 'STABLE') {
      confidence += 10;
    }
    
    return Math.min(100, Math.max(0, confidence));
  }

  private generateMarketReasoning(analysis: any, opportunities: any[]): string {
    if (!analysis) return 'Unable to analyze market conditions';

    const { overallTrend, avgVolatility, volumeSignal } = analysis;
    const topOpportunities = opportunities.slice(0, 2);
    
    let reasoning = `Market Analysis: Overall trend is ${overallTrend} with ${(avgVolatility * 100).toFixed(1)}% average volatility. Volume is ${volumeSignal}.`;
    
    if (topOpportunities.length > 0) {
      const oppDescriptions = topOpportunities.map(opp => 
        `${opp.type} signal on ${opp.chain} (${(opp.strength * 100).toFixed(1)}% strength)`
      );
      reasoning += ` Key opportunities: ${oppDescriptions.join(', ')}.`;
    }
    
    if (avgVolatility > 0.5) {
      reasoning += ' High volatility suggests caution is warranted.';
    } else if (avgVolatility < 0.2) {
      reasoning += ' Low volatility environment suitable for position building.';
    }
    
    return reasoning;
  }

  private generateMarketAction(decision: string, opportunities: any[]): string | undefined {
    if (decision === 'HOLD') return undefined;
    
    const topOpp = opportunities.length > 0 ? opportunities[0] : null;
    
    switch (decision) {
      case 'BUY':
        return topOpp ? 
          `Increase exposure to ${topOpp.chain} based on ${topOpp.type} signal` :
          'Increase market exposure based on bullish conditions';
      case 'SELL':
        return topOpp ?
          `Reduce exposure to ${topOpp.chain} due to ${topOpp.type} concerns` :
          'Reduce market exposure due to bearish conditions';
      case 'REBALANCE':
        return topOpp ?
          `Rebalance portfolio to capitalize on ${topOpp.type} opportunity in ${topOpp.chain}` :
          'Rebalance based on changing market conditions';
      default:
        return undefined;
    }
  }

  private estimateExpectedReturn(opportunities: any[]): number {
    if (opportunities.length === 0) return 0;
    
    // Estimate return based on opportunity strength
    const avgStrength = opportunities.reduce((sum, opp) => sum + opp.strength, 0) / opportunities.length;
    return avgStrength * 100; // Convert to percentage
  }

  private calculateMarketPerformance(): number {
    if (this.marketData.length === 0) return 50;
    
    // Performance based on successful trend identification
    const correctTrends = this.marketData.filter(data => {
      const momentum = this.calculateMomentum()[data.chain] || 0;
      return (data.trend === 'BULLISH' && momentum > 0) ||
             (data.trend === 'BEARISH' && momentum < 0) ||
             (data.trend === 'NEUTRAL' && Math.abs(momentum) < 0.02);
    }).length;
    
    return (correctTrends / this.marketData.length) * 100;
  }
}
