const XAUTToken = artifacts.require("XAUTToken");    
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const XAUTEthereumBridge = artifacts.require('XAUTEthereumBridge');

module.exports = async function (deployer) {
    const xautTokenDeployed = await XAUTToken.deployed();
    const xautTokenAddress = xautTokenDeployed.address;
    console.log("XAUT ADDRESS : "+xautTokenAddress)

    await deployProxy(XAUTEthereumBridge, [xautTokenAddress], { deployer, initializer: 'initialize' });
};