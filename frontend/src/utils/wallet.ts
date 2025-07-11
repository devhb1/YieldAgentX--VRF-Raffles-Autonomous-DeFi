/**
 * Utility to handle multiple wallet extensions
 */

export const detectWallets = () => {
    if (typeof window === 'undefined') return []

    const wallets = []

    // Check for MetaMask
    if (window.ethereum?.isMetaMask) {
        wallets.push('MetaMask')
    }

    // Check for other wallets
    if (window.ethereum?.isZerion) {
        wallets.push('Zerion')
    }

    if (window.ethereum?.isBackpack) {
        wallets.push('Backpack')
    }

    // Check for Pelagus
    if (window.ethereum?.isPelagus) {
        wallets.push('Pelagus')
    }

    return wallets
}

export const getPreferredWallet = () => {
    const wallets = detectWallets()

    // Prefer MetaMask if available
    if (wallets.includes('MetaMask')) {
        return 'MetaMask'
    }

    // Otherwise return the first available wallet
    return wallets[0] || null
}

export const handleWalletErrors = (error: any) => {
    // Handle common wallet errors
    if (error?.code === 4001) {
        return 'User rejected the request'
    }

    if (error?.code === -32002) {
        return 'Request already pending. Please check your wallet.'
    }

    if (error?.code === -32603) {
        return 'Internal error. Please try again.'
    }

    if (error?.message?.includes('Cannot read properties of null')) {
        return 'Wallet extension conflict detected. Please disable conflicting wallets.'
    }

    return error?.message || 'Unknown wallet error'
}

export const safelyAccessEthereum = () => {
    try {
        if (typeof window === 'undefined') return null

        // Try to access ethereum safely
        const ethereum = window.ethereum

        if (!ethereum) return null

        // Check if it's properly initialized
        if (typeof ethereum.request !== 'function') {
            console.warn('⚠️ Ethereum object exists but request method is not available')
            return null
        }

        return ethereum
    } catch (error) {
        console.error('❌ Error accessing window.ethereum:', error)
        return null
    }
}
