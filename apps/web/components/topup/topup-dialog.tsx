"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn, formatIDR } from "@/lib/utils";
import { Wallet, QrCode, CreditCard, Building2, Check, AlertTriangle } from "lucide-react";
import { useUserStore } from "@/stores/user-store";

const paymentMethods = [
  { id: "qris", name: "QRIS", icon: QrCode, description: "Scan untuk bayar" },
  { id: "gopay", name: "GoPay", icon: Wallet, description: "Dompet digital" },
  { id: "bca", name: "Bank BCA", icon: Building2, description: "Transfer bank" },
];

const quickAmounts = [50000, 100000, 250000, 500000, 1000000];

type Step = "amount" | "payment" | "confirm" | "success";

export function TopUpDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState<number>(100000);
  const [selectedMethod, setSelectedMethod] = useState<string>("qris");
  const [isProcessing, setIsProcessing] = useState(false);
  const { setBalances, balances } = useUserStore();

  const handleConfirm = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setBalances({
      liquid: balances.liquid + BigInt(amount),
    });
    
    setIsProcessing(false);
    setStep("success");
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStep("amount");
      setAmount(100000);
      setSelectedMethod("qris");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Wallet className="mr-2 h-4 w-4" />
          Top Up
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {step === "amount" && (
          <>
            <DialogHeader>
              <DialogTitle>Top Up Saldo</DialogTitle>
              <DialogDescription>
                Masukkan jumlah IDRX yang ingin Anda top up
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Jumlah (IDRX)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="pl-10 text-lg font-semibold"
                    min={10000}
                    step={10000}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amt) => (
                  <Button
                    key={amt}
                    variant={amount === amt ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAmount(amt)}
                  >
                    {formatIDR(amt)}
                  </Button>
                ))}
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={() => setStep("payment")}
                disabled={amount < 10000}
              >
                Lanjutkan
              </Button>
            </div>
          </>
        )}

        {step === "payment" && (
          <>
            <DialogHeader>
              <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
              <DialogDescription>
                Jumlah: {formatIDR(amount)} IDRX
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-lg border transition-all",
                      selectedMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <method.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {method.description}
                      </div>
                    </div>
                    {selectedMethod === method.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("amount")}>
                  Kembali
                </Button>
                <Button className="flex-1" onClick={() => setStep("confirm")}>
                  Lanjutkan
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
              <DialogDescription>
                {selectedMethod === "qris" ? "Scan kode QRIS berikut" : "Selesaikan pembayaran"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedMethod === "qris" && (
                <div className="aspect-square max-w-[200px] mx-auto bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                  <div className="text-center p-4">
                    <QrCode className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">QRIS Simulasi</p>
                  </div>
                </div>
              )}

              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Jumlah</span>
                  <span className="font-semibold">{formatIDR(amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Metode</span>
                  <span>{paymentMethods.find((m) => m.id === selectedMethod)?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Akan diterima</span>
                  <span className="font-semibold text-primary">{amount.toLocaleString()} IDRX</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg text-sm">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">INI SIMULASI</span> - Dana tidak nyata. 
                  Klik tombol di bawah untuk mensimulasikan pembayaran berhasil.
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep("payment")}>
                  Kembali
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleConfirm}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Memproses..." : "Saya Sudah Bayar (Simulasi)"}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "success" && (
          <>
            <div className="text-center py-8">
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-success" />
              </div>
              <DialogTitle className="mb-2">Top Up Berhasil!</DialogTitle>
              <DialogDescription className="mb-4">
                <span className="text-2xl font-bold text-foreground block mb-1">
                  +{amount.toLocaleString()} IDRX
                </span>
                telah ditambahkan ke saldo Anda
              </DialogDescription>
              <Button onClick={handleClose}>Selesai</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}


