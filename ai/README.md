# 🤖 AI Agent System

This directory contains the AI-powered portfolio management system that drives intelligent fund allocation and optimization strategies.

## 📁 Structure

```
ai/
├── index.ts                    # Main AI module entry point
├── package.json               # AI module dependencies
├── tsconfig.json              # TypeScript configuration
├── test-gemini.ts             # Gemini AI testing utilities
├── quick-start-gemini.sh      # Quick setup script for Gemini
├── agents/                    # AI agent implementations
│   ├── BaseAgent.ts           # Base agent class with common functionality
│   ├── MarketMonitorAgent.ts  # Market analysis and monitoring
│   ├── PortfolioManagerAgent.ts # Portfolio optimization logic
│   └── RiskAnalyzerAgent.ts   # Risk assessment and management
├── models/                    # AI model definitions
│   └── AIModels.ts           # Core AI model interfaces and types
└── services/                 # AI service implementations
    ├── AIService.ts          # Main AI orchestrator
    ├── GeminiAIService.ts    # Google Gemini integration
    ├── PortfolioAgentAI.ts   # Portfolio-specific AI logic
    ├── EnhancedAIPortfolioService.ts # Advanced portfolio AI
    └── enhanced-ai-model*.ts # Various AI model implementations
```

## 🧠 AI Agents

### BaseAgent
- **Purpose**: Foundation class for all AI agents
- **Features**: Common agent lifecycle, logging, error handling
- **Location**: `agents/BaseAgent.ts`

### PortfolioManagerAgent
- **Purpose**: Intelligent fund allocation across DeFi protocols
- **Features**:
  - Multi-strategy support (Conservative, Balanced, Aggressive)
  - Real-time optimization algorithms
  - Cross-protocol diversification
- **Location**: `agents/PortfolioManagerAgent.ts`

### RiskAnalyzerAgent
- **Purpose**: Continuous risk assessment and management
- **Features**:
  - Market volatility analysis
  - Emergency situation detection
  - Risk score calculation
- **Location**: `agents/RiskAnalyzerAgent.ts`

### MarketMonitorAgent
- **Purpose**: Real-time market data analysis
- **Features**:
  - Price trend monitoring
  - Yield opportunity detection
  - Market sentiment analysis
- **Location**: `agents/MarketMonitorAgent.ts`

## 🔧 Services

### GeminiAIService
- **Purpose**: Integration with Google's Gemini AI model
- **Features**:
  - Natural language processing for market analysis
  - Intelligent decision making
  - Advanced reasoning capabilities
- **Setup**: Requires Google AI API key
- **Configuration**: See `docs/GOOGLE_GEMINI_SETUP.md`

### AIService
- **Purpose**: Main AI orchestration and coordination
- **Features**:
  - Agent lifecycle management
  - Inter-agent communication
  - Decision aggregation

### PortfolioAgentAI
- **Purpose**: Specialized portfolio management AI
- **Features**:
  - Strategy optimization
  - Rebalancing decisions
  - Performance tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- TypeScript
- Google AI API key (for Gemini integration)

### Installation
```bash
cd ai/
npm install
```

### Configuration
1. Set up environment variables:
   ```bash
   export GOOGLE_AI_API_KEY="your_api_key_here"
   ```

2. Run the quick setup:
   ```bash
   chmod +x quick-start-gemini.sh
   ./quick-start-gemini.sh
   ```

### Testing
```bash
# Test Gemini integration
npm run test:gemini

# Run TypeScript compilation
npm run build
```

## 🧮 AI Strategies

### Conservative Strategy
- **Allocation**: Aave (60%), Lido (30%), USDC (10%)
- **Risk Level**: Low
- **Expected APY**: 8-15%
- **Features**: Capital preservation focus, stable yields

### Balanced Strategy
- **Allocation**: Aave (40%), Lido (25%), Trading (25%), USDC (5%), Emergency (5%)
- **Risk Level**: Medium
- **Expected APY**: 12-20%
- **Features**: Balanced risk-reward, diversified protocols

### Aggressive Strategy
- **Allocation**: Trading (50%), Aave (20%), Lido (15%), Emergency (10%), USDC (5%)
- **Risk Level**: High
- **Expected APY**: 15-35%
- **Features**: Maximum yield focus, active trading

## 🔍 AI Decision Making

### Market Analysis Process
1. **Data Collection**: Gather market data from multiple sources
2. **Trend Analysis**: Identify patterns and opportunities
3. **Risk Assessment**: Evaluate potential risks and rewards
4. **Strategy Selection**: Choose optimal allocation strategy
5. **Execution Planning**: Plan rebalancing actions

### Emergency Detection
- **Volatility Monitoring**: Detect unusual market movements
- **Protocol Health**: Monitor DeFi protocol safety
- **Liquidity Analysis**: Ensure sufficient exit liquidity
- **Automatic Safeguards**: Trigger emergency modes when needed

## 📊 Performance Metrics

The AI system tracks various metrics:
- **Yield Optimization**: APY improvements over time
- **Risk Management**: Drawdown minimization
- **Rebalancing Efficiency**: Gas cost optimization
- **Strategy Performance**: Comparative analysis

## 🔗 Integration

### Frontend Integration
```typescript
import { AIService } from './services/AIService';
import { PortfolioManagerAgent } from './agents/PortfolioManagerAgent';

// Initialize AI service
const aiService = new AIService();
const portfolioAgent = new PortfolioManagerAgent();
```

### Smart Contract Integration
- Receives allocation decisions from AI agents
- Executes rebalancing based on AI recommendations
- Provides feedback data for AI learning

## 🛠️ Development

### Adding New Agents
1. Extend `BaseAgent` class
2. Implement required methods
3. Register with `AIService`
4. Add tests and documentation

### Customizing Strategies
1. Modify strategy definitions in `PortfolioManagerAgent`
2. Update allocation algorithms
3. Test with different market conditions

## 📝 Environment Variables

```bash
# Required for Gemini AI
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Optional debugging
AI_DEBUG_MODE=true
AI_LOG_LEVEL=info
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### AI Model Testing
```bash
npm run test:ai-models
```

## 📚 Further Reading

- [Google Gemini AI Documentation](https://ai.google.dev/)
- [AI Strategy Development Guide](../docs/AI_STRATEGY_GUIDE.md)
- [Portfolio Optimization Theory](../docs/PORTFOLIO_OPTIMIZATION.md)

---

**Note**: This AI system is designed to work seamlessly with the backend smart contracts and frontend interface to provide a complete DeFi portfolio management solution.
