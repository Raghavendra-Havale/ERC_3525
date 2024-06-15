// test/Token.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token Contract", function () {
  let Token;
  let token;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    Token = await ethers.getContractFactory("VMANToken");
    token = await Token.deploy();
  });

  it("Should deploy with the correct name and symbol", async function () {
    expect(await token.name()).to.equal("Asset Management Token");
    expect(await token.symbol()).to.equal("VMANToken");
  });

  it("Should mint initial supply and assign to the owner", async function () {
    const ownerBalance = await token.balanceOf(owner.address);
    const decimals = await token.decimals();
    expect(ownerBalance).to.equal(
      BigInt(10000000) * BigInt(10) ** BigInt(decimals)
    );
  });

  it("Should allow the owner to mint new tokens", async function () {
    await token.connect(owner).mint(addr1.address, 1000);
    const addr1Balance = await token.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(1000);
  });

  it("Should allow the owner to burn tokens", async function () {
    await token.connect(owner).mint(addr1.address, 1000);
    await token.connect(owner).burn(addr1.address, 500);
    const addr1Balance = await token.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(500);
  });

  it("Should allow the owner to transfer tokens", async function () {
    await token.connect(owner).mint(addr1.address, 1000);
    await token.connect(owner).transfer(addr2.address, 500);
    const addr2Balance = await token.balanceOf(addr2.address);
    expect(addr2Balance).to.equal(500);
  });
});
