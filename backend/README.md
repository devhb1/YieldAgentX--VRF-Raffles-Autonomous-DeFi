# ⛓️ Backend Smart Contracts

This directory contains all smart contracts, deployment scripts, and blockchain infrastructure for the DeFi Multi-Agent Yield Optimizer.

## 📁 Structure

```
backend/
├── hardhat.config.js          # Hardhat configuration for multiple networks
├── package.json              # Backend dependencies and scripts
├── portfolio_abi.json        # Contract ABI for frontend integration
├── test-chainlink-config.js  # Chainlink service testing
├── contracts/                # Smart contract source code
│   ├── AIPortfolioVault.sol           # Main AI agent vault
│   ├── AdvancedAIPortfolioVault.sol   # Enhanced vault features
│   ├── AIStrategyEngine.sol           # Strategy management
│   ├── AdvancedYieldOptimizer.sol     # Yield optimization logic
│   ├── ChainlinkRaffle.sol           # VRF-powered raffle system
│   ├── EnhancedRealTimeAIEngine.sol   # Real-time AI integration
│   ├── MultiChainPortfolioManager.sol # Cross-chain management
│   └── [other contract files...]
├── scripts/                  # Deployment and utility scripts
│   ├── deploy.js            # Standard deployment
│   ├── deploy-comprehensive.js # Full system deployment
│   └── [other scripts...]
├── test/                    # Contract test suites
├── deployments/            # Deployment artifacts
├── artifacts/              # Compiled contract artifacts
└── cache/                  # Hardhat cache files
```

## 🔧 Smart Contracts

### Core Contracts

#### AIPortfolioVault.sol
- **Purpose**: Main vault for AI-managed portfolios
- **Features**:
  - Individual agent creation and management
  - Multi-strategy support (Conservative, Balanced, Aggressive)
  - Automated fund allocation across DeFi protocols
  - Emergency safety mechanisms
- **Integrations**: Aave, Lido, Uniswap V3, 1inch

#### AdvancedAIPortfolioVault.sol
- **Purpose**: Enhanced version with advanced features
- **Features**:
  - Advanced yield optimization algorithms
  - Cross-protocol arbitrage
  - Gas optimization strategies
  - Enhanced security features

#### AIStrategyEngine.sol
- **Purpose**: Strategy management and execution
- **Features**:
  - Strategy definition and validation
  - Dynamic strategy switching
  - Performance tracking
  - Risk management controls

### Chainlink Integration

#### ChainlinkRaffle.sol
- **Purpose**: VRF-powered fair raffle system
- **Features**:
  - Verifiable random winner selection
  - Automated prize distribution
  - Multi-participant support
- **Chainlink Services**: VRF (Verifiable Random Function)

#### Automation Integration
- **Purpose**: 24/7 automated portfolio rebalancing
- **Implementation**: Chainlink Keepers/Automation
- **Features**:
  - Time-based rebalancing (24-hour intervals)
  - Condition-based triggers
  - Gas-efficient execution

#### Price Feed Integration
- **Purpose**: Real-time asset pricing
- **Data Sources**: Chainlink Price Feeds
- **Supported Pairs**: ETH/USD, major token pairs
- **Usage**: Portfolio valuation, rebalancing decisions

### Yield Optimization

#### AdvancedYieldOptimizer.sol
- **Purpose**: Advanced yield generation strategies
- **Features**:
  - Multi-protocol yield farming
  - Compound yield strategies
  - Risk-adjusted returns
  - Dynamic protocol switching

### Multi-Chain Support

#### MultiChainPortfolioManager.sol
- **Purpose**: Cross-chain portfolio management
- **Supported Networks**:
  - Ethereum (Mainnet & Sepolia)
  - Avalanche (Mainnet & Fuji)
- **Features**:
  - Chain-specific optimizations
  - Cross-chain communication
  - Unified portfolio view

## 🚀 Deployment

### Prerequisites
- Node.js 18+
- Hardhat
- Network RPC URLs
- Private keys for deployment

### Installation
```bash
cd backend/
npm install
```

### Environment Setup
Create `.env` file:
```bash
# Network Configuration
SEPOLIA_RPC_URL=your_sepolia_rpc_url
ETHEREUM_RPC_URL=your_ethereum_rpc_url
AVALANCHE_RPC_URL=your_avalanche_rpc_url
FUJI_RPC_URL=your_fuji_rpc_url

# Deployment Keys
PRIVATE_KEY=your_deployment_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
SNOWTRACE_API_KEY=your_snowtrace_api_key

# Chainlink Configuration
VRF_SUBSCRIPTION_ID=your_vrf_subscription_id
VRF_KEY_HASH=chainlink_vrf_key_hash
```

### Deployment Commands

#### Deploy to Sepolia Testnet
```bash
npx hardhat run scripts/deploy-comprehensive.js --network sepolia
```

#### Deploy to Ethereum Mainnet
```bash
npx hardhat run scripts/deploy-comprehensive.js --network ethereum
```

#### Deploy to Avalanche
```bash
npx hardhat run scripts/deploy-comprehensive.js --network avalanche
```

### Verification
```bash
# Verify contracts on Etherscan
npx hardhat verify --network sepolia <contract_address> <constructor_args>

# Verify on Snowtrace (Avalanche)
npx hardhat verify --network avalanche <contract_address> <constructor_args>
```

## 📍 Deployed Contracts

### Ethereum Sepolia Testnet
```
PortfolioAgentVault: 0x8A77CE31FC8DC0F6Cb9b8b8B8D1EDD13E6C8A5C3
ChainlinkRaffle: 0x4A25E58A02B8E5D3B76F03F77C6F8F5D0BC6E8A1
AdvancedYieldOptimizer: 0x9F84E12D4C8E5B7A6F03D29E8A5C6F1B2E7A3D9F
EnhancedRealTimeAIEngine: 0x5bC9b9Ed73E141dcCf1311937d9558C2Df8a3FF9
```

### Avalanche Fuji Testnet
```
PortfolioAgentVault: 0x7B45F29E94B7C21E8D3F50A6E8C9F2D1A5E6B8C4
ChainlinkRaffle: 0x3A15D58B02C7E4F6D8B9E2A7C5F1E9D2B6A8C3E7
```

## 🧪 Testing

### Run All Tests
```bash
npx hardhat test
```

### Run Specific Test Files
```bash
# Test main vault functionality
npx hardhat test test/AIPortfolioVault.test.js

# Test Chainlink integration
npx hardhat test test/ChainlinkRaffle.test.js

# Test yield optimization
npx hardhat test test/YieldOptimizer.test.js
```

### Gas Reporting
```bash
npx hardhat test --reporter gas-reporter
```

### Coverage Report
```bash
npx hardhat coverage
```

## 🔗 Protocol Integrations

### Aave Integration
- **Purpose**: Lending and borrowing for yield generation
- **Features**: Automatic aToken minting, interest collection
- **Risk Level**: Low to Medium
- **Supported Assets**: ETH, USDC, DAI

### Lido Integration
- **Purpose**: ETH liquid staking
- **Features**: stETH minting, staking rewards
- **Risk Level**: Low
- **Benefits**: Maintain liquidity while earning staking rewards

### Uniswap V3 Integration
- **Purpose**: Automated liquidity provision
- **Features**:
  - Concentrated liquidity positions
  - Fee collection and compounding
  - Dynamic range management
- **Risk Level**: Medium to High

### 1inch Integration
- **Purpose**: Optimal trade execution
- **Features**:
  - Best price routing
  - Slippage protection
  - Gas optimization

## ⚡ Gas Optimization

### Batch Operations
- Multiple operations in single transaction
- Reduced gas costs for users
- Efficient state updates

### Storage Optimization
- Packed structs for gas efficiency
- Minimal storage reads/writes
- Optimized data structures

### Proxy Patterns
- Upgradeable contracts where needed
- Minimal proxy for agent creation
- Gas-efficient deployment

## 🛡️ Security Features

### Access Control
- Role-based permissions
- Multi-signature requirements for critical functions
- Time locks for sensitive operations

### Emergency Controls
- Pause functionality for emergency situations
- Emergency withdrawal mechanisms
- Circuit breakers for risk management

### Audit Considerations
- Reentrancy protection
- Integer overflow/underflow protection
- External call safety

## 🔧 Configuration

### Hardhat Networks
```javascript
networks: {
  sepolia: {
    url: process.env.SEPOLIA_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 11155111
  },
  ethereum: {
    url: process.env.ETHEREUM_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 1
  },
  avalanche: {
    url: process.env.AVALANCHE_RPC_URL,
    accounts: [process.env.PRIVATE_KEY],
    chainId: 43114
  }
}
```

### Chainlink Configuration
```javascript
// VRF Configuration
vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
keyHash: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c"

// Automation Configuration
keeperRegistry: "0x02777053d6764996e594c3E88AF1D58D5363a2e6"

// Price Feeds
ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
```

## 📊 Monitoring & Analytics

### Contract Events
- Portfolio creation and management events
- Rebalancing execution logs
- Emergency situation alerts
- Performance metrics

### Integration with Frontend
- Real-time event listening
- Transaction status updates
- Portfolio analytics data

## 🔄 Upgrade Strategy

### Proxy Contracts
- Transparent proxy pattern for upgradeable contracts
- Admin controls for upgrades
- Migration procedures

### Version Management
- Semantic versioning for contracts
- Backward compatibility considerations
- Migration scripts

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Chainlink Developer Docs](https://docs.chain.link/)
- [Aave Developer Docs](https://docs.aave.com/developers/)
- [Uniswap V3 Documentation](https://docs.uniswap.org/protocol/introduction)

---

**Security Note**: Always test thoroughly on testnets before mainnet deployment. Consider professional security audits for production use.
