const { ethers } = require("hardhat");

async function main() {
    console.log("🎰 Deploying Enhanced VRF25Raffle Contract");
    console.log("========================================");

    const [deployer] = await ethers.getSigners();
    console.log("👤 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

    // Deploy VRF25RaffleEnhanced
    console.log("\n🔨 Deploying VRF25RaffleEnhanced...");

    const VRFRaffleFactory = await ethers.getContractFactory("VRF25RaffleEnhanced");
    const vrfRaffle = await VRFRaffleFactory.deploy(deployer.address); // Use deployer as dev wallet

    await vrfRaffle.waitForDeployment();
    const raffleAddress = await vrfRaffle.getAddress();

    console.log("✅ VRF25RaffleEnhanced deployed to:", raffleAddress);

    // Verify deployment
    console.log("\n🔍 Verifying deployment...");

    try {
        const currentRoundId = await vrfRaffle.currentRoundId();
        const ticketPrice = await vrfRaffle.TICKET_PRICE();
        const isReady = await vrfRaffle.isReadyToDraw();

        console.log("✅ Current Round ID:", currentRoundId.toString());
        console.log("✅ Ticket Price:", ethers.formatEther(ticketPrice), "ETH");
        console.log("✅ Ready to Draw:", isReady);

        // Test getCurrentRaffle function
        const currentRaffle = await vrfRaffle.getCurrentRaffle();
        console.log("✅ Current Raffle Data:");
        console.log("   - Round ID:", currentRaffle[0].toString());
        console.log("   - Start Time:", new Date(Number(currentRaffle[1]) * 1000).toISOString());
        console.log("   - End Time:", new Date(Number(currentRaffle[2]) * 1000).toISOString());
        console.log("   - Participants:", currentRaffle[3].toString());
        console.log("   - Prize Pool:", ethers.formatEther(currentRaffle[5]), "ETH");

    } catch (error) {
        console.error("❌ Verification failed:", error.message);
    }

    console.log("\n📋 Deployment Summary:");
    console.log("Contract: VRF25RaffleEnhanced");
    console.log("Address:", raffleAddress);
    console.log("Network: Sepolia");
    console.log("Dev Wallet:", deployer.address);

    console.log("\n📝 Next Steps:");
    console.log("1. Update frontend .env.local with new contract address");
    console.log("2. Copy ABI to frontend");
    console.log("3. Test contract functionality");

    return {
        raffleAddress,
        deployer: deployer.address
    };
}

main()
    .then((result) => {
        console.log("\n🎉 Deployment completed successfully!");
        console.log("Contract Address:", result.raffleAddress);
        process.exit(0);
    })
    .catch((error) => {
        console.error("💥 Deployment failed:", error);
        process.exit(1);
    });
