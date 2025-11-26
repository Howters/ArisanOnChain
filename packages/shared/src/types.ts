export enum PoolStatus {
  Pending = "Pending",
  Active = "Active",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export enum MemberStatus {
  None = "None",
  Pending = "Pending",
  Approved = "Approved",
  Active = "Active",
  Defaulted = "Defaulted",
  Removed = "Removed",
}

export interface Pool {
  id: string;
  address: string;
  admin: string;
  contributionAmount: bigint;
  securityDeposit: bigint;
  maxMembers: number;
  currentRound: number;
  totalRounds: number;
  status: PoolStatus;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface Member {
  id: string;
  poolId: string;
  address: string;
  status: MemberStatus;
  lockedStake: bigint;
  liquidBalance: bigint;
  joinedAt: bigint | null;
  hasClaimedPayout: boolean;
}

export interface Contribution {
  id: string;
  poolId: string;
  memberAddress: string;
  amount: bigint;
  round: number;
  timestamp: bigint;
  txHash: string;
}

export interface Vouch {
  id: string;
  poolId: string;
  voucherAddress: string;
  voucheeAddress: string;
  amount: bigint;
  timestamp: bigint;
}

export interface DebtNFT {
  id: bigint;
  owner: string;
  poolId: string;
  defaultedAmount: bigint;
  mintedAt: bigint;
}

export interface TopUp {
  id: string;
  userAddress: string;
  amount: bigint;
  timestamp: bigint;
  txHash: string;
}


