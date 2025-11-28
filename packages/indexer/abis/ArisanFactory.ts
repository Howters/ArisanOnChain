export const ArisanFactoryAbi = [
  {
    type: "event",
    name: "PoolCreated",
    inputs: [
      { indexed: true, name: "poolId", type: "uint256" },
      { indexed: true, name: "poolAddress", type: "address" },
      { indexed: true, name: "admin", type: "address" },
      { indexed: false, name: "contributionAmount", type: "uint256" },
      { indexed: false, name: "securityDeposit", type: "uint256" },
      { indexed: false, name: "maxMembers", type: "uint256" },
      { indexed: false, name: "paymentDay", type: "uint8" },
      { indexed: false, name: "vouchRequired", type: "bool" },
    ],
  },
  {
    type: "event",
    name: "PlatformWalletUpdated",
    inputs: [
      { indexed: true, name: "oldWallet", type: "address" },
      { indexed: true, name: "newWallet", type: "address" },
    ],
  },
  {
    type: "function",
    name: "createPool",
    inputs: [
      { name: "contributionAmount", type: "uint256" },
      { name: "securityDepositAmount", type: "uint256" },
      { name: "maxMembers", type: "uint256" },
      { name: "paymentDay", type: "uint8" },
      { name: "vouchRequired", type: "bool" },
    ],
    outputs: [
      { name: "", type: "uint256" },
      { name: "", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getPool",
    inputs: [{ name: "poolId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "poolCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;
