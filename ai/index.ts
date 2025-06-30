/**
 * AI Module Entry Point
 * Multi-Agent DeFi Yield Optimizer
 *
 * This module provides AI-powered analysis using Google Gemini
 * as the primary AI service with fallback options available.
 */

import * as dotenv from 'dotenv';
import { createAIService, defaultAIConfig } from './services/AIService';
import { GeminiAIService } from './services/GeminiAIService';
import EnhancedIntegrationService from './services/EnhancedIntegrationService';

// Load environment variables
dotenv.config();

// Initialize global integration service
let globalIntegrationService: EnhancedIntegrationService | null = null;

/**
 * Get or create the global integration service
 */
export function getIntegrationService(): EnhancedIntegrationService {
  if (!globalIntegrationService) {
    globalIntegrationService = new EnhancedIntegrationService();
  }
  return globalIntegrationService;
}

/**
 * Initialize and start the AI service
 */
async function startAIService() {
  console.log('🤖 Starting Multi-Agent DeFi Yield Optimizer AI Service...');
  console.log('🔥 Powered by Google Gemini AI (Free Tier)\n');

  try {
    // Initialize the main AI service
    const aiService = createAIService(defaultAIConfig);

    // Test Google Gemini connection
    console.log('🔄 Testing Google Gemini connection...');
    const geminiConnected = await aiService.testGeminiConnection();

    if (geminiConnected) {
      console.log('✅ Google Gemini AI connected successfully');
    } else {
      console.log('⚠️  Google Gemini connection failed - fallback mode enabled');
      console.log('💡 Visit https://aistudio.google.com to get your free API key');
    }

    // Start the AI service
    await aiService.start();

    // Initialize enhanced integration service
    const integrationService = getIntegrationService();
    console.log('✅ Enhanced integration service initialized');

    console.log('\n📊 AI Service Status:');
    const health = aiService.getServiceHealth();
    console.log(`   Overall Health: ${health.overall}`);
    console.log(`   Running: ${health.isRunning}`);
    console.log(`   Active Agents: ${Object.keys(health.agents).length}`);
    console.log(`   Google Gemini: ${health.geminiService?.isConfigured ? 'Configured' : 'Not configured'}`);

    console.log('\n🎯 Available AI Capabilities:');
    console.log('   • Portfolio optimization analysis');
    console.log('   • Risk assessment and monitoring');
    console.log('   • Market sentiment analysis');
    console.log('   • Real-time yield tracking');
    console.log('   • Multi-chain portfolio management');
    console.log('   • Automated DeFi protocol allocation');

    console.log('\n🔗 Supported Chains:');
    integrationService.getSupportedChains().forEach(chain => {
      console.log(`   • ${chain.name} (${chain.chainId}): ${chain.working ? '✅' : '❌'}`);
    });

    console.log('\n🎲 Raffle System:');
    console.log('   • Auto-restarting raffles');
    console.log('   • VRF-powered winner selection');
    console.log('   • Public winner verification');

    console.log('\n✨ AI Service is now ready for real DeFi operations!');
    console.log('💡 Use the integration service for seamless frontend connection');

    // Keep the service running
    console.log('\n🚀 AI Service is now running...');
    console.log('Press Ctrl+C to stop\n');

    // Example: Run a sample analysis
    const samplePortfolio = {
      totalValue: 100000,
      allocations: { 'Aave': 40, 'Compound': 35, 'Uniswap': 25 },
      protocols: ['Aave', 'Compound', 'Uniswap'],
      chains: { 'Ethereum': 80, 'Polygon': 20 },
      riskTolerance: 70
    };

    const sampleMarketData = [
      { chain: 'Ethereum', price: 2300, trend: 'BULLISH' as const, volume: 1000000, volatility: 0.15, timestamp: Date.now() }
    ];

    console.log('📈 Running sample analysis...');
    const analysisResult = await aiService.runAnalysis({
      portfolioData: samplePortfolio,
      marketData: sampleMarketData
    });

    console.log('✅ Sample analysis completed');
    console.log(`   Timestamp: ${new Date(analysisResult.timestamp).toISOString()}`);
    console.log(`   AI Provider: ${analysisResult.metadata.aiProvider}`);

    if (analysisResult.results.geminiPortfolio) {
      const geminiResult = analysisResult.results.geminiPortfolio;
      console.log(`   Risk Score: ${geminiResult.riskScore}/100`);
      console.log(`   Rebalance Needed: ${geminiResult.rebalanceNeeded ? 'YES' : 'NO'}`);
    }

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down AI service...');
      await aiService.stop();
      console.log('✅ AI service stopped gracefully');
      process.exit(0);
    });

    return { aiService, integrationService };

  } catch (error: any) {
    console.error('❌ Failed to start AI service:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env file configuration');
    console.log('2. Verify Google Gemini API key is set');
    console.log('3. Ensure all dependencies are installed (npm install)');
    console.log('4. Check network connectivity');

    process.exit(1);
  }
}

/**
 * Export the Google Gemini service for direct use
 */
export { GeminiAIService } from './services/GeminiAIService';
export { createAIService, defaultAIConfig } from './services/AIService';
export { default as EnhancedIntegrationService } from './services/EnhancedIntegrationService';

// Start the service if this file is run directly
if (require.main === module) {
  startAIService();
}
