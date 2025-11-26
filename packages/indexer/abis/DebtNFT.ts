export const DebtNFTAbi = [
  {
    type: "event",
    name: "DebtNFTMinted",
    inputs: [
      { indexed: true, name: "member", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: true, name: "poolId", type: "uint256" },
      { indexed: false, name: "defaultedAmount", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: true, name: "tokenId", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "debtRecords",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      { name: "poolId", type: "uint256" },
      { name: "defaultedAmount", type: "uint256" },
      { name: "timestamp", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserDebtCount",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserDebtTokens",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
  },
] as const;


