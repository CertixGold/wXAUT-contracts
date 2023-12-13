// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

// Interface for the XAUT token
interface IXAUT {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

// Bridge contract for XAUT tokens
contract XAUTEthereumBridge is Initializable, OwnableUpgradeable {
    IXAUT public xautToken;

    // Mapping to store minimum fees for each blockchain
    mapping(uint256 => uint256) public minimumFees;
    // Protocol fee percentage with four decimal places (e.g., 10000 represents 1%)
    uint256 public protocolFeePercentage;
    // Total accumulated protocol fees
    uint256 public totalProtocolFees;
    // Total accumulated bridge fees
    uint256 public totalBridgeFees;
    // Total locked XAUT balance
    uint256 public lockedBalance;

    // Event emitted when XAUT is locked
    event Locked(address indexed user, uint256 amount, uint256 protocolFee, uint256 bridgeFee, uint256 blockchainIndex);
    // Event emitted when XAUT is unlocked
    event Unlocked(address indexed user, uint256 amount, uint256 blockchainIndex);

    // Initialize the contract with the XAUT token address
    function initialize(address _xautTokenAddress) public initializer {
        __Ownable_init(msg.sender);
        xautToken = IXAUT(_xautTokenAddress);

        protocolFeePercentage = 2000; //0.2%
    }

    // Lock XAUT tokens with specified bridge and protocol fees
    function lockXAUT(uint256 amount, uint256 bridgeFee, uint256 blockchainIndex) external {
        require(bridgeFee >= minimumFees[blockchainIndex], "Bridge fee is too low");

        uint256 protocolFee = (amount * protocolFeePercentage) / 1000000; // Calculate protocol fee
        uint256 totalDeduction = bridgeFee + protocolFee;
        require(amount > totalDeduction, "Insufficient amount after fees");

        require(xautToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        lockedBalance += (amount - totalDeduction);
        totalProtocolFees += protocolFee;
        totalBridgeFees += bridgeFee;

        emit Locked(msg.sender, amount - totalDeduction, protocolFee, bridgeFee, blockchainIndex);
    }

    // Unlock XAUT tokens
    function unlockXAUT(address user, uint256 amount, uint256 blockchainIndex) external onlyOwner {
        require(lockedBalance >= amount, "Insufficient locked balance");
        require(xautToken.transfer(user, amount), "Transfer failed");
        lockedBalance -= amount;

        emit Unlocked(user, amount, blockchainIndex);
    }

    // Update minimum fee for a specific blockchain
    function updateMinimumFee(uint256 blockchainIndex, uint256 fee) external onlyOwner {
        minimumFees[blockchainIndex] = fee;
    }

    // Update the protocol fee percentage
    function updateProtocolFeePercentage(uint256 _protocolFeePercentage) external onlyOwner {
        protocolFeePercentage = _protocolFeePercentage;
    }

    // Withdraw accumulated protocol fees
    function withdrawProtocolFees(address receiver, uint256 amount) external onlyOwner {
        require(totalProtocolFees >= amount, "Insufficient protocolFee balance");
        require(xautToken.transfer(receiver, amount), "Transfer failed");
        totalProtocolFees -= amount;
    }

    // Withdraw accumulated bridge fees
    function withdrawBridgeFees(address receiver, uint256 amount) external onlyOwner {
        require(totalBridgeFees >= amount, "Insufficient bridgeFee balance");
        require(xautToken.transfer(receiver, amount), "Transfer failed");
        totalBridgeFees -= amount;
    }
}