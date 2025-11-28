"use client";

import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { useEffect, useState, useMemo } from "react";
import { getLinkedProfiles } from "thirdweb/wallets/in-app";
import { client } from "@/lib/thirdweb/client";

interface SocialProfile {
  name: string | undefined;
  email: string | undefined;
  avatar: string | undefined;
  type: string | undefined;
}

export function useSocialProfile() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const [linkedProfile, setLinkedProfile] = useState<{
    type: string;
    details: { email?: string; name?: string; picture?: string };
  } | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    async function fetchProfiles() {
      if (!wallet) {
        setLinkedProfile(null);
        setHasFetched(true);
        return;
      }

      if (wallet.id !== "inApp") {
        setLinkedProfile(null);
        setHasFetched(true);
        return;
      }

      try {
        const profiles = await getLinkedProfiles({ client });
        if (profiles && profiles.length > 0) {
          const googleProfile = profiles.find(p => p.type === "google");
          const emailProfile = profiles.find(p => p.type === "email");
          const profile = googleProfile || emailProfile || profiles[0];
          setLinkedProfile(profile as any);
        } else {
          setLinkedProfile(null);
        }
      } catch (error) {
        console.error("Error fetching linked profiles:", error);
        setLinkedProfile(null);
      } finally {
        setHasFetched(true);
      }
    }

    setHasFetched(false);
    fetchProfiles();
  }, [wallet]);

  const profile = useMemo((): SocialProfile => {
    if (!linkedProfile) {
      return {
        name: undefined,
        email: undefined,
        avatar: undefined,
        type: undefined,
      };
    }

    return {
      name: linkedProfile.details?.name || undefined,
      email: linkedProfile.details?.email || undefined,
      avatar: linkedProfile.details?.picture || undefined,
      type: linkedProfile.type,
    };
  }, [linkedProfile]);

  return { 
    profile, 
    address: account?.address,
    isLoading: !hasFetched,
  };
}
