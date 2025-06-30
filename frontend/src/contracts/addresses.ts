// Contract Addresses for Multi-Chain Deployment
// Auto-generated from backend deployment artifacts

export interface ContractAddresses {
  vault: string;
  raffle: string;
  chainId: number;
  networkName: string;
}

export const CONTRACT_ADDRESSES: Record<string, ContractAddresses> = {
  // Ethereum Sepolia Testnet
  '11155111': {
    vault: '0x842eB9C7ce0a386f1b2FbD356FB6de47B85072cD', // Enhanced AI Portfolio Vault (Latest)
    raffle: '0x83F2D33Fa7D190170105d0fF07e04Dee808765cC', // VRF v2.5 Raffle (Latest Production Ready)
    chainId: 11155111,
    networkName: 'Sepolia'
  },

  // Avalanche Fuji Testnet
  '43113': {
    vault: '0x0000000000000000000000000000000000000000', // To be deployed
    raffle: '0x0000000000000000000000000000000000000000', // To be deployed
    chainId: 43113,
    networkName: 'Avalanche Fuji'
  },

  // Polygon Mumbai Testnet
  '80001': {
    vault: '0x0000000000000000000000000000000000000000', // To be deployed
    raffle: '0x0000000000000000000000000000000000000000', // To be deployed
    chainId: 80001,
    networkName: 'Polygon Mumbai'
  }
};

// Get contract addresses for current chain
export function getContractAddresses(chainId: number): ContractAddresses | null {
  return CONTRACT_ADDRESSES[chainId.toString()] || null;
}

// Supported chain IDs
export const SUPPORTED_CHAINS = [11155111, 43113, 80001];

// Chain names mapping
export const CHAIN_NAMES: Record<number, string> = {
  11155111: 'Ethereum Sepolia',
  43113: 'Avalanche Fuji',
  80001: 'Polygon Mumbai'
};
