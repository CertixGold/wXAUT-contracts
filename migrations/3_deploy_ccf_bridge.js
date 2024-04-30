const { deployProxy, upgradeProxy, forceImport } = require('@openzeppelin/truffle-upgrades');
const CCFBridgeV2 = artifacts.require('CCFBridgeV2');
const FIRST = true

if(FIRST){
    module.exports = async function (deployer) {
        const ethereumNetworkId = 0;
        await deployProxy(CCFBridgeV2, [ethereumNetworkId], { deployer, initializer: 'initialize' });
    };
}else{
    module.exports = async function (deployer) {
        const existingProxyAddress = '0xaB9C06534cDbd6687CF2baF2DDD2BA06848EE51C';
        await upgradeProxy(existingProxyAddress, CCFBridgeV2, { deployer, initializer: 'initialize' });

        //await forceImport(existingProxyAddress, CCFBridgeV2, { deployer, initializer: 'initialize' });
    };
}
