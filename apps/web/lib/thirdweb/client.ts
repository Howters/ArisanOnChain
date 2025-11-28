import { createThirdwebClient, defineChain } from "thirdweb";

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

export const liskSepolia = defineChain({
  id: 4202,
  name: "Lisk Sepolia",
  nativeCurrency: {
    name: "Sepolia ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpc: "https://rpc.sepolia-api.lisk.com",
  blockExplorers: [
    {
      name: "Blockscout",
      url: "https://sepolia-blockscout.lisk.com",
    },
  ],
  testnet: true,
});

export const CONTRACTS = {
  MOCK_IDRX: process.env.NEXT_PUBLIC_MOCK_IDRX_ADDRESS as `0x${string}`,
  DEBT_NFT: process.env.NEXT_PUBLIC_DEBT_NFT_ADDRESS as `0x${string}`,
  REPUTATION_REGISTRY: process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS as `0x${string}`,
  FACTORY: process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`,
  PLATFORM_WALLET: process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS as `0x${string}`,
};
