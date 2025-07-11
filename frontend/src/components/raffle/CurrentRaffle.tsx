import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Timer } from 'lucide-react'
import { useCurrentRaffle, useUserTickets, useDrawWinner, useBuyTickets } from '@/hooks/useVRF25Raffle'
import { useEthersRaffle } from '@/hooks/useEthersRaffle'
import { useAccount } from 'wagmi'
import { ConnectWallet } from '@/components/ConnectWallet'

export function CurrentRaffle() {
  const { raffleInfo, isLoading, error, refetch } = useEthersRaffle()
  const { ticketCount } = useUserTickets()
  const { drawWinner, isLoading: isDrawing, isReadyToDraw, isSuccess: drawSuccess } = useDrawWinner()
  const { buyTickets, isLoading: isBuying } = useBuyTickets()
  const { isConnected } = useAccount()
  const [ticketAmount, setTicketAmount] = useState(1)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="bg-slate-800/30 border-slate-700/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                  <div className="h-6 bg-slate-700 rounded w-32"></div>
                </div>
                <div className="space-y-3">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                      <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
                <div className="h-10 bg-slate-700 rounded mt-4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !raffleInfo) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="bg-red-900/20 border-red-700/30 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-300 mb-2">Contract Error</h3>
            <p className="text-red-400 mb-4 text-sm">{error || 'Unable to connect to raffle contract'}</p>
            <Button onClick={refetch} variant="outline" className="border-red-600 text-red-300 hover:bg-red-600/20">
              Retry Connection
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-blue-900/20 border-blue-700/30 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Timer className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-300 mb-2">Waiting for Data</h3>
            <p className="text-blue-400 text-sm">Loading raffle information...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Raffle Layout - Two Column */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column - Current Raffle Info */}
        <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-700/30 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <div className="text-xl">🏆</div>
              </div>
              <h2 className="text-xl font-bold text-white">Current Raffle</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                <span className="text-slate-400 text-sm">Round</span>
                <span className="text-xl font-bold text-yellow-400">#{raffleInfo.currentRound}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                <span className="text-slate-400 text-sm">Status</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${raffleInfo.canDraw ? 'bg-green-400 animate-pulse' : 'bg-blue-400'}`}></div>
                  <span className="text-white font-medium text-sm">
                    {raffleInfo.canDraw ? 'Ready to draw!' : 'Active'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                <span className="text-slate-400 text-sm">💰 Prize Pool</span>
                <span className="text-lg font-bold text-green-400">
                  {parseFloat(raffleInfo.prizePool).toFixed(4)} ETH
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                <span className="text-slate-400 text-sm">🎫 Total Tickets</span>
                <span className="text-lg font-bold text-white">{raffleInfo.totalTickets}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                <span className="text-slate-400 text-sm">👥 Players</span>
                <span className="text-lg font-bold text-white">{raffleInfo.uniqueParticipants}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                <span className="text-slate-400 text-sm">� Your Odds</span>
                <span className="text-sm font-bold text-yellow-400">
                  {raffleInfo.totalTickets > 0 && ticketCount > 0 
                    ? `${((ticketCount / raffleInfo.totalTickets) * 100).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400 text-sm">⏰ Time Left</span>
                <span className="text-sm font-bold text-green-400">
                  {raffleInfo.canDraw ? '✅ Ready!' : 
                   raffleInfo.timeLeft ? `${String(raffleInfo.timeLeft.hours).padStart(2, '0')}:${String(raffleInfo.timeLeft.minutes).padStart(2, '0')}:${String(raffleInfo.timeLeft.seconds).padStart(2, '0')}` : 
                   'Calculating...'}
                </span>
              </div>
            </div>
            
            {/* Draw Information */}
            <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
              <p className="text-xs text-blue-300 mb-2">
                🎯 Draw requires 2+ players and 10+ minutes
              </p>
              
              {raffleInfo.canDraw && (
                <div className="mt-3 p-3 bg-green-900/30 rounded-lg border border-green-700/50">
                  <p className="text-xs text-green-300 mb-3">
                    🎊 Ready to draw winner!
                  </p>
                  <Button 
                    onClick={drawWinner}
                    disabled={isDrawing || !isConnected}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2 text-sm transition-all duration-200"
                  >
                    {isDrawing ? 'Drawing Winner...' : 'Draw Winner Now'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Buy Tickets */}
        <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-700/30 backdrop-blur-sm shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <div className="text-xl">🎫</div>
              </div>
              <h2 className="text-xl font-bold text-white">Buy Tickets</h2>
            </div>
            
            <p className="text-slate-400 mb-6 text-sm">
              0.001 ETH per ticket. More tickets = better odds!
            </p>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Number of Tickets
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={ticketAmount}
                  onChange={(e) => setTicketAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                  <span className="text-slate-400 text-sm">Cost:</span>
                  <span className="text-lg font-bold text-white">{(ticketAmount * 0.001).toFixed(3)} ETH</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
                  <span className="text-slate-400 text-sm">Your Tickets:</span>
                  <span className="text-lg font-bold text-purple-400">{ticketCount}</span>
                </div>
              </div>
              
              <div className="pt-2">
                {!isConnected ? (
                  <ConnectWallet />
                ) : (
                  <Button 
                    onClick={() => buyTickets(ticketAmount)}
                    disabled={isBuying || !raffleInfo.isActive}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 text-base transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isBuying ? 'Buying...' : `Buy ${ticketAmount} Ticket${ticketAmount > 1 ? 's' : ''}`}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
