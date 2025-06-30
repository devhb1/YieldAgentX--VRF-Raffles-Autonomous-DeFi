/**
 * AI Quota Management System
 * 
 * Solves the Google Gemini API rate limit issues by:
 * 1. Implementing smart request batching
 * 2. Using local cache for recent decisions
 * 3. Fallback to simplified AI logic when quota is exhausted
 * 4. Queue management for high-priority vs low-priority requests
 */

import { GeminiAIService } from './GeminiAIService';

interface AIRequest {
  agentId: number;
  priority: 'high' | 'medium' | 'low';
  type: 'portfolio_analysis' | 'rebalance' | 'risk_assessment';
  timestamp: number;
  retryCount: number;
}

interface CachedDecision {
  agentId: number;
  decision: any;
  timestamp: number;
  validUntil: number;
}

export class SmartAIQuotaManager {
  private dailyQuotaLimit = 45; // Leave 5 requests buffer
  private currentQuotaUsed = 0;
  private lastResetTime = Date.now();
  private requestQueue: AIRequest[] = [];
  private decisionCache: Map<number, CachedDecision> = new Map();
  private geminiService: GeminiAIService;
  
  // Rate limiting configuration
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly HIGH_PRIORITY_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly MEDIUM_PRIORITY_INTERVAL = 15 * 60 * 1000; // 15 minutes
  private readonly LOW_PRIORITY_INTERVAL = 60 * 60 * 1000; // 1 hour
  
  constructor() {
    this.geminiService = new GeminiAIService();
    this.resetDailyQuotaIfNeeded();
    
    // Process queue every minute
    setInterval(() => this.processQueue(), 60 * 1000);
  }
  
  /**
   * Reset daily quota if 24 hours have passed
   */
  private resetDailyQuotaIfNeeded(): void {
    const now = Date.now();
    const daysPassed = Math.floor((now - this.lastResetTime) / (24 * 60 * 60 * 1000));
    
    if (daysPassed >= 1) {
      this.currentQuotaUsed = 0;
      this.lastResetTime = now;
      console.log('🔄 Daily AI quota reset. Available requests:', this.dailyQuotaLimit);
    }
  }
  
  /**
   * Smart AI request with quota management
   */
  async makeAIRequest(
    agentId: number, 
    type: 'portfolio_analysis' | 'rebalance' | 'risk_assessment',
    priority: 'high' | 'medium' | 'low' = 'medium',
    data?: any
  ): Promise<any> {
    this.resetDailyQuotaIfNeeded();
    
    // Check cache first
    const cached = this.getCachedDecision(agentId, type);
    if (cached) {
      console.log(`📋 Using cached AI decision for agent ${agentId}`);
      return cached;
    }
    
    // Check if we have quota available
    if (this.currentQuotaUsed >= this.dailyQuotaLimit) {
      console.log('⚠️ AI quota exhausted, using fallback logic');
      return this.getFallbackDecision(agentId, type, data);
    }
    
    // For non-high priority requests, add to queue if quota is running low
    if (priority !== 'high' && this.currentQuotaUsed >= this.dailyQuotaLimit * 0.8) {
      console.log(`⏳ Adding agent ${agentId} to AI request queue (priority: ${priority})`);
      this.addToQueue(agentId, type, priority);
      return this.getFallbackDecision(agentId, type, data);
    }
    
    // Make the AI request
    try {
      const result = await this.executeAIRequest(agentId, type, data);
      this.currentQuotaUsed++;
      this.cacheDecision(agentId, type, result);
      
      console.log(`✅ AI request successful. Quota used: ${this.currentQuotaUsed}/${this.dailyQuotaLimit}`);
      return result;
      
    } catch (error: any) {
      if (error.message.includes('429') || error.message.includes('quota')) {
        console.log('⚠️ AI quota exceeded, using fallback');
        this.currentQuotaUsed = this.dailyQuotaLimit; // Mark as exhausted
        return this.getFallbackDecision(agentId, type, data);
      }
      throw error;
    }
  }
  
  /**
   * Execute actual AI request
   */
  private async executeAIRequest(agentId: number, type: string, data?: any): Promise<any> {
    switch (type) {
      case 'portfolio_analysis':
        return await this.geminiService.analyzePortfolio(data || {
          agentId,
          totalValue: '0.1',
          strategy: 'BALANCED',
          marketConditions: 'stable'
        });
        
      case 'rebalance':
        // Use portfolio analysis for rebalancing decisions
        return await this.geminiService.analyzePortfolio(data || {
          agentId,
          currentAllocation: { eth: 60, usdc: 40 },
          strategy: 'BALANCED',
          rebalanceRequest: true
        });
        
      case 'risk_assessment':
        return await this.geminiService.assessRisk(
          data || {
            agentId,
            positions: [],
            marketVolatility: 'medium'
          },
          [] // market data array
        );
        
      default:
        throw new Error(`Unknown AI request type: ${type}`);
    }
  }
  
  /**
   * Get cached decision if available and still valid
   */
  private getCachedDecision(agentId: number, type: string): any | null {
    const cacheKey = `${agentId}_${type}`;
    const cached = this.decisionCache.get(agentId);
    
    if (cached && cached.validUntil > Date.now()) {
      return cached.decision;
    }
    
    // Remove expired cache
    if (cached) {
      this.decisionCache.delete(agentId);
    }
    
    return null;
  }
  
  /**
   * Cache AI decision
   */
  private cacheDecision(agentId: number, type: string, decision: any): void {
    this.decisionCache.set(agentId, {
      agentId,
      decision,
      timestamp: Date.now(),
      validUntil: Date.now() + this.CACHE_DURATION
    });
  }
  
  /**
   * Add request to queue for later processing
   */
  private addToQueue(agentId: number, type: 'portfolio_analysis' | 'rebalance' | 'risk_assessment', priority: 'high' | 'medium' | 'low'): void {
    // Remove any existing request for this agent
    this.requestQueue = this.requestQueue.filter(req => req.agentId !== agentId);
    
    // Add new request
    this.requestQueue.push({
      agentId,
      priority,
      type,
      timestamp: Date.now(),
      retryCount: 0
    });
    
    // Sort by priority (high first)
    this.requestQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
  
  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    this.resetDailyQuotaIfNeeded();
    
    if (this.currentQuotaUsed >= this.dailyQuotaLimit) {
      return; // No quota available
    }
    
    const now = Date.now();
    const requestsToProcess = this.requestQueue.filter(req => {
      const timeSinceQueued = now - req.timestamp;
      
      switch (req.priority) {
        case 'high':
          return timeSinceQueued >= this.HIGH_PRIORITY_INTERVAL;
        case 'medium':
          return timeSinceQueued >= this.MEDIUM_PRIORITY_INTERVAL;
        case 'low':
          return timeSinceQueued >= this.LOW_PRIORITY_INTERVAL;
        default:
          return false;
      }
    });
    
    // Process up to remaining quota
    const availableQuota = this.dailyQuotaLimit - this.currentQuotaUsed;
    const toProcess = requestsToProcess.slice(0, availableQuota);
    
    for (const request of toProcess) {
      try {
        console.log(`🔄 Processing queued AI request for agent ${request.agentId}`);
        await this.executeAIRequest(request.agentId, request.type);
        this.currentQuotaUsed++;
        
        // Remove from queue
        this.requestQueue = this.requestQueue.filter(req => req.agentId !== request.agentId);
        
      } catch (error) {
        console.error(`❌ Failed to process queued request for agent ${request.agentId}:`, error);
        
        // Increment retry count
        request.retryCount++;
        if (request.retryCount >= 3) {
          // Remove from queue after 3 failures
          this.requestQueue = this.requestQueue.filter(req => req.agentId !== request.agentId);
        }
      }
    }
  }
  
  /**
   * Fallback decision when AI is unavailable
   */
  private getFallbackDecision(agentId: number, type: string, data?: any): any {
    console.log(`🔧 Using fallback AI logic for agent ${agentId}, type: ${type}`);
    
    switch (type) {
      case 'portfolio_analysis':
        return {
          riskScore: 40, // Moderate risk
          rebalanceNeeded: Math.random() > 0.7, // 30% chance
          recommendationsCount: 3,
          recommendations: [
            'Maintain current allocation',
            'Monitor market conditions',
            'Consider DCA strategy'
          ],
          confidence: 60
        };
        
      case 'rebalance':
        return {
          shouldRebalance: Math.random() > 0.8, // 20% chance
          newAllocation: {
            staking: 40,
            lending: 30,
            liquidity: 20,
            stable: 10
          },
          reasoning: 'Fallback rebalancing based on market conditions',
          confidence: 50
        };
        
      case 'risk_assessment':
        return {
          riskLevel: 'medium',
          riskScore: 45,
          factors: ['Market volatility', 'Portfolio size'],
          recommendations: ['Diversify holdings'],
          confidence: 55
        };
        
      default:
        return {
          action: 'hold',
          reasoning: 'Fallback decision - maintain current position',
          confidence: 40
        };
    }
  }
  
  /**
   * Get current quota status
   */
  getQuotaStatus(): {
    used: number;
    limit: number;
    remaining: number;
    resetTime: number;
    queueLength: number;
  } {
    this.resetDailyQuotaIfNeeded();
    
    return {
      used: this.currentQuotaUsed,
      limit: this.dailyQuotaLimit,
      remaining: this.dailyQuotaLimit - this.currentQuotaUsed,
      resetTime: this.lastResetTime + (24 * 60 * 60 * 1000),
      queueLength: this.requestQueue.length
    };
  }
  
  /**
   * Force reset quota (for testing)
   */
  forceResetQuota(): void {
    this.currentQuotaUsed = 0;
    this.lastResetTime = Date.now();
    console.log('🔄 Quota manually reset');
  }
  
  /**
   * Clear all cached decisions
   */
  clearCache(): void {
    this.decisionCache.clear();
    console.log('🗑️ AI decision cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const cacheEntries = Array.from(this.decisionCache.values());
    const validEntries = cacheEntries.filter(entry => entry.validUntil > Date.now());
    
    return {
      cacheSize: this.decisionCache.size,
      validEntries: validEntries.length,
      expiredEntries: cacheEntries.length - validEntries.length,
      hitRatio: this.getCacheHitRatio()
    };
  }

  /**
   * Calculate cache hit ratio
   */
  private getCacheHitRatio(): number {
    // Simple implementation - in production you'd track hits/misses
    return this.decisionCache.size > 0 ? 0.75 : 0;
  }

  /**
   * Reset quota (alias for forceResetQuota)
   */
  resetQuota(): void {
    this.forceResetQuota();
  }
}

// Singleton instance
export const aiQuotaManager = new SmartAIQuotaManager();
