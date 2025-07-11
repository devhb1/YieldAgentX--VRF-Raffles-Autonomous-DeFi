import { useState, useMemo, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { formatEther } from 'viem'
import { Button, Badge } from '@/components/ui'
import { 
  Loader2, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Copy, 
  ExternalLink, 
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Pause,
  Play,
  AlertTriangle,
  X
} from 'lucide-react'
import { useUserAgents, formatAgentMetrics, useDepositToAgent, useWithdrawFromAgent, useToggleAgentPause, usePerformUpkeep, useCheckUpkeep, useManualRebalance } from '@/hooks/useAIVault'
import { useChainlinkPrice, formatUSD, calculateUSDValue } from '@/hooks/useChainlinkPrice'
import { getActivityIcon, formatActivityDescription, AgentActivity } from '@/hooks/useAgentActivity'
import { useAgentActivities } from '@/hooks/useAgentActivities'

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  agentId: bigint
  agentName: string
  onDeposit: (agentId: bigint, amount: string) => Promise<void>
  isLoading: boolean
}

function DepositModal({ isOpen, onClose, agentId, agentName, onDeposit, isLoading }: DepositModalProps) {
  const [amount, setAmount] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return
    await onDeposit(agentId, amount)
    setAmount('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-secondary-800 to-primary-900/20 border border-secondary-700/50 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Deposit to {agentName}</h3>
          <Button
            size="sm"
            className="btn-secondary-modern"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-semibold text-secondary-200 mb-3">
              Amount (ETH)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.1"
              className="w-full input-modern"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 btn-primary-modern"
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Depositing...
                </>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Deposit
                </>
              )}
            </Button>
            <Button
              type="button"
              className="btn-secondary-modern"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  agentId: bigint
  agentName: string
  maxAmount: string
  onWithdraw: (agentId: bigint, amount: string) => Promise<void>
  isLoading: boolean
}

function WithdrawModal({ isOpen, onClose, agentId, agentName, maxAmount, onWithdraw, isLoading }: WithdrawModalProps) {
  const [amount, setAmount] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return
    await onWithdraw(agentId, amount)
    setAmount('')
    onClose()
  }

  const setMaxAmount = () => {
    setAmount(maxAmount)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-secondary-800 to-primary-900/20 border border-secondary-700/50 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Withdraw from {agentName}</h3>
          <Button
            size="sm"
            className="btn-secondary-modern"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-secondary-200">
                Amount (ETH)
              </label>
              <button
                type="button"
                className="text-xs text-primary-400 hover:text-primary-300 font-semibold"
                onClick={setMaxAmount}
              >
                Max: {maxAmount} ETH
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              max={maxAmount}
              placeholder="0.1"
              className="w-full input-modern"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold"
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > parseFloat(maxAmount) || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Withdrawing...
                </>
              ) : (
                <>
                  <ArrowDownLeft className="w-4 h-4 mr-2" />
                  Withdraw
                </>
              )}
            </Button>
            <Button
              type="button"
              className="btn-secondary-modern"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function MyAgents() {
  const { address } = useAccount()
  const { agents, isLoading, refetch } = useUserAgents()
  const { ethPrice } = useChainlinkPrice()
  const [activeAgentTab, setActiveAgentTab] = useState<{[key: string]: string}>({})
  const [expandedAgents, setExpandedAgents] = useState<{[key: string]: boolean}>({})
  
  // Modal states
  const [depositModal, setDepositModal] = useState<{ isOpen: boolean; agentId: bigint | null; agentName: string }>({
    isOpen: false,
    agentId: null,
    agentName: ''
  })
  const [withdrawModal, setWithdrawModal] = useState<{ isOpen: boolean; agentId: bigint | null; agentName: string; maxAmount: string }>({
    isOpen: false,
    agentId: null,
    agentName: '',
    maxAmount: ''
  })

  // Get activity data for expanded agents
  const agentIds = Object.keys(expandedAgents).filter(id => expandedAgents[id]).map(id => BigInt(id))
  const activities = useAgentActivities(agentIds)

  // Contract hooks for actions
  const { deposit, isLoading: isDepositing } = useDepositToAgent()
  const { withdraw, isLoading: isWithdrawing } = useWithdrawFromAgent()
  const { togglePause, isLoading: isTogglingPause } = useToggleAgentPause()
  const { performUpkeep, isLoading: isRebalancing } = usePerformUpkeep()
  const { manualRebalance, isLoading: isManualRebalancing } = useManualRebalance()
  const { data: upkeepData } = useCheckUpkeep()

  const handleDeposit = async (agentId: bigint, amount: string) => {
    try {
      await deposit(agentId, amount)
      refetch()
    } catch (error) {
      console.error('Deposit failed:', error)
      throw error
    }
  }

  const handleWithdraw = async (agentId: bigint, amount: string) => {
    try {
      await withdraw(agentId, amount)
      refetch()
    } catch (error) {
      console.error('Withdraw failed:', error)
      throw error
    }
  }

  const openDepositModal = (agentId: bigint, agentName: string) => {
    setDepositModal({ isOpen: true, agentId, agentName })
  }

  const openWithdrawModal = (agentId: bigint, agentName: string, maxAmount: string) => {
    setWithdrawModal({ isOpen: true, agentId, agentName, maxAmount })
  }

  const closeDepositModal = () => {
    setDepositModal({ isOpen: false, agentId: null, agentName: '' })
  }

  const closeWithdrawModal = () => {
    setWithdrawModal({ isOpen: false, agentId: null, agentName: '', maxAmount: '' })
  }

  const handleTogglePause = async (agentId: bigint, isPaused: boolean) => {
    try {
      await togglePause(agentId, !isPaused)
      refetch()
    } catch (error) {
      console.error('Toggle pause failed:', error)
    }
  }

  const handleRebalance = async () => {
    if (!upkeepData || !upkeepData[0]) {
      console.warn('No upkeep needed')
      return
    }

    try {
      await performUpkeep(upkeepData[1])
      refetch()
    } catch (error) {
      console.error('Rebalance failed:', error)
    }
  }

  const handleManualRebalance = async (agentId: bigint) => {
    try {
      await manualRebalance(agentId)
      refetch()
    } catch (error) {
      console.error('Manual rebalance failed:', error)
    }
  }

  const toggleAgentExpansion = (agentId: string) => {
    setExpandedAgents(prev => ({ ...prev, [agentId]: !prev[agentId] }))
    setActiveAgentTab(prev => ({ ...prev, [agentId]: 'activity' }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const setAgentTab = (agentId: string, tab: string) => {
    setActiveAgentTab(prev => ({ ...prev, [agentId]: tab }))
  }

  const sortedAgents = useMemo(() => {
    if (!agents) return []
    
    return [...agents].sort((a, b) => {
      const aValue = Number(formatEther(a.currentValue))
      const bValue = Number(formatEther(b.currentValue))
      return bValue - aValue
    })
  }, [agents])

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-700 rounded w-2/3 mb-4"></div>
              <div className="h-20 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!agents || agents.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-chainlink-blue rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="text-4xl">🤖</div>
          </div>
          <h3 className="text-3xl font-bold gradient-text mb-4">No AI Agents Yet</h3>
          <p className="text-secondary-400 mb-8 leading-relaxed">
            Create your first AI agent to start automated DeFi portfolio management with Chainlink&apos;s powerful infrastructure
          </p>
          <Button className="btn-primary-modern">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Agent
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold gradient-text mb-2">My AI Agents</h2>
          <p className="text-secondary-400 text-lg">Manage your autonomous DeFi portfolio agents powered by Chainlink</p>
        </div>
        <Button 
          className="btn-primary-modern"
          onClick={() => {
            // Trigger navigation to create agent tab
            window.dispatchEvent(new CustomEvent('navigate-to-create-agent'))
          }}
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Agent
        </Button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedAgents.map((agent) => {
          const agentIdStr = agent.id.toString()
          const isExpanded = expandedAgents[agentIdStr]
          const metrics = formatAgentMetrics(agent)
          const usdValue = calculateUSDValue(parseFloat(metrics.totalValue), ethPrice?.price || 0)
          
          // Get activities for this agent
          const agentActivities = activities[agentIdStr]?.activities || []
          const isLoadingActivities = activities[agentIdStr]?.isLoading || false
          
          // Check if rebalancing is needed (simplified logic)
          const now = Math.floor(Date.now() / 1000)
          const timeSinceLastRebalance = now - Number(agent.lastRebalance)
          const daysSinceRebalance = timeSinceLastRebalance / (24 * 60 * 60)
          const rebalanceNeeded = daysSinceRebalance > 7 || agent.totalYield < 0
          const rebalanceReason = daysSinceRebalance > 7 
            ? `${Math.floor(daysSinceRebalance)} days since last rebalance`
            : agent.totalYield < 0 ? 'Negative performance detected' : ''

          return (
            <div
              key={agent.id.toString()}
              className={`card-modern card-glow bg-gradient-to-br from-secondary-800/80 to-primary-900/20 border border-secondary-700/50 rounded-xl overflow-hidden transition-all duration-500 hover:shadow-glow ${
                isExpanded ? 'md:col-span-2 xl:col-span-3' : ''
              }`}
            >
              {/* Agent Header */}
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-chainlink-blue rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      #{agent.id.toString()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {agent.name || `Agent #${agent.id.toString()}`}
                      </h3>
                      <p className="text-sm text-secondary-400 font-medium">{metrics.strategy} Strategy</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={agent.paused ? 'warning' : 'success'} className="badge-modern">
                      {agent.paused ? 'Paused' : 'Active'}
                    </Badge>
                    {rebalanceNeeded && (
                      <Badge variant="warning" className="badge-modern flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Rebalance Needed
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Value Display */}
                <div className="mb-6 p-4 bg-secondary-900/50 rounded-xl border border-secondary-700/30">
                  <div className="text-3xl font-bold text-white mb-2 gradient-text">{metrics.totalValue} ETH</div>
                  <div className="text-lg text-chainlink-blue font-semibold mb-1">
                    {formatUSD(usdValue)}
                  </div>
                  <div className="text-sm text-secondary-400">
                    APR: <span className="text-accent-emerald font-bold">{metrics.apr}%</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="glass-light rounded-xl p-4 border border-secondary-700/30">
                    <div className="text-xs text-secondary-400 mb-2 font-medium uppercase tracking-wide">Deposited</div>
                    <div className="text-lg font-bold text-white">
                      {formatEther(agent.totalDeposited)} ETH
                    </div>
                  </div>
                  <div className="glass-light rounded-xl p-4 border border-secondary-700/30">
                    <div className="text-xs text-secondary-400 mb-2 font-medium uppercase tracking-wide">Performance</div>
                    <div className={`text-lg font-bold ${
                      metrics.isPositive ? 'text-accent-emerald' : 'text-accent-rose'
                    }`}>
                      {metrics.isPositive ? '+' : ''}{metrics.performance}%
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-6 flex-wrap">
                  <Button
                    size="sm"
                    className="flex-1 btn-primary-modern min-w-28"
                    onClick={() => openDepositModal(agent.id, agent.name || `Agent #${agent.id.toString()}`)}
                  >
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Deposit
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 btn-secondary-modern min-w-28"
                    onClick={() => openWithdrawModal(agent.id, agent.name || `Agent #${agent.id.toString()}`, formatEther(agent.currentValue))}
                    disabled={agent.currentValue === 0n}
                  >
                    <ArrowDownLeft className="w-4 h-4 mr-2" />
                    Withdraw
                  </Button>
                  {rebalanceNeeded && upkeepData && upkeepData[0] && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold min-w-28"
                      onClick={handleRebalance}
                      disabled={isRebalancing}
                      title={rebalanceReason}
                    >
                      ⚖️ Rebalance
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className={`btn-secondary-modern min-w-28 ${
                      agent.paused ? 'border-yellow-500/50 text-yellow-200 hover:border-yellow-400' : ''
                    }`}
                    onClick={() => handleTogglePause(agent.id, agent.paused)}
                    disabled={isTogglingPause}
                  >
                    {isTogglingPause ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : agent.paused ? (
                      <Play className="w-4 h-4 mr-2" />
                    ) : (
                      <Pause className="w-4 h-4 mr-2" />
                    )}
                    {agent.paused ? 'Resume' : 'Pause'}
                  </Button>
                </div>

                <Button
                  className="w-full btn-secondary-modern"
                  size="sm"
                  onClick={() => toggleAgentExpansion(agentIdStr)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {isExpanded ? 'Hide Details' : 'View Details'}
                </Button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-secondary-700/50 p-8 bg-secondary-900/30">
                  {/* Rebalance Suggestion */}
                  {rebalanceNeeded && (
                    <div className="mb-8 p-6 glass-light border border-amber-500/30 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-amber-400" />
                        </div>
                        <h4 className="text-lg font-bold text-amber-300">Rebalancing Suggested</h4>
                      </div>
                      <p className="text-sm text-amber-200 mb-4">{rebalanceReason}</p>
                      <p className="text-xs text-secondary-400 leading-relaxed">
                        Note: This agent uses Chainlink Automation for automatic rebalancing. 
                        The system will trigger rebalancing when optimal conditions are met.
                      </p>
                    </div>
                  )}

                  {/* Activity Section */}
                  <div>
                    <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-chainlink-blue rounded-lg flex items-center justify-center">
                        📊
                      </div>
                      Recent Activity
                    </h4>
                    {agentActivities && agentActivities.length > 0 ? (
                      <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-thin">
                        {agentActivities.slice(0, 10).map((activity, index) => (
                          <div key={`${activity.txHash}-${index}`} className="flex items-center gap-4 p-4 glass-light rounded-xl border border-secondary-700/30 hover:border-primary-500/30 transition-all duration-300">
                            <div className="w-10 h-10 bg-gradient-to-r from-primary-500/20 to-chainlink-blue/20 rounded-xl flex items-center justify-center">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-white mb-1">
                                {formatActivityDescription(activity)}
                              </div>
                              <div className="text-xs text-secondary-400">
                                {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                              </div>
                              {activity.gasUsed && (
                                <div className="text-xs text-secondary-500 mt-1">
                                  Gas Used: {Number(activity.gasUsed).toLocaleString()}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className="btn-secondary-modern"
                                onClick={() => copyToClipboard(activity.txHash)}
                                title="Copy transaction hash"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              {activity.etherscanUrl && (
                                <Button
                                  size="sm"
                                  className="btn-secondary-modern"
                                  onClick={() => window.open(activity.etherscanUrl, '_blank')}
                                  title="View on Etherscan"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 glass-light rounded-xl border border-secondary-700/30">
                        {activities[agentIdStr]?.isLoading ? (
                          <div className="flex items-center justify-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
                            <span className="text-secondary-300">Loading activity...</span>
                          </div>
                        ) : (
                          <div className="text-secondary-400">
                            <div className="text-4xl mb-4">📈</div>
                            <p>No recent activity found</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modals */}
      <DepositModal
        isOpen={depositModal.isOpen}
        onClose={closeDepositModal}
        agentId={depositModal.agentId!}
        agentName={depositModal.agentName}
        onDeposit={handleDeposit}
        isLoading={isDepositing}
      />

      <WithdrawModal
        isOpen={withdrawModal.isOpen}
        onClose={closeWithdrawModal}
        agentId={withdrawModal.agentId!}
        agentName={withdrawModal.agentName}
        maxAmount={withdrawModal.maxAmount}
        onWithdraw={handleWithdraw}
        isLoading={isWithdrawing}
      />
    </div>
  )
}
