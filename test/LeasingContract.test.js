// myContract.test.js
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers, ZeroAddress } = require("hardhat");
const { expect, assert } = require("chai");
const { expectRevert } = require("@openzeppelin/test-helpers");
const { Log } = require("ethers");

describe("LeasingContract", function () {
  async function deployTokenFixture() {
    //get accounts
    const [Admin, Owner, addr1, addr2] = await ethers.getSigners();
    const totalSupply = 100;
    // Deploy the VMANToken contract
    const VMANToken = await ethers.getContractFactory("VMANToken");
    const VMANTokenInstance = await VMANToken.deploy();
    await VMANTokenInstance.waitForDeployment();

    // Deploy the AssetRegistry contract
    const AssetRegistry = await ethers.getContractFactory("AssetRegistry");
    const assetRegistryInstance = await AssetRegistry.deploy();
    await assetRegistryInstance.waitForDeployment();

    //Deploy AssitePriceOracle
    const AssetPriceOracle = await ethers.getContractFactory(
      "AssetPriceOracle"
    );
    const assetPriceOracleInstance = await AssetPriceOracle.deploy();
    await assetPriceOracleInstance.waitForDeployment();

    // Deploy MyContract with Token and AssetRegistry instances as arguments
    const LeasingContract = await ethers.getContractFactory("LeasingContract");
    const LeasingContractInstance = await LeasingContract.deploy(
      assetRegistryInstance.target,
      assetPriceOracleInstance.target
    );

    await LeasingContractInstance.waitForDeployment();
    const frTx = await assetRegistryInstance
      .connect(Admin)
      .registerAsset(
        Owner,
        "ipfs://bafkreiby5p35hcdyxsexuoa76owuj24yuacbrbwjzkknkexuks7r4jhwky"
      );

    await frTx.wait();
    await assetRegistryInstance
      .connect(Owner)
      .fractionalizeAsset(1, totalSupply);

    return {
      assetRegistryInstance,
      VMANTokenInstance,
      LeasingContractInstance,
      Owner,
      Admin,
      addr1,
      addr2,
    };
  }
  describe("Endtime>startTime", function () {
    it("Should require end time to be greater than start time for creating lease", async function () {
      const { LeasingContractInstance, addr1 } = await loadFixture(
        deployTokenFixture
      );
      //set endtime>start time
      const startTime = 0;
      const endTime = 157680000;
      const leaseTx = await LeasingContractInstance.createLease(
        addr1.address,
        1,
        1,
        "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        startTime,
        endTime
      );
    });
    it("Should creating lease for End time greater than start time", async function () {
      const { LeasingContractInstance, addr1 } = await loadFixture(
        deployTokenFixture
      );

      // Set end time<start time
      const startTime = 2;
      const endTime = 1;

      // Use the contract function that contains the require statement
      await expect(
        LeasingContractInstance.createLease(
          addr1.address,
          1,
          1,
          "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
          startTime,
          endTime
        )
      ).to.be.revertedWith(
        "LeasingContract: End time must be after start time"
      );
    });
  });

  describe("Fractinalize asset", function () {
    it("Should not create lease if the asset is not fractionalized", async function () {
      const { LeasingContractInstance, addr1 } = await loadFixture(
        deployTokenFixture
      );
      //set endtime>start time
      const startTime = 0;
      const endTime = 157680000;
      await expect(
        LeasingContractInstance.createLease(
          addr1.address,
          2,
          1,
          "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
          startTime,
          endTime
        )
      ).to.be.revertedWith("LeasingContract: Asset is not fractionalized");
    });
    it("Should create lease if the asset is fractionalized", async function () {
      const { LeasingContractInstance, addr1 } = await loadFixture(
        deployTokenFixture
      );
      //set endtime>start time
      const startTime = 0;
      const endTime = 157680000;
      await LeasingContractInstance.createLease(
        addr1.address,
        1,
        1,
        "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        startTime,
        endTime
      );
      const leaseId = await LeasingContractInstance.leaseId();
      await expect(leaseId).to.be.equal(1);
    });
  });

  describe("Lease Type", function () {
    it("Should create lease for duration atleast 5 years", async function () {
      const { LeasingContractInstance, addr1 } = await loadFixture(
        deployTokenFixture
      );
      //set endtime>start time
      const startTime = 0;
      const endTime = 157680000;

      await LeasingContractInstance.createLease(
        addr1.address,
        1,
        1,
        "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        startTime,
        endTime
      );
    });
    it("Lease:Should not create Lease for less than 5 years", async function () {
      const { LeasingContractInstance, addr1 } = await loadFixture(
        deployTokenFixture
      );
      //set endtime>start time
      const startTime = 0;
      const endTime = 2;

      await expect(
        LeasingContractInstance.createLease(
          addr1.address,
          1,
          1,
          "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
          startTime,
          endTime
        )
      ).to.be.revertedWith(
        "LeasingContract: Lease duration should be atleast 5 years"
      );
    });
  });
  describe("Set Asset price", function () {
    it("should not set Asset price for non-exisitng token", async function () {
      const { LeasingContractInstance, addr1 } = await loadFixture(
        deployTokenFixture
      );
      await expect(
        LeasingContractInstance.setAssetLeasePrice(2, 100)
      ).to.be.revertedWith("LeasingContract: Nonexistent token");
    });
    it("should  set Asset price for exisitng token", async function () {
      const { LeasingContractInstance, addr1 } = await loadFixture(
        deployTokenFixture
      );

      await LeasingContractInstance.setAssetLeasePrice(1, 100);
      expect(await LeasingContractInstance.assetLeasePrice(1)).to.be.equal(100);
    });
  });
});
