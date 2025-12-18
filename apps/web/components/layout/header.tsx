"use client";

import { useActiveAccount, useDisconnect, useActiveWallet } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Wallet, LogOut, User, Settings, RefreshCw, Loader2, Copy, Check } from "lucide-react";
import { formatAddress, formatIDR } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import { Link } from "@/i18n/routing";
import { TopUpDialog } from "@/components/topup/topup-dialog";
import { FaucetButton } from "@/components/faucet/faucet-button";
import { useBalance } from "@/lib/hooks/use-contracts";
import { useEffect, useState } from "react";
import { useSocialProfile } from "@/lib/hooks/use-social-profile";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const t = useTranslations("header");
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const { balances, setBalances } = useUserStore();
  const { data: balanceData, refetch: refetchBalance, isRefetching } = useBalance();
  const { profile, address, isLoading: profileLoading } = useSocialProfile();
  const [copied, setCopied] = useState(false);

  const walletAddress = account?.address;
  const walletReady = !!account;
  
  const displayName = profile.name || (walletAddress ? formatAddress(walletAddress) : "User");
  const avatarInitials = profile.name 
    ? profile.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : profile.email
    ? profile.email.slice(0, 2).toUpperCase()
    : (walletAddress ? walletAddress.slice(2, 4).toUpperCase() : "?");

  useEffect(() => {
    if (balanceData) {
      setBalances({
        liquid: balanceData.liquid,
        locked: balanceData.locked,
      });
    }
  }, [balanceData, setBalances]);

  const handleRefreshBalance = async () => {
    await refetchBalance();
  };

  const handleLogout = () => {
    if (wallet) {
      disconnect(wallet);
    }
  };

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success(t("addressCopied"));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        
        <div className="hidden sm:flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">
            {!walletReady ? (
              <span className="text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                {t("preparingWallet")}
              </span>
            ) : (
              <>
                <span className="text-muted-foreground">{t("balance")}: </span>
                <span className="font-semibold">
                  {formatIDR(Number(balances.liquid))} IDRX
                </span>
              </>
            )}
          </div>
          {walletReady && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleRefreshBalance}
              disabled={isRefetching}
            >
              <RefreshCw className={`h-3 w-3 ${isRefetching ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>

        <FaucetButton />
        <TopUpDialog />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                {profile.avatar && <AvatarImage src={profile.avatar} alt={profile.name || "User"} />}
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {avatarInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-2">
                {profile.name ? (
                  <p className="text-sm font-medium">{profile.name}</p>
                ) : profileLoading ? (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {t("loadingProfile")}
                  </p>
                ) : null}
                {profile.email && (
                  <p className="text-xs text-muted-foreground">
                    {profile.email}
                  </p>
                )}
                {walletAddress && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <p className="text-xs font-mono text-muted-foreground flex-1 truncate">
                      {walletAddress}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={handleCopyAddress}
                    >
                      {copied ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                )}
                {!walletAddress && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {t("creatingWallet")}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                {t("profile")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                {t("settings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
