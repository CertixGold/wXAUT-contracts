const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');
const CCFToken2 = artifacts.require('CCFToken2');
const FIRST = true

if(FIRST){
    module.exports = async function (deployer) {
        const ethereumNetworkId = 3;//1 ARB, 2 POLYGON, 3 BSC
        await deployProxy(CCFToken2, ["Bridged PAX Gold", "WPAXG", ethereumNetworkId, "18"], { deployer, initializer: 'initialize' });
    };
}else{
    /* 
    ARB: 0x5a5167d0aD6aFBBBF7A77fb43fe49F720f2ae2d3
    BSC: 0x53310b20288627B744337588d11F74327D5fb135
    POLY: 0x170eFE09E666BFba667A29BD3CFBDd4Ca3834d23
    */
    module.exports = async function (deployer) {
        const existingProxyAddress = '0x5ce4c731a0d59576cE5CE61A222D715c1c8F1307';
        await upgradeProxy(existingProxyAddress, CCFToken2, { deployer, initializer: 'initialize' });
    };
}

