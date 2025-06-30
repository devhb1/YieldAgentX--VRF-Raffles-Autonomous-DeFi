# 🌐 Frontend Application

This directory contains the Next.js-based web application that provides the user interface for the DeFi Multi-Agent Yield Optimizer platform.

## 📁 Structure

```
frontend/
├── next.config.ts             # Next.js configuration
├── package.json              # Frontend dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── postcss.config.mjs        # PostCSS configuration
├── next-env.d.ts             # Next.js environment types
├── validate-env.js           # Environment validation script
├── test-contracts.js         # Contract integration testing
├── test-frontend-config.js   # Frontend configuration testing
├── public/                   # Static assets
│   ├── images/              # Image assets
│   ├── icons/               # Icon files
│   └── favicon.ico          # Site favicon
└── src/                     # Source code
    ├── app/                 # Next.js 13+ app directory
    │   ├── layout.tsx       # Root layout component
    │   ├── page.tsx         # Home page
    │   ├── globals.css      # Global styles
    │   └── [other pages]/   # Additional page routes
    ├── components/          # React components
    │   ├── ui/             # Reusable UI components
    │   ├── layout/         # Layout components
    │   ├── portfolio/      # Portfolio-specific components
    │   └── common/         # Common utility components
    ├── hooks/              # Custom React hooks
    │   ├── useContract.ts  # Contract interaction hook
    │   ├── usePortfolio.ts # Portfolio management hook
    │   └── useWallet.ts    # Wallet connection hook
    ├── lib/                # Utility libraries
    │   ├── contractService.ts  # Smart contract interactions
    │   ├── aiModelService.ts   # AI model integration
    │   ├── utils.ts           # General utilities
    │   └── constants.ts       # Application constants
    ├── types/              # TypeScript type definitions
    │   ├── portfolio.ts    # Portfolio-related types
    │   ├── contracts.ts    # Contract types
    │   └── common.ts       # Common types
    └── styles/             # Styling files
        ├── globals.css     # Global CSS styles
        └── components.css  # Component-specific styles
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- MetaMask or compatible Web3 wallet
- Access to Ethereum or Avalanche networks

### Installation
```bash
cd frontend/
npm install
```

### Environment Configuration
Create `.env.local` file:
```env
# Network RPC URLs
NEXT_PUBLIC_SEPOLIA_RPC_URL=your_sepolia_rpc_url
NEXT_PUBLIC_ETHEREUM_RPC_URL=your_ethereum_rpc_url
NEXT_PUBLIC_AVALANCHE_RPC_URL=your_avalanche_rpc_url
NEXT_PUBLIC_FUJI_RPC_URL=your_fuji_rpc_url

# Wallet Connect
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id

# Contract Addresses (automatically configured per network)
NEXT_PUBLIC_PORTFOLIO_VAULT_ADDRESS_SEPOLIA=0x8A77CE31FC8DC0F6Cb9b8b8B8D1EDD13E6C8A5C3
NEXT_PUBLIC_PORTFOLIO_VAULT_ADDRESS_AVALANCHE=0x7B45F29E94B7C21E8D3F50A6E8C9F2D1A5E6B8C4

# Optional: AI Integration
NEXT_PUBLIC_AI_ENDPOINT=your_ai_service_endpoint
```

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## 🎨 User Interface

### Design System
- **Framework**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS with custom components
- **Theme**: Dark/Light mode support
- **Responsive**: Mobile-first design approach
- **Icons**: Lucide React icon library

### Key Components

#### Dashboard (`src/components/portfolio/Dashboard.tsx`)
- **Purpose**: Main portfolio overview and management
- **Features**:
  - Combined portfolio value across all agents
  - Real-time yield tracking
  - Active agent count and performance metrics
  - Quick action buttons

#### Portfolio Agent Card (`src/components/portfolio/AgentCard.tsx`)
- **Purpose**: Individual agent management interface
- **Features**:
  - Agent creation and configuration
  - Strategy selection (Conservative, Balanced, Aggressive)
  - Deposit/withdrawal controls
  - Performance analytics

#### Strategy Selector (`src/components/portfolio/StrategySelector.tsx`)
- **Purpose**: AI strategy configuration
- **Features**:
  - Visual strategy comparison
  - Risk/reward explanations
  - Expected APY display
  - Strategy switching capability

#### Activity Feed (`src/components/portfolio/ActivityFeed.tsx`)
- **Purpose**: Real-time transaction and event monitoring
- **Features**:
  - Live activity updates
  - Transaction status tracking
  - Historical activity log
  - Filter and search capabilities

### Responsive Design
- **Mobile**: Optimized for mobile wallet interactions
- **Tablet**: Enhanced layout for medium screens
- **Desktop**: Full-featured dashboard experience
- **Breakpoints**: Tailwind CSS standard breakpoints

## 🔗 Blockchain Integration

### Wallet Connection
```typescript
// useWallet.ts - Wallet management hook
import { useConnect, useAccount, useDisconnect } from 'wagmi'

export const useWallet = () => {
  const { connect, connectors } = useConnect()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  return {
    connect,
    disconnect,
    address,
    isConnected,
    connectors
  }
}
```

### Contract Interactions
```typescript
// contractService.ts - Smart contract interface
import { ethers } from 'ethers'
import PortfolioVaultABI from '../abis/PortfolioVault.json'

export class ContractService {
  async createPortfolioAgent(strategy: string, initialDeposit: string) {
    const contract = new ethers.Contract(
      PORTFOLIO_VAULT_ADDRESS,
      PortfolioVaultABI,
      signer
    )
    return await contract.createAgent(strategy, { value: initialDeposit })
  }

  async depositToAgent(agentId: number, amount: string) {
    // Implementation
  }

  async rebalanceAgent(agentId: number) {
    // Implementation
  }
}
```

### Multi-Chain Support
- **Network Detection**: Automatic network switching
- **Chain-Specific Configs**: Different contract addresses per network
- **RPC Fallbacks**: Multiple RPC providers for reliability
- **Gas Optimization**: Network-specific gas strategies

## 📊 Real-Time Features

### Live Data Updates
```typescript
// usePortfolio.ts - Portfolio data management
export const usePortfolio = () => {
  const [portfolioData, setPortfolioData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // WebSocket connection for real-time updates
    const ws = new WebSocket(WS_ENDPOINT)
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setPortfolioData(data)
    }

    return () => ws.close()
  }, [])

  return { portfolioData, isLoading }
}
```

### Event Monitoring
- **Contract Events**: Real-time blockchain event listening
- **State Synchronization**: Automatic UI updates on state changes
- **Error Handling**: User-friendly error messages and retry mechanisms
- **Loading States**: Smooth loading indicators for all operations

## 🎯 User Experience Features

### Wallet Integration
- **MetaMask**: Primary wallet support
- **WalletConnect**: Mobile wallet compatibility
- **Coinbase Wallet**: Additional wallet option
- **Auto-Connection**: Remember user preferences

### Transaction Management
- **Transaction Tracking**: Real-time transaction status
- **Gas Estimation**: Accurate gas cost predictions
- **Error Handling**: Clear error messages and solutions
- **Confirmation UX**: Transaction confirmation flows

### Portfolio Analytics
- **Performance Charts**: Historical yield and performance data
- **Allocation Breakdown**: Visual representation of fund distribution
- **Risk Metrics**: Real-time risk assessment display
- **Yield Tracking**: APY calculations and projections

## 🔧 Development

### Code Quality
```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Testing
npm run test

# Build validation
npm run build
```

### Component Development
```typescript
// Example component structure
import React from 'react'
import { usePortfolio } from '@/hooks/usePortfolio'
import { Card } from '@/components/ui/Card'

interface PortfolioCardProps {
  agentId: number
  strategy: string
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  agentId,
  strategy
}) => {
  const { portfolioData } = usePortfolio()

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold">Agent #{agentId}</h3>
      <p className="text-gray-600">{strategy} Strategy</p>
      {/* Component content */}
    </Card>
  )
}
```

### Custom Hooks
- **useContract**: Smart contract interaction utilities
- **usePortfolio**: Portfolio state management
- **useWallet**: Wallet connection and account management
- **useTheme**: Dark/light mode switching
- **useNotifications**: Toast notifications system

## 🎨 Styling & Theming

### Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        }
      }
    }
  }
}
```

### Component Styling
- **Consistent Design**: Unified color scheme and typography
- **Dark Mode**: Complete dark/light theme support
- **Animations**: Smooth transitions and micro-interactions
- **Accessibility**: WCAG 2.1 compliance

## 📱 Mobile Optimization

### Mobile-First Design
- **Touch-Friendly**: Large tap targets for mobile interaction
- **Responsive Layouts**: Optimized for all screen sizes
- **Mobile Wallets**: Seamless mobile wallet integration
- **Performance**: Optimized for mobile networks

### Progressive Web App Features
- **Installable**: PWA manifest for app-like experience
- **Offline Capabilities**: Basic offline functionality
- **Push Notifications**: Transaction and update notifications

## 🧪 Testing

### Testing Strategy
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Visual regression tests
npm run test:visual
```

### Test Coverage
- **Components**: React component testing with Jest
- **Hooks**: Custom hook testing
- **Contract Integration**: Mock contract testing
- **User Flows**: End-to-end user journey testing

## 🚀 Deployment

### Build Process
```bash
# Production build
npm run build

# Static export (if needed)
npm run export

# Start production server
npm start
```

### Environment-Specific Builds
- **Development**: Hot reloading, debug tools
- **Staging**: Production-like environment for testing
- **Production**: Optimized build with error tracking

### Deployment Platforms
- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative hosting platform
- **AWS/GCP**: Enterprise deployment options

## 🔍 Performance Optimization

### Build Optimization
- **Code Splitting**: Automatic route-based splitting
- **Bundle Analysis**: webpack-bundle-analyzer integration
- **Image Optimization**: Next.js Image component usage
- **Lazy Loading**: Component and route lazy loading

### Runtime Performance
- **Memoization**: React.memo and useMemo optimization
- **Virtual Scrolling**: Large list performance
- **Debouncing**: Input and API call optimization
- **Caching**: Strategic data caching

## 📊 Analytics & Monitoring

### User Analytics
- **Usage Tracking**: User interaction analytics
- **Performance Monitoring**: Real user monitoring (RUM)
- **Error Tracking**: Client-side error reporting
- **Conversion Metrics**: Portfolio creation and usage metrics

### Technical Monitoring
- **Build Monitoring**: CI/CD pipeline health
- **Performance Budgets**: Automated performance regression detection
- **Accessibility Monitoring**: Automated a11y testing

## 🔧 Configuration Files

### Next.js Configuration
```javascript
// next.config.ts
const nextConfig = {
  experimental: {
    appDir: true
  },
  images: {
    domains: ['example.com']
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY
  }
}

export default nextConfig
```

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{"name": "next"}],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Wagmi Documentation](https://wagmi.sh/)
- [Ethers.js Documentation](https://docs.ethers.org/)

---

**Development Notes**:
- Always test wallet connections on multiple browsers
- Ensure mobile responsiveness across different devices
- Test transaction flows on testnets before mainnet deployment
- Monitor gas costs and optimize transaction batching
