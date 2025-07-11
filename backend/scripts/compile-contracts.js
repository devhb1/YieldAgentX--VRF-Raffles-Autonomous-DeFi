const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🔨 Compiling contracts...");

    // Clean previous artifacts
    await hre.run("clean");

    // Compile contracts
    await hre.run("compile");

    console.log("✅ Contracts compiled successfully!");

    // Copy ABIs to frontend
    const abiSourceDir = path.join(__dirname, '../artifacts/contracts');
    const frontendAbiDir = path.join(__dirname, '../../frontend/src/abis');

    // Ensure frontend abis directory exists
    if (!fs.existsSync(frontendAbiDir)) {
        fs.mkdirSync(frontendAbiDir, { recursive: true });
    }

    // Copy AIVaultWithAutomation ABI
    const vaultArtifact = path.join(abiSourceDir, 'AIVaultWithAutomation.sol/AIVaultWithAutomation.json');
    const vaultAbi = path.join(frontendAbiDir, 'AIVaultWithAutomation.json');

    if (fs.existsSync(vaultArtifact)) {
        fs.copyFileSync(vaultArtifact, vaultAbi);
        console.log("📋 Copied AIVaultWithAutomation ABI to frontend");
    }

    // Copy VRF25Raffle ABI
    const raffleArtifact = path.join(abiSourceDir, 'VRF25Raffle.sol/VRF25Raffle.json');
    const raffleAbi = path.join(frontendAbiDir, 'VRF25Raffle.json');

    if (fs.existsSync(raffleArtifact)) {
        fs.copyFileSync(raffleArtifact, raffleAbi);
        console.log("📋 Copied VRF25Raffle ABI to frontend");
    }

    console.log("🎉 All ABIs copied to frontend successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
