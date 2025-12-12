"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Droplets, 
  CreditCard, 
  Loader2,
  RefreshCw,
  ExternalLink,
  History
} from "lucide-react";
import { useTransactionHistory } from "@/lib/hooks/use-contracts";
import { formatIDR, formatAddress } from "@/lib/utils";

const TX_TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  faucet: { label: "Faucet", icon: Droplets, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  topup: { label: "Top Up", icon: CreditCard, color: "text-green-500", bgColor: "bg-green-500/10" },
  receive: { label: "Diterima", icon: ArrowDownLeft, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  send: { label: "Dikirim", icon: ArrowUpRight, color: "text-orange-500", bgColor: "bg-orange-500/10" },
};

export default function HistoryPage() {
  const { data, isLoading, refetch, isRefetching } = useTransactionHistory();

  const transactions = data?.transactions || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Riwayat Transaksi</h1>
          <p className="text-muted-foreground">
            Riwayat semua transaksi IDRX Anda
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Belum ada transaksi</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {transactions.map((tx: any, index: number) => {
              const config = TX_TYPE_CONFIG[tx.type] || TX_TYPE_CONFIG.send;
              const IconComponent = config.icon;
              const date = new Date(tx.timestamp * 1000);

              return (
                <motion.div
                  key={tx.txHash + index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                      <IconComponent className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{config.label}</p>
                        <Badge variant="outline" className="text-xs">
                          {tx.type === "receive" && tx.from ? `dari ${formatAddress(tx.from)}` : ""}
                          {tx.type === "send" && tx.to ? `ke ${formatAddress(tx.to)}` : ""}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {date.toLocaleDateString("id-ID", { 
                          day: "numeric", 
                          month: "short", 
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`font-bold ${tx.type === "send" ? "text-orange-500" : "text-green-500"}`}>
                      {tx.type === "send" ? "-" : "+"}{formatIDR(Number(tx.amount))}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(`https://sepolia-blockscout.lisk.com/tx/${tx.txHash}`, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}










