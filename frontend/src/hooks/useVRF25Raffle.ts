import { useState, useEffect } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { formatEther } from 'viem'
import { VRF25_RAFFLE_ABI } from '@/lib/abis'
import { CONTRACT_ADDRESSES } from '@/config/wagmi'

const VRF25_RAFFLE_ADDRESS = CONTRACT_ADDRESSES.VRF_RAFFLE

export interface RaffleInfo {
    currentRound: number
    prizePool: string
    ticketPrice: string
    totalTickets: number
    uniqueParticipants: number
    timeLeft: {
        hours: number
        minutes: number
        seconds: number
    }
    isActive: boolean
    state: 'Open' | 'Drawing' | 'Completed'
    winner?: string
    canDraw: boolean
}

export interface HistoricalRound {
    round: number
    winner: string
    prizePool: string
    totalTickets: number
    participants: number
    date: string
    state: 'Open' | 'Drawing' | 'Completed'
    prizeClaimed: boolean
    randomValue?: string
    transactionHash?: string
}

export interface UserWinning {
    round: number
    amount: string
    amountETH: string
    claimed: boolean
    date: string
    randomValue?: string
}

export function useCurrentRaffle() {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
    const { isConnected } = useAccount()

    // Debug logging
    console.log('VRF25_RAFFLE_ADDRESS:', VRF25_RAFFLE_ADDRESS)
    console.log('isConnected:', isConnected)

    // Get current round ID first to check if there's an active raffle
    const { data: currentRoundId, error: roundIdError } = useReadContract({
        address: VRF25_RAFFLE_ADDRESS,
        abi: VRF25_RAFFLE_ABI,
        functionName: 'currentRoundId',
        chainId: 11155111, // Explicitly set Sepolia chain ID
        query: {
            enabled: !!VRF25_RAFFLE_ADDRESS,
        }
    })

    // Use the contract's getCurrentRaffle function only if we have a current round
    const { data: currentRaffleData, isLoading, error, refetch } = useReadContract({
        address: VRF25_RAFFLE_ADDRESS,
        abi: VRF25_RAFFLE_ABI,
        functionName: 'getCurrentRaffle',
        chainId: 11155111, // Explicitly set Sepolia chain ID
        query: {
            enabled: !!VRF25_RAFFLE_ADDRESS && !!currentRoundId && Number(currentRoundId) > 0,
            refetchInterval: 5000,
            retry: false, // Don't retry on error
        }
    })

    // Get ticket price
    const { data: ticketPrice } = useReadContract({
        address: VRF25_RAFFLE_ADDRESS,
        abi: VRF25_RAFFLE_ABI,
        functionName: 'TICKET_PRICE',
        chainId: 11155111, // Explicitly set Sepolia chain ID
        query: {
            enabled: !!VRF25_RAFFLE_ADDRESS,
        }
    })

    // If we have contract errors, show a helpful message
    const contractError = roundIdError || error

    // Add more detailed error logging
    useEffect(() => {
        if (contractError) {
            console.error('Contract error details:', {
                roundIdError: roundIdError?.message,
                error: error?.message,
                address: VRF25_RAFFLE_ADDRESS,
                currentRoundId,
                currentRaffleData
            })
        }
    }, [contractError, roundIdError, error, currentRoundId, currentRaffleData])

    // Update time left every second
    useEffect(() => {
        if (!currentRaffleData || !Array.isArray(currentRaffleData) || currentRaffleData.length < 9) return

        const interval = setInterval(() => {
            try {
                const endTime = Number(currentRaffleData[2]) * 1000
                const now = Date.now()
                const diff = endTime - now

                if (diff > 0) {
                    const hours = Math.floor(diff / (1000 * 60 * 60))
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
                    setTimeLeft({ hours, minutes, seconds })
                } else {
                    setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
                }
            } catch (err) {
                console.warn('Error calculating time left:', err)
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [currentRaffleData])

    // Transform the data for the UI with better error handling
    const raffleInfo = (() => {
        // If there's a contract error, return a default state
        if (contractError) {
            console.error('Contract error:', contractError)
            return {
                currentRound: 0,
                prizePool: '0',
                ticketPrice: '0.001',
                totalTickets: 0,
                uniqueParticipants: 0,
                timeLeft: { hours: 0, minutes: 0, seconds: 0 },
                isActive: false,
                state: 'Open' as const,
                winner: undefined,
                canDraw: false
            }
        }

        try {
            if (!currentRaffleData || !Array.isArray(currentRaffleData)) {
                console.log('getCurrentRaffle returned invalid data:', currentRaffleData)
                return null
            }

            if (currentRaffleData.length < 9) {
                console.log('getCurrentRaffle returned incomplete data array. Length:', currentRaffleData.length)
                return null
            }

            return {
                currentRound: Number(currentRaffleData[0] || 0),
                prizePool: formatEther(currentRaffleData[5] || 0n),
                ticketPrice: ticketPrice ? formatEther(ticketPrice as bigint) : '0.001',
                totalTickets: Number(currentRaffleData[3] || 0),
                uniqueParticipants: Number(currentRaffleData[4] || 0),
                timeLeft,
                isActive: Number(currentRaffleData[6] || 0) === 0,
                state: (['Open', 'Drawing', 'Completed'] as const)[Number(currentRaffleData[6] || 0)] || 'Open',
                winner: currentRaffleData[7] && currentRaffleData[7] !== '0x0000000000000000000000000000000000000000' ? currentRaffleData[7] : undefined,
                canDraw: Boolean(currentRaffleData[8])
            }
        } catch (err) {
            console.error('Error parsing getCurrentRaffle data:', err)
            console.log('Raw data:', currentRaffleData)
            return null
        }
    })()

    return {
        raffleInfo,
        isLoading,
        error: contractError?.message || error?.message || null,
        refetch
    }
}

export function useBuyTickets() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const { data: ticketPrice } = useReadContract({
        address: VRF25_RAFFLE_ADDRESS,
        abi: VRF25_RAFFLE_ABI,
        functionName: 'TICKET_PRICE',
    })

    const buyTickets = async (ticketCount: number) => {
        if (!ticketPrice) throw new Error('Could not fetch ticket price')

        const totalCost = BigInt(ticketCount) * (ticketPrice as bigint)

        writeContract({
            address: VRF25_RAFFLE_ADDRESS,
            abi: VRF25_RAFFLE_ABI,
            functionName: 'buyTickets',
            args: [BigInt(ticketCount)],
            value: totalCost,
        })
    }

    return { buyTickets, isLoading: isPending || isConfirming, isSuccess, error, hash }
}

export function useUserTickets() {
    const { address } = useAccount()

    const { data: ticketCount, isLoading, error, refetch } = useReadContract({
        address: VRF25_RAFFLE_ADDRESS,
        abi: VRF25_RAFFLE_ABI,
        functionName: 'getUserTicketCount',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && !!VRF25_RAFFLE_ADDRESS,
            refetchInterval: 5000,
        }
    })

    return {
        ticketCount: ticketCount ? Number(ticketCount) : 0,
        isLoading,
        error: error?.message || null,
        refetch
    }
}

export function useRaffleHistory() {
    const { isConnected } = useAccount()

    // Get raffle history from contract
    const { data: historyData, isLoading, error, refetch } = useReadContract({
        address: VRF25_RAFFLE_ADDRESS,
        abi: VRF25_RAFFLE_ABI,
        functionName: 'getRaffleHistory',
        args: [BigInt(10)], // Get last 10 rounds
        query: {
            enabled: !!VRF25_RAFFLE_ADDRESS,
            refetchInterval: 10000, // Refresh every 10 seconds
        }
    })

    // Transform contract data to frontend format with better error handling
    const rounds: HistoricalRound[] = (() => {
        try {
            if (!historyData || !Array.isArray(historyData)) {
                return []
            }

            return historyData.map((raffle: any) => {
                if (!raffle || typeof raffle !== 'object') {
                    return null
                }

                return {
                    round: Number(raffle.roundId || 0),
                    winner: raffle.winner || '0x0000000000000000000000000000000000000000',
                    prizePool: raffle.prizePool ? formatEther(raffle.prizePool) : '0',
                    totalTickets: Number(raffle.participantCount || 0),
                    participants: Number(raffle.uniqueParticipantCount || 0),
                    date: raffle.endTime ? new Date(Number(raffle.endTime) * 1000).toLocaleDateString() : 'Unknown',
                    state: (['Open', 'Drawing', 'Completed'] as const)[raffle.state || 2] || 'Completed',
                    prizeClaimed: Boolean(raffle.prizeClaimed),
                    randomValue: raffle.randomValue ? raffle.randomValue.toString() : undefined
                }
            }).filter(Boolean) as HistoricalRound[]
        } catch (err) {
            console.error('Error processing raffle history:', err)
            return []
        }
    })()

    return {
        rounds,
        isLoading,
        error: error?.message || null
    }
}

export function useUserWinnings() {
    const { address } = useAccount()

    // Get user winnings from contract
    const { data: userWinningsData, isLoading, error, refetch } = useReadContract({
        address: VRF25_RAFFLE_ADDRESS,
        abi: VRF25_RAFFLE_ABI,
        functionName: 'getUserWinnings',
        args: address ? [address] : undefined,
        query: {
            enabled: !!address && !!VRF25_RAFFLE_ADDRESS,
            refetchInterval: 10000, // Refresh every 10 seconds
        }
    })

    // Transform contract data to frontend format with better error handling
    const transformedData = (() => {
        try {
            if (!userWinningsData || !Array.isArray(userWinningsData)) {
                return { winnings: [], pendingWinnings: [] }
            }

            return userWinningsData.reduce((acc: any, winning: any) => {
                if (!winning || typeof winning !== 'object') {
                    return acc
                }

                const winningData = {
                    round: Number(winning.roundId || 0),
                    amount: winning.prizeAmount ? winning.prizeAmount.toString() : '0',
                    amountETH: winning.prizeAmount ? formatEther(winning.prizeAmount) : '0',
                    claimed: Boolean(winning.claimed),
                    date: winning.timestamp ? new Date(Number(winning.timestamp) * 1000).toLocaleString() : 'Unknown',
                    randomValue: winning.randomValue ? winning.randomValue.toString() : undefined
                }

                if (winning.claimed) {
                    acc.winnings.push(winningData)
                } else {
                    acc.pendingWinnings.push(winningData)
                }

                return acc
            }, { winnings: [], pendingWinnings: [] })
        } catch (err) {
            console.error('Error processing user winnings:', err)
            return { winnings: [], pendingWinnings: [] }
        }
    })()

    // Calculate total winnings
    const totalWinnings = transformedData.winnings.reduce((sum: number, winning: any) => {
        return sum + parseFloat(winning.amountETH)
    }, 0)

    return {
        winnings: transformedData.winnings,
        pendingWinnings: transformedData.pendingWinnings,
        isLoading,
        totalWinnings,
        error: error?.message || null,
        refetch
    }
}

export function useDrawWinner() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const { data: isReadyToDrawRaw } = useReadContract({
        address: VRF25_RAFFLE_ADDRESS,
        abi: VRF25_RAFFLE_ABI,
        functionName: 'isReadyToDraw',
    })

    const isReadyToDraw = Boolean(isReadyToDrawRaw)

    const drawWinner = async () => {
        writeContract({
            address: VRF25_RAFFLE_ADDRESS,
            abi: VRF25_RAFFLE_ABI,
            functionName: 'drawWinner',
        })
    }

    return { drawWinner, isLoading: isPending || isConfirming, isSuccess, isReadyToDraw, error, hash }
}

export function useClaimPrize() {
    const { writeContract, data: hash, isPending, error } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const claimPrize = async (roundId: number) => {
        writeContract({
            address: VRF25_RAFFLE_ADDRESS,
            abi: VRF25_RAFFLE_ABI,
            functionName: 'claimPrize',
            args: [BigInt(roundId)]
        })
    }

    return { claimPrize, isLoading: isPending || isConfirming, isSuccess, error, hash }
}

export function useRaffleVRFData(roundId: number | undefined) {
    const [randomValue, setRandomValue] = useState<string | null>(null)
    const [requestId, setRequestId] = useState<string | null>(null)
    const [hasRandomness, setHasRandomness] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { data: vrfData, isLoading: isVrfLoading, error: vrfError } = useReadContract({
        address: VRF25_RAFFLE_ADDRESS,
        abi: VRF25_RAFFLE_ABI,
        functionName: 'getRoundVRFData',
        args: roundId ? [BigInt(roundId)] : undefined,
        query: {
            enabled: !!roundId && !!VRF25_RAFFLE_ADDRESS,
        }
    })

    useEffect(() => {
        if (vrfData && Array.isArray(vrfData) && vrfData.length >= 3) {
            setRandomValue(vrfData[0]?.toString() || null)
            setRequestId(vrfData[0]?.toString() || null)
            setHasRandomness(Boolean(vrfData[2]))
            setIsLoading(false)
            setError(null)
        } else if (vrfError) {
            setError(vrfError.message)
            setIsLoading(false)
        } else {
            setIsLoading(isVrfLoading)
        }
    }, [vrfData, vrfError, isVrfLoading])

    return {
        randomValue,
        requestId,
        hasRandomness,
        isLoading,
        error,
        refetch: () => setIsLoading(true)
    }
}
