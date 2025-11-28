export const ReputationRegistryAbi = [
  {
    type: "event",
    name: "PoolCompletionRecorded",
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "totalCompleted", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "DefaultRecorded",
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "totalDefaults", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "PoolRoleGranted",
    inputs: [{ indexed: true, name: "pool", type: "address" }],
  },
  {
    type: "function",
    name: "getCompletedPools",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDefaultCount",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "canVouch",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
] as const;




