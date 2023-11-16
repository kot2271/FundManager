import { task } from "hardhat/config";
import { FundManager } from "../typechain";
import { BigNumberish } from "ethers";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { Address } from "hardhat-deploy/dist/types";

task("getFoundationBalance", "Get total donations amount")
  .addParam("contract", "Foundation contract address")
  .setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void> => {
    const fundManager: FundManager = <FundManager>(
        await hre.ethers.getContractAt("FundManager", taskArgs.contract as string)
    );
    const contarct: Address = taskArgs.contract
    console.log("Getting foundation balance...");
    const balance: BigNumberish = await fundManager.getFoundationBalance(contarct);
    
    const ethDonations = hre.ethers.formatEther(balance);
    console.log(`Foundation balance: ${ethDonations} ETH`);
  });