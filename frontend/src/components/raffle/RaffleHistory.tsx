import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Eye, ChevronDown, ChevronUp, Shield } from 'lucide-react'
import { useEthersRaffleHistory } from '@/hooks/useEthersRaffle'
import { RoundVRFProof } from './RoundVRFProof'
import { RaffleInfoCard } from './RaffleInfoCard'

export function RaffleHistory() {
  const [expandedRounds, setExpandedRounds] = useState<{[key: number]: boolean}>({})
  const { rounds, isLoading, error } = useEthersRaffleHistory()

  const toggleRound = (roundNumber: number) => {
    setExpandedRounds(prev => ({
      ...prev,
      [roundNumber]: !prev[roundNumber]
    }))
  }

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-purple-800/20 to-blue-800/20 border-purple-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Past Raffle Rounds</h2>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-800/30 rounded-lg p-4 animate-pulse border border-slate-700/30">
              <div className="flex justify-between items-center mb-2">
                <div className="h-4 bg-slate-700 rounded w-20"></div>
                <div className="h-4 bg-slate-700 rounded w-16"></div>
              </div>
              <div className="h-3 bg-slate-700 rounded w-32"></div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 bg-gradient-to-br from-red-800/20 to-orange-800/20 border-red-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Past Raffle Rounds</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <p className="text-sm text-red-300">Unable to load raffle history</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-800/20 to-blue-800/20 border-purple-500/20 backdrop-blur-sm max-w-full overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
          <Trophy className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white">Previous Raffle Winners</h2>
      </div>
      <p className="text-slate-400 mb-6 text-sm">History of all completed raffles with winners and prizes</p>

      {rounds.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Past Rounds</h3>
          <p className="text-slate-400">
            Past raffle rounds will appear here once they&apos;re completed.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-w-full">
          {rounds.map((round) => (
            <div key={round.round} className="bg-slate-800/30 rounded-lg border border-slate-700/30 overflow-hidden transition-all duration-200 hover:bg-slate-800/50">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">Round #{round.round}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleRound(round.round)}
                    className="h-8 px-3 text-xs border-slate-600 hover:border-slate-500"
                  >
                    {expandedRounds[round.round] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {expandedRounds[round.round] ? 'Hide' : 'Show'} Details
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Winner:</span>
                      <span className="text-green-400 font-mono text-xs">
                        {round.winner ? `${round.winner.slice(0, 6)}...${round.winner.slice(-4)}` : 'TBD'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Prize:</span>
                      <span className="text-green-400 font-semibold">{round.prizePool} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className={`font-medium ${round.state === 'Completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {round.state}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tickets:</span>
                      <span className="text-white font-semibold">{round.totalTickets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Players:</span>
                      <span className="text-white font-semibold">{round.participants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date:</span>
                      <span className="text-slate-300 text-xs">{round.date}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {expandedRounds[round.round] && (
                <div className="border-t border-slate-700/50 p-4 bg-slate-900/30">
                  <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-blue-300">
                        <Shield className="w-4 h-4" />
                        <span className="font-medium text-sm">VRF Proof of Fair Draw</span>
                      </div>
                      {round.transactionHash && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-300 hover:text-white hover:bg-blue-600/30 border-blue-500/30 h-7 px-2 text-xs"
                          onClick={() => window.open(`https://sepolia.etherscan.io/tx/${round.transactionHash}`, '_blank')}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Proof
                        </Button>
                      )}
                    </div>
                    {round.state === 'Completed' ? (
                      <RoundVRFProof roundId={round.round} />
                    ) : (
                      <div className="text-xs text-blue-200">
                        VRF proof will be available after the raffle is completed
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
