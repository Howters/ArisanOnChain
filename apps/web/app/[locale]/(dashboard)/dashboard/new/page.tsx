"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ArrowLeft,
  Users,
  Coins,
  Shield,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  HandshakeIcon,
  HelpCircle,
  Calendar,
  Tag
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { formatIDR } from "@/lib/utils";
import { useCreatePool } from "@/lib/hooks/use-contracts";
import { useWalletAddress } from "@/lib/hooks/use-wallet-address";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

const PRESET_AMOUNTS = [100000, 200000, 500000, 1000000];
const PRESET_MEMBERS = [5, 8, 10, 12];

export default function CreateCirclePage() {
  const t = useTranslations("create");
  const tc = useTranslations("common");
  const router = useRouter();
  const walletAddress = useWalletAddress();
  const createPool = useCreatePool();
  const queryClient = useQueryClient();

  const DEPOSIT_MULTIPLIERS = [
    { value: 1, label: "1x", desc: t("step3.multipliers.1x") },
    { value: 1.5, label: "1.5x", desc: t("step3.multipliers.1,5x") },
    { value: 2, label: "2x", desc: t("step3.multipliers.2x") },
    { value: 3, label: "3x", desc: t("step3.multipliers.3x") },
  ];

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    category: "padukuhan",
    contributionAmount: 500000,
    depositMultiplier: 2,
    maxMembers: 10,
    paymentDay: 1,
    rotationPeriod: "monthly",
    vouchRequired: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const securityDeposit = Math.floor(formData.contributionAmount * formData.depositMultiplier);

  const validateMaxMembers = (value: number) => {
    if (value < 3) return 3;
    if (value > 50) return 50;
    return value;
  };

  const validatePaymentDay = (value: number) => {
    if (formData.rotationPeriod === "weekly") {
      if (value < 0) return 0;
      if (value > 6) return 6;
      return value;
    } else {
      if (value < 1) return 1;
      if (value > 28) return 28;
      return value;
    }
  };

  const handleSubmit = async () => {
    if (!walletAddress) {
      toast.error(tc("error"));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createPool.mutateAsync({
        contributionAmount: BigInt(formData.contributionAmount),
        securityDeposit: BigInt(securityDeposit),
        maxMembers: formData.maxMembers,
        paymentDay: formData.paymentDay,
        vouchRequired: formData.vouchRequired,
        rotationPeriod: formData.rotationPeriod === "weekly" ? 0 : 1,
        poolName: formData.name || "Arisan Pool",
        category: formData.category,
      });
      
      toast.success(t("success"), {
        description: t("successDesc", { name: formData.name || "Arisan" }),
      });
      
      queryClient.invalidateQueries({ queryKey: ["pools"] });
      
      if (result?.poolId) {
        router.push(`/circle/${result.poolId}`);
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Failed to create pool:", error);
      toast.error(t("failed"), {
        description: t("failedDesc"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPayout = formData.contributionAmount * formData.maxMembers;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{t("step1.title")}</CardTitle>
                  <CardDescription>{t("step1.desc")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">{t("step1.name")}</Label>
                <Input
                  id="name"
                  placeholder={t("step1.namePlaceholder")}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="category" className="flex items-center gap-1">
                    {t("step1.category")}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>{t("tooltips.category")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                </div>
                <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="padukuhan">{t("step1.categories.padukuhan")}</SelectItem>
                    <SelectItem value="ibu">{t("step1.categories.ibu")}</SelectItem>
                    <SelectItem value="satpam">{t("step1.categories.satpam")}</SelectItem>
                    <SelectItem value="olahraga">{t("step1.categories.olahraga")}</SelectItem>
                    <SelectItem value="kantor">{t("step1.categories.kantor")}</SelectItem>
                    <SelectItem value="lainnya">{t("step1.categories.lainnya")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Label className="flex items-center gap-1">
                    {t("step1.rotationPeriod")}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>{t("tooltips.rotation")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                </div>
                <RadioGroup value={formData.rotationPeriod} onValueChange={(v) => setFormData({...formData, rotationPeriod: v})}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                      <div className="font-medium">{t("step1.monthly")}</div>
                      <div className="text-xs text-muted-foreground">{t("step1.monthlyDesc")}</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly" className="flex-1 cursor-pointer">
                      <div className="font-medium">{t("step1.weekly")}</div>
                      <div className="text-xs text-muted-foreground">{t("step1.weeklyDesc")}</div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>{t("step1.maxMembers")}</Label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_MEMBERS.map((count) => (
                    <Button
                      key={count}
                      variant={formData.maxMembers === count ? "default" : "outline"}
                      className="h-12"
                      onClick={() => setFormData({ ...formData, maxMembers: count })}
                    >
                      {count} {t("step1.people")}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={3}
                    max={50}
                    value={formData.maxMembers}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      maxMembers: validateMaxMembers(parseInt(e.target.value) || 3) 
                    })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">{t("step1.people")} {t("step1.minMax")}</span>
                </div>
                {(formData.maxMembers < 3 || formData.maxMembers > 50) && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {t("step1.memberError")}
                  </p>
                )}
              </div>

              <Button 
                className="w-full" 
                onClick={() => setStep(2)}
                disabled={!formData.name.trim() || formData.maxMembers < 3 || formData.maxMembers > 50}
              >
                {tc("continue")}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Coins className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{t("step2.title")}</CardTitle>
                  <CardDescription>{t("step2.desc")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-1">
                  {t("step2.selectAmount")}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{t("tooltips.contribution")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      variant={formData.contributionAmount === amount ? "default" : "outline"}
                      className="h-14 flex-col"
                      onClick={() => setFormData({ ...formData, contributionAmount: amount })}
                    >
                      <span className="font-bold">{formatIDR(amount)}</span>
                      <span className="text-xs opacity-70">{tc("perMonth")}</span>
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t("step2.orEnter")}</span>
                  <Input
                    type="number"
                    min={50000}
                    step={50000}
                    value={formData.contributionAmount}
                    onChange={(e) => setFormData({ ...formData, contributionAmount: Math.max(50000, parseInt(e.target.value) || 100000) })}
                    className="w-40"
                  />
                  <span className="text-sm text-muted-foreground">IDRX</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>{t("step2.paymentDate")}</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t("step2.everyDate")}</span>
                  <Input
                    type="number"
                    min={1}
                    max={28}
                    value={formData.paymentDay}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      paymentDay: validatePaymentDay(parseInt(e.target.value) || 1) 
                    })}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">{t("step2.everyMonth")}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("step2.maxDateNote")}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("step2.totalPayout")}</span>
                  <span className="font-medium">{formatIDR(totalPayout)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("step2.duration")}</span>
                  <span className="font-medium">{formData.maxMembers} {tc("month")}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  {tc("back")}
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  {tc("continue")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{t("step3.title")}</CardTitle>
                  <CardDescription>{t("step3.desc")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-1">
                  {t("step3.depositMultiplier")}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{t("tooltips.deposit")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {DEPOSIT_MULTIPLIERS.map((m) => (
                    <Button
                      key={m.value}
                      variant={formData.depositMultiplier === m.value ? "default" : "outline"}
                      className="h-16 flex-col"
                      onClick={() => setFormData({ ...formData, depositMultiplier: m.value })}
                    >
                      <span className="font-bold">{m.label}</span>
                      <span className="text-xs opacity-70">{m.desc}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("step3.depositAmount")}: <span className="font-medium">{formatIDR(securityDeposit)}</span>
                </p>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-1">
                  {t("step3.vouchRequired")}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>{t("tooltips.vouch")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={!formData.vouchRequired ? "default" : "outline"}
                    className="h-14 flex-col"
                    onClick={() => setFormData({ ...formData, vouchRequired: false })}
                  >
                    <span className="font-bold">{t("step3.vouchNo")}</span>
                    <span className="text-xs opacity-70">{t("step3.vouchNoDesc")}</span>
                  </Button>
                  <Button
                    variant={formData.vouchRequired ? "default" : "outline"}
                    className="h-14 flex-col"
                    onClick={() => setFormData({ ...formData, vouchRequired: true })}
                  >
                    <span className="font-bold">{t("step3.vouchYes")}</span>
                    <span className="text-xs opacity-70">{t("step3.vouchYesDesc")}</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex gap-3">
                    <Shield className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-500 mb-2">{t("step3.depositInfo.title")}</p>
                      <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                        <li>{t("step3.depositInfo.item1")}</li>
                        <li>{t("step3.depositInfo.item2")}</li>
                        <li>{t("step3.depositInfo.item3")}</li>
                        <li>{t("step3.depositInfo.item4")}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex gap-3">
                    <HandshakeIcon className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-purple-500 mb-2">{t("step3.vouchInfo.title")}</p>
                      <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                        <li>{t("step3.vouchInfo.item1")}</li>
                        <li>{t("step3.vouchInfo.item2")}</li>
                        <li>{t("step3.vouchInfo.item3")}</li>
                        <li>{t("step3.vouchInfo.item4")}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  {tc("back")}
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1">
                  {tc("continue")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {step === 4 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>{t("step4.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">{t("step4.name")}</p>
                  <p className="font-medium">{formData.name || "-"}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">{t("step1.category")}</p>
                  <p className="font-medium">{t(`step1.categories.${formData.category}`)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">{t("step4.members")}</p>
                  <p className="font-medium">{formData.maxMembers} {t("step1.people")}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">{t("step1.rotationPeriod")}</p>
                  <p className="font-medium">{t(`step1.${formData.rotationPeriod}`)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">{t("step4.contribution")}</p>
                  <p className="font-medium">{formatIDR(formData.contributionAmount)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">{t("step4.payout")}</p>
                  <p className="font-medium">{formatIDR(totalPayout)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">{t("step4.deposit")}</p>
                  <p className="font-medium">{formatIDR(securityDeposit)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">{t("step4.paymentDate")}</p>
                  <p className="font-medium">{t("step2.everyDate")} {formData.paymentDay}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">{t("step4.vouchRequired")}</p>
                  <p className="font-medium">{formData.vouchRequired ? t("step4.vouchYes") : t("step4.vouchNo")}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("step4.totalPrepare")}</p>
                    <p className="text-xl font-bold">
                      {formatIDR(formData.contributionAmount + securityDeposit)}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {t("step4.contributionDeposit")}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  {tc("back")}
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  className="flex-1"
                  disabled={isSubmitting || !walletAddress}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("step4.creating")}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      {t("step4.createArisan")}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
