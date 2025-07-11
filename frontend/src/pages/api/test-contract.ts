import { NextApiRequest, NextApiResponse } from 'next'

const { ethers } = require('ethers')

const VRF25_RAFFLE_ABI = [
    {
        "inputs": [],
        "name": "getCurrentRaffle",
        "outputs": [
            { "internalType": "uint256", "name": "roundId", "type": "uint256" },
            { "internalType": "uint256", "name": "startTime", "type": "uint256" },
            { "internalType": "uint256", "name": "endTime", "type": "uint256" },
            { "internalType": "uint256", "name": "participantCount", "type": "uint256" },
            { "internalType": "uint256", "name": "uniqueParticipantCount", "type": "uint256" },
            { "internalType": "uint256", "name": "prizePool", "type": "uint256" },
            { "internalType": "enum VRF25RaffleEnhanced.RaffleState", "name": "state", "type": "uint8" },
            { "internalType": "address", "name": "winner", "type": "address" },
            { "internalType": "bool", "name": "canDraw", "type": "bool" }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com')
        const contractAddress = '0xFeaf076B52D462c346F329Dd32d2248B7b520EeA'

        const contract = new ethers.Contract(contractAddress, VRF25_RAFFLE_ABI, provider)

        const result = await contract.getCurrentRaffle()

        const raffleData = {
            roundId: result[0].toString(),
            startTime: result[1].toString(),
            endTime: result[2].toString(),
            participantCount: result[3].toString(),
            uniqueParticipantCount: result[4].toString(),
            prizePool: ethers.formatEther(result[5]),
            state: result[6].toString(),
            winner: result[7],
            canDraw: result[8]
        }

        res.status(200).json({
            success: true,
            data: raffleData
        })

    } catch (error: any) {
        console.error('API Error:', error)
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
}
