import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useAccount, useChainId, usePublicClient } from 'wagmi';
import { getContractAddresses } from '../contracts/addresses';

// Import ABIs
import AdvancedAIPortfolioVaultABI from '../contracts/AdvancedAIPortfolioVault.json';
import VRF25RaffleABI from '../contracts/VRF25Raffle.json';

export function useContracts() {
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  
  const [contracts, setContracts] = useState<{
    vault: ethers.Contract | null;
    raffle: ethers.Contract | null;
    provider: ethers.Provider | null;
    signer: ethers.Signer | null;
  }>({
    vault: null,
    raffle: null,
    provider: null,
    signer: null
  });

  useEffect(() => {
    if (!publicClient || !address) {
      setContracts({ vault: null, raffle: null, provider: null, signer: null });
      return;
    }

    const setupContracts = async () => {
      try {
        // Get contract addresses for current chain
        const addresses = getContractAddresses(chainId);
        if (!addresses) {
          console.warn(`Unsupported chain: ${chainId}`);
          return;
        }

        // Create provider and signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Create contract instances
        const vault = addresses.vault !== '0x0000000000000000000000000000000000000000'
          ? new ethers.Contract(addresses.vault, AdvancedAIPortfolioVaultABI.abi, signer)
          : null;

        const raffle = addresses.raffle !== '0x0000000000000000000000000000000000000000'
          ? new ethers.Contract(addresses.raffle, VRF25RaffleABI.abi, signer)
          : null;

        setContracts({ vault, raffle, provider, signer });
      } catch (error) {
        console.error('Error setting up contracts:', error);
        setContracts({ vault: null, raffle: null, provider: null, signer: null });
      }
    };

    setupContracts();
  }, [publicClient, address, chainId]);

  return contracts;
}

// Hook for vault contract specifically
export function useVaultContract() {
  const { vault } = useContracts();
  return vault;
}

// Hook for raffle contract specifically
export function useRaffleContract() {
  const { raffle } = useContracts();
  return raffle;
}
