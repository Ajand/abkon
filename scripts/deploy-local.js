const { ethers } = require("hardhat");

// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  signers = await ethers.getSigners();

  abkoinSupply = 10000000;

  governance = signers[1];

  ABKoin = await ethers.getContractFactory("ABKoin");
  PriceFinder = await ethers.getContractFactory("PriceFinder");
  AuctionHouse = await ethers.getContractFactory("AuctionHouse");
  FakeApe = await ethers.getContractFactory("FakeApe");

  abKoin = await ABKoin.deploy();
  priceFinder = await PriceFinder.deploy();
  fakeApe = await FakeApe.deploy();
  auctionHouse = await AuctionHouse.deploy();

  console.log(abKoin.address);

  await abKoin.initialize(
    abkoinSupply,
    governance.address,
    priceFinder.address
  );
  await priceFinder.initialize(abKoin.address, auctionHouse.address);
  await auctionHouse.initialize(abKoin.address, priceFinder.address);

  console.log("ABKoin Address: ", abKoin.address);
  console.log("Price Finder Address: ", priceFinder.address);
  console.log("Fake Ape Address: ", fakeApe.address);
  console.log("Auction House Address: ", auctionHouse.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
