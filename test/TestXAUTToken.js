const XAUTToken = artifacts.require("XAUTToken");
var BigNumber = require('bignumber.js');
var chai = require('chai');
chai.use(require('chai-bignumber')(BigNumber));

function log(text){
    console.log("    ✔ "+text)
}

contract("XAUTToken", function ([owner, user]) {
    const approveAmount = web3.utils.toWei('10', 'ether');

    beforeEach(async function () {
        this.xautToken = await XAUTToken.new(web3.utils.toWei('100000', 'ether'), { from: owner });
    });

    //XAUT TOKEN TESTS
    it('deploys successfully', async function () {
        expect(this.xautToken.address).to.be.not.empty;
        log("XAUT Token Address : "+this.xautToken.address)
    });

    it('XAUT Token mints initial supply to the owner', async function () {
        const balance = await this.xautToken.balanceOf(owner);
        expect(web3.utils.fromWei(balance.toString(), 'ether')).equal("100000");
    });

    it('Approve method works', async function () {
        await this.xautToken.approve("0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD", approveAmount, { from: owner });

        const allowance = await this.xautToken.allowance(owner, "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD");

        expect(web3.utils.fromWei(allowance.toString(), 'ether')).equal("10")
    })
});