import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";


describe("FSVault Contract", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployVaultContractFixture() {


    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, otherAccount2, otherAccount3] = await ethers.getSigners();

    const FSToken = await ethers.getContractFactory("FSToken");
    const ERC20Token = await ethers.getContractFactory("FSToken");

    const FSVault = await ethers.getContractFactory("FSVault");

    const fsToken = await FSToken.deploy(100000);
    const erc20Token = await ERC20Token.deploy(100000);

    const fsTokenAddress = await fsToken.getAddress();
    const fsVault = await FSVault.deploy(fsTokenAddress);
    const fsVaultAddress = await fsVault.getAddress();
    const erc20TokenAddress = await erc20Token.getAddress();

    return { fsToken, fsVault, erc20Token, erc20TokenAddress, fsTokenAddress, fsVaultAddress, owner, otherAccount, otherAccount2, otherAccount3 };
  }

  describe("Deployment", function () {
    it("Should set the token owner as FSToken & right balance of Onwer", async function () {
      const { fsVault, fsToken, fsTokenAddress, owner } = await loadFixture(deployVaultContractFixture);
      expect(await fsVault.FST()).to.equal(fsTokenAddress);
      expect(await fsToken.balanceOf(owner.address)).to.equal(ethers.parseEther('100000'));
    });
  });

  describe("depositEth", function () {
    it("Should deposit Eth to FSVault", async function () {
      const { fsVault, owner } = await loadFixture(deployVaultContractFixture);
      await fsVault.depositEth({ value: ethers.parseEther('5') });
      expect(await ethers.provider.getBalance(owner.address)).to.be.closeTo(
        ethers.parseEther('9995'),
        ethers.parseEther('0.01') // Assuming a tolerance of 0.01 ETH for gas consumption
      ); // Using closeTo because of the gas cost for the transaction itself
    });

    it("Should revert when not enough Eth", async function () {
      const { fsVault, owner, otherAccount } = await loadFixture(deployVaultContractFixture);
      // Attempt to deposit 0 ETH into the vault with the otherAccount account which fails
      await expect(fsVault.connect(otherAccount).depositEth({ value: ethers.parseEther('0') }))
        .to.be.revertedWithCustomError(fsVault, "InsufficientDepositAmount")
        .withArgs(
          ethers.parseEther('0'), ethers.parseEther('0')
        )
    });
  })

  describe("withdrawEth", function () {
    it("Should withdraw Eth from FSVault", async function () {
      const { fsVault, fsToken, owner } = await loadFixture(deployVaultContractFixture);
      // deposit Eth to FSVault
      await fsVault.depositEth({ value: ethers.parseEther('1') });
      // balance should be 10000 -1
      expect(await ethers.provider.getBalance(owner.address)).to.be.closeTo(
        ethers.parseEther('9999'),
        ethers.parseEther('0.01') // Assuming a tolerance of 0.01 ETH for gas consumption
      );
      // test withdraw amount should return error as Tried to withdraw more than deposited
      await expect(fsVault.withdrawEth(ethers.parseEther('5'))).to.be
        .revertedWithCustomError(fsVault, "InsufficientWithdrawAmount")
        .withArgs(ethers.parseEther('1'), ethers.parseEther('5'))
      // withdraw Eth from FSVault
      await fsVault.withdrawEth(ethers.parseEther('1'));
      // balance should be 10000 - gas fee from 2 transactions
      expect(await ethers.provider.getBalance(owner.address)).to.be.closeTo(
        ethers.parseEther('10000'),
        ethers.parseEther('0.02') // Assuming a tolerance of 0.02 ETH for gas consumption
      ); // Using closeTo because of the gas cost for the transaction itself
    });
  })

  describe("depositFST", function () {
    it("Should deposit FST to FSVault", async function () {
      const { fsVault, fsVaultAddress, otherAccount, fsToken, fsTokenAddress } = await loadFixture(deployVaultContractFixture);
      // transfer 1000 FST to otherAccount
      await fsToken.transfer(otherAccount.address, ethers.parseEther('1000'));
      expect(await fsToken.balanceOf(otherAccount.address)).to.equal(ethers.parseEther('1000'));

      // deposit 2000 FST to FSVault with 1000 FST balance reverting with error
      await expect(fsVault.connect(otherAccount).depositFST(ethers.parseEther('2000')))
        .to.be.revertedWithCustomError(fsVault, "InsufficientDepositAmount")
        .withArgs(ethers.parseEther('1000'), ethers.parseEther('2000'));

      // deposit 1000 FST to FSVault without allowance reverting with error
      await expect(fsVault.connect(otherAccount).depositFST(ethers.parseEther('1000')))
        .to.be.revertedWithCustomError(fsVault, "InsufficientAllowance")
        .withArgs(0, ethers.parseEther('1000'));
      // approve 1000 FST to FSVault and deposit 1000 FST to FSVault
      await fsToken.connect(otherAccount).approve(fsVaultAddress, ethers.parseEther('1000'));
      await fsVault.connect(otherAccount).depositFST(ethers.parseEther('1000'));
      expect(await
        fsVault.balancesErc20(otherAccount.address, fsTokenAddress)
      ).to.equal(ethers.parseEther('1000'));

      expect(await fsToken.balanceOf(otherAccount.address)).to.equal(ethers.parseEther('0'));
    });
  })

  describe("withdrawFST", function () {
    it("Should withdraw FST from FSVault", async function () {
      const { fsVault, fsVaultAddress, otherAccount, fsToken, fsTokenAddress } = await loadFixture(deployVaultContractFixture);
      // transfer 1000 FST to otherAccount
      await fsToken.transfer(otherAccount.address, ethers.parseEther('1000'));

      // approve and deposit 1000 FST to FSVault
      await fsToken.connect(otherAccount).approve(fsVaultAddress, ethers.parseEther('1000'));
      await fsVault.connect(otherAccount).depositFST(ethers.parseEther('1000'));
      // withdraw 500 FST from FSVault
      await fsVault.connect(otherAccount).withdrawFST(ethers.parseEther('500'));
      expect(await fsToken.balanceOf(otherAccount.address)).to.equal(ethers.parseEther('500'));
    });
    it("Should revert with the right error if tried to withdraw more than deposited", async function () {
      const { fsVault, fsVaultAddress, otherAccount, fsToken, fsTokenAddress } = await loadFixture(deployVaultContractFixture);
      // transfer 1000 FST to otherAccount
      await fsToken.transfer(otherAccount.address, ethers.parseEther('1000'));
      // approve and deposit 1000 FST to FSVault
      await fsToken.connect(otherAccount).approve(fsVaultAddress, ethers.parseEther('1000'));
      await fsVault.connect(otherAccount).depositFST(ethers.parseEther('1000'));
      // withdraw 500 FST from FSVault
      await expect(fsVault.connect(otherAccount).withdrawFST(ethers.parseEther('5000'))).to.be.revertedWithCustomError(fsVault, "InsufficientWithdrawAmount")
        .withArgs(ethers.parseEther('5000'), ethers.parseEther('1000'));
    })
  })


  describe("depositERC20", function () {
    it("Should deposit erc20Tokens to FSVault", async function () {
      const { fsVault, fsVaultAddress, otherAccount, erc20Token, erc20TokenAddress } = await loadFixture(deployVaultContractFixture);
      // transfer 1000 erc20Tokens to otherAccount
      await erc20Token.transfer(otherAccount.address, ethers.parseEther('1000'));
      expect(await erc20Token.balanceOf(otherAccount.address)).to.equal(ethers.parseEther('1000'));

      // deposit 2000 erc20Tokens to FSVault with 1000 erc20Tokens balance reverting with error
      await expect(fsVault.connect(otherAccount).depositERC20(erc20TokenAddress, ethers.parseEther('2000')))
        .to.be.revertedWithCustomError(fsVault, "InsufficientDepositAmount")
        .withArgs(ethers.parseEther('1000'), ethers.parseEther('2000'));

      // deposit 1000 erc20Tokens to FSVault without allowance reverting with error
      await expect(fsVault.connect(otherAccount).depositERC20(erc20TokenAddress, ethers.parseEther('1000')))
        .to.be.revertedWithCustomError(fsVault, "InsufficientAllowance")
        .withArgs(0, ethers.parseEther('1000'));

      // approve 1000 erc20Tokens to FSVault and deposit 1000 erc20Tokens to FSVault
      await erc20Token.connect(otherAccount).approve(fsVaultAddress, ethers.parseEther('1000'));
      await fsVault.connect(otherAccount).depositERC20(erc20TokenAddress, ethers.parseEther('1000'));

      expect(await
        fsVault.balancesErc20(otherAccount.address, erc20TokenAddress)
      ).to.equal(ethers.parseEther('1000'));

      expect(await erc20Token.balanceOf(otherAccount.address)).to.equal(ethers.parseEther('0'));
    });
  })

  describe("withdrawERC20", function () {
    it("Should withdraw erc20Tokens from FSVault", async function () {
      const { fsVault, fsVaultAddress, otherAccount, erc20Token, erc20TokenAddress } = await loadFixture(deployVaultContractFixture);
      // transfer 1000 erc20Tokens to otherAccount
      await erc20Token.transfer(otherAccount.address, ethers.parseEther('1000'));

      // approve and deposit 1000 erc20Tokens to FSVault
      await erc20Token.connect(otherAccount).approve(fsVaultAddress, ethers.parseEther('1000'));
      await fsVault.connect(otherAccount).depositERC20(erc20TokenAddress, ethers.parseEther('1000'));
      // withdraw 500 erc20Tokens from FSVault
      await fsVault.connect(otherAccount).withdrawErc20(erc20TokenAddress, ethers.parseEther('500'));
      expect(await erc20Token.balanceOf(otherAccount.address)).to.equal(ethers.parseEther('500'));
    });
    it("Should revert with the right error if tried to withdraw more than deposited", async function () {
      const { fsVault, fsVaultAddress, otherAccount, erc20Token, erc20TokenAddress } = await loadFixture(deployVaultContractFixture);
      // transfer 1000 erc20Tokens to otherAccount
      await erc20Token.transfer(otherAccount.address, ethers.parseEther('1000'));
      // approve and deposit 1000 erc20Tokens to FSVault
      await erc20Token.connect(otherAccount).approve(fsVaultAddress, ethers.parseEther('1000'));
      await fsVault.connect(otherAccount).depositERC20(erc20TokenAddress, ethers.parseEther('1000'));
      // withdraw 500 erc20Tokens from FSVault
      await expect(fsVault.connect(otherAccount).withdrawErc20(erc20TokenAddress, ethers.parseEther('5000'))).to.be.revertedWithCustomError(fsVault, "InsufficientWithdrawAmount")
        .withArgs(ethers.parseEther('5000'), ethers.parseEther('1000'));
    })
  })

  describe("interfaceId", function () {
    it("Should get the right interfaceId", async function () {
      const { fsVault, erc20Token, erc20TokenAddress } = await loadFixture(deployVaultContractFixture);

      expect(await fsVault.interfaceId()).to.equal(ethers.hexlify('0x36372b07'));
    })
  })
});