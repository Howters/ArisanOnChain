"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";

export function useBalance() {
  const { user } = usePrivy();
  const walletAddress = user?.wallet?.address;

  return useQuery({
    queryKey: ["balance", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return { liquid: BigInt(0), locked: BigInt(0) };
      
      const res = await fetch(`/api/balance?address=${walletAddress}`);
      const data = await res.json();
      return {
        liquid: BigInt(data.liquid || 0),
        locked: BigInt(data.locked || 0),
      };
    },
    enabled: !!walletAddress,
    refetchInterval: 10000,
  });
}

export function usePools() {
  const { user } = usePrivy();
  const walletAddress = user?.wallet?.address;

  return useQuery({
    queryKey: ["pools", walletAddress],
    queryFn: async () => {
      const res = await fetch(`/api/pools?address=${walletAddress || ""}`);
      return res.json();
    },
    enabled: !!walletAddress,
  });
}

export function usePool(poolId: string) {
  return useQuery({
    queryKey: ["pool", poolId],
    queryFn: async () => {
      const res = await fetch(`/api/pools/${poolId}`);
      return res.json();
    },
    enabled: !!poolId,
  });
}

export function useTopUp() {
  const queryClient = useQueryClient();
  const { user } = usePrivy();

  return useMutation({
    mutationFn: async ({ amount, paymentMethod }: { amount: number; paymentMethod: string }) => {
      const walletAddress = user?.wallet?.address;
      if (!walletAddress) throw new Error("Wallet not connected");

      const res = await fetch("/api/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, paymentMethod, walletAddress }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Top up failed");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function useContribute() {
  const queryClient = useQueryClient();
  const { user } = usePrivy();

  return useMutation({
    mutationFn: async ({ poolAddress }: { poolAddress: string }) => {
      const walletAddress = user?.wallet?.address;
      if (!walletAddress) throw new Error("Wallet not connected");

      const res = await fetch("/api/tx/relay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractAddress: poolAddress,
          functionName: "contribute",
          args: { types: [], values: [] },
          walletAddress,
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Contribution failed");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["pool"] });
    },
  });
}

export function useVouch() {
  const queryClient = useQueryClient();
  const { user } = usePrivy();

  return useMutation({
    mutationFn: async ({ 
      poolAddress, 
      voucheeAddress, 
      amount 
    }: { 
      poolAddress: string; 
      voucheeAddress: string; 
      amount: bigint;
    }) => {
      const walletAddress = user?.wallet?.address;
      if (!walletAddress) throw new Error("Wallet not connected");

      const res = await fetch("/api/tx/relay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractAddress: poolAddress,
          functionName: "vouch",
          args: { 
            types: ["address", "uint256"], 
            values: [voucheeAddress, amount.toString()] 
          },
          walletAddress,
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Vouch failed");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["pool"] });
    },
  });
}

export function useCreatePool() {
  const queryClient = useQueryClient();
  const { user } = usePrivy();

  return useMutation({
    mutationFn: async ({ 
      contributionAmount, 
      securityDeposit, 
      maxMembers 
    }: { 
      contributionAmount: bigint; 
      securityDeposit: bigint; 
      maxMembers: number;
    }) => {
      const walletAddress = user?.wallet?.address;
      if (!walletAddress) throw new Error("Wallet not connected");

      const res = await fetch("/api/pools/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contributionAmount: contributionAmount.toString(),
          securityDeposit: securityDeposit.toString(),
          maxMembers,
          walletAddress,
        }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Pool creation failed");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pools"] });
    },
  });
}
