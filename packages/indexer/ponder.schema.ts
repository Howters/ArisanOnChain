import { onchainTable, relations } from "@ponder/core";

export const pool = onchainTable("pool", (t) => ({
  id: t.text().primaryKey(),
  address: t.text().notNull(),
  admin: t.text().notNull(),
  contributionAmount: t.bigint().notNull(),
  securityDeposit: t.bigint().notNull(),
  maxMembers: t.integer().notNull(),
  currentRound: t.integer().notNull().default(0),
  totalRounds: t.integer().notNull(),
  status: t.text().notNull().default("Pending"),
  createdAt: t.bigint().notNull(),
  updatedAt: t.bigint().notNull(),
}));

export const poolRelations = relations(pool, ({ many }) => ({
  members: many(member),
  contributions: many(contribution),
  winners: many(winnerHistory),
}));

export const member = onchainTable("member", (t) => ({
  id: t.text().primaryKey(),
  poolId: t.text().notNull(),
  address: t.text().notNull(),
  status: t.text().notNull().default("Pending"),
  lockedStake: t.bigint().notNull().default(0n),
  liquidBalance: t.bigint().notNull().default(0n),
  joinedAt: t.bigint(),
  hasClaimedPayout: t.boolean().notNull().default(false),
}));

export const memberRelations = relations(member, ({ one, many }) => ({
  pool: one(pool, { fields: [member.poolId], references: [pool.id] }),
  contributions: many(contribution),
  vouchesReceived: many(vouch, { relationName: "vouchee" }),
  vouchesGiven: many(vouch, { relationName: "voucher" }),
}));

export const contribution = onchainTable("contribution", (t) => ({
  id: t.text().primaryKey(),
  poolId: t.text().notNull(),
  memberAddress: t.text().notNull(),
  amount: t.bigint().notNull(),
  round: t.integer().notNull(),
  timestamp: t.bigint().notNull(),
  txHash: t.text().notNull(),
}));

export const contributionRelations = relations(contribution, ({ one }) => ({
  pool: one(pool, { fields: [contribution.poolId], references: [pool.id] }),
  member: one(member, { fields: [contribution.memberAddress], references: [member.address] }),
}));

export const vouch = onchainTable("vouch", (t) => ({
  id: t.text().primaryKey(),
  poolId: t.text().notNull(),
  voucherAddress: t.text().notNull(),
  voucheeAddress: t.text().notNull(),
  amount: t.bigint().notNull(),
  timestamp: t.bigint().notNull(),
}));

export const vouchRelations = relations(vouch, ({ one }) => ({
  pool: one(pool, { fields: [vouch.poolId], references: [pool.id] }),
  voucher: one(member, { fields: [vouch.voucherAddress], references: [member.address], relationName: "voucher" }),
  vouchee: one(member, { fields: [vouch.voucheeAddress], references: [member.address], relationName: "vouchee" }),
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
  round: t.integer().notNull(),
  winnerAddress: t.text().notNull(),
  payoutAmount: t.bigint().notNull(),
  claimedAt: t.bigint(),
}));

export const winnerHistoryRelations = relations(winnerHistory, ({ one }) => ({
  pool: one(pool, { fields: [winnerHistory.poolId], references: [pool.id] }),
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

export const rotationOrder = onchainTable("rotation_order", (t) => ({
  id: t.text().primaryKey(),
  poolId: t.text().notNull(),
  memberAddress: t.text().notNull(),
  position: t.integer().notNull(),
}));


