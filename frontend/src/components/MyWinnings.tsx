'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, DollarSign, Clock, ExternalLink, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useChainId, useAccount } from 'wagmi';
import { contractService } from '@/lib/enhancedContractService';
import { RaffleRound } from '@/lib/enhancedContractService';
import { formatEther } from 'viem';

interface UserWinning {
  round: RaffleRound;
  prizeAmount: bigint;
  claimed: boolean;
}

export default function MyWinnings() {
  const chainId = useChainId();
  const { address } = useAccount();
  const [winnings, setWinnings] = useState<UserWinning[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<{ [key: string]: boolean }>({});
  const [totalWinnings, setTotalWinnings] = useState<bigint>(BigInt(0));
  const [totalClaimed, setTotalClaimed] = useState<bigint>(BigInt(0));

  useEffect(() => {
    if (chainId === 11155111 && address) {
      fetchUserWinnings();
    } else {
      setWinnings([]);
      setLoading(false);
    }
  }, [chainId, address]);

  const fetchUserWinnings = async () => {
    if (!address) return;

    try {
      setLoading(true);
      
      const previousRounds = await contractService.getPreviousRaffleRounds(20);
      
      const userWinnings: UserWinning[] = [];
      let totalWin = BigInt(0);
      let totalClaim = BigInt(0);
      
      for (const round of previousRounds) {
        if (round.winner && String(round.winner).toLowerCase() === address.toLowerCase()) {
          const prizeAmount = round.prizePool || BigInt(0);
          
          userWinnings.push({
            round,
            prizeAmount,
            claimed: round.prizeClaimed
          });
          
          totalWin += prizeAmount;
          if (round.prizeClaimed) {
            totalClaim += prizeAmount;
          }
        }
      }
      
      setWinnings(userWinnings);
      setTotalWinnings(totalWin);
      setTotalClaimed(totalClaim);
      
    } catch (error) {
      console.error('Error fetching user winnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimPrize = async (roundId: bigint) => {
    if (!address) return;
    
    const roundKey = roundId.toString();
    setClaiming(prev => ({ ...prev, [roundKey]: true }));
    
    try {
      console.log('Claiming prize for round:', roundId);
      const txHash = await contractService.claimPrize(roundId, address);
      console.log('Claim transaction hash:', txHash);
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      await fetchUserWinnings();
      
      console.log('Prize claimed successfully');
    } catch (error: any) {
      console.error('Error claiming prize:', error);
    } finally {
      setClaiming(prev => ({ ...prev, [roundKey]: false }));
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const timestampNum = Number(timestamp);
    if (timestampNum === 0) {
      return 'Not set';
    }
    return new Date(timestampNum * 1000).toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (chainId !== 11155111) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span>My Winnings</span>
          </CardTitle>
          <CardDescription>Switch to Sepolia network to view your winnings</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!address) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span>My Winnings</span>
          </CardTitle>
          <CardDescription>Connect your wallet to view your winnings</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span>My Winnings</span>
          </CardTitle>
          <CardDescription>Loading your winnings...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (winnings.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span>My Winnings</span>
          </CardTitle>
          <CardDescription>You haven't won any raffles yet. Keep playing to win big!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Star className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <p className="text-lg text-slate-400 mb-2">No winnings yet</p>
            <p className="text-sm text-slate-500">Purchase raffle tickets to enter and win prizes!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const unclaimedWinnings = totalWinnings - totalClaimed;
  const unclaimedCount = winnings.filter(w => !w.claimed).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-white">{formatEther(totalWinnings)} ETH</p>
                <p className="text-sm text-slate-400">Total Winnings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{formatEther(totalClaimed)} ETH</p>
                <p className="text-sm text-slate-400">Claimed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <ExternalLink className="h-8 w-8 text-orange-400" />
              <div>
                <p className="text-2xl font-bold text-white">{formatEther(unclaimedWinnings)} ETH</p>
                <p className="text-sm text-slate-400">Unclaimed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              <span>My Winnings</span>
              <Badge variant="secondary">{winnings.length} Wins</Badge>
            </div>
            {unclaimedCount > 0 && (
              <Badge variant="destructive">{unclaimedCount} Unclaimed</Badge>
            )}
          </CardTitle>
          <CardDescription>Your raffle winnings history and claim status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {winnings.map((winning) => (
              <div key={winning.round.id.toString()} className="bg-slate-800 p-4 rounded-lg">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-400">Round</span>
                    </div>
                    <p className="text-lg font-bold text-white">#{winning.round.id.toString()}</p>
                    <Badge variant="default" className="mt-1">Winner!</Badge>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-green-400">Prize</span>
                    </div>
                    <p className="text-lg font-bold text-white">{formatEther(winning.prizeAmount)} ETH</p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Won On</span>
                    </div>
                    <p className="text-sm text-white">{formatTimestamp(winning.round.endTime)}</p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <ExternalLink className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-400">Status</span>
                    </div>
                    <div className="space-y-2">
                      <Badge variant={winning.claimed ? "default" : "destructive"}>
                        {winning.claimed ? "Claimed" : "Unclaimed"}
                      </Badge>
                      
                      {!winning.claimed && (
                        <Button 
                          onClick={() => handleClaimPrize(winning.round.id)}
                          disabled={claiming[winning.round.id.toString()] || false}
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {claiming[winning.round.id.toString()] ? 'Claiming...' : 'Claim Prize'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="grid gap-2 md:grid-cols-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Participants:</span>
                      <span className="text-white">{Number(winning.round.ticketsSold)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Prize Pool:</span>
                      <span className="text-white">{formatEther(winning.round.prizePool || BigInt(0))} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">My Address:</span>
                      <span className="text-white font-mono">{formatAddress(address)}</span>
                    </div>
                  </div>

                  {winning.round.randomness && winning.round.randomness > 0 && (
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <ExternalLink className="h-4 w-4 text-blue-400" />
                        <span className="text-xs font-medium text-blue-400">VRF Proof of Fair Win</span>
                      </div>
                      <p className="text-xs text-blue-300 font-mono break-all">
                        Random Value: {winning.round.randomness.toString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
