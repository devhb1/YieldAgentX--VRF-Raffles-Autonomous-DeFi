import { ReactNode } from 'react'

// ============= ENUMS =============

export enum Strategy {
    CONSERVATIVE = 0,
    BALANCED = 1,
    AGGRESSIVE = 2,
}

export enum RaffleState {
    OPEN = 0,
    CALCULATING = 1,
    CLOSED = 2,
}

// ============= AGENT TYPES =============

export interface Agent {
    id: bigint
    owner: string
    name: string
    strategy: Strategy
    totalDeposited: bigint
    currentValue: bigint
    totalYield: bigint
    lastRebalance: bigint
    createdAt: bigint
    isActive: boolean
}

export interface AgentWithMetrics extends Agent {
    valueInUSD: number
    yieldInUSD: number
    apy: number
    allocation: AllocationData
    performanceData: PerformanceMetric[]
}

export interface AllocationData {
    lidoStaking: bigint
    aaveLending: bigint
    uniswapLP: bigint
    compoundLending: bigint
    curveLP: bigint
    cashReserve: bigint
}

export interface PerformanceMetric {
    timestamp: number
    value: number
    yield: number
    apy: number
}

// ============= RAFFLE TYPES =============

export interface RaffleRound {
    roundId: bigint
    startTime: bigint
    endTime: bigint
    participants: string[]
    uniqueParticipants: bigint
    prizePool: bigint
    devFee: bigint
    state: RaffleState
    winner: string
    vrfRequestId: bigint
    prizeClaimed: boolean
}

export interface RaffleHistory {
    roundId: number
    duration: string
    participants: number
    prizePool: string
    winner: string
    status: string
    prizeStatus: string
    vrfHash?: string
}

export interface UserWinning {
    roundId: number
    amount: string
    claimed: boolean
    claimTxHash?: string
}

// ============= AI ANALYSIS TYPES =============

export interface AIAnalysisResult {
    riskScore: number
    rebalanceNeeded: boolean
    recommendations: string[]
    provider: string
    timestamp: number
}

export interface MarketSentiment {
    sentiment: 'bullish' | 'bearish' | 'neutral'
    confidence: number
    indicators: Array<{
        name: string
        value: string | number
    }>
    overall: string
    timestamp: number
}

export interface RiskAssessment {
    riskLevel: 'low' | 'moderate' | 'high'
    factors: Array<{
        name: string
        impact: string
    }>
    timestamp: number
}

export interface PortfolioAnalysis {
    totalValue: number
    totalYield: number
    averageAPY: number
    riskScore: number
    diversificationScore: number
    agents: AgentWithMetrics[]
}

// ============= UI TYPES =============

export interface Tab {
    id: string
    label: string
    content: ReactNode
}

export interface LoadingState {
    isLoading: boolean
    message?: string
}

export interface ErrorState {
    hasError: boolean
    message?: string
    code?: string
}

export interface TransactionState {
    hash?: string
    isLoading: boolean
    isSuccess: boolean
    isError: boolean
    error?: string
}

// ============= FORM TYPES =============

export interface CreateAgentForm {
    name: string
    strategy: Strategy
}

export interface DepositForm {
    agentId: string
    amount: string
}

export interface WithdrawForm {
    agentId: string
    amount: string
}

// ============= API TYPES =============

export interface ApiResponse<T> {
    data?: T
    error?: string
    message?: string
    success: boolean
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
    hasMore: boolean
}

// ============= CHAIN DATA TYPES =============

export interface TokenPrice {
    symbol: string
    price: number
    change24h: number
}

export interface GasPrice {
    slow: number
    standard: number
    fast: number
}

export interface TransactionHistory {
    hash: string
    blockNumber: number
    timestamp: number
    from: string
    to: string
    value: string
    functionName?: string
    status: 'success' | 'failed' | 'pending'
}

// ============= CONTRACT EVENT TYPES =============

export interface AgentCreatedEvent {
    agentId: bigint
    owner: string
    name: string
    strategy: Strategy
}

export interface FundsDepositedEvent {
    agentId: bigint
    amount: bigint
    totalValue: bigint
}

export interface FundsWithdrawnEvent {
    agentId: bigint
    amount: bigint
    remainingValue: bigint
}

export interface TicketPurchasedEvent {
    roundId: bigint
    participant: string
    ticketCount: bigint
    totalTickets: bigint
}

export interface RaffleCompletedEvent {
    roundId: bigint
    winner: string
    prizePool: bigint
    vrfRequestId: bigint
}

// ============= UTILITY TYPES =============

export type StrategyType = 'conservative' | 'balanced' | 'aggressive'

export type RiskLevel = 'low' | 'moderate' | 'high'

export type SentimentType = 'bullish' | 'bearish' | 'neutral'

export type NetworkType = 'sepolia' | 'mainnet'

export type ConnectorType = 'injected' | 'walletConnect' | 'coinbaseWallet'
