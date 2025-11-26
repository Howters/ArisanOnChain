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
import { formatIDR } from "@/lib/utils";
import { Wallet, Check, AlertTriangle, Loader2 } from "lucide-react";
import { useUserStore } from "@/stores/user-store";

interface ContributeDialogProps {
  poolId: string;
  amount: number;
}

export function ContributeDialog({ poolId, amount }: ContributeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { balances, setBalances } = useUserStore();

  const hasEnoughBalance = Number(balances.liquid) >= amount;

  const handleContribute = async () => {
    if (!hasEnoughBalance) return;
    
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setBalances({
      liquid: balances.liquid - BigInt(amount),
    });
    
    setIsProcessing(false);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setIsSuccess(false);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Wallet className="mr-2 h-4 w-4" />
          Setor Iuran
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>Setor Iuran Bulanan</DialogTitle>
              <DialogDescription>
                Setorkan iuran untuk periode ini
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Jumlah iuran</span>
                  <span className="font-bold">{formatIDR(amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Saldo Anda</span>
                  <span className={hasEnoughBalance ? "text-success" : "text-destructive"}>
                    {formatIDR(Number(balances.liquid))}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between text-sm">
                  <span className="text-muted-foreground">Sisa setelah setor</span>
                  <span className="font-medium">
                    {formatIDR(Math.max(0, Number(balances.liquid) - amount))}
                  </span>
                </div>
              </div>

              {!hasEnoughBalance && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg text-sm">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-destructive">
                    Saldo tidak cukup. Silakan top up terlebih dahulu.
                  </p>
                </div>
              )}

              <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg text-sm">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">INI SIMULASI</span> - 
                  Transaksi akan diproses secara gasless oleh sistem.
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Batal
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleContribute}
                  disabled={!hasEnoughBalance || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Konfirmasi Setoran"
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-success" />
            </div>
            <DialogTitle className="mb-2">Setoran Berhasil!</DialogTitle>
            <DialogDescription className="mb-4">
              <span className="text-lg font-bold text-foreground block mb-1">
                {formatIDR(amount)}
              </span>
              telah disetorkan ke arisan
            </DialogDescription>
            <Button onClick={handleClose}>Selesai</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


