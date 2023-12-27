const CCFToken = artifacts.require("CCFToken");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const { expectEvent } = require('@openzeppelin/test-helpers');
var BigNumber = require('bignumber.js');
var chai = require('chai');
chai.use(require('chai-bignumber')(BigNumber));

function log(text){
    console.log("    ✔ " + text)
}

contract("CCFToken", function ([owner, user]) {
    const bridgeAmount = web3.utils.toWei('10', 'ether');
    const bridgeFee = web3.utils.toWei('0.00015', 'ether');
    const protocolPercent = 0.002;

    beforeEach(async function () {
        // Deploy the bridge as an upgradable proxy
        const ethereumNetworkId = 2;
        this.wxautToken = await deployProxy(CCFToken, ["wXAUT", "wXAUT", ethereumNetworkId], { owner, initializer: 'initialize' });
        log("CCF Token Address: " + this.wxautToken.address);
    });

    it('should deploy the WXAUTToken successfully', async function () {
        expect(this.wxautToken.address).to.not.be.null;
        
    });

    
    it('Mint, Bridge and Test fee', async function () {
        // Provision the user with XAUT tokens and approve the bridge to transfer
        await this.wxautToken.mint(user, bridgeAmount, { from: owner });

        const balance = await this.wxautToken.balanceOf(user);
        log("User balance : " + web3.utils.fromWei(balance, 'ether'))
        expect(balance.toString()).equal(bridgeAmount);

        await this.wxautToken.approve(this.wxautToken.address, bridgeAmount, { from: user });

        const allowance = await this.wxautToken.allowance(user, this.wxautToken.address);
        expect(allowance.toString()).equal(bridgeAmount)
        console.log("OKKK")
        const receiptLock = await this.wxautToken.bridge(bridgeAmount, bridgeFee, 0, { from: user });

        // Verify that the Locked event was emitted
        expect(receiptLock.logs[2].event).equal("BridgeEvent")
        
        // Test protocol fee
        const totalProtocolFees = await this.wxautToken.totalProtocolFees();
        log("totalProtocolFees : " + web3.utils.fromWei(totalProtocolFees, 'ether'))
        expect(totalProtocolFees.toString()).equal((bridgeAmount * protocolPercent).toString());

        // Test bridge fee
        const totalBridgeFees = await this.wxautToken.totalBridgeFees();
        log("totalBridgeFees : " + web3.utils.fromWei(totalBridgeFees, 'ether'))
        expect(totalBridgeFees.toString()).equal(bridgeFee);

        
        
        // Verify that all tokens have been transferred to the bridge contract
        const bridgeBalance = await this.wxautToken.balanceOf(this.wxautToken.address);
        log("bridgeBalance : " + web3.utils.fromWei(bridgeBalance, 'ether'))
        expect(bridgeBalance.toString()).equal((Number(totalBridgeFees) + Number(totalProtocolFees)).toString());

        //Check if user balance is 0
        const userBalance = await this.wxautToken.balanceOf(user);
        log("userBalance : " + web3.utils.fromWei(userBalance, 'ether'))
        expect(userBalance.toString()).equal("0");
    })

    it('Update protocolFeePercentage', async function () {
        const protocolFeesToUpdate = 3000
        await this.wxautToken.updateProtocolFeePercentage(protocolFeesToUpdate, { from: owner });

        const protocolFeePercentage = await this.wxautToken.protocolFeePercentage();
        expect(protocolFeePercentage.toString()).equal(protocolFeesToUpdate.toString());
    })

    it('Update minimumFees', async function () {
        await this.wxautToken.updateMinimumFee(0, bridgeFee, { from: owner });
        await this.wxautToken.updateMinimumFee(1, bridgeFee * 2, { from: owner });
        await this.wxautToken.updateMinimumFee(2, bridgeFee * 3, { from: owner });

        const minimumFeeChain0 = await this.wxautToken.minimumFees(0);
        const minimumFeeChain1 = await this.wxautToken.minimumFees(1);
        const minimumFeeChain2 = await this.wxautToken.minimumFees(2);

        expect(minimumFeeChain0.toString()).equal(bridgeFee.toString());
        expect(minimumFeeChain1.toString()).equal((bridgeFee * 2).toString());
        expect(minimumFeeChain2.toString()).equal((bridgeFee * 3).toString());
    })
});
