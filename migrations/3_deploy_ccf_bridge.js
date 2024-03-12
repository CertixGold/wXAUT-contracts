const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const CCFBridge = artifacts.require('CCFBridge');
const FIRST = flase

if(FIRST){
    module.exports = async function (deployer) {
        const ethereumNetworkId = 0;
        await deployProxy(CCFBridge, [ethereumNetworkId], { deployer, initializer: 'initialize' });
    };
}else{
    module.exports = async function (deployer) {
        const existingProxyAddress = '0xaB9C06534cDbd6687CF2baF2DDD2BA06848EE51C';
        await upgradeProxy(existingProxyAddress, CCFBridge, { deployer });
    };
}
