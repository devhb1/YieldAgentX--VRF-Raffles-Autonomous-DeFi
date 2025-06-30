// Base Agent Implementation for Multi-Agent DeFi Yield Optimizer
// This is the foundation for all AI agents in the system

export interface AgentConfig {
  name: string;
  description: string;
  capabilities: string[];
  riskTolerance: number; // 0-100
  updateInterval: number; // in milliseconds
  maxExecutionsPerHour: number;
  enabled: boolean;
}

export interface AgentDecision {
  agentId: string;
  agentName: string;
  decision: 'BUY' | 'SELL' | 'HOLD' | 'REBALANCE';
  confidence: number; // 0-100
  reasoning: string;
  recommendedAction?: string;
  timestamp: number;
  executionCost?: number;
  expectedReturn?: number;
}

export interface MarketData {
  price: number;
  volume: number;
  volatility: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  chain: string;
  timestamp: number;
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected isActive: boolean = false;
  protected lastUpdate: Date;
  protected executionCount: number = 0;
  protected lastExecutionReset: Date;
  protected decisions: AgentDecision[] = [];

  constructor(config: AgentConfig) {
    this.config = config;
    this.lastUpdate = new Date();
    this.lastExecutionReset = new Date();
  }

  // Abstract methods that each agent must implement
  abstract analyze(marketData?: MarketData[]): Promise<AgentDecision>;
  abstract execute(decision: AgentDecision): Promise<boolean>;
  abstract getStatus(): AgentStatus;

  // Common agent lifecycle methods
  public start(): void {
    if (!this.config.enabled) {
      console.warn(`Agent ${this.config.name} is disabled`);
      return;
    }
    
    this.isActive = true;
    this.scheduleUpdates();
    console.log(`Agent ${this.config.name} started`);
  }

  public stop(): void {
    this.isActive = false;
    console.log(`Agent ${this.config.name} stopped`);
  }

  public pause(): void {
    this.isActive = false;
    console.log(`Agent ${this.config.name} paused`);
  }

  public resume(): void {
    if (this.config.enabled) {
      this.isActive = true;
      this.scheduleUpdates();
      console.log(`Agent ${this.config.name} resumed`);
    }
  }

  // Get agent configuration
  public getConfig(): AgentConfig {
    return { ...this.config };
  }

  // Update agent configuration
  public updateConfig(newConfig: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get recent decisions
  public getRecentDecisions(limit: number = 10): AgentDecision[] {
    return this.decisions.slice(-limit);
  }

  // Private methods
  private scheduleUpdates(): void {
    if (!this.isActive) return;
    
    setTimeout(async () => {
      try {
        // Check execution limits
        if (!this.canExecute()) {
          console.log(`Agent ${this.config.name} execution limit reached`);
          this.scheduleUpdates();
          return;
        }

        // Analyze market conditions
        const decision = await this.analyze();
        
        // Store decision
        this.decisions.push(decision);
        
        // Execute if confidence is high enough
        if (decision.confidence >= this.config.riskTolerance) {
          const success = await this.execute(decision);
          if (success) {
            this.executionCount++;
          }
        }
        
        this.lastUpdate = new Date();
      } catch (error) {
        console.error(`Agent ${this.config.name} error:`, error);
      }
      
      // Schedule next update if still active
      if (this.isActive) {
        this.scheduleUpdates();
      }
    }, this.config.updateInterval);
  }

  private canExecute(): boolean {
    const now = new Date();
    const hoursSinceReset = (now.getTime() - this.lastExecutionReset.getTime()) / (1000 * 60 * 60);
    
    // Reset counter if more than an hour has passed
    if (hoursSinceReset >= 1) {
      this.executionCount = 0;
      this.lastExecutionReset = now;
    }
    
    return this.executionCount < this.config.maxExecutionsPerHour;
  }
}

export interface AgentStatus {
  id: string;
  name: string;
  isActive: boolean;
  lastUpdate: Date;
  executionCount: number;
  recentPerformance: number;
  totalDecisions: number;
  successRate: number;
}

// Agent factory for creating different types of agents
export class AgentFactory {
  static createAgent(type: string, config: AgentConfig): BaseAgent {
    switch (type) {
      case 'portfolio-manager':
        return new PortfolioManagerAgent(config);
      case 'risk-analyzer':
        return new RiskAnalyzerAgent(config);
      case 'market-monitor':
        return new MarketMonitorAgent(config);
      default:
        throw new Error(`Unknown agent type: ${type}`);
    }
  }
}

// Import specific agent implementations (to be created)
import { PortfolioManagerAgent } from './PortfolioManagerAgent';
import { RiskAnalyzerAgent } from './RiskAnalyzerAgent';
import { MarketMonitorAgent } from './MarketMonitorAgent';
