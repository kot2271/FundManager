import { task } from "hardhat/config";
import { FundManager, Foundation } from "../typechain";
import { BigNumberish } from "ethers";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";


task("transferFundsToReceiver", "Transferring funds to a receiver")
    .addParam("contract", "This FundManager contract address")
    .addParam("foundation", "Address of the foundation")
    .addParam("amount", "Amount of funds to transfer")
    .setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void> => {
       const fundManager: FundManager = <FundManager>(
        await hre.ethers.getContractAt("FundManager", taskArgs.contract as string)
       );
       const foundationContract: Foundation = <Foundation>(
        await hre.ethers.getContractAt("Foundation", taskArgs.foundation as string)
       );

       const amount: string = taskArgs.amount;
       const ethAmount: BigNumberish = hre.ethers.parseEther(amount)
       const foundation = taskArgs.foundation;
       const beforeBalance = await hre.ethers.provider.getBalance(foundation);
       const ethBeforeBalance = hre.ethers.formatEther(beforeBalance);
       console.log(`foundation balance before transfer: ${ethBeforeBalance} ETH`);

       await fundManager.transferFundsToReceiver(foundation, ethAmount);

        const filter = foundationContract.filters["FundsSent(address,uint256)"]
        const events = await foundationContract.queryFilter(filter)

        const receiverAddress = events[0].args[0];
        console.log(`receiver address: ${receiverAddress}`);

        const transferAmount = events[0].args[1];
        const ethTransferAmount = hre.ethers.formatEther(transferAmount);
        console.log(`transfer amount: ${ethTransferAmount} ETH`);

        const afterBalance = await hre.ethers.provider.getBalance(foundation);
        const ethAfterBalance = hre.ethers.formatEther(afterBalance);
        console.log(`foundation balance after transfer: ${ethAfterBalance} ETH`);

        const receiverBalance = await hre.ethers.provider.getBalance(receiverAddress)
        const ethReceiverBalance = hre.ethers.formatEther(receiverBalance);
        console.log(`receiver balance: ${ethReceiverBalance} ETH`);
        console.log("Funds were successfully transferred!");
    });