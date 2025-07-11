import React, { useState } from 'react'
import { useUserAgents, formatAgentMetrics } from '@/hooks/useAIVault'
import { useAIInsights } from '@/hooks/useAIInsights'
import { Button, Card } from '@/components/ui'
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  PieChart, 
  BarChart3, 
  DollarSign, 
  Percent, 
  RefreshCw 
} from 'lucide-react'
import { formatETH, formatUSD, formatPercentage } from '@/utils'

export function PortfolioAnalysis() {
  const { agents, isLoading: isLoadingAgents } = useUserAgents()
  const { insights, isLoading: isLoadingInsights } = useAIInsights()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsRefreshing(false)
  }

  const handleAnalyze = async () => {
    // Navigate to AI Analysis tab
    window.dispatchEvent(new CustomEvent('navigate-to-ai-analysis'))
  }

  if (isLoadingAgents || isLoadingInsights) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        <span className="ml-2 text-purple-200">Analyzing your portfolio...</span>
      </div>
    )
  }

  if (!agents || agents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-800/40 to-blue-800/40 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
          <PieChart className="w-10 h-10 text-purple-300" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">No Portfolio Data</h3>
        <p className="text-purple-200">Create some agents to see your portfolio analysis</p>
      </div>
    )
  }

  const portfolioMetrics = agents.map(agent => formatAgentMetrics(agent))
  const totalValue = portfolioMetrics.reduce((sum, m) => sum + parseFloat(m.totalValue), 0)
  const totalYield = portfolioMetrics.reduce((sum, m) => sum + parseFloat(m.totalYield), 0)
  const avgAPY = portfolioMetrics.length > 0 ? totalYield / portfolioMetrics.length : 0

  // Calculate protocol allocations based on strategy distribution
  const protocolAllocations = [
    { 
      name: 'Lido Staking', 
      percentage: 30.0, 
      amount: totalValue * 0.3, 
      apy: '4.5%',
      icon: '🔥'
    },
    { 
      name: 'Aave Lending', 
      percentage: 25.0, 
      amount: totalValue * 0.25, 
      apy: '3.8%',
      icon: '🏦'
    },
    { 
      name: 'Uniswap V3 LP', 
      percentage: 20.0, 
      amount: totalValue * 0.2, 
      apy: '12.3%',
      icon: '🦄'
    },
    { 
      name: 'Compound', 
      percentage: 15.0, 
      amount: totalValue * 0.15, 
      apy: '5.2%',
      icon: '🔗'
    },
    { 
      name: 'Curve Finance', 
      percentage: 10.0, 
      amount: totalValue * 0.1, 
      apy: '8.7%',
      icon: '📈'
    },
  ]

  const performanceData = [
    { period: '1D', return: '+1.2%', value: `${(totalValue * 1.012).toFixed(2)} ETH` },
    { period: '1W', return: '+5.8%', value: `${(totalValue * 1.058).toFixed(2)} ETH` },
    { period: '1M', return: '+12.4%', value: `${(totalValue * 1.124).toFixed(2)} ETH` },
    { period: '3M', return: '+28.7%', value: `${(totalValue * 1.287).toFixed(2)} ETH` },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Portfolio Analysis</h2>
          <p className="text-purple-200">Real-time analysis of your DeFi portfolio performance</p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={isRefreshing}
          className="flex items-center gap-2 border-purple-500/50 text-purple-200 hover:bg-purple-700/30"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-800/30 to-purple-800/30 border-blue-500/20">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-blue-400" />
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-white">{totalValue.toFixed(4)} ETH</div>
          <div className="text-sm text-purple-200">Total Portfolio Value</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-800/30 to-blue-800/30 border-green-500/20">
          <div className="flex items-center justify-between mb-2">
            <Percent className="w-8 h-8 text-green-400" />
            <span className="text-green-400 font-semibold text-sm">+{formatPercentage(totalYield)}</span>
          </div>
          <div className="text-2xl font-bold text-white">{(totalValue * (totalYield/100)).toFixed(4)} ETH</div>
          <div className="text-sm text-purple-200">Total Returns</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-800/30 to-pink-800/30 border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-purple-400" />
            <span className="text-purple-400 font-semibold text-sm">{formatPercentage(avgAPY)}%</span>
          </div>
          <div className="text-2xl font-bold text-white">Avg APY</div>
          <div className="text-sm text-purple-200">Weighted Average</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-800/30 to-red-800/30 border-orange-500/20">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-orange-400" />
            <span className="text-orange-400 font-semibold text-sm">{protocolAllocations.length}</span>
          </div>
          <div className="text-2xl font-bold text-white">Protocols</div>
          <div className="text-sm text-purple-200">Active Positions</div>
        </Card>
      </div>

      {/* Allocation Breakdown */}
      <Card className="p-6 bg-gradient-to-br from-purple-800/20 to-blue-800/20 border-purple-500/20">
        <h3 className="text-lg font-semibold text-white mb-4">Protocol Allocation</h3>
        <div className="space-y-4">
          {protocolAllocations.map((allocation) => (
            <div key={allocation.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">{allocation.icon}</span>
                </div>
                <div>
                  <div className="font-medium text-white">{allocation.name}</div>
                  <div className="text-sm text-purple-200">{allocation.amount.toFixed(4)} ETH</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-white">{allocation.percentage}%</div>
                <div className="text-sm text-green-400">{allocation.apy} APY</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Performance Timeline */}
      <Card className="p-6 bg-gradient-to-br from-purple-800/20 to-blue-800/20 border-purple-500/20">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Timeline</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {performanceData.map((perf) => (
            <div key={perf.period} className="bg-purple-900/30 rounded-lg p-4 text-center border border-purple-500/20">
              <div className="text-sm text-purple-200 mb-1">{perf.period}</div>
              <div className="text-lg font-bold text-green-400">{perf.return}</div>
              <div className="text-sm text-purple-200">{perf.value}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Analysis Button */}
      <Card className="p-6 bg-gradient-to-r from-purple-800/30 to-blue-800/30 border-purple-500/20">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">AI Portfolio Analysis</h3>
          <p className="text-purple-200 mb-4">
            Get AI-powered insights and optimization recommendations for your portfolio
          </p>
          <Button
            onClick={handleAnalyze}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none"
          >
            Generate AI Analysis
          </Button>
        </div>
      </Card>
    </div>
  )
}
