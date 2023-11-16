import { task } from "hardhat/config";
import { Foundation } from "../typechain";
import { BigNumberish } from "ethers";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";

task("donate", "making donations to a contract")
    .addParam("contract", "Foundation contract address")
    .addParam("value", "amount of donation")
    .setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void> => {
        const foundation: Foundation = <Foundation>(
            await hre.ethers.getContractAt("Foundation", taskArgs.contract as string)
        );
        const initialFoundationBalance = await hre.ethers.provider.getBalance(foundation.getAddress());
        const initEthBalance = hre.ethers.formatEther(initialFoundationBalance);
        console.log(`Сurrent foundation balance: ${initEthBalance} ETH`)

        const etherValue: BigNumberish = hre.ethers.parseEther(taskArgs.value.toString());
        await foundation.donate({ value: etherValue });
        console.log("Your donation was successful!")
        
        const afterDonationsBalance = await hre.ethers.provider.getBalance(foundation.getAddress());
        const ethDonations = hre.ethers.formatEther(afterDonationsBalance);
        console.log(`Total sum of donations: ${ethDonations} ETH`);
    });