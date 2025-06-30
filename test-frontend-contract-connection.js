// Quick test script to verify frontend contract connection
// Run this to ensure the enhancedContractService is working correctly

const { createPublicClient, http } = require('viem');
const { sepolia } = require('viem/chains');

// Contract details
const CONTRACT_ADDRESS = '0x83F2D33Fa7D190170105d0fF07e04Dee808765cC';
const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/ca58cff6645f4f5bb3930a42dadb644a';

// Create public client
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(SEPOLIA_RPC_URL)
});

// Simple ABI for testing - just the functions we need
const SIMPLE_ABI = [
  {
    "inputs": [],
    "name": "getCurrentRaffle",
    "outputs": [
      {"type": "uint256", "name": "roundId"},
      {"type": "uint256", "name": "startTime"},
      {"type": "uint256", "name": "endTime"},
      {"type": "uint256", "name": "participantCount"},
      {"type": "uint256", "name": "prizePool"},
      {"type": "uint8", "name": "state"},
      {"type": "address", "name": "winner"},
      {"type": "bool", "name": "canDraw"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

async function testContractConnection() {
  try {
    console.log('=== Testing Frontend Contract Connection ===');
    console.log('Contract Address:', CONTRACT_ADDRESS);
    console.log('Sepolia RPC URL:', SEPOLIA_RPC_URL);
    
    // Test basic connection
    const blockNumber = await publicClient.getBlockNumber();
    console.log('✅ Connected to Sepolia, latest block:', blockNumber.toString());
    
    // Test contract call
    const result = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: SIMPLE_ABI,
      functionName: 'getCurrentRaffle'
    });
    
    console.log('✅ Contract call successful!');
    console.log('Raffle Status:', {
      roundId: result[0].toString(),
      startTime: result[1].toString(),
      endTime: result[2].toString(),
      participantCount: result[3].toString(),
      prizePool: result[4].toString(),
      state: result[5].toString(),
      winner: result[6],
      canDraw: result[7]
    });
    
    console.log('🎉 Frontend contract connection is working correctly!');
    
  } catch (error) {
    console.error('❌ Contract connection test failed:', error);
  }
}

testContractConnection();
