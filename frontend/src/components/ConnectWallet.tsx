import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from 'wagmi'
import { Button } from '@/components/ui'
import { Wallet, ChevronDown, ExternalLink, Copy, Check, X, Shield, Smartphone, Network, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { SUPPORTED_CHAINS, NETWORK_CONFIG } from '@/config/wagmi'

export function ConnectWallet() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain()
  const chainId = useChainId()
  const [showOptions, setShowOptions] = useState(false)
  const [showChainOptions, setShowChainOptions] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getWalletIcon = (connectorName: string) => {
    switch (connectorName.toLowerCase()) {
      case 'metamask':
        return <Shield className="w-4 h-4 text-orange-400" />
      case 'walletconnect':
        return <Smartphone className="w-4 h-4 text-blue-400" />
      case 'coinbase wallet':
        return <Wallet className="w-4 h-4 text-blue-500" />
      default:
        return <Wallet className="w-4 h-4 text-purple-400" />
    }
  }

  const getWalletDescription = (connectorName: string) => {
    switch (connectorName.toLowerCase()) {
      case 'metamask':
        return 'Most popular browser extension wallet'
      case 'walletconnect':
        return 'Scan with your mobile wallet'
      case 'coinbase wallet':
        return 'Coinbase\'s official wallet'
      case 'injected':
        return 'Browser wallet detected'
      default:
        return 'Connect with this wallet'
    }
  }

  const getChainIcon = (chainId: number) => {
    switch (chainId) {
      case 1: // Ethereum Mainnet
        return '⟠'
      case 11155111: // Sepolia
        return '⟠'
      case 137: // Polygon
        return '⬢'
      case 42161: // Arbitrum
        return '🔵'
      case 10: // Optimism
        return '🔴'
      default:
        return '⛓️'
    }
  }

  const isUnsupportedChain = chain && !SUPPORTED_CHAINS.find(c => c.id === chain.id)
  const currentNetworkConfig = chain?.id ? NETWORK_CONFIG[chain.id as keyof typeof NETWORK_CONFIG] : null

  if (isConnected && address) {
    return (
      <div className="space-y-4">
        {/* Unsupported Chain Warning */}
        {isUnsupportedChain && (
          <div className="bg-gradient-to-r from-red-800/30 to-orange-800/30 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-sm font-medium text-red-200">Unsupported Network</div>
                <div className="text-xs text-red-300">Please switch to a supported network</div>
              </div>
            </div>
          </div>
        )}

        {/* Connected Wallet Display */}
        <div className={`bg-gradient-to-r ${
          isUnsupportedChain 
            ? 'from-red-800/30 to-orange-800/30 border-red-500/30' 
            : 'from-green-800/30 to-emerald-800/30 border-green-500/30'
        } border rounded-xl p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-r ${
                isUnsupportedChain 
                  ? 'from-red-500 to-orange-500' 
                  : 'from-green-500 to-emerald-500'
              } rounded-full flex items-center justify-center`}>
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className={`text-sm ${
                  isUnsupportedChain ? 'text-red-200' : 'text-green-200'
                }`}>
                  {isUnsupportedChain ? 'Wrong Network' : 'Connected'}
                </div>
                <div className="font-mono text-white font-semibold">{shortenAddress(address)}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(address)}
                className={`p-2 hover:${
                  isUnsupportedChain ? 'bg-red-700/30' : 'bg-green-700/30'
                } rounded-lg transition-colors group`}
                title={copiedAddress ? "Copied!" : "Copy Address"}
              >
                {copiedAddress ? (
                  <Check className={`w-4 h-4 ${
                    isUnsupportedChain ? 'text-red-300' : 'text-green-300'
                  }`} />
                ) : (
                  <Copy className={`w-4 h-4 ${
                    isUnsupportedChain ? 'text-red-300 group-hover:text-red-200' : 'text-green-300 group-hover:text-green-200'
                  }`} />
                )}
              </button>
              <a
                href={`${currentNetworkConfig?.explorer || 'https://etherscan.io'}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 hover:${
                  isUnsupportedChain ? 'bg-red-700/30' : 'bg-green-700/30'
                } rounded-lg transition-colors`}
                title="View on Explorer"
              >
                <ExternalLink className={`w-4 h-4 ${
                  isUnsupportedChain ? 'text-red-300' : 'text-green-300'
                }`} />
              </a>
            </div>
          </div>
        </div>

        {/* Network Selector */}
        <div className="bg-gradient-to-br from-purple-800/30 to-blue-800/30 border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-purple-300" />
              <span className="text-sm font-medium text-purple-200">Network</span>
            </div>
            <button
              onClick={() => setShowChainOptions(!showChainOptions)}
              className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors text-sm"
            >
              <span>Switch</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showChainOptions ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-purple-900/40 rounded-lg">
            <div className="text-lg">{getChainIcon(chainId)}</div>
            <div>
              <div className="font-medium text-white">
                {chain?.name || 'Unknown Network'}
              </div>
              <div className="text-xs text-purple-300">
                Chain ID: {chainId}
              </div>
            </div>
          </div>

          {/* Chain Options */}
          {showChainOptions && (
            <div className="mt-3 space-y-2">
              <div className="text-xs text-purple-300 mb-2">Available Networks:</div>
              {SUPPORTED_CHAINS.map((supportedChain) => (
                <button
                  key={supportedChain.id}
                  onClick={() => {
                    switchChain({ chainId: supportedChain.id })
                    setShowChainOptions(false)
                  }}
                  disabled={isSwitchingChain || chainId === supportedChain.id}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left ${
                    chainId === supportedChain.id
                      ? 'bg-purple-600/50 border border-purple-400/50'
                      : 'hover:bg-purple-700/30 border border-transparent hover:border-purple-500/30'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="text-lg">{getChainIcon(supportedChain.id)}</div>
                  <div className="flex-1">
                    <div className={`font-medium ${
                      chainId === supportedChain.id ? 'text-white' : 'text-purple-100'
                    }`}>
                      {supportedChain.name}
                    </div>
                    <div className="text-xs text-purple-300">
                      Chain ID: {supportedChain.id}
                    </div>
                  </div>
                  {chainId === supportedChain.id && (
                    <Check className="w-4 h-4 text-purple-300" />
                  )}
                  {isSwitchingChain && (
                    <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Disconnect Button */}
        <Button
          onClick={() => disconnect()}
          variant="outline"
          className="w-full border-red-500/50 text-red-300 hover:bg-red-500/10 hover:border-red-500"
        >
          Disconnect Wallet
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Rainbow Kit Connect Button */}
      <div className="flex justify-center">
        <ConnectButton.Custom>
          {({ openConnectModal, connectModalOpen }) => (
            <Button
              onClick={openConnectModal}
              disabled={connectModalOpen}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none px-8 py-3 text-lg font-semibold"
            >
              <Wallet className="w-5 h-5 mr-2" />
              Connect Wallet
            </Button>
          )}
        </ConnectButton.Custom>
      </div>

      {/* Manual Connector Options */}
      <div className="relative">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="w-full flex items-center justify-center gap-2 text-purple-200 hover:text-white transition-colors text-sm"
        >
          <span>More wallet options</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
        </button>

        {showOptions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-sm border border-purple-500/30 rounded-xl p-3 space-y-2 z-10 shadow-xl">
            <div className="text-xs text-purple-300 mb-3 text-center">Choose your preferred wallet</div>
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => {
                  connect({ connector })
                  setShowOptions(false)
                }}
                disabled={isPending}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-purple-700/40 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed group border border-transparent hover:border-purple-500/30"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-purple-500/20 group-hover:border-purple-400/40 transition-colors">
                  {getWalletIcon(connector.name)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white group-hover:text-purple-100 transition-colors">
                    {connector.name}
                  </div>
                  <div className="text-xs text-purple-300 group-hover:text-purple-200 transition-colors">
                    {getWalletDescription(connector.name)}
                  </div>
                </div>
                {isPending && (
                  <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            ))}
            <div className="border-t border-purple-500/20 pt-3 mt-3">
              <div className="text-xs text-purple-400 text-center">
                Don&apos;t have a wallet?{' '}
                <a
                  href="https://ethereum.org/wallets/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-300 hover:text-white underline transition-colors"
                >
                  Get one here
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-center text-xs text-purple-300">
        New to Ethereum?{' '}
        <a
          href="https://ethereum.org/wallets/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-200 hover:text-white underline"
        >
          Learn about wallets
        </a>
      </div>
    </div>
  )
}
