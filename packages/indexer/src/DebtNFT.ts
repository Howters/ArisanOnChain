import { ponder } from "ponder:registry";
import { debtNft } from "ponder:schema";

ponder.on("DebtNFT:DebtNFTMinted", async ({ event, context }) => {
  await context.db
    .insert(debtNft)
    .values({
      id: event.args.tokenId,
      owner: event.args.member.toLowerCase(),
      poolId: event.args.poolId.toString(),
      defaultedAmount: event.args.defaultedAmount,
      mintedAt: event.block.timestamp,
    });
});

ponder.on("DebtNFT:Transfer", async ({ event, context }) => {
  if (event.args.from === "0x0000000000000000000000000000000000000000") {
    return;
  }

  const tokenId = event.args.tokenId;
  const existing = await context.db.find(debtNft, { id: tokenId });
  
  if (existing) {
    await context.db
      .update(debtNft, { id: tokenId })
      .set({
        owner: event.args.to.toLowerCase(),
      });
  }
});
