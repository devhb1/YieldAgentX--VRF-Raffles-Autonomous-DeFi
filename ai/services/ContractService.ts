/**
 * Contract Integration Service
 * Handles all smart contract interactions for the AI system
 */

import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from 'dotenv';

dotenv.config();

// Contract addresses and ABIs
const CONTRACT_ADDRESSES = {
    AI_VAULT: '0x299bB7655582f94f4293BB64775C9E1fcE210F3b',
    VRF_RAFFLE: '0x83f2d33fa7d190170105d0ff07e04dee808765cc'
};

interface AgentData {
    id: bigint;
    owner: string;
    name: string;
    strategy: number;
    totalDeposited: bigint;
    currentValue: bigint;
    totalYield: bigint;
    lastRebalance: bigint;
    createdAt: bigint;
    isActive: boolean;
}

interface AllocationData {
    lido: bigint;
    aave: bigint;
    uniswap: bigint;
    compound: bigint;
    curve: bigint;
    reserve: bigint;
}

class ContractService {
    private publicClient;
    private walletClient;
    private account;
    private isInitialized = false;

    constructor() {
        // Initialize public client (for reading)
        this.publicClient = createPublicClient({
            chain: sepolia,
            transport: http(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`)
        });

        // Initialize wallet client if private key is available and valid
        const privateKey = process.env.PRIVATE_KEY;
        if (privateKey && privateKey.length > 10 && privateKey !== 'your_private_key_here') {
            try {
                // Ensure private key has 0x prefix
                const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
                this.account = privateKeyToAccount(formattedKey as `0x${string}`);
                this.walletClient = createWalletClient({
                    account: this.account,
                    chain: sepolia,
                    transport: http(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`)
                });
                this.isInitialized = true;
                console.log('✅ Contract service initialized with wallet support');
            } catch (error) {
                console.warn('⚠️ Invalid private key format. Write operations will be disabled.');
                console.warn('Error:', error instanceof Error ? error.message : 'Unknown error');
            }
        } else {
            console.warn('⚠️ Private key not found or invalid. Write operations will be disabled.');
        }
    }

    async getAgentData(agentId: number): Promise<AgentData | null> {
        try {
            // This would use the actual ABI - for now using placeholder
            const data = await this.publicClient.readContract({
                address: CONTRACT_ADDRESSES.AI_VAULT as `0x${string}`,
                abi: [], // Would load actual ABI
                functionName: 'getAgent',
                args: [BigInt(agentId)]
            }) as any;

            return data;
        } catch (error) {
            console.error('Failed to get agent data:', error);
            return null;
        }
    }

    async getAllocationData(agentId: number): Promise<AllocationData | null> {
        try {
            const allocations = await this.publicClient.readContract({
                address: CONTRACT_ADDRESSES.AI_VAULT as `0x${string}`,
                abi: [], // Would load actual ABI
                functionName: 'allocations',
                args: [BigInt(agentId)]
            }) as any;

            return {
                lido: allocations[0],
                aave: allocations[1],
                uniswap: allocations[2],
                compound: allocations[3],
                curve: allocations[4],
                reserve: allocations[5]
            };
        } catch (error) {
            console.error('Failed to get allocation data:', error);
            return null;
        }
    }

    async executeRebalance(agentId: number, newAllocations: number[]): Promise<string | null> {
        if (!this.isInitialized || !this.walletClient) {
            console.error('Wallet not initialized for transactions');
            return null;
        }

        try {
            const hash = await this.walletClient.writeContract({
                address: CONTRACT_ADDRESSES.AI_VAULT as `0x${string}`,
                abi: [], // Would load actual ABI
                functionName: 'rebalanceAgent',
                args: [BigInt(agentId), newAllocations.map(a => BigInt(a))]
            });

            console.log(`✅ Rebalance transaction submitted: ${hash}`);
            return hash;
        } catch (error) {
            console.error('Failed to execute rebalance:', error);
            return null;
        }
    }

    async getPortfolioValue(agentId: number): Promise<number> {
        try {
            const agentData = await this.getAgentData(agentId);
            if (!agentData) return 0;

            return parseFloat(formatEther(agentData.currentValue));
        } catch (error) {
            console.error('Failed to get portfolio value:', error);
            return 0;
        }
    }

    async getGasPrice(): Promise<bigint> {
        try {
            return await this.publicClient.getGasPrice();
        } catch (error) {
            console.error('Failed to get gas price:', error);
            return parseEther('0.00002'); // Fallback gas price
        }
    }

    async getAllAgents(): Promise<AgentData[]> {
        try {
            // This would need to be implemented based on the contract's agent enumeration
            // For now, return empty array as placeholder
            return [];
        } catch (error) {
            console.error('Failed to get all agents:', error);
            return [];
        }
    }

    async getBalance(address: string): Promise<string> {
        try {
            const balance = await this.publicClient.getBalance({
                address: address as `0x${string}`
            });
            return formatEther(balance);
        } catch (error) {
            console.error('Failed to get balance:', error);
            return '0';
        }
    }

    getServiceStatus() {
        return {
            publicClientReady: !!this.publicClient,
            walletClientReady: !!this.walletClient,
            canExecuteTransactions: this.isInitialized,
            contracts: CONTRACT_ADDRESSES
        };
    }
}

export const contractService = new ContractService();
export default contractService;
