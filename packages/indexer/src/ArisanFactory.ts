import { ponder } from "@/generated";
import { pool, member, rotationOrder as rotationOrderTable } from "../ponder.schema";

ponder.on("ArisanFactory:PoolCreated", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();
  
  await context.db
    .insert(pool)
    .values({
      id: poolId,
      address: event.args.poolAddress.toLowerCase(),
      admin: event.args.admin.toLowerCase(),
      contributionAmount: event.args.contributionAmount,
      securityDeposit: event.args.securityDeposit,
      maxMembers: Number(event.args.maxMembers),
      currentRound: 0,
      totalRounds: Number(event.args.maxMembers),
      status: "Pending",
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


