const XAUTToken = artifacts.require("XAUTToken");

module.exports = function (deployer) {
    const initialSupply = web3.utils.toWei('100000', 'ether');
    deployer.deploy(XAUTToken, initialSupply);
};