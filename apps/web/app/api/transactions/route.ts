import { NextRequest, NextResponse } from "next/server";
import { queryIndexer, QUERIES } from "@/lib/graphql/client";
import { publicClient, CONTRACTS } from "@/lib/contracts/client";
import { parseAbiItem } from "viem";

const USE_INDEXER = process.env.NEXT_PUBLIC_USE_INDEXER === "true";
const BLOCK_RANGE = BigInt(10000);

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address") as `0x${string}`;

    if (!address) {
      return NextResponse.json({ transactions: [] });
    }

    console.log(`[Transactions API] USE_INDEXER=${USE_INDEXER}, address: ${address}`);

    if (USE_INDEXER) {
      console.log("[Transactions API] 📊 Fetching from INDEXER...");
      return await getTransactionsFromIndexer(address);
    }

    console.log("[Transactions API] 🔗 Fetching from RPC...");
    return await getTransactionsFromRPC(address);
  } catch (error: any) {
    console.error("Transactions error:", error);
    return NextResponse.json({ transactions: [], error: error.message });
  }
}

async function getTransactionsFromIndexer(address: string) {
  try {
    const data = await queryIndexer<{
      topUps: { items: any[] };
      faucetClaims: { items: any[] };
      contributions: { items: any[] };
    }>(QUERIES.GET_TRANSACTIONS, { userAddress: address.toLowerCase() });

    const transactions: any[] = [];

    data.topUps.items.forEach((item: any) => {
      transactions.push({
        type: "topup",
        amount: item.amount?.toString() || "0",
        timestamp: Number(item.timestamp),
        txHash: item.txHash,
      });
    });

    data.faucetClaims.items.forEach((item: any) => {
      transactions.push({
        type: "faucet",
        amount: item.amount?.toString() || "0",
        timestamp: Number(item.timestamp),
        txHash: item.txHash,
      });
    });

    data.contributions.items.forEach((item: any) => {
      transactions.push({
        type: "contribution",
        poolId: item.poolId,
        amount: item.amount?.toString() || "0",
        round: Number(item.round),
        timestamp: Number(item.timestamp),
        txHash: item.txHash,
      });
    });

    transactions.sort((a, b) => b.timestamp - a.timestamp);

    console.log(`[Transactions API] ✅ Indexer returned ${transactions.length} transactions`);

    return NextResponse.json({ transactions: transactions.slice(0, 50) });
  } catch (error) {
    console.error("Indexer error, falling back to RPC:", error);
    return await getTransactionsFromRPC(address);
  }
}

async function getTransactionsFromRPC(address: `0x${string}`) {
  if (CONTRACTS.MOCK_IDRX === "0x0") {
    return NextResponse.json({ transactions: [], message: "Contract not deployed" });
  }

  const latestBlock = await publicClient.getBlockNumber();
  const fromBlock = latestBlock > BLOCK_RANGE ? latestBlock - BLOCK_RANGE : BigInt(0);

  const [transfersIn, transfersOut, faucetClaims, topups] = await Promise.all([
    publicClient.getLogs({
      address: CONTRACTS.MOCK_IDRX,
      event: parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
      args: { to: address },
      fromBlock,
      toBlock: latestBlock,
    }),
    publicClient.getLogs({
      address: CONTRACTS.MOCK_IDRX,
      event: parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
      args: { from: address },
      fromBlock,
      toBlock: latestBlock,
    }),
    publicClient.getLogs({
      address: CONTRACTS.MOCK_IDRX,
      event: parseAbiItem("event FaucetClaimed(address indexed user, uint256 amount)"),
      args: { user: address },
      fromBlock,
      toBlock: latestBlock,
    }),
    publicClient.getLogs({
      address: CONTRACTS.MOCK_IDRX,
      event: parseAbiItem("event TopUpCompleted(address indexed user, uint256 amount)"),
      args: { user: address },
      fromBlock,
      toBlock: latestBlock,
    }),
  ]);

  const transactions: any[] = [];

  for (const log of faucetClaims) {
    const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
    transactions.push({
      type: "faucet",
      amount: log.args.amount?.toString() || "0",
      timestamp: Number(block.timestamp),
      txHash: log.transactionHash,
      blockNumber: Number(log.blockNumber),
    });
  }

  for (const log of topups) {
    const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
    transactions.push({
      type: "topup",
      amount: log.args.amount?.toString() || "0",
      timestamp: Number(block.timestamp),
      txHash: log.transactionHash,
      blockNumber: Number(log.blockNumber),
    });
  }

  for (const log of transfersIn) {
    if (log.args.from === "0x0000000000000000000000000000000000000000") continue;
    
    const isFaucet = faucetClaims.some(f => f.transactionHash === log.transactionHash);
    const isTopup = topups.some(t => t.transactionHash === log.transactionHash);
    if (isFaucet || isTopup) continue;

    const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
    transactions.push({
      type: "receive",
      from: log.args.from,
      amount: log.args.value?.toString() || "0",
      timestamp: Number(block.timestamp),
      txHash: log.transactionHash,
      blockNumber: Number(log.blockNumber),
    });
  }

  for (const log of transfersOut) {
    const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
    transactions.push({
      type: "send",
      to: log.args.to,
      amount: log.args.value?.toString() || "0",
      timestamp: Number(block.timestamp),
      txHash: log.transactionHash,
      blockNumber: Number(log.blockNumber),
    });
  }

  transactions.sort((a, b) => b.timestamp - a.timestamp);

  return NextResponse.json({ transactions: transactions.slice(0, 50) });
}
