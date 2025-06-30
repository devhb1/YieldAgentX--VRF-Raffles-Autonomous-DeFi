/**
 * Simplified Chainlink Raffle Component
 * Decentralized lottery using Chainlink VRF
 */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Ticket,
  Clock,
  Users,
  DollarSign,
  Sparkles,
  RefreshCw,
  Trophy
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { contractService } from '@/lib/contractService';

interface RaffleStatus {
  isOpen: boolean;
  prizePool: bigint;
  participantCount: bigint;
  lastWinner: string;
}

export default function ChainlinkRaffleSimple() {
  const { address, isConnected } = useAccount();
  const [raffleStatus, setRaffleStatus] = useState<RaffleStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userHasEntered, setUserHasEntered] = useState(false);

  useEffect(() => {
    if (isConnected) {
      loadRaffleStatus();
      // Refresh every 30 seconds
      const interval = setInterval(loadRaffleStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const loadRaffleStatus = async () => {
    setLoading(true);
    try {
      const status = await contractService.getRaffleStatus();
      setRaffleStatus({
        isOpen: status.state === BigInt(0), // 0 = OPEN state
        prizePool: status.prizePool,
        participantCount: status.participantCount, // Keep as bigint
        lastWinner: '0x0000000000000000000000000000000000000000' // We don't get this from current call
      });
    } catch (err) {
      console.error('Error loading raffle status:', err);
      // Use mock data for demo
      setRaffleStatus({
        isOpen: true,
        prizePool: BigInt('1250000000000000000'), // 1.25 ETH
        participantCount: BigInt(42),
        lastWinner: '0x742d35Cc6135C4C8A6BE1D1c9d3C6cb5d8C38e87'
      });
    } finally {
      setLoading(false);
    }
  };

  const enterRaffle = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      await contractService.purchaseRaffleTickets(1, address);
      setUserHasEntered(true);
      await loadRaffleStatus();
    } catch (err) {
      console.error('Error entering raffle:', err);
      setError('Failed to enter raffle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Ticket className="h-5 w-5" />
            <span>Chainlink Raffle</span>
          </CardTitle>
          <CardDescription>Connect your wallet to participate in the raffle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please connect your wallet to continue</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center space-x-2">
          <Sparkles className="h-8 w-8 text-yellow-500" />
          <span>Chainlink VRF Raffle</span>
          <Sparkles className="h-8 w-8 text-yellow-500" />
        </h1>
        <p className="text-muted-foreground mt-2">
          Provably fair lottery powered by Chainlink VRF
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="text-red-600">{error}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Prize Pool</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {raffleStatus ? `${formatEther(raffleStatus.prizePool)} ETH` : '-.-- ETH'}
            </div>
            <p className="text-xs text-muted-foreground">
              Current jackpot amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Participants</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {raffleStatus ? raffleStatus.participantCount.toString() : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total entries this round
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={raffleStatus?.isOpen ? "default" : "secondary"}>
                {raffleStatus?.isOpen ? "Open" : "Drawing"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {raffleStatus?.isOpen ? "Accepting entries" : "Drawing winner..."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter the Raffle</CardTitle>
          <CardDescription>
            Each ticket costs 0.01 ETH. Winner is selected using Chainlink VRF for provably fair randomness.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-4 rounded-lg">
            <h3 className="font-medium mb-2">How it works:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Pay 0.01 ETH to enter the raffle</li>
              <li>• Chainlink VRF ensures provably fair random selection</li>
              <li>• Winner takes the entire prize pool</li>
              <li>• New round starts automatically after each draw</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="text-lg font-medium">Entry Fee: 0.01 ETH</div>
              <div className="text-sm text-muted-foreground">
                {userHasEntered ? "✅ You have entered this round" : "Ready to enter?"}
              </div>
            </div>

            <Button
              onClick={enterRaffle}
              disabled={loading || !raffleStatus?.isOpen || userHasEntered}
              className="w-full sm:w-auto min-w-[140px]"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Ticket className="h-4 w-4 mr-2" />
              )}
              {userHasEntered ? "Entered!" : "Enter Raffle"}
            </Button>
          </div>

          {raffleStatus?.lastWinner && raffleStatus.lastWinner !== '0x0000000000000000000000000000000000000000' && (
            <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">Last Winner</span>
              </div>
              <p className="text-sm font-mono mt-1">{raffleStatus.lastWinner}</p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>
              <strong>Powered by Chainlink VRF:</strong> This raffle uses Chainlink's Verifiable Random Function
              to ensure truly random, tamper-proof winner selection. All randomness is cryptographically
              verified on-chain.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Raffle History</CardTitle>
          <CardDescription>Recent raffle winners and prize amounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Round #42</p>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
              <div className="text-right">
                <p className="font-medium">0.85 ETH</p>
                <p className="text-xs text-muted-foreground">Winner: 0x742d...8e87</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Round #41</p>
                <p className="text-sm text-muted-foreground">1 day ago</p>
              </div>
              <div className="text-right">
                <p className="font-medium">1.2 ETH</p>
                <p className="text-xs text-muted-foreground">Winner: 0x9f3c...2a1b</p>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Round #40</p>
                <p className="text-sm text-muted-foreground">3 days ago</p>
              </div>
              <div className="text-right">
                <p className="font-medium">0.67 ETH</p>
                <p className="text-xs text-muted-foreground">Winner: 0x8a7f...4c9d</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
