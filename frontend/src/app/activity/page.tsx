'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Activity, ArrowUpRight, ArrowDownLeft, Zap, PauseCircle, TrendingUp, Calendar, ExternalLink } from 'lucide-react';
import { formatEther } from 'viem';

interface ActivityItem {
  id: string;
  type: 'agent_created' | 'deposit' | 'withdrawal' | 'rebalance' | 'emergency_swap' | 'agent_paused' | 'raffle_entry' | 'raffle_win';
  timestamp: number;
  amount?: bigint;
  token?: string;
  agentId?: string;
  agentName?: string;
  txHash?: string;
  chainId: number;
  description: string;
}

export default function ActivityPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      fetchActivities();
    }
  }, [address, chainId]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      if (!address) {
        setActivities([]);
        setLoading(false);
        return;
      }

      // For now, return empty activities since this page is for AI Portfolio features
      // which are not part of the current raffle system implementation
      setActivities([]);
      
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to map contract action to activity type
  const getActivityType = (action: string): ActivityItem['type'] => {
    switch (action.toLowerCase()) {
      case 'agent_created':
      case 'agentcreated':
        return 'agent_created';
      case 'deposit':
      case 'deposited':
        return 'deposit';
      case 'withdraw':
      case 'withdrawal':
        return 'withdrawal';
      case 'rebalance':
      case 'rebalanced':
        return 'rebalance';
      case 'emergency_swap':
      case 'emergencyswap':
        return 'emergency_swap';
      case 'agent_paused':
      case 'agentpaused':
        return 'agent_paused';
      default:
        return 'rebalance'; // Default fallback
    }
  };

  // Helper function to generate activity description
  const getActivityDescription = (activity: any): string => {
    const action = activity.action?.toLowerCase() || '';
    const protocol = activity.protocol || '';
    const amount = activity.amount ? formatEther(activity.amount) : '0';

    switch (action) {
      case 'deposit':
      case 'deposited':
        return `Deposited ${amount} ETH to portfolio agent`;
      case 'withdraw':
      case 'withdrawal':
        return `Withdrew ${amount} ETH from portfolio agent`;
      case 'rebalance':
      case 'rebalanced':
        return protocol
          ? `Rebalanced portfolio - allocated to ${protocol}`
          : 'Auto-rebalanced portfolio based on AI strategy';
      case 'emergency_swap':
      case 'emergencyswap':
        return 'Emergency swap activated due to market conditions';
      case 'agent_paused':
      case 'agentpaused':
        return 'Agent paused for safety';
      default:
        return activity.details || `Portfolio action: ${action}`;
    }
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'agent_created':
        return <Zap className="w-5 h-5 text-blue-400" />;
      case 'deposit':
        return <ArrowDownLeft className="w-5 h-5 text-green-400" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-5 h-5 text-red-400" />;
      case 'rebalance':
        return <TrendingUp className="w-5 h-5 text-purple-400" />;
      case 'emergency_swap':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'agent_paused':
        return <PauseCircle className="w-5 h-5 text-orange-400" />;
      case 'raffle_entry':
        return <Activity className="w-5 h-5 text-pink-400" />;
      case 'raffle_win':
        return <Activity className="w-5 h-5 text-gold-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'agent_created':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'deposit':
        return 'bg-green-500/10 border-green-500/20';
      case 'withdrawal':
        return 'bg-red-500/10 border-red-500/20';
      case 'rebalance':
        return 'bg-purple-500/10 border-purple-500/20';
      case 'emergency_swap':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'agent_paused':
        return 'bg-orange-500/10 border-orange-500/20';
      case 'raffle_entry':
        return 'bg-pink-500/10 border-pink-500/20';
      case 'raffle_win':
        return 'bg-gold-500/10 border-gold-500/20';
      default:
        return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum';
      case 11155111: return 'Sepolia';
      case 43114: return 'Avalanche';
      case 43113: return 'Fuji';
      default: return 'Unknown';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📊 Wallet Activity
          </h1>
          <p className="text-slate-400">
            Track all your portfolio agent activities, transactions, and raffle entries.
          </p>
        </div>

        {!address ? (
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="text-center py-12">
              <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
              <p className="text-slate-400">
                Connect your wallet to view your activity history and track all transactions.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Activity Stats */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-slate-900 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Total Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{activities.length}</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Active Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {new Set(activities.filter(a => a.agentId).map(a => a.agentId)).size}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Last Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {activities.length > 0 ? formatTimeAgo(activities[0].timestamp) : 'None'}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Activity Feed */}
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest portfolio agent and DeFi activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="text-slate-400 mt-2">Loading activities...</p>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Activities Yet</h3>
                    <p className="text-slate-400">
                      Start by creating a portfolio agent or entering the raffle!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className={`p-4 rounded-lg border ${getActivityColor(activity.type)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-1">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium mb-1">
                                {activity.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatTimeAgo(activity.timestamp)}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {getChainName(activity.chainId)}
                                </Badge>
                                {activity.agentName && (
                                  <Badge variant="secondary" className="text-xs">
                                    {activity.agentName}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {activity.amount && (
                              <p className="text-white font-semibold">
                                {activity.type === 'withdrawal' ? '-' : '+'}
                                {formatEther(activity.amount)} {activity.token}
                              </p>
                            )}
                            {activity.txHash && (
                              <a
                                href={`https://sepolia.etherscan.io/tx/${activity.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 mt-1"
                              >
                                View Tx <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
