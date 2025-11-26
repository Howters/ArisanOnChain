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
    ],
  },
  {
    type: "function",
    name: "createPool",
    inputs: [
      { name: "contributionAmount", type: "uint256" },
      { name: "securityDepositAmount", type: "uint256" },
      { name: "maxMembers", type: "uint256" },
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


