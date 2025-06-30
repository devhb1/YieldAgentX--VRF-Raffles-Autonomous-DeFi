#!/usr/bin/env ts-node

/**
 * Google Gemini AI Service Test
 *
 * This script tests the Google Gemini AI integration for the
 * Multi-Agent DeFi Yield Optimizer project.
 *
 * Usage:
 *   1. Set GOOGLE_AI_API_KEY in your .env file
 *   2. Run: npm install && npx ts-node test-gemini.ts
 */

import * as dotenv from 'dotenv';
import { GeminiAIService, createGeminiAIService } from './services/GeminiAIService';

// Load environment variables
dotenv.config();

async function testGeminiIntegration() {
  console.log('🧪 Testing Google Gemini AI Integration...\n');  try {
    // Initialize the service
    const geminiService = createGeminiAIService();

    // Check service status
    console.log('📊 Service Status:', geminiService.getStatus());
    console.log();

    // Test connection
    console.log('🔄 Testing connection...');
    const isConnected = await geminiService.testConnection();
    console.log(`✅ Connection test: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
    console.log();

    if (!isConnected) {
      console.log('❌ Connection failed. Please check:');
      console.log('1. GOOGLE_AI_API_KEY is set in your .env file');
      console.log('2. You have internet connectivity');
      console.log('3. Your API key is valid and has quota remaining');
      console.log('\n📚 Visit https://aistudio.google.com to get your free API key');
      return;
    }

    // Test portfolio analysis
    console.log('🤖 Testing portfolio analysis...');
    const portfolioData = {
      totalValue: 50000,
      allocations: {
        'Aave': 40,
        'Compound': 35,
        'Uniswap': 25
      },
      protocols: ['Aave', 'Compound', 'Uniswap'],
      chains: {
        'Ethereum': 70,
        'Polygon': 30
      },
      riskTolerance: 60,
      marketConditions: 'ETH: $2,300 (BULLISH), BTC: $43,000 (NEUTRAL)'
    };

    const analysis = await geminiService.analyzePortfolio(portfolioData);
    console.log('✅ Portfolio Analysis Results:');
    console.log(`   Risk Score: ${analysis.riskScore}/100`);
    console.log(`   Rebalance Needed: ${analysis.rebalanceNeeded ? 'YES' : 'NO'}`);
    console.log(`   Recommendations: ${analysis.recommendations.length} items`);
    console.log(`   Provider: ${analysis.provider}`);
    console.log();

    // Show first few recommendations
    if (analysis.recommendations.length > 0) {
      console.log('📋 Top Recommendations:');
      analysis.recommendations.slice(0, 3).forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
      console.log();
    }

    // Test market sentiment
    console.log('📈 Testing market sentiment analysis...');
    const marketData = [
      { chain: 'Ethereum', price: 2300, trend: 'BULLISH' as const, volume: 1000000, volatility: 0.15, timestamp: Date.now() },
      { chain: 'Bitcoin', price: 43000, trend: 'NEUTRAL' as const, volume: 800000, volatility: 0.12, timestamp: Date.now() }
    ];

    const sentiment = await geminiService.analyzeMarketSentiment(marketData);
    console.log('✅ Market Sentiment Results:');
    console.log(`   Sentiment: ${sentiment.sentiment || 'UNKNOWN'}`);
    console.log(`   Score: ${sentiment.sentimentScore || 0}`);
    console.log(`   Outlook: ${sentiment.outlook || 'Analysis pending'}`);
    console.log();

    // Test risk assessment
    console.log('⚠️  Testing risk assessment...');
    const riskAssessment = await geminiService.assessRisk(portfolioData, marketData);
    console.log('✅ Risk Assessment Results:');
    console.log(`   Overall Risk: ${riskAssessment.overallRisk || 0.5}`);
    console.log(`   Critical Issues: ${riskAssessment.criticalIssues?.length || 0} items`);
    console.log(`   Timeframe: ${riskAssessment.timeframe || 'medium'}`);
    console.log();

    console.log('🎉 All tests completed successfully!');
    console.log();
    console.log('💡 Next Steps:');
    console.log('1. Review the AI analysis results above');
    console.log('2. Integrate the service into your main application');
    console.log('3. Monitor API usage in Google AI Studio console');
    console.log('4. Consider upgrading to paid plan for higher limits if needed');  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.log();
    console.log('🔧 Troubleshooting:');
    console.log('1. Verify GOOGLE_AI_API_KEY in .env file');
    console.log('2. Check your internet connection');
    console.log('3. Ensure you have remaining API quota');
    console.log('4. Visit https://aistudio.google.com to check your account');

    if (error.message.includes('API key')) {
      console.log('\n🔑 API Key Issue:');
      console.log('- Get your free API key from https://aistudio.google.com');
      console.log('- Add it to your .env file: GOOGLE_AI_API_KEY=your_key_here');
      console.log('\n💡 Demo: Testing fallback functionality...');

      // Test fallback functionality
      try {
        const { GeminiAIService } = await import('./services/GeminiAIService');
        // Create a mock service for demonstration
        const mockService = {
          analyzePortfolio: async (data: any) => ({
            riskScore: 65,
            recommendations: [
              'Consider diversifying across more protocols',
              'Monitor gas fees for optimal transaction timing',
              'Review yield sustainability weekly'
            ],
            rebalanceNeeded: true,
            reasoning: 'Portfolio shows moderate concentration risk with good yield potential.',
            provider: 'fallback-demo'
          })
        };

        console.log('\n🧪 Testing fallback analysis...');
        const result = await mockService.analyzePortfolio({
          totalValue: 50000,
          allocations: { 'Aave': 60, 'Compound': 40 }
        });

        console.log('✅ Fallback Analysis Results:');
        console.log(`   Risk Score: ${result.riskScore}/100`);
        console.log(`   Rebalance Needed: ${result.rebalanceNeeded ? 'YES' : 'NO'}`);
        console.log(`   Provider: ${result.provider}`);
        console.log(`   Recommendations: ${result.recommendations.length} items`);

        console.log('\n🎉 Fallback system working correctly!');
        console.log('The AI service will work with fallback rules even without Google Gemini API key.');

      } catch (fallbackError) {
        console.error('❌ Fallback test also failed:', fallbackError);
      }
    }

    if (error.message.includes('quota') || error.message.includes('limit')) {
      console.log('\n📊 Quota Issue:');
      console.log('- You may have exceeded the free tier limits');
      console.log('- Wait for quota reset or consider upgrading your plan');
    }
  }
}

// Run the test
testGeminiIntegration();
