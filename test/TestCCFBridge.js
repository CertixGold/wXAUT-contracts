const XAUTToken = artifacts.require("XAUTToken");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const CCFBridge = artifacts.require("CCFBridge");
const { expectEvent } = require('@openzeppelin/test-helpers');
var BigNumber = require('bignumber.js');
var chai = require('chai');
chai.use(require('chai-bignumber')(BigNumber));

function log(text){
    console.log("    ✔ " + text)
}

contract("CCFBridge", function ([owner, user]) {
    const lockAmount = web3.utils.toWei('10', 'ether');
    const bridgeFee = web3.utils.toWei('0.00015', 'ether');
    const protocolPercent = 0.002;

    beforeEach(async function () {
        // Deploy the XAUT token
        this.xautToken = await XAUTToken.new(web3.utils.toWei('100000', 'ether'), { from: owner });

        // Deploy the bridge as an upgradable proxy
        this.ccfBridge = await deployProxy(CCFBridge, [this.xautToken.address], { owner, initializer: 'initialize' });
    });

    it('should deploy the XAUTToken and CCFBridge successfully', async function () {
        expect(this.xautToken.address).to.not.be.null;
        expect(this.ccfBridge.address).to.not.be.null;
        log("XAUT Token Address: " + this.xautToken.address);
        log("XAUT Bridge Address: " + this.ccfBridge.address);
    });

    
    it('Lock and test fee', async function () {
        // Provision the user with XAUT tokens and approve the bridge to transfer
        await this.xautToken.transfer(user, lockAmount, { from: owner });
        await this.xautToken.approve(this.ccfBridge.address, lockAmount, { from: user });
        
        const receiptLock = await this.ccfBridge.lock(this.xautToken.address, lockAmount, bridgeFee, 1, { from: user });

        // Verify that the Locked event was emitted
        expect(receiptLock.logs[0].event).equal("Locked")
        
        // Test protocol fee
        const totalProtocolFees = await this.ccfBridge.totalProtocolFees(this.xautToken.address);
        log("totalProtocolFees : " + web3.utils.fromWei(totalProtocolFees, 'ether'))
        expect(totalProtocolFees.toString()).equal((lockAmount * protocolPercent).toString());

        // Test bridge fee
        const totalBridgeFees = await this.ccfBridge.totalBridgeFees(this.xautToken.address);
        log("totalBridgeFees : " + web3.utils.fromWei(totalBridgeFees, 'ether'))
        expect(totalBridgeFees.toString()).equal(bridgeFee);

        
        // Verify that the locked tokens are correct without the fees
        const lockedBalance = await this.ccfBridge.lockedBalance(this.xautToken.address);
        log("lockedBalance : " + web3.utils.fromWei(lockedBalance, 'ether'))
        expect(lockedBalance.toString()).equal((lockAmount - ((lockAmount * protocolPercent)) - bridgeFee).toString());
        

        // Verify that all tokens have been transferred to the bridge contract
        const bridgeBalance = await this.xautToken.balanceOf(this.ccfBridge.address);
        log("bridgeBalance : " + web3.utils.fromWei(bridgeBalance, 'ether'))
        expect(bridgeBalance.toString()).equal(lockAmount);
    })

    it('UnlockXAUT and test fee', async function () {
        // Provision the user with XAUT tokens and approve the bridge to transfer
        await this.xautToken.transfer(user, lockAmount, { from: owner });
        await this.xautToken.approve(this.ccfBridge.address, lockAmount, { from: user });

        await this.ccfBridge.lock(this.xautToken.address, lockAmount, bridgeFee, 0, { from: user });

        // TEST to unlock more (due to fees)
        try {
            await this.ccfBridge.unlock(this.xautToken.address ,user, lockAmount, 0, { from: owner });
        } catch(error) {
            expect(error.reason).equal('Insufficient locked balance')
        }
        
        // Verify that the Locked event was emitted
        const lockedBalance = await this.ccfBridge.lockedBalance(this.xautToken.address);
        log("lockedBalance : " + lockedBalance)

        const receiptUnlock = await this.ccfBridge.unlock(this.xautToken.address, user, (lockAmount - (lockAmount * protocolPercent) - bridgeFee).toString(), 0, { from: owner });
        expect(receiptUnlock.logs[0].event).equal("Unlocked")
        
        // Verify that the tokens have been transferred to the bridge contract and only the fees remain
        const bridgeBalanceAfterUnlock = await this.xautToken.balanceOf(this.ccfBridge.address);
        expect(bridgeBalanceAfterUnlock.toString()).equal((parseInt(lockAmount * protocolPercent) + parseInt(bridgeFee)).toString());
    })

    it('Update protocolFeePercentage', async function () {
        const protocolFeesToUpdate = 3000
        await this.ccfBridge.updateProtocolFeePercentage(protocolFeesToUpdate, { from: owner });
        const protocolFeePercentage = await this.ccfBridge.protocolFeePercentage();
        expect(protocolFeePercentage.toString()).equal(protocolFeesToUpdate.toString());
    })

    it('Update minimumFees', async function () {
        await this.ccfBridge.updateMinimumFee(0, bridgeFee, { from: owner });
        await this.ccfBridge.updateMinimumFee(1, bridgeFee * 2, { from: owner });
        await this.ccfBridge.updateMinimumFee(2, bridgeFee * 3, { from: owner });

        const minimumFeeChain0 = await this.ccfBridge.minimumFees(0);
        const minimumFeeChain1 = await this.ccfBridge.minimumFees(1);
        const minimumFeeChain2 = await this.ccfBridge.minimumFees(2);

        expect(minimumFeeChain0.toString()).equal(bridgeFee.toString());
        expect(minimumFeeChain1.toString()).equal((bridgeFee * 2).toString());
        expect(minimumFeeChain2.toString()).equal((bridgeFee * 3).toString());
    })
});
