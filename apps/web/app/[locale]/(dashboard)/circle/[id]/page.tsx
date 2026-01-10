"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  Users,
  Crown,
  Check,
  Clock,
  AlertTriangle,
  Wallet,
  HandshakeIcon,
  Trophy,
  Shield,
  Loader2,
  Play,
  Shuffle,
  ArrowDownToLine,
  Unlock,
  Copy,
  ExternalLink,
  UserPlus,
  RefreshCw,
  X,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import { formatIDR, formatIDRX, formatAddress } from "@/lib/utils";
import { useState } from "react";
import { 
  usePool, 
  useApproveMember, 
  useRejectMember,
  useLockSecurityDeposit,
  useActivatePool,
  useDetermineWinner,
  useClaimPayout,
  useContribute,
  useSetRotationOrder,
  useWithdrawLiquidFunds,
  useWithdrawSecurityDeposit,
  useRequestJoin,
  useBalance,
  useVouch,
  useReportDefault,
} from "@/lib/hooks/use-contracts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWalletAddress } from "@/lib/hooks/use-wallet-address";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useDebtNFTs, useDebtNFTsForAddress } from "@/lib/hooks/use-contracts";

function MemberDebtBadge({ address }: { address: string }) {
  const t = useTranslations("circle");
  const { data: memberDebtData } = useDebtNFTsForAddress(address);
  const memberDebts = memberDebtData?.debts || [];
  const hasDebt = memberDebts.length > 0;
  const totalDebtAmount = memberDebts.reduce((sum: bigint, debt: any) => sum + BigInt(debt.defaultedAmount || 0), BigInt(0));
  
  if (!hasDebt) return null;
  
  return (
    <Badge variant="destructive" className="gap-1 text-xs">
      <AlertTriangle className="h-3 w-3" />
      {t("debtNFTBadge", { count: memberDebts.length })}
      {totalDebtAmount > 0 && (
        <span className="ml-1">({formatIDR(Number(totalDebtAmount))})</span>
      )}
    </Badge>
  );
}

export default function CirclePage() {
  const t = useTranslations("circle");
  const tm = useTranslations("modals");
  const tc = useTranslations("common");
  const params = useParams();
  const poolId = params.id as string;
  const walletAddress = useWalletAddress();
  const userAddress = walletAddress?.toLowerCase();

  const { data: pool, isLoading, refetch, isRefetching } = usePool(poolId);
  const { data: balanceData } = useBalance();
  const userBalance = balanceData?.liquid || BigInt(0);
  const { data: debtData, isLoading: debtLoading } = useDebtNFTs();
  const debts = debtData?.debts || [];
  const hasDebtNFT = !debtLoading && debts.length > 0;
  
  const poolAddress = pool?.address;
  const approveMember = useApproveMember(poolAddress);
  const rejectMember = useRejectMember(poolAddress);
  const lockDeposit = useLockSecurityDeposit(poolAddress);
  const activatePool = useActivatePool(poolAddress);
  const determineWinner = useDetermineWinner(poolAddress);
  const claimPayout = useClaimPayout(poolAddress);
  const contribute = useContribute(poolAddress);
  const setRotation = useSetRotationOrder(poolAddress);
  const withdrawLiquid = useWithdrawLiquidFunds(poolAddress);
  const withdrawDeposit = useWithdrawSecurityDeposit(poolAddress);
  const requestJoin = useRequestJoin(poolAddress);
  const vouch = useVouch(poolAddress);
  const reportDefault = useReportDefault(poolAddress);

  const [showPending, setShowPending] = useState(true);
  const [showReportDefaultModal, setShowReportDefaultModal] = useState(false);
  const [defaultTarget, setDefaultTarget] = useState<{ address: string; name: string } | null>(null);
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showRotationModal, setShowRotationModal] = useState(false);
  const [showVouchModal, setShowVouchModal] = useState(false);
  const [vouchTarget, setVouchTarget] = useState<{ address: string; name: string } | null>(null);
  const [vouchAmount, setVouchAmount] = useState("");

  const memberProfiles = pool?.memberProfiles || {};

  const getDisplayName = (address: string) => {
    return memberProfiles[address.toLowerCase()]?.nama || formatAddress(address);
  };

  const sendWhatsAppReminder = (memberAddress: string) => {
    const profile = memberProfiles[memberAddress.toLowerCase()];
    if (!profile?.whatsapp) {
      toast.error(tc("error"));
      return;
    }
    
    const memberName = profile.nama || formatAddress(memberAddress);
    const poolName = pool?.poolName || pool?.name || "Arisan";
    const amount = formatIDR(Number(pool?.contributionAmount || 0));
    const round = pool?.currentRound || 1;
    
    const message = encodeURIComponent(
      `Halo ${memberName}! 👋\n\n` +
      `Ini reminder dari *${poolName}*:\n` +
      `📍 Periode: ${round}\n` +
      `💰 Iuran: ${amount}\n\n` +
      `Mohon segera lakukan pembayaran ya. Terima kasih! 🙏\n\n` +
      `- Admin via ArisanAman`
    );
    
    const cleanPhone = profile.whatsapp.replace(/^0/, "62");
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
    toast.success("WhatsApp...");
  };
  
  const isActionLoading = (actionName: string) => loadingActions.has(actionName);
  const isAnyActionLoading = (prefix: string) => Array.from(loadingActions).some(a => a.startsWith(prefix));
  const setActionLoading = (actionName: string, loading: boolean) => {
    setLoadingActions(prev => {
      const next = new Set(prev);
      if (loading) next.add(actionName);
      else next.delete(actionName);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!pool || pool.error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("notFound")}</p>
      </div>
    );
  }

  const activeMembers = (pool.members || []).filter((m: any) => m.status === "Active");
  const approvedMembers = (pool.members || []).filter((m: any) => m.status === "Approved");
  const pendingMembers = pool.pendingMembers || [];
  const allMembers = [...activeMembers, ...approvedMembers];

  const isAdmin = pool.isAdmin;
  const userMember = pool.userMember;
  const isMember = !!userMember;
  const isPending = pendingMembers.some((m: any) => m.address.toLowerCase() === userAddress);
  
  const canActivate = isAdmin && 
    pool.status === "Pending" && 
    activeMembers.length >= 3 &&
    pool.rotationOrder?.length === activeMembers.length;

  const needsRotationOrder = isAdmin && 
    pool.status === "Pending" && 
    activeMembers.length >= 3 &&
    pool.rotationOrder?.length !== activeMembers.length;

  const isCurrentWinner = pool.currentWinner && pool.currentWinner.toLowerCase() === userAddress;
  const hasContributed = userMember?.hasContributed;
  const canContribute = pool.status === "Active" && userMember?.status === "Active" && !hasContributed;

  const allContributed = activeMembers.length > 0 && activeMembers.every((m: any) => m.hasContributed);
  const canDetermineWinner = isAdmin && pool.status === "Active" && allContributed && !pool.currentWinner;
  const canClaimPayout = isCurrentWinner && userMember && !userMember.hasClaimedPayout;

  const userLiquidBalance = Number(userMember?.liquidBalance || 0);
  const userLockedStake = Number(userMember?.lockedStake || 0);
  const canWithdrawLiquid = userLiquidBalance > 0;
  const canWithdrawDeposit = pool.status === "Completed" && userLockedStake > 0;

  const canJoin = !isMember && !isPending && pool.status === "Pending" && activeMembers.length < pool.maxMembers;

  const hasEnoughForDeposit = userBalance >= BigInt(pool.securityDeposit || 0);
  const hasEnoughForContribution = userBalance >= BigInt(pool.contributionAmount || 0);

  const handleAction = async (action: () => Promise<any>, actionName: string, successMsg?: string) => {
    if (!walletAddress) {
      toast.error(tc("error"));
      return;
    }

    setActionLoading(actionName, true);
    try {
      await action();
      refetch();
      if (successMsg) toast.success(successMsg);
    } catch (error: any) {
      console.error(`${actionName} failed:`, error);
      toast.error(tc("error"), { description: error.message });
    } finally {
      setActionLoading(actionName, false);
    }
  };

  const handleApprove = (memberAddress: string) => {
    handleAction(() => approveMember.mutateAsync({ memberAddress }), `approve-${memberAddress}`, tc("success"));
  };

  const handleReject = (memberAddress: string) => {
    handleAction(() => rejectMember.mutateAsync({ memberAddress }), `reject-${memberAddress}`, tc("success"));
  };

  const handleLockDeposit = () => {
    if (!hasEnoughForDeposit) {
      toast.error(tm("depositConfirm.insufficient", { amount: formatIDR(Number(pool.securityDeposit) - Number(userBalance)) }));
      return;
    }
    setShowDepositModal(false);
    handleAction(() => lockDeposit.mutateAsync({ depositAmount: BigInt(pool.securityDeposit) }), "lockDeposit", tc("success"));
  };

  const handleActivate = () => {
    handleAction(() => activatePool.mutateAsync(), "activate", tc("success"));
  };

  const handleSetRotation = () => {
    const order = activeMembers.map((m: any) => m.address);
    setShowRotationModal(false);
    handleAction(() => setRotation.mutateAsync({ order }), "setRotation", tc("success"));
  };

  const handleDetermineWinner = () => {
    handleAction(() => determineWinner.mutateAsync(), "determineWinner", tc("success"));
  };

  const handleClaimPayout = () => {
    handleAction(() => claimPayout.mutateAsync(), "claimPayout", tc("success"));
  };

  const handleContribute = () => {
    if (!hasEnoughForContribution) {
      toast.error(tm("contributeConfirm.amount"));
      return;
    }
    setShowContributeModal(false);
    handleAction(() => contribute.mutateAsync({ contributionAmount: BigInt(pool.contributionAmount) }), "contribute", tc("success"));
  };

  const handleWithdrawLiquid = () => {
    handleAction(() => withdrawLiquid.mutateAsync(), "withdrawLiquid", tc("success"));
  };

  const handleWithdrawDeposit = () => {
    handleAction(() => withdrawDeposit.mutateAsync(), "withdrawDeposit", tc("success"));
  };

  const handleRequestJoin = () => {
    handleAction(() => requestJoin.mutateAsync(), "requestJoin", tc("success"));
  };

  const handleVouch = () => {
    if (!vouchTarget || !vouchAmount) return;
    
    // Check if user already vouched for this member
    const member = pendingMembers.find((m: any) => 
      m.address.toLowerCase() === vouchTarget.address.toLowerCase()
    );
    const existingVouches = member?.vouches || [];
    const alreadyVouched = existingVouches.some((v: any) => 
      v.voucher.toLowerCase() === userAddress
    );
    
    if (alreadyVouched) {
      toast.error(t("alreadyVouched"));
      setShowVouchModal(false);
      setVouchTarget(null);
      setVouchAmount("");
      return;
    }
    
    const amount = BigInt(parseFloat(vouchAmount) || 0);
    if (amount <= 0 || amount > userBalance) {
      toast.error(tc("error"));
      return;
    }
    setShowVouchModal(false);
    handleAction(() => vouch.mutateAsync({ voucheeAddress: vouchTarget.address, amount }), `vouch-${vouchTarget.address}`, tc("success"));
    setVouchTarget(null);
    setVouchAmount("");
  };

  const handleReportDefault = () => {
    if (!defaultTarget) return;
    setShowReportDefaultModal(false);
    handleAction(() => reportDefault.mutateAsync({ memberAddress: defaultTarget.address }), `reportDefault-${defaultTarget.address}`, tc("success"));
    setDefaultTarget(null);
  };

  const openReportDefaultModal = (member: { address: string }) => {
    setDefaultTarget({ address: member.address, name: getDisplayName(member.address) });
    setShowReportDefaultModal(true);
  };

  const openVouchModal = (member: { address: string }) => {
    setVouchTarget({ address: member.address, name: getDisplayName(member.address) });
    setVouchAmount(String(pool.contributionAmount));
    setShowVouchModal(true);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/circle/${poolId}`;
    navigator.clipboard.writeText(link);
    toast.success(t("linkCopied"), { description: t("shareLink") });
  };

  const totalPot = Number(pool.contributionAmount) * activeMembers.length;
  const annualYieldRate = 0.05;
  const monthlyYieldRate = annualYieldRate / 12;
  const estimatedMonthlyYield = Math.floor(totalPot * monthlyYieldRate);
  const totalPoolDuration = pool.maxMembers;
  const estimatedTotalYield = Math.floor(totalPot * monthlyYieldRate * totalPoolDuration * 0.5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold font-display">{pool.poolName || pool.name || `Arisan #${pool.id}`}</h1>
            <Badge variant={pool.status === "Active" ? "success" : pool.status === "Pending" ? "warning" : pool.status === "Completed" ? "secondary" : "destructive"}>
              {pool.status === "Active" ? tc("active") : pool.status === "Pending" ? tc("pending") : pool.status === "Completed" ? tc("completed") : pool.status}
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <p className="text-muted-foreground">
            {tc("period")} {pool.currentRound}/{pool.totalRounds} • {activeMembers.length} {t("activeMembers")}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {isAdmin && pool.status === "Pending" && (
            <Button variant="outline" onClick={handleCopyLink}>
              <Copy className="mr-2 h-4 w-4" />
              {t("copyLink")}
            </Button>
          )}
          {canJoin && (
            <Button onClick={handleRequestJoin} disabled={isActionLoading("requestJoin")}>
              {isActionLoading("requestJoin") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              {t("requestJoin")}
            </Button>
          )}
          {isPending && (
            <Badge variant="warning" className="h-9 px-4">
              <Clock className="mr-2 h-4 w-4" />
              {t("waitingApproval")}
            </Badge>
          )}
          {canContribute && (
            <Button onClick={() => setShowContributeModal(true)} disabled={isActionLoading("contribute")}>
              {isActionLoading("contribute") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
              {t("payContribution")}
            </Button>
          )}
          {canClaimPayout && (
            <Button onClick={handleClaimPayout} disabled={isActionLoading("claimPayout")}>
              {isActionLoading("claimPayout") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trophy className="mr-2 h-4 w-4" />}
              {t("claimPayout")}
            </Button>
          )}
          {userMember?.status === "Approved" && (
            <Button onClick={() => setShowDepositModal(true)} disabled={isActionLoading("lockDeposit")}>
              {isActionLoading("lockDeposit") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
              {t("payDeposit")}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showDepositModal} onOpenChange={setShowDepositModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tm("depositConfirm.title")}</DialogTitle>
            <DialogDescription>{tm("depositConfirm.desc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{tm("depositConfirm.amount")}</span>
                <span className="font-bold text-lg">{formatIDR(Number(pool.securityDeposit))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{tm("depositConfirm.yourBalance")}</span>
                <span className={`font-medium ${hasEnoughForDeposit ? "text-success" : "text-destructive"}`}>
                  {formatIDRX(Number(userBalance))} IDRX
                </span>
              </div>
            </div>
            {!hasEnoughForDeposit && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {tm("depositConfirm.insufficient", { amount: formatIDR(Number(pool.securityDeposit) - Number(userBalance)) })}
              </div>
            )}
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm">
              <p className="text-muted-foreground">{tm("depositConfirm.note")}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDepositModal(false)}>{tc("cancel")}</Button>
            <Button onClick={handleLockDeposit} disabled={isActionLoading("lockDeposit") || !hasEnoughForDeposit}>
              {isActionLoading("lockDeposit") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              {tm("depositConfirm.payNow")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showContributeModal} onOpenChange={setShowContributeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tm("contributeConfirm.title")}</DialogTitle>
            <DialogDescription>{tm("contributeConfirm.desc", { period: pool.currentRound })}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{tm("contributeConfirm.amount")}</span>
                <span className="font-bold text-lg">{formatIDR(Number(pool.contributionAmount))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{tm("depositConfirm.yourBalance")}</span>
                <span className={`font-medium ${hasEnoughForContribution ? "text-success" : "text-destructive"}`}>
                  {formatIDRX(Number(userBalance))} IDRX
                </span>
              </div>
              </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContributeModal(false)}>{tc("cancel")}</Button>
            <Button onClick={handleContribute} disabled={isActionLoading("contribute") || !hasEnoughForContribution}>
              {isActionLoading("contribute") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              {tm("contributeConfirm.payNow")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRotationModal} onOpenChange={setShowRotationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tm("rotationOrder.title")}</DialogTitle>
            <DialogDescription>{tm("rotationOrder.desc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">{tm("rotationOrder.activeMembers", { count: activeMembers.length })}</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activeMembers.map((member: any, index: number) => (
                  <div key={member.address} className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">{index + 1}</span>
                    <span className="font-mono text-sm">{getDisplayName(member.address)}</span>
                    {member.isAdmin && <Badge variant="secondary" className="text-xs">Admin</Badge>}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm space-y-2">
              <p className="font-medium text-blue-500">ℹ️ {tm("rotationOrder.howItWorks")}</p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>{tm("rotationOrder.step1")}</li>
                <li>{tm("rotationOrder.step2")}</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRotationModal(false)}>{tc("cancel")}</Button>
            <Button onClick={handleSetRotation} disabled={isActionLoading("setRotation")}>
              {isActionLoading("setRotation") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shuffle className="mr-2 h-4 w-4" />}
              {tm("rotationOrder.confirmOrder")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showVouchModal} onOpenChange={setShowVouchModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tm("vouch.title")}</DialogTitle>
            <DialogDescription>{tm("vouch.desc", { name: vouchTarget?.name || "" })}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{tm("vouch.amount")}</Label>
              <Input type="number" value={vouchAmount} onChange={(e) => setVouchAmount(e.target.value)} placeholder={tm("vouch.placeholder")} min={pool.contributionAmount} />
              <p className="text-xs text-muted-foreground">{tm("vouch.minimum", { amount: formatIDR(Number(pool.contributionAmount)) })}</p>
            </div>
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-sm">
              <p className="text-muted-foreground">{tm("vouch.warning", { name: vouchTarget?.name || "" })}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVouchModal(false)}>{tc("cancel")}</Button>
            <Button onClick={handleVouch} disabled={(vouchTarget && isActionLoading(`vouch-${vouchTarget.address}`)) || !vouchAmount || parseFloat(vouchAmount) < Number(pool.contributionAmount) || parseFloat(vouchAmount) > Number(userBalance)}>
              {vouchTarget && isActionLoading(`vouch-${vouchTarget.address}`) ? (
                <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("vouching")}
                </>
              ) : (
                <>
                <HandshakeIcon className="mr-2 h-4 w-4" />
                  {tm("vouch.vouchNow")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReportDefaultModal} onOpenChange={setShowReportDefaultModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">{tm("reportDefault.title")}</DialogTitle>
            <DialogDescription>{tm("reportDefault.desc", { name: defaultTarget?.name || "" })}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm space-y-2">
              <p className="font-medium text-destructive">⚠️ {tm("reportDefault.consequences")}</p>
              <ul className="text-muted-foreground list-disc list-inside space-y-1">
                <li>{tm("reportDefault.consequence1")}</li>
                <li>{tm("reportDefault.consequence2")}</li>
                <li>{tm("reportDefault.consequence3")}</li>
                <li>{tm("reportDefault.consequence4")}</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDefaultModal(false)}>{tc("cancel")}</Button>
            <Button variant="destructive" onClick={handleReportDefault} disabled={!!defaultTarget && isActionLoading(`reportDefault-${defaultTarget.address}`)}>
              {defaultTarget && isActionLoading(`reportDefault-${defaultTarget.address}`) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertTriangle className="mr-2 h-4 w-4" />}
              {tm("reportDefault.reportNow")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: pool.rotationPeriod === "Weekly" ? t("stats.contributionWeek") : t("stats.contributionMonth"), value: formatIDR(Number(pool.contributionAmount)), icon: Wallet },
          { label: t("stats.securityDeposit"), value: formatIDR(Number(pool.securityDeposit)), icon: Shield },
          { label: t("stats.totalPot"), value: formatIDR(totalPot), icon: Trophy },
          { label: t("stats.members"), value: `${activeMembers.length}/${pool.maxMembers}`, icon: Users },
        ].map((stat, index) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-lg font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {pool.status === "Active" && (
        <Card className="border-green-500/30 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">{t("yield.title")}</p>
                  <p className="text-sm text-muted-foreground">{t("yield.desc")}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{pool.rotationPeriod === "Weekly" ? t("yield.perWeek") : t("yield.perMonth")}</p>
                <p className="text-xl font-bold text-green-500">+{formatIDR(estimatedMonthlyYield)}</p>
                <p className="text-xs text-muted-foreground">{t("yield.total")}: +{formatIDR(estimatedTotalYield)} ({totalPoolDuration} {pool.rotationPeriod === "Weekly" ? tc("week") : tc("month")})</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {userMember && (canWithdrawLiquid || canWithdrawDeposit) && (
        <Card className="border-success/50 bg-success/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-success" />
                <div>
                  <p className="font-medium">{t("funds.title")}</p>
                  <p className="text-sm text-muted-foreground">{t("funds.balance")}: {formatIDR(userLiquidBalance)} • {t("funds.deposit")}: {formatIDR(userLockedStake)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {canWithdrawLiquid && (
                  <Button variant="outline" onClick={handleWithdrawLiquid} disabled={isActionLoading("withdrawLiquid")}>
                    {isActionLoading("withdrawLiquid") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowDownToLine className="mr-2 h-4 w-4" />}
                    {t("funds.withdrawBalance")}
                  </Button>
                )}
                {canWithdrawDeposit && (
                  <Button onClick={handleWithdrawDeposit} disabled={isActionLoading("withdrawDeposit")}>
                    {isActionLoading("withdrawDeposit") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlock className="mr-2 h-4 w-4" />}
                    {t("funds.withdrawDeposit")}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isAdmin && pool.status === "Pending" && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium">{t("admin.actions")}</p>
                  <p className="text-sm text-muted-foreground">
                    {needsRotationOrder ? t("admin.setRotationFirst") : canActivate ? t("admin.readyActivate") : t("admin.needMembers", { count: activeMembers.length })}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {needsRotationOrder && (
                  <Button variant="outline" onClick={() => setShowRotationModal(true)} disabled={isActionLoading("setRotation")}>
                    {isActionLoading("setRotation") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shuffle className="mr-2 h-4 w-4" />}
                    {t("admin.setRotation")}
                  </Button>
                )}
                {canActivate && (
                  <Button onClick={handleActivate} disabled={isActionLoading("activate")}>
                    {isActionLoading("activate") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                    {t("admin.activatePool")}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isAdmin && pool.status === "Active" && canDetermineWinner && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Shuffle className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">{t("admin.allContributed")}</p>
                  <p className="text-sm text-muted-foreground">{t("admin.determineWinner")}</p>
                </div>
              </div>
              <Button onClick={handleDetermineWinner} disabled={isActionLoading("determineWinner")}>
                {isActionLoading("determineWinner") ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shuffle className="mr-2 h-4 w-4" />}
                {t("admin.shuffle")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("memberList")}</CardTitle>
              <CardDescription>{t("memberListDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {allMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">{t("noMembers")}</div>
              ) : (
                <div className="space-y-3">
                  {allMembers.map((member: any, index: number) => (
                    <motion.div key={member.address} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="flex items-center gap-4 p-3 rounded-lg border">
                      <Avatar>
                        <AvatarFallback>{member.address.slice(2, 4).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate text-sm">{getDisplayName(member.address)}</p>
                          {member.isAdmin && <Badge variant="secondary" className="shrink-0"><Crown className="h-3 w-3 mr-1" />Admin</Badge>}
                          {member.address.toLowerCase() === userAddress && <Badge variant="outline" className="shrink-0">{t("you")}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">{formatAddress(member.address)}{member.status === "Active" && ` • ${formatIDR(Number(member.lockedStake))}`}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.status === "Active" ? (
                          pool.status === "Active" ? (
                            member.hasContributed ? (
                              <Badge variant="success"><Check className="h-3 w-3 mr-1" />{t("contributed")}</Badge>
                            ) : (
                              <>
                                <Badge variant="warning"><Clock className="h-3 w-3 mr-1" />{t("notContributed")}</Badge>
                                {isAdmin && member.address.toLowerCase() !== userAddress && (
                                  <>
                                    <Button size="sm" variant="outline" onClick={() => sendWhatsAppReminder(member.address)}><MessageCircle className="h-3 w-3" /></Button>
                                    <Button size="sm" variant="destructive" onClick={() => openReportDefaultModal(member)} disabled={isActionLoading(`reportDefault-${member.address}`)}>
                                      {isActionLoading(`reportDefault-${member.address}`) ? <Loader2 className="h-3 w-3 animate-spin" /> : <AlertTriangle className="h-3 w-3" />}
                                    </Button>
                                  </>
                                )}
                              </>
                            )
                          ) : <Badge variant="success">{tc("active")}</Badge>
                        ) : <Badge variant="secondary">{t("waitingDeposit")}</Badge>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {pendingMembers.length > 0 && (isAdmin || userMember?.status === "Active") && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{isAdmin ? t("pendingApproval") : t("pendingMembers")}<Badge variant="warning" className="ml-2">{pendingMembers.length}</Badge></CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowPending(!showPending)}>{showPending ? "-" : "+"}</Button>
                </div>
              </CardHeader>
              {showPending && (
                <CardContent className="space-y-3">
                  {pendingMembers.map((member: any) => (
                    <div key={member.address} className="p-3 rounded-lg border space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{member.address.slice(2, 4).toUpperCase()}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm truncate font-mono">{getDisplayName(member.address)}</p>
                            <MemberDebtBadge address={member.address} />
                          </div>
                          {member.vouches?.length > 0 ? <p className="text-xs text-success">{t("vouched", { count: member.vouches.length })}</p> : pool.vouchRequired ? <p className="text-xs text-warning">{t("noVouch")}</p> : null}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {pool.vouchRequired ? (
                          <>
                            {userMember?.status === "Active" && (() => {
                              const alreadyVouched = member.vouches?.some((v: any) => v.voucher.toLowerCase() === userAddress);
                              const canVouch = !hasDebtNFT && !alreadyVouched;
                              
                              if (!canVouch) {
                                return (
                                  <div className="flex-1">
                                    <Button size="sm" variant="outline" className="w-full" disabled>
                                      <HandshakeIcon className="mr-1 h-3 w-3" />
                                      {t("vouch")}
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {hasDebtNFT ? t("cannotVouchDebtNFT") : alreadyVouched ? t("alreadyVouched") : t("cannotVouchEligibility")}
                                    </p>
                                  </div>
                                );
                              }
                              
                              return (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex-1"
                                onClick={() => openVouchModal(member)}
                                disabled={isAnyActionLoading("vouch-")}
                              >
                                  {isAnyActionLoading("vouch-") ? (
                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                  ) : (
                                <HandshakeIcon className="mr-1 h-3 w-3" />
                            )}
                                  {t("vouch")}
                                </Button>
                              );
                            })()}
                            {isAdmin && member.vouches && member.vouches.length > 0 && (
                              <>
                                <Button size="sm" className="flex-1" onClick={() => handleApprove(member.address)} disabled={isActionLoading(`approve-${member.address}`) || isActionLoading(`reject-${member.address}`)}>
                                  {isActionLoading(`approve-${member.address}`) ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="mr-1 h-3 w-3" />{t("approve")}</>}
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleReject(member.address)} disabled={isActionLoading(`approve-${member.address}`) || isActionLoading(`reject-${member.address}`)}><X className="h-3 w-3" /></Button>
                              </>
                            )}
                          </>
                        ) : isAdmin && (
                            <>
                            <Button size="sm" className="flex-1" onClick={() => handleApprove(member.address)} disabled={isActionLoading(`approve-${member.address}`) || isActionLoading(`reject-${member.address}`)}>
                              {isActionLoading(`approve-${member.address}`) ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="mr-1 h-3 w-3" />{t("approve")}</>}
                              </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(member.address)} disabled={isActionLoading(`approve-${member.address}`) || isActionLoading(`reject-${member.address}`)}><X className="h-3 w-3" /></Button>
                            </>
                        )}
                      </div>
                      {isAdmin && pool.vouchRequired && (!member.vouches || member.vouches.length === 0) && <p className="text-xs text-warning">{t("needVouch")}</p>}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          )}

          {pool.status === "Active" && (
            <Card>
              <CardHeader><CardTitle className="text-base">{t("currentPeriod")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">{pool.currentWinner ? t("winner") + " " + pool.currentRound : t("status")}</p>
                  <p className="text-lg font-bold">{pool.currentWinner ? getDisplayName(pool.currentWinner) : allContributed ? t("readyShuffle") : t("waitingContributions")}</p>
                  {pool.currentPayout && Number(pool.currentPayout) > 0 && <p className="text-2xl font-bold text-primary mt-2">{formatIDR(Number(pool.currentPayout))}</p>}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("paidCount")}</span><span className="font-medium">{activeMembers.filter((m: any) => m.hasContributed).length}/{activeMembers.length}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("paymentDate")}</span><span className="font-medium">{t("everyDate")} {pool.paymentDay}</span></div>
                </div>
              </CardContent>
            </Card>
          )}

          {pool.roundHistory && pool.roundHistory.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4" />{t("winnerHistory")}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {pool.roundHistory.map((round: any) => (
                  <div key={round.round} className="flex items-center justify-between p-3 rounded-lg border">
                    <div><p className="font-medium text-sm">{tc("period")} {round.round}</p><p className="text-xs font-mono text-muted-foreground">{getDisplayName(round.winner)}</p></div>
                    <div className="text-right"><p className="font-bold text-primary">{formatIDR(Number(round.payout))}</p>{round.completed && <Badge variant="success" className="text-xs"><Check className="h-2 w-2 mr-1" />{tc("completed")}</Badge>}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-warning/20 flex items-center justify-center shrink-0"><HandshakeIcon className="h-4 w-4 text-warning" /></div>
                <div><p className="font-medium text-sm mb-1">{t("socialVouch")}</p><p className="text-xs text-muted-foreground">{pool.vouchRequired ? t("vouchRequired") : t("vouchOptional")}</p></div>
              </div>
            </CardContent>
          </Card>

          {isAdmin && pool.status === "Pending" && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0"><ExternalLink className="h-4 w-4 text-primary" /></div>
                  <div><p className="font-medium text-sm mb-1">{t("shareInvite")}</p><p className="text-xs text-muted-foreground mb-2">{t("inviteOthers")}</p><Button size="sm" variant="outline" onClick={handleCopyLink}><Copy className="mr-2 h-3 w-3" />{t("copyLink")}</Button></div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
