"use client";

import { useActiveAccount, useAutoConnect } from "thirdweb/react";
import { useRouter, usePathname } from "@/i18n/routing";
import { usePathname as useNextPathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Loader2 } from "lucide-react";
import { client, liskSepolia } from "@/lib/thirdweb/client";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { useTranslations } from "next-intl";

const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "email"],
    },
    smartAccount: {
      chain: liskSepolia,
      sponsorGas: true,
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tc = useTranslations("common");
  const account = useActiveAccount();
  const router = useRouter();
  const pathname = usePathname();
  const nextPathname = useNextPathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileStatus, setProfileStatus] = useState<'loading' | 'complete' | 'incomplete' | null>(null);
  
  const { isLoading: isAutoConnecting } = useAutoConnect({
    client,
    wallets,
  });

  useEffect(() => {
    if (!isAutoConnecting && !account) {
      router.push("/login");
    }
  }, [isAutoConnecting, account, router]);

  useEffect(() => {
    if (!account?.address) {
      setProfileStatus(null);
      return;
    }

    if (nextPathname.includes("/profile")) {
      setProfileStatus('complete');
      return;
    }

    setProfileStatus('loading');
    
    fetch(`/api/profile?address=${account.address}`)
      .then(res => res.json())
      .then(data => {
        if (!data.profile || !data.profile.nama || !data.profile.whatsapp) {
          setProfileStatus('incomplete');
          router.push(`/profile?returnTo=${encodeURIComponent(pathname)}`);
        } else {
          setProfileStatus('complete');
        }
      })
      .catch(() => {
        setProfileStatus('complete');
      });
  }, [account?.address, nextPathname, pathname, router]);

  if (isAutoConnecting || !account) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">{tc("loading")}</p>
        </div>
      </div>
    );
  }

  if (profileStatus === 'loading' && !nextPathname.includes("/profile")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">{tc("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
