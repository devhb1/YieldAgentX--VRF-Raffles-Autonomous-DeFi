// Auto-generated ABI file
// Contract: VRF25RaffleEnhanced
// Address: 0xFeaf076B52D462c346F329Dd32d2248B7b520EeA
// Network: Sepolia

export const VRF25_RAFFLE_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_devWallet",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "InsufficientPayment",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "InvalidRoundId",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "NoParticipants",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "NotEnoughDevFees",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "NotEnoughParticipants",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "OnlyVRFCoordinator",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "OnlyWinnerCanClaim",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "PrizeAlreadyClaimed",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "RaffleExpired",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "RaffleNotOpen",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "RaffleStillActive",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "WithdrawalFailed",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "devWallet",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "DevFeesWithdrawn",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "roundId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "winner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "PrizeClaimed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "roundId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "startTime",
                "type": "uint256"
            }
        ],
        "name": "RaffleStarted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "roundId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256"
            }
        ],
        "name": "RandomnessRequested",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "roundId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "participant",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "ticketCount",
                "type": "uint256"
            }
        ],
        "name": "TicketPurchased",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "roundId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "winner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "prizeAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "randomValue",
                "type": "uint256"
            }
        ],
        "name": "WinnerSelected",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "DEV_PERCENTAGE",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MIN_UNIQUE_PARTICIPANTS",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "PRIZE_PERCENTAGE",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "RAFFLE_DURATION",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "TICKET_PRICE",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "ticketCount",
                "type": "uint256"
            }
        ],
        "name": "buyTickets",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "roundId",
                "type": "uint256"
            }
        ],
        "name": "claimPrize",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "currentRoundId",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "devWallet",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "drawWinner",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "emergencyWithdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getBalanceInfo",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "contractBalance",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "devFeesAvailable",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getContractStats",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "totalRounds",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalCompleted",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "currentRound",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalDevFeesAccumulated",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "contractBalance",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCurrentRaffle",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "roundId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "startTime",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "endTime",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "participantCount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "uniqueParticipantCount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "prizePool",
                "type": "uint256"
            },
            {
                "internalType": "enum VRF25RaffleEnhanced.RaffleState",
                "name": "state",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "winner",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "canDraw",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "limit",
                "type": "uint256"
            }
        ],
        "name": "getRaffleHistory",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "roundId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "startTime",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "endTime",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "participantCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "uniqueParticipantCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "prizePool",
                        "type": "uint256"
                    },
                    {
                        "internalType": "enum VRF25RaffleEnhanced.RaffleState",
                        "name": "state",
                        "type": "uint8"
                    },
                    {
                        "internalType": "address",
                        "name": "winner",
                        "type": "address"
                    },
                    {
                        "internalType": "bool",
                        "name": "prizeClaimed",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "randomValue",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct VRF25RaffleEnhanced.RaffleInfo[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "roundId",
                "type": "uint256"
            }
        ],
        "name": "getRaffleRound",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "roundId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "startTime",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "endTime",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "participantCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "uniqueParticipantCount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "prizePool",
                        "type": "uint256"
                    },
                    {
                        "internalType": "enum VRF25RaffleEnhanced.RaffleState",
                        "name": "state",
                        "type": "uint8"
                    },
                    {
                        "internalType": "address",
                        "name": "winner",
                        "type": "address"
                    },
                    {
                        "internalType": "bool",
                        "name": "prizeClaimed",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "randomValue",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct VRF25RaffleEnhanced.RaffleInfo",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "roundId",
                "type": "uint256"
            }
        ],
        "name": "getRoundVRFData",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "randomValue",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "vrfRequestId",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "hasRandomness",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getUserTicketCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "count",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getUserWinnings",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "roundId",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "prizeAmount",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "claimed",
                        "type": "bool"
                    },
                    {
                        "internalType": "uint256",
                        "name": "timestamp",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "randomValue",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct VRF25RaffleEnhanced.UserWinning[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "isReadyToDraw",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "raffleRounds",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "roundId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "startTime",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "endTime",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "uniqueParticipants",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "prizePool",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "devFee",
                "type": "uint256"
            },
            {
                "internalType": "enum VRF25RaffleEnhanced.RaffleState",
                "name": "state",
                "type": "uint8"
            },
            {
                "internalType": "address",
                "name": "winner",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "vrfRequestId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "randomValue",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "prizeClaimed",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "requestId",
                "type": "uint256"
            },
            {
                "internalType": "uint256[]",
                "name": "randomWords",
                "type": "uint256[]"
            }
        ],
        "name": "rawFulfillRandomWords",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalDevFees",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalRoundsCompleted",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newDevWallet",
                "type": "address"
            }
        ],
        "name": "updateDevWallet",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawDevFees",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

// For backwards compatibility with AI Vault components
export const AI_VAULT_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_priceFeed",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "OnlySimulatedBackend",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "OwnableInvalidOwner",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
    },
    {
        "inputs": [],
        "name": "ReentrancyGuardReentrantCall",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "agentId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "enum AIVaultWithAutomation.Strategy",
                "name": "strategy",
                "type": "uint8"
            }
        ],
        "name": "AgentCreated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "agentId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "enum AIVaultWithAutomation.Protocol",
                "name": "protocol",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "AllocationExecuted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "agentId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "DepositMade",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "agentId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "WithdrawalMade",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "agentId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "yieldAmount",
                "type": "uint256"
            }
        ],
        "name": "YieldHarvested",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "agentId",
                "type": "uint256"
            }
        ],
        "name": "agents",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "enum AIVaultWithAutomation.Strategy",
                "name": "strategy",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "totalDeposited",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "currentValue",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalYield",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "lastRebalance",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "createdAt",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "isActive",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "checkData",
                "type": "bytes"
            }
        ],
        "name": "checkUpkeep",
        "outputs": [
            {
                "internalType": "bool",
                "name": "upkeepNeeded",
                "type": "bool"
            },
            {
                "internalType": "bytes",
                "name": "performData",
                "type": "bytes"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "enum AIVaultWithAutomation.Strategy",
                "name": "strategy",
                "type": "uint8"
            }
        ],
        "name": "createAgent",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "agentId",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "agentId",
                "type": "uint256"
            }
        ],
        "name": "depositToAgent",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "agentId",
                "type": "uint256"
            }
        ],
        "name": "emergencyPause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "agentId",
                "type": "uint256"
            }
        ],
        "name": "emergencyUnpause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "agentId",
                "type": "uint256"
            }
        ],
        "name": "getAgent",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "owner",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "enum AIVaultWithAutomation.Strategy",
                        "name": "strategy",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalDeposited",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "currentValue",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalYield",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "lastRebalance",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "createdAt",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "isActive",
                        "type": "bool"
                    }
                ],
                "internalType": "struct AIVaultWithAutomation.Agent",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "agentId",
                "type": "uint256"
            }
        ],
        "name": "getAgentInfo",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "owner",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "enum AIVaultWithAutomation.Strategy",
                        "name": "strategy",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalDeposited",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "currentValue",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalYield",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "lastRebalance",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "createdAt",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "isActive",
                        "type": "bool"
                    }
                ],
                "internalType": "struct AIVaultWithAutomation.Agent",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "agentId",
                "type": "uint256"
            }
        ],
        "name": "getAgentWithUSD",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "owner",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "enum AIVaultWithAutomation.Strategy",
                        "name": "strategy",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalDeposited",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "currentValue",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "totalYield",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "lastRebalance",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "createdAt",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bool",
                        "name": "isActive",
                        "type": "bool"
                    }
                ],
                "internalType": "struct AIVaultWithAutomation.Agent",
                "name": "",
                "type": "tuple"
            },
            {
                "internalType": "uint256",
                "name": "totalDepositedUSD",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "currentValueUSD",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalYieldUSD",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "agentId",
                "type": "uint256"
            }
        ],
        "name": "getAllocation",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "enum AIVaultWithAutomation.Protocol",
                        "name": "protocol",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct AIVaultWithAutomation.Allocation[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "agentId",
                "type": "uint256"
            }
        ],
        "name": "getAllocationWithUSD",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "enum AIVaultWithAutomation.Protocol",
                        "name": "protocol",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint256",
                        "name": "amount",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct AIVaultWithAutomation.Allocation[]",
                "name": "",
                "type": "tuple[]"
            },
            {
                "internalType": "uint256",
                "name": "totalValueUSD",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getContractStats",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "totalAgents",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalValueLocked",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalYieldGenerated",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalActiveAgents",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "ethAmount",
                "type": "uint256"
            }
        ],
        "name": "getETHPrice",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "enum AIVaultWithAutomation.Strategy",
                "name": "strategy",
                "type": "uint8"
            }
        ],
        "name": "getStrategyConfig",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "lidoStaking",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "aaveLending",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "uniswapLP",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "compoundLending",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "curvePools",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct AIVaultWithAutomation.StrategyConfig",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getUserAgents",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getUserStats",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "totalAgents",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalDeposited",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalCurrentValue",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalYield",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getUserTotalValue",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getUserTotalValueUSD",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "lastRebalanceTime",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "nextAgentId",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "performData",
                "type": "bytes"
            }
        ],
        "name": "performUpkeep",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "priceFeed",
        "outputs": [
            {
                "internalType": "contract AggregatorV3Interface",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalAgentsCreated",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalValueLocked",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalYieldGenerated",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "userAgents",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "agentId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "withdrawFromAgent",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;
