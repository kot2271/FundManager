import { ethers } from "hardhat";
import { Foundation } from "../typechain";
import { Foundation__factory } from "../typechain";
import { FundManager } from "../typechain";
import { FundManager__factory } from "../typechain";
import { verify } from "./helpers/verify";
import { delay } from "./helpers/delay";


async function deploy(): Promise<void> {

  const foundationConractName: string = "Foundation";

  const foundationFactory: Foundation__factory = <Foundation__factory>(
    await ethers.getContractFactory(foundationConractName)
  );

  const receiverAddress: string = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const description: string = "Main Foundation";

  const foundation: Foundation = <Foundation>(
    await foundationFactory.deploy(receiverAddress, description)
  );

  await foundation.waitForDeployment();

  const foundationContractAddress = await foundation.getAddress();

  console.log(`Contract ${foundationConractName} deployed at: ${foundationContractAddress}`);
  await delay(20000);
  await verify(foundationContractAddress, foundationConractName, [receiverAddress, description]);

  const fundManagerConractName: string = "FundManager";

  const fundManagerFactory: FundManager__factory = <FundManager__factory>(
    await ethers.getContractFactory(fundManagerConractName)
  );

  const fundManager: FundManager = <FundManager>(
    await fundManagerFactory.deploy()
  );

  await fundManager.waitForDeployment();

  const fundManagerContractAddress = await fundManager.getAddress();

  console.log(`Contract ${fundManagerConractName} deployed at: ${fundManagerContractAddress}`);
  await delay(20000);
  await verify(fundManagerContractAddress, fundManagerConractName, []);
}

deploy()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
