// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

//Cross-Chain Foundation Token
contract CCFToken is Initializable, ERC20Upgradeable, ERC20BurnableUpgradeable, OwnableUpgradeable {
    // Mapping to store minimum fees for each blockchain
    mapping(uint256 => uint256) public minimumFees;
    // Protocol fee percentage with four decimal places (e.g., 10000 represents 1%)
    uint256 public protocolFeePercentage;
    // Total accumulated protocol fees
    uint256 public totalProtocolFees;
    // Total accumulated bridge fees
    uint256 public totalBridgeFees;
    //Blockchain which hosts the contract
    uint256 contractBlockchainIndex;

    event BridgeEvent(address indexed user, uint256 amount, uint256 protocolFee, uint256 bridgeFee, uint256 blockchainIndex);

    constructor() {}

    function initialize(string memory _name, string memory _symbol, uint256 _contractBlockchainIndex) public initializer {
        __ERC20_init(_name, _symbol); // Initialisation du nom et du symbole du token
        __ERC20Burnable_init(); // Initialisation de ERC20Burnable
        __Ownable_init();

        protocolFeePercentage = 2000; //0.2%
        minimumFees[0] = 150000000000000;
        updateContractBlockchainIndex(_contractBlockchainIndex);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    // Burnt CCF tokens with specified bridge and protocol fees
    function bridge(uint256 amount, uint256 bridgeFee, uint256 blockchainIndex) external {
        require(blockchainIndex != contractBlockchainIndex, "Choose another blockchain");
        require(bridgeFee >= minimumFees[blockchainIndex], "Bridge fee is too low");

        uint256 protocolFee = (amount * protocolFeePercentage) / 1000000; // Calculate protocol fee
        uint256 totalDeduction = bridgeFee + protocolFee;

        require(transfer(address(this), totalDeduction), "Transfer failed");
        totalProtocolFees += protocolFee;
        totalBridgeFees += bridgeFee;

        uint256 amountToBurn = amount - totalDeduction;

        burn(amountToBurn);
        emit BridgeEvent(_msgSender(), amountToBurn, protocolFee, bridgeFee, blockchainIndex);
    }

    // Update minimum fee for a specific blockchain
    function updateMinimumFee(uint256 blockchainIndex, uint256 fee) external onlyOwner {
        minimumFees[blockchainIndex] = fee;
    }

    // Update the protocol fee percentage
    function updateProtocolFeePercentage(uint256 _protocolFeePercentage) external onlyOwner {
        protocolFeePercentage = _protocolFeePercentage;
    }

    // Update the contract blockchainIndex
    function updateContractBlockchainIndex(uint256 _contractBlockchainIndex) public onlyOwner {
        contractBlockchainIndex = _contractBlockchainIndex;
    }

    // Withdraw accumulated protocol fees
    function withdrawProtocolFees(address receiver, uint256 amount) external onlyOwner {
        require(totalProtocolFees >= amount, "Insufficient protocolFee balance");
        require(transfer(receiver, amount), "Transfer failed");
        totalProtocolFees -= amount;
    }

    // Withdraw accumulated bridge fees
    function withdrawBridgeFees(address receiver, uint256 amount) external onlyOwner {
        require(totalBridgeFees >= amount, "Insufficient bridgeFee balance");
        require(transfer(receiver, amount), "Transfer failed");
        totalBridgeFees -= amount;
    }
}