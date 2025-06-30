import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export interface GeminiResponse {
  content: string;
  confidence: number;
  finishReason: string;
}

export interface PortfolioAnalysis {
  riskScore: number;
  recommendations: string[];
  rebalanceNeeded: boolean;
  reasoning: string;
  provider: string;
  allocationStrategy: AllocationDecision[];
  yieldPrediction: YieldForecast;
}

export interface AllocationDecision {
  protocol: string;
  percentage: number;
  reasoning: string;
  expectedAPY: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface YieldForecast {
  weekly: number;
  monthly: number;
  yearly: number;
  confidence: number;
}

interface GeminiAPIResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason?: string;
  }>;
}

export class GeminiAIService {
  private apiKey: string;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta';
  private model: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY || '';
    this.model = process.env.GOOGLE_MODEL || 'gemini-1.5-flash';

    if (!this.apiKey) {
      throw new Error(
        'Google AI API key not found. Please set GOOGLE_AI_API_KEY in your environment variables. ' +
        'Visit https://aistudio.google.com to get your free API key.'
      );
    }

    console.log(`Initialized Google Gemini AI Service with model: ${this.model}`);
  }

  /**
   * Analyze portfolio data using Google Gemini
   */
  async analyzePortfolio(portfolioData: any): Promise<PortfolioAnalysis> {
    const prompt = this.createPortfolioAnalysisPrompt(portfolioData);

    try {
      const response = await this.generateContent(prompt);
      return this.parsePortfolioAnalysis(response.content);
    } catch (error) {
      console.error('Google Gemini portfolio analysis failed:', error);
      // Fallback to rule-based analysis
      return this.fallbackAnalysis(portfolioData);
    }
  }

  /**
   * Analyze market sentiment using Google Gemini
   */
  async analyzeMarketSentiment(marketData: any[]): Promise<any> {
    const prompt = this.createMarketSentimentPrompt(marketData);

    try {
      const response = await this.generateContent(prompt);
      return this.parseMarketSentiment(response.content);
    } catch (error) {
      console.error('Google Gemini market sentiment analysis failed:', error);
      return this.fallbackMarketSentiment();
    }
  }

  /**
   * Assess portfolio risk using Google Gemini
   */
  async assessRisk(portfolioData: any, marketData: any[]): Promise<any> {
    const prompt = this.createRiskAssessmentPrompt(portfolioData, marketData);

    try {
      const response = await this.generateContent(prompt);
      return this.parseRiskAssessment(response.content);
    } catch (error) {
      console.error('Google Gemini risk assessment failed:', error);
      return this.fallbackRiskAssessment(portfolioData);
    }
  }

  /**
   * Generate content using Google Gemini API
   */
  private async generateContent(prompt: string): Promise<GeminiResponse> {
    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;

    const requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
        stopSequences: []
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Google Gemini API error: ${response.status} - ${errorData}`);
    }    const data = await response.json() as GeminiAPIResponse;

    if (!data?.candidates || data.candidates.length === 0) {
      throw new Error('No response from Google Gemini API');
    }

    const candidate = data.candidates[0];

    return {
      content: candidate.content.parts[0].text,
      confidence: 0.85, // Gemini generally has high confidence
      finishReason: candidate.finishReason || 'STOP'
    };
  }

  private createPortfolioAnalysisPrompt(portfolioData: any): string {
    return `
You are an expert DeFi portfolio analyst. Analyze the following portfolio data and provide recommendations:

Portfolio Data:
- Total Value: $${portfolioData.totalValue || 0}
- Current Allocations: ${JSON.stringify(portfolioData.allocations || {})}
- Active Protocols: ${portfolioData.protocols || 'Unknown'}
- Chain Distribution: ${JSON.stringify(portfolioData.chains || {})}
- Risk Tolerance: ${portfolioData.riskTolerance || 'Medium'}
- Market Conditions: ${portfolioData.marketConditions || 'Unknown'}

Please provide a detailed analysis including:
1. Risk Score (0-100, where 0 is lowest risk)
2. Specific actionable recommendations
3. Whether immediate rebalancing is needed (true/false)
4. Clear reasoning for your analysis

Format your response as JSON:
{
  "riskScore": number,
  "recommendations": ["recommendation1", "recommendation2", ...],
  "rebalanceNeeded": boolean,
  "reasoning": "detailed explanation"
}

Focus on:
- Protocol diversification
- Chain risk distribution
- Yield sustainability
- Liquidity considerations
- Gas optimization
- Market timing factors
`;
  }

  private createMarketSentimentPrompt(marketData: any[]): string {
    return `
You are a DeFi market analyst. Analyze the current market sentiment based on the following data:

Market Data: ${JSON.stringify(marketData)}

Provide analysis including:
1. Overall sentiment score (0-1, where 1 is most bullish)
2. Key market drivers
3. Short-term outlook (1-7 days)
4. Risk factors to monitor

Format as JSON:
{
  "sentimentScore": number,
  "sentiment": "BULLISH|NEUTRAL|BEARISH",
  "drivers": ["driver1", "driver2", ...],
  "outlook": "detailed outlook",
  "riskFactors": ["risk1", "risk2", ...]
}
`;
  }

  private createRiskAssessmentPrompt(portfolioData: any, marketData: any[]): string {
    return `
As a DeFi risk analyst, assess the risk profile of this portfolio:

Portfolio: ${JSON.stringify(portfolioData)}
Market Context: ${JSON.stringify(marketData)}

Evaluate these risk dimensions:
1. Protocol Risk (smart contract, audit status)
2. Liquidity Risk (DEX depth, slippage)
3. Market Risk (volatility, correlation)
4. Concentration Risk (diversification)
5. Technical Risk (chain security, bridges)

Format as JSON:
{
  "overallRisk": number,
  "riskBreakdown": {
    "protocol": number,
    "liquidity": number,
    "market": number,
    "concentration": number,
    "technical": number
  },
  "criticalIssues": ["issue1", "issue2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "timeframe": "immediate|short|medium|long"
}
`;
  }

  private parsePortfolioAnalysis(content: string): PortfolioAnalysis {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          riskScore: parsed.riskScore || 50,
          recommendations: parsed.recommendations || [],
          rebalanceNeeded: parsed.rebalanceNeeded || false,
          reasoning: parsed.reasoning || content,
          provider: 'google-gemini',
          allocationStrategy: parsed.allocationStrategy || this.generateDefaultAllocationStrategy(),
          yieldPrediction: parsed.yieldPrediction || this.generateDefaultYieldPrediction()
        };
      } else {
        // Fallback text parsing
        return this.parseTextResponse(content);
      }
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      return this.parseTextResponse(content);
    }
  }  private parseTextResponse(content: string): PortfolioAnalysis {
    // Extract information from text response
    const riskMatch = content.match(/risk.*?(\d+)/i);
    const riskScore = riskMatch ? parseInt(riskMatch[1]) : 50;

    const rebalanceNeeded = /rebalanc/i.test(content);

    // Extract recommendations from bullet points or numbered lists
    const recommendations: string[] = [];
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.match(/^[-*•]\s+/) || line.match(/^\d+\.\s+/)) {
        recommendations.push(line.replace(/^[-*•\d.\s]+/, '').trim());
      }
    }

    return {
      riskScore,
      recommendations: recommendations.slice(0, 5), // Limit to 5 recommendations
      rebalanceNeeded,
      reasoning: content,
      provider: 'google-gemini',
      allocationStrategy: this.generateDefaultAllocationStrategy(),
      yieldPrediction: this.generateDefaultYieldPrediction()
    };
  }

  private parseMarketSentiment(content: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse market sentiment:', error);
    }

    // Fallback parsing
    return {
      sentimentScore: 0.5,
      sentiment: 'NEUTRAL',
      drivers: ['Market analysis unavailable'],
      outlook: content,
      riskFactors: ['Unable to assess risks']
    };
  }

  private parseRiskAssessment(content: string): any {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse risk assessment:', error);
    }

    // Fallback
    return {
      overallRisk: 0.5,
      riskBreakdown: {
        protocol: 0.5,
        liquidity: 0.5,
        market: 0.5,
        concentration: 0.5,
        technical: 0.5
      },
      criticalIssues: [],
      recommendations: ['Monitor portfolio regularly'],
      timeframe: 'medium'
    };
  }

  private fallbackAnalysis(portfolioData: any): PortfolioAnalysis {
    // Simple rule-based fallback when Gemini is unavailable
    const totalValue = portfolioData.totalValue || 0;
    const protocolCount = Object.keys(portfolioData.allocations || {}).length;

    let riskScore = 50; // Default medium risk

    // Adjust risk based on portfolio size
    if (totalValue > 100000) riskScore -= 10; // Lower risk for larger portfolios
    if (totalValue < 10000) riskScore += 15; // Higher risk for smaller portfolios

    // Adjust for diversification
    if (protocolCount > 5) riskScore -= 10; // Well diversified
    if (protocolCount < 3) riskScore += 20; // Concentrated risk

    riskScore = Math.max(0, Math.min(100, riskScore));

    return {
      riskScore,
      recommendations: [
        'Diversify across multiple DeFi protocols',
        'Monitor yield sustainability regularly',
        'Consider gas costs in rebalancing decisions',
        'Keep some allocation in stable, audited protocols',
        'Review portfolio allocation monthly'
      ],
      rebalanceNeeded: Math.random() > 0.7, // 30% chance
      reasoning: 'Analysis completed using fallback rules. Google Gemini AI was unavailable. Consider checking your API key and internet connection.',
      provider: 'fallback-rules',
      allocationStrategy: this.generateDefaultAllocationStrategy(),
      yieldPrediction: this.generateDefaultYieldPrediction()
    };
  }

  private fallbackMarketSentiment(): any {
    return {
      sentimentScore: 0.5,
      sentiment: 'NEUTRAL',
      drivers: ['Fallback analysis - Gemini unavailable'],
      outlook: 'Unable to assess market sentiment. Check AI service configuration.',
      riskFactors: ['AI analysis unavailable']
    };
  }

  private fallbackRiskAssessment(portfolioData: any): any {
    const protocolCount = Object.keys(portfolioData.allocations || {}).length;
    const concentrationRisk = protocolCount < 3 ? 0.8 : 0.4;

    return {
      overallRisk: concentrationRisk,
      riskBreakdown: {
        protocol: 0.5,
        liquidity: 0.5,
        market: 0.6,
        concentration: concentrationRisk,
        technical: 0.4
      },
      criticalIssues: protocolCount < 3 ? ['High concentration risk'] : [],
      recommendations: ['Diversify portfolio', 'Monitor protocols regularly'],
      timeframe: 'medium'
    };
  }

  /**
   * Test the Gemini API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateContent('Hello, please respond with "AI service is working" to confirm the connection.');
      return response.content.toLowerCase().includes('working') || response.content.toLowerCase().includes('connection');
    } catch (error) {
      console.error('Gemini connection test failed:', error);
      return false;
    }
  }

  /**
   * Get service status
   */
  getStatus(): any {
    return {
      provider: 'google-gemini',
      model: this.model,
      hasApiKey: !!this.apiKey,
      baseUrl: this.baseUrl,
      isConfigured: !!this.apiKey
    };
  }

  /**
   * Generate default allocation strategy
   */
  private generateDefaultAllocationStrategy(): AllocationDecision[] {
    return [
      {
        protocol: 'Lido',
        percentage: 30,
        reasoning: 'Stable liquid staking with consistent yields',
        expectedAPY: 4.5,
        riskLevel: 'LOW'
      },
      {
        protocol: 'Aave',
        percentage: 25,
        reasoning: 'Reliable lending protocol with good liquidity',
        expectedAPY: 3.8,
        riskLevel: 'LOW'
      },
      {
        protocol: 'Uniswap V3',
        percentage: 25,
        reasoning: 'Liquidity provision with fee generation',
        expectedAPY: 6.2,
        riskLevel: 'MEDIUM'
      },
      {
        protocol: 'Reserve',
        percentage: 20,
        reasoning: 'Safe reserve for opportunities and rebalancing',
        expectedAPY: 2.1,
        riskLevel: 'LOW'
      }
    ];
  }

  /**
   * Generate default yield prediction
   */
  private generateDefaultYieldPrediction(): YieldForecast {
    return {
      weekly: 0.08,
      monthly: 0.35,
      yearly: 4.2,
      confidence: 0.75
    };
  }

  /**
   * Generate text using Google Gemini (public method)
   */
  async generateText(prompt: string): Promise<string> {
    try {
      const response = await this.generateContent(prompt);
      return response.content;
    } catch (error) {
      console.error('Google Gemini text generation failed:', error);
      return 'AI analysis temporarily unavailable. Using fallback recommendations.';
    }
  }
}

// Export factory function instead of singleton instance to avoid initialization errors
export function createGeminiAIService(): GeminiAIService {
  return new GeminiAIService();
}

// Export the class for use in applications that handle their own instantiation
export default GeminiAIService;
