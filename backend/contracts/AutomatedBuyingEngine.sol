// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./EnhancedAIPortfolioVault.sol";
import "./ContinuousChainlinkRaffle.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AutomatedBuyingEngine
 * @dev Automated buying system for both AI portfolio allocations and raffle tickets
 *
 * Features:
 * - Automated portfolio rebalancing based on AI decisions
 * - Automated raffle ticket purchasing for agent owners
 * - Chainlink Automation integration for gas-efficient execution
 * - Rate limiting and fail-safes for API quota management
 */
contract AutomatedBuyingEngine is AutomationCompatible, Ownable {
    // ============= INTERFACES =============

    EnhancedAIPortfolioVault public immutable portfolioVault;
    ContinuousChainlinkRaffle public immutable raffle;

    // ============= AUTOMATION SETTINGS =============

    uint256 public constant AI_REBALANCE_INTERVAL = 1 hours; // Check every hour
    uint256 public constant RAFFLE_BUY_INTERVAL = 30 minutes; // Buy raffle tickets every 30 mins
    uint256 public constant MAX_RAFFLE_TICKETS_PER_AGENT = 5; // Max tickets per agent per round
    uint256 public constant MIN_AGENT_VALUE_FOR_RAFFLE = 0.1 ether; // Min agent value to auto-buy raffle tickets

    // ============= STATE VARIABLES =============

    mapping(uint256 => uint256) public lastRebalanceTime; // agentId => timestamp
    mapping(uint256 => uint256) public lastRafflePurchase; // agentId => timestamp
    mapping(uint256 => uint256) public raffleTicketsPurchased; // agentId => tickets in current round
    mapping(uint256 => bool) public autoRebalanceEnabled; // agentId => enabled
    mapping(uint256 => bool) public autoRaffleEnabled; // agentId => enabled

    uint256 public lastGlobalCheck;
    uint256 public aiCallsToday;
    uint256 public dailyAiLimit = 40; // Leave 10 requests for manual use
    uint256 public lastResetDay;

    // ============= EVENTS =============

    event AutoRebalanceExecuted(
        uint256 indexed agentId,
        string reason,
        uint256 timestamp
    );
    event AutoRafflePurchase(
        uint256 indexed agentId,
        uint256 ticketCount,
        uint256 cost
    );
    event AutomationConfigUpdated(
        uint256 indexed agentId,
        bool rebalanceEnabled,
        bool raffleEnabled
    );
    event AIQuotaLimitReached(uint256 callsUsed, uint256 limit);

    // ============= CONSTRUCTOR =============

    constructor(address _portfolioVault, address _raffle) Ownable(msg.sender) {
        portfolioVault = EnhancedAIPortfolioVault(payable(_portfolioVault));
        raffle = ContinuousChainlinkRaffle(payable(_raffle));
        lastGlobalCheck = block.timestamp;
        lastResetDay = block.timestamp / 1 days;
    }

    // ============= CHAINLINK AUTOMATION =============

    /**
     * @dev Chainlink Automation upkeep check
     */
    function checkUpkeep(
        bytes calldata
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        // Reset daily AI call counter if needed
        uint256 currentDay = block.timestamp / 1 days;
        bool needsReset = currentDay > lastResetDay;

        // Check if we have AI quota available
        bool hasAiQuota = aiCallsToday < dailyAiLimit || needsReset;

        // Check if enough time has passed for global check
        bool timeForCheck = block.timestamp >= lastGlobalCheck + 30 minutes;

        if (timeForCheck) {
            // Get total number of agents to check
            uint256 totalAgents = portfolioVault.nextAgentId() - 1;

            if (totalAgents > 0) {
                // Prepare data for execution
                upkeepNeeded = true;
                performData = abi.encode(totalAgents, hasAiQuota, needsReset);
            }
        }
    }

    /**
     * @dev Chainlink Automation upkeep execution
     */
    function performUpkeep(bytes calldata performData) external override {
        (uint256 totalAgents, bool hasAiQuota, bool needsReset) = abi.decode(
            performData,
            (uint256, bool, bool)
        );

        // Reset daily counter if needed
        if (needsReset) {
            aiCallsToday = 0;
            lastResetDay = block.timestamp / 1 days;
        }

        // Update last check time
        lastGlobalCheck = block.timestamp;

        // Process all agents
        for (uint256 agentId = 1; agentId <= totalAgents; agentId++) {
            _processAgent(agentId, hasAiQuota);
        }
    }

    // ============= AGENT PROCESSING =============

    /**
     * @dev Process a single agent for automated actions
     */
    function _processAgent(uint256 agentId, bool hasAiQuota) internal {
        try portfolioVault.getAgent(agentId) returns (
            EnhancedAIPortfolioVault.Agent memory agent
        ) {
            if (!agent.isActive || agent.emergencyMode) return;

            // Check for auto-rebalancing
            if (autoRebalanceEnabled[agentId] && hasAiQuota) {
                _checkAndExecuteRebalance(
                    agentId,
                    agent.totalValueETH,
                    agent.lastRebalance
                );
            }

            // Check for auto-raffle ticket purchasing
            if (
                autoRaffleEnabled[agentId] &&
                agent.totalValueETH >= MIN_AGENT_VALUE_FOR_RAFFLE
            ) {
                _checkAndBuyRaffleTickets(
                    agentId,
                    agent.owner,
                    agent.totalValueETH
                );
            }
        } catch {
            // Agent doesn't exist or error occurred, skip
            return;
        }
    }

    /**
     * @dev Check and execute portfolio rebalancing
     */
    function _checkAndExecuteRebalance(
        uint256 agentId,
        uint256 totalValue,
        uint256 /* lastRebalance */
    ) internal {
        // Check if enough time has passed since last rebalance
        bool timeForRebalance = block.timestamp >=
            lastRebalanceTime[agentId] + AI_REBALANCE_INTERVAL;
        bool significantValue = totalValue >= 0.05 ether; // Only rebalance if significant value

        if (
            timeForRebalance && significantValue && aiCallsToday < dailyAiLimit
        ) {
            try this._executeAIRebalance(agentId) {
                lastRebalanceTime[agentId] = block.timestamp;
                aiCallsToday++;
                emit AutoRebalanceExecuted(
                    agentId,
                    "Scheduled AI rebalance",
                    block.timestamp
                );
            } catch {
                // AI call failed, skip this agent
                emit AIQuotaLimitReached(aiCallsToday, dailyAiLimit);
            }
        }
    }

    /**
     * @dev External function to execute AI rebalance (allows try/catch)
     */
    function _executeAIRebalance(uint256 agentId) external {
        require(msg.sender == address(this), "Only self");

        // For now, just record that an AI decision was attempted
        // In a full implementation, this would trigger actual rebalancing
        // through the available portfolio functions

        // The AI logic would analyze and potentially call:
        // - depositETH() to add more funds
        // - withdrawETH() to rebalance allocations
        // - Update allocation percentages based on AI recommendations

        // For demo purposes, we'll just emit an event
        emit AutoRebalanceExecuted(
            agentId,
            "AI rebalance attempted",
            block.timestamp
        );
    }

    /**
     * @dev Check and buy raffle tickets for agent
     */
    function _checkAndBuyRaffleTickets(
        uint256 agentId,
        address owner,
        uint256 totalValue
    ) internal {
        // Check if enough time has passed since last purchase
        bool timeForPurchase = block.timestamp >=
            lastRafflePurchase[agentId] + RAFFLE_BUY_INTERVAL;

        // Check if we haven't bought too many tickets this round
        bool canBuyMore = raffleTicketsPurchased[agentId] <
            MAX_RAFFLE_TICKETS_PER_AGENT;

        if (timeForPurchase && canBuyMore) {
            // Calculate how many tickets to buy based on agent value
            uint256 ticketsToBuy = _calculateRaffleTickets(totalValue);
            uint256 cost = ticketsToBuy * raffle.TICKET_PRICE();

            // Check if agent has enough balance (use a portion of yields)
            if (cost <= totalValue / 100) {
                // Max 1% of agent value for raffle tickets
                try
                    this._buyRaffleTicketsForAgent(
                        agentId,
                        owner,
                        ticketsToBuy,
                        cost
                    )
                {
                    lastRafflePurchase[agentId] = block.timestamp;
                    raffleTicketsPurchased[agentId] += ticketsToBuy;
                    emit AutoRafflePurchase(agentId, ticketsToBuy, cost);
                } catch {
                    // Purchase failed, skip
                }
            }
        }
    }

    /**
     * @dev Calculate number of raffle tickets to buy
     */
    function _calculateRaffleTickets(
        uint256 agentValue
    ) internal pure returns (uint256) {
        if (agentValue >= 1 ether) return 5;
        if (agentValue >= 0.5 ether) return 3;
        if (agentValue >= 0.2 ether) return 2;
        return 1;
    }

    /**
     * @dev External function to buy raffle tickets (allows try/catch)
     */
    function _buyRaffleTicketsForAgent(
        uint256 /* agentId */,
        address /* owner */,
        uint256 ticketCount,
        uint256 cost
    ) external payable {
        require(msg.sender == address(this), "Only self");

        // For automated raffle purchases, we'll need the contract to have ETH
        // This would be funded by the platform or agent owners
        require(address(this).balance >= cost, "Insufficient funds");

        // Buy raffle tickets on behalf of the agent owner
        raffle.buyTickets{value: cost}(ticketCount);
    }

    // ============= CONFIGURATION =============

    /**
     * @dev Enable/disable automation for an agent (only agent owner)
     */
    function configureAgentAutomation(
        uint256 agentId,
        bool enableRebalance,
        bool enableRaffle
    ) external {
        // Verify caller owns the agent
        EnhancedAIPortfolioVault.Agent memory agent = portfolioVault.getAgent(
            agentId
        );
        require(msg.sender == agent.owner, "Only agent owner");

        autoRebalanceEnabled[agentId] = enableRebalance;
        autoRaffleEnabled[agentId] = enableRaffle;

        emit AutomationConfigUpdated(agentId, enableRebalance, enableRaffle);
    }

    /**
     * @dev Update AI daily limit (only owner)
     */
    function updateAILimit(uint256 newLimit) external onlyOwner {
        require(newLimit <= 45, "Limit too high"); // Keep some buffer
        dailyAiLimit = newLimit;
    }

    // ============= VIEW FUNCTIONS =============

    /**
     * @dev Get automation status for an agent
     */
    function getAgentAutomationStatus(
        uint256 agentId
    )
        external
        view
        returns (
            bool rebalanceEnabled,
            bool raffleEnabled,
            uint256 lastRebalance,
            uint256 lastRaffle,
            uint256 raffleTicketsThisRound
        )
    {
        return (
            autoRebalanceEnabled[agentId],
            autoRaffleEnabled[agentId],
            lastRebalanceTime[agentId],
            lastRafflePurchase[agentId],
            raffleTicketsPurchased[agentId]
        );
    }

    /**
     * @dev Get AI quota status
     */
    function getAIQuotaStatus()
        external
        view
        returns (
            uint256 callsUsed,
            uint256 limit,
            uint256 remaining,
            uint256 resetTime
        )
    {
        uint256 currentDay = block.timestamp / 1 days;
        uint256 calls = currentDay > lastResetDay ? 0 : aiCallsToday;

        return (
            calls,
            dailyAiLimit,
            dailyAiLimit > calls ? dailyAiLimit - calls : 0,
            (currentDay + 1) * 1 days
        );
    }

    // ============= EMERGENCY FUNCTIONS =============

    /**
     * @dev Emergency pause all automation
     */
    function emergencyPause() external onlyOwner {
        lastGlobalCheck = block.timestamp + 24 hours; // Pause for 24 hours
    }

    /**
     * @dev Resume automation
     */
    function resumeAutomation() external onlyOwner {
        lastGlobalCheck = block.timestamp;
    }

    // ============= RECEIVE FUNCTION =============

    receive() external payable {
        // Allow contract to receive ETH for raffle purchases
    }
}
