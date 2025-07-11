/**
 * Agent Configuration Manager
 * Optimized settings to prevent API quota exhaustion
 */

export const OPTIMIZED_AGENT_CONFIGS = {
    // Reduce update frequency to prevent quota exhaustion
    PORTFOLIO_MANAGER: {
        name: 'Portfolio Manager',
        description: 'AI-powered portfolio optimization and rebalancing',
        capabilities: ['portfolio_analysis', 'risk_assessment', 'yield_optimization'],
        riskTolerance: 70,
        updateInterval: 300000, // 5 minutes instead of frequent updates
        maxExecutionsPerHour: 2, // Reduced from higher frequency
        enabled: true,
        aiRequestLimit: 1, // Max 1 AI request per cycle
        useMockWhenQuotaExhausted: true
    },

    RISK_ANALYZER: {
        name: 'Risk Analyzer',
        description: 'Comprehensive risk assessment and monitoring',
        capabilities: ['risk_analysis', 'volatility_tracking', 'exposure_monitoring'],
        riskTolerance: 85,
        updateInterval: 600000, // 10 minutes
        maxExecutionsPerHour: 1, // Very conservative
        enabled: true,
        aiRequestLimit: 0, // Use rule-based analysis primarily
        useMockWhenQuotaExhausted: true
    },

    MARKET_MONITOR: {
        name: 'Market Monitor',
        description: 'Real-time market sentiment and trend analysis',
        capabilities: ['market_analysis', 'sentiment_tracking', 'trend_detection'],
        riskTolerance: 60,
        updateInterval: 900000, // 15 minutes
        maxExecutionsPerHour: 1, // Minimal frequency
        enabled: true,
        aiRequestLimit: 0, // Use market data APIs instead of AI
        useMockWhenQuotaExhausted: true
    }
};

export const QUOTA_SAFE_SETTINGS = {
    // Overall system limits
    MAX_AI_REQUESTS_PER_HOUR: 2,
    MAX_AI_REQUESTS_PER_DAY: 30, // Well below 50 limit
    MIN_REQUEST_INTERVAL: 5000, // 5 seconds between AI requests
    BURST_PROTECTION: true,

    // Fallback strategies
    USE_RULE_BASED_ANALYSIS: true,
    USE_MARKET_DATA_APIS: true,
    ENABLE_MOCK_RESPONSES: true,

    // Provider optimization
    REDUCE_BLOCKCHAIN_POLLING: true,
    USE_CACHED_DATA: true,
    OPTIMIZE_FILTER_MANAGEMENT: true
};

export function getOptimizedConfig(agentType: string) {
    return OPTIMIZED_AGENT_CONFIGS[agentType as keyof typeof OPTIMIZED_AGENT_CONFIGS] || null;
}

export function shouldUseAI(agentType: string, currentHour: number): boolean {
    const config = getOptimizedConfig(agentType);
    if (!config || config.aiRequestLimit === 0) {
        return false;
    }

    // Only use AI during peak hours (9 AM - 5 PM UTC)
    const isPeakHour = currentHour >= 9 && currentHour <= 17;

    return isPeakHour && Math.random() < 0.3; // 30% chance even during peak hours
}
