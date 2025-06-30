/**
 * Enhanced Multi-Chain Portfolio Agent Dashboard
 * Supports Ethereum, Avalanche with independent deposit handling and AI strategies
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TrendingUp, Shield, Zap, RefreshCw, DollarSign, Plus, Network, Target } from 'lucide-react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { contractService } from '@/lib/contractService';

interface PortfolioAgent {
  id: string;
  name: string;
  strategy: 'LOW_RISK' | 'BALANCED' | 'HIGH_RISK';
  chain: string;
  chainId: number;
  ethBalance: bigint;
  usdcBalance: bigint;
  totalValueUSD: bigint;
  lastRebalanceTime: bigint;
  rebalanceInterval: bigint;
  autoRebalanceEnabled: boolean;
  emergencyMode: boolean;
  createdAt: bigint;
  totalYieldGenerated: bigint;
  depositAmount: string; // Individual deposit amount for each agent
}

interface InvestmentBreakdown {
  yieldFarmingUSD: bigint;
  liquidityMiningUSD: bigint;
  stakingUSD: bigint;
  memeCoinUSD: bigint;
  stableReserveUSD: bigint;
  totalInvestedUSD: bigint;
}

interface TokenPosition {
  tokenName: string;
  protocol: string;
  amount: bigint;
  valueUSD: bigint;
  category: bigint;
  apy: bigint;
  entryTime: bigint;
  isActive: boolean;
}

interface AgentActivity {
  timestamp: bigint;
  action: string;
  details: string;
  amountUSD: bigint;
  txHash: string;
}

// Chain configurations with strategy recommendations
const CHAIN_CONFIGS: Record<number, {
  name: string;
  symbol: string;
  color: string;
  bestFor: string[];
  avgAPY: string;
}> = {
  1: {
    name: 'Ethereum',
    symbol: 'ETH',
    color: 'bg-blue-600',
    bestFor: ['Yield Farming', 'Blue-chip DeFi'],
    avgAPY: '8-15%'
  },
  11155111: {
    name: 'Sepolia',
    symbol: 'ETH',
    color: 'bg-gray-600',
    bestFor: ['Testing', 'Development'],
    avgAPY: '5-12%'
  },
  43114: {
    name: 'Avalanche',
    symbol: 'AVAX',
    color: 'bg-red-600',
    bestFor: ['High Yield', 'Fast Transactions'],
    avgAPY: '12-25%'
  },
  43113: {
    name: 'Fuji',
    symbol: 'AVAX',
    color: 'bg-red-400',
    bestFor: ['Testing', 'Development'],
    avgAPY: '8-18%'
  }
};

// Enhanced strategy configurations with chain-specific recommendations
const STRATEGY_CONFIG: Record<string, {
  name: string;
  description: string;
  icon: any;
  color: string;
  expectedAPY: string;
  recommendations: Record<number, string>;
}> = {
  LOW_RISK: {
    name: 'Conservative',
    description: 'Focus on stable yields with minimal risk',
    icon: Shield,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    expectedAPY: '5-10%',
    recommendations: {
      1: 'AAVE lending, Compound, stable LPs',
      11155111: 'Mock yield farming protocols',
      43114: 'Trader Joe stable pools, AAVE',
      43113: 'Testnet stable farming'
    }
  },
  BALANCED: {
    name: 'Balanced',
    description: 'Moderate risk for optimal risk-adjusted returns',
    icon: TrendingUp,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    expectedAPY: '10-18%',
    recommendations: {
      1: 'Uniswap V3, Curve pools, yield farming',
      11155111: 'Mixed protocol simulation',
      43114: 'Pangolin, Yield Yak strategies',
      43113: 'Multi-protocol testnet'
    }
  },
  HIGH_RISK: {
    name: 'Aggressive',
    description: 'Maximum yield hunting with higher volatility',
    icon: Zap,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    expectedAPY: '18-35%',
    recommendations: {
      1: 'Leveraged farming, new protocols',
      11155111: 'High volatility simulation',
      43114: 'New DeFi protocols, leverage',
      43113: 'Experimental strategies'
    }
  }
};

interface PortfolioAgentDashboardProps {
  onDataUpdate?: (data: { portfolioValue: number; totalYield: number; activeAgents: number; }) => void;
}

export default function PortfolioAgentDashboard({ onDataUpdate }: PortfolioAgentDashboardProps = {}) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [agents, setAgents] = useState<PortfolioAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<PortfolioAgent | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [investmentBreakdowns, setInvestmentBreakdowns] = useState<{[agentId: string]: InvestmentBreakdown}>({});
  const [agentPositions, setAgentPositions] = useState<{[agentId: string]: TokenPosition[]}>({});
  const [agentActivities, setAgentActivities] = useState<{[agentId: string]: AgentActivity[]}>({});

  // Form states
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentStrategy, setNewAgentStrategy] = useState<'LOW_RISK' | 'BALANCED' | 'HIGH_RISK'>('BALANCED');
  const [newAgentChain, setNewAgentChain] = useState<number>(chainId || 11155111);
  const [newAgentInterval, setNewAgentInterval] = useState(24);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawType, setWithdrawType] = useState<'ETH' | 'USDC'>('ETH');

  // Load agents when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      loadAgents();
    }
  }, [isConnected, address]);

  const loadAgents = async () => {
    if (!address) return;

    setLoading(true);
    console.log('🔍 Loading agents for address:', address);
    
    try {
      // Clear any existing agents first
      setAgents([]);
      
      // Try to load real agents from contract
      const userAgents = await contractService.getUserAgents(address);
      console.log('✅ User agents from contract:', userAgents);

      // Convert the real agent data if available, otherwise use empty array
      const realAgents: PortfolioAgent[] = [];

      if (userAgents && Array.isArray(userAgents) && userAgents.length > 0) {
        for (const agentId of userAgents) {
          try {
            const agentData = await contractService.getAgent(agentId);
            console.log(`🤖 Agent ${agentId} data:`, agentData);
            
            if (agentData) {
              // Convert contract data to our interface
              const agent: PortfolioAgent = {
                id: agentId.toString(),
                name: agentData.name || `Agent ${agentId}`,
                strategy: agentData.strategy === 0 ? 'LOW_RISK' : agentData.strategy === 1 ? 'BALANCED' : 'HIGH_RISK',
                chain: CHAIN_CONFIGS[chainId]?.name || 'Unknown',
                chainId: chainId,
                ethBalance: agentData.totalValueETH || BigInt(0),
                usdcBalance: BigInt(0), // Not available in current contract
                totalValueUSD: agentData.totalValueUSD || BigInt(0),
                lastRebalanceTime: agentData.lastRebalance || BigInt(0),
                rebalanceInterval: BigInt(86400), // Default 24 hours
                autoRebalanceEnabled: false, // Default
                emergencyMode: agentData.emergencyMode || false,
                createdAt: agentData.createdAt || BigInt(Math.floor(Date.now() / 1000)),
                totalYieldGenerated: agentData.totalYieldEarned || BigInt(0),
                depositAmount: '' // Individual deposit amount for this agent
              };
              
              console.log(`✅ Converted agent ${agentId}:`, agent);
              realAgents.push(agent);
            }
          } catch (err) {
            console.error(`❌ Error loading agent ${agentId}:`, err);
          }
        }
      }

      console.log(`🎯 Final agents array (${realAgents.length} agents):`, realAgents);
      setAgents(realAgents);

      // Calculate portfolio statistics and update parent
      if (onDataUpdate) {
        const portfolioValue = realAgents.reduce((total, agent) =>
          total + parseFloat(formatEther(agent.totalValueUSD)), 0
        );
        const totalYield = realAgents.reduce((total, agent) =>
          total + parseFloat(formatEther(agent.totalYieldGenerated)), 0
        );
        const activeAgents = realAgents.length;

        onDataUpdate({
          portfolioValue,
          totalYield,
          activeAgents
        });
      }

      // Load investment breakdowns for each agent
      for (const agent of realAgents) {
        await loadInvestmentBreakdown(agent.id);
        await loadAgentPositions(agent.id);
        await loadAgentActivities(agent.id);
      }

    } catch (err) {
      console.error('Error loading agents:', err);
      setError('Failed to load agents from contract');
      // Start with empty agents array for new users
      setAgents([]);

      // Update parent with zero values when no agents or error
      if (onDataUpdate) {
        onDataUpdate({
          portfolioValue: 0,
          totalYield: 0,
          activeAgents: 0
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadInvestmentBreakdown = async (agentId: string) => {
    try {
      const breakdown = await contractService.getAgentInvestmentBreakdown(agentId);
      setInvestmentBreakdowns(prev => ({
        ...prev,
        [agentId]: {
          yieldFarmingUSD: breakdown[0],
          liquidityMiningUSD: breakdown[1],
          stakingUSD: breakdown[2],
          memeCoinUSD: breakdown[3],
          stableReserveUSD: breakdown[4],
          totalInvestedUSD: breakdown[5]
        }
      }));
    } catch (err) {
      console.error(`Error loading breakdown for agent ${agentId}:`, err);
    }
  };

  const loadAgentPositions = async (agentId: string) => {
    try {
      const positions = await contractService.getAgentPositions(agentId);
      setAgentPositions(prev => ({
        ...prev,
        [agentId]: positions as TokenPosition[]
      }));
    } catch (err) {
      console.error(`Error loading positions for agent ${agentId}:`, err);
    }
  };

  const loadAgentActivities = async (agentId: string) => {
    try {
      const activities = await contractService.getAgentActivities(agentId, 20);
      setAgentActivities(prev => ({
        ...prev,
        [agentId]: activities as AgentActivity[]
      }));
    } catch (err) {
      console.error(`Error loading activities for agent ${agentId}:`, err);
    }
  };

  const createAgent = async () => {
    if (!address || !newAgentName.trim()) return;

    // Switch to selected chain if different from current
    if (newAgentChain !== chainId) {
      try {
        await switchChain({ chainId: newAgentChain });
      } catch (err) {
        console.error('Failed to switch chain:', err);
        setError('Please switch to the selected network to create the agent');
        return;
      }
    }

    setLoading(true);
    try {
      const strategyIndex = newAgentStrategy === 'LOW_RISK' ? 0 : newAgentStrategy === 'BALANCED' ? 1 : 2;
      const intervalSeconds = BigInt(newAgentInterval * 3600);

      await contractService.createAgent(
        newAgentName,
        strategyIndex,
        address
      );

      setNewAgentName('');
      setShowCreateForm(false);
      await loadAgents();
    } catch (err) {
      console.error('Error creating agent:', err);
      setError('Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  const depositToAgent = async (agentId: string, amount: string) => {
    if (!address || !amount) return;

    setLoading(true);
    try {
      const depositAmount = parseEther(amount);
      await contractService.depositETH(parseInt(agentId), amount, address);

      // Clear the deposit amount for this specific agent
      setAgents(prev => prev.map(agent =>
        agent.id === agentId
          ? { ...agent, depositAmount: '' }
          : agent
      ));

      await loadAgents();
      await loadInvestmentBreakdown(agentId);
    } catch (err) {
      console.error('Error depositing:', err);
      setError('Failed to deposit');
    } finally {
      setLoading(false);
    }
  };

  const updateAgentDepositAmount = (agentId: string, amount: string) => {
    setAgents(prev => prev.map(agent =>
      agent.id === agentId
        ? { ...agent, depositAmount: amount }
        : agent
    ));
  };

  const withdrawFromAgent = async (agentId: string) => {
    if (!address || !withdrawAmount) return;

    setLoading(true);
    try {
      if (withdrawType === 'ETH') {
        await contractService.withdrawETH(parseInt(agentId), withdrawAmount, address);
      } else {
        // USDC has 6 decimals
        const usdcAmount = (parseFloat(withdrawAmount) * 1e6).toString();
        await contractService.withdrawUSDC(parseInt(agentId), usdcAmount, address);
      }

      setWithdrawAmount('');
      await loadAgents();
    } catch (err) {
      console.error('Error withdrawing:', err);
      setError('Failed to withdraw');
    } finally {
      setLoading(false);
    }
  };

  const rebalanceAgent = async (agentId: string) => {
    if (!address) return;

    setLoading(true);
    try {
      await contractService.rebalanceAgent(parseInt(agentId), address);
      await loadAgents();
      // Reload investment breakdown for this agent
      await loadInvestmentBreakdown(agentId);
    } catch (err) {
      console.error('Error rebalancing:', err);
      setError('Failed to rebalance');
    } finally {
      setLoading(false);
    }
  };

  const toggleAutoRebalance = async (agentId: string) => {
    if (!address) return;

    setLoading(true);
    try {
      await contractService.toggleAutoRebalance(parseInt(agentId), address);
      await loadAgents();
    } catch (err) {
      console.error('Error toggling auto-rebalance:', err);
      setError('Failed to toggle auto-rebalance');
    } finally {
      setLoading(false);
    }
  };

  const activateEmergencySwap = async (agentId: string) => {
    if (!address) return;

    const confirmed = confirm(
      'Are you sure you want to activate emergency mode? This will swap all assets to USDC.'
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      await contractService.activateEmergencySwap(parseInt(agentId), address);
      await loadAgents();
      // Reload investment breakdown for this agent
      await loadInvestmentBreakdown(agentId);
    } catch (err) {
      console.error('Error activating emergency swap:', err);
      setError('Failed to activate emergency swap');
    } finally {
      setLoading(false);
    }
  };

  const restartAgent = async (agentId: string) => {
    if (!address) return;

    const confirmed = confirm(
      'Are you sure you want to restart this agent? This will reactivate auto-rebalancing and resume AI allocation.'
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      await contractService.restartAgent(parseInt(agentId), address);
      await loadAgents();
      // Reload additional data
      await loadInvestmentBreakdown(agentId);
      await loadAgentPositions(agentId);
      await loadAgentActivities(agentId);
    } catch (err) {
      console.error('Error restarting agent:', err);
      setError('Failed to restart agent');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Portfolio Agent Dashboard</CardTitle>
          <CardDescription>Connect your wallet to manage your portfolio agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please connect your wallet to continue</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <p className="text-red-600">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Agents</h1>
          <p className="text-muted-foreground">Manage your AI-powered DeFi portfolios</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          disabled={loading}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Agent</span>
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Portfolio Agent</CardTitle>
            <CardDescription>Set up an AI-powered portfolio management agent across multiple chains</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input
                  id="agent-name"
                  placeholder="e.g., Conservative ETH Portfolio"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chain">Deployment Chain</Label>
                <Select value={newAgentChain.toString()} onValueChange={(value) => setNewAgentChain(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CHAIN_CONFIGS).map(([chainId, config]) => (
                      <SelectItem key={chainId} value={chainId}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                          <span>{config.name}</span>
                          <Badge variant="outline" className="text-xs">{config.avgAPY}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Best for: {CHAIN_CONFIGS[newAgentChain]?.bestFor.join(', ')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="strategy">Investment Strategy</Label>
                <Select value={newAgentStrategy} onValueChange={(value: any) => setNewAgentStrategy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STRATEGY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center space-x-2">
                          <config.icon className="h-4 w-4" />
                          <span>{config.name} ({config.expectedAPY})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  AI Recommendation: {STRATEGY_CONFIG[newAgentStrategy].recommendations[newAgentChain] || 'General DeFi protocols'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interval">Rebalance Interval (hours)</Label>
                <Select value={newAgentInterval.toString()} onValueChange={(value) => setNewAgentInterval(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Chain Warning */}
            {newAgentChain !== chainId && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <div className="flex items-center space-x-2">
                  <Network className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    You'll need to switch to {CHAIN_CONFIGS[newAgentChain]?.name} network to create this agent
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={createAgent} disabled={loading || !newAgentName.trim()}>
                {loading ? 'Creating...' : 'Create Agent'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const config = STRATEGY_CONFIG[agent.strategy];
          const IconComponent = config.icon;
          const breakdown = investmentBreakdowns[agent.id];

          return (
            <Card key={agent.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${CHAIN_CONFIGS[agent.chainId]?.color || 'bg-gray-400'}`}></div>
                        <span className="text-xs text-muted-foreground">{agent.chain}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={config.color}>
                      <IconComponent className="h-3 w-3 mr-1" />
                      {config.name}
                    </Badge>
                    {agent.emergencyMode && (
                      <Badge variant="destructive">Emergency</Badge>
                    )}
                  </div>
                </div>
                <CardDescription>
                  {config.description} • Expected: {config.expectedAPY}
                  <br />
                  <span className="text-xs">
                    AI Strategy: {config.recommendations[agent.chainId] || 'General DeFi protocols'}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="breakdown">Investment</TabsTrigger>
                    <TabsTrigger value="positions">Positions</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">ETH Balance</p>
                        <p className="font-medium">{formatEther(agent.ethBalance)} ETH</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">USDC Balance</p>
                        <p className="font-medium">{(Number(agent.usdcBalance) / 1e6).toFixed(2)} USDC</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Value</p>
                        <p className="font-medium">${(Number(agent.totalValueUSD) / 1e8).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Yield</p>
                        <p className="font-medium text-green-600">${(Number(agent.totalYieldGenerated) / 1e8).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Auto-Rebalance</span>
                      <Button
                        variant={agent.autoRebalanceEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleAutoRebalance(agent.id)}
                        disabled={loading || agent.emergencyMode}
                      >
                        {agent.autoRebalanceEnabled ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="breakdown" className="space-y-3">
                    {breakdown ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">🌾 Yield Farming</span>
                          <span className="font-medium">${(Number(breakdown.yieldFarmingUSD) / 1e8).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">💧 Liquidity Mining</span>
                          <span className="font-medium">${(Number(breakdown.liquidityMiningUSD) / 1e8).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">🔒 Staking</span>
                          <span className="font-medium">${(Number(breakdown.stakingUSD) / 1e8).toFixed(2)}</span>
                        </div>
                        {breakdown.memeCoinUSD > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">🎯 Meme Coins</span>
                            <span className="font-medium">${(Number(breakdown.memeCoinUSD) / 1e8).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">💰 Stable Reserve</span>
                          <span className="font-medium">${(Number(breakdown.stableReserveUSD) / 1e8).toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Total Invested</span>
                          <span>${(Number(breakdown.totalInvestedUSD) / 1e8).toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No investments yet</p>
                    )}
                  </TabsContent>

                  <TabsContent value="positions" className="space-y-3">
                    {agentPositions[agent.id] && agentPositions[agent.id].length > 0 ? (
                      <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
                        {agentPositions[agent.id].map((position, index) => (
                          <div key={index} className="border rounded-lg p-2 space-y-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{position.tokenName}</p>
                                <p className="text-xs text-muted-foreground">{position.protocol}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">${(Number(position.valueUSD) / 1e8).toFixed(2)}</p>
                                <p className="text-xs text-green-600">{(Number(position.apy) / 100).toFixed(1)}% APY</p>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Entered: {new Date(Number(position.entryTime) * 1000).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No active positions</p>
                    )}
                  </TabsContent>

                  <TabsContent value="activity" className="space-y-3">
                    {agentActivities[agent.id] && agentActivities[agent.id].length > 0 ? (
                      <div className="space-y-2 text-sm max-h-40 overflow-y-auto">
                        {agentActivities[agent.id].slice(0, 10).map((activity, index) => (
                          <div key={index} className="border-l-2 border-blue-200 pl-3 py-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{activity.action}</p>
                                <p className="text-xs text-muted-foreground">{activity.details}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium">${(Number(activity.amountUSD) / 1e8).toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(Number(activity.timestamp) * 1000).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No recent activity</p>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Emergency Mode Controls */}
                {agent.emergencyMode && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Emergency Mode Active</span>
                    </div>
                    <p className="text-xs text-orange-700">All assets have been moved to stable reserves. You can restart the agent or deposit more funds.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => restartAgent(agent.id)}
                      disabled={loading}
                      className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
                    >
                      🚀 Restart Agent
                    </Button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3 pt-3 border-t">
                  {/* Deposit Section */}
                  <div className="space-y-2">
                    <Label htmlFor={`deposit-${agent.id}`} className="text-sm font-medium">Deposit ETH</Label>
                    <div className="flex space-x-2">
                      <Input
                        id={`deposit-${agent.id}`}
                        type="number"
                        placeholder="Amount in ETH"
                        value={agent.depositAmount}
                        onChange={(e) => updateAgentDepositAmount(agent.id, e.target.value)}
                        className="flex-1"
                        step="0.01"
                        min="0"
                      />
                      <Button
                        onClick={() => depositToAgent(agent.id, agent.depositAmount)}
                        disabled={loading || !agent.depositAmount || agent.emergencyMode}
                        size="sm"
                        className="px-4"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Deposit
                      </Button>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAgent(agent)}
                      disabled={loading || (Number(agent.ethBalance) === 0 && Number(agent.usdcBalance) === 0)}
                      className="text-xs"
                    >
                      <DollarSign className="h-3 w-3 mr-1" />
                      Withdraw
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => activateEmergencySwap(agent.id)}
                      disabled={loading || agent.emergencyMode || Number(agent.ethBalance) === 0}
                      className="text-xs text-orange-600 border-orange-300 hover:bg-orange-50"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Swap to USDC
                    </Button>
                  </div>

                  {/* Manual Controls */}
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rebalanceAgent(agent.id)}
                      disabled={loading || agent.emergencyMode || Number(agent.totalValueUSD) === 0}
                      className="text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Manual Rebalance
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {agents.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Portfolio Agents Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first AI-powered portfolio agent to get started</p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Agent
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Withdraw Modal */}
      {selectedAgent && (
        <Card className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Withdraw from {selectedAgent.name}</h3>

            <div className="space-y-4">
              <div>
                <Label>Asset Type</Label>
                <Select value={withdrawType} onValueChange={(value: 'ETH' | 'USDC') => setWithdrawType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ETH">ETH (Balance: {formatEther(selectedAgent.ethBalance)})</SelectItem>
                    <SelectItem value="USDC">USDC (Balance: {(Number(selectedAgent.usdcBalance) / 1e6).toFixed(2)})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Amount to Withdraw</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={`Enter amount in ${withdrawType}`}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => withdrawFromAgent(selectedAgent.id)}
                  disabled={loading || !withdrawAmount}
                  className="flex-1"
                >
                  Withdraw {withdrawType}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedAgent(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
