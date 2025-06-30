// Diagnostic test for contract service
console.log('🔍 Starting Contract Service Diagnostics...');

// Test if the contract service can be imported
try {
  const { contractService } = require('./src/lib/enhancedContractService');
  console.log('✅ Contract service imported successfully');
  
  // Test basic contract reading
  contractService.getRaffleStatus()
    .then(status => {
      console.log('✅ Contract connection successful');
      console.log('Current raffle status:', {
        id: status.id.toString(),
        isActive: status.isActive,
        prizePool: status.prizePool.toString()
      });
    })
    .catch(error => {
      console.error('❌ Contract read failed:', error.message);
    });
    
} catch (error) {
  console.error('❌ Failed to import contract service:', error.message);
}
