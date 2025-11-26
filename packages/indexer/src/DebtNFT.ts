import { ponder } from "@/generated";
import { debtNft, defaultRecord } from "../ponder.schema";
import { eq, and } from "@ponder/core";

ponder.on("DebtNFT:DebtNFTMinted", async ({ event, context }) => {
  const poolId = event.args.poolId.toString();
  const memberAddress = event.args.member.toLowerCase();

  await context.db
    .insert(debtNft)
    .values({
      id: event.args.tokenId,
      owner: memberAddress,
      poolId: poolId,
      defaultedAmount: event.args.defaultedAmount,
      mintedAt: event.block.timestamp,
    });

  const defaults = await context.db.sql
    .select()
    .from(defaultRecord)
    .where(
      and(
        eq(defaultRecord.poolId, poolId),
        eq(defaultRecord.memberAddress, memberAddress)
      )
    )
    .orderBy(defaultRecord.timestamp);

  if (defaults.length > 0) {
    const latestDefault = defaults[defaults.length - 1];
    await context.db
      .update(defaultRecord, { id: latestDefault.id })
      .set({
        debtNftId: event.args.tokenId,
      });
  }
});


