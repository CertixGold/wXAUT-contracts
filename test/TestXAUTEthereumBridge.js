const XAUTToken = artifacts.require("XAUTToken");
const XAUTEthereumBridge = artifacts.require("XAUTEthereumBridge");

contract('XAUTEthereumBridge', function ([deployer, user]) {
    beforeEach(async function () {
        this.xautToken = await XAUTToken.new(web3.utils.toWei('100000', 'ether'), { from: deployer });
        this.xautBridge = await XAUTEthereumBridge.new({ from: deployer });
        // Initialisez le bridge avec l'adresse du token XAUT
        await this.xautBridge.initialize(this.xautToken.address, { from: deployer });

        console.log("333O3O3O3O3")
    });

    
});