'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { contractService } from '@/lib/contractService';
import { RaffleRound } from '@/lib/enhancedContractService';
import { parseEther, formatEther } from 'viem';
import { Ticket, Trophy, Clock, Users, DollarSign } from 'lucide-react';


export default function RafflePage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [raffleInfo, setRaffleInfo] = useState<RaffleRound | null>(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userTickets, setUserTickets] = useState(0);
  const [participantCount, setParticipantCount] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);

  const TICKET_PRICE = 0.001; // ETH (matches contract TICKET_PRICE)

  useEffect(() => {
    if (chainId) {
      fetchRaffleInfo();
      if (address) {
        fetchUserTickets();
      }
    }
  }, [chainId, address]);

  const fetchRaffleInfo = async () => {
    try {
      const status = await contractService.getRaffleStatus();
      setRaffleInfo({
        id: status.roundId,
        startTime: status.startTime,
        endTime: BigInt(0),
        ticketsSold: status.participantCount || BigInt(0),
        prizePool: status.prizePool,
        isActive: status.state === 0, // 0 = OPEN state
        isDrawn: status.state === 2, // 2 = COMPLETED state
        winner: '0x0000000000000000000000000000000000000000',
        winningTicket: BigInt(0),
        randomness: BigInt(0),
        prizeClaimed: false
      });
    } catch (error) {
      console.error('Error fetching raffle info:', error);
    }
  };

  const fetchUserTickets = async () => {
    if (!address) return;
    try {
      // Get current participants and check user's tickets
      const participants = await contractService.getCurrentParticipants();
      const userParticipant = participants.find((p: any) => p.participant.toLowerCase() === address.toLowerCase());
      const userTicketCount = userParticipant ? Number(userParticipant.ticketCount) : 0;
      
      setUserTickets(userTicketCount);
      setParticipantCount(participants.length);
      
      // Calculate total tickets
      const total = participants.reduce((sum: number, p: any) => sum + Number(p.ticketCount), 0);
      setTotalTickets(total);
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      setUserTickets(0);
      setParticipantCount(0);
      setTotalTickets(0);
    }
  };

  const handleBuyTickets = async () => {
    if (!address || !raffleInfo) return;

    setLoading(true);
    try {
      console.log('Attempting to buy tickets:', { ticketCount, address });
      // Pass the address explicitly to ensure correct account is used
      const txHash = await contractService.purchaseRaffleTickets(ticketCount, address);
      console.log('Transaction hash:', txHash);
      
      // Wait for transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await fetchRaffleInfo();
      await fetchUserTickets();
      
      console.log('Ticket purchase successful');
    } catch (error: any) {
      console.error('Error buying tickets:', error);
      
      // Better error handling for different error types
      let errorMessage = 'Failed to buy tickets';
      
      if (error?.message) {
        if (error.message.includes('revert')) {
          errorMessage = 'Transaction reverted. Check raffle conditions.';
        } else if (error.message.includes('rejected')) {
          errorMessage = 'Transaction was rejected by user';
        } else if (error.message.includes('insufficient')) {
          errorMessage = 'Insufficient funds for ticket purchase';
        } else {
          errorMessage = error.message;
        }
      }
      
      // You could add a toast notification here
      alert(errorMessage);
    }
    setLoading(false);
  };



  const getTimeUntilDraw = () => {
    if (!raffleInfo) return null;

    const startTime = Number(raffleInfo.startTime) * 1000;
    const tenMinutes = 10 * 60 * 1000; // Changed to 10 minutes (matches contract MIN_DURATION)
    const drawTime = startTime + tenMinutes;
    const now = Date.now();

    if (now >= drawTime) return 'Draw conditions may be met!';

    const timeLeft = drawTime - now;
    const minutesLeft = Math.floor(timeLeft / (60 * 1000));
    const secondsLeft = Math.floor((timeLeft % (60 * 1000)) / 1000);

    return `${minutesLeft}m ${secondsLeft}s`;
  };

  if (chainId !== 11155111) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-yellow-400">Wrong Network</CardTitle>
            <CardDescription>
              Raffle is only available on Sepolia testnet. Please switch networks.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎰 Chainlink VRF Raffle
          </h1>
          <p className="text-slate-400">
            Buy tickets for a chance to win! Provably fair randomness powered by Chainlink VRF.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Raffle Info */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Current Raffle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {raffleInfo ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Round</span>
                    <Badge variant="secondary">#{raffleInfo?.id?.toString() || 'Loading...'}</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Status</span>
                    <Badge className={raffleInfo ? (raffleInfo.isActive ? 'bg-green-500' : 'bg-blue-500') : 'bg-gray-500'}>
                      {raffleInfo ? (raffleInfo.isActive ? 'Active' : 'Completed') : 'Loading...'}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      Prize Pool
                    </span>
                    <span className="text-xl font-bold text-green-400">
                      {formatEther(raffleInfo.prizePool)} ETH
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Ticket className="w-4 h-4" />
                      Total Tickets Bought
                    </span>
                    <span className="text-white font-semibold">
                      {totalTickets}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Unique Players
                    </span>
                    <span className="text-white font-semibold">
                      {participantCount}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      Your Winning Odds
                    </span>
                    <span className="text-white font-semibold">
                      {totalTickets > 0 ?
                        `${((userTickets / totalTickets) * 100).toFixed(2)}%` :
                        '0%'
                      } ({userTickets}/{totalTickets})
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Time to Draw
                    </span>
                    <span className="text-white font-semibold">
                      {getTimeUntilDraw()}
                    </span>
                  </div>

                  {raffleInfo.isActive && (
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-sm text-blue-400">
                        Draw triggers automatically when there are 2+ unique participants and 10+ minutes have passed.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                  <p className="text-slate-400 mt-2">Loading raffle info...</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Buy Tickets */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-blue-400" />
                Buy Tickets
              </CardTitle>
              <CardDescription>
                {TICKET_PRICE} ETH per ticket. More tickets = better odds!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {address ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="ticket-count">Number of Tickets</Label>
                    <Input
                      id="ticket-count"
                      type="number"
                      min="1"
                      max="100"
                      value={ticketCount}
                      onChange={(e) => setTicketCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="bg-slate-800 border-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Cost:</span>
                      <span className="text-white">{(TICKET_PRICE * ticketCount).toFixed(3)} ETH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Your Current Tickets:</span>
                      <span className="text-blue-400">{userTickets}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleBuyTickets}
                    disabled={loading || !raffleInfo || !raffleInfo.isActive}
                    className="w-full"
                  >
                    {loading ? 'Buying...' : `Buy ${ticketCount} Ticket${ticketCount > 1 ? 's' : ''}`}
                  </Button>

                  {!raffleInfo?.isActive && (
                    <p className="text-sm text-yellow-400 text-center">
                      Raffle is not currently accepting tickets
                    </p>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 mb-4">Connect your wallet to participate</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <Card className="mt-6 bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Ticket className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">1. Buy Tickets</h3>
                <p className="text-sm text-slate-400">Each ticket costs 0.01 ETH and gives you one entry</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">2. Wait for Draw</h3>
                <p className="text-sm text-slate-400">Automatic draw after 2+ players and 10+ minutes</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">3. Win Prizes</h3>
                <p className="text-sm text-slate-400">Winner gets 90% of prize pool via Chainlink VRF</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
