# 📱 YieldAgentX Frontend

A modern, responsive React application built with Next.js that provides an intuitive interface for managing AI-powered DeFi portfolio agents.

[![Next.js]]
[![TypeScript]]
[![Tailwind CSS]]
[![Wagmi] ]

## 🎨 Design System

The frontend features a professional, modern design system built specifically for YieldAgentX:

### 🎯 Key UI Components
- **Glass Morphism**: Subtle backdrop blur effects for modern aesthetics
- **Gradient Cards**: Dynamic gradient backgrounds with hover animations
- **Professional Badges**: Status indicators with proper semantic colors
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Micro-interactions**: Smooth animations and transitions throughout

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── agents/              # AI agent management components
│   │   ├── MyAgents.tsx     # Agent dashboard and controls
│   │   ├── CreateAgent.tsx  # Agent creation wizard
│   │   ├── PortfolioAnalysis.tsx # Portfolio analytics
│   │   └── AIInsights.tsx   # AI-generated insights
│   ├── raffle/              # VRF raffle components
│   │   ├── CurrentRaffle.tsx # Active raffle display
│   │   ├── RaffleHistory.tsx # Past raffle results
│   │   └── MyWinnings.tsx   # User winnings tracker
│   ├── ui/                  # Reusable UI components
│   │   ├── button.tsx       # Professional button variants
│   │   ├── card.tsx         # Card component system
│   │   ├── input.tsx        # Form input components
│   │   ├── badge.tsx        # Status badges and indicators
│   │   └── modal.tsx        # Modal dialog system
│   ├── Layout.tsx           # Main application layout
│   └── ConnectWallet.tsx    # Web3 wallet connection
├── hooks/                   # Custom React hooks
│   ├── useAIVault.ts        # Smart contract interactions
│   ├── useAgentActivities.ts # Real-time activity fetching
│   ├── useChainlinkPrice.ts # Price feed integration
│   └── useRaffle.ts         # VRF raffle functionality
├── pages/                   # Next.js pages
│   ├── index.tsx            # Landing page
│   ├── agents.tsx           # AI agents dashboard
│   └── raffle.tsx           # VRF raffle interface
├── styles/
│   └── globals.css          # Global styles and design system
└── config/
    └── wagmi.ts             # Web3 configuration
```

## 🔗 Chainlink Integration

The frontend seamlessly integrates with Chainlink's infrastructure:

### 🤖 Chainlink Automation
- **Real-time Status**: Live monitoring of automation upkeep status
- **Performance Tracking**: Visual feedback on automated rebalancing
- **Manual Triggers**: Emergency manual rebalancing capabilities
- **Gas Optimization**: Smart timing for cost-effective operations

### 🎲 Chainlink VRF v2.5
- **Live Raffle Interface**: Real-time raffle participation and monitoring
- **Provable Fairness**: Transparent display of VRF randomness process
- **Winner Verification**: On-chain verification of raffle results
- **Ticket Management**: User-friendly ticket purchasing and tracking

### 📊 Chainlink Price Feeds
- **Real-time Pricing**: Live ETH/USD price display throughout the interface
- **Portfolio Valuation**: Accurate USD conversion for all portfolio values
- **Price History**: Historical price charts for performance analysis
- **Multi-Asset Support**: Ready for additional price feed integrations

## 🛠️ Technology Stack

### Core Technologies
- **Next.js 14**: Latest React framework with App Router
- **TypeScript**: Full type safety and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Framer Motion**: Smooth animations and micro-interactions

### Web3 Integration
- **Wagmi v2**: Modern React hooks for Ethereum interactions
- **RainbowKit**: Beautiful wallet connection interface
- **Viem**: TypeScript-first Ethereum library
- **TanStack Query**: Powerful data fetching and caching

### UI/UX Libraries
- **Lucide React**: Beautiful, consistent icon system
- **Recharts**: Responsive charts for analytics visualization
- **React Hot Toast**: Elegant notification system
- **Headless UI**: Accessible, unstyled UI components

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 18.0 or higher
npm or yarn package manager
MetaMask or compatible Web3 wallet
```

### Installation
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Configuration
Create a `.env.local` file with the required environment variables:

```bash
# Chainlink Contract Addresses (Sepolia)
NEXT_PUBLIC_AI_VAULT_ADDRESS=0xa513E6E4b8f2a923D98304ec87F64353C4D5C853
NEXT_PUBLIC_VRF_RAFFLE_ADDRESS=0x742d35Cc6634C0532925a3b8D6Ee6B8Cc3532e83

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Optional: Analytics and Monitoring
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```


## 📊 Features

### 🤖 AI Agent Management
- **Agent Dashboard**: Comprehensive overview of all AI agents
- **Real-time Performance**: Live tracking of agent performance and yields
- **Strategy Configuration**: Choose from Conservative, Balanced, or Aggressive strategies
- **Portfolio Controls**: Deposit, withdraw, pause, and rebalance functionality
- **Activity History**: Complete transaction history with Etherscan links

### 🎰 VRF Raffle System
- **Live Raffles**: Participate in ongoing Chainlink VRF-powered raffles
- **Raffle History**: View past raffle results and winners
- **Ticket Management**: Purchase and track raffle tickets
- **Winner Verification**: Verify raffle fairness through VRF proofs

### 📈 Analytics & Insights
- **Portfolio Analytics**: Detailed performance metrics and charts
- **AI Insights**: Intelligent recommendations and market analysis
- **Risk Assessment**: Comprehensive portfolio risk evaluation
- **Historical Data**: Complete performance history and trends

### 🔧 Advanced Features
- **Multi-wallet Support**: Compatible with all major Web3 wallets
- **Network Switching**: Seamless network switching with user guidance
- **Responsive Design**: Perfect experience on all device sizes
- **Accessibility**: WCAG-compliant design with screen reader support
- **Dark Mode**: Professional dark theme optimized for long usage

## 🔐 Security & Best Practices

### Frontend Security
- **Environment Variables**: Sensitive configuration properly managed
- **Input Validation**: Client-side validation with proper sanitization
- **XSS Protection**: Safe rendering of user-generated content
- **CSRF Protection**: Built-in Next.js security features

### Web3 Security
- **Safe Contract Interactions**: Proper error handling and validation
- **Transaction Confirmations**: Clear user feedback for all transactions
- **Gas Estimation**: Accurate gas estimation before transactions
- **Wallet Security**: Secure wallet connection and session management

### Performance Optimization
- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component for optimal loading
- **Caching Strategy**: Smart caching with TanStack Query
- **Bundle Analysis**: Regular bundle size monitoring and optimization

## 🧪 Testing

### Testing Strategy
```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run accessibility tests
npm run test:a11y
```

### Test Coverage
- **Component Testing**: All UI components with comprehensive test coverage
- **Hook Testing**: Custom hooks tested with realistic scenarios
- **Integration Testing**: End-to-end user workflows
- **Accessibility Testing**: WCAG compliance verification

## 📱 Mobile Experience

The frontend is designed with a mobile-first approach:

### Mobile Features
- **Touch-Optimized**: Large touch targets and gesture support
- **Responsive Layout**: Adaptive design for all screen sizes
- **Progressive Web App**: PWA capabilities for app-like experience
- **Offline Support**: Basic offline functionality for viewing data

### Performance
- **Fast Loading**: Optimized for mobile network conditions
- **Efficient Rendering**: Smooth scrolling and interactions
- **Battery Optimization**: Efficient rendering to preserve battery life

## 🔄 Real-time Features

### Live Data Updates
- **WebSocket Integration**: Real-time updates for critical data
- **Automatic Refresh**: Smart refresh intervals for data freshness
- **Connection Management**: Robust handling of network interruptions
- **Error Recovery**: Graceful degradation and recovery mechanisms

### Notifications
- **Transaction Status**: Real-time transaction confirmation updates
- **Agent Alerts**: Notifications for important agent events
- **Market Updates**: Optional market condition alerts
- **System Status**: Infrastructure health and maintenance notices

## 🌍 Internationalization

Future-ready for global expansion:

### i18n Support
- **Translation Ready**: Component structure supports easy translation
- **Locale Management**: Built-in locale detection and switching
- **Cultural Adaptation**: Number formatting and date handling
- **RTL Support**: Ready for right-to-left language support

## 📦 Build & Deployment

### Production Build
```bash
# Create optimized production build
npm run build

# Analyze bundle size
npm run analyze

# Start production server
npm run start
```

### Deployment 
- **Vercel**:

### Environment Management
- **Development**: Local development with hot reloading
- **Staging**: Testing environment with production-like setup
- **Production**: Optimized build with monitoring and analytics

---

**Built with modern web technologies for the Chainlink Hackathon 2025**

*The YieldAgentX frontend represents the cutting edge of DeFi user experience, combining beautiful design with powerful functionality to create an intuitive interface for managing AI-powered portfolio optimization.*
