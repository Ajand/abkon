const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("My Dapp", function () {
  let PriceFinder,
    FakeApe,
    ABKoin,
    priceFinder,
    fakeApe,
    abKoin,
    signers,
    abkoinSupply,
    governance,
    firstNftHolder,
    specialist1,
    specialist2,
    specialist3,
    specialist4,
    reputationMul;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  describe("Price Finder", function () {
    it("Should be able to initialize needed contracts", async function () {
      signers = await ethers.getSigners();

      abkoinSupply = 10000000;

      governance = signers[1];

      ABKoin = await ethers.getContractFactory("ABKoin");
      PriceFinder = await ethers.getContractFactory("PriceFinder");
      FakeApe = await ethers.getContractFactory("FakeApe");

      abKoin = await ABKoin.deploy();
      priceFinder = await PriceFinder.deploy();
      fakeApe = await FakeApe.deploy();

      abKoin.initialize(abkoinSupply, governance.address, priceFinder.address);
      priceFinder.initialize(abKoin.address);
    });

    it("Should be able to make the first NFT Request", async function () {
      firstNftHolder = signers[2];

      await fakeApe.connect(firstNftHolder).mint();

      const tokenId = 0;
      const requestId = 0;
      const expectedStatus = 0;

      await fakeApe
        .connect(firstNftHolder)
        .approve(priceFinder.address, tokenId);

      await expect(
        priceFinder
          .connect(firstNftHolder)
          .requestPrice(fakeApe.address, tokenId)
      )
        .to.emit(priceFinder, "RequestPrice")
        .withArgs(firstNftHolder.address, fakeApe.address, tokenId, requestId);

      const request = await priceFinder.getRequest(requestId);

      expect(request.applicant).to.equal(firstNftHolder.address);
      expect(request.collection).to.equal(fakeApe.address);
      expect(String(request.tokenId)).to.equal(String(tokenId));
      expect(request.status).to.equal(expectedStatus);
    });

    it("Applicant Should be able to drop an NFT request if it's waiting", async function () {
      firstNftHolder;
      const requestId = 0;
      const expectedStatus = 1;

      await expect(priceFinder.dropRequest(requestId)).to.be.revertedWith(
        "not owner"
      );

      await expect(priceFinder.connect(firstNftHolder).dropRequest(requestId))
        .to.emit(priceFinder, "RequestDropped")
        .withArgs(requestId);

      const request = await priceFinder.getRequest(requestId);

      expect(request.status).to.equal(expectedStatus);
    });

    it("Specialist should be able to stake some abkoin", async function () {
      specialist1 = signers[10];
      const specialistBalance = 10000;
      const stakeAmount = 1000;

      await abKoin
        .connect(governance)
        .transfer(specialist1.address, specialistBalance);
      await abKoin
        .connect(specialist1)
        .approve(priceFinder.address, stakeAmount);

      await expect(priceFinder.connect(specialist1).stakeABK(stakeAmount))
        .to.emit(priceFinder, "StakeSpecialist")
        .withArgs(specialist1.address, stakeAmount);

      const specialist = await priceFinder.getSpecialist(specialist1.address);

      const expectedReputation = 1;
      const expectedLockedWeight = 0;
      reputationMul = 10000;

      expect(String(specialist.reputation)).to.equal(
        String(expectedReputation * reputationMul)
      );
      expect(String(specialist.stakes)).to.equal(String(stakeAmount));
      expect(String(specialist.lockedWeight)).to.equal(
        String(expectedLockedWeight)
      );
    });

    it("Specialist should be able to dstake staked abkoin", async function () {
      specialist1 = signers[10];
      const wrongDestakeAmount = 2000;
      const destakeAmount = 200;

      await expect(
        priceFinder.connect(specialist1).destakeABK(wrongDestakeAmount)
      ).to.be.revertedWith("too much");

      await expect(priceFinder.connect(specialist1).destakeABK(destakeAmount))
        .to.emit(priceFinder, "DeStakeSpecialist")
        .withArgs(specialist1.address, destakeAmount);

      const specialist = await priceFinder.getSpecialist(specialist1.address);

      const expectedReputation = 1;
      const expectedLockedWeight = 0;
      const expectedStakedAmount = 800;

      expect(String(specialist.reputation)).to.equal(
        String(expectedReputation * reputationMul)
      );
      expect(String(specialist.stakes)).to.equal(String(expectedStakedAmount));
      expect(String(specialist.lockedWeight)).to.equal(
        String(expectedLockedWeight)
      );
    });

    it("Must be able to get specialist free weight", async function () {
      const expectedFreeWeight = 800;

      const specialistFreeWeight = await priceFinder.getSpecialistFreeWeight(
        specialist1.address
      );

      expect(String(specialistFreeWeight)).to.equal(
        String(expectedFreeWeight * reputationMul)
      );
    });

    it("An staked specialist must be able to price an asset", async function () {
      await fakeApe.connect(firstNftHolder).mint();
      const tokenId = 1;
      await fakeApe
        .connect(firstNftHolder)
        .approve(priceFinder.address, tokenId);

      await priceFinder
        .connect(firstNftHolder)
        .requestPrice(fakeApe.address, tokenId);

      const wrongRequestId = 0;
      const requestId = 1;

      const wrongPrice = 1500;
      const price = 300;

      await expect(
        priceFinder.connect(specialist1).priceAsset(wrongRequestId, price)
      ).to.be.revertedWith("not active");

      await expect(
        priceFinder.connect(specialist1).priceAsset(requestId, wrongPrice)
      ).to.be.revertedWith("not enough weight");

      await expect(
        priceFinder.connect(specialist1).priceAsset(requestId, price)
      )
        .to.emit(priceFinder, "PricedAsset")
        .withArgs(requestId, specialist1.address, price);

      const wrongOffers = await priceFinder.getAssetOffers(wrongRequestId);
      const offers = await priceFinder.getAssetOffers(requestId);

      expect(wrongOffers.length).to.equal(0);

      expect(String(offers[0].value)).to.equal(String(price));
      expect(String(offers[0].specialist)).to.equal(
        String(specialist1.address)
      );
    });

    it("Must be able to calculate asset final offer", async function () {
      specialist2 = signers[11];
      const specialistBalance = 10000;
      const stakeAmount = 2500;
      const requestId = 1;

      const price = 500;

      await abKoin
        .connect(governance)
        .transfer(specialist2.address, specialistBalance);
      await abKoin
        .connect(specialist2)
        .approve(priceFinder.address, stakeAmount);

      await priceFinder.connect(specialist2).stakeABK(stakeAmount);

      await priceFinder.connect(specialist2).priceAsset(requestId, price);

      const expectedOffer = 400;
      const calculatedPrice = await priceFinder.calculateAssetOffer(requestId);

      expect(String(calculatedPrice)).to.equal(String(expectedOffer));
    });

    it("Must be able to accept an offer after delay", async function () {
      const requestId = 1;

      await expect(
        priceFinder.connect(specialist1).acceptOffer(requestId)
      ).to.be.revertedWith("not owner");

      await expect(
        priceFinder.connect(firstNftHolder).acceptOffer(requestId)
      ).to.be.revertedWith("must wait");

      await network.provider.send("evm_increaseTime", [2 * 60]);
      await network.provider.send("evm_mine");

      await expect(priceFinder.connect(firstNftHolder).acceptOffer(requestId))
        .to.emit(priceFinder, "AcceptOffer")
        .withArgs(requestId);

      const holderBalance = await abKoin.balanceOf(firstNftHolder.address);

      const expectedBalance = 380;
      const expectedStatus = 2;

      expect(String(holderBalance)).to.equal(String(expectedBalance));

      const request = await priceFinder.getRequest(requestId);

      expect(request.status).to.equal(expectedStatus);

      const rewards = await priceFinder.calculateSpecialistsRewards(requestId);

      const expectedReward = 10;

      expect(String(rewards[0].amount)).to.equal(String(expectedReward));
      expect(String(rewards[1].amount)).to.equal(String(expectedReward));
    });
  });
});
