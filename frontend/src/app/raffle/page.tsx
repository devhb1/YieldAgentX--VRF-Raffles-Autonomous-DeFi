'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { contractService } from '@/lib/enhancedContractService';
import { RaffleRound } from '@/lib/enhancedContractService';
import { parseEther, formatEther } from 'viem';
import { Ticket, Trophy, Clock, Users, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PreviousRaffleWinner from '@/components/PreviousRaffleWinner';
import MyWinnings from '@/components/MyWinnings';


export default function RafflePage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [raffleInfo, setRaffleInfo] = useState<RaffleRound | null>(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userTickets, setUserTickets] = useState(0);
  const [uniqueParticipants, setUniqueParticipants] = useState<string[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [canDraw, setCanDraw] = useState(false);
  const [autoDrawEnabled, setAutoDrawEnabled] = useState(true);

  const TICKET_PRICE = 0.001; // ETH (matches contract TICKET_PRICE)

  useEffect(() => {
    if (chainId) {
      fetchRaffleInfo();
      if (address) {
        fetchUserTickets();
      }
    }
  }, [chainId, address]);

  // Auto-draw effect - check every 30 seconds if draw conditions are met
  useEffect(() => {
    if (!autoDrawEnabled || !raffleInfo?.isActive || !address) return;

    const checkAutoDrawInterval = setInterval(async () => {
      try {
        const conditions = await contractService.getDrawingConditions();
        setCanDraw(conditions.canDraw);
        
        if (conditions.canDraw && autoDrawEnabled) {
          console.log('Auto-draw conditions met, triggering draw...');
          await handleDrawWinner();
          setAutoDrawEnabled(false); // Disable after triggering
        }
      } catch (error) {
        console.error('Error checking auto-draw conditions:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkAutoDrawInterval);
  }, [raffleInfo?.isActive, autoDrawEnabled, address]);

  const fetchRaffleInfo = async () => {
    try {
      console.log('=== FETCHING RAFFLE INFO ===');
      const status = await contractService.getRaffleStatus();
      console.log('Raffle status from contract:', status);
      console.log('Status state type:', typeof status.state, 'Value:', status.state);
      
      // Handle both string and BigInt states from contract
      const stateValue = typeof status.state === 'string' ? BigInt(status.state) : status.state;
      const isActive = stateValue === BigInt(0); // 0 = OPEN state
      const isDrawn = stateValue === BigInt(2); // 2 = CLOSED state
      
      console.log('Calculated isActive:', isActive, 'isDrawn:', isDrawn);
      
      const raffleData: RaffleRound = {
        id: status.roundId,
        roundId: status.roundId,
        startTime: status.startTime,
        endTime: status.endTime,
        ticketsSold: status.participantCount,
        participantCount: status.participantCount,
        prizePool: status.prizePool,
        isActive: isActive,
        isDrawn: isDrawn,
        winner: status.winner,
        winningTicket: BigInt(0),
        randomness: BigInt(0),
        prizeClaimed: false,
        state: status.state,
        vrfRequestId: status.vrfRequestId,
        vrfTxHash: status.vrfTxHash
      };
      
      console.log('Final raffle data:', raffleData);
      setRaffleInfo(raffleData);
      
      // Check if draw is possible
      if (raffleData.isActive) {
        const conditions = await contractService.getDrawingConditions();
        setCanDraw(conditions.canDraw);
      }
    } catch (error) {
      console.error('Error fetching raffle info:', error);
    }
  };

  const fetchUserTickets = async () => {
    if (!address) return;
    try {
      // Get user's actual ticket count from contract
      const userTicketCount = await contractService.getUserTicketCount(address);
      setUserTickets(userTicketCount);
      
      // Get raffle status for unique participants
      const status = await contractService.getRaffleStatus();
      const participants = await contractService.getUniqueParticipants();
      setUniqueParticipants(participants);
      setTotalTickets(Number(status.participantCount)); // Each participant = 1 ticket for simplicity
      
    } catch (error) {
      console.error('Error fetching user tickets:', error);
      setUserTickets(0);
      setUniqueParticipants([]);
      setTotalTickets(0);
    }
  };

  const handleBuyTickets = async () => {
    if (!address || !raffleInfo) return;

    setLoading(true);
    try {
      console.log('Attempting to buy tickets:', { ticketCount, address });
      const txHash = await contractService.purchaseRaffleTickets(ticketCount, address);
      console.log('Transaction hash:', txHash);
      
      // Wait for transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Refresh data
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

  const handleDrawWinner = async () => {
    if (!address || !raffleInfo) return;

    try {
      console.log('Attempting to draw winner...');
      const txHash = await contractService.drawRaffleWinner(address);
      console.log('Draw winner transaction hash:', txHash);
      
      // Wait for transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Refresh data
      await fetchRaffleInfo();
      await fetchUserTickets();
      
      console.log('Winner draw successful');
    } catch (error: any) {
      console.error('Error drawing winner:', error);
      
      let errorMessage = 'Failed to draw winner';
      if (error?.message) {
        if (error.message.includes('revert')) {
          errorMessage = 'Draw conditions not met or already drawn';
        } else if (error.message.includes('rejected')) {
          errorMessage = 'Transaction was rejected by user';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    }
  };



  const getTimeUntilDraw = () => {
    if (!raffleInfo) return null;

    const startTime = Number(raffleInfo.startTime) * 1000;
    const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
    const drawTime = startTime + tenMinutes;
    const now = Date.now();

    const participantCount = uniqueParticipants.length;
    const hasMinParticipants = participantCount >= 2;

    if (now >= drawTime && hasMinParticipants) {
      return '✅ Ready to draw!';
    }
    
    if (!hasMinParticipants) {
      return `Need ${2 - participantCount} more participants`;
    }

    if (now >= drawTime) {
      return '✅ Time requirement met!';
    }

    const timeLeft = drawTime - now;
    const minutesLeft = Math.floor(timeLeft / (60 * 1000));
    const secondsLeft = Math.floor((timeLeft % (60 * 1000)) / 1000);

    return `${minutesLeft}m ${secondsLeft}s remaining`;
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
                      {Number(raffleInfo.ticketsSold)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Unique Players
                    </span>
                    <span className="text-white font-semibold">
                      {uniqueParticipants.length}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      Your Winning Odds
                    </span>
                    <span className="text-white font-semibold">
                      {Number(raffleInfo.ticketsSold) > 0 ?
                        `${((userTickets / Number(raffleInfo.ticketsSold)) * 100).toFixed(2)}%` :
                        '0%'
                      } ({userTickets}/{Number(raffleInfo.ticketsSold)})
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
                    <div className="mt-4 space-y-3">
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-sm text-blue-400">
                          Draw triggers automatically when there are 2+ unique participants and 10+ minutes have passed.
                        </p>
                      </div>
                      
                      {canDraw && (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <p className="text-sm text-green-400 mb-2">
                            🎉 Draw conditions are met! Winner can be drawn now.
                          </p>
                          <Button
                            onClick={handleDrawWinner}
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            {loading ? 'Drawing...' : 'Draw Winner Now'}
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Auto-draw enabled:</span>
                        <Badge className={autoDrawEnabled ? 'bg-green-500' : 'bg-gray-500'}>
                          {autoDrawEnabled ? 'ON' : 'OFF'}
                        </Badge>
                      </div>
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

        {/* Previous Raffle Winner */}
        {/* Previous Raffles and My Winnings Tabs */}
        <Tabs defaultValue="previous-raffles" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="previous-raffles">Previous Raffles</TabsTrigger>
            <TabsTrigger value="my-winnings">My Winnings</TabsTrigger>
          </TabsList>
          <TabsContent value="previous-raffles">
            <PreviousRaffleWinner />
          </TabsContent>
          <TabsContent value="my-winnings">
            <MyWinnings />
          </TabsContent>
        </Tabs>

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
