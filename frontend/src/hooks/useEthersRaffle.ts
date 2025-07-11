import { useState, useEffect } from 'react'
import { formatEther } from 'viem'

const CONTRACT_ADDRESS = '0xFeaf076B52D462c346F329Dd32d2248B7b520EeA'
const RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com'

const CONTRACT_ABI = [
    {
        "inputs": [],
        "name": "getCurrentRaffle",
        "outputs": [
            { "internalType": "uint256", "name": "roundId", "type": "uint256" },
            { "internalType": "uint256", "name": "startTime", "type": "uint256" },
            { "internalType": "uint256", "name": "endTime", "type": "uint256" },
            { "internalType": "uint256", "name": "participantCount", "type": "uint256" },
            { "internalType": "uint256", "name": "uniqueParticipantCount", "type": "uint256" },
            { "internalType": "uint256", "name": "prizePool", "type": "uint256" },
            { "internalType": "enum VRF25RaffleEnhanced.RaffleState", "name": "state", "type": "uint8" },
            { "internalType": "address", "name": "winner", "type": "address" },
            { "internalType": "bool", "name": "canDraw", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "TICKET_PRICE",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "currentRoundId",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "count", "type": "uint256" }],
        "name": "getRaffleHistory",
        "outputs": [
            {
                "components": [
                    { "internalType": "uint256", "name": "roundId", "type": "uint256" },
                    { "internalType": "uint256", "name": "startTime", "type": "uint256" },
                    { "internalType": "uint256", "name": "endTime", "type": "uint256" },
                    { "internalType": "uint256", "name": "participantCount", "type": "uint256" },
                    { "internalType": "uint256", "name": "uniqueParticipantCount", "type": "uint256" },
                    { "internalType": "uint256", "name": "prizePool", "type": "uint256" },
                    { "internalType": "enum VRF25RaffleEnhanced.RaffleState", "name": "state", "type": "uint8" },
                    { "internalType": "address", "name": "winner", "type": "address" },
                    { "internalType": "bool", "name": "prizeClaimed", "type": "bool" },
                    { "internalType": "uint256", "name": "randomValue", "type": "uint256" }
                ],
                "internalType": "struct VRF25RaffleEnhanced.RaffleRound[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

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

export function useEthersRaffle() {
    const [raffleInfo, setRaffleInfo] = useState<RaffleInfo | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })

    const fetchRaffleData = async () => {
        try {
            setError(null)

            // Add safety check for window object
            if (typeof window === 'undefined') {
                console.warn('⚠️ Window object not available')
                return
            }

            // Use ethers directly with better error handling
            const { ethers } = require('ethers')

            // Create provider with multiple fallback RPCs
            const providers = [
                'https://ethereum-sepolia-rpc.publicnode.com',
                'https://rpc.sepolia.org',
                'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
            ]

            let provider = null
            for (const rpcUrl of providers) {
                try {
                    provider = new ethers.JsonRpcProvider(rpcUrl)
                    await provider.getNetwork() // Test connection
                    break
                } catch (rpcError) {
                    console.warn(`⚠️ RPC ${rpcUrl} failed, trying next...`)
                    continue
                }
            }

            if (!provider) {
                throw new Error('All RPC providers failed')
            }

            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

            console.log('🔍 Fetching raffle data with ethers...')

            // Get current raffle data with timeout
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 10000)
            )

            const rafflePromise = Promise.all([
                contract.getCurrentRaffle(),
                contract.TICKET_PRICE()
            ])

            const [currentRaffleData, ticketPriceData] = await Promise.race([
                rafflePromise,
                timeout
            ]) as [any, any]

            console.log('✅ Ethers getCurrentRaffle result:', {
                roundId: currentRaffleData[0]?.toString() || '0',
                startTime: currentRaffleData[1].toString(),
                endTime: currentRaffleData[2].toString(),
                participantCount: currentRaffleData[3].toString(),
                uniqueParticipantCount: currentRaffleData[4].toString(),
                prizePool: ethers.formatEther(currentRaffleData[5]),
                state: currentRaffleData[6].toString(),
                winner: currentRaffleData[7],
                canDraw: currentRaffleData[8],
                endTimeMs: Number(currentRaffleData[2]) * 1000,
                currentTimeMs: Date.now(),
                timeDiff: Number(currentRaffleData[2]) * 1000 - Date.now()
            })

            // Transform the data
            const endTime = Number(currentRaffleData[2]) * 1000
            const now = Date.now()
            const timeDiff = endTime - now

            let timeLeftCalc = { hours: 0, minutes: 0, seconds: 0 }

            // Only calculate time if the raffle is active and has a valid end time
            if (timeDiff > 0 && Number(currentRaffleData[6]) === 0) {
                timeLeftCalc = {
                    hours: Math.floor(timeDiff / (1000 * 60 * 60)),
                    minutes: Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((timeDiff % (1000 * 60)) / 1000)
                }
            }

            const raffleData: RaffleInfo = {
                currentRound: Number(currentRaffleData[0]),
                prizePool: ethers.formatEther(currentRaffleData[5]),
                ticketPrice: ethers.formatEther(ticketPriceData),
                totalTickets: Number(currentRaffleData[3]),
                uniqueParticipants: Number(currentRaffleData[4]),
                timeLeft: timeLeftCalc,
                isActive: Number(currentRaffleData[6]) === 0,
                state: (['Open', 'Drawing', 'Completed'] as const)[Number(currentRaffleData[6])] || 'Open',
                winner: currentRaffleData[7] && currentRaffleData[7] !== '0x0000000000000000000000000000000000000000' ? currentRaffleData[7] : undefined,
                canDraw: Boolean(currentRaffleData[8])
            }

            setRaffleInfo(raffleData)
            setTimeLeft(timeLeftCalc)
            setIsLoading(false)

        } catch (err: any) {
            console.error('❌ Ethers raffle fetch error:', err)
            setError(err.message || 'Failed to fetch raffle data')
            setIsLoading(false)
        }
    }

    // Update time left every second
    useEffect(() => {
        if (!raffleInfo) return

        const interval = setInterval(() => {
            if (raffleInfo) {
                const endTime = Date.now() + (raffleInfo.timeLeft.hours * 3600 + raffleInfo.timeLeft.minutes * 60 + raffleInfo.timeLeft.seconds) * 1000
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
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [raffleInfo])

    // Fetch data on mount and set up refetch interval
    useEffect(() => {
        fetchRaffleData()

        const interval = setInterval(fetchRaffleData, 10000) // Refetch every 10 seconds
        return () => clearInterval(interval)
    }, [])

    return {
        raffleInfo: raffleInfo ? { ...raffleInfo, timeLeft } : null,
        isLoading,
        error,
        refetch: fetchRaffleData
    }
}

export function useEthersRaffleHistory() {
    const [rounds, setRounds] = useState<HistoricalRound[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchHistoryData = async () => {
        try {
            setError(null)

            // Use ethers directly
            const { ethers } = require('ethers')
            const provider = new ethers.JsonRpcProvider(RPC_URL)
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

            console.log('🔍 Fetching raffle history with ethers...')

            // Get raffle history (last 10 rounds)
            const historyData = await contract.getRaffleHistory(10)

            console.log('✅ Ethers getRaffleHistory result:', historyData)

            // Transform the data
            const transformedRounds: HistoricalRound[] = historyData
                .map((raffle: any) => {
                    // Only include rounds that have ended and have participants
                    if (Number(raffle.participantCount) === 0) {
                        console.log(`Skipping round ${raffle.roundId} - no participants`)
                        return null
                    }

                    return {
                        round: Number(raffle.roundId),
                        winner: raffle.winner && raffle.winner !== '0x0000000000000000000000000000000000000000' ? raffle.winner : 'No Winner',
                        prizePool: ethers.formatEther(raffle.prizePool),
                        totalTickets: Number(raffle.participantCount),
                        participants: Number(raffle.uniqueParticipantCount),
                        date: new Date(Number(raffle.endTime) * 1000).toLocaleDateString(),
                        state: (['Open', 'Drawing', 'Completed'] as const)[Number(raffle.state)] || 'Completed',
                        prizeClaimed: Boolean(raffle.prizeClaimed),
                        randomValue: raffle.randomValue ? raffle.randomValue.toString() : undefined
                    }
                })
                .filter(Boolean) as HistoricalRound[]

            console.log('✅ Transformed rounds:', transformedRounds)
            setRounds(transformedRounds)
            setIsLoading(false)

        } catch (err: any) {
            console.error('❌ Ethers history fetch error:', err)
            setError(err.message || 'Failed to fetch raffle history')
            setIsLoading(false)
        }
    }

    // Fetch data on mount and set up refetch interval
    useEffect(() => {
        fetchHistoryData()

        const interval = setInterval(fetchHistoryData, 30000) // Refetch every 30 seconds
        return () => clearInterval(interval)
    }, [])

    return {
        rounds,
        isLoading,
        error,
        refetch: fetchHistoryData
    }
}
