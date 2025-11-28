"use client";

import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { client, liskSepolia } from "@/lib/thirdweb/client";
import { inAppWallet, createWallet } from "thirdweb/wallets";

const wallets = [
  inAppWallet({
    auth: {
      options: ["google", "email"],
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
          Back
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
            <h1 className="text-xl font-medium mb-2">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to access your circles
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
                label: "Continue with Google",
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
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="underline hover:text-foreground transition-colors"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
          </p>

          <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-muted-foreground text-center">
              🔐 Your wallet is created automatically.
              <br />
              No seed phrases, no gas fees needed.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
