const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const CCFTokenV2 = artifacts.require('CCFTokenV2');
const FIRST = false

if(FIRST){
    module.exports = async function (deployer) {
        const ethereumNetworkId = 3;//1 ARB, 2 POLYGON, 3 BSC
        await deployProxy(CCFTokenV2, ["WXAUT", "WXAUT", ethereumNetworkId], { deployer, initializer: 'initialize' });
    };
}else{
    /* 
    ARB: 0x74Bd32F8258Fd28F2a4c463C1733f1f2e4C69400
    BSC: 0xfFB1F7566cC861Ae5942fff69285CCfaA1B17f7e
    POLY: 0x5ce4c731a0d59576cE5CE61A222D715c1c8F1307
    */
    module.exports = async function (deployer) {
        const existingProxyAddress = '0x74Bd32F8258Fd28F2a4c463C1733f1f2e4C69400';
        await upgradeProxy(existingProxyAddress, CCFTokenV2, { deployer, initializer: 'initialize' });
    };
}

