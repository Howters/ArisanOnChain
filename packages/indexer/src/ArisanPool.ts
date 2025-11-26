import { ponder } from "@/generated";
import { 
  pool, 
  member, 
  contribution, 
  vouch, 
  defaultRecord, 
  winnerHistory,
  rotationOrder as rotationOrderTable 
} from "../ponder.schema";
import { eq } from "@ponder/core";

ponder.on("ArisanPool:MemberRequested", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();
  const memberAddress = event.args.member.toLowerCase();

  await context.db
    .insert(member)
    .values({
      id: `${poolId}-${memberAddress}`,
      poolId: poolId,
      address: memberAddress,
      status: "Pending",
      lockedStake: 0n,
      liquidBalance: 0n,
      joinedAt: null,
      hasClaimedPayout: false,
    });
});

ponder.on("ArisanPool:MemberApproved", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();
  const memberAddress = event.args.member.toLowerCase();

  await context.db
    .update(member, { id: `${poolId}-${memberAddress}` })
    .set({
      status: "Approved",
      joinedAt: event.block.timestamp,
    });
});

ponder.on("ArisanPool:MemberRemoved", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();
  const memberAddress = event.args.member.toLowerCase();

  await context.db
    .update(member, { id: `${poolId}-${memberAddress}` })
    .set({
      status: "Removed",
    });
});

ponder.on("ArisanPool:SecurityDepositLocked", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();
  const memberAddress = event.args.member.toLowerCase();

  await context.db
    .update(member, { id: `${poolId}-${memberAddress}` })
    .set({
      status: "Active",
      lockedStake: event.args.amount,
    });
});

ponder.on("ArisanPool:ContributionMade", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();
  const memberAddress = event.args.member.toLowerCase();
  const round = Number(event.args.round);

  await context.db
    .insert(contribution)
    .values({
      id: event.transaction.hash,
      poolId: poolId,
      memberAddress: memberAddress,
      amount: event.args.amount,
      round: round,
      timestamp: event.block.timestamp,
      txHash: event.transaction.hash,
    });
});

ponder.on("ArisanPool:MemberVouched", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();
  const voucherAddress = event.args.voucher.toLowerCase();
  const voucheeAddress = event.args.vouchee.toLowerCase();

  await context.db
    .insert(vouch)
    .values({
      id: `${poolId}-${voucherAddress}-${voucheeAddress}-${event.block.timestamp}`,
      poolId: poolId,
      voucherAddress: voucherAddress,
      voucheeAddress: voucheeAddress,
      amount: event.args.amount,
      timestamp: event.block.timestamp,
    });
});

ponder.on("ArisanPool:MemberReportedDefault", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();
  const memberAddress = event.args.member.toLowerCase();

  await context.db
    .update(member, { id: `${poolId}-${memberAddress}` })
    .set({
      status: "Defaulted",
      lockedStake: 0n,
    });
});

ponder.on("ArisanPool:DefaultResolved", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();
  const memberAddress = event.args.member.toLowerCase();

  await context.db
    .insert(defaultRecord)
    .values({
      id: `${poolId}-${memberAddress}-${event.block.timestamp}`,
      poolId: poolId,
      memberAddress: memberAddress,
      recoveredAmount: event.args.recoveredAmount,
      debtNftId: null,
      timestamp: event.block.timestamp,
    });
});

ponder.on("ArisanPool:WinnerDetermined", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();
  const round = Number(event.args.round);
  const winnerAddress = event.args.winner.toLowerCase();

  await context.db
    .insert(winnerHistory)
    .values({
      id: `${poolId}-${round}`,
      poolId: poolId,
      round: round,
      winnerAddress: winnerAddress,
      payoutAmount: 0n,
      claimedAt: null,
    });

  await context.db
    .update(pool, { id: poolId })
    .set({
      currentRound: round,
      updatedAt: event.block.timestamp,
    });
});

ponder.on("ArisanPool:PayoutClaimed", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();
  const winnerAddress = event.args.winner.toLowerCase();

  const existingPool = await context.db.find(pool, { id: poolId });
  if (!existingPool) return;

  const currentRound = existingPool.currentRound;

  await context.db
    .update(winnerHistory, { id: `${poolId}-${currentRound}` })
    .set({
      payoutAmount: event.args.amount,
      claimedAt: event.block.timestamp,
    });

  await context.db
    .update(member, { id: `${poolId}-${winnerAddress}` })
    .set({
      hasClaimedPayout: true,
      liquidBalance: event.args.amount,
    });
});

ponder.on("ArisanPool:PoolActivated", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();

  await context.db
    .update(pool, { id: poolId })
    .set({
      status: "Active",
      currentRound: 1,
      updatedAt: event.block.timestamp,
    });
});

ponder.on("ArisanPool:PoolCompleted", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();

  await context.db
    .update(pool, { id: poolId })
    .set({
      status: "Completed",
      updatedAt: event.block.timestamp,
    });
});

ponder.on("ArisanPool:PoolCancelled", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();

  await context.db
    .update(pool, { id: poolId })
    .set({
      status: "Cancelled",
      updatedAt: event.block.timestamp,
    });
});

ponder.on("ArisanPool:RotationOrderSet", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();
  const order = event.args.order;

  for (let i = 0; i < order.length; i++) {
    await context.db
      .insert(rotationOrderTable)
      .values({
        id: `${poolId}-${i}`,
        poolId: poolId,
        memberAddress: order[i].toLowerCase(),
        position: i,
      })
      .onConflictDoUpdate({
        memberAddress: order[i].toLowerCase(),
        position: i,
      });
  }
});

ponder.on("ArisanPool:LiquidFundsWithdrawn", async ({ event, context }) => {
  const memberAddress = event.args.member.toLowerCase();

  const members = await context.db.sql.select().from(member).where(eq(member.address, memberAddress));
  
  for (const m of members) {
    await context.db
      .update(member, { id: m.id })
      .set({
        liquidBalance: 0n,
      });
  }
});


