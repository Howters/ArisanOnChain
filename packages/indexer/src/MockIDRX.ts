import { ponder } from "@/generated";
import { topUp } from "../ponder.schema";

ponder.on("MockIDRX:TopUpCompleted", async ({ event, context }) => {
  await context.db
    .insert(topUp)
    .values({
      id: event.transaction.hash,
      userAddress: event.args.user.toLowerCase(),
      amount: event.args.amount,
      timestamp: event.block.timestamp,
      txHash: event.transaction.hash,
    });
});

ponder.on("MockIDRX:FaucetClaimed", async ({ event, context }) => {
  await context.db
    .insert(topUp)
    .values({
      id: event.transaction.hash,
      userAddress: event.args.user.toLowerCase(),
      amount: event.args.amount,
      timestamp: event.block.timestamp,
      txHash: event.transaction.hash,
    });
});


