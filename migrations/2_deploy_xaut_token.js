const XAUTToken = artifacts.require("XAUTToken");

const FIRST = true


module.exports = function (deployer) {
    if(FIRST){
        deployer.deploy(XAUTToken, "100000000000000", "6");
    }
};