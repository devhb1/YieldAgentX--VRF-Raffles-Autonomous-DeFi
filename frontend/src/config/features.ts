/**
 * Application Feature Configuration
 * Toggle features on/off by changing the boolean values
 * This allows easy enabling/disabling of entire sections
 */

export const APP_CONFIG = {
  // Core Features (Always Required)
  core: {
    wallet: true,           // Web3 wallet connection
    navigation: true,       // App navigation
    dashboard: true,        // Main dashboard page
  },

  // DeFi Features
  defi: {
    portfolio: true,        // Portfolio management page
    deposits: true,         // Deposit/withdraw functionality
    yieldOptimization: true, // Yield optimization features
    rebalancing: true,      // Portfolio rebalancing
  },

  // AI Features (Can be disabled)
  ai: {
    enabled: true,          // Master AI toggle
    agents: true,           // AI Agents page
    strategies: true,       // AI-powered strategies
    riskAnalysis: true,     // AI risk analysis
    marketMonitoring: true, // AI market monitoring
  },

  // Analytics Features (Can be disabled)
  analytics: {
    enabled: true,          // Master analytics toggle
    performanceCharts: true, // Performance charts
    yieldTracking: true,    // Yield tracking
    portfolioAnalytics: true, // Portfolio analytics
    historicalData: true,   // Historical data display
  },

  // Cross-Chain Features (Can be disabled)
  crossChain: {
    enabled: true,          // Master cross-chain toggle
    bridging: true,         // Cross-chain bridging
    multiChainYield: true,  // Multi-chain yield farming
    chainlinkCCIP: true,    // Chainlink CCIP integration
  },

  // Chainlink Services
  chainlink: {
    dataFeeds: true,        // Chainlink Data Feeds
    automation: true,       // Chainlink Automation
    vrf: true,             // Chainlink VRF
    ccip: true,            // Chainlink CCIP
    functions: true,       // Chainlink Functions
  },

  // Development & Demo Features
  development: {
    mockData: true,         // Use mock data for demo
    testMode: true,         // Enable test mode features
    debugging: true,        // Debug information
    devTools: true,         // Development tools
  }
} as const;

// Page and Route Configuration
export const ROUTE_CONFIG = {
  dashboard: { enabled: true, path: '/', requiresWallet: false },
  portfolio: { enabled: APP_CONFIG.defi.portfolio, path: '/portfolio', requiresWallet: true },
  agents: { enabled: APP_CONFIG.ai.enabled && APP_CONFIG.ai.agents, path: '/agents', requiresWallet: true },
  analytics: { enabled: APP_CONFIG.analytics.enabled, path: '/analytics', requiresWallet: false },
  crossChain: { enabled: APP_CONFIG.crossChain.enabled, path: '/cross-chain', requiresWallet: true },
} as const;

// Helper functions to check feature availability
export const isFeatureEnabled = (section: keyof typeof APP_CONFIG, feature?: string) => {
  if (!feature) {
    return (APP_CONFIG[section] as any).enabled !== false;
  }
  return (APP_CONFIG[section] as any)[feature] === true;
};

export const getEnabledFeatures = () => {
  const enabled: string[] = [];
  
  Object.entries(APP_CONFIG).forEach(([section, features]) => {
    if (typeof features === 'object') {
      Object.entries(features).forEach(([feature, isEnabled]) => {
        if (isEnabled) {
          enabled.push(`${section}.${feature}`);
        }
      });
    }
  });
  
  return enabled;
};

// Environment-specific configurations
export const ENV_CONFIG = {
  development: {
    rpcUrl: 'http://localhost:8545',
    chainId: 31337,
    blockExplorer: 'http://localhost:8545',
  },
  sepolia: {
    rpcUrl: `https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    chainId: 11155111,
    blockExplorer: 'https://sepolia.etherscan.io',
  },
  mainnet: {
    rpcUrl: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    chainId: 1,
    blockExplorer: 'https://etherscan.io',
  }
} as const;
