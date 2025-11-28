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
  "withdrawSecurityDeposit",
  "withdrawVouch",
  "approveMember",
  "rejectMember",
  "removeMember",
  "setRotationOrder",
  "activatePool",
  "cancelPool",
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
        { error: `Function ${functionName} not supported` },
        { status: 400 }
      );
    }

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

    if (functionName === "contribute") {
      const config = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: ArisanPoolAbi,
        functionName: "getPoolConfig",
      }) as { contributionAmount: bigint };

      await approveToken(relayerClient, contractAddress, config.contributionAmount);
    }

    if (functionName === "lockSecurityDeposit") {
      const config = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: ArisanPoolAbi,
        functionName: "getPoolConfig",
      }) as { securityDepositAmount: bigint };

      await approveToken(relayerClient, contractAddress, config.securityDepositAmount);
    }

    if (functionName === "vouch" && args && args.length >= 2) {
      const vouchAmount = BigInt(args[1]);
      await approveToken(relayerClient, contractAddress, vouchAmount);
    }

    let data: `0x${string}`;

    if (args && args.length > 0) {
      const abiItem = ArisanPoolAbi.find(
        (item) => item.type === "function" && item.name === functionName
      );

      if (!abiItem) {
        throw new Error(`Function ${functionName} not found in ABI`);
      }

      const inputs = (abiItem as { inputs?: Array<{ type: string }> }).inputs || [];
      const processedArgs = args.map((v: any, i: number) => {
        const inputType = inputs[i]?.type;
        if (inputType === "uint256") return BigInt(v);
        if (inputType === "address[]") return Array.isArray(v) ? v : JSON.parse(v);
        return v;
      });

      data = encodeFunctionData({
        abi: ArisanPoolAbi,
        functionName: functionName as any,
        args: processedArgs,
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
      blockNumber: receipt.blockNumber.toString(),
    });
  } catch (error: any) {
    console.error("Relay error:", error);
    return NextResponse.json(
      { error: error.message || "Transaction failed" },
      { status: 500 }
    );
  }
}

async function approveToken(
  relayerClient: ReturnType<typeof getRelayerClient>,
  spender: string,
  amount: bigint
) {
  const approvalData = encodeFunctionData({
    abi: MockIDRXAbi,
    functionName: "approve",
    args: [spender as `0x${string}`, amount],
  });

  const approvalTx = await relayerClient.sendTransaction({
    to: CONTRACTS.MOCK_IDRX,
    data: approvalData,
    account: relayerClient.account!,
  });

  await publicClient.waitForTransactionReceipt({ hash: approvalTx });
}
