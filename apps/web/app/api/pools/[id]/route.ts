import { NextRequest, NextResponse } from "next/server";
import { queryIndexer, QUERIES } from "@/lib/graphql/client";
import { publicClient, CONTRACTS } from "@/lib/contracts/client";
import { ArisanFactoryAbi, ArisanPoolAbi } from "@/lib/contracts/abis";
import { getProfilesByAddresses } from "@/lib/db/client";

const USE_INDEXER = process.env.NEXT_PUBLIC_USE_INDEXER === "true";
const STATUS_MAP = ["Pending", "Active", "Completed", "Cancelled"];
const MEMBER_STATUS_MAP = ["None", "Pending", "Approved", "Active", "Defaulted", "Removed"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: poolId } = await params;
    const userAddress = req.nextUrl.searchParams.get("address") as `0x${string}` | null;

    console.log(`[Pool Detail API] USE_INDEXER=${USE_INDEXER}, poolId: ${poolId}`);

    if (USE_INDEXER) {
      console.log("[Pool Detail API] 📊 Fetching from INDEXER...");
      return await getPoolDetailFromIndexer(poolId, userAddress);
    }

    console.log("[Pool Detail API] 🔗 Fetching from RPC...");
    return await getPoolDetailFromRPC(poolId, userAddress);
  } catch (error: any) {
    console.error("Pool detail error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function getPoolDetailFromIndexer(poolId: string, userAddress: string | null) {
  try {
    const data = await queryIndexer<{
      pool: any;
      members: { items: any[] };
      contributions: { items: any[] };
      vouchs: { items: any[] };
      winnerHistorys: { items: any[] };
      rotationOrders: { items: any[] };
    }>(QUERIES.GET_POOL_DETAIL, { poolId });

    if (!data.pool) {
      return NextResponse.json({ error: "Pool not found" }, { status: 404 });
    }

    const pool = data.pool;
    const members = data.members.items;
    const contributions = data.contributions.items;
    const vouches = data.vouchs.items;
    const winnerHistories = data.winnerHistorys.items;
    const rotationOrders = data.rotationOrders.items;

    const vouchesByVouchee = new Map<string, any[]>();
    vouches.forEach((v: any) => {
      const key = v.voucheeAddress.toLowerCase();
      if (!vouchesByVouchee.has(key)) {
        vouchesByVouchee.set(key, []);
      }
      vouchesByVouchee.get(key)!.push({
        voucher: v.voucherAddress,
        amount: v.amount.toString(),
        returned: v.returned,
      });
    });

    const contributionsByMember = new Map<string, boolean>();
    contributions
      .filter((c: any) => Number(c.round) === Number(pool.currentRound))
      .forEach((c: any) => {
        contributionsByMember.set(c.memberAddress.toLowerCase(), true);
      });

    const formattedMembers = members
      .filter((m: any) => m.status === "Active" || m.status === "Approved")
      .map((m: any) => ({
        address: m.address,
        status: m.status,
        lockedStake: m.lockedStake?.toString() || "0",
        liquidBalance: m.liquidBalance?.toString() || "0",
        joinedAt: m.joinedAt?.toString() || "0",
        hasClaimedPayout: m.hasClaimedPayout || false,
        hasContributed: contributionsByMember.get(m.address.toLowerCase()) || false,
        isAdmin: m.address.toLowerCase() === pool.admin.toLowerCase(),
        vouches: vouchesByVouchee.get(m.address.toLowerCase()) || [],
      }));

    const pendingMembers = members
      .filter((m: any) => m.status === "Pending")
      .map((m: any) => ({
        address: m.address,
        status: m.status,
        vouches: vouchesByVouchee.get(m.address.toLowerCase()) || [],
      }));

    const isAdmin = userAddress
      ? pool.admin.toLowerCase() === userAddress.toLowerCase()
      : false;

    const userMember = userAddress
      ? formattedMembers.find((m: any) => m.address.toLowerCase() === userAddress.toLowerCase())
      : null;

    const currentWinnerHistory = winnerHistories.find((w: any) => Number(w.round) === Number(pool.currentRound));

    const roundHistory = winnerHistories.map((w: any) => ({
      round: Number(w.round),
      winner: w.winnerAddress,
      payout: w.payoutAmount?.toString() || "0",
      completed: !!w.claimedAt,
    }));

    const allMemberAddresses = [...formattedMembers, ...pendingMembers].map((m: any) => m.address);
    let memberProfiles: Record<string, { nama: string; whatsapp: string }> = {};
    try {
      const profiles = await getProfilesByAddresses(allMemberAddresses);
      profiles.forEach((profile, address) => {
        memberProfiles[address] = { nama: profile.nama, whatsapp: profile.whatsapp };
      });
    } catch (e) {
      console.log("[Pool Detail API] Could not fetch profiles:", e);
    }

    console.log(`[Pool Detail API] ✅ Indexer returned pool ${poolId}`);

    return NextResponse.json({
      id: poolId,
      address: pool.address,
      admin: pool.admin,
      name: pool.poolName || pool.name || null,
      poolName: pool.poolName || pool.name || null,
      category: pool.category || null,
      rotationPeriod: typeof pool.rotationPeriod === "number" 
        ? (pool.rotationPeriod === 0 ? "Weekly" : "Monthly")
        : pool.rotationPeriod,
      status: pool.status,
      contributionAmount: pool.contributionAmount?.toString() || "0",
      securityDeposit: pool.securityDeposit?.toString() || "0",
      maxMembers: pool.maxMembers,
      paymentDay: pool.paymentDay,
      vouchRequired: pool.vouchRequired,
      currentRound: pool.currentRound,
      totalRounds: pool.totalRounds,
      activeMembers: formattedMembers.filter((m: any) => m.status === "Active").length,
      deadline: 0,
      currentWinner: currentWinnerHistory?.winnerAddress || null,
      currentPayout: currentWinnerHistory?.payoutAmount?.toString() || "0",
      members: formattedMembers,
      pendingMembers,
      rotationOrder: rotationOrders.map((r: any) => r.memberAddress),
      memberCount: formattedMembers.length,
      isAdmin,
      userMember,
      roundHistory,
      memberProfiles,
    });
  } catch (error) {
    console.error("Indexer error, falling back to RPC:", error);
    return await getPoolDetailFromRPC(poolId, userAddress);
  }
}

async function getPoolDetailFromRPC(poolId: string, userAddress: string | null) {
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
      pendingMembers: [],
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

  const [poolStatus, config, admin, memberList, pendingList, rotationOrder, roundDeadline] = await Promise.all([
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
      functionName: "admin",
    }),
    publicClient.readContract({
      address: poolAddress,
      abi: ArisanPoolAbi,
      functionName: "getMemberList",
    }),
    publicClient.readContract({
      address: poolAddress,
      abi: ArisanPoolAbi,
      functionName: "getPendingList",
    }),
    publicClient.readContract({
      address: poolAddress,
      abi: ArisanPoolAbi,
      functionName: "getRotationOrder",
    }),
    publicClient.readContract({
      address: poolAddress,
      abi: ArisanPoolAbi,
      functionName: "getRoundDeadline",
    }),
  ]);

  const [status, currentRound, totalRounds, activeMembers, deadline] = poolStatus as [number, bigint, bigint, bigint, bigint];
  const {
    contributionAmount,
    securityDepositAmount,
    maxMembers,
    paymentDay,
    vouchRequired,
    rotationPeriod,
    poolName: poolNameStr,
    category: categoryStr
  } = config as {
    contributionAmount: bigint;
    securityDepositAmount: bigint;
    maxMembers: bigint;
    paymentDay: number;
    vouchRequired: boolean;
    rotationPeriod: number;
    poolName: string;
    category: string;
  };
  
  const poolConfig = {
    contributionAmount,
    securityDepositAmount,
    maxMembers,
    paymentDay,
    vouchRequired,
    rotationPeriod,
    poolName: poolNameStr,
    category: categoryStr
  };

  let currentWinner: string | null = null;
  let currentPayout = BigInt(0);
  
  if (Number(currentRound) > 0) {
    try {
      currentWinner = await publicClient.readContract({
        address: poolAddress,
        abi: ArisanPoolAbi,
        functionName: "roundWinners",
        args: [currentRound],
      }) as string;

      if (currentWinner === "0x0000000000000000000000000000000000000000") {
        currentWinner = null;
      }

      currentPayout = await publicClient.readContract({
        address: poolAddress,
        abi: ArisanPoolAbi,
        functionName: "roundPayouts",
        args: [currentRound],
      }) as bigint;
    } catch {
    }
  }

  const members = await Promise.all(
    (memberList as string[]).map(async (memberAddress) => {
      const [memberInfo, vouchesReceived] = await Promise.all([
        publicClient.readContract({
          address: poolAddress,
          abi: ArisanPoolAbi,
          functionName: "getMemberInfo",
          args: [memberAddress as `0x${string}`],
        }),
        publicClient.readContract({
          address: poolAddress,
          abi: ArisanPoolAbi,
          functionName: "getVouchesReceived",
          args: [memberAddress as `0x${string}`],
        }),
      ]);

      let hasContributed = false;
      if (Number(currentRound) > 0 && status === 1) {
        try {
          hasContributed = await publicClient.readContract({
            address: poolAddress,
            abi: ArisanPoolAbi,
            functionName: "hasContributed",
            args: [currentRound, memberAddress as `0x${string}`],
          }) as boolean;
        } catch {
        }
      }

      const info = memberInfo as {
        status: number;
        lockedStake: bigint;
        liquidBalance: bigint;
        joinedAt: bigint;
        hasClaimedPayout: boolean;
      };

      const vouches = (vouchesReceived as Array<{ voucher: string; amount: bigint; returned: boolean }>).map(v => ({
        voucher: v.voucher,
        amount: v.amount.toString(),
        returned: v.returned,
      }));

      return {
        address: memberAddress,
        status: MEMBER_STATUS_MAP[info.status] || "Unknown",
        lockedStake: info.lockedStake.toString(),
        liquidBalance: info.liquidBalance.toString(),
        joinedAt: info.joinedAt.toString(),
        hasClaimedPayout: info.hasClaimedPayout,
        hasContributed,
        isAdmin: memberAddress.toLowerCase() === (admin as string).toLowerCase(),
        vouches,
      };
    })
  );

  const pendingMembers = await Promise.all(
    (pendingList as string[]).map(async (memberAddress) => {
      const [memberInfo, vouchesReceived] = await Promise.all([
        publicClient.readContract({
          address: poolAddress,
          abi: ArisanPoolAbi,
          functionName: "getMemberInfo",
          args: [memberAddress as `0x${string}`],
        }),
        publicClient.readContract({
          address: poolAddress,
          abi: ArisanPoolAbi,
          functionName: "getVouchesReceived",
          args: [memberAddress as `0x${string}`],
        }),
      ]);

      const info = memberInfo as {
        status: number;
        lockedStake: bigint;
        liquidBalance: bigint;
        joinedAt: bigint;
        hasClaimedPayout: boolean;
      };

      const vouches = (vouchesReceived as Array<{ voucher: string; amount: bigint; returned: boolean }>).map(v => ({
        voucher: v.voucher,
        amount: v.amount.toString(),
        returned: v.returned,
      }));

      return {
        address: memberAddress,
        status: MEMBER_STATUS_MAP[info.status] || "Unknown",
        vouches,
      };
    })
  );

  const isAdmin = userAddress 
    ? (admin as string).toLowerCase() === userAddress.toLowerCase()
    : false;

  const userMember = userAddress 
    ? members.find(m => m.address.toLowerCase() === userAddress.toLowerCase())
    : null;

  const roundHistory = [];
  for (let round = 1; round <= Number(currentRound); round++) {
    try {
      const [winner, payout, completed] = await Promise.all([
        publicClient.readContract({
          address: poolAddress,
          abi: ArisanPoolAbi,
          functionName: "roundWinners",
          args: [BigInt(round)],
        }),
        publicClient.readContract({
          address: poolAddress,
          abi: ArisanPoolAbi,
          functionName: "roundPayouts",
          args: [BigInt(round)],
        }),
        publicClient.readContract({
          address: poolAddress,
          abi: ArisanPoolAbi,
          functionName: "roundCompleted",
          args: [BigInt(round)],
        }),
      ]);

      const winnerAddr = winner as string;
      if (winnerAddr !== "0x0000000000000000000000000000000000000000") {
        roundHistory.push({
          round,
          winner: winnerAddr,
          payout: (payout as bigint).toString(),
          completed: completed as boolean,
        });
      }
    } catch (err) {
      console.error(`Error fetching round ${round}:`, err);
    }
  }

  const allMemberAddresses = [...members, ...pendingMembers].map((m: any) => m.address);
  let memberProfiles: Record<string, { nama: string; whatsapp: string }> = {};
  try {
    const profiles = await getProfilesByAddresses(allMemberAddresses);
    profiles.forEach((profile, address) => {
      memberProfiles[address] = { nama: profile.nama, whatsapp: profile.whatsapp };
    });
  } catch (e) {
    console.log("[Pool Detail API] Could not fetch profiles:", e);
  }

  return NextResponse.json({
    id: poolId,
    address: poolAddress,
    admin,
    poolName: poolNameStr || poolConfig.poolName || null,
    name: poolNameStr || poolConfig.poolName || null,
    category: categoryStr || poolConfig.category || null,
    rotationPeriod: poolConfig.rotationPeriod === 0 ? "Weekly" : poolConfig.rotationPeriod === 1 ? "Monthly" : "Monthly",
    status: STATUS_MAP[status] || "Unknown",
    contributionAmount: poolConfig.contributionAmount.toString(),
    securityDeposit: poolConfig.securityDepositAmount.toString(),
    maxMembers: Number(poolConfig.maxMembers),
    paymentDay: poolConfig.paymentDay,
    vouchRequired: poolConfig.vouchRequired,
    currentRound: Number(currentRound),
    totalRounds: Number(totalRounds),
    activeMembers: Number(activeMembers),
    deadline: Number(roundDeadline),
    currentWinner,
    currentPayout: currentPayout.toString(),
    members,
    pendingMembers,
    rotationOrder: (rotationOrder as string[]).map((addr) => addr.toString()),
    memberCount: (memberList as string[]).length,
    isAdmin,
    userMember,
    roundHistory,
    memberProfiles,
  });
}
