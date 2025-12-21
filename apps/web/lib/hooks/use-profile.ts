"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useWalletAddress } from "./use-wallet-address";

interface UserProfile {
  walletAddress: string;
  nama: string;
  whatsapp: string;
  kota?: string;
}

export function useProfile() {
  const walletAddress = useWalletAddress();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setIsLoading(false);
      return;
    }

    fetch(`/api/profile?address=${walletAddress}`)
      .then(res => res.json())
      .then(data => {
        setProfile(data.profile || null);
      })
      .catch(() => {
        setProfile(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [walletAddress]);

  return { profile, isLoading, hasProfile: !!profile };
}

export function useRequireProfile() {
  const router = useRouter();
  const pathname = usePathname();
  const walletAddress = useWalletAddress();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setIsChecking(false);
      return;
    }

    if (pathname === "/profile") {
      setIsChecking(false);
      return;
    }

    fetch(`/api/profile?address=${walletAddress}`)
      .then(res => res.json())
      .then(data => {
        if (!data.profile) {
          router.push(`/profile?returnTo=${encodeURIComponent(pathname)}`);
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsChecking(false);
      });
  }, [walletAddress, pathname, router]);

  return { isChecking };
}





