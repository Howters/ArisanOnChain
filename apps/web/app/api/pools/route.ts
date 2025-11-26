import { NextRequest, NextResponse } from "next/server";
import { publicClient, CONTRACTS } from "@/lib/contracts/client";
import { ArisanFactoryAbi, ArisanPoolAbi } from "@/lib/contracts/abis";

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address") as `0x${string}`;

    if (CONTRACTS.FACTORY === "0x0") {
      return NextResponse.json({
        pools: [],
        simulated: true,
        message: "Contracts not deployed yet",
      });
    }

    const poolCount = await publicClient.readContract({
      address: CONTRACTS.FACTORY,
      abi: ArisanFactoryAbi,
      functionName: "poolCount",
    });

    const pools = [];
    
    for (let i = BigInt(1); i <= poolCount; i++) {
      const poolAddress = await publicClient.readContract({
        address: CONTRACTS.FACTORY,
        abi: ArisanFactoryAbi,
        functionName: "getPool",
        args: [i],
      });

      const [
        poolId,
        admin,
        status,
        contributionAmount,
        securityDepositAmount,
        maxMembers,
        currentRound,
        totalRounds,
      ] = await Promise.all([
        publicClient.readContract({
          address: poolAddress,
          abi: ArisanPoolAbi,
          functionName: "poolId",
        }),
        publicClient.readContract({
          address: poolAddress,
          abi: ArisanPoolAbi,
          functionName: "admin",
        }),
        publicClient.readContract({
          address: poolAddress,
          abi: ArisanPoolAbi,
          functionName: "status",
        }),
        publicClient.readContract({
          address: poolAddress,
          abi: ArisanPoolAbi,
          functionName: "contributionAmount",
        }),
        publicClient.readContract({
          address: poolAddress,
          abi: ArisanPoolAbi,
          functionName: "securityDepositAmount",
        }),
        publicClient.readContract({
          address: poolAddress,
          abi: ArisanPoolAbi,
          functionName: "maxMembers",
        }),
        publicClient.readContract({
          address: poolAddress,
          abi: ArisanPoolAbi,
          functionName: "currentRound",
        }),
        publicClient.readContract({
          address: poolAddress,
          abi: ArisanPoolAbi,
          functionName: "totalRounds",
        }),
      ]);

      const memberList = await publicClient.readContract({
        address: poolAddress,
        abi: ArisanPoolAbi,
        functionName: "getMemberList",
      });

      const statusMap = ["Pending", "Active", "Completed", "Cancelled"];
      const isUserMember = address ? memberList.some(
        (m) => m.toLowerCase() === address.toLowerCase()
      ) : false;

      pools.push({
        id: poolId.toString(),
        address: poolAddress,
        admin,
        status: statusMap[status] || "Unknown",
        contributionAmount: contributionAmount.toString(),
        securityDeposit: securityDepositAmount.toString(),
        maxMembers: Number(maxMembers),
        currentRound: Number(currentRound),
        totalRounds: Number(totalRounds),
        memberCount: memberList.length,
        isUserMember,
        isAdmin: address ? admin.toLowerCase() === address.toLowerCase() : false,
      });
    }

    if (address) {
      return NextResponse.json({
        pools: pools.filter((p) => p.isUserMember),
        allPools: pools,
      });
    }

    return NextResponse.json({ pools });
  } catch (error: any) {
    console.error("Pools error:", error);
    return NextResponse.json({ pools: [], error: error.message });
  }
}


