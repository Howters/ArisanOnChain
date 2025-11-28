"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useActiveAccount } from "thirdweb/react";
import { ArrowRight, Shield, Users, Zap } from "lucide-react";
import Aurora from "@/components/Aurora";
import GradientText from "@/components/GradientText";
import FadeContent from "@/components/FadeContent";
import BlurText from "@/components/BlurText";

const stats = [
  { value: "Rp 2.5B+", label: "Total Volume" },
  { value: "1,234", label: "Active Circles" },
  { value: "5,678", label: "Members" },
];

const features = [
  {
    icon: Shield,
    title: "On-chain Security",
    desc: "Every transaction recorded on blockchain. No manipulation possible.",
  },
  {
    icon: Users,
    title: "Social Collateral",
    desc: "Vouch system where members guarantee each other to minimize default risk.",
  },
  {
    icon: Zap,
    title: "Gasless Experience",
    desc: "No wallet setup needed. Just login with Google and start your circle.",
  },
];

export default function LandingPage() {
  const account = useActiveAccount();
  const isAuthenticated = !!account;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={["#22c55e", "#10b981", "#059669"]}
          amplitude={0.2}
          blend={0.7}
        />
      </div>

      <div className="relative z-10">
        <header className="border-b border-white/10 backdrop-blur-sm">
          <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight">
              arisan<span className="text-primary">aman</span>
            </Link>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Button asChild size="sm">
                  <Link href="/dashboard">Open App</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/login">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </header>

        <main>
          <section className="max-w-6xl mx-auto px-6 pt-32 pb-24">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-muted-foreground mb-8">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Built on Lisk L2
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
                <BlurText
                  text="Traditional arisan,"
                  className="block mb-2"
                  delay={50}
                  animateBy="words"
                  direction="top"
                />
                <GradientText
                  colors={["#22c55e", "#10b981", "#22c55e"]}
                  animationSpeed={6}
                  className="text-5xl sm:text-6xl lg:text-7xl font-bold"
                >
                  modern trust
                </GradientText>
              </h1>

              <FadeContent blur duration={800} delay={300}>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mb-12 leading-relaxed">
                  The first on-chain ROSCA for Indonesia. Transparent, secure,
                  and completely gasless. No crypto knowledge required.
                </p>
              </FadeContent>

              <FadeContent blur duration={800} delay={500}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="h-12 px-8 text-base" asChild>
                    <Link href="/login">
                      Start Your Circle
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-8 text-base"
                    asChild
                  >
                    <Link href="#features">Learn More</Link>
                  </Button>
                </div>
              </FadeContent>
            </div>
          </section>

          <section className="border-y border-white/10 bg-black/20 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-6 py-16">
              <div className="grid grid-cols-3 gap-8">
                {stats.map((stat, i) => (
                  <FadeContent key={i} blur duration={600} delay={i * 100}>
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  </FadeContent>
                ))}
              </div>
            </div>
          </section>

          <section id="features" className="max-w-6xl mx-auto px-6 py-32">
            <FadeContent blur duration={600}>
              <div className="text-center mb-20">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                  Why on-chain?
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Traditional arisan relies on trust. We make trust verifiable
                  and transparent.
                </p>
              </div>
            </FadeContent>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <FadeContent key={i} blur duration={600} delay={i * 150}>
                  <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-colors h-full">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </FadeContent>
              ))}
            </div>
          </section>

          <section className="max-w-6xl mx-auto px-6 pb-32">
            <FadeContent blur duration={600}>
              <div className="rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-white/10 p-12 sm:p-16 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                  Ready to start?
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  Create your first circle in under 2 minutes. No wallet, no gas
                  fees, just login with Google.
                </p>
                <Button size="lg" className="h-12 px-8 text-base" asChild>
                  <Link href="/login">
                    Launch App
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </FadeContent>
          </section>
        </main>

        <footer className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Built for Indonesia 🇮🇩
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <Link
                  href="/docs"
                  className="hover:text-foreground transition-colors"
                >
                  Docs
                </Link>
                <Link
                  href="https://github.com"
                  className="hover:text-foreground transition-colors"
                >
                  GitHub
                </Link>
                <Link
                  href="https://twitter.com"
                  className="hover:text-foreground transition-colors"
                >
                  Twitter
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
