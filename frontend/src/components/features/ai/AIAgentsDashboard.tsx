'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAccount, useConnect, useChainId, useSwitchChain } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { contractService } from '@/lib/contractService';
import { SUPPORTED_CHAINS } from '@/contracts/addresses';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  DollarSign,
  BarChart3,
  RefreshCw,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';

interface AIAgent {
  id: number;
  owner: string;
  name: string;
  riskStrategy: number;
  totalValueETH: bigint;
  totalValueUSD: bigint;
  lastRebalance: bigint;
  lastAIDecision: bigint;
  isActive: boolean;
  createdAt: bigint;
  totalYieldEarned: bigint;
}

interface AgentActivity {
  timestamp: bigint;
  action: string;
  amount: bigint;
  details: string;
  formattedTime: string;
  formattedAmount: string;
}

export default function AIAgentsDashboard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create agent form
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentStrategy, setNewAgentStrategy] = useState(1);
  const [rebalanceInterval, setRebalanceInterval] = useState(24); // Default 24 hours
  const [selectedChainId, setSelectedChainId] = useState(11155111); // Default to Sepolia
  const [depositAmount, setDepositAmount] = useState('');

  // Real-time updates
  const [eventUnwatch, setEventUnwatch] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      loadUserAgents();
      subscribeToEvents();
    }

    return () => {
      if (eventUnwatch) {
        eventUnwatch();
      }
    };
  }, [isConnected, address]);

  useEffect(() => {
    if (selectedAgent) {
      loadAgentActivities(selectedAgent.id);
    }
  }, [selectedAgent]);

  const loadUserAgents = async () => {
    if (!address) return;

    try {
      setLoading(true);
      // Use enhanced AI Portfolio agents instead of basic AI agents
      const userAgents = await contractService.getUserAIPortfolioAgents(address);
      // Convert Agent to AIAgent format
      const aiAgents: AIAgent[] = userAgents.map(agent => ({
        ...agent,
        riskStrategy: agent.strategy,
        isActive: true // Assume all agents are active for now
      }));
      setAgents(aiAgents);

      if (aiAgents.length > 0 && !selectedAgent) {
        setSelectedAgent(aiAgents[0]);
      }
    } catch (err) {
      console.error('Error loading AI portfolio agents:', err);
      setError('Failed to load AI portfolio agents');
    } finally {
      setLoading(false);
    }
  };

  const loadAgentActivities = async (agentId: number) => {
    try {
      // Load both activities and AI decisions for comprehensive view
      const [agentActivities, aiDecisions] = await Promise.all([
        contractService.getAIPortfolioAgentActivities(agentId, 20),
        contractService.getAIPortfolioAgentDecisions(agentId, 10)
      ]);

      // Combine activities with AI decisions for a complete timeline
      const combinedActivities = [
        ...agentActivities,
        ...aiDecisions.map((decision: any) => ({
          timestamp: decision.timestamp,
          action: `AI Decision: ${decision.action}`,
          amount: decision.amount,
          details: `${decision.reasoning} (Confidence: ${decision.confidence}%, Expected Yield: ${formatEther(decision.expectedYield || BigInt(0))} ETH)`,
          formattedTime: new Date(Number(decision.timestamp) * 1000).toLocaleString(),
          formattedAmount: formatEther(decision.amount || BigInt(0)) + ' ETH'
        }))
      ].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

      setActivities(combinedActivities);
    } catch (err) {
      console.error('Error loading agent activities:', err);
    }
  };

  const subscribeToEvents = async () => {
    try {
      const unwatch = await contractService.subscribeToAIPortfolioEvents((event) => {
        console.log('🔄 Real-time AI Portfolio event:', event);

        // Refresh data when relevant events occur
        if (event.eventName === 'FundsDeposited' ||
            event.eventName === 'TradeExecuted' ||
            event.eventName === 'RebalanceExecuted' ||
            event.eventName === 'AIAllocationExecuted') {
          loadUserAgents();
          if (selectedAgent) {
            loadAgentActivities(selectedAgent.id);
          }
        }

        // Show real-time notifications for AI actions
        if (event.eventName === 'AIAllocationExecuted') {
          setSuccess(`🤖 AI allocated to ${event.args.protocol}: ${event.args.reasoning}`);
          setTimeout(() => setSuccess(''), 8000);
        }

        if (event.eventName === 'TradeExecuted') {
          setSuccess(`🔄 AI Trade: ${event.args.action} completed`);
          setTimeout(() => setSuccess(''), 5000);
        }

        if (event.eventName === 'RebalanceExecuted') {
          setSuccess(`⚖️ Portfolio rebalanced: ${event.args.reason}`);
          setTimeout(() => setSuccess(''), 6000);
        }
      });

      setEventUnwatch(() => unwatch);
    } catch (err) {
      console.error('Error subscribing to events:', err);
    }
  };  const createAgent = async () => {
    if (!newAgentName.trim()) {
      setError('Please enter an agent name');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Create agent on current chain (Sepolia for now)
      const hash = await contractService.createAIPortfolioAgent(
        newAgentName,
        newAgentStrategy
      );

      setSuccess(`🤖 AI Portfolio Agent created! Transaction: ${hash.slice(0, 10)}...`);
      setNewAgentName('');

      // Refresh agents
      setTimeout(() => {
        loadUserAgents();
      }, 3000);

    } catch (err: any) {
      console.error('Error creating AI portfolio agent:', err);
      setError(err.message || 'Failed to create AI portfolio agent');
    } finally {
      setLoading(false);
    }
  };

  const depositToAgent = async () => {
    if (!selectedAgent || !depositAmount) {
      setError('Please select an agent and enter deposit amount');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const hash = await contractService.depositToAIPortfolioAgent(
        selectedAgent.id,
        depositAmount
      );

      setSuccess(`💰 Deposited ${depositAmount} ETH! AI is now allocating to DeFi protocols. Tx: ${hash.slice(0, 10)}...`);
      setDepositAmount('');

      // Refresh data
      setTimeout(() => {
        loadUserAgents();
        loadAgentActivities(selectedAgent.id);
      }, 5000);

    } catch (err: any) {
      console.error('Error depositing:', err);
      setError(err.message || 'Failed to deposit to AI portfolio agent');
    } finally {
      setLoading(false);
    }
  };

  const manualRebalance = async () => {
    if (!selectedAgent) return;

    try {
      setLoading(true);
      setError('');

      // Use enhanced AI Portfolio Vault manual rebalancing
      const hash = await contractService.manualRebalanceAIAgent(selectedAgent.id);
      setSuccess(`⚖️ Manual rebalance initiated: ${hash.slice(0, 10)}... AI is analyzing and rebalancing portfolio!`);

      // Refresh data after a delay to show rebalancing results
      setTimeout(() => {
        loadUserAgents();
        loadAgentActivities(selectedAgent.id);
      }, 8000);

    } catch (err: any) {
      console.error('Error rebalancing AI portfolio agent:', err);
      setError(err.message || 'Failed to rebalance AI portfolio agent');
    } finally {
      setLoading(false);
    }
  };

  const getStrategyInfo = (strategy: number) => {
    const strategies = [
      {
        name: 'Conservative AI',
        color: 'bg-green-100 text-green-800',
        risk: 'Low Risk',
        description: 'AI allocates to stable protocols: Aave lending, USDC reserves'
      },
      {
        name: 'Balanced AI',
        color: 'bg-yellow-100 text-yellow-800',
        risk: 'Medium Risk',
        description: 'AI balances between Aave, Lido staking, and stable reserves'
      },
      {
        name: 'Aggressive AI',
        color: 'bg-red-100 text-red-800',
        risk: 'High Risk',
        description: 'AI uses Uniswap trading, active rebalancing, higher yield protocols'
      }
    ];
    return strategies[strategy] || strategies[1];
  };

  const formatUSD = (amount: bigint) => {
    const usd = Number(amount) / 1e8; // Assuming 8 decimals for USD value
    return `$${usd.toFixed(2)}`;
  };

  const getTimeSinceLastRebalance = (lastRebalance: bigint) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - Number(lastRebalance);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return `${hours}h ${minutes}m ago`;
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-4">
              Connect your wallet to view and manage your AI agents
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🤖 AI Portfolio Agents</h1>
          <p className="text-muted-foreground mt-2">
            Advanced AI-powered DeFi portfolio management with real-time allocation to Aave, Lido, Uniswap, 1inch and more
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Activity className="h-4 w-4 mr-1" />
            AI Active
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Zap className="h-4 w-4 mr-1" />
            Real-time
          </Badge>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="agents">My Agents ({agents.length})</TabsTrigger>
          <TabsTrigger value="create">Create Agent</TabsTrigger>
          <TabsTrigger value="activity">Real-time Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-6">
          {agents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No AI Portfolio Agents Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first AI portfolio agent to start automated DeFi yield optimization with real-time allocation to Aave, Lido, Uniswap, and 1inch
                </p>
                <Button onClick={() => {
                  const createTab = document.querySelector('[value="create"]') as HTMLElement;
                  createTab?.click();
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First AI Agent
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Agents List */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-lg font-semibold">Your Agents</h3>
                {agents.map((agent) => {
                  const strategyInfo = getStrategyInfo(agent.riskStrategy);
                  return (
                    <Card
                      key={agent.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedAgent?.id === agent.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedAgent(agent)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">Agent #{agent.id}</h4>
                          <Badge className={strategyInfo.color}>
                            {strategyInfo.name}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Value:</span>
                            <span className="font-medium">{formatUSD(agent.totalValueUSD)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <span className={agent.isActive ? 'text-green-600' : 'text-red-600'}>
                              {agent.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Last Rebalance:</span>
                            <span className="text-xs">{getTimeSinceLastRebalance(agent.lastRebalance)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Selected Agent Details */}
              <div className="lg:col-span-2 space-y-6">
                {selectedAgent && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Agent #{selectedAgent.id} Details</span>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={manualRebalance}
                              disabled={loading}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Rebalance
                            </Button>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Total Value</Label>
                            <div className="text-2xl font-bold text-green-600">
                              {formatUSD(selectedAgent.totalValueUSD)}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Strategy Allocation</Label>
                            <div className="space-y-1">
                              {contractService.getStrategyAllocations(selectedAgent.riskStrategy).map((allocation, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                  <span>{allocation.name}:</span>
                                  <span>{allocation.percentage}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Deposit More Funds</Label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="ETH amount (e.g., 0.1)"
                              value={depositAmount}
                              onChange={(e) => setDepositAmount(e.target.value)}
                              step="0.01"
                            />
                            <Button onClick={depositToAgent} disabled={loading}>
                              <Zap className="h-4 w-4 mr-1" />
                              Deposit & AI Allocate
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Real-time Activity Feed */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          Real-time Activity Feed
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {activities.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                              No activity yet. Deposit funds to start AI allocation.
                            </p>
                          ) : (
                            activities.map((activity, i) => (
                              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                                <div className="flex-shrink-0 mt-1">
                                  {activity.action?.includes('Trade') && <TrendingUp className="h-4 w-4 text-green-600" />}
                                  {activity.action?.includes('Deposit') && <DollarSign className="h-4 w-4 text-blue-600" />}
                                  {activity.action?.includes('Rebalance') && <RefreshCw className="h-4 w-4 text-purple-600" />}
                                  {activity.action?.includes('Aave') && <BarChart3 className="h-4 w-4 text-purple-600" />}
                                  {activity.action?.includes('Lido') && <TrendingUp className="h-4 w-4 text-orange-600" />}
                                  {!activity.action?.includes('Trade') && !activity.action?.includes('Deposit') &&
                                   !activity.action?.includes('Rebalance') && !activity.action?.includes('Aave') &&
                                   !activity.action?.includes('Lido') && <Activity className="h-4 w-4 text-gray-600" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium text-sm">{activity.action || 'Unknown Activity'}</p>
                                    <span className="text-xs text-muted-foreground">{activity.formattedTime || 'Unknown time'}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">{activity.details || 'No details available'}</p>
                                  {activity.amount && activity.amount > 0 && (
                                    <p className="text-xs font-medium text-green-600 mt-1">
                                      {activity.formattedAmount || formatEther(activity.amount)} ETH
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>🤖 Create New AI Portfolio Agent</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create an AI-powered agent that will automatically allocate your funds to DeFi protocols like Aave, Lido, Uniswap, and 1inch based on real-time market analysis
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agentName">Agent Name</Label>
                <Input
                  id="agentName"
                  placeholder="e.g., Conservative Yield Hunter"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="strategy">Risk Strategy</Label>
                <select
                  id="strategy"
                  className="w-full p-2 border rounded-md"
                  value={newAgentStrategy}
                  onChange={(e) => setNewAgentStrategy(Number(e.target.value))}
                >
                  <option value={0}>Conservative (Low Risk) - Focus on Aave, Lido staking, stable reserves</option>
                  <option value={1}>Balanced (Medium Risk) - Mix of yield farming, liquidity mining, staking</option>
                  <option value={2}>Aggressive (High Risk) - High-yield farming, active trading, meme coins</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rebalanceInterval">Auto-Rebalance Interval</Label>
                <select
                  id="rebalanceInterval"
                  className="w-full p-2 border rounded-md"
                  value={rebalanceInterval}
                  onChange={(e) => setRebalanceInterval(Number(e.target.value))}
                >
                  <option value={1}>Every 1 Hour (High Frequency)</option>
                  <option value={4}>Every 4 Hours</option>
                  <option value={12}>Every 12 Hours</option>
                  <option value={24}>Every 24 Hours (Recommended)</option>
                  <option value={48}>Every 48 Hours</option>
                  <option value={168}>Weekly (168 Hours)</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Chainlink Automation will trigger rebalancing at this interval based on market conditions
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  🌐 Deploying on Sepolia Testnet. Make sure you have Sepolia ETH for gas fees.
                </p>
              </div>

              <Button onClick={createAgent} disabled={loading} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {loading ? 'Creating Agent...' : 'Create AI Agent'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Global AI Activity Stream</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Real-time activity monitoring for all your AI agents will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
