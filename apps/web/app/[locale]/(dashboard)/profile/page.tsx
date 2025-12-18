"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWalletAddress } from "@/lib/hooks/use-wallet-address";
import { toast } from "sonner";
import { Loader2, User, Phone, MapPin, Check, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface ProfileData {
  nama: string;
  whatsapp: string;
  kota: string;
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const router = useRouter();
  const walletAddress = useWalletAddress();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    nama: "",
    whatsapp: "",
    kota: "",
  });

  useEffect(() => {
    if (!walletAddress) return;
    
    fetch(`/api/profile?address=${walletAddress}`)
      .then(res => res.json())
      .then(data => {
        if (data.profile) {
          setFormData({
            nama: data.profile.nama || "",
            whatsapp: data.profile.whatsapp || "",
            kota: data.profile.kota || "",
          });
          setHasExistingProfile(true);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [walletAddress]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress) return;
    
    setIsSaving(true);
    
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          ...formData,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || tc("error"));
        return;
      }
      
      toast.success(tc("success"));
      setHasExistingProfile(true);
      
      const returnTo = new URLSearchParams(window.location.search).get("returnTo");
      if (returnTo) {
        router.push(returnTo as any);
      }
    } catch {
      toast.error(tc("error"));
    } finally {
      setIsSaving(false);
    }
  };

  if (!walletAddress) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {hasExistingProfile ? t("editTitle") : t("completeTitle")}
        </h1>
        <p className="text-muted-foreground">
          {hasExistingProfile ? t("editDesc") : t("completeDesc")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("personalInfo")}</CardTitle>
          <CardDescription>
            {t("personalInfoDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nama" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {t("fullName")}
              </Label>
              <Input
                id="nama"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder={t("fullNamePlaceholder")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {t("whatsapp")}
              </Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder={t("whatsappPlaceholder")}
                required
              />
              <p className="text-xs text-muted-foreground">
                {t("whatsappNote")}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kota" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {t("city")}
              </Label>
              <Input
                id="kota"
                name="kota"
                value={formData.kota}
                onChange={handleChange}
                placeholder={t("cityPlaceholder")}
              />
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="submit" disabled={isSaving} className="flex-1">
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : hasExistingProfile ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                {hasExistingProfile ? t("saveChanges") : t("saveContinue")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            💡 <strong className="text-foreground">{t("whyWhatsapp")}</strong>
            <br />
            {t("whyWhatsappDesc")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
