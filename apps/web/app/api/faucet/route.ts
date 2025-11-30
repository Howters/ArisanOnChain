import { NextRequest, NextResponse } from "next/server";
import { encodeFunctionData } from "viem";
import { publicClient, getRelayerClient, CONTRACTS } from "@/lib/contracts/client";
import { MockIDRXAbi } from "@/lib/contracts/abis";

const FAUCET_AMOUNT = 1_000_000;

export async function POST(req: NextRequest) {
  try {
    const { walletAddress } = await req.json();

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 401 });
    }

    if (!process.env.RELAYER_PRIVATE_KEY || CONTRACTS.MOCK_IDRX === "0x0") {
      return NextResponse.json({
        success: true,
        amount: FAUCET_AMOUNT,
        txHash: `0x${Math.random().toString(16).slice(2)}`,
        simulated: true,
        message: "Faucet simulated (contracts not deployed)",
      });
    }

    const relayerClient = getRelayerClient();

    const data = encodeFunctionData({
      abi: MockIDRXAbi,
      functionName: "simulatedTopUp",
      args: [walletAddress as `0x${string}`, BigInt(FAUCET_AMOUNT)],
    });

    const txHash = await relayerClient.sendTransaction({
      to: CONTRACTS.MOCK_IDRX,
      data,
      account: relayerClient.account!,
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    const newBalance = await publicClient.readContract({
      address: CONTRACTS.MOCK_IDRX,
      abi: MockIDRXAbi,
      functionName: "balanceOf",
      args: [walletAddress as `0x${string}`],
    });

    return NextResponse.json({
      success: true,
      amount: FAUCET_AMOUNT,
      txHash,
      newBalance: newBalance.toString(),
    });
  } catch (error: any) {
    console.error("Faucet error:", error);
    return NextResponse.json(
      { error: error.message || "Faucet failed" },
      { status: 500 }
    );
  }
}






