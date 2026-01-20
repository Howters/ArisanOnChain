"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { KYCForm } from "./kyc-form";

interface KYCStatusProps {
  walletAddress: string;
  compact?: boolean;
}

export function KYCStatus({ walletAddress, compact = false }: KYCStatusProps) {
  const t = useTranslations("kyc");
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchKycStatus();
  }, [walletAddress]);

  const fetchKycStatus = async () => {
    try {
      const response = await fetch(`/api/kyc?address=${walletAddress}`);
      const data = await response.json();
      setKycStatus(data);
    } catch (error) {
      console.error("Error fetching KYC status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoVerification = async () => {
    setVerifying(true);
    try {
      const response = await fetch("/api/kyc/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "KYC verification completed!");
        fetchKycStatus();
      } else {
        toast.error(data.error || "Verification failed");
      }
    } catch (error) {
      console.error("Demo verification error:", error);
      toast.error("Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
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

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 animate-pulse" />
        <span className="text-sm text-muted-foreground">Loading KYC status...</span>
      </div>
    );
  }

  if (compact) {
    const status = kycStatus?.kycStatus || "unverified";
    return (
      <div className="flex items-center gap-2">
        {getStatusIcon(status)}
        <Badge variant={getStatusColor(status)}>
          {status === "unverified" && t("status.unverified")}
          {status === "pending" && t("status.pending")}
          {status === "verified" && t("status.verified")}
          {status === "rejected" && t("status.rejected")}
        </Badge>
        <div className="flex gap-2">
          {status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDemoVerification}
              disabled={verifying}
            >
              {verifying ? "..." : "Verify"}
            </Button>
          )}
          {status !== "verified" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
            >
              Form
            </Button>
          )}
        </div>
      </div>
    );
  }

  const status = kycStatus?.kycStatus || "unverified";
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon(status)}
          <div>
            <h3 className="font-medium">{t("title")}</h3>
            <p className="text-sm text-muted-foreground">
              {status === "unverified" && t("status.unverified")}
              {status === "pending" && t("status.pending")}
              {status === "verified" && t("status.verified")}
              {status === "rejected" && t("status.rejected")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {status === "pending" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDemoVerification}
              disabled={verifying}
            >
              {verifying ? "Verifying..." : "Demo: Verify Now"}
            </Button>
          )}
          {status !== "verified" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
            >
              <Shield className="mr-2 h-4 w-4" />
              {status === "pending" ? "Update Info" : "Start Verification"}
            </Button>
          )}
        </div>
      </div>

      {kycStatus?.kycStatus === "verified" && kycStatus?.zkProofHash && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div className="text-sm">
              <p className="font-medium text-green-700 dark:text-green-300">{t("zk.ageVerified")}</p>
              <p className="text-green-600 dark:text-green-400 text-xs">
                Proof: {kycStatus.zkProofHash.substring(0, 16)}...
              </p>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <KYCForm
          walletAddress={walletAddress}
          currentKycStatus={kycStatus?.kycStatus}
          onKycUpdate={() => {
            setShowForm(false);
            fetchKycStatus();
          }}
        />
      )}
    </div>
  );
}