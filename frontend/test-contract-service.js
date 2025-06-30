// Test script to verify the enhanced contract service is working
import { contractService } from './src/lib/enhancedContractService';

async function testContractService() {
  try {
    console.log('🧪 Testing Enhanced Contract Service...');
    
    // Test 1: Get raffle status
    console.log('\n📊 Testing getRaffleStatus...');
    const status = await contractService.getRaffleStatus();
    console.log('Raffle Status:', {
      id: status.id.toString(),
      roundId: status.roundId.toString(),
      isActive: status.isActive,
      isDrawn: status.isDrawn,
      prizePool: status.prizePool.toString(),
      participantCount: status.participantCount.toString(),
      state: status.state.toString()
    });
    
    // Test 2: Get previous raffles
    console.log('\n📜 Testing getPreviousRaffleRounds...');
    const previousRaffles = await contractService.getPreviousRaffleRounds(3);
    console.log('Previous Raffles Count:', previousRaffles.length);
    previousRaffles.forEach((raffle, index) => {
      console.log(`Round ${index + 1}:`, {
        id: raffle.id.toString(),
        winner: raffle.winner,
        prizePool: raffle.prizePool.toString(),
        randomness: raffle.randomness.toString(),
        vrfRequestId: raffle.vrfRequestId?.toString(),
        vrfTxHash: raffle.vrfTxHash
      });
    });
    
    // Test 3: Get unique participants
    console.log('\n👥 Testing getUniqueParticipants...');
    const participants = await contractService.getUniqueParticipants();
    console.log('Unique Participants:', participants.length);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testContractService();
