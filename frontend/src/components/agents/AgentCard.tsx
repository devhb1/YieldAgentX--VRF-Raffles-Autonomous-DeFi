import { Agent, AgentMetrics } from '@/hooks/useAIVault'
import { PriceData } from '@/hooks/useChainlinkPrice'

interface AgentCardProps {
  agent: Agent
  metrics: AgentMetrics
  ethPrice: PriceData | null
  isExpanded: boolean
  onToggleExpansion: () => void
  onDeposit: (agentId: bigint) => Promise<void>
  onWithdraw: (agentId: bigint) => Promise<void>
  onTogglePause: (agentId: bigint, isPaused: boolean) => void
  depositAmount: string
  withdrawAmount: string
  onDepositAmountChange: (amount: string) => void
  onWithdrawAmountChange: (amount: string) => void
}

export function AgentCard(props: AgentCardProps) {
  return (
    <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 rounded-xl border border-purple-500/20 backdrop-blur-sm p-6">
      <h4 className="text-white font-bold text-xl mb-2">{props.agent.name}</h4>
      <p className="text-purple-200">Agent ID: {props.agent.id.toString()}</p>
      <div className="mt-4">
        <div className="text-white">Total Value: {props.metrics.totalValue} ETH</div>
        <div className="text-green-400">Performance: {props.metrics.performance}%</div>
      </div>
    </div>
  )
}
