import { createConfig } from "ponder";
import { http } from "viem";

import { ArisanFactoryAbi } from "./abis/ArisanFactory";
import { ArisanPoolAbi } from "./abis/ArisanPool";
import { MockIDRXAbi } from "./abis/MockIDRX";
import { DebtNFTAbi } from "./abis/DebtNFT";
import { ReputationRegistryAbi } from "./abis/ReputationRegistry";

const isProduction = !!process.env.DATABASE_URL;

export default createConfig({
  database: isProduction
    ? { kind: "postgres", connectionString: process.env.DATABASE_URL }
    : { kind: "pglite" },
  networks: {
    liskSepolia: {
      chainId: 4202,
      transport: http(process.env.PONDER_RPC_URL_4202 || "https://rpc.sepolia-api.lisk.com"),
    },
  },
  contracts: {
    ArisanFactory: {
      network: "liskSepolia",
      abi: ArisanFactoryAbi,
      address: (process.env.FACTORY_ADDRESS || "0x408B766445DE60601Ef91948D64600781Bf1205e") as `0x${string}`,
      startBlock: Number(process.env.START_BLOCK) || 22066941,
    },
    ArisanPool: {
      network: "liskSepolia",
      abi: ArisanPoolAbi,
      factory: {
        address: (process.env.FACTORY_ADDRESS || "0x408B766445DE60601Ef91948D64600781Bf1205e") as `0x${string}`,
        event: ArisanFactoryAbi[0],
        parameter: "poolAddress",
      },
    },
    MockIDRX: {
      network: "liskSepolia",
      abi: MockIDRXAbi,
      address: (process.env.MOCK_IDRX_ADDRESS || "0x6447b2e746a4f3a8b9aE17BB622aeA5e384d350e") as `0x${string}`,
      startBlock: Number(process.env.START_BLOCK) || 22066941,
    },
    DebtNFT: {
      network: "liskSepolia",
      abi: DebtNFTAbi,
      address: (process.env.DEBT_NFT_ADDRESS || "0x9023c80a46Ff25e58e82A5a4A172c795A88C3056") as `0x${string}`,
      startBlock: Number(process.env.START_BLOCK) || 22066941,
    },
    ReputationRegistry: {
      network: "liskSepolia",
      abi: ReputationRegistryAbi,
      address: (process.env.REPUTATION_REGISTRY_ADDRESS || "0x3e096083653664fC0FEac7ac836Cd649781e4376") as `0x${string}`,
      startBlock: Number(process.env.START_BLOCK) || 22066941,
    },
  },
});
