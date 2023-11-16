import { task } from "hardhat/config";
import { Foundation } from "../typechain";
import { BigNumberish } from "ethers";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";


task("sendFunds", "Transfer ether from contract to recipient")
  .addParam("contract", "Foundation contract address")
  .addParam("receiver", "Address to send ether") 
  .addParam("amount", "Amount in ether")
  .setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void> => {
    const foundation: Foundation = <Foundation>(
        await hre.ethers.getContractAt("Foundation", taskArgs.contract as string)
    );
    const receiver = taskArgs.receiver;
    const amount = hre.ethers.parseEther(taskArgs.amount);

    const initReceiverBalance: BigNumberish = await hre.ethers.provider.getBalance(receiver);
    console.log(`Initial receiver balance: ${initReceiverBalance} wei`);

    await foundation.sendFunds(amount);

    let newReceiverBalance: BigNumberish = await hre.ethers.provider.getBalance(receiver);
    console.log(`New receiver balance: ${newReceiverBalance} wei`);

    const diff = newReceiverBalance - initReceiverBalance;
    const ethDiff = hre.ethers.formatEther(diff);
    console.log(`Ether sent: ${ethDiff} ETH`);
});