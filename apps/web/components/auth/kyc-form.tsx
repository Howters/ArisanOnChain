"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, Clock, XCircle, Lock, Eye } from "lucide-react";
import { toast } from "sonner";

interface KYCFormProps {
  walletAddress: string;
  currentKycStatus?: string;
  onKycUpdate?: () => void;
}

export function KYCForm({ walletAddress, currentKycStatus, onKycUpdate }: KYCFormProps) {
  const t = useTranslations("kyc");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    ktpNumber: "",
    fullName: "",
    birthDate: "",
    address: ""
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/kyc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress,
          ...formData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t("messages.success"));
        onKycUpdate?.();
        setFormData({ ktpNumber: "", fullName: "", birthDate: "", address: "" });
      } else {
        toast.error(data.error || t("messages.error"));
      }
    } catch (error) {
      console.error("KYC submission error:", error);
      toast.error(t("messages.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.ktpNumber.length === 16 &&
                     formData.fullName.length >= 2 &&
                     formData.birthDate &&
                     formData.address.length >= 10;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("subtitle")}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Status */}
        {currentKycStatus && (
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              {getStatusIcon(currentKycStatus)}
              <span className="font-medium">{t("status")[currentKycStatus as keyof typeof t.status] || currentKycStatus}</span>
            </div>
            <Badge variant={getStatusColor(currentKycStatus)}>
              {t("status")[currentKycStatus as keyof typeof t.status] || currentKycStatus}
            </Badge>
          </div>
        )}

        {/* ZK Privacy Notice */}
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-blue-700 dark:text-blue-300">{t("zk.title")}</span>
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-400">{t("description")}</p>
          <p className="text-xs text-blue-500 dark:text-blue-500 mt-1">{t("privacyNote")}</p>
        </div>

        {/* KYC Form - Only show if not verified */}
        {currentKycStatus !== "verified" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ktpNumber">{t("form.ktpNumber")}</Label>
                <Input
                  id="ktpNumber"
                  type="text"
                  placeholder={t("form.ktpNumberPlaceholder")}
                  value={formData.ktpNumber}
                  onChange={(e) => setFormData({...formData, ktpNumber: e.target.value.replace(/\D/g, "").slice(0, 16)})}
                  maxLength={16}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">{t("form.fullName")}</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder={t("form.fullNamePlaceholder")}
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">{t("form.birthDate")}</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">{t("form.address")}</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder={t("form.addressPlaceholder")}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <Eye className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700 dark:text-green-300">{t("zk.description")}</span>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? t("form.submitting") : t("form.submit")}
            </Button>
          </form>
        )}

        {/* ZK Proof Display - Show if verified */}
        {currentKycStatus === "verified" && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-medium text-green-700 dark:text-green-300">{t("zk.ageVerified")}</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-400">{t("zk.description")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}