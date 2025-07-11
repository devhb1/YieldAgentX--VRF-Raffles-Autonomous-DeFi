import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy, RefreshCw, ExternalLink, DollarSign, Shield } from 'lucide-react'
import { useUserWinnings, useClaimPrize } from '@/hooks/useVRF25Raffle'
import { RoundVRFProof } from './RoundVRFProof'

export function MyWinnings() {
  const { address, isConnected } = useAccount()
  const { winnings, pendingWinnings, isLoading } = useUserWinnings()
  const { claimPrize, isLoading: isClaiming } = useClaimPrize()

  const handleClaimWinning = async (round: number) => {
    claimPrize(round)
  }

  const totalWinnings = winnings.reduce((sum: number, win: any) => sum + parseFloat(win.amountETH || '0'), 0) + 
                        pendingWinnings.reduce((sum: number, win: any) => sum + parseFloat(win.amountETH || '0'), 0)

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-purple-800/20 to-blue-800/20 border-purple-500/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">My Winnings</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-purple-300 hover:text-white hover:bg-purple-600/30 border-purple-500/30 h-8 px-3"
            disabled
          >
            <RefreshCw className="w-3 h-3 animate-spin" />
            Refresh
          </Button>
        </div>
        
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-700 rounded-full animate-pulse"></div>
          <div className="h-3 bg-gray-700 rounded w-32 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-48 mx-auto"></div>
        </div>
      </Card>
    )
  }

  if (!isConnected || !address) {
    return (
      <Card className="p-6 bg-gradient-to-br from-purple-800/20 to-blue-800/20 border-purple-500/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">My Winnings</h2>
          </div>
        </div>
        
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Connect Your Wallet</h3>
          <p className="text-slate-400 text-sm">
            Connect your wallet to view your winnings and claim prizes.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-800/20 to-blue-800/20 border-purple-500/20 backdrop-blur-sm max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">My Winnings</h2>
          {(winnings.length > 0 || pendingWinnings.length > 0) && (
            <Badge variant="default" className="text-yellow-400 border-yellow-400 text-xs">
              {winnings.length + pendingWinnings.length} Wins
            </Badge>
          )}
          {pendingWinnings.length > 0 && (
            <Badge variant="danger" className="bg-red-600 text-white text-xs">
              {pendingWinnings.length} Unclaimed
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          disabled={isLoading}
          className="text-purple-300 hover:text-white hover:bg-purple-600/30 border-purple-500/30 h-8 px-3"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* No Winnings State */}
      {winnings.length === 0 && pendingWinnings.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Winnings Yet</h3>
          <p className="text-slate-400 max-w-md mx-auto">
            You haven&apos;t won any raffles yet. Keep buying tickets to increase your chances!
          </p>
        </div>
      )}

      {/* Total Winnings Summary */}
      {(winnings.length > 0 || pendingWinnings.length > 0) && (
        <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-green-400" />
              <div>
                <h3 className="text-lg font-semibold text-green-300">Total Winnings</h3>
                <p className="text-sm text-green-400">
                  {winnings.length + pendingWinnings.length} winning rounds
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                {totalWinnings.toFixed(4)} ETH
              </div>
              <div className="text-sm text-green-300">
                ${(totalWinnings * 2000).toFixed(2)} USD
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending Winnings */}
      {pendingWinnings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Pending Winnings ({pendingWinnings.length})
          </h3>
          <div className="space-y-3">
            {pendingWinnings.map((win: any, index: number) => (
              <div key={index} className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="font-semibold text-white">Round #{win.round}</span>
                    <Badge variant="warning" className="text-yellow-400 border-yellow-400 text-xs">
                      UNCLAIMED
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-yellow-400">
                      {win.amountETH} ETH
                    </div>
                    <Button
                      onClick={() => handleClaimWinning(win.round)}
                      disabled={isClaiming}
                      className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white text-sm px-4 py-2 mt-2"
                    >
                      {isClaiming ? 'Claiming...' : 'Claim Prize'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Claimed Winnings */}
      {winnings.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            Claimed Winnings ({winnings.length})
          </h3>
          <div className="space-y-3">
            {winnings.map((win: any, index: number) => (
              <div key={index} className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-green-400" />
                    <span className="font-semibold text-white">Round #{win.round}</span>
                    <Badge variant="success" className="text-green-400 border-green-400 text-xs">
                      CLAIMED
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      {win.amountETH} ETH
                    </div>
                    {win.transactionHash && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://sepolia.etherscan.io/tx/${win.transactionHash}`, '_blank')}
                        className="text-green-300 hover:text-white hover:bg-green-600/30 border-green-500/30 text-xs px-2 py-1 mt-2"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Tx
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* VRF Proof */}
                <div className="mt-3 bg-blue-900/20 border border-blue-700/30 rounded p-3">
                  <div className="flex items-center gap-2 text-blue-300 mb-2">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium text-sm">VRF Proof</span>
                  </div>
                  <RoundVRFProof roundId={win.round} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
