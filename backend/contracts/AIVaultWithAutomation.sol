// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title AIVaultWithAutomation
 * @dev Complete AI-powered DeFi portfolio manager with Chainlink Automation
 * Features: Agent creation, strategy selection, automated allocation, yield harvesting
 * Fully compatible with Chainlink Automation for autonomous portfolio management
 */
contract AIVaultWithAutomation is
    Ownable,
    ReentrancyGuard,
    AutomationCompatible
{
    // ============= ENUMS =============

    enum Strategy {
        CONSERVATIVE, // Low risk, stable returns
        BALANCED, // Medium risk, balanced allocation
        AGGRESSIVE // High risk, maximum yield
    }

    enum Protocol {
        LIDO_STAKING, // Ethereum staking via Lido
        AAVE_LENDING, // Lending on Aave
        UNISWAP_LP, // Uniswap V3 liquidity provision
        COMPOUND_LENDING, // Compound lending
        CURVE_POOLS // Curve pool participation
    }

    // ============= STRUCTS =============

    struct Agent {
        uint256 id;
        address owner;
        string name;
        Strategy strategy;
        uint256 totalDeposited;
        uint256 currentValue;
        uint256 totalYield;
        uint256 lastRebalance;
        uint256 createdAt;
        bool isActive;
    }

    struct Allocation {
        uint256 lidoStaking; // Lido stETH staking
        uint256 aaveLending; // Aave WETH lending
        uint256 uniswapLP; // Uniswap V3 LP positions
        uint256 compoundLending; // Compound lending
        uint256 curveLP; // Curve pool LPs
        uint256 cashReserve; // ETH reserve
    }

    struct StrategyConfig {
        uint16 lidoPercent; // Percentage for Lido (in basis points)
        uint16 aavePercent; // Percentage for Aave
        uint16 uniswapPercent; // Percentage for Uniswap
        uint16 compoundPercent; // Percentage for Compound
        uint16 curvePercent; // Percentage for Curve
        uint16 cashPercent; // Percentage for cash reserve
    }

    // ============= STATE VARIABLES =============

    mapping(uint256 => Agent) public agents;
    mapping(uint256 => Allocation) public allocations;
    mapping(address => uint256[]) public userAgents;
    mapping(Strategy => StrategyConfig) public strategyConfigs;

    uint256 public nextAgentId = 1;
    uint256 public totalValueLocked;
    uint256 public totalAgentsCreated;
    uint256 public lastGlobalRebalance;
    uint256 public rebalanceInterval = 3600; // 1 hour for Chainlink automation

    // AI Decision Parameters
    uint256 public constant MIN_REBALANCE_THRESHOLD = 50; // 5% (in basis points)
    uint256 public constant MAX_ALLOCATION_DRIFT = 200; // 20% max drift from target
    uint256 public constant MIN_AUTOMATION_BALANCE = 0.1 ether; // Minimum ETH for automation

    // Protocol Addresses (Sepolia testnet - these are mock addresses for demo)
    address public constant LIDO_STETH =
        0x1643E812aE58766192Cf7D2Cf9567dF2C37e9B7F;
    address public constant AAVE_POOL =
        0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951;
    address public constant WETH = 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14;
    address public constant USDC = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;

    // Chainlink Price Feed for ETH/USD (Sepolia)
    AggregatorV3Interface public priceFeed;

    // ============= EVENTS =============

    event AgentCreated(
        uint256 indexed agentId,
        address indexed owner,
        string name,
        Strategy strategy
    );
    event FundsDeposited(
        uint256 indexed agentId,
        uint256 amount,
        uint256 totalValue
    );
    event FundsWithdrawn(
        uint256 indexed agentId,
        uint256 amount,
        uint256 remainingValue
    );
    event AllocationExecuted(
        uint256 indexed agentId,
        Protocol protocol,
        uint256 amount
    );
    event YieldHarvested(uint256 indexed agentId, uint256 totalYield);
    event RebalanceExecuted(uint256 indexed agentId, string reason);
    event StrategyChanged(
        uint256 indexed agentId,
        Strategy oldStrategy,
        Strategy newStrategy
    );
    event AutomationTriggered(uint256 agentsProcessed, uint256 timestamp);

    // ============= CONSTRUCTOR =============

    constructor(address _priceFeed) Ownable(msg.sender) {
        // ETH/USD Price Feed on Sepolia: 0x694AA1769357215DE4FAC081bf1f309aDC325306
        priceFeed = AggregatorV3Interface(_priceFeed);
        _initializeStrategies();
        lastGlobalRebalance = block.timestamp;
    }

    // ============= CORE AGENT FUNCTIONS =============

    /**
     * @dev Create a new AI portfolio agent with selected strategy
     * @param _name Human-readable name for the agent
     * @param _strategy Investment strategy (CONSERVATIVE, BALANCED, AGGRESSIVE)
     * @return agentId The unique ID of the created agent
     */
    function createAgent(
        string memory _name,
        Strategy _strategy
    ) external returns (uint256) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_name).length <= 32, "Name too long");

        uint256 agentId = nextAgentId++;

        agents[agentId] = Agent({
            id: agentId,
            owner: msg.sender,
            name: _name,
            strategy: _strategy,
            totalDeposited: 0,
            currentValue: 0,
            totalYield: 0,
            lastRebalance: block.timestamp,
            createdAt: block.timestamp,
            isActive: true
        });

        userAgents[msg.sender].push(agentId);
        totalAgentsCreated++;

        emit AgentCreated(agentId, msg.sender, _name, _strategy);
        return agentId;
    }

    /**
     * @dev Deposit ETH into agent for AI-managed allocation
     * @param _agentId The agent to deposit into
     */
    function depositToAgent(uint256 _agentId) external payable nonReentrant {
        require(msg.value > 0, "Must deposit ETH");
        require(msg.value >= 0.001 ether, "Minimum deposit 0.001 ETH");
        require(agents[_agentId].owner == msg.sender, "Not agent owner");
        require(agents[_agentId].isActive, "Agent not active");

        Agent storage agent = agents[_agentId];
        agent.totalDeposited += msg.value;
        agent.currentValue += msg.value;
        totalValueLocked += msg.value;

        emit FundsDeposited(_agentId, msg.value, agent.currentValue);

        // Execute immediate AI allocation
        _executeAIAllocation(_agentId, msg.value);
    }

    /**
     * @dev Withdraw funds from agent
     * @param _agentId The agent to withdraw from
     * @param _amount Amount to withdraw in wei
     */
    function withdrawFromAgent(
        uint256 _agentId,
        uint256 _amount
    ) external nonReentrant {
        require(agents[_agentId].owner == msg.sender, "Not agent owner");
        require(
            agents[_agentId].currentValue >= _amount,
            "Insufficient balance"
        );
        require(_amount > 0, "Amount must be greater than 0");

        // Harvest yields before withdrawal
        _harvestYields(_agentId);

        // Liquidate positions if needed
        _liquidateForWithdrawal(_agentId, _amount);

        agents[_agentId].currentValue -= _amount;
        totalValueLocked -= _amount;

        emit FundsWithdrawn(_agentId, _amount, agents[_agentId].currentValue);

        payable(msg.sender).transfer(_amount);
    }

    /**
     * @dev Withdraw funds from agent (alias for backward compatibility)
     * @param _agentId The agent to withdraw from
     * @param _amount Amount to withdraw in wei
     */
    function withdraw(uint256 _agentId, uint256 _amount) external {
        this.withdrawFromAgent(_agentId, _amount);
    }

    /**
     * @dev Change agent investment strategy
     * @param _agentId The agent to modify
     * @param _newStrategy New investment strategy
     */
    function changeStrategy(uint256 _agentId, Strategy _newStrategy) external {
        require(agents[_agentId].owner == msg.sender, "Not agent owner");
        require(agents[_agentId].isActive, "Agent not active");

        Strategy oldStrategy = agents[_agentId].strategy;
        agents[_agentId].strategy = _newStrategy;

        emit StrategyChanged(_agentId, oldStrategy, _newStrategy);

        // Trigger immediate rebalance to new strategy
        _rebalanceAgent(_agentId, "Strategy changed");
    }

    // ============= CHAINLINK AUTOMATION =============

    /**
     * @dev Chainlink Automation upkeep check - determines if automation is needed
     * @return upkeepNeeded True if upkeep should be performed
     * @return performData Encoded data to pass to performUpkeep
     */
    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        // Check if enough time has passed for global rebalance
        bool timeBasedUpkeep = (block.timestamp - lastGlobalRebalance) >=
            rebalanceInterval;

        if (timeBasedUpkeep && totalAgentsCreated > 0) {
            // Find up to 5 agents that need rebalancing (limit for gas efficiency)
            uint256[] memory agentsToRebalance = new uint256[](5);
            uint256 count = 0;

            for (uint256 i = 1; i < nextAgentId && count < 5; i++) {
                if (agents[i].isActive && _needsRebalance(i)) {
                    agentsToRebalance[count] = i;
                    count++;
                }
            }

            // Only perform upkeep if there are agents to rebalance
            if (count > 0) {
                upkeepNeeded = true;
                // Create a properly sized array
                uint256[] memory validAgents = new uint256[](count);
                for (uint256 j = 0; j < count; j++) {
                    validAgents[j] = agentsToRebalance[j];
                }
                performData = abi.encode(validAgents);
            } else {
                upkeepNeeded = false;
                performData = "";
            }
        } else {
            upkeepNeeded = false;
            performData = "";
        }
    }

    /**
     * @dev Chainlink Automation upkeep execution - performs the actual automation work
     * @param performData Encoded data from checkUpkeep containing agents to rebalance
     */
    function performUpkeep(bytes calldata performData) external override {
        // Validate that we have data to work with
        if (performData.length == 0) {
            return;
        }

        // Decode the agent IDs that need rebalancing
        uint256[] memory agentIds = abi.decode(performData, (uint256[]));

        uint256 agentsProcessed = 0;

        // Rebalance agents that need it (limit to avoid gas issues)
        for (uint256 i = 0; i < agentIds.length && i < 5; i++) {
            uint256 agentId = agentIds[i];

            // Double-check that agent still needs rebalancing and is active
            if (agents[agentId].isActive && _needsRebalance(agentId)) {
                _rebalanceAgent(agentId, "Chainlink automation");
                agentsProcessed++;
            }
        }

        // Update global rebalance timestamp
        lastGlobalRebalance = block.timestamp;

        // Emit event if any agents were processed
        if (agentsProcessed > 0) {
            emit AutomationTriggered(agentsProcessed, block.timestamp);
        }
    }

    // ============= AI ALLOCATION LOGIC =============

    /**
     * @dev Execute AI-driven fund allocation based on strategy
     * @param _agentId The agent to allocate funds for
     * @param _amount Amount to allocate
     */
    function _executeAIAllocation(uint256 _agentId, uint256 _amount) internal {
        Strategy strategy = agents[_agentId].strategy;
        StrategyConfig memory config = strategyConfigs[strategy];

        // Calculate allocations based on strategy percentages
        uint256 lidoAmount = (_amount * config.lidoPercent) / 1000;
        uint256 aaveAmount = (_amount * config.aavePercent) / 1000;
        uint256 uniswapAmount = (_amount * config.uniswapPercent) / 1000;
        uint256 compoundAmount = (_amount * config.compoundPercent) / 1000;
        uint256 curveAmount = (_amount * config.curvePercent) / 1000;
        uint256 cashAmount = (_amount * config.cashPercent) / 1000;

        // Execute allocations to each protocol
        if (lidoAmount > 0) _allocateToLido(_agentId, lidoAmount);
        if (aaveAmount > 0) _allocateToAave(_agentId, aaveAmount);
        if (uniswapAmount > 0) _allocateToUniswap(_agentId, uniswapAmount);
        if (compoundAmount > 0) _allocateToCompound(_agentId, compoundAmount);
        if (curveAmount > 0) _allocateToCurve(_agentId, curveAmount);

        // Keep remaining as cash reserve
        if (cashAmount > 0) {
            allocations[_agentId].cashReserve += cashAmount;
        }
    }

    /**
     * @dev Allocate funds to Lido staking
     */
    function _allocateToLido(uint256 _agentId, uint256 _amount) internal {
        allocations[_agentId].lidoStaking += _amount;
        emit AllocationExecuted(_agentId, Protocol.LIDO_STAKING, _amount);

        // Simulate yield generation (4% APY for Lido)
        uint256 dailyYield = (_amount * 4 * 100) / (365 * 10000);
        agents[_agentId].totalYield += dailyYield;
    }

    /**
     * @dev Allocate funds to Aave lending
     */
    function _allocateToAave(uint256 _agentId, uint256 _amount) internal {
        allocations[_agentId].aaveLending += _amount;
        emit AllocationExecuted(_agentId, Protocol.AAVE_LENDING, _amount);

        // Simulate yield generation (3% APY for Aave)
        uint256 dailyYield = (_amount * 3 * 100) / (365 * 10000);
        agents[_agentId].totalYield += dailyYield;
    }

    /**
     * @dev Allocate funds to Uniswap V3 LP
     */
    function _allocateToUniswap(uint256 _agentId, uint256 _amount) internal {
        allocations[_agentId].uniswapLP += _amount;
        emit AllocationExecuted(_agentId, Protocol.UNISWAP_LP, _amount);

        // Simulate yield generation (8% APY for LP fees)
        uint256 dailyYield = (_amount * 8 * 100) / (365 * 10000);
        agents[_agentId].totalYield += dailyYield;
    }

    /**
     * @dev Allocate funds to Compound lending
     */
    function _allocateToCompound(uint256 _agentId, uint256 _amount) internal {
        allocations[_agentId].compoundLending += _amount;
        emit AllocationExecuted(_agentId, Protocol.COMPOUND_LENDING, _amount);

        // Simulate yield generation (3.5% APY)
        uint256 dailyYield = (_amount * 35 * 10) / (365 * 10000);
        agents[_agentId].totalYield += dailyYield;
    }

    /**
     * @dev Allocate funds to Curve pools
     */
    function _allocateToCurve(uint256 _agentId, uint256 _amount) internal {
        allocations[_agentId].curveLP += _amount;
        emit AllocationExecuted(_agentId, Protocol.CURVE_POOLS, _amount);

        // Simulate yield generation (7% APY)
        uint256 dailyYield = (_amount * 7 * 100) / (365 * 10000);
        agents[_agentId].totalYield += dailyYield;
    }

    // ============= REBALANCING LOGIC =============

    /**
     * @dev Check if an agent needs rebalancing
     */
    function _needsRebalance(uint256 _agentId) internal view returns (bool) {
        Agent memory agent = agents[_agentId];

        // Check if agent has any value to rebalance
        if (agent.currentValue == 0 || !agent.isActive) {
            return false;
        }

        // Check if enough time has passed since last rebalance
        if (block.timestamp - agent.lastRebalance >= rebalanceInterval) {
            return true;
        }

        // For gas efficiency, only check drift for larger accounts
        if (agent.currentValue >= 0.01 ether) {
            return _hasSignificantDrift(_agentId);
        }

        return false;
    }

    /**
     * @dev Check if allocation has drifted from target strategy
     */
    function _hasSignificantDrift(
        uint256 _agentId
    ) internal view returns (bool) {
        Strategy strategy = agents[_agentId].strategy;
        StrategyConfig memory target = strategyConfigs[strategy];
        Allocation memory current = allocations[_agentId];
        uint256 totalValue = agents[_agentId].currentValue;

        if (totalValue == 0) return false;

        // Calculate current percentages (in basis points)
        uint256 lidoPercent = (current.lidoStaking * 1000) / totalValue;
        uint256 aavePercent = (current.aaveLending * 1000) / totalValue;
        uint256 uniswapPercent = (current.uniswapLP * 1000) / totalValue;

        // Check if any major allocation has drifted beyond threshold
        return (_abs(
            int256(lidoPercent) - int256(uint256(target.lidoPercent))
        ) >
            MAX_ALLOCATION_DRIFT ||
            _abs(int256(aavePercent) - int256(uint256(target.aavePercent))) >
            MAX_ALLOCATION_DRIFT ||
            _abs(
                int256(uniswapPercent) - int256(uint256(target.uniswapPercent))
            ) >
            MAX_ALLOCATION_DRIFT);
    }

    /**
     * @dev Rebalance agent to target strategy allocation
     */
    function _rebalanceAgent(uint256 _agentId, string memory _reason) internal {
        // Harvest all yields first
        _harvestYields(_agentId);

        // Get current total value after yield harvest
        uint256 totalValue = agents[_agentId].currentValue;
        if (totalValue == 0) return;

        // Liquidate all positions and reallocate according to strategy
        _liquidateAllPositions(_agentId);
        _executeAIAllocation(_agentId, totalValue);

        agents[_agentId].lastRebalance = block.timestamp;
        emit RebalanceExecuted(_agentId, _reason);
    }

    // ============= YIELD MANAGEMENT =============

    /**
     * @dev Harvest yields from all protocols for an agent
     */
    function _harvestYields(uint256 _agentId) internal {
        uint256 totalHarvested = 0;

        // Harvest from each protocol (simulated for demo)
        totalHarvested += _harvestLidoYield(_agentId);
        totalHarvested += _harvestAaveYield(_agentId);
        totalHarvested += _harvestUniswapYield(_agentId);
        totalHarvested += _harvestCompoundYield(_agentId);
        totalHarvested += _harvestCurveYield(_agentId);

        if (totalHarvested > 0) {
            agents[_agentId].currentValue += totalHarvested;
            allocations[_agentId].cashReserve += totalHarvested; // Add harvested yield to cash reserve
            emit YieldHarvested(_agentId, totalHarvested);
        }
    }

    function _harvestLidoYield(
        uint256 _agentId
    ) internal view returns (uint256) {
        uint256 stakedAmount = allocations[_agentId].lidoStaking;
        if (stakedAmount == 0) return 0;
        return (stakedAmount * 4 * 100) / (365 * 10000); // Daily yield at 4% APY
    }

    function _harvestAaveYield(
        uint256 _agentId
    ) internal view returns (uint256) {
        uint256 lentAmount = allocations[_agentId].aaveLending;
        if (lentAmount == 0) return 0;
        return (lentAmount * 3 * 100) / (365 * 10000); // Daily yield at 3% APY
    }

    function _harvestUniswapYield(
        uint256 _agentId
    ) internal view returns (uint256) {
        uint256 lpAmount = allocations[_agentId].uniswapLP;
        if (lpAmount == 0) return 0;
        return (lpAmount * 8 * 100) / (365 * 10000); // Daily yield at 8% APY
    }

    function _harvestCompoundYield(
        uint256 _agentId
    ) internal view returns (uint256) {
        uint256 lentAmount = allocations[_agentId].compoundLending;
        if (lentAmount == 0) return 0;
        return (lentAmount * 35 * 10) / (365 * 10000); // Daily yield at 3.5% APY
    }

    function _harvestCurveYield(
        uint256 _agentId
    ) internal view returns (uint256) {
        uint256 lpAmount = allocations[_agentId].curveLP;
        if (lpAmount == 0) return 0;
        return (lpAmount * 7 * 100) / (365 * 10000); // Daily yield at 7% APY
    }

    // ============= LIQUIDATION FUNCTIONS =============

    function _liquidateForWithdrawal(
        uint256 _agentId,
        uint256 _amount
    ) internal {
        uint256 available = allocations[_agentId].cashReserve;
        uint256 needed = _amount;

        // Use cash reserve first
        if (available >= needed) {
            allocations[_agentId].cashReserve -= needed;
            return;
        }

        allocations[_agentId].cashReserve = 0;
        needed -= available;

        // Liquidate from lowest priority assets first
        uint256[] memory liquidationOrder = new uint256[](5);
        liquidationOrder[0] = allocations[_agentId].curveLP; // Highest risk first
        liquidationOrder[1] = allocations[_agentId].uniswapLP;
        liquidationOrder[2] = allocations[_agentId].compoundLending;
        liquidationOrder[3] = allocations[_agentId].aaveLending;
        liquidationOrder[4] = allocations[_agentId].lidoStaking; // Most stable last

        // Liquidate Curve first
        if (needed > 0 && allocations[_agentId].curveLP > 0) {
            uint256 toLiquidate = needed > allocations[_agentId].curveLP
                ? allocations[_agentId].curveLP
                : needed;
            allocations[_agentId].curveLP -= toLiquidate;
            needed -= toLiquidate;
        }

        // Continue with other protocols as needed...
        if (needed > 0 && allocations[_agentId].uniswapLP > 0) {
            uint256 toLiquidate = needed > allocations[_agentId].uniswapLP
                ? allocations[_agentId].uniswapLP
                : needed;
            allocations[_agentId].uniswapLP -= toLiquidate;
            needed -= toLiquidate;
        }

        // Add other liquidation logic as needed
    }

    function _liquidateAllPositions(uint256 _agentId) internal {
        // Convert all positions back to cash for reallocation
        uint256 totalValue = allocations[_agentId].lidoStaking +
            allocations[_agentId].aaveLending +
            allocations[_agentId].uniswapLP +
            allocations[_agentId].compoundLending +
            allocations[_agentId].curveLP +
            allocations[_agentId].cashReserve;

        // Reset all allocations
        delete allocations[_agentId];
        allocations[_agentId].cashReserve = totalValue;
    }

    // ============= STRATEGY INITIALIZATION =============

    function _initializeStrategies() internal {
        // Conservative: Low risk, stable returns
        // Focus on staking and established lending protocols
        strategyConfigs[Strategy.CONSERVATIVE] = StrategyConfig({
            lidoPercent: 500, // 50% - Lido staking (safest)
            aavePercent: 300, // 30% - Aave lending (established)
            uniswapPercent: 0, // 0%  - No LP risk
            compoundPercent: 100, // 10% - Compound lending
            curvePercent: 0, // 0%  - No LP risk
            cashPercent: 100 // 10% - Cash reserve
        });

        // Balanced: Medium risk, diversified allocation
        // Spread across multiple protocols with moderate LP exposure
        strategyConfigs[Strategy.BALANCED] = StrategyConfig({
            lidoPercent: 300, // 30% - Lido staking
            aavePercent: 250, // 25% - Aave lending
            uniswapPercent: 200, // 20% - Uniswap LP (moderate risk)
            compoundPercent: 150, // 15% - Compound lending
            curvePercent: 50, // 5%  - Curve pools
            cashPercent: 50 // 5%  - Cash reserve
        });

        // Aggressive: High risk, maximum yield seeking
        // Heavy allocation to LP positions and high-yield protocols
        strategyConfigs[Strategy.AGGRESSIVE] = StrategyConfig({
            lidoPercent: 200, // 20% - Lido staking (base stability)
            aavePercent: 150, // 15% - Aave lending
            uniswapPercent: 350, // 35% - Uniswap LP (high yield potential)
            compoundPercent: 100, // 10% - Compound lending
            curvePercent: 200, // 20% - Curve pools (high yield)
            cashPercent: 0 // 0%  - No cash reserve (full deployment)
        });
    }

    // ============= VIEW FUNCTIONS =============

    function getAgent(uint256 _agentId) external view returns (Agent memory) {
        return agents[_agentId];
    }

    /**
     * @dev Get agent information (alias for getAgent for backward compatibility)
     */
    function getAgentInfo(
        uint256 _agentId
    ) external view returns (Agent memory) {
        return agents[_agentId];
    }

    /**
     * @dev Get agent with USD values in real-time
     */
    function getAgentWithUSD(
        uint256 _agentId
    )
        external
        view
        returns (
            Agent memory agent,
            uint256 totalDepositedUSD,
            uint256 currentValueUSD,
            uint256 totalYieldUSD,
            uint256 ethPriceUSD
        )
    {
        agent = agents[_agentId];
        ethPriceUSD = getETHPriceUSD();

        if (ethPriceUSD > 0) {
            // Convert to USD cents (2 decimal places)
            // ETH has 18 decimals, price feed has 8 decimals
            // Result in USD cents: (ETH_wei * USD_price_8_decimals) / 10^(18+8-2) = / 10^24
            totalDepositedUSD = (agent.totalDeposited * ethPriceUSD) / 1e24;
            currentValueUSD = (agent.currentValue * ethPriceUSD) / 1e24;
            totalYieldUSD = (agent.totalYield * ethPriceUSD) / 1e24;
        }
    }

    /**
     * @dev Get current ETH price in USD from Chainlink price feed
     */
    function getETHPriceUSD() public view returns (uint256) {
        try priceFeed.latestRoundData() returns (
            uint80 roundId,
            int256 price,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        ) {
            roundId;
            startedAt;
            answeredInRound; // Silence unused variables

            // Check if price data is recent (within 1 hour)
            require(block.timestamp - updatedAt <= 3600, "Price data too old");
            require(price > 0, "Invalid price");

            return uint256(price); // Price in USD with 8 decimals (e.g., $2000.12345678)
        } catch {
            return 0; // Return 0 if price feed fails
        }
    }

    function getAllocation(
        uint256 _agentId
    ) external view returns (Allocation memory) {
        return allocations[_agentId];
    }

    /**
     * @dev Get allocation with USD values
     */
    function getAllocationWithUSD(
        uint256 _agentId
    )
        external
        view
        returns (
            Allocation memory allocation,
            uint256 lidoStakingUSD,
            uint256 aaveLendingUSD,
            uint256 uniswapLPUSD,
            uint256 compoundLendingUSD,
            uint256 curveLPUSD,
            uint256 cashReserveUSD,
            uint256 totalValueUSD
        )
    {
        allocation = allocations[_agentId];
        uint256 ethPrice = getETHPriceUSD();

        if (ethPrice > 0) {
            // Convert to USD cents (2 decimal places)
            lidoStakingUSD = (allocation.lidoStaking * ethPrice) / 1e24;
            aaveLendingUSD = (allocation.aaveLending * ethPrice) / 1e24;
            uniswapLPUSD = (allocation.uniswapLP * ethPrice) / 1e24;
            compoundLendingUSD = (allocation.compoundLending * ethPrice) / 1e24;
            curveLPUSD = (allocation.curveLP * ethPrice) / 1e24;
            cashReserveUSD = (allocation.cashReserve * ethPrice) / 1e24;
            totalValueUSD =
                lidoStakingUSD +
                aaveLendingUSD +
                uniswapLPUSD +
                compoundLendingUSD +
                curveLPUSD +
                cashReserveUSD;
        }
    }

    function getUserAgents(
        address _user
    ) external view returns (uint256[] memory) {
        return userAgents[_user];
    }

    function getStrategyConfig(
        Strategy _strategy
    ) external view returns (StrategyConfig memory) {
        return strategyConfigs[_strategy];
    }

    function getPerformanceMetrics(
        uint256 _agentId
    )
        external
        view
        returns (
            uint256 totalDeposited,
            uint256 currentValue,
            uint256 totalYield,
            uint256 performancePercent,
            uint256 daysActive
        )
    {
        Agent memory agent = agents[_agentId];
        totalDeposited = agent.totalDeposited;
        currentValue = agent.currentValue;
        totalYield = agent.totalYield;

        if (totalDeposited > 0) {
            performancePercent =
                ((currentValue * 10000) / totalDeposited) -
                10000; // Percentage with 2 decimals
        }

        daysActive = (block.timestamp - agent.createdAt) / 86400;
    }

    function getContractStats()
        external
        view
        returns (
            uint256 totalAgents,
            uint256 totalValueLockedInContract,
            uint256 totalValueLockedUSD,
            uint256 lastRebalanceTime,
            uint256 nextRebalanceIn,
            uint256 ethPriceUSD
        )
    {
        totalAgents = totalAgentsCreated;
        totalValueLockedInContract = totalValueLocked;
        lastRebalanceTime = lastGlobalRebalance;
        ethPriceUSD = getETHPriceUSD();

        if (ethPriceUSD > 0) {
            // Convert to USD cents (2 decimal places)
            totalValueLockedUSD = (totalValueLocked * ethPriceUSD) / 1e24;
        }

        uint256 timeSinceLastRebalance = block.timestamp - lastGlobalRebalance;
        nextRebalanceIn = timeSinceLastRebalance >= rebalanceInterval
            ? 0
            : rebalanceInterval - timeSinceLastRebalance;
    }

    // ============= UTILITY FUNCTIONS =============

    function _abs(int256 x) internal pure returns (uint256) {
        return x >= 0 ? uint256(x) : uint256(-x);
    }

    // ============= ADMIN FUNCTIONS =============

    function setRebalanceInterval(uint256 _interval) external onlyOwner {
        require(_interval >= 300, "Minimum 5 minutes"); // Prevent spam
        require(_interval <= 86400, "Maximum 24 hours"); // Ensure regular rebalancing
        rebalanceInterval = _interval;
    }

    function emergencyPause(uint256 _agentId) external onlyOwner {
        agents[_agentId].isActive = false;
    }

    function emergencyUnpause(uint256 _agentId) external onlyOwner {
        agents[_agentId].isActive = true;
    }

    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev Emergency withdraw specific agent funds (for owner)
     * @param _agentId The agent to withdraw from
     * @param _to Address to send funds to
     */
    function emergencyWithdraw(
        uint256 _agentId,
        address _to
    ) external nonReentrant {
        require(agents[_agentId].owner == msg.sender, "Not agent owner");
        require(_to != address(0), "Invalid address");

        uint256 amount = agents[_agentId].currentValue;
        require(amount > 0, "No funds to withdraw");

        agents[_agentId].currentValue = 0;
        totalValueLocked -= amount;

        payable(_to).transfer(amount);
    }

    // ============= RECEIVE FUNCTION =============

    receive() external payable {
        // Allow contract to receive ETH
    }
}
