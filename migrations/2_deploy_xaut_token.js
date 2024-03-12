const XAUTToken = artifacts.require("XAUTToken");

const FIRST = false


module.exports = function (deployer) {
    if(FIRST){
        const initialSupply = web3.utils.toWei('100000', 'ether');
        deployer.deploy(XAUTToken, initialSupply);
    }
};