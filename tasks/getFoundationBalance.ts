import { task } from "hardhat/config";
import { FundManager } from "../typechain";
import { BigNumberish } from "ethers";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";

task("getFoundationBalance", "Get total donations amount")
  .addParam("contract", "This FundManager contract address")
  .addParam("foundation", "Foundation contract whose balance you need to know")
  .setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void> => {
    const fundManager: FundManager = <FundManager>(
        await hre.ethers.getContractAt("FundManager", taskArgs.contract as string)
    );
    const foundation = taskArgs.foundation
    console.log("Getting foundation balance...");
    const balance: BigNumberish = await fundManager.getFoundationBalance(foundation);
    
    const ethDonations = hre.ethers.formatEther(balance);
    console.log(`Foundation balance: ${ethDonations} ETH`);
  });