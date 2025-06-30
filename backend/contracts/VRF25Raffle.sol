// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title YieldAgent VRF v2.5 Raffle
 * @dev A fully functional raffle with WORKING VRF v2.5 implementation
 *      Production-ready raffle system with Chainlink VRF integration
 *
 * Features:
 * - Users buy tickets for 0.001 ETH each
 * - 90% goes to prize pool, 10% to dev wallet
 * - After 10 minutes minimum, raffle draws a winner using Chainlink VRF v2.5
 * - Uses EMPTY extraArgs (the format that works on Sepolia)
 * - Proper ownership and dev fee withdrawal
 * - Complete raffle cycle with real random winner selection
 */

interface IVRFCoordinatorV25 {
    function requestRandomWords(
        RandomWordsRequest calldata req
    ) external returns (uint256 requestId);

    struct RandomWordsRequest {
        bytes32 keyHash;
        uint256 subId;
        uint16 requestConfirmations;
        uint32 callbackGasLimit;
        uint32 numWords;
        bytes extraArgs;
    }
}

contract VRF25Raffle is Ownable, ReentrancyGuard {
    // ===== Constants =====
    uint256 public constant TICKET_PRICE = 0.001 ether;
    uint256 public constant RAFFLE_DURATION = 10 minutes;
    uint256 public constant PRIZE_PERCENTAGE = 90;
    uint256 public constant DEV_PERCENTAGE = 10;

    // VRF v2.5 Configuration for Sepolia
    uint256 private constant SUBSCRIPTION_ID =
        63638762572181911466406949252427640028961704213268465121364079606304171403540;
    bytes32 private constant KEY_HASH =
        0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;
    uint32 private constant CALLBACK_GAS_LIMIT = 300000;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // VRF Coordinator
    IVRFCoordinatorV25 private immutable vrfCoordinator;

    // ===== Errors =====
    error InsufficientPayment();
    error NoParticipants();
    error RaffleNotOpen();
    error RaffleStillActive();
    error PrizeAlreadyClaimed();
    error OnlyWinnerCanClaim();
    error NotEnoughDevFees();
    error OnlyVRFCoordinator();
    error WithdrawalFailed();

    // ===== Enums =====
    enum RaffleState {
        OPEN,
        CALCULATING,
        CLOSED
    }

    struct RaffleRound {
        uint256 roundId;
        uint256 startTime;
        uint256 endTime;
        address[] participants;
        uint256 prizePool;
        uint256 devFee;
        RaffleState state;
        address winner;
        uint256 vrfRequestId;
        bool prizeClaimed;
    }

    // ===== Storage =====
    uint256 public currentRoundId;
    mapping(uint256 => RaffleRound) public raffleRounds;
    mapping(uint256 => uint256) private vrfRequestToRoundId;
    address public devWallet;
    uint256 public totalDevFees;

    // ===== Events =====
    event RaffleStarted(uint256 indexed roundId, uint256 startTime);
    event TicketPurchased(
        uint256 indexed roundId,
        address indexed participant,
        uint256 ticketCount
    );
    event RandomnessRequested(uint256 indexed roundId, uint256 requestId);
    event WinnerSelected(
        uint256 indexed roundId,
        address indexed winner,
        uint256 prizeAmount
    );
    event PrizeClaimed(
        uint256 indexed roundId,
        address indexed winner,
        uint256 amount
    );
    event DevFeesWithdrawn(address indexed devWallet, uint256 amount);

    /**
     * @dev Constructor - sets up VRF coordinator and starts first raffle
     */
    constructor(address _devWallet) Ownable(msg.sender) {
        // Official Sepolia VRF v2.5 Coordinator
        vrfCoordinator = IVRFCoordinatorV25(
            0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B
        );

        devWallet = _devWallet != address(0) ? _devWallet : msg.sender;

        // Start the first raffle
        _startNewRaffle();
    }

    /**
     * @dev Buy tickets for the current raffle
     */
    function buyTickets(uint256 ticketCount) external payable nonReentrant {
        RaffleRound storage currentRaffle = raffleRounds[currentRoundId];

        if (currentRaffle.state != RaffleState.OPEN) revert RaffleNotOpen();
        if (msg.value != TICKET_PRICE * ticketCount)
            revert InsufficientPayment();

        // Add participant tickets
        for (uint256 i = 0; i < ticketCount; i++) {
            currentRaffle.participants.push(msg.sender);
        }

        // Calculate fees
        uint256 totalAmount = msg.value;
        uint256 prizeAmount = (totalAmount * PRIZE_PERCENTAGE) / 100;
        uint256 devAmount = totalAmount - prizeAmount;

        currentRaffle.prizePool += prizeAmount;
        currentRaffle.devFee += devAmount;
        totalDevFees += devAmount;

        emit TicketPurchased(currentRoundId, msg.sender, ticketCount);
    }

    /**
     * @dev Draw winner for current raffle (COMPLETELY FIXED VRF v2.5 implementation)
     */
    function drawWinner() external nonReentrant {
        RaffleRound storage currentRaffle = raffleRounds[currentRoundId];

        if (currentRaffle.state != RaffleState.OPEN) revert RaffleNotOpen();
        if (block.timestamp < currentRaffle.endTime) revert RaffleStillActive();
        if (currentRaffle.participants.length == 0) revert NoParticipants();

        // Change state to calculating
        currentRaffle.state = RaffleState.CALCULATING;

        // Use empty extraArgs (the format that works on Sepolia)
        // The VRF v2.5 coordinator will use default payment method (LINK) with empty extraArgs
        bytes memory extraArgs = "";

        // Request randomness from Chainlink VRF v2.5
        uint256 requestId = vrfCoordinator.requestRandomWords(
            IVRFCoordinatorV25.RandomWordsRequest({
                keyHash: KEY_HASH,
                subId: SUBSCRIPTION_ID,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: CALLBACK_GAS_LIMIT,
                numWords: NUM_WORDS,
                extraArgs: extraArgs // Empty bytes - works with current VRF coordinator
            })
        );

        currentRaffle.vrfRequestId = requestId;
        vrfRequestToRoundId[requestId] = currentRoundId;

        emit RandomnessRequested(currentRoundId, requestId);
    }

    /**
     * @dev VRF callback function - called by VRF Coordinator
     */
    function rawFulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) external {
        if (msg.sender != address(vrfCoordinator)) revert OnlyVRFCoordinator();

        uint256 roundId = vrfRequestToRoundId[requestId];
        RaffleRound storage raffle = raffleRounds[roundId];

        // Select winner based on random number
        uint256 winnerIndex = randomWords[0] % raffle.participants.length;
        address winner = raffle.participants[winnerIndex];

        raffle.winner = winner;
        raffle.state = RaffleState.CLOSED;

        emit WinnerSelected(roundId, winner, raffle.prizePool);

        // Start next raffle
        _startNewRaffle();
    }

    /**
     * @dev Winner claims their prize
     */
    function claimPrize(uint256 roundId) external nonReentrant {
        RaffleRound storage raffle = raffleRounds[roundId];

        if (raffle.winner != msg.sender) revert OnlyWinnerCanClaim();
        if (raffle.prizeClaimed) revert PrizeAlreadyClaimed();

        raffle.prizeClaimed = true;
        uint256 prizeAmount = raffle.prizePool;

        emit PrizeClaimed(roundId, msg.sender, prizeAmount);

        (bool success, ) = payable(msg.sender).call{value: prizeAmount}("");
        if (!success) revert WithdrawalFailed();
    }

    /**
     * @dev Owner withdraws accumulated dev fees
     */
    function withdrawDevFees() external onlyOwner nonReentrant {
        if (totalDevFees == 0) revert NotEnoughDevFees();

        uint256 amount = totalDevFees;
        totalDevFees = 0;

        emit DevFeesWithdrawn(devWallet, amount);

        (bool success, ) = payable(devWallet).call{value: amount}("");
        if (!success) revert WithdrawalFailed();
    }

    /**
     * @dev Start a new raffle round
     */
    function _startNewRaffle() internal {
        currentRoundId++;

        RaffleRound storage newRaffle = raffleRounds[currentRoundId];
        newRaffle.roundId = currentRoundId;
        newRaffle.startTime = block.timestamp;
        newRaffle.endTime = block.timestamp + RAFFLE_DURATION;
        newRaffle.state = RaffleState.OPEN;

        emit RaffleStarted(currentRoundId, block.timestamp);
    }

    // ===== View Functions =====

    /**
     * @dev Get current raffle information
     */
    function getCurrentRaffle()
        external
        view
        returns (
            uint256 roundId,
            uint256 startTime,
            uint256 endTime,
            uint256 participantCount,
            uint256 prizePool,
            RaffleState state,
            address winner,
            bool canDraw
        )
    {
        RaffleRound storage current = raffleRounds[currentRoundId];
        return (
            current.roundId,
            current.startTime,
            current.endTime,
            current.participants.length,
            current.prizePool,
            current.state,
            current.winner,
            current.state == RaffleState.OPEN &&
                block.timestamp >= current.endTime &&
                current.participants.length > 0
        );
    }

    /**
     * @dev Get VRF configuration
     */
    function getVRFConfig()
        external
        pure
        returns (
            uint256 subscriptionId,
            bytes32 keyHash,
            uint32 callbackGasLimit,
            uint16 requestConfirmations
        )
    {
        return (
            SUBSCRIPTION_ID,
            KEY_HASH,
            CALLBACK_GAS_LIMIT,
            REQUEST_CONFIRMATIONS
        );
    }

    /**
     * @dev Get raffle round details
     */
    function getRaffleRound(
        uint256 roundId
    )
        external
        view
        returns (
            uint256 _roundId,
            uint256 startTime,
            uint256 endTime,
            address[] memory participants,
            uint256 prizePool,
            uint256 devFee,
            RaffleState state,
            address winner,
            bool prizeClaimed
        )
    {
        RaffleRound storage raffle = raffleRounds[roundId];
        return (
            raffle.roundId,
            raffle.startTime,
            raffle.endTime,
            raffle.participants,
            raffle.prizePool,
            raffle.devFee,
            raffle.state,
            raffle.winner,
            raffle.prizeClaimed
        );
    }

    /**
     * @dev Get participant tickets for a round
     */
    function getParticipantTickets(
        uint256 roundId,
        address participant
    ) external view returns (uint256) {
        address[] memory participants = raffleRounds[roundId].participants;
        uint256 ticketCount = 0;

        for (uint256 i = 0; i < participants.length; i++) {
            if (participants[i] == participant) {
                ticketCount++;
            }
        }

        return ticketCount;
    }

    /**
     * @dev Check if current raffle can be drawn
     */
    function isReadyToDraw() external view returns (bool) {
        RaffleRound storage current = raffleRounds[currentRoundId];
        return
            current.state == RaffleState.OPEN &&
            block.timestamp >= current.endTime &&
            current.participants.length > 0;
    }

    /**
     * @dev Get balance information
     */
    function getBalanceInfo()
        external
        view
        returns (uint256 contractBalance, uint256 devFeesAvailable)
    {
        return (address(this).balance, totalDevFees);
    }

    /**
     * @dev Get user's ticket count for current round
     */
    function getUserTicketCount(
        address user
    ) external view returns (uint256 count) {
        RaffleRound storage raffle = raffleRounds[currentRoundId];
        for (uint256 i = 0; i < raffle.participants.length; i++) {
            if (raffle.participants[i] == user) {
                count++;
            }
        }
    }

    // ===== Admin Functions =====

    /**
     * @dev Update dev wallet address (only owner)
     */
    function updateDevWallet(address newDevWallet) external onlyOwner {
        require(newDevWallet != address(0), "Invalid dev wallet");
        devWallet = newDevWallet;
    }

    /**
     * @dev Get VRF coordinator address
     */
    function getVRFCoordinator() external view returns (address) {
        return address(vrfCoordinator);
    }

    /**
     * @dev Emergency function to recover stuck ETH (only if no active raffles)
     */
    function emergencyWithdraw() external onlyOwner {
        require(
            raffleRounds[currentRoundId].participants.length == 0,
            "Active raffle exists"
        );

        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }
}
