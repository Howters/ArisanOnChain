import { createConfig } from "ponder";
import { http } from "viem";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({ path: ".env.local" });

import { ArisanFactoryAbi } from "./abis/ArisanFactory";
import { ArisanPoolAbi } from "./abis/ArisanPool";
import { MockIDRXAbi } from "./abis/MockIDRX";
import { DebtNFTAbi } from "./abis/DebtNFT";
import { ReputationRegistryAbi } from "./abis/ReputationRegistry";

const isProduction = !!process.env.DATABASE_URL;

const config: ReturnType<typeof createConfig> = createConfig({
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
      address: process.env.FACTORY_ADDRESS as `0x${string}`,
      startBlock: Number(process.env.START_BLOCK),
    },
    ArisanPool: {
      network: "liskSepolia",
      abi: ArisanPoolAbi,
      startBlock: Number(process.env.START_BLOCK),
      factory: {
        address: process.env.FACTORY_ADDRESS as `0x${string}`,
        event: ArisanFactoryAbi.find((item: any) => item.type === "event" && item.name === "PoolCreated"),
        parameter: "poolAddress",
      },
    } as any,
    MockIDRX: {
      network: "liskSepolia",
      abi: MockIDRXAbi,
      address: process.env.MOCK_IDRX_ADDRESS as `0x${string}`,
      startBlock: Number(process.env.START_BLOCK),
    },
    DebtNFT: {
      network: "liskSepolia",
      abi: DebtNFTAbi,
      address: process.env.DEBT_NFT_ADDRESS as `0x${string}`,
      startBlock: Number(process.env.START_BLOCK),
    },
    ReputationRegistry: {
      network: "liskSepolia",
      abi: ReputationRegistryAbi,
      address: process.env.REPUTATION_REGISTRY_ADDRESS as `0x${string}`,
      startBlock: Number(process.env.START_BLOCK),
    },
  },
});

export default config;
