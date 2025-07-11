import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatEther, parseEther } from 'viem'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// ============= FORMATTING UTILITIES =============

export function formatETH(value: bigint | string, decimals: number = 4): string {
    if (typeof value === 'string') {
        return Number(value).toFixed(decimals)
    }
    return Number(formatEther(value)).toFixed(decimals)
}

export function formatUSD(value: number, decimals: number = 2): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value)
}

export function formatPercentage(value: number, decimals: number = 2): string {
    return `${value.toFixed(decimals)}%`
}

export function formatNumber(value: number, decimals: number = 2): string {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value)
}

export function formatCompact(value: number): string {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 2,
    }).format(value)
}

// ============= ADDRESS UTILITIES =============

export function shortenAddress(address: string, chars: number = 4): string {
    if (!address) return ''
    if (address.length <= chars * 2 + 2) return address
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// ============= TIME UTILITIES =============

export function formatTimeAgo(timestamp: number): string {
    const now = Date.now()
    const diffInSeconds = Math.floor((now - timestamp * 1000) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function formatDateTime(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

// ============= CALCULATION UTILITIES =============

export function calculateAPY(
    currentValue: bigint,
    initialValue: bigint,
    timeInDays: number
): number {
    if (initialValue === 0n || timeInDays === 0) return 0

    const current = Number(formatEther(currentValue))
    const initial = Number(formatEther(initialValue))
    const dailyReturn = (current - initial) / initial / timeInDays
    return (Math.pow(1 + dailyReturn, 365) - 1) * 100
}

export function calculateYield(
    currentValue: bigint,
    initialValue: bigint
): number {
    if (initialValue === 0n) return 0

    const current = Number(formatEther(currentValue))
    const initial = Number(formatEther(initialValue))
    return ((current - initial) / initial) * 100
}

export function calculateAllocationPercentages(allocation: {
    lidoStaking: bigint
    aaveLending: bigint
    uniswapLP: bigint
    compoundLending: bigint
    curveLP: bigint
    cashReserve: bigint
}): Record<string, number> {
    const total = Object.values(allocation).reduce((sum, val) => sum + val, 0n)

    if (total === 0n) {
        return {
            lidoStaking: 0,
            aaveLending: 0,
            uniswapLP: 0,
            compoundLending: 0,
            curveLP: 0,
            cashReserve: 0,
        }
    }

    return {
        lidoStaking: Number((allocation.lidoStaking * 10000n) / total) / 100,
        aaveLending: Number((allocation.aaveLending * 10000n) / total) / 100,
        uniswapLP: Number((allocation.uniswapLP * 10000n) / total) / 100,
        compoundLending: Number((allocation.compoundLending * 10000n) / total) / 100,
        curveLP: Number((allocation.curveLP * 10000n) / total) / 100,
        cashReserve: Number((allocation.cashReserve * 10000n) / total) / 100,
    }
}

// ============= VALIDATION UTILITIES =============

export function validateETHAmount(amount: string): {
    isValid: boolean
    error?: string
} {
    if (!amount || amount.trim() === '') {
        return { isValid: false, error: 'Amount is required' }
    }

    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
        return { isValid: false, error: 'Invalid amount' }
    }

    if (numAmount < 0.001) {
        return { isValid: false, error: 'Minimum amount is 0.001 ETH' }
    }

    if (numAmount > 1000) {
        return { isValid: false, error: 'Maximum amount is 1000 ETH' }
    }

    return { isValid: true }
}

export function validateAgentName(name: string): {
    isValid: boolean
    error?: string
} {
    if (!name || name.trim() === '') {
        return { isValid: false, error: 'Agent name is required' }
    }

    if (name.length < 3) {
        return { isValid: false, error: 'Agent name must be at least 3 characters' }
    }

    if (name.length > 32) {
        return { isValid: false, error: 'Agent name must be less than 32 characters' }
    }

    if (!/^[a-zA-Z0-9\s-_]+$/.test(name)) {
        return { isValid: false, error: 'Agent name contains invalid characters' }
    }

    return { isValid: true }
}

// ============= STRATEGY UTILITIES =============

export function getStrategyName(strategy: number): string {
    switch (strategy) {
        case 0: return 'Conservative'
        case 1: return 'Balanced'
        case 2: return 'Aggressive'
        default: return 'Unknown'
    }
}

export function getStrategyDescription(strategy: number): string {
    switch (strategy) {
        case 0: return 'Low risk, stable returns with focus on staking and lending'
        case 1: return 'Balanced allocation across various DeFi protocols'
        case 2: return 'High risk, maximum yield through LP positions and derivatives'
        default: return 'Unknown strategy'
    }
}

export function getStrategyColor(strategy: number): string {
    switch (strategy) {
        case 0: return 'text-accent-600 bg-accent-100'
        case 1: return 'text-warning-600 bg-warning-100'
        case 2: return 'text-danger-600 bg-danger-100'
        default: return 'text-gray-600 bg-gray-100'
    }
}

export function getRiskColor(riskLevel: string): string {
    switch (riskLevel.toLowerCase()) {
        case 'low': return 'text-accent-600 bg-accent-100'
        case 'moderate': return 'text-warning-600 bg-warning-100'
        case 'high': return 'text-danger-600 bg-danger-100'
        default: return 'text-gray-600 bg-gray-100'
    }
}

// ============= ARRAY UTILITIES =============

export function chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size))
    }
    return chunks
}

export function groupBy<T, K extends keyof any>(
    array: T[],
    key: (item: T) => K
): Record<K, T[]> {
    return array.reduce((groups, item) => {
        const group = key(item)
        groups[group] = groups[group] || []
        groups[group].push(item)
        return groups
    }, {} as Record<K, T[]>)
}

// ============= ERROR UTILITIES =============

export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message
    }
    if (typeof error === 'string') {
        return error
    }
    return 'An unknown error occurred'
}

export function isUserRejectedError(error: unknown): boolean {
    const message = getErrorMessage(error).toLowerCase()
    return message.includes('user rejected') ||
        message.includes('user denied') ||
        message.includes('rejected by user')
}

// ============= LOCAL STORAGE UTILITIES =============

export function getLocalStorageItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue

    try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : defaultValue
    } catch {
        return defaultValue
    }
}

export function setLocalStorageItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return

    try {
        localStorage.setItem(key, JSON.stringify(value))
    } catch {
        // Silently fail
    }
}

// ============= DEBOUNCE UTILITY =============

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}
