"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { 
  Wallet, 
  Lock, 
  TrendingUp, 
  Users, 
  Plus, 
  ArrowRight,
  CircleDot,
  Crown
} from "lucide-react";
import Link from "next/link";
import { useUserStore } from "@/stores/user-store";
import { formatIDR } from "@/lib/utils";

const mockCircles = [
  {
    id: "1",
    name: "Arisan Keluarga Besar",
    contributionAmount: 500000,
    memberCount: 10,
    currentRound: 3,
    totalRounds: 10,
    status: "Active",
    isAdmin: true,
    nextPayout: "15 Des 2024",
  },
  {
    id: "2",
    name: "Arisan Kantor IT",
    contributionAmount: 200000,
    memberCount: 8,
    currentRound: 5,
    totalRounds: 8,
    status: "Active",
    isAdmin: false,
    nextPayout: "1 Jan 2025",
  },
  {
    id: "3",
    name: "Arisan RT 05",
    contributionAmount: 100000,
    memberCount: 15,
    currentRound: 1,
    totalRounds: 15,
    status: "Pending",
    isAdmin: false,
    nextPayout: "-",
  },
];

export default function DashboardPage() {
  const { user } = usePrivy();
  const { balances } = useUserStore();

  const stats = [
    {
      label: "Saldo Tersedia",
      value: formatIDR(Number(balances.liquid)),
      sublabel: "IDRX",
      icon: Wallet,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Dana Terkunci",
      value: formatIDR(Number(balances.locked)),
      sublabel: "Uang jaminan",
      icon: Lock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Yield Simulasi",
      value: formatIDR(Number(balances.mockYield)),
      sublabel: "+0.5% / bulan",
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">
            Selamat datang, {user?.google?.name?.split(" ")[0] || user?.email?.address?.split("@")[0] || "User"}! 👋
          </h1>
          <p className="text-muted-foreground">
            Kelola arisan digital Anda dengan mudah dan aman
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/new">
            <Plus className="mr-2 h-4 w-4" />
            Buat Arisan Baru
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
                <CardTitle>Arisan Saya</CardTitle>
                <CardDescription>Lingkaran arisan yang Anda ikuti</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/circles">
                  Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {mockCircles.length === 0 ? (
                <div className="text-center py-8">
                  <CircleDot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Anda belum bergabung dengan arisan manapun
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Buat Arisan Baru
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {mockCircles.map((circle, index) => (
                    <motion.div
                      key={circle.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link href={`/circle/${circle.id}`}>
                        <div className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{circle.name}</p>
                              {circle.isAdmin && (
                                <Badge variant="secondary" className="shrink-0">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatIDR(circle.contributionAmount)}/bulan • {circle.memberCount} anggota
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <Badge 
                              variant={circle.status === "Active" ? "success" : "warning"}
                            >
                              {circle.status === "Active" ? "Aktif" : "Menunggu"}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              Periode {circle.currentRound}/{circle.totalRounds}
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
              <CardTitle>Aktivitas Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Top Up", amount: "+100.000 IDRX", time: "2 jam lalu", type: "credit" },
                  { action: "Setor Iuran", amount: "-500.000 IDRX", time: "1 hari lalu", type: "debit" },
                  { action: "Terima Payout", amount: "+5.000.000 IDRX", time: "1 minggu lalu", type: "credit" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <span className={activity.type === "credit" ? "text-success" : "text-destructive"}>
                      {activity.amount}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium mb-1">Yield Simulasi Aktif</p>
                  <p className="text-sm text-muted-foreground">
                    Dana arisan Anda menghasilkan yield simulasi 0.5%/bulan. 
                    Ini adalah fitur demo MVP.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


