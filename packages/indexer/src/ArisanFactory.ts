import { ponder } from "ponder:registry";
import { pool, member } from "ponder:schema";

ponder.on("ArisanFactory:PoolCreated", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();
  
  await context.db
    .insert(pool)
    .values({
      id: poolId,
      address: event.args.poolAddress.toLowerCase(),
      admin: event.args.admin.toLowerCase(),
      name: null,
      poolName: event.args.poolName || null,
      category: event.args.category || null,
      contributionAmount: event.args.contributionAmount,
      securityDeposit: event.args.securityDeposit,
      maxMembers: Number(event.args.maxMembers),
      paymentDay: Number(event.args.paymentDay),
      vouchRequired: event.args.vouchRequired,
      rotationPeriod: Number(event.args.rotationPeriod),
      currentRound: 0,
      totalRounds: Number(event.args.maxMembers),
      status: "Pending",
      activatedAt: null,
      createdAt: event.block.timestamp,
      updatedAt: event.block.timestamp,
    });

  await context.db
    .insert(member)
    .values({
      id: `${poolId}-${event.args.admin.toLowerCase()}`,
      poolId: poolId,
      address: event.args.admin.toLowerCase(),
      status: "Approved",
      lockedStake: 0n,
      liquidBalance: 0n,
      joinedAt: event.block.timestamp,
      hasClaimedPayout: false,
    });
});
