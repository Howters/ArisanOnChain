import { ponder } from "ponder:registry";
import { reputation } from "ponder:schema";

ponder.on("ReputationRegistry:PoolCompletionRecorded", async ({ event, context }) => {
  const userAddress = event.args.user.toLowerCase();
  
  const existing = await context.db.find(reputation, { id: userAddress });
  
  if (existing) {
    await context.db
      .update(reputation, { id: userAddress })
      .set({
        completedPools: Number(event.args.totalCompleted),
        lastUpdated: event.block.timestamp,
      });
  } else {
    await context.db
      .insert(reputation)
      .values({
        id: userAddress,
        address: userAddress,
        completedPools: Number(event.args.totalCompleted),
        defaultCount: 0,
        lastUpdated: event.block.timestamp,
      });
  }
});

ponder.on("ReputationRegistry:DefaultRecorded", async ({ event, context }) => {
  const userAddress = event.args.user.toLowerCase();
  
  const existing = await context.db.find(reputation, { id: userAddress });
  
  if (existing) {
    await context.db
      .update(reputation, { id: userAddress })
      .set({
        defaultCount: Number(event.args.totalDefaults),
        lastUpdated: event.block.timestamp,
      });
  } else {
    await context.db
      .insert(reputation)
      .values({
        id: userAddress,
        address: userAddress,
        completedPools: 0,
        defaultCount: Number(event.args.totalDefaults),
        lastUpdated: event.block.timestamp,
      });
  }
});
