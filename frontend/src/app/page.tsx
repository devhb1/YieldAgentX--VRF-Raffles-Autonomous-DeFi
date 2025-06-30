'use client';

import { useAccount, useBalance } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  Bot,
  DollarSign,
  Users,
  Wallet
} from 'lucide-react';
import { useState } from 'react';
import { formatEther } from 'viem';
import PortfolioAgentDashboard from '@/components/features/defi/PortfolioAgentDashboardSimple';
import ChainlinkRaffleSimple from '@/components/features/defi/ChainlinkRaffleSimpleV2';

export default function CleanDashboard() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });

  const [portfolioData, setPortfolioData] = useState({
    portfolioValue: 0,
    totalYield: 0,
    activeAgents: 0,
    raffleParticipants: 42
  });

  const handlePortfolioDataUpdate = (data: {
    portfolioValue: number;
    totalYield: number;
    activeAgents: number;
  }) => {
    setPortfolioData(prev => ({ ...prev, ...data }));
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              Connect Your Wallet
            </CardTitle>
            <CardDescription className="text-slate-600">
              Access your AI-powered DeFi portfolio and participate in raffles
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-slate-500 mb-6">
              Connect your wallet to start using our advanced AI agents for yield optimization
            </p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <Bot className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs text-slate-600">AI Agents</p>
              </div>
              <div className="text-center">
                <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-xs text-slate-600">Yield Optimization</p>
              </div>
              <div className="text-center">
                <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-xs text-slate-600">Raffles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                🤖⚡💰 DeFi Multi-Agent: Yield Optimizer with Raffle
              </h1>
              <p className="text-slate-600">
                Maximize your DeFi yields while you sleep - AI agents that never rest
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Wallet Balance</div>
              <div className="text-2xl font-bold text-slate-900">
                {balance ? `${parseFloat(formatEther(balance.value)).toFixed(4)} ETH` : '0 ETH'}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Portfolio Value</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${portfolioData.portfolioValue.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Yield</p>
                  <p className="text-2xl font-bold text-green-600">
                    +${portfolioData.totalYield.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Active Agents</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {portfolioData.activeAgents}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Raffle Participants</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {portfolioData.raffleParticipants}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <Tabs defaultValue="portfolio" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 m-6 mb-0">
                <TabsTrigger value="portfolio" className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  AI Portfolio Management
                </TabsTrigger>
                <TabsTrigger value="raffle" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Chainlink Raffle
                </TabsTrigger>
              </TabsList>

              <TabsContent value="portfolio" className="p-6 pt-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    AI-Powered Portfolio Management
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Create and manage AI agents that automatically optimize your DeFi yield across multiple protocols
                  </p>
                </div>
                <PortfolioAgentDashboard 
                  onDataUpdate={handlePortfolioDataUpdate}
                />
              </TabsContent>

              <TabsContent value="raffle" className="p-6 pt-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Chainlink VRF Raffle
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Participate in our continuous raffle powered by Chainlink VRF for provably fair winner selection
                  </p>
                </div>
                <ChainlinkRaffleSimple />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
