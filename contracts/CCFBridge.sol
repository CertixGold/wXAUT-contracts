// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

// Interface for the XAUT token
interface IERC20Token {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

// Cross-chain Foundation Bridge
contract CCFBridge is Initializable, OwnableUpgradeable {
    // Mapping to store minimum fees for each blockchain destination by token address
    mapping(uint256 => uint256) public minimumFees; 
    // Protocol fee percentage with four decimal places (e.g., 10000 represents 1%)
    uint256 public protocolFeePercentage;
    // Total accumulated protocol fees
    mapping(address => uint256) public totalProtocolFees;
    // Total accumulated bridge fees
    mapping(address => uint256) public totalBridgeFees;
    // Total locked CCFToken balance
    mapping(address => uint256) public lockedBalance;
    //Blockchain which hosts the contract
    uint256 contractBlockchainIndex;
    //Blockchain which hosts the contract
    uint256 protocolFeeDivider;

    // Event emitted when CCFToken is locked
    event Locked(address token, address indexed user, uint256 amount, uint256 protocolFee, uint256 bridgeFee, uint256 blockchainIndex);
    // Event emitted when CCFToken is unlocked
    event Unlocked(address token, address indexed user, uint256 amount, uint256 blockchainIndex);

    // Initialize the contract with the CCFToken token address
    function initialize(uint256 _contractBlockchainIndex) public initializer {
        __Ownable_init(msg.sender);

        updateProtocolFeePercentage(3000); //0.3%
        updateProtocolFeeDivider(1000000);
        updateContractBlockchainIndex(_contractBlockchainIndex);
    }

    // Lock CCF tokens with specified bridge and protocol fees
    function lock(address _token, uint256 amount, uint256 bridgeFee, uint256 blockchainIndex) external {
        require(blockchainIndex != contractBlockchainIndex, "Choose another blockchain");
        require(bridgeFee >= minimumFees[blockchainIndex], "Bridge fee is too low");

        uint256 protocolFee = (amount * protocolFeePercentage) / protocolFeeDivider; // Calculate protocol fee
        uint256 totalDeduction = bridgeFee + protocolFee;
        require(amount > totalDeduction, "Insufficient amount after fees");

        require(IERC20Token(_token).transferFrom(msg.sender, address(this), amount), "Transfer failed");
        lockedBalance[_token] += (amount - totalDeduction);
        totalProtocolFees[_token] += protocolFee;
        totalBridgeFees[_token] += bridgeFee;

        emit Locked(_token, msg.sender, amount - totalDeduction, protocolFee, bridgeFee, blockchainIndex);
    }

    // Unlock CCF tokens
    function unlock(address _token, address user, uint256 amount, uint256 blockchainIndex) external onlyOwner {
        require(lockedBalance[_token] >= amount, "Insufficient locked balance");
        require(IERC20Token(_token).transfer(user, amount), "Transfer failed");
        lockedBalance[_token] -= amount;

        emit Unlocked(_token, user, amount, blockchainIndex);
    }

    // Update minimum fee for a specific blockchain
    function updateMinimumFee(uint256 blockchainIndex, uint256 fee) public onlyOwner {
        minimumFees[blockchainIndex] = fee;
    }

    // Update minimum fees by batch
    function updateMinimumFeesBatch(uint256[] memory blockchainIndexes, uint256[] memory fees) external onlyOwner {
        require(blockchainIndexes.length == fees.length, "Lengths of arrays do not match");

        for (uint256 i = 0; i < blockchainIndexes.length; i++) {
            updateMinimumFee(blockchainIndexes[i], fees[i]);
        }
    }

    // Update the protocol fee percentage
    function updateProtocolFeePercentage(uint256 _protocolFeePercentage) public onlyOwner {
        protocolFeePercentage = _protocolFeePercentage;
    }

    // Update the contract blockchainIndex
    function updateContractBlockchainIndex(uint256 _contractBlockchainIndex) public onlyOwner {
        contractBlockchainIndex = _contractBlockchainIndex;
    }

    // Update the protocolFee divider
    function updateProtocolFeeDivider(uint256 _protocolFeeDivider) public onlyOwner {
        protocolFeeDivider = _protocolFeeDivider;
    }
    

    // Withdraw accumulated protocol fees
    function withdrawProtocolFees(address _token, address receiver, uint256 amount) external onlyOwner {
        require(totalProtocolFees[_token] >= amount, "Insufficient protocolFee balance");
        require(IERC20Token(_token).transfer(receiver, amount), "Transfer failed");
        totalProtocolFees[_token] -= amount;
    }

    // Withdraw accumulated bridge fees
    function withdrawBridgeFees(address _token, address receiver, uint256 amount) external onlyOwner {
        require(totalBridgeFees[_token] >= amount, "Insufficient bridgeFee balance");
        require(IERC20Token(_token).transfer(receiver, amount), "Transfer failed");
        totalBridgeFees[_token] -= amount;
    }
}