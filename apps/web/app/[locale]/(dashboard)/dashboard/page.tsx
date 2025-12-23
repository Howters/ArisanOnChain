"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Wallet, 
  Lock, 
  Users, 
  Plus, 
  CircleDot,
  Crown,
  Loader2,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useUserStore } from "@/stores/user-store";
import { usePools, useBalance, useDebtNFTs } from "@/lib/hooks/use-contracts";
import { useSocialProfile } from "@/lib/hooks/use-social-profile";
import { formatIDR } from "@/lib/utils";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const { balances, setBalances } = useUserStore();
  const { data: poolsData, isLoading: poolsLoading, refetch: refetchPools, isRefetching } = usePools();
  const { data: balanceData } = useBalance();
  const { profile } = useSocialProfile();
  const { data: debtData } = useDebtNFTs();

  const myPools = poolsData?.pools || [];
  const debts = debtData?.debts || [];
  
  const totalLocked = myPools.reduce((acc: bigint, pool: any) => {
    const userLockedStake = pool.userLockedStake ? BigInt(pool.userLockedStake) : BigInt(0);
    return acc + userLockedStake;
  }, BigInt(0));

  useEffect(() => {
    if (balanceData) {
      setBalances({
        liquid: balanceData.liquid,
        locked: totalLocked,
      });
    }
  }, [balanceData, totalLocked, setBalances]);

  const stats = [
    {
      label: t("availableBalance"),
      value: formatIDR(Number(balances.liquid)),
      sublabel: "IDRX",
      icon: Wallet,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: t("lockedFunds"),
      value: formatIDR(Number(balances.locked)),
      sublabel: t("securityDeposit"),
      icon: Lock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">
            {t("welcome")}{profile.name ? `, ${profile.name}` : ""}! 👋
          </h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("createNew")}
          </Link>
        </Button>
      </div>

      {debts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-destructive/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-destructive">{t("debtWarning", { count: debts.length })}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("totalDebt")}: {formatIDR(debts.reduce((acc: number, d: any) => acc + Number(d.defaultedAmount), 0))} IDRX
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("payDebt")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold font-display">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
                  </div>
                  <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("myArisan")}</CardTitle>
                <CardDescription>{t("myArisanDesc")}</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => refetchPools()}
                disabled={isRefetching}
              >
                <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
              </Button>
            </CardHeader>
            <CardContent>
              {poolsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : myPools.length === 0 ? (
                <div className="text-center py-8">
                  <CircleDot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {t("noArisan")}
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/new">
                      <Plus className="mr-2 h-4 w-4" />
                      {t("createNew")}
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myPools.map((pool: any, index: number) => (
                    <motion.div
                      key={pool.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={`/circle/${pool.id}`}>
                        <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">
                                {pool.poolName || pool.name || `Arisan #${pool.id}`}
                              </p>
                              {pool.isAdmin && (
                                <Badge variant="secondary" className="shrink-0">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatIDR(Number(pool.contributionAmount))}{pool.rotationPeriod === "Weekly" ? tc("perWeek") : tc("perMonth")} • {pool.memberCount} {tc("members")}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <Badge 
                              variant={pool.status === "Active" ? "success" : pool.status === "Pending" ? "warning" : "secondary"}
                            >
                              {pool.status === "Active" ? tc("active") : pool.status === "Pending" ? tc("pending") : pool.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {tc("period")} {pool.currentRound}/{pool.totalRounds}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("quickInfo")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("totalArisan")}</span>
                  <span className="font-medium">{myPools.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("activeArisan")}</span>
                  <span className="font-medium">
                    {myPools.filter((p: any) => p.status === "Active").length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("asAdmin")}</span>
                  <span className="font-medium">
                    {myPools.filter((p: any) => p.isAdmin).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
