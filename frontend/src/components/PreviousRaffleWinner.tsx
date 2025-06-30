'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Clock, User, DollarSign, ExternalLink, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useChainId, useAccount } from 'wagmi';
import { contractService } from '@/lib/enhancedContractService';
import { RaffleRound } from '@/lib/enhancedContractService';
import { formatEther } from 'viem';

interface RaffleCardProps {
  raffle: RaffleRound;
  address?: string;
  onClaimPrize: (roundId: bigint) => void;
  claiming: boolean;
}

function RaffleCard({ raffle, address, onClaimPrize, claiming }: RaffleCardProps) {
  const formatAddress = (address: string | undefined | null) => {
    if (!address || typeof address !== 'string') {
      return 'Not drawn yet';
    }
    if (address === '0x0000000000000000000000000000000000000000') {
      return 'Not drawn yet';
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: bigint) => {
    const timestampNum = Number(timestamp);
    if (timestampNum === 0) {
      return 'Not set';
    }
    return new Date(timestampNum * 1000).toLocaleString();
  };

  const canClaimPrize = () => {
    if (!raffle || !address) return false;
    
    const isWinner = String(raffle.winner).toLowerCase() === address.toLowerCase();
    const prizeNotClaimed = !raffle.prizeClaimed;
    
    return isWinner && prizeNotClaimed;
  };

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span>Round #{raffle.id.toString()}</span>
          </div>
          <Badge variant="default">Completed</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Winner */}
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <User className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Winner</span>
            </div>
            <p className="text-lg font-mono text-white break-all">
              {formatAddress(String(raffle.winner || ''))}
            </p>
            {raffle.winner && 
             String(raffle.winner) !== '0x0000000000000000000000000000000000000000' && (
              <div className="mt-2 space-y-2">
                <Badge variant={raffle.prizeClaimed ? "default" : "destructive"}>
                  {raffle.prizeClaimed ? "Prize Claimed" : "Prize Unclaimed"}
                </Badge>
                
                {canClaimPrize() && (
                  <Button 
                    onClick={() => onClaimPrize(raffle.id)}
                    disabled={claiming}
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {claiming ? 'Claiming...' : 'Claim Prize'}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Prize Pool */}
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Prize Pool</span>
            </div>
            <p className="text-lg font-bold text-white">
              {raffle.prizePool ? formatEther(raffle.prizePool) : '0'} ETH
            </p>
          </div>

          {/* Participants */}
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Participants</span>
            </div>
            <p className="text-lg font-bold text-white">
              {raffle.ticketsSold ? Number(raffle.ticketsSold) : 0}
            </p>
          </div>

          {/* Completion Time */}
          <div className="bg-slate-800 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Completed</span>
            </div>
            <p className="text-lg font-bold text-white">
              {formatTimestamp(raffle.endTime)}
            </p>
          </div>
        </div>

        {/* Raffle Details */}
        <div className="mt-6 bg-slate-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Raffle Details</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Round ID:</span>
              <Badge variant="outline">#{raffle.id.toString()}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Started:</span>
              <span className="text-white">{formatTimestamp(raffle.startTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ended:</span>
              <span className="text-white">{formatTimestamp(raffle.endTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <Badge variant="default">Completed</Badge>
            </div>
          </div>

          {/* VRF Randomness and Transaction Hash */}
          {raffle.randomness && raffle.randomness > 0 && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <ExternalLink className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">VRF Proof of Fair Draw</span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Random Value:</p>
                  <p className="text-xs text-blue-300 font-mono break-all">
                    {raffle.randomness.toString()}
                  </p>
                </div>
                
                {raffle.vrfRequestId && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">VRF Request ID:</p>
                    <p className="text-xs text-blue-300 font-mono break-all">
                      {raffle.vrfRequestId.toString()}
                    </p>
                  </div>
                )}
                
                {raffle.vrfTxHash && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">VRF Transaction:</p>
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${raffle.vrfTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-300 font-mono hover:text-blue-200 underline break-all"
                    >
                      {raffle.vrfTxHash}
                    </a>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                This randomness was generated by Chainlink VRF for provably fair winner selection
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PreviousRaffleWinner() {
  const chainId = useChainId();
  const { address } = useAccount();
  const [previousRaffles, setPreviousRaffles] = useState<RaffleRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (chainId === 11155111) { // Only on Sepolia
      fetchPreviousRaffles();
    }
  }, [chainId]);

  const fetchPreviousRaffles = async () => {
    try {
      setLoading(true);
      
      // Get all previous raffle rounds (limit to 10 most recent)
      const previousRounds = await contractService.getPreviousRaffleRounds(10);
      
      // Filter only drawn raffles with winners
      const completedRaffles = previousRounds.filter(round => 
        round.isDrawn && 
        round.winner !== '0x0000000000000000000000000000000000000000'
      );
      
      setPreviousRaffles(completedRaffles);
      
    } catch (error) {
      console.error('Error fetching previous raffles:', error);
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
      
      // Wait for transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Refresh data
      fetchPreviousRaffles();
      
      console.log('Prize claimed successfully');
    } catch (error: any) {
      console.error('Error claiming prize:', error);
    } finally {
      setClaiming(prev => ({ ...prev, [roundKey]: false }));
    }
  };

  if (chainId !== 11155111) {
    return null; // Only show on Sepolia
  }

  if (loading) {
    return (
      <Card className="mt-6 bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span>Previous Raffle Winners</span>
          </CardTitle>
          <CardDescription>
            Loading previous raffle data...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (previousRaffles.length === 0) {
    return (
      <Card className="mt-6 bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span>Previous Raffle Winners</span>
          </CardTitle>
          <CardDescription>
            No completed raffles found yet
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="mt-6">
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span>Previous Raffle Winners</span>
            <Badge variant="secondary">{previousRaffles.length} Completed</Badge>
          </CardTitle>
          <CardDescription>
            History of all completed raffles with winners and prizes
          </CardDescription>
        </CardHeader>
      </Card>
      
      <div className="mt-4 space-y-4">
        {previousRaffles.map((raffle) => (
          <RaffleCard 
            key={raffle.id.toString()}
            raffle={raffle}
            address={address}
            onClaimPrize={handleClaimPrize}
            claiming={claiming[raffle.id.toString()] || false}
          />
        ))}
      </div>
    </div>
  );
}
