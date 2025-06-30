// Main AI Service Orchestrator for Multi-Agent DeFi Yield Optimizer
// This service coordinates all AI agents and models
// Now integrates with Google Gemini AI as the primary AI provider

import { BaseAgent } from '../agents/BaseAgent';
import { PortfolioManagerAgent } from '../agents/PortfolioManagerAgent';
import { RiskAnalyzerAgent } from '../agents/RiskAnalyzerAgent';
import { MarketMonitorAgent } from '../agents/MarketMonitorAgent';
import { ModelFactory, BaseModel } from '../models/AIModels';
import { GeminiAIService, createGeminiAIService } from './GeminiAIService';
import { RealTimeAllocationAI, RealTimeAllocationDecision, LivePortfolioData } from './RealTimeAllocationAI';

export interface AIServiceConfig {
  agents: {
    portfolioManager: boolean;
    riskAnalyzer: boolean;
    marketMonitor: boolean;
  };
  models: {
    yieldPrediction: boolean;
    riskAssessment: boolean;
    marketSentiment: boolean;
  };
  updateIntervals: {
    portfolio: number;
    risk: number;
    market: number;
  };
}

export class AIService {
  private agents: Map<string, BaseAgent> = new Map();
  private models: Map<string, BaseModel> = new Map();
  private config: AIServiceConfig;
  private isRunning: boolean = false;
  private geminiService: GeminiAIService | null = null;
  private realTimeAllocationAI: RealTimeAllocationAI | null = null;
  private activeAllocations: Map<string, RealTimeAllocationDecision> = new Map();

  constructor(config: AIServiceConfig) {
    this.config = config;
    try {
      this.geminiService = createGeminiAIService();
      if (this.geminiService) {
        this.realTimeAllocationAI = new RealTimeAllocationAI(this.geminiService);
        console.log('✅ Real-time allocation AI initialized');
      }
    } catch (error) {
      console.warn('Google Gemini service initialization failed, fallback mode enabled:', error);
      // Continue without Gemini service - fallback will be used
    }
    this.initializeAgents();
    this.initializeModels();
  }

  // Public API methods
  public async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('AI Service is already running');
      return;
    }

    console.log('Starting AI Service...');

    // Start all enabled agents
    for (const [agentId, agent] of this.agents) {
      try {
        agent.start();
        console.log(`Started agent: ${agentId}`);
      } catch (error) {
        console.error(`Failed to start agent ${agentId}:`, error);
      }
    }

    this.isRunning = true;
    console.log('AI Service started successfully');
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      console.warn('AI Service is not running');
      return;
    }

    console.log('Stopping AI Service...');

    // Stop all agents
    for (const [agentId, agent] of this.agents) {
      try {
        agent.stop();
        console.log(`Stopped agent: ${agentId}`);
      } catch (error) {
        console.error(`Failed to stop agent ${agentId}:`, error);
      }
    }

    this.isRunning = false;
    console.log('AI Service stopped');
  }

  public getAgentStatus(agentId?: string): any {
    if (agentId) {
      const agent = this.agents.get(agentId);
      return agent ? agent.getStatus() : null;
    }

    // Return status for all agents
    const statuses: any = {};
    for (const [id, agent] of this.agents) {
      statuses[id] = agent.getStatus();
    }
    return statuses;
  }

  public async getAgentDecisions(agentId?: string, limit: number = 10): Promise<any> {
    if (agentId) {
      const agent = this.agents.get(agentId);
      return agent ? agent.getRecentDecisions(limit) : [];
    }

    // Return decisions for all agents
    const decisions: any = {};
    for (const [id, agent] of this.agents) {
      decisions[id] = agent.getRecentDecisions(limit);
    }
    return decisions;
  }

  public async runAnalysis(input: any): Promise<any> {
    const results: any = {};    // Use Google Gemini for enhanced AI analysis
    try {
      console.log('Running AI analysis with Google Gemini...');

      if (!this.geminiService) {
        console.log('Google Gemini not available, skipping AI analysis');
      } else {
        // Portfolio analysis using Gemini
        if (input.portfolioData) {
          results.geminiPortfolio = await this.geminiService.analyzePortfolio(input.portfolioData);
        }

        // Market sentiment using Gemini
        if (input.marketData) {
          results.geminiSentiment = await this.geminiService.analyzeMarketSentiment(input.marketData);
        }

        // Risk assessment using Gemini
        if (input.portfolioData && input.marketData) {
          results.geminiRisk = await this.geminiService.assessRisk(input.portfolioData, input.marketData);
        }
      }

    } catch (error: any) {
      console.error('Google Gemini analysis failed:', error);
      results.geminiError = error?.message || 'Unknown error';
    }

    // Run portfolio analysis
    if (this.agents.has('portfolio-manager')) {
      try {
        const agent = this.agents.get('portfolio-manager')!;
        results.portfolio = await agent.analyze(input.marketData);
      } catch (error: any) {
        console.error('Portfolio analysis failed:', error);
        results.portfolio = { error: error?.message || 'Unknown error' };
      }
    }

    // Run risk analysis
    if (this.agents.has('risk-analyzer')) {
      try {
        const agent = this.agents.get('risk-analyzer')!;
        results.risk = await agent.analyze(input.marketData);
      } catch (error: any) {
        console.error('Risk analysis failed:', error);
        results.risk = { error: error?.message || 'Unknown error' };
      }
    }

    // Run market analysis
    if (this.agents.has('market-monitor')) {
      try {
        const agent = this.agents.get('market-monitor')!;
        results.market = await agent.analyze(input.marketData);
      } catch (error: any) {
        console.error('Market analysis failed:', error);
        results.market = { error: error?.message || 'Unknown error' };
      }
    }

    // Run model predictions
    if (this.models.size > 0) {
      results.models = {};

      for (const [modelId, model] of this.models) {
        try {
          results.models[modelId] = await model.predict(input);
        } catch (error: any) {
          console.error(`Model ${modelId} prediction failed:`, error);
          results.models[modelId] = { error: error?.message || 'Unknown error' };
        }
      }
    }

    return {
      timestamp: Date.now(),
      results,
      metadata: {
        activeAgents: Array.from(this.agents.keys()),
        activeModels: Array.from(this.models.keys()),
        isRunning: this.isRunning,
        aiProvider: 'google-gemini',
        geminiStatus: this.geminiService?.getStatus() || { isConfigured: false, provider: 'google-gemini', error: 'Not initialized' }
      }
    };
  }

  public pauseAgent(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.pause();
      return true;
    }
    return false;
  }

  public resumeAgent(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.resume();
      return true;
    }
    return false;
  }

  public updateAgentConfig(agentId: string, newConfig: any): boolean {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.updateConfig(newConfig);
      return true;
    }
    return false;
  }

  public getServiceHealth(): any {
    const agentHealth: Record<string, any> = {};
    for (const [id, agent] of this.agents) {
      const status = agent.getStatus();
      agentHealth[id] = {
        isActive: status.isActive,
        lastUpdate: status.lastUpdate,
        successRate: status.successRate,
        health: status.successRate > 80 ? 'HEALTHY' : status.successRate > 60 ? 'WARNING' : 'CRITICAL'
      };
    }

    const overallHealth = Object.values(agentHealth).every((health: any) => health.health === 'HEALTHY')
      ? 'HEALTHY'
      : Object.values(agentHealth).some((health: any) => health.health === 'CRITICAL')
      ? 'CRITICAL'
      : 'WARNING';

    return {
      overall: overallHealth,
      isRunning: this.isRunning,
      agents: agentHealth,
      uptime: this.isRunning ? Date.now() - this.startTime : 0,
      lastHealthCheck: Date.now(),
      geminiService: this.geminiService?.getStatus() || { isConfigured: false, provider: 'google-gemini', error: 'Not initialized' }
    };
  }

  /**
   * Test Google Gemini AI connection
   */
  public async testGeminiConnection(): Promise<boolean> {
    try {
      if (!this.geminiService) {
        console.log('Google Gemini service not initialized');
        return false;
      }
      return await this.geminiService.testConnection();
    } catch (error) {
      console.error('Failed to test Gemini connection:', error);
      return false;
    }
  }

  /**
   * Get detailed portfolio analysis using Google Gemini
   */
  public async getGeminiPortfolioAnalysis(portfolioData: any): Promise<any> {
    try {
      if (!this.geminiService) {
        throw new Error('Google Gemini service not initialized');
      }
      return await this.geminiService.analyzePortfolio(portfolioData);
    } catch (error) {
      console.error('Gemini portfolio analysis failed:', error);
      throw error;
    }
  }

  /**
   * Get market sentiment analysis using Google Gemini
   */
  public async getGeminiMarketSentiment(marketData: any[]): Promise<any> {
    try {
      if (!this.geminiService) {
        throw new Error('Google Gemini service not initialized');
      }
      return await this.geminiService.analyzeMarketSentiment(marketData);
    } catch (error) {
      console.error('Gemini market sentiment analysis failed:', error);
      throw error;
    }
  }

  /**
   * Generate real-time allocation decision for portfolio agent
   */
  public async generateAllocationDecision(
    agentId: string,
    strategy: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE'
  ): Promise<RealTimeAllocationDecision | null> {
    if (!this.realTimeAllocationAI) {
      console.error('Real-time allocation AI not available');
      return null;
    }

    try {
      console.log(`🤖 Generating allocation decision for agent ${agentId}`);
      
      // Get current portfolio data
      const portfolioData = await this.realTimeAllocationAI.getLivePortfolioData(agentId);
      
      if (portfolioData.length === 0) {
        console.warn(`No portfolio data found for agent ${agentId}`);
        return null;
      }

      // Generate allocation decision
      const decision = await this.realTimeAllocationAI.generateAllocationDecision(
        agentId,
        strategy,
        portfolioData
      );

      // Store active allocation for tracking
      this.activeAllocations.set(agentId, decision);

      console.log(`✅ Generated allocation decision for agent ${agentId}:`, {
        chains: decision.chainAllocations.length,
        expectedYield: decision.expectedTotalYield,
        confidence: decision.confidence
      });

      return decision;

    } catch (error: any) {
      console.error(`❌ Failed to generate allocation decision for agent ${agentId}:`, error);
      return null;
    }
  }

  /**
   * Execute allocation decision on-chain
   */
  public async executeAllocationDecision(
    agentId: string,
    signer: any
  ): Promise<{ success: boolean; txHashes: string[]; errors: string[] }> {
    if (!this.realTimeAllocationAI) {
      return { success: false, txHashes: [], errors: ['Real-time allocation AI not available'] };
    }

    const decision = this.activeAllocations.get(agentId);
    if (!decision) {
      return { success: false, txHashes: [], errors: ['No active allocation decision found'] };
    }

    try {
      console.log(`🔄 Executing allocation decision for agent ${agentId}`);
      
      const result = await this.realTimeAllocationAI.executeAllocationDecision(decision, signer);
      
      if (result.success) {
        console.log(`✅ Successfully executed allocation for agent ${agentId}:`, result.txHashes);
      } else {
        console.error(`❌ Allocation execution failed for agent ${agentId}:`, result.errors);
      }

      return result;

    } catch (error: any) {
      console.error(`❌ Failed to execute allocation for agent ${agentId}:`, error);
      return { success: false, txHashes: [], errors: [error.message] };
    }
  }

  /**
   * Get live portfolio data for agent
   */
  public async getLivePortfolioData(agentId: string): Promise<LivePortfolioData[]> {
    if (!this.realTimeAllocationAI) {
      console.error('Real-time allocation AI not available');
      return [];
    }

    try {
      return await this.realTimeAllocationAI.getLivePortfolioData(agentId);
    } catch (error: any) {
      console.error(`❌ Failed to get live portfolio data for agent ${agentId}:`, error);
      return [];
    }
  }

  /**
   * Start live yield monitoring for agent
   */
  public async startYieldMonitoring(agentId: string): Promise<void> {
    if (!this.realTimeAllocationAI) {
      console.error('Real-time allocation AI not available');
      return;
    }

    try {
      console.log(`📊 Starting yield monitoring for agent ${agentId}`);
      await this.realTimeAllocationAI.monitorLiveYields(agentId);
    } catch (error: any) {
      console.error(`❌ Failed to start yield monitoring for agent ${agentId}:`, error);
    }
  }

  /**
   * Get active allocation decisions
   */
  public getActiveAllocations(): Map<string, RealTimeAllocationDecision> {
    return new Map(this.activeAllocations);
  }

  // Private methods
  private startTime: number = Date.now();

  private initializeAgents(): void {
    // Initialize Portfolio Manager Agent
    if (this.config.agents.portfolioManager) {
      const agent = new PortfolioManagerAgent({
        name: 'Portfolio Manager',
        description: 'Manages portfolio allocation and rebalancing',
        capabilities: ['portfolio-optimization', 'rebalancing', 'yield-analysis'],
        riskTolerance: 70,
        updateInterval: this.config.updateIntervals.portfolio,
        maxExecutionsPerHour: 5,
        enabled: true
      });
      this.agents.set('portfolio-manager', agent);
    }

    // Initialize Risk Analyzer Agent
    if (this.config.agents.riskAnalyzer) {
      const agent = new RiskAnalyzerAgent({
        name: 'Risk Analyzer',
        description: 'Analyzes and manages portfolio risk',
        capabilities: ['risk-assessment', 'volatility-analysis', 'protocol-security'],
        riskTolerance: 80,
        updateInterval: this.config.updateIntervals.risk,
        maxExecutionsPerHour: 10,
        enabled: true
      });
      this.agents.set('risk-analyzer', agent);
    }

    // Initialize Market Monitor Agent
    if (this.config.agents.marketMonitor) {
      const agent = new MarketMonitorAgent({
        name: 'Market Monitor',
        description: 'Monitors market conditions and identifies opportunities',
        capabilities: ['market-analysis', 'trend-detection', 'opportunity-identification'],
        riskTolerance: 60,
        updateInterval: this.config.updateIntervals.market,
        maxExecutionsPerHour: 20,
        enabled: true
      });
      this.agents.set('market-monitor', agent);
    }
  }

  private initializeModels(): void {
    // Initialize Yield Prediction Model
    if (this.config.models.yieldPrediction) {
      const model = ModelFactory.createModel('yield-prediction', {
        modelId: 'yield-predictor-v1',
        name: 'Yield Prediction Model',
        type: 'regression',
        enabled: true
      });
      this.models.set('yield-prediction', model);
    }

    // Initialize Risk Assessment Model
    if (this.config.models.riskAssessment) {
      const model = ModelFactory.createModel('risk-assessment', {
        modelId: 'risk-assessor-v1',
        name: 'Risk Assessment Model',
        type: 'classification',
        enabled: true
      });
      this.models.set('risk-assessment', model);
    }

    // Initialize Market Sentiment Model
    if (this.config.models.marketSentiment) {
      const model = ModelFactory.createModel('market-sentiment', {
        modelId: 'sentiment-analyzer-v1',
        name: 'Market Sentiment Model',
        type: 'classification',
        enabled: true
      });
      this.models.set('market-sentiment', model);
    }
  }
}

// Default configuration
export const defaultAIConfig: AIServiceConfig = {
  agents: {
    portfolioManager: true,
    riskAnalyzer: true,
    marketMonitor: true
  },
  models: {
    yieldPrediction: true,
    riskAssessment: true,
    marketSentiment: true
  },
  updateIntervals: {
    portfolio: 30000, // 30 seconds
    risk: 15000,      // 15 seconds
    market: 10000     // 10 seconds
  }
};

// Factory function to create AI service
export function createAIService(config?: Partial<AIServiceConfig>): AIService {
  const finalConfig = { ...defaultAIConfig, ...config };
  return new AIService(finalConfig);
}

// Export main service instance
export const aiService = createAIService();
