import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserBalances {
  liquid: bigint;
  locked: bigint;
  mockYield: bigint;
}

interface InvisibleWallet {
  address: string;
}

interface UserState {
  invisibleWallet: InvisibleWallet | null;
  balances: UserBalances;
  isLoading: boolean;
  setWallet: (wallet: InvisibleWallet | null) => void;
  setBalances: (balances: Partial<UserBalances>) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialBalances: UserBalances = {
  liquid: BigInt(0),
  locked: BigInt(0),
  mockYield: BigInt(0),
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      invisibleWallet: null,
      balances: initialBalances,
      isLoading: false,
      setWallet: (wallet) => set({ invisibleWallet: wallet }),
      setBalances: (balances) =>
        set((state) => ({
          balances: { ...state.balances, ...balances },
        })),
      setLoading: (loading) => set({ isLoading: loading }),
      reset: () =>
        set({
          invisibleWallet: null,
          balances: initialBalances,
          isLoading: false,
        }),
    }),
    {
      name: "arisanaman-user",
      partialize: (state) => ({
        invisibleWallet: state.invisibleWallet,
      }),
    }
  )
);


