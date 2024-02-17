const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const CCFBridge = artifacts.require('CCFBridge');
const FIRST = true

if(FIRST){
    module.exports = async function (deployer) {
        const ethereumNetworkId = 0;
        await deployProxy(CCFBridge, [ethereumNetworkId], { deployer, initializer: 'initialize' });
    };
}else{
    /*module.exports = async function (deployer) {
        const existingProxyAddress = '0x4325BCC315b07f1cdA92E86e29022ED8C1a12cd3';
        await upgradeProxy(existingProxyAddress, CCFToken, { deployer, initializer: 'initialize' });
    };*/
}
