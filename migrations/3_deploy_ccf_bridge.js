const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const CCFBridge = artifacts.require('CCFBridge');

module.exports = async function (deployer) {
    const ethereumNetworkId = 0;
    await deployProxy(CCFBridge, [ethereumNetworkId], { deployer, initializer: 'initialize' });
};