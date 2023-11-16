import { run } from "hardhat";

export const verify = async (contractAddress: string, contractName: string, args: any[]) => {
    console.log(`Starting verify ${contractName}...`);
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
        console.log(`Contract: ${contractName} verify success`);
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log(`${contractName} already verified !`);
        } else {
            console.log(e);
        }
    }
}