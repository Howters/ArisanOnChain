import { createConfig } from "@ponder/core";
import { http } from "viem";

import { ArisanFactoryAbi } from "./abis/ArisanFactory";
import { ArisanPoolAbi } from "./abis/ArisanPool";
import { MockIDRXAbi } from "./abis/MockIDRX";
import { DebtNFTAbi } from "./abis/DebtNFT";

export default createConfig({
  networks: {
    sepolia: {
      chainId: 11155111,
      transport: http(process.env.PONDER_RPC_URL_11155111),
    },
  },
  contracts: {
    ArisanFactory: {
      network: "sepolia",
      abi: ArisanFactoryAbi,
      address: process.env.FACTORY_ADDRESS as `0x${string}`,
      startBlock: Number(process.env.START_BLOCK) || 0,
    },
    ArisanPool: {
      network: "sepolia",
      abi: ArisanPoolAbi,
      factory: {
        address: process.env.FACTORY_ADDRESS as `0x${string}`,
        event: ArisanFactoryAbi[0],
        parameter: "poolAddress",
      },
    },
    MockIDRX: {
      network: "sepolia",
      abi: MockIDRXAbi,
      address: process.env.MOCK_IDRX_ADDRESS as `0x${string}`,
      startBlock: Number(process.env.START_BLOCK) || 0,
    },
    DebtNFT: {
      network: "sepolia",
      abi: DebtNFTAbi,
      address: process.env.DEBT_NFT_ADDRESS as `0x${string}`,
      startBlock: Number(process.env.START_BLOCK) || 0,
    },
  },
});


