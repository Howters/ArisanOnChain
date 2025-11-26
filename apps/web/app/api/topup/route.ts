import { NextRequest, NextResponse } from "next/server";
import { encodeFunctionData } from "viem";
import { publicClient, getRelayerClient, CONTRACTS } from "@/lib/contracts/client";
import { MockIDRXAbi } from "@/lib/contracts/abis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, paymentMethod, walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 401 });
    }

    if (!amount || amount < 10000) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const userWallet = walletAddress as `0x${string}`;

    if (!process.env.RELAYER_PRIVATE_KEY || CONTRACTS.MOCK_IDRX === "0x0") {
      console.log("SIMULATION MODE: Missing configuration");
      return NextResponse.json({
        success: true,
        txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
        simulated: true,
        amount,
        paymentMethod,
        newBalance: amount.toString(),
        message: "Top up simulated (contracts not deployed)",
      });
    }

    const relayerClient = getRelayerClient();

    const data = encodeFunctionData({
      abi: MockIDRXAbi,
      functionName: "simulatedTopUp",
      args: [userWallet, BigInt(amount)],
    });

    const txHash = await relayerClient.sendTransaction({
      to: CONTRACTS.MOCK_IDRX,
      data,
      account: relayerClient.account!,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    const newBalance = await publicClient.readContract({
      address: CONTRACTS.MOCK_IDRX,
      abi: MockIDRXAbi,
      functionName: "balanceOf",
      args: [userWallet],
    });

    return NextResponse.json({
      success: true,
      txHash,
      simulated: false,
      amount,
      paymentMethod,
      newBalance: newBalance.toString(),
      status: receipt.status,
    });
  } catch (error: any) {
    console.error("TopUp error:", error);
    return NextResponse.json(
      { error: error.message || "Top up failed" },
      { status: 500 }
    );
  }
}

