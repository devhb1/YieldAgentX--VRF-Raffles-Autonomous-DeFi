export const CONTRACT_ADDRESSES = {
    11155111: { // Sepolia
        raffle: '0x83f2d33fa7d190170105d0ff07e04dee808765cc' as string, // Updated contract address
        vault: '0x0000000000000000000000000000000000000000' as string // Placeholder
    }
} as const

export function getContractAddresses(chainId: number | undefined): { raffle: string; vault: string } | null {
    if (!chainId) return null
    return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] || null
}

export const SEPOLIA_CHAIN_ID = 11155111
