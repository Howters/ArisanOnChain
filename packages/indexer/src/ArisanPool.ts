import { ponder } from "ponder:registry";
import { eq, and } from "ponder";
import { pool, member, contribution, vouch, defaultRecord, winnerHistory, rotationOrder } from "ponder:schema";

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
  const memberId = `${poolId}-${memberAddress}`;

  const existing = await context.db.find(member, { id: memberId });
  
  if (existing) {
    await context.db
      .update(member, { id: memberId })
      .set({
        status: "Approved",
        joinedAt: event.block.timestamp,
      });
  } else {
    await context.db
      .insert(member)
      .values({
        id: memberId,
        poolId: poolId,
        address: memberAddress,
        status: "Approved",
        lockedStake: 0n,
        liquidBalance: 0n,
        joinedAt: event.block.timestamp,
        hasClaimedPayout: false,
      });
  }
});

ponder.on("ArisanPool:MemberRemoved", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();
  const memberAddress = event.args.member.toLowerCase();
  const memberId = `${poolId}-${memberAddress}`;

  const existing = await context.db.find(member, { id: memberId });
  
  if (existing) {
    await context.db
      .update(member, { id: memberId })
      .set({
        status: "Removed",
      });
  }
});

ponder.on("ArisanPool:SecurityDepositLocked", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();
  const memberAddress = event.args.member.toLowerCase();
  const memberId = `${poolId}-${memberAddress}`;

  const existing = await context.db.find(member, { id: memberId });
  
  if (existing) {
    await context.db
      .update(member, { id: memberId })
      .set({
        status: "Active",
        lockedStake: event.args.amount,
      });
  } else {
    await context.db
      .insert(member)
      .values({
        id: memberId,
        poolId: poolId,
        address: memberAddress,
        status: "Active",
        lockedStake: event.args.amount,
        liquidBalance: 0n,
        joinedAt: event.block.timestamp,
        hasClaimedPayout: false,
      });
  }
});

ponder.on("ArisanPool:ContributionMade", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();
  const memberAddress = event.args.member.toLowerCase();

  await context.db
    .insert(contribution)
    .values({
      id: `${event.transaction.hash}-${poolId}-${memberAddress}-${event.args.round}`,
      poolId: poolId,
      memberAddress: memberAddress,
      amount: event.args.amount,
      round: event.args.round,
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
      returned: false,
      timestamp: event.block.timestamp,
    });
});

ponder.on("ArisanPool:VouchReturned", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();
  const voucherAddress = event.args.voucher.toLowerCase();
  const voucheeAddress = event.args.vouchee.toLowerCase();

  const existingVouches = await context.db
    .find(vouch, {
      poolId: poolId,
    });

  const matchingVouches = existingVouches ? [existingVouches].flat().filter(
    (v: any) => v.voucherAddress === voucherAddress && 
           v.voucheeAddress === voucheeAddress && 
           !v.returned
  ) : [];

  for (const v of matchingVouches) {
    await context.db
      .update(vouch, { id: v.id })
      .set({ returned: true });
  }
});

ponder.on("ArisanPool:MemberReportedDefault", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();
  const memberAddress = event.args.member.toLowerCase();
  const memberId = `${poolId}-${memberAddress}`;

  const existing = await context.db.find(member, { id: memberId });
  
  if (existing) {
    await context.db
      .update(member, { id: memberId })
      .set({
        status: "Defaulted",
        lockedStake: 0n,
      });
  }
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
  const winnerAddress = event.args.winner.toLowerCase();

  await context.db
    .insert(winnerHistory)
    .values({
      id: `${poolId}-${event.args.round}`,
      poolId: poolId,
      round: event.args.round,
      winnerAddress: winnerAddress,
      payoutAmount: 0n,
      claimedAt: null,
    });

  await context.db
    .update(pool, { id: poolId })
    .set({
      currentRound: Number(event.args.round),
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

  const existing = await context.db.find(pool, { id: poolId });
  
  if (existing) {
    await context.db
      .update(pool, { id: poolId })
      .set({
        status: "Active",
        currentRound: 1,
        totalRounds: Number(event.args.totalRounds),
        activatedAt: event.block.timestamp,
        updatedAt: event.block.timestamp,
      });
  }
});

ponder.on("ArisanPool:PoolCompleted", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();

  const existing = await context.db.find(pool, { id: poolId });
  if (existing) {
    await context.db
      .update(pool, { id: poolId })
      .set({
        status: "Completed",
        updatedAt: event.block.timestamp,
      });
  }
});

ponder.on("ArisanPool:PoolCancelled", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();

  const existing = await context.db.find(pool, { id: poolId });
  if (existing) {
    await context.db
      .update(pool, { id: poolId })
      .set({
        status: "Cancelled",
        updatedAt: event.block.timestamp,
      });
  }
});

ponder.on("ArisanPool:RotationOrderSet", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();
  const order = event.args.order;

  for (let i = 0; i < order.length; i++) {
    const recordId = `${poolId}-${i}`;
    const existing = await context.db.find(rotationOrder, { id: recordId });
    
    if (existing) {
      await context.db
        .update(rotationOrder, { id: recordId })
        .set({
          memberAddress: order[i].toLowerCase(),
          position: i,
        });
    } else {
      await context.db
        .insert(rotationOrder)
        .values({
          id: recordId,
          poolId: poolId,
          memberAddress: order[i].toLowerCase(),
          position: i,
        });
    }
  }
});

ponder.on("ArisanPool:RoundStarted", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();

  await context.db
    .update(pool, { id: poolId })
    .set({
      currentRound: Number(event.args.round),
      updatedAt: event.block.timestamp,
    });
});

ponder.on("ArisanPool:FundsWithdrawn", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();
  const memberAddress = event.args.member.toLowerCase();
  const memberId = `${poolId}-${memberAddress}`;

  const existingMember = await context.db.find(member, { id: memberId });
  if (!existingMember) return;

  if (event.args.withdrawType === "liquid") {
    await context.db
      .update(member, { id: memberId })
      .set({ liquidBalance: 0n });
  } else if (event.args.withdrawType === "security_deposit") {
    await context.db
      .update(member, { id: memberId })
      .set({ lockedStake: 0n });
  }
});
