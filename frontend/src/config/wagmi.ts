import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, polygon, arbitrum, optimism } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

// Helper function to build RPC URL with fallback
const buildRpcUrl = (infuraEndpoint: string, fallbackUrl: string) => {
    const infuraKey = process.env.NEXT_PUBLIC_INFURA_KEY
    if (infuraKey && infuraKey !== 'your_infura_api_key_here') {
        return `${infuraEndpoint}${infuraKey}`
    }
    return fallbackUrl
}

// Multiple Sepolia RPC URLs for better reliability
const sepoliaRpcUrls = [
    process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
    'https://rpc.sepolia.org',
    'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    'https://sepolia.gateway.tenderly.co'
]

export const config = getDefaultConfig({
    appName: 'YieldAgentX',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [sepolia, mainnet, polygon, arbitrum, optimism], // Put sepolia first as default
    transports: {
        [sepolia.id]: http(sepoliaRpcUrls[0], {
            retryCount: 3,
            retryDelay: 1000,
            timeout: 10000
        }),
        [mainnet.id]: http(
            process.env.NEXT_PUBLIC_MAINNET_RPC_URL ||
            buildRpcUrl('https://mainnet.infura.io/v3/', 'https://ethereum.drpc.org'),
            { retryCount: 3, timeout: 10000 }
        ),
        [polygon.id]: http(
            process.env.NEXT_PUBLIC_POLYGON_RPC_URL ||
            buildRpcUrl('https://polygon-mainnet.infura.io/v3/', 'https://polygon-rpc.com'),
            { retryCount: 3, timeout: 10000 }
        ),
        [arbitrum.id]: http(
            process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL ||
            buildRpcUrl('https://arbitrum-mainnet.infura.io/v3/', 'https://arb1.arbitrum.io/rpc')
        ),
        [optimism.id]: http(
            process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL ||
            buildRpcUrl('https://optimism-mainnet.infura.io/v3/', 'https://mainnet.optimism.io')
        ),
    },
    ssr: true,
})

export const SUPPORTED_CHAINS = [mainnet, sepolia, polygon, arbitrum, optimism]

export const CONTRACT_ADDRESSES = {
    AI_VAULT: process.env.NEXT_PUBLIC_AI_VAULT_ADDRESS as `0x${string}`,
    VRF_RAFFLE: process.env.NEXT_PUBLIC_VRF_RAFFLE_ADDRESS as `0x${string}`,
    CHAINLINK_AUTOMATION: process.env.NEXT_PUBLIC_CHAINLINK_AUTOMATION_REGISTRY as `0x${string}`,
} as const

export const API_ENDPOINTS = {
    AI_BACKEND: process.env.NEXT_PUBLIC_AI_BACKEND_URL || 'http://localhost:3001',
    ETHERSCAN: 'https://api-sepolia.etherscan.io/api',
} as const

export const NETWORK_CONFIG = {
    [mainnet.id]: {
        chainId: mainnet.id,
        rpcUrl: process.env.NEXT_PUBLIC_MAINNET_RPC_URL ||
            buildRpcUrl('https://mainnet.infura.io/v3/', 'https://ethereum.drpc.org'),
        explorer: 'https://etherscan.io',
        name: 'Ethereum Mainnet',
    },
    [sepolia.id]: {
        chainId: sepolia.id,
        rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
            buildRpcUrl('https://sepolia.infura.io/v3/', 'https://ethereum-sepolia-rpc.publicnode.com'),
        explorer: 'https://sepolia.etherscan.io',
        name: 'Sepolia Testnet',
    },
    [polygon.id]: {
        chainId: polygon.id,
        rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL ||
            buildRpcUrl('https://polygon-mainnet.infura.io/v3/', 'https://polygon-rpc.com'),
        explorer: 'https://polygonscan.com',
        name: 'Polygon',
    },
    [arbitrum.id]: {
        chainId: arbitrum.id,
        rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || 'https://arbitrum.drpc.org',
        explorer: 'https://arbiscan.io',
        name: 'Arbitrum One',
    },
    [optimism.id]: {
        chainId: optimism.id,
        rpcUrl: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || 'https://optimism.drpc.org',
        explorer: 'https://optimistic.etherscan.io',
        name: 'Optimism',
    },
} as const
