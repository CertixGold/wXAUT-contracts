// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract XAUTToken is ERC20 {
    uint8 private decimalsNumber;

    constructor(uint256 initialSupply, uint8 _decimals) ERC20("Wrapped Tether Gold", "WXAUT") {
        _mint(msg.sender, initialSupply);

        decimalsNumber = _decimals;
    }

    function decimals() public view virtual override returns (uint8) {
        return decimalsNumber;  
    }
}