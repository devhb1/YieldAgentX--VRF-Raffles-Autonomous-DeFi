import { Badge } from '@/components/ui/badge'
import { Trophy, DollarSign, Users, Clock } from 'lucide-react'

interface RaffleInfoCardProps {
  round: number
  state: 'Open' | 'Drawing' | 'Completed'
  prizePool: string
  totalTickets: number
  uniqueParticipants: number
  date: string
  winner?: string
  winnerAddress?: string
  prizeClaimed?: boolean
}

export function RaffleInfoCard({
  round,
  state,
  prizePool,
  totalTickets,
  uniqueParticipants,
  date,
  winner,
  winnerAddress,
  prizeClaimed
}: RaffleInfoCardProps) {
  // Format prize pool to 4 decimal places
  const formattedPrizePool = parseFloat(prizePool).toFixed(4)
  
  // Format winner display with address truncation
  let winnerDisplay = winner || 'Not Drawn'
  if (state === 'Completed' && !winner) {
    winnerDisplay = 'No Winner'
  } else if (winner && winner !== 'No Winner' && winner.startsWith('0x')) {
    // Truncate Ethereum address: 0x1234...abcd
    winnerDisplay = `${winner.slice(0, 6)}...${winner.slice(-4)}`
  }
  
  return (
    <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Round #{round}</h3>
          <Badge 
            variant="default"
            className={state === 'Completed' ? 'bg-white text-black' : 
                      state === 'Drawing' ? 'bg-orange-600 text-white' : 
                      'bg-green-600 text-white'}
          >
            {state}
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-slate-400">Winner</div>
            <div className={`text-sm font-medium truncate ${winnerDisplay === 'No Winner' ? 'text-orange-400' : 'text-white'}`}
                 title={winner && winner.startsWith('0x') ? winner : undefined}>
              {winnerDisplay}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 min-w-0">
          <DollarSign className="w-4 h-4 text-green-400 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-slate-400">Prize Pool</div>
            <div className="text-sm font-medium text-white">{formattedPrizePool} ETH</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 min-w-0">
          <Users className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-slate-400">Participants</div>
            <div className="text-sm font-medium text-white">
              {totalTickets} tickets / {uniqueParticipants} players
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-xs text-slate-400">Date</div>
            <div className="text-sm font-medium text-white">{date}</div>
          </div>
        </div>
      </div>
      
      {state === 'Completed' && prizeClaimed === false && winner && winner !== 'No Winner' && (
        <div className="mt-3 py-1 px-2 bg-red-900/30 border border-red-700/30 rounded text-xs text-red-300">
          Prize not yet claimed
        </div>
      )}
    </div>
  )
}
