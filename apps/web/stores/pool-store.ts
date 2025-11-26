import { create } from "zustand";

interface Pool {
  id: string;
  address: string;
  admin: string;
  contributionAmount: bigint;
  securityDeposit: bigint;
  maxMembers: number;
  currentRound: number;
  totalRounds: number;
  status: string;
}

interface PoolState {
  pools: Pool[];
  selectedPool: Pool | null;
  pendingTx: string | null;
  isLoading: boolean;
  setPools: (pools: Pool[]) => void;
  setSelectedPool: (pool: Pool | null) => void;
  setPendingTx: (hash: string | null) => void;
  setLoading: (loading: boolean) => void;
  addPool: (pool: Pool) => void;
  updatePool: (id: string, updates: Partial<Pool>) => void;
}

export const usePoolStore = create<PoolState>()((set) => ({
  pools: [],
  selectedPool: null,
  pendingTx: null,
  isLoading: false,
  setPools: (pools) => set({ pools }),
  setSelectedPool: (pool) => set({ selectedPool: pool }),
  setPendingTx: (hash) => set({ pendingTx: hash }),
  setLoading: (loading) => set({ isLoading: loading }),
  addPool: (pool) => set((state) => ({ pools: [...state.pools, pool] })),
  updatePool: (id, updates) =>
    set((state) => ({
      pools: state.pools.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
}));


