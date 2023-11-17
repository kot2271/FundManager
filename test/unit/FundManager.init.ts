import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Foundation, FundManager } from "../../typechain";

const oneEther = ethers.parseEther("1");
const halfEther = ethers.parseEther("0.5");

describe("Foundation", function () {

  let owner: SignerWithAddress;
  let receiver: SignerWithAddress;
  let user1: SignerWithAddress;
  let foundation: Foundation;

  beforeEach(async function () {
    [owner, receiver, user1] = await ethers.getSigners();

    const Foundation = await ethers.getContractFactory("Foundation");
    foundation = await Foundation.deploy(receiver.address, "Main Foundation");
  });

  describe("Check initials param's of Foundation contract", function () {

    it("Should set receiver and description", async function () {
        expect(await foundation.receiver()).to.equal(receiver.address);
        expect(await foundation.description()).to.equal("Main Foundation");
    });
  });

  describe("Donate", function () {

    it("Should allow donations", async function () {
        await expect(foundation.connect(user1).donate({value: oneEther}))
            .to.emit(foundation, "FundReceived")
            .withArgs(user1.address, oneEther);
        
        const balance = await ethers.provider.getBalance(foundation.getAddress());
        expect(balance).to.equal(oneEther); 
    });

    it("Should be reverted with custom error 'DonationAmountMustBeGreaterThanZero'", async function () {
        await expect(foundation.connect(user1).donate({value: 0}))
        .to.be.revertedWithCustomError(foundation, "DonationAmountMustBeGreaterThanZero"); 
    });
  });

  describe("sendFunds", function () {
    it("Should allow owner to send funds", async function () {
        await foundation.connect(user1).donate({value: oneEther});
    
        await expect(foundation.connect(owner).sendFunds(halfEther))
          .to.emit(foundation, "FundsSent")
          .withArgs(receiver.address, halfEther);
    
        expect(await ethers.provider.getBalance(foundation.getAddress())).to.equal(halfEther);
    });

    it("Should be reverted with custom error 'OwnableUnauthorizedAccount'", async function () {
        await foundation.connect(user1).donate({value: oneEther});
    
        await expect(foundation.connect(user1).sendFunds(halfEther))
          .to.be.revertedWithCustomError(foundation, "OwnableUnauthorizedAccount"); 
    });

    it("Should be reverted with custom error 'InsufficientBalance'", async function () {
        await foundation.connect(user1).donate({value: halfEther});
    
        await expect(foundation.connect(owner).sendFunds(oneEther))
          .to.be.revertedWithCustomError(foundation, "InsufficientBalance"); 
    });

  });

});

describe("FundManager", function () {

  let owner: SignerWithAddress;
  let receiver: SignerWithAddress;
  let user1: SignerWithAddress;
  let fundManager: FundManager;
  let foundation: Foundation;

  beforeEach(async function () {
    [owner, receiver, user1] = await ethers.getSigners();

    const foundationFactory = await ethers.getContractFactory("Foundation", owner);
    foundation = (await foundationFactory.deploy(receiver.address, "Main Foundation")) as Foundation;

    const fundManagerFactory = await ethers.getContractFactory("FundManager", owner);
    fundManager = (await fundManagerFactory.deploy()) as FundManager; 
  });

  describe("createFoundation", function () {

    it("Should create new foundation and emit event 'FoundationCreated'", async function () {
        const newFoundation = await fundManager.createFoundation(receiver.address, "Test Foundation", {value: oneEther});

        const filter = fundManager.filters["FoundationCreated(address,address,string)"];
        const events = await fundManager.queryFilter(filter);

        const foundationAddress = events[0].args[0];
        const ownerAddress = events[0].args[1];
        const description = events[0].args[2];

        expect(newFoundation)
            .to.emit(fundManager, "FoundationCreated")
            .withArgs(foundationAddress, ownerAddress, "Test Foundation");
        
        expect(ownerAddress).to.equal(owner.address);
        expect(await ethers.provider.getBalance(foundationAddress)).to.equal(oneEther);
        expect(await foundation.receiver()).to.equal(receiver.address);
        expect(description).to.equal("Test Foundation");
    });

    it("Should create new foundation and emit event 'FundReceived'", async function () {
        expect(await fundManager.connect(owner).createFoundation(receiver.address, "Test Foundation", {value: oneEther}))
          .to.emit(foundation, "FundReceived")
          .withArgs(foundation.owner(), oneEther);
    });

  });

  describe("transferFundsToReceiver", function () {

    it("Should allow sending funds", async function () {
        await fundManager.createFoundation(receiver.address, "Test Foundation", {value: oneEther});

        const filter = fundManager.filters["FoundationCreated(address,address,string)"];
        const events = await fundManager.queryFilter(filter);
        const foundationAddress = events[0].args[0];

        expect(await fundManager.connect(owner).transferFundsToReceiver(foundationAddress, halfEther))
          .to.emit(foundation, "FundsSent")
          .withArgs(receiver.address, halfEther);
    });

    it("Should be to reduce the foundationBalance after sending funds", async function () {
        await fundManager.createFoundation(receiver.address, "Test Foundation", {value: oneEther});

        const filter = fundManager.filters["FoundationCreated(address,address,string)"];
        const events = await fundManager.queryFilter(filter);
        const foundationAddress = events[0].args[0];

        await fundManager.connect(owner).transferFundsToReceiver(foundationAddress, halfEther); 

        const afterBalance = await ethers.provider.getBalance(foundationAddress);
        expect(afterBalance).to.equal(halfEther);
    
    });

    it("Should increase the receiver's balance", async function () {
        await fundManager.createFoundation(receiver.address, "Test Foundation", {value: oneEther});

        const initReceiverBalance = await ethers.provider.getBalance(receiver.address);

        const filter = fundManager.filters["FoundationCreated(address,address,string)"];
        const events = await fundManager.queryFilter(filter);
        const foundationAddress = events[0].args[0];

        await fundManager.connect(owner).transferFundsToReceiver(foundationAddress, halfEther);

        const receiverBalance = await ethers.provider.getBalance(receiver.address);
        expect(receiverBalance).to.equal(initReceiverBalance + halfEther);

    
    });

    it("Should be reverted with custom error 'UnauthorizedAccess'", async function () {
        await fundManager.createFoundation(receiver.address, "Test Foundation", {value: oneEther});

        const filter = fundManager.filters["FoundationCreated(address,address,string)"];
        const events = await fundManager.queryFilter(filter);
        const foundationAddress = events[0].args[0];

        await expect(fundManager.connect(user1).transferFundsToReceiver(foundationAddress, halfEther))
          .to.be.revertedWithCustomError(fundManager, "UnauthorizedAccess");
    });
 });

  describe("getFoundationBalance", function () {
    it("Should get foundation balance", async function () {
        await fundManager.createFoundation(receiver.address, "Test Foundation", {value: oneEther});

        const filter = fundManager.filters["FoundationCreated(address,address,string)"];
        const events = await fundManager.queryFilter(filter);
        const foundationAddress = events[0].args[0];

        const balance = await fundManager.getFoundationBalance(foundationAddress);
        expect(balance).to.equal(oneEther);
    });
  });
});