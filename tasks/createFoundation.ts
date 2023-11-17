import { task } from "hardhat/config";
import { FundManager } from "../typechain";
import { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";


task("createFoundation", "Creating a new foundation")
   .addParam("contract", "This FundManager contract address")
   .addParam("receiver", "Address of the donation receiver")
   .addParam("description", "Description of the foundation")
   .addParam("value", "Amount of donation")
   .setAction(async (taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment): Promise<void> => {
        const fundManager: FundManager = <FundManager>(
           await hre.ethers.getContractAt("FundManager", taskArgs.contract as string)
       );
        const value: string = taskArgs.value;
        const etherValue = hre.ethers.parseEther(value);

        await fundManager.createFoundation(taskArgs.receiver, taskArgs.description, { value: etherValue });

        const filter = fundManager.filters["FoundationCreated(address,address,string)"];
        const events = await fundManager.queryFilter(filter);

        const foundationAddress = events[0].args[0];
        const ownerAddress = events[0].args[1];
        const description = events[0].args[2];

        console.log(`New foundation contract address: ${foundationAddress}`);
        console.log(`New foundation owner: ${ownerAddress}`);
        console.log(`New foundation description: ${description}`);
        console.log("Foundation was successfully created!");
   });