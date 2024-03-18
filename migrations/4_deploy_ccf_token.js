const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const CCFToken = artifacts.require('CCFToken');
const FIRST = false

if(FIRST){
    module.exports = async function (deployer) {
        const ethereumNetworkId = 1;//1 ARB, 2 BSC, 3 POLYGON
        await deployProxy(CCFToken, ["WXAUT", "WXAUT", ethereumNetworkId], { deployer, initializer: 'initialize' });
    };
}else{
    /* 
    ARB: 0x74Bd32F8258Fd28F2a4c463C1733f1f2e4C69400
    BSC: 0xfFB1F7566cC861Ae5942fff69285CCfaA1B17f7e
    POLY: 0x5ce4c731a0d59576cE5CE61A222D715c1c8F1307
    */
    module.exports = async function (deployer) {
        const existingProxyAddress = '0x5ce4c731a0d59576cE5CE61A222D715c1c8F1307';
        await upgradeProxy(existingProxyAddress, CCFToken, { deployer, initializer: 'initialize' });
    };
}

