const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers, ZeroAddress } = require("hardhat");
const { expect, assert } = require("chai");
const { expectRevert } = require("@openzeppelin/test-helpers");
const { Log } = require("ethers");

describe("AssetRegistry Contract", function () {
  async function deployTokenFixture() {
    const AssetRegistry = await ethers.getContractFactory("AssetRegistry");
    const assetRegistry = await AssetRegistry.deploy();
    await assetRegistry.waitForDeployment();
    const [Admin, Owner, addr2, addr3] = await ethers.getSigners();
    const mintTx = await assetRegistry
      .connect(Admin)
      .registerAsset(
        Owner.address,
        "ipfs://bafkreiby5p35hcdyxsexuoa76owuj24yuacbrbwjzkknkexuks7r4jhwky"
      );
    await mintTx.wait();
    await expect(mintTx).to.emit(assetRegistry, "AssetRegistered");
    return { assetRegistry, Admin, Owner, addr2, addr3 };
  }

  //Set the Name and Symbol of token correctly
  describe("Token Name and Symbol", function () {
    it("Should deploy with the correct name and symbol", async function () {
      const { assetRegistry } = await loadFixture(deployTokenFixture);
      expect(await assetRegistry.name()).to.equal("VMANNFT");
      expect(await assetRegistry.symbol()).to.equal("VMAN");
    });
  });

  //Check if the Owner address is set correctly
  describe("Set the owner correctly", function () {
    it("should set the owner address correctly", async function () {
      const { assetRegistry, Owner } = await loadFixture(deployTokenFixture);
      expect(Owner.address).to.be.properAddress;
      expect(await assetRegistry.ownerOf(1)).to.be.equal(Owner.address);
    });
  });

  //Check if the asset details are set for the assetId
  describe("Sets the AssetURI correctly", function () {
    it("should set the assetURI correctly", async function () {
      const { assetRegistry } = await loadFixture(deployTokenFixture);
      expect(await assetRegistry.tokenURI(1)).to.be.equal(
        "ipfs://bafkreiby5p35hcdyxsexuoa76owuj24yuacbrbwjzkknkexuks7r4jhwky"
      );
    });
  });

  describe("Fractionalize asset", function () {
    //asset Should not fractionalize if not owner
    it("should NOT fraction  if not owner", async () => {
      const { assetRegistry, addr2 } = await loadFixture(deployTokenFixture);
      const totalSupply = 100;
      // Non-owner attempts to fractionalize
      await expect(
        assetRegistry.connect(addr2).fractionalizeAsset(1, totalSupply)
      ).to.be.revertedWith("AssetRegistry: Only NFT holder can fractionalize");
    });

    //asset should fractinalize if Owner attempts
    it("should fractionalize correctly", async function () {
      const totalSupply = 10000;
      const { assetRegistry, Owner, Admin } = await loadFixture(
        deployTokenFixture
      );
      const frTx = await assetRegistry
        .connect(Owner)
        .fractionalizeAsset(1, totalSupply);
      await frTx.wait();
      // Verify that the AssetRegistered event has been emitted
      const event = await expect(frTx).to.emit(
        assetRegistry,
        "AssetFractionalized"
      );
    });
  });

  //Should retrun correct balance for given address
  describe("Token balance of owner", function () {
    it("should return balance of the address", async function () {
      const { assetRegistry, Owner } = await loadFixture(deployTokenFixture);
      await assetRegistry.connect(Owner).fractionalizeAsset(1, 100);
      expect(await assetRegistry.balanceOfToken(Owner.address, 1)).to.equal(
        100
      );
    });
  });

  describe("TOken Exists", function () {
    //Should check if if token exists for given asset id returns true
    it("should return token exists", async function () {
      const { assetRegistry, Owner } = await loadFixture(deployTokenFixture);
      expect(await assetRegistry._isTokenExists(1)).to.equal(true);
    });

    //Should check if if token exists for given asset id returns false
    it("should return token not exists", async function () {
      const { assetRegistry } = await loadFixture(deployTokenFixture);
      expect(await assetRegistry._isTokenExists(2)).to.equal(false);
    });
  });

  describe("is token Fractionalized?", function () {
    //Should retrun true if the asset is fractionalized
    it("should return token fractionalized", async function () {
      const totalSupply = 10000;
      const { assetRegistry, Owner } = await loadFixture(deployTokenFixture);
      await assetRegistry.connect(Owner).fractionalizeAsset(1, totalSupply);
      const tx = await assetRegistry.isFractionalized(1);
      assert.isTrue(tx, "failed");
    });

    //Should be false the asset which is not fractionalized
    it("should return token not fractionalized", async function () {
      const { assetRegistry, Owner } = await loadFixture(deployTokenFixture);
      expect(await assetRegistry.isFractionalized(1)).to.equal(false);
    });
  });

  //should retrun totalsupply which is 10000
  describe("Total Supply of Asset", function () {
    it("should return total Supply", async function () {
      const { assetRegistry, Owner } = await loadFixture(deployTokenFixture);
      await assetRegistry.connect(Owner).fractionalizeAsset(1, 100);
      expect(await assetRegistry.totalSupply(1)).to.equal(100);
    });
  });

  describe("To get asset Owner", function () {
    //should actually get owner
    it("should get the asset owner for existing owner", async function () {
      const { assetRegistry, Owner, Admin } = await loadFixture(
        deployTokenFixture
      );

      await assetRegistry.connect(Owner).fractionalizeAsset(1, 100);
      const result = await assetRegistry.getAssetOwners(1);
      expect(result).to.deep.equal([Owner.address]); // Use deep.equal for array comparison
    });

    //Attempt to get asset owner for the non-existant owner
    it("trying to get asset owner for non existant token", async function () {
      const { assetRegistry, Owner, Admin } = await loadFixture(
        deployTokenFixture
      );
      await assetRegistry.connect(Owner).fractionalizeAsset(1, 100);
      expect(await assetRegistry.getAssetOwners(1)).to.be.revertedWith(
        "AssetRegistry: Nonexistent token"
      );
    });
  });
  describe("Transfer of token", function () {
    //Should perform transform successfully
    it("should transfer successfully", async () => {
      const { assetRegistry, Owner, addr2 } = await loadFixture(
        deployTokenFixture
      );
      await assetRegistry.connect(Owner).fractionalizeAsset(1, 100);
      await assetRegistry.connect(Owner).transfer(addr2.address, 1, 12);
      const addr2Balance = await assetRegistry.balanceOfToken(addr2.address, 1);
      expect(addr2Balance).to.be.equal(12);
      const OwnerBalance = await assetRegistry.balanceOfToken(Owner.address, 1);
      expect(OwnerBalance).to.be.equal(88);
    });
    //Revert transfer if balance is insufficient
    it("should revert if balance is insufficient", async () => {
      const { assetRegistry, Owner, addr2 } = await loadFixture(
        deployTokenFixture
      );
      await assetRegistry.connect(Owner).fractionalizeAsset(1, 10);
      await expect(
        assetRegistry.connect(Owner).transfer(addr2.address, 1, 12)
      ).to.be.revertedWith("Insufficient balance");
    });
  });
});
