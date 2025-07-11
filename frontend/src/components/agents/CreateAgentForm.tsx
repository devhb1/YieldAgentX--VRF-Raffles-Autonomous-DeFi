import React, { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { toast } from 'react-hot-toast'
import { AI_VAULT_ABI } from '@/lib/abis'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Select } from '@/components/ui'
import { validateAgentName, validateETHAmount, getStrategyName, getStrategyDescription } from '@/utils'
import { useStrategyRecommendation } from '@/hooks/useAI'

const AI_VAULT_ADDRESS = process.env.NEXT_PUBLIC_AI_VAULT_ADDRESS as `0x${string}`

export const CreateAgentForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    strategy: 0 as 0 | 1 | 2,
    initialDeposit: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: hash, writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })
  const { recommendation, loading: strategyLoading } = useStrategyRecommendation(formData.strategy)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    const nameValidation = validateAgentName(formData.name)
    if (!nameValidation.isValid) { 
      newErrors.name = nameValidation.error!
    }

    if (formData.initialDeposit) {
      const amountValidation = validateETHAmount(formData.initialDeposit)
      if (!amountValidation.isValid) {
        newErrors.initialDeposit = amountValidation.error!
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      // Always create agent without value since createAgent is not payable
      writeContract({
        address: AI_VAULT_ADDRESS,
        abi: AI_VAULT_ABI as any,
        functionName: 'createAgent',
        args: [formData.name, Number(formData.strategy)],
      })
      
      toast.success('Creating agent...')
      // Note: If initial deposit is provided, we'll need to handle the deposit 
      // in a separate transaction after the agent is created
    } catch (error) {
      console.error('Error creating agent:', error)
      toast.error('Failed to create agent')
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span className="text-2xl">🤖</span>
          <span>Create New AI Agent</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agent Name */}
          <Input
            label="Agent Name"
            placeholder="Enter a unique name for your agent"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            helperText="Choose a memorable name for your AI agent"
          />

          {/* Strategy Selection */}
          <div>
            <Select
              label="Investment Strategy"
              value={formData.strategy.toString()}
              onChange={(e) => setFormData({ ...formData, strategy: parseInt(e.target.value) as 0 | 1 | 2 })}
              helperText="Select the risk/yield profile for your agent"
            >
              <option value="0">Conservative - Low Risk, Stable Returns</option>
              <option value="1">Balanced - Moderate Risk, Balanced Returns</option>
              <option value="2">Aggressive - High Risk, Maximum Yield</option>
            </Select>

            {/* Strategy Details */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                {getStrategyName(formData.strategy)} Strategy
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {getStrategyDescription(formData.strategy)}
              </p>
              
              {strategyLoading ? (
                <div className="text-sm text-gray-500">Loading AI recommendations...</div>
              ) : recommendation && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">AI-Suggested Allocation:</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Lido Staking: {recommendation.lidoPercent}%</div>
                    <div>Aave Lending: {recommendation.aavePercent}%</div>
                    <div>Uniswap LP: {recommendation.uniswapPercent}%</div>
                    <div>Compound: {recommendation.compoundPercent}%</div>
                    <div>Curve LP: {recommendation.curvePercent}%</div>
                    <div>Cash Reserve: {recommendation.cashPercent}%</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Initial Deposit */}
          <Input
            label="Initial Deposit (Optional)"
            type="number"
            step="0.001"
            placeholder="0.0"
            value={formData.initialDeposit}
            onChange={(e) => setFormData({ ...formData, initialDeposit: e.target.value })}
            error={errors.initialDeposit}
            helperText="You can add funds later. Minimum 0.001 ETH if depositing now."
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            loading={isPending || isConfirming}
            disabled={!formData.name.trim()}
          >
            {isPending || isConfirming ? 'Creating Agent...' : 'Create AI Agent'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
