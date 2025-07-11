/**
 * Hardhat Configuration for YieldAgentX Contracts
 */
require('dotenv').config();
const { HardhatUserConfig } = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-ethers");
require("hardhat-deploy");

// Private key from .env file or default to a test mnemonic
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Default API keys if not provided
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const INFURA_API_KEY = process.env.INFURA_API_KEY || "";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        // Default to Hardhat Network for testing
        hardhat: {
            chainId: 31337,
            forking: process.env.FORK_URL ? {
                url: process.env.FORK_URL,
            } : undefined,
        },
        // Mainnet configuration
        mainnet: {
            url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
            accounts: [PRIVATE_KEY],
            chainId: 1,
        },
        // Sepolia testnet
        sepolia: {
            url: "https://ethereum-sepolia-rpc.publicnode.com",
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
        },
        // Avalanche Fuji testnet
        fuji: {
            url: "https://api.avax-test.network/ext/bc/C/rpc",
            accounts: [PRIVATE_KEY],
            chainId: 43113,
        },
        // Polygon mainnet
        polygon: {
            url: `https://polygon-mainnet.infura.io/v3/${INFURA_API_KEY}`,
            accounts: [PRIVATE_KEY],
            chainId: 137,
        },
        // Arbitrum mainnet
        arbitrum: {
            url: `https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}`,
            accounts: [PRIVATE_KEY],
            chainId: 42161,
        },
    },
    // For contract verification
    etherscan: {
        apiKey: ETHERSCAN_API_KEY
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },
    // Prevent gas estimation errors during testing
    mocha: {
        timeout: 100000
    }
};

module.exports = config;
