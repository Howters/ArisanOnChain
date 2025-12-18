"use client";

import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { useRouter } from "@/i18n/routing";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { client, liskSepolia } from "@/lib/thirdweb/client";
import { inAppWallet, createWallet } from "thirdweb/wallets";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "email", "phone"],
    },
    smartAccount: {
      chain: liskSepolia,
      sponsorGas: true,
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
];

export default function LoginPage() {
  const t = useTranslations("login");
  const tc = useTranslations("common");
  const account = useActiveAccount();
  const router = useRouter();

  useEffect(() => {
    if (account) {
      router.push("/dashboard");
    }
  }, [account, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {tc("back")}
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link
              href="/"
              className="text-2xl font-semibold tracking-tight inline-block mb-4"
            >
              arisan<span className="text-primary">aman</span>
            </Link>
            <h1 className="text-xl font-medium mb-2">{t("welcomeBack")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("signInDesc")}
            </p>
          </div>

          <div className="flex justify-center">
            <ConnectButton
              client={client}
              chain={liskSepolia}
              wallets={wallets}
              connectModal={{
                size: "wide",
                title: "Login ke ArisanAman",
                showThirdwebBranding: false,
              }}
              theme="dark"
              connectButton={{
                label: t("continueGoogle"),
                style: {
                  backgroundColor: "#22c55e",
                  color: "white",
                  borderRadius: "0.75rem",
                  padding: "0.75rem 2rem",
                  fontWeight: "600",
                  width: "100%",
                  height: "3rem",
                  fontSize: "1rem",
                },
              }}
            />
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            {t("agreeTerms")}{" "}
            <Link
              href="/terms"
              className="underline hover:text-foreground transition-colors"
            >
              {t("terms")}
            </Link>{" "}
            {t("and")}{" "}
            <Link
              href="/privacy"
              className="underline hover:text-foreground transition-colors"
            >
              {t("privacy")}
            </Link>
          </p>

          <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-muted-foreground text-center">
              {t("walletAuto")}
              <br />
              {t("noSeedPhrase")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
