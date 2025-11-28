"use client";

import { useActiveAccount } from "thirdweb/react";

export function useWalletAddress(): string | undefined {
  const account = useActiveAccount();
  return account?.address;
}

export function useWalletReady(): boolean {
  const account = useActiveAccount();
  return !!account;
}
