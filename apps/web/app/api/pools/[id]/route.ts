import { NextRequest, NextResponse } from "next/server";
import { publicClient, CONTRACTS } from "@/lib/contracts/client";
import { ArisanFactoryAbi, ArisanPoolAbi } from "@/lib/contracts/abis";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const poolId = params.id;

    if (CONTRACTS.FACTORY === "0x0") {
      return NextResponse.json({
        id: poolId,
        simulated: true,
        message: "Contracts not deployed yet",
        status: "Active",
        contributionAmount: "500000",
        securityDeposit: "1000000",
        maxMembers: 10,
        currentRound: 1,
        totalRounds: 10,
        members: [],
        rotationOrder: [],
      });
    }

    const poolAddress = await publicClient.readContract({
      address: CONTRACTS.FACTORY,
      abi: ArisanFactoryAbi,
      functionName: "getPool",
      args: [BigInt(poolId)],
    });

    if (poolAddress === "0x0000000000000000000000000000000000000000") {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    const [
      admin,
      status,
      contributionAmount,
      securityDepositAmount,
      maxMembers,
      currentRound,
      totalRounds,
      memberList,
      rotationOrder,
    ] = await Promise.all([
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
      publicClient.readContract({
        address: poolAddress,
        abi: ArisanPoolAbi,
        functionName: "getMemberList",
      }),
      publicClient.readContract({
        address: poolAddress,
        abi: ArisanPoolAbi,
        functionName: "getRotationOrder",
      }),
    ]);

    const members = await Promise.all(
      memberList.map(async (memberAddress) => {
        const memberInfo = await publicClient.readContract({
          address: poolAddress,
          abi: ArisanPoolAbi,
          functionName: "getMemberInfo",
          args: [memberAddress],
        });

        let hasContributed = false;
        if (Number(currentRound) > 0) {
          hasContributed = await publicClient.readContract({
            address: poolAddress,
            abi: ArisanPoolAbi,
            functionName: "hasContributed",
            args: [currentRound, memberAddress],
          });
        }

        const statusMap = ["None", "Pending", "Approved", "Active", "Defaulted", "Removed"];

        return {
          address: memberAddress,
          status: statusMap[memberInfo.status] || "Unknown",
          lockedStake: memberInfo.lockedStake.toString(),
          liquidBalance: memberInfo.liquidBalance.toString(),
          joinedAt: memberInfo.joinedAt.toString(),
          hasClaimedPayout: memberInfo.hasClaimedPayout,
          hasContributed,
          isAdmin: memberAddress.toLowerCase() === admin.toLowerCase(),
        };
      })
    );

    const statusMap = ["Pending", "Active", "Completed", "Cancelled"];

    return NextResponse.json({
      id: poolId,
      address: poolAddress,
      admin,
      status: statusMap[status] || "Unknown",
      contributionAmount: contributionAmount.toString(),
      securityDeposit: securityDepositAmount.toString(),
      maxMembers: Number(maxMembers),
      currentRound: Number(currentRound),
      totalRounds: Number(totalRounds),
      members,
      rotationOrder: rotationOrder.map((addr) => addr.toString()),
      memberCount: memberList.length,
    });
  } catch (error: any) {
    console.error("Pool detail error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


