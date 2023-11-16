import * as dotenv from "dotenv";

import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "hardhat-contract-sizer";
import "./tasks";

dotenv.config();

const MAINNET_RPC_URL = 
      process.env.MAINNET_RPC_URL ||
      process.env.ALCHEMY_MAINNET_RPC_URL ||
      `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`;

const POLYGON_MAINNET_RPC_URL = 
      process.env.POLYGON_MAINNET_RPC_URL ||
      `https://polygon-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`;

const POLYGON_MUMBAI_RPC_URL = 
      process.env.POLYGON_MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com";

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY || '',
      mainnet: ETHERSCAN_API_KEY || '',
      polygon: POLYGONSCAN_API_KEY || '',
      polygonMumbai: POLYGONSCAN_API_KEY || '',
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
    mainnet: {
      url: MAINNET_RPC_URL,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      saveDeployments: true,
      chainId: 1,
    },
    polygon: {
      url: POLYGON_MAINNET_RPC_URL,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      saveDeployments: true,
      chainId: 137
    },
    polygonMumbai: {
      url: POLYGON_MUMBAI_RPC_URL,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      saveDeployments: true,
      chainId: 80001
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.20",
      },
      {
        version: "0.8.19",
      },
      {
        version: "0.8.18",
      },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 800,
      },
    },
  },
  mocha: {
    timeout: 20000,
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v6",
  },
};


export default config