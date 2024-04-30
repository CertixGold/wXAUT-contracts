const PAXGToken = artifacts.require("PAXGToken");

const FIRST = true


module.exports = function (deployer) {
    if(FIRST){
        deployer.deploy(PAXGToken, "100000000000000000000000000", "18");
    }
};