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
import { formatIDR, formatAddress } from "@/lib/utils";
import { HandshakeIcon, Check, AlertTriangle, Loader2 } from "lucide-react";
import { useUserStore } from "@/stores/user-store";

interface VouchDialogProps {
  memberName: string;
  memberAddress: string;
}

export function VouchDialog({ memberName, memberAddress }: VouchDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(100000);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { balances, setBalances } = useUserStore();

  const hasEnoughBalance = Number(balances.liquid) >= amount;

  const handleVouch = async () => {
    if (!hasEnoughBalance || amount <= 0) return;
    
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setBalances({
      liquid: balances.liquid - BigInt(amount),
      locked: balances.locked + BigInt(amount),
    });
    
    setIsProcessing(false);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setIsSuccess(false);
      setAmount(100000);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HandshakeIcon className="mr-1 h-3 w-3" />
          Jamin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>Jaminan Sosial</DialogTitle>
              <DialogDescription>
                Jaminkan stake Anda untuk {memberName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {memberName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{memberName}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {formatAddress(memberAddress)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Jumlah Jaminan (IDRX)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    Rp
                  </span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="pl-10"
                    min={10000}
                    step={10000}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Saldo tersedia: {formatIDR(Number(balances.liquid))}
                </p>
              </div>

              <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg text-sm">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Peringatan:</span> Jika {memberName} gagal bayar, 
                  jaminan Anda akan ikut disita untuk menutupi kerugian.
                </p>
              </div>

              {!hasEnoughBalance && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg text-sm">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-destructive">
                    Saldo tidak cukup untuk jumlah jaminan ini.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Batal
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleVouch}
                  disabled={!hasEnoughBalance || amount <= 0 || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Konfirmasi Jaminan"
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
            <DialogTitle className="mb-2">Jaminan Berhasil!</DialogTitle>
            <DialogDescription className="mb-4">
              Anda telah menjaminkan{" "}
              <span className="font-bold text-foreground">{formatIDR(amount)}</span>
              {" "}untuk {memberName}
            </DialogDescription>
            <Button onClick={handleClose}>Selesai</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


