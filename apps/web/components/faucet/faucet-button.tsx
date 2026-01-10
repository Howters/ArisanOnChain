"use client";

import { Button } from "@/components/ui/button";
import { Droplets, Loader2, Check } from "lucide-react";
import { useFaucet } from "@/lib/hooks/use-contracts";
import { useState } from "react";
import { formatIDRX } from "@/lib/utils";
import { toast } from "sonner";
import { useWalletAddress, useWalletReady } from "@/lib/hooks/use-wallet-address";

const FAUCET_AMOUNT = 1_000_000;

export function FaucetButton() {
  const faucet = useFaucet();
  const walletAddress = useWalletAddress();
  const walletReady = useWalletReady();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClick = async () => {
    if (!walletAddress) {
      toast.error("Wallet tidak tersedia", {
        description: "Silakan login terlebih dahulu",
      });
      return;
    }

    try {
      await faucet.mutateAsync();
      setShowSuccess(true);
      toast.success("Faucet berhasil!", {
        description: `+${formatIDRX(FAUCET_AMOUNT)} IDRX telah ditambahkan`,
      });
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      toast.error("Faucet gagal", {
        description: error.message || "Terjadi kesalahan",
      });
    }
  };

  if (showSuccess) {
    return (
      <Button variant="outline" size="sm" className="text-success border-success/50">
        <Check className="mr-2 h-4 w-4" />
        +{formatIDRX(FAUCET_AMOUNT)}
      </Button>
    );
  }

  const isLoading = faucet.isPending;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isLoading || !walletReady}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Claiming...
        </>
      ) : (
        <>
          <Droplets className="mr-2 h-4 w-4" />
          Faucet
        </>
      )}
    </Button>
  );
}
