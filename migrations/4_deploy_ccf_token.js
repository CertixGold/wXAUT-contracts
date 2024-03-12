const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const CCFToken = artifacts.require('CCFToken');
const FIRST = false

if(FIRST){
    module.exports = async function (deployer) {
        const ethereumNetworkId = 1;//1 ARB, 2 BSC, 3 POLYGON
        await deployProxy(CCFToken, ["WXAUT", "WXAUT", ethereumNetworkId], { deployer, initializer: 'initialize' });
    };
}else{
    /*module.exports = async function (deployer) {
        const existingProxyAddress = '0x4325BCC315b07f1cdA92E86e29022ED8C1a12cd3';
        await upgradeProxy(existingProxyAddress, CCFToken, { deployer, initializer: 'initialize' });
    };*/
}

