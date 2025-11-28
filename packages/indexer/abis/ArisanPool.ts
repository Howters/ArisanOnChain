export const ArisanPoolAbi = [
  {
    type: "event",
    name: "MemberRequested",
    inputs: [
      { indexed: true, name: "poolId", type: "uint256" },
      { indexed: true, name: "member", type: "address" },
    ],
  },
  {
    type: "event",
    name: "MemberApproved",
    inputs: [
      { indexed: true, name: "poolId", type: "uint256" },
      { indexed: true, name: "member", type: "address" },
    ],
  },
  {
    type: "event",
    name: "MemberRemoved",
    inputs: [
      { indexed: true, name: "poolId", type: "uint256" },
      { indexed: true, name: "member", type: "address" },
    ],
  },
  {
    type: "event",
    name: "SecurityDepositLocked",
    inputs: [
      { indexed: true, name: "poolId", type: "uint256" },
      { indexed: true, name: "member", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "ContributionMade",
    inputs: [
      { indexed: true, name: "poolId", type: "uint256" },
      { indexed: true, name: "member", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "round", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "MemberVouched",
    inputs: [
      { indexed: true, name: "poolId", type: "uint256" },
      { indexed: true, name: "voucher", type: "address" },
      { indexed: true, name: "vouchee", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "VouchReturned",
    inputs: [
      { indexed: true, name: "poolId", type: "uint256" },
      { indexed: true, name: "voucher", type: "address" },
      { indexed: true, name: "vouchee", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "MemberReportedDefault",
    inputs: [
      { indexed: true, name: "poolId", type: "uint256" },
      { indexed: true, name: "member", type: "address" },
      { indexed: true, name: "reportedBy", type: "address" },
    ],
  },
  {
    type: "event",
    name: "DefaultResolved",
    inputs: [
      { indexed: true, name: "poolId", type: "uint256" },
      { indexed: true, name: "member", type: "address" },
      { indexed: false, name: "recoveredAmount", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "WinnerDetermined",
    inputs: [
      { indexed: true, name: "poolId", type: "uint256" },
      { indexed: true, name: "round", type: "uint256" },
      { indexed: true, name: "winner", type: "address" },
    ],
  },
  {
    type: "event",
    name: "PayoutClaimed",
    inputs: [
      { indexed: true, name: "poolId", type: "uint256" },
      { indexed: true, name: "winner", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "platformFee", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "PoolActivated",
    inputs: [
      { indexed: true, name: "poolId", type: "uint256" },
      { indexed: false, name: "totalRounds", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "PoolCompleted",
    inputs: [{ indexed: true, name: "poolId", type: "uint256" }],
  },
  {
    type: "event",
    name: "PoolCancelled",
    inputs: [{ indexed: true, name: "poolId", type: "uint256" }],
  },
  {
    type: "event",
    name: "RotationOrderSet",
    inputs: [
      { indexed: true, name: "poolId", type: "uint256" },
      { indexed: false, name: "order", type: "address[]" },
    ],
  },
  {
    type: "event",
    name: "RoundStarted",
    inputs: [
      { indexed: true, name: "poolId", type: "uint256" },
      { indexed: true, name: "round", type: "uint256" },
      { indexed: false, name: "deadline", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "FundsWithdrawn",
    inputs: [
      { indexed: true, name: "poolId", type: "uint256" },
      { indexed: true, name: "member", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "withdrawType", type: "string" },
    ],
  },
  {
    type: "function",
    name: "poolId",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "admin",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "status",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "currentRound",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalRounds",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;
