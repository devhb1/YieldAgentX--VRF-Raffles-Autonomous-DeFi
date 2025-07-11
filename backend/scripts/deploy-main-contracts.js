const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 YieldAgentX - Complete Contract Deployment");
    console.log("==============================================");

    const [deployer] = await ethers.getSigners();
    console.log("👤 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

    // Network configuration
    const network = await ethers.provider.getNetwork();
    console.log("🌐 Network:", network.name, "| Chain ID:", network.chainId);

    // Chainlink configurations for different networks
    const chainlinkConfig = {
        // Local Hardhat Network (for testing)
        "31337": {
            vrfCoordinator: "0x0000000000000000000000000000000000000000", // Mock address
            keyHash: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
            subscriptionId: "0",
            ethUsdPriceFeed: "0x0000000000000000000000000000000000000000" // Mock address
        },
        // Ethereum Sepolia
        "11155111": {
            vrfCoordinator: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
            keyHash: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
            subscriptionId: "0", // Will be set after VRF subscription creation
            ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
        },
        // Avalanche Fuji
        "43113": {
            vrfCoordinator: "0x2eD832Ba664535e5886b75D64C46EB9a228C2610",
            keyHash: "0x354d2f95da55398f44b7cff77da56283d9c6c829a4bdf1bbcaf2ad6a4d081f61",
            subscriptionId: "0", // Will be set after VRF subscription creation
            ethUsdPriceFeed: "0x86d67c3D38D2bCeE722E601025C25a575021c6EA" // AVAX/USD on Fuji
        }
    };

    const config = chainlinkConfig[network.chainId.toString()];
    if (!config) {
        throw new Error(`❌ Network ${network.name} (${network.chainId}) not supported`);
    }

    console.log("🔗 Chainlink Configuration:");
    console.log("   - VRF Coordinator:", config.vrfCoordinator);
    console.log("   - Key Hash:", config.keyHash);
    console.log("   - Price Feed:", config.ethUsdPriceFeed);

    const deploymentResults = {};

    // ============= DEPLOY VRF25RAFFLE ENHANCED =============
    console.log("\n🎰 Deploying VRF25RaffleEnhanced...");
    console.log("=====================================");

    try {
        const VRFRaffleFactory = await ethers.getContractFactory("VRF25RaffleEnhanced");
        const vrfRaffle = await VRFRaffleFactory.deploy(deployer.address);

        await vrfRaffle.waitForDeployment();
        const raffleAddress = await vrfRaffle.getAddress();

        console.log("✅ VRF25RaffleEnhanced deployed to:", raffleAddress);

        // Verify VRF deployment
        const currentRoundId = await vrfRaffle.currentRoundId();
        const ticketPrice = await vrfRaffle.TICKET_PRICE();
        const isReady = await vrfRaffle.isReadyToDraw();

        console.log("✅ VRF Contract Verification:");
        console.log("   - Current Round ID:", currentRoundId.toString());
        console.log("   - Ticket Price:", ethers.formatEther(ticketPrice), "ETH");
        console.log("   - Ready to Draw:", isReady);

        // Test getCurrentRaffle function
        const currentRaffle = await vrfRaffle.getCurrentRaffle();
        console.log("✅ Current Raffle Data:");
        console.log("   - Round ID:", currentRaffle[0].toString());
        console.log("   - Start Time:", new Date(Number(currentRaffle[1]) * 1000).toISOString());
        console.log("   - End Time:", new Date(Number(currentRaffle[2]) * 1000).toISOString());
        console.log("   - Participants:", currentRaffle[3].toString());
        console.log("   - Prize Pool:", ethers.formatEther(currentRaffle[5]), "ETH");

        deploymentResults.vrfRaffle = {
            address: raffleAddress,
            contract: vrfRaffle,
            verified: true
        };

    } catch (error) {
        console.error("❌ VRF Raffle deployment failed:", error.message);
        deploymentResults.vrfRaffle = {
            address: null,
            contract: null,
            verified: false,
            error: error.message
        };
    }

    // ============= DEPLOY AI VAULT WITH AUTOMATION =============
    console.log("\n🤖 Deploying AIVaultWithAutomation...");
    console.log("====================================");

    try {
        const AIVaultFactory = await ethers.getContractFactory("AIVaultWithAutomation");
        const aiVault = await AIVaultFactory.deploy(config.ethUsdPriceFeed);

        await aiVault.waitForDeployment();
        const vaultAddress = await aiVault.getAddress();

        console.log("✅ AIVaultWithAutomation deployed to:", vaultAddress);

        // Verify AI Vault deployment
        const totalAgents = await aiVault.totalAgents();
        const totalValueLocked = await aiVault.totalValueLocked();
        const owner = await aiVault.owner();

        console.log("✅ AI Vault Contract Verification:");
        console.log("   - Total Agents:", totalAgents.toString());
        console.log("   - Total Value Locked:", ethers.formatEther(totalValueLocked), "ETH");
        console.log("   - Owner:", owner);

        // Test price feed integration
        try {
            const latestPrice = await aiVault.getLatestPrice();
            console.log("   - Latest ETH Price:", ethers.formatUnits(latestPrice, 8), "USD");
        } catch (priceError) {
            console.log("   - Price Feed Test:", "⚠️ Price feed not accessible (expected on testnet)");
        }

        deploymentResults.aiVault = {
            address: vaultAddress,
            contract: aiVault,
            verified: true
        };

    } catch (error) {
        console.error("❌ AI Vault deployment failed:", error.message);
        deploymentResults.aiVault = {
            address: null,
            contract: null,
            verified: false,
            error: error.message
        };
    }

    // ============= DEPLOYMENT SUMMARY =============
    console.log("\n📋 Complete Deployment Summary");
    console.log("==============================");
    console.log("Network:", network.name, "| Chain ID:", network.chainId);
    console.log("Deployer:", deployer.address);
    console.log("Gas Used: ~", "TBD"); // Could calculate total gas used

    console.log("\n🎰 VRF25RaffleEnhanced:");
    if (deploymentResults.vrfRaffle.verified) {
        console.log("   ✅ Address:", deploymentResults.vrfRaffle.address);
        console.log("   ✅ Status: Deployed & Verified");
    } else {
        console.log("   ❌ Status: Failed -", deploymentResults.vrfRaffle.error);
    }

    console.log("\n🤖 AIVaultWithAutomation:");
    if (deploymentResults.aiVault.verified) {
        console.log("   ✅ Address:", deploymentResults.aiVault.address);
        console.log("   ✅ Status: Deployed & Verified");
    } else {
        console.log("   ❌ Status: Failed -", deploymentResults.aiVault.error);
    }

    // ============= CONFIGURATION INSTRUCTIONS =============
    console.log("\n📝 Post-Deployment Configuration");
    console.log("================================");

    if (deploymentResults.vrfRaffle.verified) {
        console.log("🎰 VRF Raffle Setup:");
        console.log("   1. Create VRF Subscription at https://vrf.chain.link/");
        console.log("   2. Fund subscription with LINK tokens");
        console.log("   3. Add consumer:", deploymentResults.vrfRaffle.address);
        console.log("   4. Call setVRFConfig() with subscription ID");
    }

    if (deploymentResults.aiVault.verified) {
        console.log("\n🤖 AI Vault Setup:");
        console.log("   1. Register for Chainlink Automation at https://automation.chain.link/");
        console.log("   2. Create upkeep for:", deploymentResults.aiVault.address);
        console.log("   3. Fund upkeep with LINK tokens");
        console.log("   4. Test automation with checkUpkeep()");
    }

    console.log("\n🌐 Frontend Configuration:");
    console.log("   1. Update frontend/.env.local:");
    if (deploymentResults.vrfRaffle.verified) {
        console.log("      NEXT_PUBLIC_VRF_RAFFLE_CONTRACT=" + deploymentResults.vrfRaffle.address);
    }
    if (deploymentResults.aiVault.verified) {
        console.log("      NEXT_PUBLIC_AI_VAULT_CONTRACT=" + deploymentResults.aiVault.address);
    }
    console.log("   2. Copy ABIs to frontend/src/abis/");
    console.log("   3. Update contract addresses in frontend/src/config/contracts.ts");

    // ============= VERIFICATION COMMANDS =============
    console.log("\n🔍 Etherscan Verification Commands");
    console.log("==================================");

    if (deploymentResults.vrfRaffle.verified) {
        console.log("npx hardhat verify --network", network.name.toLowerCase(), deploymentResults.vrfRaffle.address, deployer.address);
    }

    if (deploymentResults.aiVault.verified) {
        console.log("npx hardhat verify --network", network.name.toLowerCase(), deploymentResults.aiVault.address, config.ethUsdPriceFeed);
    }

    // ============= SAVE DEPLOYMENT INFO =============
    const deploymentInfo = {
        network: network.name,
        chainId: network.chainId.toString(),
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            vrfRaffle: deploymentResults.vrfRaffle.verified ? {
                address: deploymentResults.vrfRaffle.address,
                constructorArgs: [deployer.address]
            } : null,
            aiVault: deploymentResults.aiVault.verified ? {
                address: deploymentResults.aiVault.address,
                constructorArgs: [config.ethUsdPriceFeed]
            } : null
        },
        chainlinkConfig: config
    };

    // Save deployment info to file
    const fs = require('fs');
    const deploymentFile = `deployment-${network.name.toLowerCase()}-${Date.now()}.json`;
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to:", deploymentFile);

    return deploymentResults;
}

// Execute deployment
main()
    .then((results) => {
        console.log("\n🎉 YieldAgentX Deployment Complete!");
        console.log("===================================");

        let successCount = 0;
        let totalContracts = 0;

        for (const [name, result] of Object.entries(results)) {
            totalContracts++;
            if (result.verified) {
                successCount++;
                console.log(`✅ ${name}: ${result.address}`);
            } else {
                console.log(`❌ ${name}: Failed`);
            }
        }

        console.log(`\n📊 Success Rate: ${successCount}/${totalContracts} contracts deployed`);

        if (successCount === totalContracts) {
            console.log("🏆 All contracts deployed successfully!");
            process.exit(0);
        } else {
            console.log("⚠️ Some contracts failed to deploy. Check logs above.");
            process.exit(1);
        }
    })
    .catch((error) => {
        console.error("\n💥 Deployment failed:", error);
        console.error("Stack trace:", error.stack);
        process.exit(1);
    });
