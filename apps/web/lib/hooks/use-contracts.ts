"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { getPoolContract, getMockIdrxContract, getArisanFactoryContract } from "@/lib/thirdweb/contracts";

function useWalletAddress() {
  const account = useActiveAccount();
  return account?.address;
}

export function useBalance() {
  const walletAddress = useWalletAddress();

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
  const walletAddress = useWalletAddress();

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
  const walletAddress = useWalletAddress();

  return useQuery({
    queryKey: ["pool", poolId, walletAddress],
    queryFn: async () => {
      const res = await fetch(`/api/pools/${poolId}?address=${walletAddress || ""}`);
      return res.json();
    },
    enabled: !!poolId,
  });
}

export function useTopUp() {
  const queryClient = useQueryClient();
  const walletAddress = useWalletAddress();

  return useMutation({
    mutationFn: async ({ amount, paymentMethod }: { amount: number; paymentMethod: string }) => {
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

export function useCreatePool() {
  const queryClient = useQueryClient();
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();

  return useMutation({
    mutationFn: async ({ 
      contributionAmount, 
      securityDeposit, 
      maxMembers,
      paymentDay,
      vouchRequired,
    }: { 
      contributionAmount: bigint; 
      securityDeposit: bigint; 
      maxMembers: number;
      paymentDay: number;
      vouchRequired: boolean;
    }): Promise<{ poolId: string; poolAddress: string }> => {
      if (!account) throw new Error("Wallet not connected");

      const factoryContract = getArisanFactoryContract();
      
      const tx = prepareContractCall({
        contract: factoryContract,
        method: "function createPool(uint256 contributionAmount, uint256 securityDepositAmount, uint256 maxMembers, uint8 paymentDay, bool vouchRequired) returns (uint256, address)",
        params: [contributionAmount, securityDeposit, BigInt(maxMembers), paymentDay, vouchRequired],
      });

      const result = await sendTx(tx);
      
      // Parse PoolCreated event from logs to get poolId
      // Event signature: PoolCreated(uint256 indexed poolId, address indexed poolAddress, address indexed admin, ...)
      const poolCreatedTopic = "0x" + "PoolCreated".padEnd(64, "0"); // Simplified - we'll get poolId from API
      
      // For now, fetch the latest pool from the API after creation
      const res = await fetch(`/api/pools?address=${account.address}`);
      const data = await res.json();
      const pools = data.pools || [];
      const latestPool = pools[pools.length - 1];
      
      return { 
        poolId: latestPool?.id?.toString() || "1", 
        poolAddress: latestPool?.address || "" 
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pools"] });
    },
  });
}

export function useRequestJoin(poolAddress: string | undefined) {
  const queryClient = useQueryClient();
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();

  return useMutation({
    mutationFn: async () => {
      if (!account) throw new Error("Wallet not connected");
      if (!poolAddress) throw new Error("Pool address required");

      const poolContract = getPoolContract(poolAddress);
      
      const tx = prepareContractCall({
        contract: poolContract,
        method: "function requestJoin()",
        params: [],
      });

      const result = await sendTx(tx);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pool"] });
    },
  });
}

export function useApproveMember(poolAddress: string | undefined) {
  const queryClient = useQueryClient();
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();

  return useMutation({
    mutationFn: async ({ memberAddress }: { memberAddress: string }) => {
      if (!account) throw new Error("Wallet not connected");
      if (!poolAddress) throw new Error("Pool address required");

      const poolContract = getPoolContract(poolAddress);
      
      const tx = prepareContractCall({
        contract: poolContract,
        method: "function approveMember(address _member)",
        params: [memberAddress as `0x${string}`],
      });

      const result = await sendTx(tx);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pool"] });
    },
  });
}

export function useRejectMember(poolAddress: string | undefined) {
  const queryClient = useQueryClient();
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();

  return useMutation({
    mutationFn: async ({ memberAddress }: { memberAddress: string }) => {
      if (!account) throw new Error("Wallet not connected");
      if (!poolAddress) throw new Error("Pool address required");

      const poolContract = getPoolContract(poolAddress);
      
      const tx = prepareContractCall({
        contract: poolContract,
        method: "function rejectMember(address member)",
        params: [memberAddress as `0x${string}`],
      });

      const result = await sendTx(tx);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pool"] });
    },
  });
}

export function useLockSecurityDeposit(poolAddress: string | undefined) {
  const queryClient = useQueryClient();
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();

  return useMutation({
    mutationFn: async ({ depositAmount }: { depositAmount: bigint }) => {
      if (!account) throw new Error("Wallet not connected");
      if (!poolAddress) throw new Error("Pool address required");

      const poolContract = getPoolContract(poolAddress);
      const idrxContract = getMockIdrxContract();

      const approveTx = prepareContractCall({
        contract: idrxContract,
        method: "function approve(address spender, uint256 amount) returns (bool)",
        params: [poolAddress as `0x${string}`, depositAmount],
      });
      await sendTx(approveTx);

      const tx = prepareContractCall({
        contract: poolContract,
        method: "function lockSecurityDeposit()",
        params: [],
      });

      const result = await sendTx(tx);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pool"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function useContribute(poolAddress: string | undefined) {
  const queryClient = useQueryClient();
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();

  return useMutation({
    mutationFn: async ({ contributionAmount }: { contributionAmount: bigint }) => {
      if (!account) throw new Error("Wallet not connected");
      if (!poolAddress) throw new Error("Pool address required");

      const poolContract = getPoolContract(poolAddress);
      const idrxContract = getMockIdrxContract();

      const approveTx = prepareContractCall({
        contract: idrxContract,
        method: "function approve(address spender, uint256 amount) returns (bool)",
        params: [poolAddress as `0x${string}`, contributionAmount],
      });
      await sendTx(approveTx);

      const tx = prepareContractCall({
        contract: poolContract,
        method: "function contribute()",
        params: [],
      });

      const result = await sendTx(tx);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["pool"] });
    },
  });
}

export function useVouch(poolAddress: string | undefined) {
  const queryClient = useQueryClient();
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();

  return useMutation({
    mutationFn: async ({ voucheeAddress, amount }: { voucheeAddress: string; amount: bigint }) => {
      if (!account) throw new Error("Wallet not connected");
      if (!poolAddress) throw new Error("Pool address required");

      const poolContract = getPoolContract(poolAddress);
      const idrxContract = getMockIdrxContract();

      const approveTx = prepareContractCall({
        contract: idrxContract,
        method: "function approve(address spender, uint256 amount) returns (bool)",
        params: [poolAddress as `0x${string}`, amount],
      });
      await sendTx(approveTx);

      const tx = prepareContractCall({
        contract: poolContract,
        method: "function vouch(address _vouchee, uint256 _amount)",
        params: [voucheeAddress as `0x${string}`, amount],
      });

      const result = await sendTx(tx);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["pool"] });
    },
  });
}

export function useSetRotationOrder(poolAddress: string | undefined) {
  const queryClient = useQueryClient();
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();

  return useMutation({
    mutationFn: async ({ order }: { order: string[] }) => {
      if (!account) throw new Error("Wallet not connected");
      if (!poolAddress) throw new Error("Pool address required");

      const poolContract = getPoolContract(poolAddress);
      
      const tx = prepareContractCall({
        contract: poolContract,
        method: "function setRotationOrder(address[] calldata _order)",
        params: [order as `0x${string}`[]],
      });

      const result = await sendTx(tx);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pool"] });
    },
  });
}

export function useActivatePool(poolAddress: string | undefined) {
  const queryClient = useQueryClient();
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();

  return useMutation({
    mutationFn: async () => {
      if (!account) throw new Error("Wallet not connected");
      if (!poolAddress) throw new Error("Pool address required");

      const poolContract = getPoolContract(poolAddress);
      
      const tx = prepareContractCall({
        contract: poolContract,
        method: "function activatePool()",
        params: [],
      });

      const result = await sendTx(tx);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pool"] });
      queryClient.invalidateQueries({ queryKey: ["pools"] });
    },
  });
}

export function useDetermineWinner(poolAddress: string | undefined) {
  const queryClient = useQueryClient();
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();

  return useMutation({
    mutationFn: async () => {
      if (!account) throw new Error("Wallet not connected");
      if (!poolAddress) throw new Error("Pool address required");

      const poolContract = getPoolContract(poolAddress);
      
      const tx = prepareContractCall({
        contract: poolContract,
        method: "function determineWinner()",
        params: [],
      });

      const result = await sendTx(tx);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pool"] });
    },
  });
}

export function useClaimPayout(poolAddress: string | undefined) {
  const queryClient = useQueryClient();
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();

  return useMutation({
    mutationFn: async () => {
      if (!account) throw new Error("Wallet not connected");
      if (!poolAddress) throw new Error("Pool address required");

      const poolContract = getPoolContract(poolAddress);
      
      const tx = prepareContractCall({
        contract: poolContract,
        method: "function claimPayout()",
        params: [],
      });

      const result = await sendTx(tx);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pool"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function useReportDefault(poolAddress: string | undefined) {
  const queryClient = useQueryClient();
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();

  return useMutation({
    mutationFn: async ({ memberAddress }: { memberAddress: string }) => {
      if (!account) throw new Error("Wallet not connected");
      if (!poolAddress) throw new Error("Pool address required");

      const poolContract = getPoolContract(poolAddress);
      
      const tx = prepareContractCall({
        contract: poolContract,
        method: "function reportDefault(address _member)",
        params: [memberAddress as `0x${string}`],
      });

      const result = await sendTx(tx);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pool"] });
    },
  });
}

export function useFaucet() {
  const queryClient = useQueryClient();
  const walletAddress = useWalletAddress();

  return useMutation({
    mutationFn: async () => {
      if (!walletAddress) throw new Error("Wallet not connected");

      const res = await fetch("/api/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Faucet failed");
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function useWithdrawLiquidFunds(poolAddress: string | undefined) {
  const queryClient = useQueryClient();
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();

  return useMutation({
    mutationFn: async () => {
      if (!account) throw new Error("Wallet not connected");
      if (!poolAddress) throw new Error("Pool address required");

      const poolContract = getPoolContract(poolAddress);
      
      const tx = prepareContractCall({
        contract: poolContract,
        method: "function withdrawLiquidFunds()",
        params: [],
      });

      const result = await sendTx(tx);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pool"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function useWithdrawSecurityDeposit(poolAddress: string | undefined) {
  const queryClient = useQueryClient();
  const account = useActiveAccount();
  const { mutateAsync: sendTx } = useSendTransaction();

  return useMutation({
    mutationFn: async () => {
      if (!account) throw new Error("Wallet not connected");
      if (!poolAddress) throw new Error("Pool address required");

      const poolContract = getPoolContract(poolAddress);
      
      const tx = prepareContractCall({
        contract: poolContract,
        method: "function withdrawSecurityDeposit()",
        params: [],
      });

      const result = await sendTx(tx);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pool"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function useDebtNFTs() {
  const walletAddress = useWalletAddress();

  return useQuery({
    queryKey: ["debts", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return { debts: [] };
      
      const res = await fetch(`/api/debt?address=${walletAddress}`);
      return res.json();
    },
    enabled: !!walletAddress,
  });
}

export function useTransactionHistory() {
  const walletAddress = useWalletAddress();

  return useQuery({
    queryKey: ["transactions", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return { transactions: [] };
      
      const res = await fetch(`/api/transactions?address=${walletAddress}`);
      return res.json();
    },
    enabled: !!walletAddress,
  });
}
