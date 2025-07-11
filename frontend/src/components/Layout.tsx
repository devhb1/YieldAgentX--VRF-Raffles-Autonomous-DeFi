import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { cn } from '@/utils'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'AI Agents', href: '/agents', icon: '🤖' },
    { name: 'VRF Raffle', href: '/raffle', icon: '🎲' },
  ]

  return (
    <div className="min-h-screen bg-dark-primary">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-accent-purple/10"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-secondary-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="bg-gradient-to-br from-primary-500 to-chainlink-blue p-2.5 rounded-xl shadow-lg group-hover:shadow-glow transition-all duration-300">
                  <span className="text-xl font-bold text-white">YA</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-chainlink-light rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold gradient-text">YieldAgentX</h1>
                <p className="text-xs text-secondary-400 font-medium">Powered by Chainlink</p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group',
                    router.pathname === item.href
                      ? 'bg-gradient-to-r from-primary-600/20 to-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'text-secondary-300 hover:text-white hover:bg-secondary-800/50 border border-transparent hover:border-secondary-600/50'
                  )}
                >
                  <span className={cn(
                    'text-lg transition-transform duration-300',
                    router.pathname === item.href ? 'scale-110' : 'group-hover:scale-110'
                  )}>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Connect Wallet */}
            <div className="flex items-center space-x-4">
              <div className="bg-secondary-800/50 rounded-xl p-1 border border-secondary-700/50">
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-secondary-700/50 bg-secondary-900/50">
          <div className="flex justify-around py-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300',
                  router.pathname === item.href
                    ? 'text-primary-400'
                    : 'text-secondary-400 hover:text-white'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex-1 min-h-screen">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 glass border-t border-secondary-700/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo & Description */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-primary-500 to-chainlink-blue p-2 rounded-lg">
                  <span className="text-lg font-bold text-white">YA</span>
                </div>
                <span className="text-xl font-bold gradient-text">YieldAgentX</span>
              </div>
              <p className="text-secondary-400 text-sm leading-relaxed">
                Revolutionary AI-powered DeFi portfolio management with autonomous agents, 
                powered by Chainlink&apos;s cutting-edge infrastructure.
              </p>
            </div>

            {/* Chainlink Integration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Features</h3>
              <ul className="space-y-2 text-sm text-secondary-400">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                  <span>Chainlink Automation for portfolio rebalancing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-cyan rounded-full"></span>
                  <span>VRF v2.5 for provably fair raffles</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-emerald rounded-full"></span>
                  <span>Price feeds for accurate asset valuation</span>
                </li>
              </ul>
            </div>

            {/* Project Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">YieldAgentX</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-400">Network</span>
                  <span className="text-white font-medium">Ethereum Sepolia</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary-400">Version</span>
                  <span className="text-white font-medium">v1.0.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-secondary-700/50 flex flex-col md:flex-row justify-between items-center">
            <p className="text-secondary-500 text-sm">
              © 2025 YieldAgentX. Built with ❤️ for the Chainlink ecosystem.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a 
                href="https://github.com/devhb1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary-400 hover:text-white transition-colors duration-300 text-sm font-medium"
              >
                GitHub
              </a>
              <a 
                href="https://x.com/harshitb01" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary-400 hover:text-blue-400 transition-colors duration-300 text-sm font-medium"
              >
                Twitter
              </a>
              <a 
                href="https://chain.link" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary-400 hover:text-chainlink-blue transition-colors duration-300 text-sm font-medium"
              >
                Powered by Chainlink
              </a>
              <a 
                href="https://sepolia.etherscan.io" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-secondary-400 hover:text-primary-400 transition-colors duration-300 text-sm font-medium"
              >
                View on Etherscan
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
