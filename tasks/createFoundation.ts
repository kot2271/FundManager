import { task } from "hardhat/config";
import { FundManager } from "../typechain";
import { BigNumberish } from "ethers";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";


task("createFoundation", "Creating a new foundation")
   .addParam("receiver", "Address of the donation receiver")
   .addParam("description", "Description of the foundation")
   .addParam("value", "Amount of donation")
   .setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void> => {
       const fundManager: FundManager = <FundManager>(
           await hre.ethers.getContractAt("FundManager", taskArgs.receiver)
       );
       const value: BigNumberish = taskArgs.value;
       const etherValue = hre.ethers.parseEther(value.toString());
       const tx = await fundManager.createFoundation(taskArgs.receiver, taskArgs.description, { value: etherValue });
       const receipt = await tx.wait();
    let contractAddress;
    let foundationOwner;
    let description;
    if (receipt?.logs) {
        const log = receipt.logs.find(log => log.topics[0] === fundManager.interface.getEventName("FoundationCreated"));
        if (log) {
            const newFoundationLogs = fundManager.interface.parseLog({
                topics: [...log.topics],
                data: log.data,
            });
        contractAddress = newFoundationLogs?.args[0];
        foundationOwner = newFoundationLogs?.args[1];
        description = newFoundationLogs?.args[2];
       }
    }
    console.log(`New foundation contract address: ${contractAddress}`);
    console.log(`New foundation owner: ${foundationOwner}`);
    console.log(`New foundation description: ${description}`);
    console.log("Foundation was successfully created!");
   });