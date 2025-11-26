"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Users,
  Coins,
  Shield,
  Calendar,
  CheckCircle2,
  Loader2,
  Info
} from "lucide-react";
import Link from "next/link";
import { formatIDR } from "@/lib/utils";
import { useCreatePool } from "@/lib/hooks/use-contracts";

const PRESET_AMOUNTS = [100000, 200000, 500000, 1000000];
const PRESET_MEMBERS = [5, 8, 10, 12];

export default function CreateCirclePage() {
  const router = useRouter();
  const { user } = usePrivy();
  const createPool = useCreatePool();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    contributionAmount: 500000,
    securityDeposit: 100000,
    maxMembers: 10,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user?.wallet?.address) return;

    setIsSubmitting(true);
    try {
      await createPool.mutateAsync({
        contributionAmount: BigInt(formData.contributionAmount),
        securityDeposit: BigInt(formData.securityDeposit),
        maxMembers: formData.maxMembers,
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to create pool:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPayout = formData.contributionAmount * formData.maxMembers;
  const totalSecurityNeeded = formData.securityDeposit;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Buat Arisan Baru</h1>
          <p className="text-muted-foreground">
            Atur detail arisan dan undang anggota
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
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
                  <CardTitle>Detail Arisan</CardTitle>
                  <CardDescription>Nama dan jumlah anggota</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Arisan</Label>
                <Input
                  id="name"
                  placeholder="contoh: Arisan Keluarga Besar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <Label>Jumlah Anggota Maksimal</Label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_MEMBERS.map((count) => (
                    <Button
                      key={count}
                      variant={formData.maxMembers === count ? "default" : "outline"}
                      className="h-12"
                      onClick={() => setFormData({ ...formData, maxMembers: count })}
                    >
                      {count} orang
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={3}
                    max={20}
                    value={formData.maxMembers}
                    onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) || 3 })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">orang (min. 3, maks. 20)</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => setStep(2)}
                disabled={!formData.name.trim()}
              >
                Lanjutkan
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
                  <CardTitle>Iuran Bulanan</CardTitle>
                  <CardDescription>Jumlah yang dibayarkan setiap periode</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Pilih Nominal Iuran</Label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_AMOUNTS.map((amount) => (
                    <Button
                      key={amount}
                      variant={formData.contributionAmount === amount ? "default" : "outline"}
                      className="h-14 flex-col"
                      onClick={() => setFormData({ ...formData, contributionAmount: amount })}
                    >
                      <span className="font-bold">{formatIDR(amount)}</span>
                      <span className="text-xs opacity-70">/bulan</span>
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Atau masukkan nominal:</span>
                  <Input
                    type="number"
                    min={50000}
                    step={50000}
                    value={formData.contributionAmount}
                    onChange={(e) => setFormData({ ...formData, contributionAmount: parseInt(e.target.value) || 100000 })}
                    className="w-40"
                  />
                  <span className="text-sm text-muted-foreground">IDRX</span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Payout per Giliran</span>
                  <span className="font-medium">{formatIDR(totalPayout)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Durasi Arisan</span>
                  <span className="font-medium">{formData.maxMembers} bulan</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Kembali
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Lanjutkan
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
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Uang Jaminan</CardTitle>
                  <CardDescription>Deposit keamanan untuk mencegah default</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Nominal Jaminan</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[50000, 100000, 200000].map((amount) => (
                    <Button
                      key={amount}
                      variant={formData.securityDeposit === amount ? "default" : "outline"}
                      className="h-12"
                      onClick={() => setFormData({ ...formData, securityDeposit: amount })}
                    >
                      {formatIDR(amount)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 flex gap-3">
                <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-500 mb-1">Tentang Uang Jaminan</p>
                  <p className="text-muted-foreground">
                    Uang jaminan akan dikembalikan setelah arisan selesai. 
                    Jika ada anggota yang gagal bayar, jaminan akan digunakan untuk menutupi kekurangan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Arisan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Nama</p>
                  <p className="font-medium">{formData.name || "-"}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Anggota</p>
                  <p className="font-medium">{formData.maxMembers} orang</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Iuran/Bulan</p>
                  <p className="font-medium">{formatIDR(formData.contributionAmount)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Payout</p>
                  <p className="font-medium">{formatIDR(totalPayout)}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total yang perlu Anda siapkan</p>
                    <p className="text-xl font-bold">
                      {formatIDR(formData.contributionAmount + formData.securityDeposit)}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    Iuran + Jaminan
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Kembali
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Membuat...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Buat Arisan
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

