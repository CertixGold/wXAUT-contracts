const XAUTToken = artifacts.require("XAUTToken");
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const XAUTEthereumBridge = artifacts.require("XAUTEthereumBridge");
const { expectEvent } = require('@openzeppelin/test-helpers');
var BigNumber = require('bignumber.js');
var chai = require('chai');
chai.use(require('chai-bignumber')(BigNumber));

function log(text){
    console.log("    ✔ " + text)
}

contract("XAUTEthereumBridge", function ([owner, user]) {
    const lockAmount = web3.utils.toWei('10', 'ether');
    const bridgeFee = web3.utils.toWei('0.00015', 'ether');
    const protocolPercent = 0.002;

    beforeEach(async function () {
        // Deploy the XAUT token
        this.xautToken = await XAUTToken.new(web3.utils.toWei('100000', 'ether'), { from: owner });

        // Deploy the bridge as an upgradable proxy
        this.xautBridge = await deployProxy(XAUTEthereumBridge, [this.xautToken.address], { owner, initializer: 'initialize' });
    });

    it('should deploy the XAUTToken and XAUTEthereumBridge successfully', async function () {
        expect(this.xautToken.address).to.not.be.null;
        expect(this.xautBridge.address).to.not.be.null;
        log("XAUT Token Address: " + this.xautToken.address);
        log("XAUT Bridge Address: " + this.xautBridge.address);
    });

    
    it('LockXAUT and test fee', async function () {
        // Provision the user with XAUT tokens and approve the bridge to transfer
        await this.xautToken.transfer(user, lockAmount, { from: owner });
        await this.xautToken.approve(this.xautBridge.address, lockAmount, { from: user });
        
        const receiptLock = await this.xautBridge.lockXAUT(lockAmount, bridgeFee, 0, { from: user });

        // Verify that the Locked event was emitted
        expect(receiptLock.logs[0].event).equal("Locked")
        
        // Test protocol fee
        const totalProtocolFees = await this.xautBridge.totalProtocolFees();
        log("totalProtocolFees : " + web3.utils.fromWei(totalProtocolFees, 'ether'))
        expect(totalProtocolFees.toString()).equal((lockAmount * protocolPercent).toString());

        // Test bridge fee
        const totalBridgeFees = await this.xautBridge.totalBridgeFees();
        log("totalBridgeFees : " + web3.utils.fromWei(totalBridgeFees, 'ether'))
        expect(totalBridgeFees.toString()).equal(bridgeFee);

        
        // Verify that the locked tokens are correct without the fees
        const lockedBalance = await this.xautBridge.lockedBalance();
        log("lockedBalance : " + web3.utils.fromWei(lockedBalance, 'ether'))
        expect(lockedBalance.toString()).equal((lockAmount - ((lockAmount * protocolPercent)) - bridgeFee).toString());
        

        // Verify that all tokens have been transferred to the bridge contract
        const bridgeBalance = await this.xautToken.balanceOf(this.xautBridge.address);
        log("bridgeBalance : " + web3.utils.fromWei(bridgeBalance, 'ether'))
        expect(bridgeBalance.toString()).equal(lockAmount);
    })

    it('UnlockXAUT and test fee', async function () {
        // Provision the user with XAUT tokens and approve the bridge to transfer
        await this.xautToken.transfer(user, lockAmount, { from: owner });
        await this.xautToken.approve(this.xautBridge.address, lockAmount, { from: user });

        await this.xautBridge.lockXAUT(lockAmount, bridgeFee, 0, { from: user });

        // TEST to unlock more (due to fees)
        try {
            await this.xautBridge.unlockXAUT(user, lockAmount, 0, { from: owner });
        } catch(error) {
            expect(error.reason).equal('Insufficient locked balance')
        }
        
        // Verify that the Locked event was emitted
        const lockedBalance = await this.xautBridge.lockedBalance();
        log("lockedBalance : " + lockedBalance)

        const receiptUnlock = await this.xautBridge.unlockXAUT(user, (lockAmount - (lockAmount * protocolPercent) - bridgeFee).toString(), 0, { from: owner });
        expect(receiptUnlock.logs[0].event).equal("Unlocked")
        
        // Verify that the tokens have been transferred to the bridge contract and only the fees remain
        const bridgeBalanceAfterUnlock = await this.xautToken.balanceOf(this.xautBridge.address);
        expect(bridgeBalanceAfterUnlock.toString()).equal((parseInt(lockAmount * protocolPercent) + parseInt(bridgeFee)).toString());
    })

    it('Update protocolFeePercentage', async function () {
        const protocolFeesToUpdate = 3000
        await this.xautBridge.updateProtocolFeePercentage(protocolFeesToUpdate, { from: owner });

        const protocolFeePercentage = await this.xautBridge.protocolFeePercentage();
        expect(protocolFeePercentage.toString()).equal(protocolFeesToUpdate.toString());
    })

    it('Update minimumFees', async function () {
        await this.xautBridge.updateMinimumFee(0, bridgeFee, { from: owner });
        await this.xautBridge.updateMinimumFee(1, bridgeFee * 2, { from: owner });
        await this.xautBridge.updateMinimumFee(2, bridgeFee * 3, { from: owner });

        const minimumFeeChain0 = await this.xautBridge.minimumFees(0);
        const minimumFeeChain1 = await this.xautBridge.minimumFees(1);
        const minimumFeeChain2 = await this.xautBridge.minimumFees(2);

        expect(minimumFeeChain0.toString()).equal(bridgeFee.toString());
        expect(minimumFeeChain1.toString()).equal((bridgeFee * 2).toString());
        expect(minimumFeeChain2.toString()).equal((bridgeFee * 3).toString());
    })
});
