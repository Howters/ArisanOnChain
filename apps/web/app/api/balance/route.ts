import { NextRequest, NextResponse } from "next/server";
import { publicClient, CONTRACTS } from "@/lib/contracts/client";
import { MockIDRXAbi } from "@/lib/contracts/abis";

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address") as `0x${string}`;

    if (!address) {
      return NextResponse.json({ liquid: "0", locked: "0" });
    }

    if (CONTRACTS.MOCK_IDRX === "0x0") {
      return NextResponse.json({
        liquid: "0",
        locked: "0",
        simulated: true,
        message: "Contracts not deployed yet",
      });
    }

    const balance = await publicClient.readContract({
      address: CONTRACTS.MOCK_IDRX,
      abi: MockIDRXAbi,
      functionName: "balanceOf",
      args: [address],
    });

    return NextResponse.json({
      liquid: balance.toString(),
      locked: "0",
    });
  } catch (error: any) {
    console.error("Balance error:", error);
    return NextResponse.json({
      liquid: "0",
      locked: "0",
      error: error.message,
    });
  }
}


