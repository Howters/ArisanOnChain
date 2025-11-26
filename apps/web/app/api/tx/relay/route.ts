import { NextRequest, NextResponse } from "next/server";
import { encodeFunctionData } from "viem";
import { publicClient, getRelayerClient, CONTRACTS } from "@/lib/contracts/client";
import { ArisanPoolAbi, MockIDRXAbi } from "@/lib/contracts/abis";

const SUPPORTED_FUNCTIONS = [
  "contribute",
  "vouch",
  "lockSecurityDeposit",
  "requestJoin",
  "claimPayout",
  "withdrawLiquidFunds",
  "approveMember",
  "setRotationOrder",
  "activatePool",
  "reportDefault",
  "determineWinner",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contractAddress, functionName, args, walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address required" }, { status: 401 });
    }

    if (!SUPPORTED_FUNCTIONS.includes(functionName)) {
      return NextResponse.json(
        { error: "Function not supported" },
        { status: 400 }
      );
    }

    const userWallet = walletAddress as `0x${string}`;

    if (!process.env.RELAYER_PRIVATE_KEY || CONTRACTS.FACTORY === "0x0") {
      console.log("SIMULATION MODE: No relayer key or contracts not deployed");
      return NextResponse.json({
        success: true,
        txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
        simulated: true,
        message: "Transaction simulated (contracts not deployed)",
      });
    }

    const relayerClient = getRelayerClient();

    if (functionName === "contribute" || functionName === "lockSecurityDeposit") {
      const poolContributionAmount = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: ArisanPoolAbi,
        functionName: functionName === "contribute" ? "contributionAmount" : "securityDepositAmount",
      });

      const approvalData = encodeFunctionData({
        abi: MockIDRXAbi,
        functionName: "approve",
        args: [contractAddress as `0x${string}`, poolContributionAmount],
      });

      const approvalTx = await relayerClient.sendTransaction({
        to: CONTRACTS.MOCK_IDRX,
        data: approvalData,
        account: relayerClient.account!,
      });

      await publicClient.waitForTransactionReceipt({ hash: approvalTx });
    }

    if (functionName === "vouch" && args?.values) {
      const vouchAmount = BigInt(args.values[1]);
      const approvalData = encodeFunctionData({
        abi: MockIDRXAbi,
        functionName: "approve",
        args: [contractAddress as `0x${string}`, vouchAmount],
      });

      const approvalTx = await relayerClient.sendTransaction({
        to: CONTRACTS.MOCK_IDRX,
        data: approvalData,
        account: relayerClient.account!,
      });

      await publicClient.waitForTransactionReceipt({ hash: approvalTx });
    }

    let data: `0x${string}`;

    if (args?.types && args?.values && args.values.length > 0) {
      const abiItem = ArisanPoolAbi.find(
        (item) => item.type === "function" && item.name === functionName
      );

      if (!abiItem) {
        throw new Error(`Function ${functionName} not found in ABI`);
      }

      data = encodeFunctionData({
        abi: ArisanPoolAbi,
        functionName: functionName as any,
        args: args.values.map((v: string, i: number) => {
          const type = args.types[i];
          if (type === "uint256") return BigInt(v);
          if (type === "address[]") return JSON.parse(v);
          return v;
        }),
      });
    } else {
      data = encodeFunctionData({
        abi: ArisanPoolAbi,
        functionName: functionName as any,
      });
    }

    const txHash = await relayerClient.sendTransaction({
      to: contractAddress as `0x${string}`,
      data,
      account: relayerClient.account!,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    return NextResponse.json({
      success: true,
      txHash,
      simulated: false,
      status: receipt.status,
    });
  } catch (error: any) {
    console.error("Relay error:", error);
    return NextResponse.json(
      { error: error.message || "Transaction failed" },
      { status: 500 }
    );
  }
}

