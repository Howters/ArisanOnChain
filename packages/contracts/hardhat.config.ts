import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";
const LISK_SEPOLIA_RPC_URL = process.env.LISK_SEPOLIA_RPC_URL || "https://rpc.sepolia-api.lisk.com";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const BLOCKSCOUT_API_KEY = "abc123";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    liskSepolia: {
      url: LISK_SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 4202,
      gasPrice: 1000000000,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
      liskSepolia: BLOCKSCOUT_API_KEY,
    },
    customChains: [
      {
        network: "liskSepolia",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com",
        },
      },
    ],
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
};

export default config;

