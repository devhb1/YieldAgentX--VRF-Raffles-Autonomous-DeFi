/**
 * AI AGENTS INTEGRATION SERVICE
 * 
 * This service integrates the AI agents with the frontend and contracts
 */

import { SmartAIQuotaManager } from './SmartAIQuotaManager';

export class AIAgentsIntegrationService {
  private quotaManager: SmartAIQuotaManager;
  private static instance: AIAgentsIntegrationService;

  private constructor() {
    this.quotaManager = new SmartAIQuotaManager();
    console.log('🤖 AI Agents Integration Service initialized');
  }

  public static getInstance(): AIAgentsIntegrationService {
    if (!AIAgentsIntegrationService.instance) {
      AIAgentsIntegrationService.instance = new AIAgentsIntegrationService();
    }
    return AIAgentsIntegrationService.instance;
  }

  /**
   * Analyze portfolio for a specific agent
   */
  async analyzeAgentPortfolio(agentId: number, portfolioData: any) {
    try {
      console.log(`🔍 Analyzing portfolio for agent ${agentId}`);
      
      const result = await this.quotaManager.makeAIRequest(
        agentId,
        'portfolio_analysis',
        'high', // High priority for real-time analysis
        portfolioData
      );

      console.log(`✅ Analysis complete for agent ${agentId}`);
      return result;
    } catch (error) {
      console.error(`❌ Portfolio analysis failed for agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Get rebalancing recommendations for an agent
   */
  async getRebalanceRecommendations(agentId: number, currentAllocations: any) {
    try {
      console.log(`⚖️ Getting rebalance recommendations for agent ${agentId}`);
      
      const result = await this.quotaManager.makeAIRequest(
        agentId,
        'rebalance',
        'medium', // Medium priority for rebalancing
        currentAllocations
      );

      console.log(`✅ Rebalance recommendations ready for agent ${agentId}`);
      return result;
    } catch (error) {
      console.error(`❌ Rebalance analysis failed for agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Perform risk assessment for an agent
   */
  async assessRisk(agentId: number, riskData: any) {
    try {
      console.log(`🛡️ Assessing risk for agent ${agentId}`);
      
      const result = await this.quotaManager.makeAIRequest(
        agentId,
        'risk_assessment',
        'low', // Low priority for risk assessment
        riskData
      );

      console.log(`✅ Risk assessment complete for agent ${agentId}`);
      return result;
    } catch (error) {
      console.error(`❌ Risk assessment failed for agent ${agentId}:`, error);
      throw error;
    }
  }

  /**
   * Get current AI system status
   */
  getSystemStatus() {
    const quotaStatus = this.quotaManager.getQuotaStatus();
    const cacheStats = this.quotaManager.getCacheStats();
    
    return {
      quota: quotaStatus,
      cache: cacheStats,
      status: 'ACTIVE',
      services: {
        quotaManager: 'RUNNING',
        geminiAI: 'READY',
        fallbackLogic: 'ENABLED'
      }
    };
  }

  /**
   * Manually reset quota (for testing)
   */
  resetQuota() {
    this.quotaManager.resetQuota();
    console.log('🔄 AI quota manually reset');
  }
}

// Export singleton instance
export const aiIntegrationService = AIAgentsIntegrationService.getInstance();

// For backward compatibility
export default aiIntegrationService;
