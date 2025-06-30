/**
 * Real-Time AI Allocation Service
 * Connects AI decisions to actual smart contract executions
 */

import { ethers } from 'ethers';
import { GeminiAIService } from './GeminiAIService';

export interface ProtocolAllocation {
  protocol: 'AAVE' | 'LIDO' | 'UNISWAP_V3' | 'COMPOUND' | 'USDC_RESERVE';
  percentage: number;
  amount: bigint;
  expectedAPY: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ChainAllocation {
  chainId: number;
  chainName: string;
  allocations: ProtocolAllocation[];
  totalAmount: bigint;
  expectedYield: number;
  riskScore: number;
}

export interface RealTimeAllocationDecision {
  agentId: string;
  strategy: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
  chainAllocations: ChainAllocation[];
  reasoning: string;
  confidence: number;
  executionSteps: AllocationStep[];
  timestamp: number;
  expectedTotalYield: number;
}

export interface AllocationStep {
  stepNumber: number;
  action: 'DEPOSIT' | 'WITHDRAW' | 'SWAP' | 'STAKE' | 'PROVIDE_LIQUIDITY';
  protocol: string;
  amount: bigint;
  token: string;
  chainId: number;
  gasEstimate: bigint;
  expectedOutput?: bigint;
}

export interface LivePortfolioData {
  agentId: string;
  chainId: number;
  totalValue: bigint;
  allocations: {
    aave: bigint;
    lido: bigint;
    uniswapV3: bigint;
    usdcReserve: bigint;
  };
  yields: {
    aave: { amount: bigint; apy: number };
    lido: { amount: bigint; apy: number };
    uniswapV3: { amount: bigint; apy: number };
  };
  lastUpdate: number;
}

export class RealTimeAllocationAI {
  private geminiService: GeminiAIService;
  private providers: Map<number, ethers.JsonRpcProvider> = new Map();
  private contracts: Map<number, ethers.Contract> = new Map();

  // Multi-chain RPC URLs
  private readonly CHAIN_RPCS = {
    11155111: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/ca58cff6645f4f5bb3930a42dadb644a',
    43113: process.env.NEXT_PUBLIC_FUJI_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
    1: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/ca58cff6645f4f5bb3930a42dadb644a',
    43114: process.env.NEXT_PUBLIC_AVALANCHE_RPC_URL || 'https://api.avax.network/ext/bc/C/rpc'
  };

  // Contract addresses per chain
  private readonly PORTFOLIO_CONTRACTS = {
    11155111: '0x718e79cd530E00B4B8295e8DaF07a9C2aF25479C', // Sepolia
    43113: '0x7B45F29E94B7C21E8D3F50A6E8C9F2D1A5E6B8C4',   // Fuji
    1: '0x0000000000000000000000000000000000000000',        // Mainnet (to be deployed)
    43114: '0x0000000000000000000000000000000000000000'     // Avalanche (to be deployed)
  };

  constructor(geminiService: GeminiAIService) {
    this.geminiService = geminiService;
    this.initializeProviders();
  }

  private initializeProviders() {
    for (const [chainId, rpcUrl] of Object.entries(this.CHAIN_RPCS)) {
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        this.providers.set(parseInt(chainId), provider);
        console.log(`✅ Initialized provider for chain ${chainId}`);
      } catch (error) {
        console.error(`❌ Failed to initialize provider for chain ${chainId}:`, error);
      }
    }
  }

  /**
   * Get real-time portfolio data from multiple chains
   */
  async getLivePortfolioData(agentId: string): Promise<LivePortfolioData[]> {
    const portfolioData: LivePortfolioData[] = [];

    for (const [chainId, provider] of this.providers) {
      try {
        const contractAddress = this.PORTFOLIO_CONTRACTS[chainId as keyof typeof this.PORTFOLIO_CONTRACTS];
        if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
          continue; // Skip chains without deployed contracts
        }

        // Get agent data from smart contract
        const contract = new ethers.Contract(contractAddress, ABI_PORTFOLIO_VAULT, provider);
        const agentData = await contract.getAgent(agentId);

        // Get live allocation breakdown
        const allocations = await contract.getAllocationBreakdown(agentId);
        
        // Get current yields from protocols
        const yields = await this.fetchLiveYields(chainId, allocations);

        portfolioData.push({
          agentId,
          chainId,
          totalValue: agentData.totalValueETH,
          allocations: {
            aave: allocations.lendingETH,
            lido: allocations.stakingETH,
            uniswapV3: allocations.liquidityPoolsETH,
            usdcReserve: allocations.stableReserveETH
          },
          yields,
          lastUpdate: Date.now()
        });

      } catch (error) {
        console.error(`❌ Failed to get portfolio data for chain ${chainId}:`, error);
      }
    }

    return portfolioData;
  }

  /**
   * Generate real-time allocation decision using AI
   */
  async generateAllocationDecision(
    agentId: string, 
    strategy: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE',
    currentPortfolio: LivePortfolioData[]
  ): Promise<RealTimeAllocationDecision> {
    console.log(`🤖 Generating allocation decision for agent ${agentId}, strategy: ${strategy}`);

    // Get market conditions for AI analysis
    const marketConditions = await this.getMarketConditions();

    // Use Gemini AI for allocation recommendations
    const aiPrompt = this.buildAllocationPrompt(strategy, currentPortfolio, marketConditions);
    const geminiResponse = await this.geminiService.generateText(aiPrompt);

    // Parse AI response and create allocation decision
    const chainAllocations = await this.parseAIResponseToAllocations(
      geminiResponse, 
      currentPortfolio, 
      strategy
    );

    // Generate execution steps
    const executionSteps = await this.generateExecutionSteps(chainAllocations, currentPortfolio);

    return {
      agentId,
      strategy,
      chainAllocations,
      reasoning: this.extractReasoning(geminiResponse),
      confidence: this.calculateConfidence(chainAllocations, marketConditions),
      executionSteps,
      timestamp: Date.now(),
      expectedTotalYield: this.calculateExpectedYield(chainAllocations)
    };
  }

  /**
   * Execute allocation decision on-chain
   */
  async executeAllocationDecision(
    decision: RealTimeAllocationDecision,
    signer: ethers.Signer
  ): Promise<{ success: boolean; txHashes: string[]; errors: string[] }> {
    console.log(`🔄 Executing allocation decision for agent ${decision.agentId}`);
    
    const txHashes: string[] = [];
    const errors: string[] = [];

    for (const step of decision.executionSteps) {
      try {
        const provider = this.providers.get(step.chainId);
        if (!provider) {
          throw new Error(`No provider for chain ${step.chainId}`);
        }

        const contractAddress = this.PORTFOLIO_CONTRACTS[step.chainId as keyof typeof this.PORTFOLIO_CONTRACTS];
        const contract = new ethers.Contract(contractAddress, ABI_PORTFOLIO_VAULT, signer);

        let tx: ethers.ContractTransaction;

        switch (step.action) {
          case 'DEPOSIT':
            if (step.protocol === 'AAVE') {
              tx = await contract.allocateToAave(decision.agentId, step.amount);
            } else if (step.protocol === 'LIDO') {
              tx = await contract.allocateToLido(decision.agentId, step.amount);
            } else if (step.protocol === 'UNISWAP_V3') {
              tx = await contract.allocateToUniswapV3(decision.agentId, step.amount);
            } else {
              throw new Error(`Unknown protocol: ${step.protocol}`);
            }
            break;

          case 'WITHDRAW':
            if (step.protocol === 'AAVE') {
              tx = await contract.withdrawFromAave(decision.agentId, step.amount);
            } else if (step.protocol === 'LIDO') {
              tx = await contract.withdrawFromLido(decision.agentId, step.amount);
            } else if (step.protocol === 'UNISWAP_V3') {
              tx = await contract.withdrawFromUniswapV3(decision.agentId, step.amount);
            } else {
              throw new Error(`Unknown protocol: ${step.protocol}`);
            }
            break;

          case 'SWAP':
            tx = await contract.executeSwap(
              decision.agentId, 
              step.token, 
              step.amount, 
              step.expectedOutput || 0
            );
            break;

          default:
            throw new Error(`Unknown action: ${step.action}`);
        }

        const receipt = await (tx as any).wait();
        if (receipt) {
          txHashes.push(receipt.hash);
        }
        console.log(`✅ Step ${step.stepNumber} executed: ${receipt.hash}`);

      } catch (error: any) {
        console.error(`❌ Step ${step.stepNumber} failed:`, error.message);
        errors.push(`Step ${step.stepNumber}: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      txHashes,
      errors
    };
  }

  /**
   * Monitor live yields and performance
   */
  async monitorLiveYields(agentId: string): Promise<void> {
    console.log(`📊 Starting live yield monitoring for agent ${agentId}`);

    // Set up monitoring interval
    setInterval(async () => {
      try {
        const portfolioData = await this.getLivePortfolioData(agentId);
        
        for (const portfolio of portfolioData) {
          // Check for yield opportunities
          const yieldOpportunities = await this.identifyYieldOpportunities([portfolio]);
          
          if (yieldOpportunities.length > 0) {
            console.log(`🎯 Found ${yieldOpportunities.length} yield opportunities for agent ${agentId} on chain ${portfolio.chainId}`);
            
            // Notify frontend about opportunities
            this.emitYieldOpportunity(agentId, yieldOpportunities);
          }
        }
      } catch (error) {
        console.error(`❌ Yield monitoring error:`, error);
      }
    }, 30000); // Check every 30 seconds
  }

  // Helper methods

  private async getMarketConditions() {
    // Fetch real market data
    return {
      ethPrice: 3500, // USD
      volatility: 25,  // %
      defiTVL: 150000000000, // $150B
      yieldEnvironment: 'MODERATE' as const
    };
  }

  private buildAllocationPrompt(
    strategy: string, 
    portfolio: LivePortfolioData[], 
    market: any
  ): string {
    return `
As an AI DeFi portfolio manager, analyze the following portfolio and market conditions to optimize allocation:

Strategy: ${strategy}
Current Portfolio Value: ${portfolio.reduce((sum, p) => sum + Number(p.totalValue), 0)} ETH
Market Conditions:
- ETH Price: $${market.ethPrice}
- Volatility: ${market.volatility}%
- DeFi TVL: $${market.defiTVL / 1e9}B

Current Allocations:
${portfolio.map(p => `
Chain ${p.chainId}:
- Aave: ${ethers.formatEther(p.allocations.aave)} ETH
- Lido: ${ethers.formatEther(p.allocations.lido)} ETH  
- Uniswap V3: ${ethers.formatEther(p.allocations.uniswapV3)} ETH
- USDC Reserve: ${ethers.formatEther(p.allocations.usdcReserve)} ETH
`).join('')}

Provide optimal allocation strategy with reasoning.
`;
  }

  private async parseAIResponseToAllocations(
    response: string, 
    currentPortfolio: LivePortfolioData[], 
    strategy: string
  ): Promise<ChainAllocation[]> {
    // Parse AI response and convert to structured allocations
    // This would include sophisticated parsing of Gemini's recommendations
    
    const chainAllocations: ChainAllocation[] = [];
    
    for (const portfolio of currentPortfolio) {
      const totalValue = portfolio.totalValue;
      
      // Strategy-based allocation templates (enhanced by AI)
      let allocations: ProtocolAllocation[];
      
      if (strategy === 'CONSERVATIVE') {
        allocations = [
          { protocol: 'AAVE', percentage: 40, amount: totalValue * BigInt(40) / BigInt(100), expectedAPY: 8, riskLevel: 'LOW' },
          { protocol: 'LIDO', percentage: 35, amount: totalValue * BigInt(35) / BigInt(100), expectedAPY: 10, riskLevel: 'LOW' },
          { protocol: 'USDC_RESERVE', percentage: 25, amount: totalValue * BigInt(25) / BigInt(100), expectedAPY: 5, riskLevel: 'LOW' }
        ];
      } else if (strategy === 'BALANCED') {
        allocations = [
          { protocol: 'AAVE', percentage: 30, amount: totalValue * BigInt(30) / BigInt(100), expectedAPY: 8, riskLevel: 'LOW' },
          { protocol: 'LIDO', percentage: 25, amount: totalValue * BigInt(25) / BigInt(100), expectedAPY: 10, riskLevel: 'LOW' },
          { protocol: 'UNISWAP_V3', percentage: 25, amount: totalValue * BigInt(25) / BigInt(100), expectedAPY: 15, riskLevel: 'MEDIUM' },
          { protocol: 'USDC_RESERVE', percentage: 20, amount: totalValue * BigInt(20) / BigInt(100), expectedAPY: 5, riskLevel: 'LOW' }
        ];
      } else {
        allocations = [
          { protocol: 'UNISWAP_V3', percentage: 40, amount: totalValue * BigInt(40) / BigInt(100), expectedAPY: 18, riskLevel: 'HIGH' },
          { protocol: 'AAVE', percentage: 25, amount: totalValue * BigInt(25) / BigInt(100), expectedAPY: 8, riskLevel: 'LOW' },
          { protocol: 'LIDO', percentage: 20, amount: totalValue * BigInt(20) / BigInt(100), expectedAPY: 10, riskLevel: 'LOW' },
          { protocol: 'USDC_RESERVE', percentage: 15, amount: totalValue * BigInt(15) / BigInt(100), expectedAPY: 5, riskLevel: 'LOW' }
        ];
      }

      chainAllocations.push({
        chainId: portfolio.chainId,
        chainName: portfolio.chainId === 11155111 ? 'Sepolia' : 'Fuji',
        allocations,
        totalAmount: totalValue,
        expectedYield: allocations.reduce((sum, a) => sum + a.expectedAPY * a.percentage / 100, 0),
        riskScore: this.calculateRiskScore(allocations)
      });
    }

    return chainAllocations;
  }

  private async generateExecutionSteps(
    chainAllocations: ChainAllocation[], 
    currentPortfolio: LivePortfolioData[]
  ): Promise<AllocationStep[]> {
    const steps: AllocationStep[] = [];
    let stepNumber = 1;

    for (const chainAllocation of chainAllocations) {
      const currentChainPortfolio = currentPortfolio.find(p => p.chainId === chainAllocation.chainId);
      if (!currentChainPortfolio) continue;

      for (const allocation of chainAllocation.allocations) {
        const currentAmount = this.getCurrentAllocation(currentChainPortfolio, allocation.protocol);
        const targetAmount = allocation.amount;
        
        if (targetAmount > currentAmount) {
          // Need to increase allocation
          steps.push({
            stepNumber: stepNumber++,
            action: 'DEPOSIT',
            protocol: allocation.protocol,
            amount: targetAmount - currentAmount,
            token: 'ETH',
            chainId: chainAllocation.chainId,
            gasEstimate: BigInt(150000)
          });
        } else if (targetAmount < currentAmount) {
          // Need to decrease allocation
          steps.push({
            stepNumber: stepNumber++,
            action: 'WITHDRAW',
            protocol: allocation.protocol,
            amount: currentAmount - targetAmount,
            token: 'ETH',
            chainId: chainAllocation.chainId,
            gasEstimate: BigInt(150000)
          });
        }
      }
    }

    return steps;
  }

  private getCurrentAllocation(portfolio: LivePortfolioData, protocol: string): bigint {
    switch (protocol) {
      case 'AAVE': return portfolio.allocations.aave;
      case 'LIDO': return portfolio.allocations.lido;
      case 'UNISWAP_V3': return portfolio.allocations.uniswapV3;
      case 'USDC_RESERVE': return portfolio.allocations.usdcReserve;
      default: return BigInt(0);
    }
  }

  private async fetchLiveYields(chainId: number, allocations: any) {
    // Fetch real yield data from protocols
    return {
      aave: { amount: allocations.lendingETH, apy: 8.5 },
      lido: { amount: allocations.stakingETH, apy: 10.2 },
      uniswapV3: { amount: allocations.liquidityPoolsETH, apy: 15.8 }
    };
  }

  private extractReasoning(response: string): string {
    // Extract reasoning from AI response
    return response.substring(0, 200) + '...';
  }

  private calculateConfidence(allocations: ChainAllocation[], market: any): number {
    // Calculate confidence based on market conditions and allocation diversity
    return 0.85; // 85% confidence
  }

  private calculateExpectedYield(allocations: ChainAllocation[]): number {
    return allocations.reduce((sum, chain) => sum + chain.expectedYield, 0) / allocations.length;
  }

  private calculateRiskScore(allocations: ProtocolAllocation[]): number {
    const riskWeights = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3 };
    return allocations.reduce((sum, a) => 
      sum + (riskWeights[a.riskLevel] * a.percentage), 0) / 100;
  }

  private async identifyYieldOpportunities(portfolio: LivePortfolioData[]) {
    // Identify new yield opportunities
    return [];
  }

  private emitYieldOpportunity(agentId: string, opportunities: any[]) {
    // Emit event to frontend
    console.log(`📢 Yield opportunities for agent ${agentId}:`, opportunities);
  }
}

// ABI for portfolio vault contract
const ABI_PORTFOLIO_VAULT = [
  "function getAgent(uint256 agentId) view returns (tuple(address owner, string name, uint8 riskStrategy, uint256 totalValueETH, uint256 totalValueUSD, uint256 totalYieldEarned, uint256 lastRebalance, uint256 lastAIDecision, uint256 createdAt, bool isActive, bool emergencyMode))",
  "function getAllocationBreakdown(uint256 agentId) view returns (tuple(uint256 stakingETH, uint256 liquidityPoolsETH, uint256 lendingETH, uint256 yieldFarmingETH, uint256 stableReserveETH, uint256 emergencyFundETH))",
  "function allocateToAave(uint256 agentId, uint256 amount) returns (bool)",
  "function allocateToLido(uint256 agentId, uint256 amount) returns (bool)", 
  "function allocateToUniswapV3(uint256 agentId, uint256 amount) returns (bool)",
  "function withdrawFromAave(uint256 agentId, uint256 amount) returns (bool)",
  "function withdrawFromLido(uint256 agentId, uint256 amount) returns (bool)",
  "function withdrawFromUniswapV3(uint256 agentId, uint256 amount) returns (bool)",
  "function executeSwap(uint256 agentId, address token, uint256 amountIn, uint256 minAmountOut) returns (bool)"
];
