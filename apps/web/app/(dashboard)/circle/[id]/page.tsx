"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  ChevronRight,
  Shield,
} from "lucide-react";
import { formatIDR, formatAddress } from "@/lib/utils";
import { useState } from "react";
import { ContributeDialog } from "@/components/pool/contribute-dialog";
import { VouchDialog } from "@/components/pool/vouch-dialog";

const mockPool = {
  id: "1",
  name: "Arisan Keluarga Besar",
  admin: "0x1234...5678",
  contributionAmount: 500000,
  securityDeposit: 1000000,
  maxMembers: 10,
  currentRound: 3,
  totalRounds: 10,
  status: "Active",
  createdAt: "2024-01-15",
};

const mockMembers = [
  { address: "0x1234567890123456789012345678901234567890", name: "Budi Santoso", status: "Active", isAdmin: true, hasContributed: true, lockedStake: 1000000 },
  { address: "0x2345678901234567890123456789012345678901", name: "Siti Rahayu", status: "Active", isAdmin: false, hasContributed: true, lockedStake: 1000000 },
  { address: "0x3456789012345678901234567890123456789012", name: "Ahmad Wijaya", status: "Active", isAdmin: false, hasContributed: false, lockedStake: 1000000 },
  { address: "0x4567890123456789012345678901234567890123", name: "Dewi Lestari", status: "Pending", isAdmin: false, hasContributed: false, lockedStake: 0 },
  { address: "0x5678901234567890123456789012345678901234", name: "Eko Prasetyo", status: "Pending", isAdmin: false, hasContributed: false, lockedStake: 0 },
];

const mockRotation = [
  { round: 1, winner: "Budi Santoso", status: "completed", amount: 5000000 },
  { round: 2, winner: "Siti Rahayu", status: "completed", amount: 5000000 },
  { round: 3, winner: "Ahmad Wijaya", status: "current", amount: 5000000 },
  { round: 4, winner: "Dewi Lestari", status: "upcoming", amount: 5000000 },
];

export default function CirclePage() {
  const params = useParams();
  const [showPending, setShowPending] = useState(true);

  const activeMembers = mockMembers.filter((m) => m.status === "Active");
  const pendingMembers = mockMembers.filter((m) => m.status === "Pending");

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold font-display">{mockPool.name}</h1>
            <Badge variant="success">Aktif</Badge>
          </div>
          <p className="text-muted-foreground">
            Periode {mockPool.currentRound} dari {mockPool.totalRounds} • {activeMembers.length} anggota aktif
          </p>
        </div>
        <div className="flex gap-2">
          <ContributeDialog 
            poolId={mockPool.id}
            amount={mockPool.contributionAmount}
          />
          <Button variant="outline">Riwayat</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Iuran/Bulan", value: formatIDR(mockPool.contributionAmount), icon: Wallet },
          { label: "Uang Jaminan", value: formatIDR(mockPool.securityDeposit), icon: Shield },
          { label: "Total Pot", value: formatIDR(mockPool.contributionAmount * activeMembers.length), icon: Trophy },
          { label: "Anggota", value: `${activeMembers.length}/${mockPool.maxMembers}`, icon: Users },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Urutan Giliran</CardTitle>
              <CardDescription>Siapa yang mendapat giliran payout setiap periode</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockRotation.map((item, index) => (
                  <motion.div
                    key={item.round}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-4 p-3 rounded-lg border ${
                      item.status === "current" 
                        ? "border-primary bg-primary/5" 
                        : item.status === "completed"
                        ? "bg-muted/50"
                        : ""
                    }`}
                  >
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                      item.status === "current"
                        ? "bg-primary text-primary-foreground"
                        : item.status === "completed"
                        ? "bg-success/20 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {item.status === "completed" ? <Check className="h-5 w-5" /> : item.round}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.winner}</p>
                      <p className="text-sm text-muted-foreground">
                        Periode {item.round} • {formatIDR(item.amount)}
                      </p>
                    </div>
                    {item.status === "current" && (
                      <Badge variant="default">Giliran Sekarang</Badge>
                    )}
                    {item.status === "completed" && (
                      <Badge variant="success">Selesai</Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Daftar Anggota</CardTitle>
                <CardDescription>Anggota aktif dalam lingkaran ini</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeMembers.map((member, index) => (
                  <motion.div
                    key={member.address}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-lg border"
                  >
                    <Avatar>
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{member.name}</p>
                        {member.isAdmin && (
                          <Badge variant="secondary" className="shrink-0">
                            <Crown className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">
                        {formatAddress(member.address)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.hasContributed ? (
                        <Badge variant="success">
                          <Check className="h-3 w-3 mr-1" />
                          Sudah Setor
                        </Badge>
                      ) : (
                        <Badge variant="warning">
                          <Clock className="h-3 w-3 mr-1" />
                          Belum Setor
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {pendingMembers.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Menunggu Persetujuan
                    <Badge variant="warning" className="ml-2">{pendingMembers.length}</Badge>
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowPending(!showPending)}
                  >
                    {showPending ? "Sembunyikan" : "Tampilkan"}
                  </Button>
                </div>
              </CardHeader>
              {showPending && (
                <CardContent className="space-y-3">
                  {pendingMembers.map((member) => (
                    <div key={member.address} className="p-3 rounded-lg border space-y-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{member.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {formatAddress(member.address)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">Setujui</Button>
                        <VouchDialog memberName={member.name} memberAddress={member.address} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Periode Saat Ini</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Pemenang Periode 3</p>
                <p className="text-lg font-bold">Ahmad Wijaya</p>
                <p className="text-2xl font-bold text-primary mt-2">
                  {formatIDR(5000000)}
                </p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sudah setor</span>
                  <span className="font-medium">7 dari 10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Batas waktu</span>
                  <span className="font-medium">15 Des 2024</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Laporkan Gagal Bayar
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-warning/20 flex items-center justify-center shrink-0">
                  <HandshakeIcon className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">Jaminan Sosial</p>
                  <p className="text-xs text-muted-foreground">
                    Anda dapat menjaminkan stake Anda untuk anggota baru yang terpercaya. 
                    Jika mereka gagal bayar, stake Anda ikut disita.
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


