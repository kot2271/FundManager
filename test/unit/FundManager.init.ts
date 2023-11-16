import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { Foundation, FundManager } from "../../typechain";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

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

  async function parseLogs() {
    const tx = await fundManager.connect(owner).createFoundation(receiver.address, "Test Foundation", {value: oneEther});
    let argsArray;
    let foundationAddress;
    let ownerAddress;
    let description;
    const receipt = await tx.wait();
    if (receipt) {
      const parsedLogs = receipt.logs.map((log) => {
        try {
          return fundManager.interface.parseLog({
            topics: [...log.topics],
            data: log.data,
          });
        } catch (e) {
          return null; // not a log from the FundManager contract
        }
      }).filter((log) => log !== null);
      argsArray = parsedLogs.map((log) => log?.args);
    }
   
    for (const args of Object(argsArray)) {
      [foundationAddress, ownerAddress, description] = args;
    }
   
    return { foundationAddress, ownerAddress, description };
   }

  describe("createFoundation", function () {

    it("Should create new foundation and emit event 'FoundationCreated'", async function () {
        const { foundationAddress, ownerAddress, description } = await loadFixture(parseLogs);

        expect(await fundManager.connect(owner).createFoundation(receiver.address, "Test Foundation", {value: oneEther}))
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
        const { foundationAddress } = await loadFixture(parseLogs);
        expect(await fundManager.connect(owner).transferFundsToReceiver(foundationAddress, halfEther))
          .to.emit(foundation, "FundsSent")
          .withArgs(receiver.address, halfEther);
    });

    it("Should be to reduce the foundationBalance after sending funds", async function () {
        const { foundationAddress } = await loadFixture(parseLogs);

        await fundManager.connect(owner).transferFundsToReceiver(foundationAddress, halfEther); 

        const afterBalance = await ethers.provider.getBalance(foundationAddress);
        expect(afterBalance).to.equal(halfEther);
    
    });

    it("Should be reverted with custom error 'UnauthorizedAccess'", async function () {
        const { foundationAddress, ownerAddress } = await loadFixture(parseLogs);

        expect(await fundManager.connect(owner).createFoundation(receiver.address, "Test Foundation", {value: oneEther}))
          .to.emit(fundManager, "FoundationCreated")
          .withArgs(foundationAddress, ownerAddress, "Test Foundation");

        await expect(fundManager.connect(user1).transferFundsToReceiver(foundationAddress, halfEther))
          .to.be.revertedWithCustomError(fundManager, "UnauthorizedAccess");
    });

  describe("getFoundationBalance", function () {
    it("Should get foundation balance", async function () {
        const { foundationAddress } = await loadFixture(parseLogs);
        const balance = await fundManager.getFoundationBalance(foundationAddress);
        expect(balance).to.equal(oneEther);
    });
  });

 });
});