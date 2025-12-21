import { NextRequest, NextResponse } from "next/server";
import { queryIndexer, QUERIES } from "@/lib/graphql/client";
import { publicClient, CONTRACTS } from "@/lib/contracts/client";
import { ArisanFactoryAbi, ArisanPoolAbi } from "@/lib/contracts/abis";

const USE_INDEXER = process.env.NEXT_PUBLIC_USE_INDEXER === "true";
const STATUS_MAP = ["Pending", "Active", "Completed", "Cancelled"];

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address") as `0x${string}` | null;

    console.log(`[Pools API] USE_INDEXER=${USE_INDEXER}, fetching for address: ${address}`);

    if (USE_INDEXER) {
      console.log("[Pools API] 📊 Fetching from INDEXER...");
      return await getPoolsFromIndexer(address);
    }
    
    console.log("[Pools API] 🔗 Fetching from RPC (direct contract calls)...");
    return await getPoolsFromRPC(address);
  } catch (error: any) {
    console.error("Pools error:", error);
    return NextResponse.json({ pools: [], error: error.message });
  }
}

async function getPoolsFromIndexer(address: string | null) {
  try {
    console.log("[Pools API] 📊 Querying indexer at:", process.env.NEXT_PUBLIC_INDEXER_URL);
    const data = await queryIndexer<{
      pools: { items: any[] };
      allMembers: { items: any[] };
      userMembers: { items: any[] };
    }>(QUERIES.GET_POOLS, { userAddress: address?.toLowerCase() });
    console.log(`[Pools API] ✅ Indexer returned ${data.pools.items.length} pools`);

    const userMemberships = new Map(
      data.userMembers.items.map((m: any) => [m.poolId, m])
    );

    const memberCountByPool = new Map<string, number>();
    data.allMembers.items.forEach((m: any) => {
      if (m.status === "Active" || m.status === "Approved") {
        const count = memberCountByPool.get(m.poolId) || 0;
        memberCountByPool.set(m.poolId, count + 1);
      }
    });

    const pools = data.pools.items.map((p: any) => {
      const membership = userMemberships.get(p.id);
      const isAdmin = address?.toLowerCase() === p.admin.toLowerCase();
      const isUserMember = !!membership;

      return {
        id: p.id,
        address: p.address,
        admin: p.admin,
        poolName: p.poolName || p.name || `Arisan #${p.id}`,
        category: p.category || "lainnya",
        rotationPeriod: p.rotationPeriod === 0 ? "Weekly" : "Monthly",
        status: p.status,
        contributionAmount: p.contributionAmount.toString(),
        securityDeposit: p.securityDeposit.toString(),
        maxMembers: p.maxMembers,
        paymentDay: p.paymentDay,
        vouchRequired: p.vouchRequired,
        currentRound: p.currentRound,
        totalRounds: p.totalRounds,
        memberCount: memberCountByPool.get(p.id) || 0,
        isUserMember,
        isAdmin,
        userLockedStake: membership?.lockedStake?.toString() || "0",
      };
    });

    if (address) {
      return NextResponse.json({
        pools: pools.filter((p) => p.isUserMember || p.isAdmin),
        allPools: pools,
      });
    }

    return NextResponse.json({ pools });
  } catch (error) {
    console.error("Indexer error, falling back to RPC:", error);
    return await getPoolsFromRPC(address);
  }
}

async function getPoolsFromRPC(address: string | null) {
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
    try {
      const poolAddress = await publicClient.readContract({
        address: CONTRACTS.FACTORY,
        abi: ArisanFactoryAbi,
        functionName: "getPool",
        args: [i],
      });

      const [poolStatus, config, memberList] = await Promise.all([
        publicClient.readContract({
          address: poolAddress,
          abi: ArisanPoolAbi,
          functionName: "getPoolStatus",
        }),
        publicClient.readContract({
          address: poolAddress,
          abi: ArisanPoolAbi,
          functionName: "getPoolConfig",
        }),
        publicClient.readContract({
          address: poolAddress,
          abi: ArisanPoolAbi,
          functionName: "getMemberList",
        }),
      ]);

      const [status, currentRound, totalRounds, activeMembers, deadline] = poolStatus as [number, bigint, bigint, bigint, bigint];
      const poolConfig = config as { 
        contributionAmount: bigint; 
        securityDepositAmount: bigint; 
        maxMembers: bigint;
        paymentDay: number;
        vouchRequired: boolean;
        rotationPeriod: number;
        poolName: string;
        category: string;
      };

      const admin = await publicClient.readContract({
        address: poolAddress,
        abi: ArisanPoolAbi,
        functionName: "admin",
      });

      const isUserMember = address 
        ? (memberList as string[]).some((m: string) => m.toLowerCase() === address.toLowerCase())
        : false;

      const isAdmin = address 
        ? (admin as string).toLowerCase() === address.toLowerCase()
        : false;

      let userLockedStake = "0";
      if (address && (isUserMember || isAdmin)) {
        try {
          const memberInfo = await publicClient.readContract({
            address: poolAddress,
            abi: ArisanPoolAbi,
            functionName: "getMemberInfo",
            args: [address],
          });
          const info = memberInfo as {
            status: number;
            lockedStake: bigint;
            liquidBalance: bigint;
            joinedAt: bigint;
            hasClaimedPayout: boolean;
          };
          if (info.status >= 2) {
            userLockedStake = info.lockedStake.toString();
          }
        } catch (err) {
          console.error(`Error fetching member info:`, err);
        }
      }

      pools.push({
        id: i.toString(),
        address: poolAddress,
        admin,
        poolName: poolConfig.poolName,
        category: poolConfig.category,
        rotationPeriod: poolConfig.rotationPeriod === 0 ? "Weekly" : "Monthly",
        status: STATUS_MAP[status] || "Unknown",
        contributionAmount: poolConfig.contributionAmount.toString(),
        securityDeposit: poolConfig.securityDepositAmount.toString(),
        maxMembers: Number(poolConfig.maxMembers),
        paymentDay: poolConfig.paymentDay,
        vouchRequired: poolConfig.vouchRequired,
        currentRound: Number(currentRound),
        totalRounds: Number(totalRounds),
        activeMembers: Number(activeMembers),
        memberCount: (memberList as string[]).length,
        deadline: Number(deadline),
        isUserMember,
        isAdmin,
        userLockedStake,
      });
    } catch (err) {
      console.error(`Error fetching pool ${i}:`, err);
    }
  }

  if (address) {
    return NextResponse.json({
      pools: pools.filter((p) => p.isUserMember || p.isAdmin),
      allPools: pools,
    });
  }

  return NextResponse.json({ pools });
}
