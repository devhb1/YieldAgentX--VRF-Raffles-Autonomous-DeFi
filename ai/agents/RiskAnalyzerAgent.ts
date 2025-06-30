import { BaseAgent, AgentConfig, AgentDecision, AgentStatus, MarketData } from './BaseAgent';

export class RiskAnalyzerAgent extends BaseAgent {
  private riskMetrics: any = null;
  private riskThresholds = {
    low: 0.3,
    medium: 0.6,
    high: 0.8
  };

  constructor(config: AgentConfig) {
    super(config);
  }

  async analyze(marketData?: MarketData[]): Promise<AgentDecision> {
    try {
      // Update risk metrics
      await this.updateRiskMetrics(marketData);
      
      // Analyze current risk level
      const riskAnalysis = this.analyzeRiskLevel();
      
      // Determine appropriate action
      const decision = this.determineRiskAction(riskAnalysis);
      
      // Calculate confidence based on risk clarity
      const confidence = this.calculateRiskConfidence(riskAnalysis);
      
      const agentDecision: AgentDecision = {
        agentId: 'risk-analyzer',
        agentName: this.config.name,
        decision,
        confidence,
        reasoning: this.generateRiskReasoning(riskAnalysis),
        recommendedAction: this.generateRiskAction(riskAnalysis, decision),
        timestamp: Date.now(),
        executionCost: decision !== 'HOLD' ? this.estimateRiskActionCost() : 0
      };

      return agentDecision;
    } catch (error) {
      console.error('Risk analysis failed:', error);
      throw error;
    }
  }

  async execute(decision: AgentDecision): Promise<boolean> {
    if (decision.decision === 'HOLD') {
      return true; // No action needed
    }

    try {
      console.log(`Executing risk management action: ${decision.recommendedAction}`);
      
      // In a real implementation, this would:
      // 1. Adjust position sizes based on risk
      // 2. Set stop-losses or take-profits
      // 3. Diversify across protocols
      // 4. Hedge positions if needed
      
      // Simulate execution
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Risk management typically has higher success rate
      const success = Math.random() > 0.05; // 95% success rate
      
      if (success) {
        console.log('Risk management action executed successfully');
        await this.updateRiskMetrics(); // Refresh risk state
      } else {
        console.error('Risk management action failed');
      }
      
      return success;
    } catch (error) {
      console.error('Risk execution failed:', error);
      return false;
    }
  }

  getStatus(): AgentStatus {
    const recentDecisions = this.getRecentDecisions();
    const riskActions = recentDecisions.filter(d => d.decision !== 'HOLD').length;
    
    return {
      id: 'risk-analyzer',
      name: this.config.name,
      isActive: this.isActive,
      lastUpdate: this.lastUpdate,
      executionCount: this.executionCount,
      recentPerformance: this.calculateRiskScore(),
      totalDecisions: this.decisions.length,
      successRate: this.decisions.length > 0 ? ((this.decisions.length - riskActions) / this.decisions.length) * 100 : 0
    };
  }

  // Risk-specific public methods
  public getCurrentRiskLevel(): string {
    if (!this.riskMetrics) return 'UNKNOWN';
    
    const { overallRisk } = this.riskMetrics;
    if (overallRisk <= this.riskThresholds.low) return 'LOW';
    if (overallRisk <= this.riskThresholds.medium) return 'MEDIUM';
    if (overallRisk <= this.riskThresholds.high) return 'HIGH';
    return 'EXTREME';
  }

  public getRiskBreakdown(): any {
    return this.riskMetrics;
  }

  // Private helper methods
  private async updateRiskMetrics(marketData?: MarketData[]): Promise<void> {
    // Simulate fetching risk data from multiple sources
    const volatilityRisk = this.calculateVolatilityRisk(marketData);
    const liquidityRisk = this.calculateLiquidityRisk();
    const protocolRisk = this.calculateProtocolRisk();
    const concentrationRisk = this.calculateConcentrationRisk();
    
    this.riskMetrics = {
      volatilityRisk,
      liquidityRisk,
      protocolRisk,
      concentrationRisk,
      overallRisk: (volatilityRisk + liquidityRisk + protocolRisk + concentrationRisk) / 4,
      timestamp: Date.now()
    };
  }

  private calculateVolatilityRisk(marketData?: MarketData[]): number {
    if (!marketData || marketData.length === 0) {
      // Default volatility assumption
      return 0.3 + Math.random() * 0.4; // 0.3-0.7
    }

    // Calculate average volatility across markets
    const avgVolatility = marketData.reduce((sum, data) => sum + data.volatility, 0) / marketData.length;
    
    // Normalize to 0-1 scale
    return Math.min(1, avgVolatility);
  }

  private calculateLiquidityRisk(): number {
    // Simulate liquidity analysis across protocols
    const protocols = ['aave', 'compound', 'uniswap', 'curve'];
    
    let totalLiquidityScore = 0;
    protocols.forEach(protocol => {
      // Simulate liquidity metrics
      const tvl = Math.random() * 10000000; // $0-10M TVL
      const volume24h = Math.random() * 1000000; // $0-1M volume
      
      // Higher TVL and volume = lower liquidity risk
      const liquidityScore = Math.min(1, (tvl + volume24h) / 5000000);
      totalLiquidityScore += (1 - liquidityScore); // Invert for risk
    });

    return totalLiquidityScore / protocols.length;
  }

  private calculateProtocolRisk(): number {
    // Simulate protocol risk assessment
    const protocolFactors = {
      auditScore: Math.random(), // 0-1, higher is better
      timeInOperation: Math.random(), // 0-1, higher is better
      totalValueLocked: Math.random(), // 0-1, higher is better
      governanceRisk: Math.random() // 0-1, higher is worse
    };

    // Calculate composite protocol risk
    const riskScore = (
      (1 - protocolFactors.auditScore) * 0.3 +
      (1 - protocolFactors.timeInOperation) * 0.2 +
      (1 - protocolFactors.totalValueLocked) * 0.2 +
      protocolFactors.governanceRisk * 0.3
    );

    return Math.min(1, Math.max(0, riskScore));
  }

  private calculateConcentrationRisk(): number {
    // Simulate portfolio concentration analysis
    const allocations = [0.4, 0.3, 0.2, 0.1]; // Simulated allocation percentages
    
    // Calculate Herfindahl index for concentration
    const herfindahlIndex = allocations.reduce((sum, allocation) => sum + allocation * allocation, 0);
    
    // Convert to risk score (higher concentration = higher risk)
    return Math.min(1, herfindahlIndex * 2);
  }

  private analyzeRiskLevel(): any {
    if (!this.riskMetrics) return null;

    const { overallRisk, volatilityRisk, liquidityRisk, protocolRisk, concentrationRisk } = this.riskMetrics;
    
    return {
      level: this.getCurrentRiskLevel(),
      score: overallRisk,
      breakdown: {
        volatility: volatilityRisk,
        liquidity: liquidityRisk,
        protocol: protocolRisk,
        concentration: concentrationRisk
      },
      trending: this.calculateRiskTrend(),
      alerts: this.generateRiskAlerts()
    };
  }

  private determineRiskAction(analysis: any): 'BUY' | 'SELL' | 'HOLD' | 'REBALANCE' {
    if (!analysis) return 'HOLD';

    const { score, level } = analysis;

    if (level === 'EXTREME' || score > 0.9) {
      return 'SELL'; // Reduce exposure
    } else if (level === 'HIGH' || score > 0.7) {
      return 'REBALANCE'; // Adjust allocations
    } else if (level === 'LOW' || score < 0.3) {
      return 'BUY'; // Can increase exposure
    }

    return 'HOLD';
  }

  private calculateRiskConfidence(analysis: any): number {
    if (!analysis) return 0;

    let confidence = 75; // Base confidence

    // Higher confidence for extreme risk levels (clear signals)
    if (analysis.level === 'EXTREME' || analysis.level === 'LOW') {
      confidence += 15;
    }

    // Lower confidence for medium risk (unclear signals)
    if (analysis.level === 'MEDIUM') {
      confidence -= 10;
    }

    // Adjust based on data quality and trend clarity
    if (analysis.trending !== 'UNCLEAR') {
      confidence += 10;
    }

    return Math.min(100, Math.max(0, confidence));
  }

  private generateRiskReasoning(analysis: any): string {
    if (!analysis) return 'Unable to assess risk metrics';

    const { level, score, breakdown } = analysis;
    
    const riskFactors = Object.entries(breakdown as { [key: string]: number })
      .filter(([_, value]) => (value as number) > 0.6)
      .map(([factor, _]) => factor);

    if (level === 'EXTREME') {
      return `EXTREME RISK DETECTED: Overall risk score ${(score * 100).toFixed(1)}%. Critical risk factors: ${riskFactors.join(', ')}. Immediate action required to protect portfolio.`;
    } else if (level === 'HIGH') {
      return `HIGH RISK: Risk score ${(score * 100).toFixed(1)}%. Elevated risk in: ${riskFactors.join(', ')}. Consider reducing exposure or rebalancing.`;
    } else if (level === 'MEDIUM') {
      return `MODERATE RISK: Risk score ${(score * 100).toFixed(1)}%. Monitoring ${riskFactors.length > 0 ? riskFactors.join(', ') : 'all metrics'}. Portfolio within acceptable risk parameters.`;
    } else {
      return `LOW RISK: Risk score ${(score * 100).toFixed(1)}%. All risk metrics within safe ranges. Opportunity to increase strategic positions.`;
    }
  }

  private generateRiskAction(analysis: any, decision: string): string | undefined {
    if (!analysis || decision === 'HOLD') return undefined;

    const { breakdown } = analysis;
    const highestRisk = Object.entries(breakdown as { [key: string]: number })
      .reduce((max, [factor, value]) => (value as number) > max.value ? { factor, value: value as number } : max, { factor: '', value: 0 });

    switch (decision) {
      case 'SELL':
        return `Reduce overall portfolio exposure by 20-30%. Priority: address ${highestRisk.factor} risk.`;
      case 'REBALANCE':
        return `Rebalance to reduce ${highestRisk.factor} exposure. Diversify across lower-risk protocols.`;
      case 'BUY':
        return `Safe to increase positions. Focus on high-quality, low-risk protocols.`;
      default:
        return undefined;
    }
  }

  private calculateRiskTrend(): string {
    // Simulate trend analysis based on recent decisions
    const recentDecisions = this.getRecentDecisions(5);
    
    if (recentDecisions.length < 3) return 'UNCLEAR';
    
    const riskActions = recentDecisions.filter(d => d.decision === 'SELL' || d.decision === 'REBALANCE').length;
    const safeActions = recentDecisions.filter(d => d.decision === 'BUY' || d.decision === 'HOLD').length;
    
    if (riskActions > safeActions) return 'INCREASING';
    if (safeActions > riskActions) return 'DECREASING';
    return 'STABLE';
  }

  private generateRiskAlerts(): string[] {
    const alerts: string[] = [];
    
    if (!this.riskMetrics) return alerts;

    const { volatilityRisk, liquidityRisk, protocolRisk, concentrationRisk } = this.riskMetrics;

    if (volatilityRisk > 0.8) alerts.push('High market volatility detected');
    if (liquidityRisk > 0.7) alerts.push('Liquidity concerns in some protocols');
    if (protocolRisk > 0.6) alerts.push('Protocol security risks identified');
    if (concentrationRisk > 0.7) alerts.push('Portfolio over-concentrated');

    return alerts;
  }

  private estimateRiskActionCost(): number {
    // Risk management actions are typically lower cost
    return Math.random() * 25 + 5; // $5-30 in fees
  }

  private calculateRiskScore(): number {
    if (!this.riskMetrics) return 50;
    
    // Invert risk score for performance (lower risk = higher performance)
    return Math.max(0, (1 - this.riskMetrics.overallRisk) * 100);
  }
}
