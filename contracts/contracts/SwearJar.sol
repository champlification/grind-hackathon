// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@matterlabs/zksync-contracts/contracts/access/Ownable.sol";
import "@matterlabs/zksync-contracts/contracts/token/ERC20/IERC20.sol";
import "@matterlabs/zksync-contracts/contracts/security/ReentrancyGuard.sol";

contract SwearJar is Ownable, ReentrancyGuard {
    IERC20 public grindToken;
    uint256 public burnPercentage = 10; // 10% chance to burn
    uint256 public minWithdrawAmount = 100 * 10**18; // 100 GRIND tokens
    uint256 public totalBurned;
    uint256 public totalDonated;
    address public charityAddress;

    mapping(address => uint256) public userJars;
    mapping(address => uint256) public userTotalDeposited;
    mapping(address => uint256) public userTotalBurned;

    event Deposited(address indexed user, uint256 amount, bool burned);
    event Withdrawn(address indexed user, uint256 amount);
    event Donated(uint256 amount);
    event Burned(uint256 amount);

    constructor(address _grindToken, address _charityAddress) Ownable(msg.sender) {
        grindToken = IERC20(_grindToken);
        charityAddress = _charityAddress;
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(grindToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        bool shouldBurn = (uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % 100) < burnPercentage;
        
        if (shouldBurn) {
            uint256 burnAmount = amount / 2;
            uint256 donateAmount = amount - burnAmount;
            
            totalBurned += burnAmount;
            totalDonated += donateAmount;
            userTotalBurned[msg.sender] += amount;
            
            require(grindToken.transfer(charityAddress, donateAmount), "Charity transfer failed");
            emit Donated(donateAmount);
            emit Burned(burnAmount);
            emit Deposited(msg.sender, amount, true);
        } else {
            userJars[msg.sender] += amount;
            userTotalDeposited[msg.sender] += amount;
            emit Deposited(msg.sender, amount, false);
        }
    }

    function withdraw() external nonReentrant {
        uint256 amount = userJars[msg.sender];
        require(amount >= minWithdrawAmount, "Amount below minimum withdrawal");
        
        userJars[msg.sender] = 0;
        require(grindToken.transfer(msg.sender, amount), "Withdrawal failed");
        
        emit Withdrawn(msg.sender, amount);
    }

    function setBurnPercentage(uint256 _burnPercentage) external onlyOwner {
        require(_burnPercentage <= 100, "Percentage must be <= 100");
        burnPercentage = _burnPercentage;
    }

    function setMinWithdrawAmount(uint256 _minWithdrawAmount) external onlyOwner {
        minWithdrawAmount = _minWithdrawAmount;
    }

    function setCharityAddress(address _charityAddress) external onlyOwner {
        charityAddress = _charityAddress;
    }

    function getUserStats(address user) external view returns (
        uint256 jarBalance,
        uint256 totalDeposited,
        uint256 totalBurned
    ) {
        return (
            userJars[user],
            userTotalDeposited[user],
            userTotalBurned[user]
        );
    }
} 