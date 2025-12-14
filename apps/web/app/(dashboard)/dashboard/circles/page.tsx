"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Users, 
  Plus, 
  CircleDot,
  Crown,
  Loader2,
  RefreshCw,
  Search
} from "lucide-react";
import Link from "next/link";
import { usePools } from "@/lib/hooks/use-contracts";
import { formatIDR } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function CirclesPage() {
  const { data: poolsData, isLoading, refetch, isRefetching } = usePools();
  const [search, setSearch] = useState("");

  const myPools = poolsData?.pools || [];
  const allPools = poolsData?.allPools || myPools;

  const filteredPools = allPools.filter((pool: any) => 
    pool.id.toString().includes(search) ||
    `arisan #${pool.id}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">Semua Arisan</h1>
          <p className="text-muted-foreground">
            Daftar semua arisan yang tersedia
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
          </Button>
          <Button asChild>
            <Link href="/dashboard/new">
              <Plus className="mr-2 h-4 w-4" />
              Buat Arisan Baru
            </Link>
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari arisan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredPools.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <CircleDot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {search ? "Tidak ada arisan yang cocok" : "Belum ada arisan"}
              </p>
              {!search && (
                <Button asChild>
                  <Link href="/dashboard/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Buat Arisan Baru
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPools.map((pool: any, index: number) => (
            <motion.div
              key={pool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/circle/${pool.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">Arisan #{pool.id}</CardTitle>
                          <CardDescription>
                            {pool.memberCount} anggota
                          </CardDescription>
                        </div>
                      </div>
                      <Badge 
                        variant={pool.status === "Active" ? "success" : pool.status === "Pending" ? "warning" : "secondary"}
                      >
                        {pool.status === "Active" ? "Aktif" : pool.status === "Pending" ? "Menunggu" : pool.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Iuran</span>
                      <span className="font-medium">{formatIDR(Number(pool.contributionAmount))}/bln</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Periode</span>
                      <span className="font-medium">{pool.currentRound}/{pool.totalRounds}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Jaminan</span>
                      <span className="font-medium">{formatIDR(Number(pool.securityDeposit))}</span>
                    </div>
                    {(pool.isAdmin || pool.isUserMember) && (
                      <div className="pt-2 border-t flex gap-2">
                        {pool.isAdmin && (
                          <Badge variant="secondary">
                            <Crown className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        {pool.isUserMember && !pool.isAdmin && (
                          <Badge variant="outline">Anggota</Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}















