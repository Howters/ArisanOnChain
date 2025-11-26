import { createPublicClient, createWalletClient, http, type Chain } from "viem";
import { sepolia } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

const liskSepolia: Chain = {
  id: 4202,
  name: "Lisk Sepolia",
  nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.sepolia-api.lisk.com"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://sepolia-blockscout.lisk.com" },
  },
  testnet: true,
};

const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31337);

export const chain: Chain = chainId === 4202
  ? {
      ...liskSepolia,
      rpcUrls: {
        default: {
          http: [process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.sepolia-api.lisk.com"],
        },
      },
    }
  : chainId === 11155111
  ? {
      ...sepolia,
      rpcUrls: {
        default: {
          http: [process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.sepolia.org"],
        },
      },
    }
  : {
      id: 31337,
      name: "Localhost",
      nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: {
        default: { http: [process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545"] },
      },
    };

export const publicClient = createPublicClient({
  chain,
  transport: http(),
});

export function getRelayerClient() {
  const privateKey = process.env.RELAYER_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    throw new Error("RELAYER_PRIVATE_KEY not configured");
  }

  const account = privateKeyToAccount(privateKey);

  return createWalletClient({
    account,
    chain,
    transport: http(),
  });
}

export function getUserWalletClient(privateKey: `0x${string}`) {
  const account = privateKeyToAccount(privateKey);

  return createWalletClient({
    account,
    chain,
    transport: http(),
  });
}

export const CONTRACTS = {
  MOCK_IDRX: (process.env.NEXT_PUBLIC_MOCK_IDRX_ADDRESS || "0x0") as `0x${string}`,
  DEBT_NFT: (process.env.NEXT_PUBLIC_DEBT_NFT_ADDRESS || "0x0") as `0x${string}`,
  FACTORY: (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "0x0") as `0x${string}`,
};

