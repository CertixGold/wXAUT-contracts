// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

interface IXAUT {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract XAUTEthereumBridge is Initializable, OwnableUpgradeable {
    IXAUT public xautToken;

    event Locked(address indexed user, uint256 amount);
    event Unlocked(address indexed user, uint256 amount);

    function initialize(address _xautTokenAddress) public initializer {
        __Ownable_init(msg.sender);
        xautToken = IXAUT(_xautTokenAddress);
    }

    function lockXAUT(uint256 amount) external {
        require(xautToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit Locked(msg.sender, amount);
    }

    function unlockXAUT(uint256 amount) external onlyOwner {
        require(xautToken.transfer(msg.sender, amount), "Transfer failed");
        emit Unlocked(msg.sender, amount);
    }
}