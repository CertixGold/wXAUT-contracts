const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const CCFToken = artifacts.require('CCFToken');

module.exports = async function (deployer) {
    const ethereumNetworkId = 1;
    await deployProxy(CCFToken, ["wXAUT", "wXAUT", ethereumNetworkId], { deployer, initializer: 'initialize' });
};