// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@matterlabs/zksync-contracts/contracts/access/Ownable.sol";
import "@matterlabs/zksync-contracts/contracts/token/ERC20/IERC20.sol";
import "@matterlabs/zksync-contracts/contracts/security/ReentrancyGuard.sol";

contract SwearJar is Ownable, ReentrancyGuard {
    IERC20 public cussToken;
    uint256 public cleanseOdds = 10; // 10% chance to cleanse
    uint256 public minWithdrawAmount = 10 * 10**18; // 10 $CUSS minimum withdrawal
    uint256 public mercyOdds = 1; // 0.1% chance (1 in 1000) to receive mercy
    uint256 public lastMercyTimestamp;
    uint256 public burnRatio = 50; // 50% of cleansed tokens are burned, 50% stay in contract
    uint256 public mercyPercentage = 50; // 50% of cleansed tokens returned via mercy
    uint256 public mercyCooldownHours = 24; // Default 24 hours cooldown
    bool public paused = false;
    bool public mercyEnabled = true; // Flag to enable/disable mercy system
    
    // Constants for limits
    uint256 public constant MAX_WITHDRAW_AMOUNT = 1000000 * 10**18; // 1M $CUSS
    uint256 public constant MAX_COOLDOWN_HOURS = 168; // 1 week
    
    // Burn address for cleansed tokens
    address public constant BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
    
    // Contract's accumulated cleansed tokens
    uint256 public contractCleansedTokens;
    
    // Global stats
    uint256 public totalMercyGrants;
    uint256 public totalMercyAmount;
    uint256 public totalDeposits; // Track total deposited tokens
    
    // User balances
    mapping(address => uint256) public deposited;
    mapping(address => uint256) public cleansed;
    mapping(address => uint256) public mercyReceived; // Number of times mercy was received
    mapping(address => uint256) public mercyAmountReceived; // Total amount received from mercy

    event Deposited(address indexed user, uint256 amount, bool wasCleansed);
    event Withdrawn(address indexed user, uint256 amount);
    event TokensCleansed(address indexed user, uint256 burnAmount, uint256 contractAmount);
    event MercyGranted(address indexed user, uint256 amount);
    event BurnRatioUpdated(uint256 newRatio);
    event MercyPercentageUpdated(uint256 newPercentage);
    event MercyCooldownUpdated(uint256 newHours);
    event CleanseOddsUpdated(uint256 newOdds);
    event MinWithdrawAmountUpdated(uint256 newAmount);
    event MercyOddsUpdated(uint256 newOdds);
    event Paused(address account);
    event Unpaused(address account);
    event TokensRecovered(address token, uint256 amount);
    event MercyEnabled(bool enabled);
    event OwnerWithdrawn(uint256 amount);

    constructor(address _cussToken) Ownable(msg.sender) {
        cussToken = IERC20(_cussToken);
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    function _safeTransfer(IERC20 token, address to, uint256 amount) internal {
        (bool success, bytes memory data) = address(token).call(
            abi.encodeWithSelector(token.transfer.selector, to, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "Transfer failed");
    }

    function _safeTransferFrom(IERC20 token, address from, address to, uint256 amount) internal {
        (bool success, bytes memory data) = address(token).call(
            abi.encodeWithSelector(token.transferFrom.selector, from, to, amount)
        );
        require(success && (data.length == 0 || abi.decode(data, (bool))), "TransferFrom failed");
    }

    function _random(uint256 max) internal view returns (uint256) {
        return uint256(
            keccak256(
                abi.encodePacked(
                    block.prevrandao,
                    block.timestamp,
                    msg.sender
                )
            )
        ) % max;
    }

    function _checkAndGrantMercy(address user) internal returns (bool) {
        // Check if mercy is enabled and enough time has passed since last mercy
        if (!mercyEnabled || block.timestamp < lastMercyTimestamp + (mercyCooldownHours * 1 hours)) {
            return false;
        }

        // Check if user has cleansed tokens
        if (cleansed[user] == 0) {
            return false;
        }

        // Check mercy odds
        if (_random(1000) >= mercyOdds) {
            return false;
        }

        uint256 mercyAmount = (cleansed[user] * mercyPercentage) / 100;
        
        if (mercyAmount == 0) {
            return false;
        }

        // Check if contract has enough tokens for mercy payout
        uint256 contractBalance = cussToken.balanceOf(address(this));
        
        // Ensure we have enough tokens for both mercy and deposits
        if (contractBalance < mercyAmount + totalDeposits) {
            return false;
        }
        
        // Update tracking
        lastMercyTimestamp = block.timestamp;
        mercyReceived[user]++;
        mercyAmountReceived[user] += mercyAmount;
        
        // Update global stats
        totalMercyGrants++;
        totalMercyAmount += mercyAmount;
        
        // Transfer tokens using safe transfer
        _safeTransfer(cussToken, user, mercyAmount);
        contractCleansedTokens -= mercyAmount;
        
        emit MercyGranted(user, mercyAmount);
        return true;
    }

    function deposit(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        _safeTransferFrom(cussToken, msg.sender, address(this), amount);

        bool shouldCleanse = _random(100) < cleanseOdds;
        
        if (shouldCleanse) {
            // Calculate amounts based on burn ratio
            uint256 burnAmount = (amount * burnRatio) / 100;
            uint256 contractAmount = amount - burnAmount;
            
            // Send tokens to burn address
            _safeTransfer(cussToken, BURN_ADDRESS, burnAmount);
            
            // Other portion stays in contract
            contractCleansedTokens += contractAmount;
            
            // Update user's cleansed amount tracking
            cleansed[msg.sender] += amount;
            
            // Check for mercy after cleansing
            _checkAndGrantMercy(msg.sender);
            
            emit TokensCleansed(msg.sender, burnAmount, contractAmount);
        } else {
            deposited[msg.sender] += amount;
            totalDeposits += amount; // Track total deposits
        }
        
        emit Deposited(msg.sender, amount, shouldCleanse);
    }

    function withdraw() external nonReentrant {
        uint256 amount = deposited[msg.sender];
        require(amount >= minWithdrawAmount, "Below minimum withdrawal amount");
        
        _safeTransfer(cussToken, msg.sender, amount);
        
        // Update state after successful transfer
        deposited[msg.sender] = 0;
        totalDeposits -= amount; // Update total deposits
        
        emit Withdrawn(msg.sender, amount);
    }

    function ownerWithdraw(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 contractBalance = cussToken.balanceOf(address(this));
        
        // Ensure we have enough tokens for both withdrawal and deposits
        require(contractBalance >= amount + totalDeposits, "Insufficient contract balance");
        
        _safeTransfer(cussToken, owner(), amount);
        emit OwnerWithdrawn(amount);
    }

    function setMercyEnabled(bool _enabled) external onlyOwner {
        mercyEnabled = _enabled;
        emit MercyEnabled(_enabled);
    }

    function setCleanseOdds(uint256 _cleanseOdds) external onlyOwner {
        require(_cleanseOdds <= 100, "Percentage must be <= 100");
        cleanseOdds = _cleanseOdds;
        emit CleanseOddsUpdated(_cleanseOdds);
    }

    function setMinWithdrawAmount(uint256 _minWithdrawAmount) external onlyOwner {
        require(_minWithdrawAmount <= MAX_WITHDRAW_AMOUNT, "Amount too high");
        minWithdrawAmount = _minWithdrawAmount;
        emit MinWithdrawAmountUpdated(_minWithdrawAmount);
    }

    function setMercyOdds(uint256 _mercyOdds) external onlyOwner {
        mercyOdds = _mercyOdds;
        emit MercyOddsUpdated(_mercyOdds);
    }

    function setBurnRatio(uint256 _burnRatio) external onlyOwner {
        require(_burnRatio <= 100, "Percentage must be <= 100");
        burnRatio = _burnRatio;
        emit BurnRatioUpdated(_burnRatio);
    }

    function setMercyPercentage(uint256 _mercyPercentage) external onlyOwner {
        require(_mercyPercentage <= 100, "Percentage must be <= 100");
        mercyPercentage = _mercyPercentage;
        emit MercyPercentageUpdated(_mercyPercentage);
    }

    function setMercyCooldownHours(uint256 _hours) external onlyOwner {
        require(_hours > 0, "Cooldown must be greater than 0");
        require(_hours <= MAX_COOLDOWN_HOURS, "Cooldown too long");
        mercyCooldownHours = _hours;
        emit MercyCooldownUpdated(_hours);
    }

    function pause() external onlyOwner {
        require(!paused, "Already paused");
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        require(paused, "Not paused");
        paused = false;
        emit Unpaused(msg.sender);
    }

    function recoverTokens(IERC20 token, uint256 amount) external onlyOwner {
        require(token != cussToken, "Cannot recover $CUSS tokens");
        _safeTransfer(token, owner(), amount);
        emit TokensRecovered(address(token), amount);
    }

    function getUserStats(address user) external view returns (
        uint256 depositedAmount,
        uint256 cleansedAmount,
        uint256 mercyCount,
        uint256 mercyAmount
    ) {
        return (
            deposited[user],
            cleansed[user],
            mercyReceived[user],
            mercyAmountReceived[user]
        );
    }

    function getContractStats() external view returns (
        uint256 totalDeposited,
        uint256 totalCleansed,
        uint256 totalMercyGrants,
        uint256 totalMercyAmount
    ) {
        return (
            totalDeposits,
            contractCleansedTokens,
            totalMercyGrants,
            totalMercyAmount
        );
    }

    function getDeposited(address user) external view returns (uint256) {
        return deposited[user];
    }

    function getCleansed(address user) external view returns (uint256) {
        return cleansed[user];
    }

    function getMercyReceived(address user) external view returns (uint256) {
        return mercyReceived[user];
    }

    function getMercyAmountReceived(address user) external view returns (uint256) {
        return mercyAmountReceived[user];
    }

    function getMinWithdrawAmount() external view returns (uint256) {
        return minWithdrawAmount;
    }

    function getCleanseOdds() external view returns (uint256) {
        return cleanseOdds;
    }

    function getMercyOdds() external view returns (uint256) {
        return mercyOdds;
    }

    function getBurnRatio() external view returns (uint256) {
        return burnRatio;
    }

    function getMercyPercentage() external view returns (uint256) {
        return mercyPercentage;
    }

    function getMercyCooldownHours() external view returns (uint256) {
        return mercyCooldownHours;
    }

    function isMercyEnabled() external view returns (bool) {
        return mercyEnabled;
    }

    function checkApproval(address user, uint256 amount) external view returns (bool) {
        return cussToken.allowance(user, address(this)) >= amount;
    }
} 