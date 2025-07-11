import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { Button, Input } from '@/components/ui'
import { Shield, Zap, TrendingUp, DollarSign, Clock, Target } from 'lucide-react'
import { useCreateAgent, useDepositToAgent, getStrategyName, getStrategyDescription, getStrategyColor, getStrategyBorderColor } from '@/hooks/useAIVault'

const strategies = [
  {
    id: 0,
    name: 'Conservative',
    icon: Shield,
    description: getStrategyDescription(0),
    targetAPY: '5-8%',
    riskLevel: 'Low',
    protocols: ['Lido', 'Aave Safe', 'Compound'],
  },
  {
    id: 1,
    name: 'Balanced',
    icon: Target,
    description: getStrategyDescription(1),
    targetAPY: '8-15%',
    riskLevel: 'Medium',
    protocols: ['Lido', 'Aave', 'Uniswap V3', 'Curve'],
  },
  {
    id: 2,
    name: 'Aggressive',
    icon: TrendingUp,
    description: getStrategyDescription(2),
    targetAPY: '15-30%+',
    riskLevel: 'High',
    protocols: ['Uniswap V3', 'Curve', 'Convex', 'Yearn'],
  }
]

export function CreateAgent() {
  const { address, isConnected } = useAccount()
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null)
  const [agentName, setAgentName] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  
  const { createAgent, isLoading: isCreatingAgent, isSuccess: agentCreated, error: createError } = useCreateAgent()
  const { deposit, isLoading: isDepositing, isSuccess: depositSuccess, error: depositError } = useDepositToAgent()

  const handleCreateAgent = async () => {
    if (selectedStrategy === null || !agentName.trim()) return
    
    try {
      await createAgent(agentName.trim(), selectedStrategy)
    } catch (error) {
      console.error('Failed to create agent:', error)
    }
  }

  // Reset form after successful creation
  React.useEffect(() => {
    if (agentCreated) {
      setSelectedStrategy(null)
      setAgentName('')
      setDepositAmount('')
    }
  }, [agentCreated])

  if (!isConnected) {
    return (
      <div className="p-8 text-center bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-xl border border-purple-500/20 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white mb-2">Connect Wallet Required</h3>
        <p className="text-purple-200">Please connect your wallet to create an AI agent.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Create AI Agent</h2>
        <p className="text-purple-200 text-lg">Deploy an autonomous agent to optimize your DeFi yields</p>
      </div>

      {/* Strategy Selection */}
      <div className="p-6 bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-xl border border-purple-500/20 backdrop-blur-sm">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold">1</span>
          Choose Investment Strategy
        </h3>
        <div className="grid gap-6 md:grid-cols-3">
          {strategies.map((strategy) => {
            const Icon = strategy.icon
            const isSelected = selectedStrategy === strategy.id
            
            return (
              <div
                key={strategy.id}
                onClick={() => setSelectedStrategy(strategy.id)}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-purple-400 bg-gradient-to-br from-purple-600/40 to-blue-600/40 backdrop-blur-sm' 
                    : 'border-purple-500/30 bg-purple-900/20 hover:border-purple-400/60 hover:bg-purple-800/30'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isSelected 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                      : 'bg-purple-700/50'
                  }`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">{strategy.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      strategy.riskLevel === 'Low' ? 'bg-green-500/20 text-green-400' :
                      strategy.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {strategy.riskLevel} Risk
                    </span>
                  </div>
                </div>
                
                <p className="text-purple-200 text-sm mb-4">{strategy.description}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-purple-200">Target APY:</span>
                    <span className="text-green-400 font-semibold">{strategy.targetAPY}</span>
                  </div>
                  <div>
                    <div className="text-purple-200 text-sm mb-2">Protocols:</div>
                    <div className="flex flex-wrap gap-1">
                      {strategy.protocols.map((protocol) => (
                        <span 
                          key={protocol}
                          className="px-2 py-1 bg-purple-700/30 text-purple-200 text-xs rounded border border-purple-500/30"
                        >
                          {protocol}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Agent Configuration */}
      {selectedStrategy !== null && (
        <div className="p-6 bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-xl border border-purple-500/20 backdrop-blur-sm">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-sm font-bold">2</span>
            Agent Configuration
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Agent Name
              </label>
              <Input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Enter agent name (e.g., My DeFi Agent)"
                className="bg-purple-900/30 border-purple-500/30 text-white placeholder:text-purple-300 focus:border-purple-400"
              />
              <p className="text-xs text-purple-300 mt-1">Choose a memorable name for your agent</p>
            </div>

            {/* Summary */}
            <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
              <h4 className="font-medium text-white mb-3">Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-200">Agent Name:</span>
                  <span className="text-white">{agentName || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Strategy:</span>
                  <span className="text-white">{selectedStrategy !== null ? strategies[selectedStrategy].name : 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Target APY:</span>
                  <span className="text-green-400 font-semibold">{selectedStrategy !== null ? strategies[selectedStrategy].targetAPY : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Risk Level:</span>
                  <span className={`font-semibold ${
                    selectedStrategy !== null ? 
                      (strategies[selectedStrategy].riskLevel === 'Low' ? 'text-green-400' :
                       strategies[selectedStrategy].riskLevel === 'Medium' ? 'text-yellow-400' :
                       'text-red-400') : 'text-purple-300'
                  }`}>
                    {selectedStrategy !== null ? strategies[selectedStrategy].riskLevel : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleCreateAgent}
              disabled={selectedStrategy === null || !agentName.trim() || isCreatingAgent}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none py-3 text-lg font-semibold"
            >
              {isCreatingAgent ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Agent...
                </>
              ) : (
                'Create Agent'
              )}
            </Button>

            {createError && (
              <div className="text-sm text-red-400 mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                Error: {createError.message || 'Failed to create agent'}
              </div>
            )}

            {agentCreated && (
              <div className="text-sm text-green-400 mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                Agent created successfully! 🎉
              </div>
            )}
          </div>
        </div>
      )}

      {/* Information Card */}
      <div className="p-6 bg-gradient-to-br from-purple-800/20 to-blue-800/20 rounded-xl border border-purple-500/20 backdrop-blur-sm">
        <h3 className="text-xl font-semibold text-white mb-4">How AI Agents Work</h3>
        <div className="grid gap-6 md:grid-cols-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Automated Deposits</h4>
              <p className="text-purple-200">Your agent automatically allocates funds across optimal protocols</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">24/7 Monitoring</h4>
              <p className="text-purple-200">Continuously monitors market conditions and rebalances when needed</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">AI Optimization</h4>
              <p className="text-purple-200">Uses AI to maximize yields while minimizing risks and gas costs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
