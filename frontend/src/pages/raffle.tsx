'use client'

import { useState, useEffect } from 'react'
import { ConnectWallet } from '@/components/ConnectWallet'
import { CurrentRaffle } from '@/components/raffle/CurrentRaffle'
import { RaffleHistory } from '@/components/raffle/RaffleHistory'
import { MyWinnings } from '@/components/raffle/MyWinnings'
import { useAccount, useChainId } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy } from 'lucide-react'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

export default function RafflePage() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const [activeTab, setActiveTab] = useState<'current' | 'past' | 'winnings'>('current')
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-secondary-900 to-dark-primary p-8 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-64 h-8 bg-secondary-800 rounded mb-4"></div>
          <div className="w-32 h-4 bg-secondary-800 rounded"></div>
        </div>
      </div>
    )
  }

  // Show wrong network message if connected but on wrong network
  if (isConnected && chainId !== 11155111) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-secondary-900 to-dark-primary p-8 flex items-center justify-center">
        <Card className="w-full max-w-md card-modern glass-light border border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-amber-400">Wrong Network</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-secondary-400">Raffle is only available on Sepolia testnet. Please switch networks.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-secondary-900 to-dark-primary p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-chainlink-blue rounded-full flex items-center justify-center">
              <div className="text-3xl">🔗</div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">
              Chainlink VRF Raffle
            </h1>
          </div>
          <p className="text-secondary-400 text-xl max-w-2xl mx-auto">
            Buy tickets for a chance to win! Provably fair randomness powered by Chainlink VRF.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-slate-800/80 backdrop-blur-sm rounded-xl p-1 border border-slate-700/50 shadow-lg">
            <button
              onClick={() => setActiveTab('current')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'current' 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <div className="text-lg">🏆</div>
              <span className="hidden sm:inline">Current Raffle</span>
              <span className="sm:hidden">Current</span>
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'past' 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Past Rounds</span>
              <span className="sm:hidden">History</span>
            </button>
            <button
              onClick={() => setActiveTab('winnings')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'winnings' 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <div className="text-lg">💰</div>
              <span className="hidden sm:inline">My Winnings</span>
              <span className="sm:hidden">Winnings</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in-50 duration-200">
          <ErrorBoundary>
            {activeTab === 'current' && <CurrentRaffle />}
          </ErrorBoundary>
          <ErrorBoundary>
            {activeTab === 'past' && <RaffleHistory />}
          </ErrorBoundary>
          <ErrorBoundary>
            {activeTab === 'winnings' && <MyWinnings />}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}
