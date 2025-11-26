import { NextRequest, NextResponse } from "next/server";
import { encodeFunctionData } from "viem";
import { publicClient, getRelayerClient, CONTRACTS } from "@/lib/contracts/client";
import { ArisanFactoryAbi, MockIDRXAbi } from "@/lib/contracts/abis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contributionAmount, securityDeposit, maxMembers, walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 401 });
    }

    const userWallet = walletAddress as `0x${string}`;

    if (CONTRACTS.FACTORY === "0x0") {
      const mockPoolId = Math.floor(Math.random() * 1000) + 1;
      return NextResponse.json({
        success: true,
        poolId: mockPoolId.toString(),
        poolAddress: `0x${mockPoolId.toString(16).padStart(40, "0")}`,
        txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
        simulated: true,
        message: "Pool created (simulated - contracts not deployed)",
      });
    }

    const relayerClient = getRelayerClient();

    const approvalData = encodeFunctionData({
      abi: MockIDRXAbi,
      functionName: "approve",
      args: [CONTRACTS.FACTORY, BigInt(securityDeposit)],
    });

    const approvalTx = await relayerClient.sendTransaction({
      to: CONTRACTS.MOCK_IDRX,
      data: approvalData,
      account: relayerClient.account!,
    });

    await publicClient.waitForTransactionReceipt({ hash: approvalTx });

    const createPoolData = encodeFunctionData({
      abi: ArisanFactoryAbi,
      functionName: "createPool",
      args: [
        BigInt(contributionAmount),
        BigInt(securityDeposit),
        BigInt(maxMembers),
      ],
    });

    const txHash = await relayerClient.sendTransaction({
      to: CONTRACTS.FACTORY,
      data: createPoolData,
      account: relayerClient.account!,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    const poolCreatedLog = receipt.logs.find((log) => {
      return log.topics[0] === "0x" + "PoolCreated";
    });

    return NextResponse.json({
      success: true,
      txHash,
      receipt: {
        status: receipt.status,
        blockNumber: receipt.blockNumber.toString(),
      },
    });
  } catch (error: any) {
    console.error("Create pool error:", error);
    return NextResponse.json(
      { error: error.message || "Pool creation failed" },
      { status: 500 }
    );
  }
}


