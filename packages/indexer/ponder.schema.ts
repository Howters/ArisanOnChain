import { onchainTable } from "ponder";

export const pool = onchainTable("pool", (t) => ({
  id: t.text().primaryKey(),
  address: t.text().notNull(),
  admin: t.text().notNull(),
  name: t.text(),
  contributionAmount: t.bigint().notNull(),
  securityDeposit: t.bigint().notNull(),
  maxMembers: t.integer().notNull(),
  paymentDay: t.integer().notNull(),
  vouchRequired: t.boolean().notNull(),
  currentRound: t.integer().notNull(),
  totalRounds: t.integer().notNull(),
  status: t.text().notNull(),
  activatedAt: t.bigint(),
  createdAt: t.bigint().notNull(),
  updatedAt: t.bigint().notNull(),
}));

export const member = onchainTable("member", (t) => ({
  id: t.text().primaryKey(),
  poolId: t.text().notNull(),
  address: t.text().notNull(),
  status: t.text().notNull(),
  lockedStake: t.bigint().notNull(),
  liquidBalance: t.bigint().notNull(),
  joinedAt: t.bigint(),
  hasClaimedPayout: t.boolean().notNull(),
}));

export const contribution = onchainTable("contribution", (t) => ({
  id: t.text().primaryKey(),
  poolId: t.text().notNull(),
  memberAddress: t.text().notNull(),
  amount: t.bigint().notNull(),
  round: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  txHash: t.text().notNull(),
}));

export const vouch = onchainTable("vouch", (t) => ({
  id: t.text().primaryKey(),
  poolId: t.text().notNull(),
  voucherAddress: t.text().notNull(),
  voucheeAddress: t.text().notNull(),
  amount: t.bigint().notNull(),
  returned: t.boolean().notNull(),
  timestamp: t.bigint().notNull(),
}));

export const defaultRecord = onchainTable("default_record", (t) => ({
  id: t.text().primaryKey(),
  poolId: t.text().notNull(),
  memberAddress: t.text().notNull(),
  recoveredAmount: t.bigint().notNull(),
  debtNftId: t.bigint(),
  timestamp: t.bigint().notNull(),
}));

export const winnerHistory = onchainTable("winner_history", (t) => ({
  id: t.text().primaryKey(),
  poolId: t.text().notNull(),
  round: t.bigint().notNull(),
  winnerAddress: t.text().notNull(),
  payoutAmount: t.bigint().notNull(),
  platformFee: t.bigint().notNull(),
  claimedAt: t.bigint(),
}));

export const debtNft = onchainTable("debt_nft", (t) => ({
  id: t.bigint().primaryKey(),
  owner: t.text().notNull(),
  poolId: t.text().notNull(),
  defaultedAmount: t.bigint().notNull(),
  mintedAt: t.bigint().notNull(),
}));

export const topUp = onchainTable("top_up", (t) => ({
  id: t.text().primaryKey(),
  userAddress: t.text().notNull(),
  amount: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  txHash: t.text().notNull(),
}));

export const faucetClaim = onchainTable("faucet_claim", (t) => ({
  id: t.text().primaryKey(),
  userAddress: t.text().notNull(),
  amount: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
  txHash: t.text().notNull(),
}));

export const rotationOrder = onchainTable("rotation_order", (t) => ({
  id: t.text().primaryKey(),
  poolId: t.text().notNull(),
  memberAddress: t.text().notNull(),
  position: t.integer().notNull(),
}));

export const reputation = onchainTable("reputation", (t) => ({
  id: t.text().primaryKey(),
  address: t.text().notNull(),
  completedPools: t.integer().notNull(),
  defaultCount: t.integer().notNull(),
  lastUpdated: t.bigint().notNull(),
}));
