// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title YieldAgent Continuous Chainlink Raffle (Compatible Version)
 * @dev A continuous raffle system using Chainlink VRF v2 for provably fair winner selection
 * Compatible with VRF subscription: 63638762572181911466406949252427640028961704213268465121364079606304171403540
 */
contract ContinuousChainlinkRaffleV25 is
    VRFConsumerBaseV2,
    Ownable,
    ReentrancyGuard
{
    // VRF v2 Configuration for Sepolia
    VRFCoordinatorV2Interface COORDINATOR;
    uint256 private s_subscriptionId; // Changed to uint256 for large subscription IDs
    bytes32 private s_keyHash =
        0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae; // Sepolia 500 gwei
    uint32 private s_callbackGasLimit = 300000; // Increased for raffle logic
    uint16 private s_requestConfirmations = 3;
    uint32 private s_numWords = 1;

    // Raffle Configuration
    uint256 public constant TICKET_PRICE = 0.001 ether;
    uint256 public constant RAFFLE_DURATION = 600; // 10 minutes
    uint256 public constant MIN_PARTICIPANTS = 2;

    // Raffle State
    enum RaffleState {
        OPEN,
        CALCULATING,
        FINISHED
    }

    struct RaffleInfo {
        uint256 roundId;
        uint256 startTime;
        uint256 participants;
        uint256 prizePool;
        RaffleState state;
        address winner;
        uint256 winnerSelectedTime;
    }

    // Storage
    RaffleInfo public currentRaffle;
    mapping(uint256 => address[]) public roundParticipants;
    mapping(address => uint256) public playerTicketCount;
    mapping(uint256 => uint256) private s_requestIdToRoundId;

    // Events
    event RaffleStarted(uint256 indexed roundId, uint256 startTime);
    event TicketPurchased(
        address indexed player,
        uint256 indexed roundId,
        uint256 ticketCount
    );
    event WinnerRequested(uint256 indexed roundId, uint256 requestId);
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
    event RaffleReset(uint256 indexed newRoundId);

    constructor(
        uint256 subscriptionId
    )
        VRFConsumerBaseV2(0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625) // Sepolia VRF Coordinator v2
        Ownable(msg.sender)
    {
        COORDINATOR = VRFCoordinatorV2Interface(
            0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
        );
        s_subscriptionId = subscriptionId;
        _startNewRaffle();
    }

    /**
     * @dev Buy tickets for the current raffle
     * @param ticketCount Number of tickets to purchase
     */
    function buyTickets(uint256 ticketCount) external payable nonReentrant {
        require(ticketCount > 0, "Must buy at least 1 ticket");
        require(
            msg.value >= TICKET_PRICE * ticketCount,
            "Insufficient payment"
        );
        require(currentRaffle.state == RaffleState.OPEN, "Raffle not open");

        // Add tickets for the player
        for (uint256 i = 0; i < ticketCount; i++) {
            roundParticipants[currentRaffle.roundId].push(msg.sender);
        }

        // Update state
        currentRaffle.participants += ticketCount;
        currentRaffle.prizePool += TICKET_PRICE * ticketCount;
        playerTicketCount[msg.sender] += ticketCount;

        emit TicketPurchased(msg.sender, currentRaffle.roundId, ticketCount);

        // Refund excess payment
        if (msg.value > TICKET_PRICE * ticketCount) {
            payable(msg.sender).transfer(
                msg.value - (TICKET_PRICE * ticketCount)
            );
        }

        // Check if raffle should end
        _checkRaffleCompletion();
    }

    /**
     * @dev Check if raffle conditions are met and trigger draw if needed
     */
    function _checkRaffleCompletion() internal {
        if (currentRaffle.state != RaffleState.OPEN) return;

        bool hasMinParticipants = currentRaffle.participants >=
            MIN_PARTICIPANTS;
        bool hasMinDuration = block.timestamp >=
            currentRaffle.startTime + RAFFLE_DURATION;

        if (hasMinParticipants && hasMinDuration) {
            _requestWinner();
        }
    }

    /**
     * @dev Manually trigger winner selection (only owner)
     */
    function triggerDraw() external onlyOwner {
        require(currentRaffle.state == RaffleState.OPEN, "Raffle not open");
        require(
            currentRaffle.participants >= MIN_PARTICIPANTS,
            "Not enough participants"
        );
        _requestWinner();
    }

    /**
     * @dev Request random number from Chainlink VRF v2
     */
    function _requestWinner() internal {
        require(currentRaffle.state == RaffleState.OPEN, "Raffle not open");

        currentRaffle.state = RaffleState.CALCULATING;

        // Request randomness using VRF v2 format
        uint256 requestId = COORDINATOR.requestRandomWords(
            s_keyHash,
            uint64(s_subscriptionId), // Cast to uint64 for VRF
            s_requestConfirmations,
            s_callbackGasLimit,
            s_numWords
        );

        s_requestIdToRoundId[requestId] = currentRaffle.roundId;
        emit WinnerRequested(currentRaffle.roundId, requestId);
    }

    /**
     * @dev Callback function used by VRF Coordinator v2
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        uint256 roundId = s_requestIdToRoundId[requestId];
        require(roundId == currentRaffle.roundId, "Invalid round");
        require(
            currentRaffle.state == RaffleState.CALCULATING,
            "Not calculating"
        );

        // Select winner
        uint256 winnerIndex = randomWords[0] % currentRaffle.participants;
        address winner = roundParticipants[roundId][winnerIndex];

        // Update raffle state
        currentRaffle.winner = winner;
        currentRaffle.winnerSelectedTime = block.timestamp;
        currentRaffle.state = RaffleState.FINISHED;

        emit WinnerSelected(roundId, winner, currentRaffle.prizePool);

        // Transfer prize to winner
        _transferPrize(winner, currentRaffle.prizePool);

        // Start new raffle after short delay
        _startNewRaffle();
    }

    /**
     * @dev Transfer prize to winner
     */
    function _transferPrize(address winner, uint256 amount) internal {
        require(winner != address(0), "Invalid winner");
        require(amount > 0, "No prize to transfer");

        (bool success, ) = payable(winner).call{value: amount}("");
        require(success, "Prize transfer failed");

        emit PrizeClaimed(currentRaffle.roundId, winner, amount);
    }

    /**
     * @dev Start a new raffle round
     */
    function _startNewRaffle() internal {
        uint256 newRoundId = currentRaffle.roundId + 1;

        currentRaffle = RaffleInfo({
            roundId: newRoundId,
            startTime: block.timestamp,
            participants: 0,
            prizePool: 0,
            state: RaffleState.OPEN,
            winner: address(0),
            winnerSelectedTime: 0
        });

        emit RaffleStarted(newRoundId, block.timestamp);
        emit RaffleReset(newRoundId);
    }

    // View Functions

    /**
     * @dev Get current raffle information
     */
    function getCurrentRaffleInfo() external view returns (RaffleInfo memory) {
        return currentRaffle;
    }

    /**
     * @dev Get participants for a specific round
     */
    function getRoundParticipants(
        uint256 roundId
    ) external view returns (address[] memory) {
        return roundParticipants[roundId];
    }

    /**
     * @dev Get ticket price
     */
    function getTicketPrice() external pure returns (uint256) {
        return TICKET_PRICE;
    }

    /**
     * @dev Get raffle duration
     */
    function getRaffleDuration() external pure returns (uint256) {
        return RAFFLE_DURATION;
    }

    /**
     * @dev Get minimum participants required
     */
    function getMinParticipants() external pure returns (uint256) {
        return MIN_PARTICIPANTS;
    }

    /**
     * @dev Check if raffle can be drawn
     */
    function canDraw() external view returns (bool) {
        if (currentRaffle.state != RaffleState.OPEN) return false;

        bool hasMinParticipants = currentRaffle.participants >=
            MIN_PARTICIPANTS;
        bool hasMinDuration = block.timestamp >=
            currentRaffle.startTime + RAFFLE_DURATION;

        return hasMinParticipants && hasMinDuration;
    }

    /**
     * @dev Get time remaining until raffle can be drawn
     */
    function getTimeRemaining() external view returns (uint256) {
        if (block.timestamp >= currentRaffle.startTime + RAFFLE_DURATION) {
            return 0;
        }
        return (currentRaffle.startTime + RAFFLE_DURATION) - block.timestamp;
    }

    // Admin Functions

    /**
     * @dev Update VRF subscription ID (only owner)
     */
    function setSubscriptionId(uint256 subscriptionId) external onlyOwner {
        s_subscriptionId = subscriptionId;
    }

    /**
     * @dev Update VRF configuration (only owner)
     */
    function setVRFConfig(
        bytes32 keyHash,
        uint32 callbackGasLimit,
        uint16 requestConfirmations
    ) external onlyOwner {
        s_keyHash = keyHash;
        s_callbackGasLimit = callbackGasLimit;
        s_requestConfirmations = requestConfirmations;
    }

    /**
     * @dev Emergency withdraw (only owner, only if no active raffle)
     */
    function emergencyWithdraw() external onlyOwner {
        require(
            currentRaffle.state == RaffleState.OPEN,
            "Cannot withdraw during calculation"
        );
        require(
            currentRaffle.participants == 0,
            "Cannot withdraw with participants"
        );

        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Receive function to accept ETH
    receive() external payable {}
}
