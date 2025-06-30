const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DeFi Yield Optimizer System", function () {
  let simpleDeFiOptimizer;
  let crossChainManager;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy SimpleDeFiOptimizer
    const SimpleDeFiOptimizer = await ethers.getContractFactory("SimpleDeFiOptimizer");
    simpleDeFiOptimizer = await SimpleDeFiOptimizer.deploy();

    // Deploy CrossChainYieldManager
    const CrossChainYieldManager = await ethers.getContractFactory("CrossChainYieldManager");
    crossChainManager = await CrossChainYieldManager.deploy();
  });

  describe("SimpleDeFiOptimizer Tests", function () {
    it("Should deploy with initial strategies", async function () {
      expect(await simpleDeFiOptimizer.strategyCount()).to.equal(4);
      
      const strategy0 = await simpleDeFiOptimizer.getStrategy(0);
      expect(strategy0.name).to.equal("Stablecoin Farming");
      expect(strategy0.expectedYield).to.equal(5);
      expect(strategy0.riskScore).to.equal(10);
    });

    it("Should create a portfolio successfully", async function () {
      const riskTolerance = 50;
      const portfolioValue = ethers.parseEther("1.0");

      await expect(
        simpleDeFiOptimizer.connect(user1).createPortfolio(riskTolerance, { value: portfolioValue })
      ).to.emit(simpleDeFiOptimizer, "PortfolioCreated")
       .withArgs(user1.address, portfolioValue);

      const portfolioInfo = await simpleDeFiOptimizer.getPortfolioInfo(user1.address);
      expect(portfolioInfo.totalValue).to.equal(portfolioValue);
      expect(portfolioInfo.riskTolerance).to.equal(riskTolerance);
      expect(portfolioInfo.activeStrategies.length).to.be.greaterThan(0);
    });

    it("Should add new strategy", async function () {
      await expect(
        simpleDeFiOptimizer.addStrategy("Test Strategy", ethers.ZeroAddress, 15, 40)
      ).to.emit(simpleDeFiOptimizer, "StrategyAdded")
       .withArgs(4, "Test Strategy", 15);

      expect(await simpleDeFiOptimizer.strategyCount()).to.equal(5);
      
      const newStrategy = await simpleDeFiOptimizer.getStrategy(4);
      expect(newStrategy.name).to.equal("Test Strategy");
      expect(newStrategy.expectedYield).to.equal(15);
      expect(newStrategy.riskScore).to.equal(40);
    });

    it("Should record agent decisions", async function () {
      // First create a portfolio
      await simpleDeFiOptimizer.connect(user1).createPortfolio(50, { value: ethers.parseEther("1.0") });

      await expect(
        simpleDeFiOptimizer.connect(user1).recordAgentDecision(
          "portfolio_manager",
          "Increase allocation to strategy 2",
          85,
          ethers.keccak256(ethers.toUtf8Bytes("test_data"))
        )
      ).to.emit(simpleDeFiOptimizer, "AgentDecisionRecorded")
       .withArgs(user1.address, "portfolio_manager", "Increase allocation to strategy 2");

      const decisions = await simpleDeFiOptimizer.getAgentDecisions(user1.address);
      expect(decisions.length).to.equal(1);
      expect(decisions[0].agentType).to.equal("portfolio_manager");
      expect(decisions[0].confidence).to.equal(85);
    });

    it("Should handle portfolio rebalancing", async function () {
      await simpleDeFiOptimizer.connect(user1).createPortfolio(70, { value: ethers.parseEther("2.0") });

      await expect(
        simpleDeFiOptimizer.connect(user1).rebalancePortfolio()
      ).to.emit(simpleDeFiOptimizer, "RebalanceExecuted");
    });

    it("Should simulate yield generation", async function () {
      await simpleDeFiOptimizer.connect(user1).createPortfolio(50, { value: ethers.parseEther("1.0") });
      
      const yieldAmount = ethers.parseEther("0.1");
      await expect(
        simpleDeFiOptimizer.simulateYieldGeneration(user1.address, yieldAmount)
      ).to.emit(simpleDeFiOptimizer, "YieldHarvested")
       .withArgs(user1.address, yieldAmount);

      const portfolioInfo = await simpleDeFiOptimizer.getPortfolioInfo(user1.address);
      expect(portfolioInfo.totalYield).to.equal(yieldAmount);
      expect(portfolioInfo.totalValue).to.equal(ethers.parseEther("1.1"));
    });

    it("Should handle emergency withdrawal", async function () {
      const portfolioValue = ethers.parseEther("1.0");
      await simpleDeFiOptimizer.connect(user1).createPortfolio(50, { value: portfolioValue });

      const balanceBefore = await ethers.provider.getBalance(user1.address);
      
      const tx = await simpleDeFiOptimizer.connect(user1).emergencyWithdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(user1.address);
      expect(balanceAfter).to.be.closeTo(balanceBefore + portfolioValue - gasUsed, ethers.parseEther("0.01"));

      const portfolioInfo = await simpleDeFiOptimizer.getPortfolioInfo(user1.address);
      expect(portfolioInfo.totalValue).to.equal(0);
    });

    it("Should handle adding funds to existing portfolio", async function () {
      await simpleDeFiOptimizer.connect(user1).createPortfolio(50, { value: ethers.parseEther("1.0") });
      
      const additionalFunds = ethers.parseEther("0.5");
      await simpleDeFiOptimizer.connect(user1).addFunds({ value: additionalFunds });

      const portfolioInfo = await simpleDeFiOptimizer.getPortfolioInfo(user1.address);
      expect(portfolioInfo.totalValue).to.equal(ethers.parseEther("1.5"));
    });
  });

  describe("CrossChainYieldManager Tests", function () {
    it("Should deploy with initial chains", async function () {
      const chains = await crossChainManager.getAllSupportedChains();
      expect(chains.chainSelectors.length).to.equal(3);
      expect(chains.names[0]).to.equal("Ethereum");
      expect(chains.names[1]).to.equal("Polygon");
      expect(chains.names[2]).to.equal("Avalanche");
    });

    it("Should update portfolio balance", async function () {
      const chainSelector = 1; // Ethereum
      const newBalance = ethers.parseEther("2.5");

      await expect(
        crossChainManager.connect(user1).updatePortfolioBalance(chainSelector, newBalance)
      ).to.emit(crossChainManager, "PortfolioUpdated")
       .withArgs(user1.address, chainSelector, newBalance);

      const portfolio = await crossChainManager.getCrossChainPortfolio(user1.address);
      expect(portfolio.totalValue).to.equal(newBalance);
    });

    it("Should simulate rebalancing", async function () {
      // First update some balances
      await crossChainManager.connect(user1).updatePortfolioBalance(1, ethers.parseEther("5.0"));
      
      const targetChains = [1, 137];
      const targetAmounts = [ethers.parseEther("2.0"), ethers.parseEther("3.0")];

      const simulation = await crossChainManager.connect(user1).simulateRebalance(targetChains, targetAmounts);
      expect(simulation.totalRequired).to.equal(ethers.parseEther("5.0"));
      expect(simulation.totalAvailable).to.equal(ethers.parseEther("5.0"));
      expect(simulation.canExecute).to.be.true;
    });

    it("Should execute rebalancing", async function () {
      // Setup initial balance
      await crossChainManager.connect(user1).updatePortfolioBalance(1, ethers.parseEther("5.0"));
      
      const targetChains = [1, 137];
      const targetAmounts = [ethers.parseEther("2.0"), ethers.parseEther("3.0")];

      await expect(
        crossChainManager.connect(user1).executeRebalance(targetChains, targetAmounts)
      ).to.emit(crossChainManager, "CrossChainRebalance")
       .withArgs(user1.address, targetChains, targetAmounts);
    });

    it("Should harvest yield", async function () {
      const chainSelector = 1;
      
      // Simulate yield generation (only owner can do this)
      await crossChainManager.simulateYieldGeneration(user1.address, chainSelector, ethers.parseEther("0.5"));
      
      await expect(
        crossChainManager.connect(user1).harvestYield(chainSelector)
      ).to.emit(crossChainManager, "YieldHarvested")
       .withArgs(user1.address, chainSelector, ethers.parseEther("0.5"));
    });

    it("Should provide optimal allocation suggestions", async function () {
      // Setup a portfolio
      await crossChainManager.connect(user1).updatePortfolioBalance(1, ethers.parseEther("3.0"));
      
      const allocation = await crossChainManager.connect(user1).getOptimalAllocation(user1.address);
      expect(allocation.recommendedChains.length).to.equal(3);
      expect(allocation.reason).to.equal("Diversified allocation across all active chains");
    });
  });

  describe("Integration Tests", function () {
    it("Should handle multiple users with different portfolios", async function () {
      // User 1: Conservative portfolio
      await simpleDeFiOptimizer.connect(user1).createPortfolio(30, { value: ethers.parseEther("2.0") });
      
      // User 2: Aggressive portfolio  
      await simpleDeFiOptimizer.connect(user2).createPortfolio(80, { value: ethers.parseEther("1.5") });

      const user1Portfolio = await simpleDeFiOptimizer.getPortfolioInfo(user1.address);
      const user2Portfolio = await simpleDeFiOptimizer.getPortfolioInfo(user2.address);

      expect(user1Portfolio.riskTolerance).to.equal(30);
      expect(user2Portfolio.riskTolerance).to.equal(80);
      expect(user1Portfolio.totalValue).to.equal(ethers.parseEther("2.0"));
      expect(user2Portfolio.totalValue).to.equal(ethers.parseEther("1.5"));
    });

    it("Should demonstrate cross-chain and single-chain integration", async function () {
      // Create portfolio in main optimizer
      await simpleDeFiOptimizer.connect(user1).createPortfolio(50, { value: ethers.parseEther("3.0") });
      
      // Set up cross-chain balances
      await crossChainManager.connect(user1).updatePortfolioBalance(1, ethers.parseEther("1.5"));
      await crossChainManager.connect(user1).updatePortfolioBalance(137, ethers.parseEther("1.5"));
      
      // Check both portfolios
      const mainPortfolio = await simpleDeFiOptimizer.getPortfolioInfo(user1.address);
      const crossChainPortfolio = await crossChainManager.getCrossChainPortfolio(user1.address);
      
      expect(mainPortfolio.totalValue).to.equal(ethers.parseEther("3.0"));
      expect(crossChainPortfolio.totalValue).to.equal(ethers.parseEther("3.0"));
    });
  });

  // Helper function to get current timestamp
  async function getCurrentTimestamp() {
    const blockNumber = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNumber);
    return block.timestamp;
  }
});
