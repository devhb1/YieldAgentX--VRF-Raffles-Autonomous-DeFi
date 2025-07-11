import { useState, useEffect } from 'react'
import { useAccount, useBalance, useChainId } from 'wagmi'
import Head from 'next/head'
import { ConnectWallet } from '@/components/ConnectWallet'
import { Card } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'
import { NETWORK_CONFIG } from '@/config/wagmi'
import { MyAgents } from '@/components/agents/MyAgents'
import { CreateAgent } from '@/components/agents/CreateAgent'
import { PortfolioAnalysis } from '@/components/agents/PortfolioAnalysis'
import { AIInsights } from '@/components/agents/AIInsights'

export default function AgentsPage() {
    const [activeTab, setActiveTab] = useState('my-agents')
    const { isConnected, address, chain } = useAccount()
    const { data: balance } = useBalance({ address })
    const chainId = useChainId()
    
    // Get the current network config
    const currentNetworkConfig = chain?.id ? NETWORK_CONFIG[chain?.id as keyof typeof NETWORK_CONFIG] : null
    
    // Handle navigation events from child components
    useEffect(() => {
        const handleNavigateToCreate = () => {
            setActiveTab('create')
        }

        const handleNavigateToAIAnalysis = () => {
            setActiveTab('insights')
        }

        window.addEventListener('navigate-to-create-agent', handleNavigateToCreate)
        window.addEventListener('navigate-to-ai-analysis', handleNavigateToAIAnalysis)
        
        return () => {
            window.removeEventListener('navigate-to-create-agent', handleNavigateToCreate)
            window.removeEventListener('navigate-to-ai-analysis', handleNavigateToAIAnalysis)
        }
    }, [])

    if (!isConnected) {
        return (
            <>
                <Head>
                    <title>AI Agents - YieldAgentX</title>
                    <meta name="description" content="Manage your AI-powered DeFi agents" />
                </Head>
                <div className="min-h-screen bg-gradient-to-br from-dark-primary via-secondary-900 to-dark-primary">
                    <div className="container mx-auto px-4 py-12">
                        <div className="text-center">
                            <div className="max-w-md mx-auto">
                                <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-chainlink-blue rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-4xl">🤖</span>
                                </div>
                                <h1 className="text-4xl font-bold gradient-text mb-4">
                                    Connect Your Wallet
                                </h1>
                                <p className="text-lg text-secondary-300 mb-8">
                                    Connect your wallet to create and manage AI agents for automated DeFi yield optimization
                                </p>
                                <div className="card-modern glass-light border border-primary-500/30 rounded-xl p-6">
                                    <ConnectWallet />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Head>
                <title>AI Agents Dashboard - YieldAgentX</title>
                <meta name="description" content="Manage your AI-powered DeFi agents" />
            </Head>
            <div className="min-h-screen bg-gradient-to-br from-dark-primary via-secondary-900 to-dark-primary">
                {/* Header */}
                <div className="border-b border-secondary-700/50 glass backdrop-blur-sm">
                    <div className="container mx-auto px-6 py-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-4xl font-bold gradient-text mb-3">
                                    Manage your AI-powered yield agents
                                </h1>
                                <p className="text-secondary-300 text-lg">
                                    Deploy and manage your autonomous DeFi agents with real-time analytics
                                </p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <div className="text-xs text-purple-300 uppercase tracking-wide">Network</div>
                                        <div className="text-sm font-semibold text-white">
                                            {currentNetworkConfig?.name || chain?.name || 'Unknown'}
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-secondary-600"></div>
                                    <div className="text-center">
                                        <div className="text-xs text-secondary-300 uppercase tracking-wide">Gas Price</div>
                                        <div className="text-sm font-semibold text-accent-emerald">~15 gwei</div>
                                    </div>
                                </div>
                                <button className="p-2 hover:bg-secondary-800/50 rounded-lg transition-colors">
                                    <RefreshCw className="w-5 h-5 text-secondary-300" />
                                </button>
                                <div className="text-right">
                                    <div className="text-sm text-secondary-300">Your Balance</div>
                                    <div className="text-xl font-bold text-white">
                                        {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0.0000 ETH'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="border-b border-secondary-700/50 glass backdrop-blur-sm">
                    <div className="container mx-auto px-6">
                        <nav className="flex space-x-1" role="tablist">
                            {[
                                { id: 'my-agents', label: 'My Agents', icon: '📊' },
                                { id: 'create', label: 'Create Agent', icon: '+' },
                                { id: 'portfolio', label: 'Portfolio Analysis', icon: '📈' },
                                { id: 'insights', label: 'AI Analysis', icon: '🤖' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    role="tab"
                                    aria-selected={activeTab === tab.id}
                                    className={`flex items-center gap-3 py-4 px-6 border-b-2 font-medium text-sm transition-all duration-200 rounded-t-lg ${
                                        activeTab === tab.id
                                            ? 'border-purple-400 text-white bg-gradient-to-r from-purple-600/40 to-blue-600/40 backdrop-blur-sm'
                                            : 'border-transparent text-purple-200 hover:text-white hover:border-purple-500/50 hover:bg-purple-700/30'
                                    }`}
                                >
                                    <span className="text-base">{tab.icon}</span>
                                    <span>{tab.label}</span>
                                    {tab.id === 'my-agents' && (
                                        <span className="ml-1 px-2 py-0.5 text-xs bg-purple-500/40 text-purple-200 rounded-full border border-purple-400/30">
                                            Live
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content */}
                <div className="container mx-auto px-6 py-8">
                    {activeTab === 'my-agents' && <MyAgents />}
                    {activeTab === 'create' && <CreateAgent />}
                    {activeTab === 'portfolio' && <PortfolioAnalysis />}
                    {activeTab === 'insights' && <AIInsights />}
                </div>
            </div>
        </>
    )
}
