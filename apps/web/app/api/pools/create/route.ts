import { NextRequest, NextResponse } from "next/server";
import { encodeFunctionData, decodeEventLog } from "viem";
import { publicClient, getRelayerClient, CONTRACTS } from "@/lib/contracts/client";
import { ArisanFactoryAbi, MockIDRXAbi } from "@/lib/contracts/abis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      contributionAmount, 
      securityDeposit, 
      maxMembers, 
      paymentDay,
      vouchRequired,
      name,
      walletAddress 
    } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 401 });
    }

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

    const createPoolData = encodeFunctionData({
      abi: ArisanFactoryAbi,
      functionName: "createPool",
      args: [
        BigInt(contributionAmount),
        BigInt(securityDeposit),
        BigInt(maxMembers),
        paymentDay || 1,
        vouchRequired || false,
      ],
    });

    const txHash = await relayerClient.sendTransaction({
      to: CONTRACTS.FACTORY,
      data: createPoolData,
      account: relayerClient.account!,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    let poolId = "0";
    let poolAddress = "0x0";

    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: ArisanFactoryAbi,
          data: log.data,
          topics: log.topics,
        });

        if (decoded.eventName === "PoolCreated") {
          const args = decoded.args as { poolId: bigint; poolAddress: `0x${string}` };
          poolId = args.poolId.toString();
          poolAddress = args.poolAddress;
          break;
        }
      } catch {
      }
    }

    return NextResponse.json({
      success: true,
      poolId,
      poolAddress,
      txHash,
      name,
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
