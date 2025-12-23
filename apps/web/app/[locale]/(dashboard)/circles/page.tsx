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
  Search,
  Globe
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { usePools } from "@/lib/hooks/use-contracts";
import { formatIDR } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useTranslations } from "next-intl";

type FilterType = "all" | "admin" | "member" | "public";
type CategoryType = "all" | "padukuhan" | "ibu" | "satpam" | "olahraga" | "kantor" | "lainnya";

export default function CirclesPage() {
  const t = useTranslations("circles");
  const tc = useTranslations("common");
  const { data: poolsData, isLoading, refetch, isRefetching } = usePools();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>("all");

  const myPools = poolsData?.pools || [];
  const allPools = poolsData?.allPools || myPools;

  const filteredPools = allPools.filter((pool: any) => {
    const matchesSearch = 
      pool.id.toString().includes(search) ||
      (pool.name && pool.name.toLowerCase().includes(search.toLowerCase())) ||
      (pool.poolName && pool.poolName.toLowerCase().includes(search.toLowerCase())) ||
      `arisan #${pool.id}`.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (categoryFilter !== "all" && pool.category !== categoryFilter) return false;
    
    if (filter === "admin") return pool.isAdmin;
    if (filter === "member") return pool.isUserMember && !pool.isAdmin;
    if (filter === "public") return !pool.isAdmin && !pool.isUserMember;
    return true;
  });

  const countAdmin = allPools.filter((p: any) => p.isAdmin).length;
  const countMember = allPools.filter((p: any) => p.isUserMember && !p.isAdmin).length;
  const countPublic = allPools.filter((p: any) => !p.isAdmin && !p.isUserMember).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
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
              {t("title")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant={filter === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter("all")}
          >
            {t("all")} ({allPools.length})
          </Button>
          <Button 
            variant={filter === "admin" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter("admin")}
          >
            <Crown className="mr-1 h-3 w-3" />
            {t("admin")} ({countAdmin})
          </Button>
          <Button 
            variant={filter === "member" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter("member")}
          >
            <Users className="mr-1 h-3 w-3" />
            {t("member")} ({countMember})
          </Button>
          <Button 
            variant={filter === "public" ? "default" : "outline"} 
            size="sm"
            onClick={() => setFilter("public")}
          >
            <Globe className="mr-1 h-3 w-3" />
            {t("public")} ({countPublic})
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button 
          variant={categoryFilter === "all" ? "default" : "outline"} 
          size="sm"
          onClick={() => setCategoryFilter("all")}
        >
          {t("allCategories")}
        </Button>
        <Button 
          variant={categoryFilter === "padukuhan" ? "default" : "outline"} 
          size="sm"
          onClick={() => setCategoryFilter("padukuhan")}
        >
          {t("categories.padukuhan")}
        </Button>
        <Button 
          variant={categoryFilter === "ibu" ? "default" : "outline"} 
          size="sm"
          onClick={() => setCategoryFilter("ibu")}
        >
          {t("categories.ibu")}
        </Button>
        <Button 
          variant={categoryFilter === "satpam" ? "default" : "outline"} 
          size="sm"
          onClick={() => setCategoryFilter("satpam")}
        >
          {t("categories.satpam")}
        </Button>
        <Button 
          variant={categoryFilter === "olahraga" ? "default" : "outline"} 
          size="sm"
          onClick={() => setCategoryFilter("olahraga")}
        >
          {t("categories.olahraga")}
        </Button>
        <Button 
          variant={categoryFilter === "kantor" ? "default" : "outline"} 
          size="sm"
          onClick={() => setCategoryFilter("kantor")}
        >
          {t("categories.kantor")}
        </Button>
        <Button 
          variant={categoryFilter === "lainnya" ? "default" : "outline"} 
          size="sm"
          onClick={() => setCategoryFilter("lainnya")}
        >
          {t("categories.lainnya")}
        </Button>
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
                {search || filter !== "all" ? t("noMatch") : t("noArisan")}
              </p>
              {!search && filter === "all" && (
                <Button asChild>
                  <Link href="/dashboard/new">
                    <Plus className="mr-2 h-4 w-4" />
                    {t("title")}
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
                          <CardTitle className="text-base">
                            {pool.poolName || pool.name || `Arisan #${pool.id}`}
                          </CardTitle>
                          <CardDescription>
                            {pool.memberCount} {tc("members")}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge 
                        variant={pool.status === "Active" ? "success" : pool.status === "Pending" ? "warning" : "secondary"}
                      >
                        {pool.status === "Active" ? tc("active") : pool.status === "Pending" ? tc("pending") : pool.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("contribution")}</span>
                      <span className="font-medium">{formatIDR(Number(pool.contributionAmount))}{pool.rotationPeriod === "Weekly" ? tc("perWeek") : tc("perMonth")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{tc("period")}</span>
                      <span className="font-medium">{pool.currentRound}/{pool.totalRounds}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("deposit")}</span>
                      <span className="font-medium">{formatIDR(Number(pool.securityDeposit))}</span>
                    </div>
                    <div className="pt-2 border-t flex gap-2">
                      {pool.isAdmin && (
                        <Badge variant="secondary">
                          <Crown className="h-3 w-3 mr-1" />
                          {t("admin")}
                        </Badge>
                      )}
                      {pool.isUserMember && !pool.isAdmin && (
                        <Badge variant="outline">{t("member")}</Badge>
                      )}
                      {!pool.isAdmin && !pool.isUserMember && (
                        <Badge variant="outline" className="text-muted-foreground">
                          <Globe className="h-3 w-3 mr-1" />
                          {t("public")}
                        </Badge>
                      )}
                    </div>
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
