import { NextRequest, NextResponse } from "next/server";
import { publicClient, CONTRACTS } from "@/lib/contracts/client";
import { DebtNFTAbi } from "@/lib/contracts/abis";

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address") as `0x${string}`;

    if (!address) {
      return NextResponse.json({ debts: [] });
    }

    if (!CONTRACTS.DEBT_NFT || CONTRACTS.DEBT_NFT === "0x0") {
      return NextResponse.json({ debts: [], message: "DebtNFT not deployed" });
    }

    const tokenIds = await publicClient.readContract({
      address: CONTRACTS.DEBT_NFT,
      abi: DebtNFTAbi,
      functionName: "getUserDebtTokens",
      args: [address],
    });

    const debts = [];
    for (const tokenId of tokenIds as bigint[]) {
      try {
        const record = await publicClient.readContract({
          address: CONTRACTS.DEBT_NFT,
          abi: DebtNFTAbi,
          functionName: "debtRecords",
          args: [tokenId],
        }) as readonly [bigint, bigint, bigint];

        const [poolId, defaultedAmount, timestamp] = record;

        debts.push({
          tokenId: tokenId.toString(),
          poolId: poolId.toString(),
          defaultedAmount: defaultedAmount.toString(),
          timestamp: Number(timestamp),
        });
      } catch (err) {
        console.error(`Error fetching debt ${tokenId}:`, err);
      }
    }

    return NextResponse.json({ debts });
  } catch (error: any) {
    console.error("Debt error:", error);
    return NextResponse.json({ debts: [], error: error.message });
  }
}

















