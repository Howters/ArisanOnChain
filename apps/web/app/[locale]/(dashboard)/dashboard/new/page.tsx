"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  CheckCircle2,
  Loader2,
  Info,
  AlertTriangle,
  HandshakeIcon
} from "lucide-react";
import Link from "next/link";
import { formatIDR } from "@/lib/utils";
import { useCreatePool } from "@/lib/hooks/use-contracts";
import { useWalletAddress } from "@/lib/hooks/use-wallet-address";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const PRESET_AMOUNTS = [100000, 200000, 500000, 1000000];
const PRESET_MEMBERS = [5, 8, 10, 12];
const DEPOSIT_MULTIPLIERS = [
  { value: 1, label: "1x", desc: "Grup terpercaya" },
  { value: 1.5, label: "1.5x", desc: "Semi-terpercaya" },
  { value: 2, label: "2x", desc: "Campuran" },
  { value: 3, label: "3x", desc: "Keamanan maksimal" },
];

export default function CreateCirclePage() {
  const router = useRouter();
  const walletAddress = useWalletAddress();
  const createPool = useCreatePool();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    contributionAmount: 500000,
    depositMultiplier: 2,
    maxMembers: 10,
    paymentDay: 1,
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
    if (value < 1) return 1;
    if (value > 28) return 28;
    return value;
  };

  const handleSubmit = async () => {
    if (!walletAddress) {
      toast.error("Wallet tidak tersedia", {
        description: "Silakan tunggu beberapa saat atau refresh halaman",
      });
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
      });
      
      toast.success("Arisan berhasil dibuat! 🎉", {
        description: `${formData.name || "Arisan baru"} telah dibuat. Silakan undang anggota.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["pools"] });
      
      // Redirect to the newly created pool
      if (result?.poolId) {
        router.push(`/circle/${result.poolId}`);
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Failed to create pool:", error);
      toast.error("Gagal membuat arisan", {
        description: error.message || "Terjadi kesalahan, silakan coba lagi",
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
          <h1 className="text-2xl font-bold">Buat Arisan Baru</h1>
          <p className="text-muted-foreground">
            Atur detail arisan dan undang anggota
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
                    max={50}
                    value={formData.maxMembers}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      maxMembers: validateMaxMembers(parseInt(e.target.value) || 3) 
                    })}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">orang (min. 3, maks. 50)</span>
                </div>
                {(formData.maxMembers < 3 || formData.maxMembers > 50) && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Jumlah anggota harus antara 3-50 orang
                  </p>
                )}
              </div>

              <Button 
                className="w-full" 
                onClick={() => setStep(2)}
                disabled={!formData.name.trim() || formData.maxMembers < 3 || formData.maxMembers > 50}
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
                    onChange={(e) => setFormData({ ...formData, contributionAmount: Math.max(50000, parseInt(e.target.value) || 100000) })}
                    className="w-40"
                  />
                  <span className="text-sm text-muted-foreground">IDRX</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Tanggal Pembayaran</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Setiap tanggal</span>
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
                  <span className="text-sm text-muted-foreground">setiap bulan</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Maksimal tanggal 28 untuk menghindari masalah dengan bulan pendek
                </p>
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
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Keamanan</CardTitle>
                  <CardDescription>Deposit keamanan dan pengaturan vouch</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Multiplier Uang Jaminan</Label>
                <div className="grid grid-cols-2 gap-2">
                  {DEPOSIT_MULTIPLIERS.map((m) => (
                    <Button
                      key={m.value}
                      variant={formData.depositMultiplier === m.value ? "default" : "outline"}
                      className="h-16 flex-col"
                      onClick={() => setFormData({ ...formData, depositMultiplier: m.value })}
                    >
                      <span className="font-bold">{m.label} Iuran</span>
                      <span className="text-xs opacity-70">{m.desc}</span>
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Uang jaminan: <span className="font-medium">{formatIDR(securityDeposit)}</span>
                </p>
              </div>

              <div className="space-y-3">
                <Label>Wajib Vouch?</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={!formData.vouchRequired ? "default" : "outline"}
                    className="h-14 flex-col"
                    onClick={() => setFormData({ ...formData, vouchRequired: false })}
                  >
                    <span className="font-bold">Tidak Wajib</span>
                    <span className="text-xs opacity-70">Untuk grup terpercaya</span>
                  </Button>
                  <Button
                    variant={formData.vouchRequired ? "default" : "outline"}
                    className="h-14 flex-col"
                    onClick={() => setFormData({ ...formData, vouchRequired: true })}
                  >
                    <span className="font-bold">Wajib Vouch</span>
                    <span className="text-xs opacity-70">Keamanan ekstra</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex gap-3">
                    <Shield className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-500 mb-2">Tentang Uang Jaminan</p>
                      <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Uang jaminan dikunci selama arisan berlangsung</li>
                        <li>Jika anggota gagal bayar iuran, jaminan akan disita</li>
                        <li>Jaminan dikembalikan penuh setelah arisan selesai</li>
                        <li>Semakin tinggi multiplier = semakin aman pool</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex gap-3">
                    <HandshakeIcon className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-purple-500 mb-2">Tentang Vouch (Jaminan Sosial)</p>
                      <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Anggota lama menjamin anggota baru dengan dana</li>
                        <li>Jika yang dijamin default, voucher juga kena penalti</li>
                        <li>Menciptakan tekanan sosial untuk membayar tepat waktu</li>
                        <li>Cocok untuk pool campuran (ada yang belum kenal)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Kembali
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1">
                  Lanjutkan
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
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Uang Jaminan</p>
                  <p className="font-medium">{formatIDR(securityDeposit)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Tanggal Bayar</p>
                  <p className="font-medium">Setiap tanggal {formData.paymentDay}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Vouch Wajib</p>
                  <p className="font-medium">{formData.vouchRequired ? "Ya - Anggota baru harus dijamin" : "Tidak - Semua bisa langsung gabung"}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total yang perlu Anda siapkan</p>
                    <p className="text-xl font-bold">
                      {formatIDR(formData.contributionAmount + securityDeposit)}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    Iuran + Jaminan
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  Kembali
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  className="flex-1"
                  disabled={isSubmitting || !walletAddress}
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
