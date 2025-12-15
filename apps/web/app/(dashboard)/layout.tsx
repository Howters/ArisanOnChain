"use client";

import { useActiveAccount, useAutoConnect } from "thirdweb/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Loader2 } from "lucide-react";
import { client, liskSepolia } from "@/lib/thirdweb/client";
import { inAppWallet, createWallet } from "thirdweb/wallets";

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
  const account = useActiveAccount();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);
  
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
    if (!account?.address || pathname === "/profile" || profileChecked) return;
    
    fetch(`/api/profile?address=${account.address}`)
      .then(res => res.json())
      .then(data => {
        if (!data.profile) {
          router.push(`/profile?returnTo=${encodeURIComponent(pathname)}`);
        }
        setProfileChecked(true);
      })
      .catch(() => setProfileChecked(true));
  }, [account?.address, pathname, router, profileChecked]);

  // Show loading while auto-connecting
  if (isAutoConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Memuat sesi...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Mengalihkan ke login...</p>
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
