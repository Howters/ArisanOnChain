"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useActiveAccount } from "thirdweb/react";
import { 
  ArrowRight, 
  Shield, 
  Users, 
  Zap, 
  ChevronDown,
  Lock,
  Coins,
  BadgeCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wallet,
  FileText,
  Trophy,
  ArrowDownCircle
} from "lucide-react";
import Aurora from "@/components/Aurora";
import GradientText from "@/components/GradientText";
import FadeContent from "@/components/FadeContent";
import BlurText from "@/components/BlurText";
import DarkVeil from "@/components/DarkVeil";
import Particles from "@/components/Particles";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const stats = [
  { value: "Rp 2.5B+", label: "Protected Volume", icon: Shield },
  { value: "1,234", label: "Active Circles", icon: Users },
  { value: "0%", label: "Default Rate", icon: BadgeCheck },
  { value: "1.5%", label: "Platform Fee Only", icon: Coins },
];

const features = [
  {
    icon: Shield,
    title: "Security Deposit System",
    desc: "Every member locks collateral before joining. Defaulters lose their deposit, protecting other members.",
    highlight: "Anti-scam protection",
  },
  {
    icon: Users,
    title: "Social Vouching",
    desc: "Trusted members can vouch for newcomers by staking their own funds. Creates community accountability.",
    highlight: "Community trust layer",
  },
  { 
    icon: Zap,
    title: "Gasless Experience",
    desc: "No wallet setup, no gas fees. Login with Google and start immediately. Web2 simplicity, Web3 security.",
    highlight: "Zero crypto knowledge needed",
  },
  {
    icon: FileText,
    title: "Debt NFT Records",
    desc: "Defaulters receive a permanent on-chain record. Their reputation follows them across all pools.",
    highlight: "On-chain credit history",
  },
  {
    icon: BadgeCheck,
    title: "Reputation System",
    desc: "Build your on-chain credit score. Completed pools and zero defaults unlock premium features.",
    highlight: "Trustless credit scoring",
  },
  {
    icon: Coins,
    title: "Transparent Fees",
    desc: "Only 1.5% fee on winning payout. No hidden charges. Pool creation, joining, and withdrawals are FREE.",
    highlight: "Fair & transparent",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Create or Join Circle",
    desc: "Admin creates a pool with contribution amount, security deposit, and member limit. Others request to join.",
    icon: Users,
  },
  {
    step: "02",
    title: "Lock Security Deposit",
    desc: "Each approved member locks their security deposit. This protects the pool from defaulters.",
    icon: Lock,
  },
  {
    step: "03",
    title: "Monthly Contributions",
    desc: "Every month, all members contribute. 7-day grace period ensures everyone has time to pay.",
    icon: Wallet,
  },
  {
    step: "04",
    title: "Winner Takes Pool",
    desc: "Admin determines the winner. Winner claims the pooled amount minus 1.5% platform fee.",
    icon: Trophy,
  },
  {
    step: "05",
    title: "Withdraw & Complete",
    desc: "After all rounds, members withdraw their security deposit. Reputation updated on-chain.",
    icon: ArrowDownCircle,
  },
];

const comparison = [
  { feature: "Scam Protection", traditional: false, arisanaman: true },
  { feature: "Transparent Records", traditional: false, arisanaman: true },
  { feature: "Default Accountability", traditional: false, arisanaman: true },
  { feature: "Credit History", traditional: false, arisanaman: true },
  { feature: "No Setup Fee", traditional: true, arisanaman: true },
  { feature: "Community Trust", traditional: true, arisanaman: true },
];

const faqs = [
  {
    q: "What happens if someone doesn't pay?",
    a: "If a member misses their contribution after the 7-day grace period, the admin can report them as defaulted. Their security deposit is liquidated to compensate the pool, and they receive a Debt NFT marking their default on-chain. Any vouches they received are also liquidated.",
  },
  {
    q: "How is the winner determined?",
    a: "The admin triggers winner determination after all members have contributed. An on-chain random selection picks from eligible members (those who haven't won yet). The selection uses block data for randomness and is fully transparent.",
  },
  {
    q: "When can I withdraw my security deposit?",
    a: "Security deposits can only be withdrawn after the pool is completed (all rounds finished) or cancelled (before activation). Active members in completed pools get their full deposit back.",
  },
  {
    q: "What is social vouching?",
    a: "Active members with good reputation (completed pools, zero defaults) can vouch for new joiners by locking their own funds. If the vouchee defaults, the voucher loses their stake. This creates social accountability and helps newcomers join pools.",
  },
  {
    q: "Do I need cryptocurrency knowledge?",
    a: "No! ArisanAman is designed for everyone. Just login with Google, and everything happens behind the scenes. No wallet setup, no gas fees to worry about. It feels like a regular app.",
  },
  {
    q: "What are the fees?",
    a: "Creating pools: FREE. Joining pools: FREE. Monthly contributions: 0% fee. Withdrawals: FREE. The only fee is 1.5% on the winning payout when you claim your prize.",
  },
  {
    q: "What is a Debt NFT?",
    a: "When someone defaults, they receive a non-transferable NFT that permanently records their default on the blockchain. This serves as an on-chain credit record that other pool admins can check before approving members.",
  },
  {
    q: "How many members do I need to start?",
    a: "A minimum of 3 active members (who have locked their security deposit) is required to activate a pool. The maximum is set by the pool creator.",
  },
];

function FAQItem({ q, a, isOpen, onClick }: { q: string; a: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-white/10">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left hover:text-primary transition-colors"
      >
        <span className="font-medium pr-8">{q}</span>
        <ChevronDown className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-muted-foreground leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  const account = useActiveAccount();
  const isAuthenticated = !!account;
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    
    <div className="min-h-screen bg-background">
     <div className="absolute inset-0 z-0">
                <Particles
    particleColors={['#16C47F', '#16C47F']}
    particleCount={200}
    particleSpread={10}
    speed={0.1}
    particleBaseSize={200}
    moveParticlesOnHover={true}
    alphaParticles={false}
    disableRotation={false}
  />
          </div>
      <header className="border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            arisan<span className="text-primary">aman</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="#security" className="text-muted-foreground hover:text-foreground transition-colors">Security</a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button asChild size="sm">
                <Link href="/dashboard">Open App</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
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
        <section className="relative overflow-hidden">
          <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 sm:pt-32 pb-24">
            <div className="max-w-3xl">
              <FadeContent blur duration={600} delay={0}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-muted-foreground mb-8">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Built on Lisk L2 • Gasless Transactions
                </div>
              </FadeContent>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
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
                  className="text-4xl sm:text-5xl lg:text-7xl font-bold"
                >
                  zero scam risk
                </GradientText>
              </h1>

              <FadeContent blur duration={800} delay={300}>
                <p className="text-lg sm:text-xl max-w-xl mb-4 leading-relaxed font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-green-600">
                  The first on-chain ROSCA for Indonesia. Security deposits protect every member. 
                  Defaulters are penalized. Your savings are safe.
                </p>
              </FadeContent>

              <FadeContent blur duration={800} delay={400}>
                <div className="flex flex-wrap gap-4 text-sm mb-12">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-green-600">
                      Security deposits required
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-green-600">
                      On-chain reputation
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-green-600">
                      No crypto knowledge needed
                    </span>
                  </div>
                </div>
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
                    <Link href="#how-it-works">See How It Works</Link>
                  </Button>
                </div>
              </FadeContent>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-black/30 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-6 py-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {stats.map((stat, i) => (
                  <FadeContent key={i} blur duration={600} delay={i * 100}>
                    <div className="text-center p-4">
                      <stat.icon className="w-6 h-6 text-primary mx-auto mb-3" />
                      <div className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  </FadeContent>
                ))}
              </div>
            </div>
          </section>

          <section id="problem" className="max-w-6xl mx-auto px-6 py-24">
            <FadeContent blur duration={600}>
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
                  <AlertTriangle className="w-4 h-4" />
                  The Problem
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                  Traditional arisan is <span className="text-red-400">risky</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Billions of rupiah circulate in informal arisan groups every year. 
                  When trust breaks, everyone loses.
                </p>
              </div>
            </FadeContent>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <FadeContent blur duration={600} delay={100}>
                <div className="p-8 rounded-2xl bg-red-500/5 border border-red-500/20">
                  <h3 className="text-xl font-semibold mb-6 text-red-400">Traditional Arisan</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Members can run away after receiving pot</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">No collateral or security deposit</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">No record of past defaults</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Relies purely on personal trust</span>
                    </li>
                  </ul>
                </div>
              </FadeContent>

              <FadeContent blur duration={600} delay={200}>
                <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20">
                  <h3 className="text-xl font-semibold mb-6 text-primary">ArisanAman</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Security deposit locks prevent runaways</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Defaulters lose deposit + get Debt NFT</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">On-chain reputation follows forever</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Smart contract enforced rules</span>
                    </li>
                  </ul>
                </div>
              </FadeContent>
            </div>
          </section>

          <section id="how-it-works" className="bg-black/20 backdrop-blur-sm border-y border-white/10">
            <div className="max-w-6xl mx-auto px-6 py-24">
              <FadeContent blur duration={600}>
                <div className="text-center mb-16">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                    How it works
                  </h2>
                  <p className="text-muted-foreground max-w-lg mx-auto">
                    Simple 5-step process. Everything happens on-chain, transparently.
                  </p>
                </div>
              </FadeContent>

              <div className="relative">
                <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-y-1/2" />
                
                <div className="grid md:grid-cols-5 gap-8">
                  {howItWorks.map((item, i) => (
                    <FadeContent key={i} blur duration={600} delay={i * 100}>
                      <div className="relative text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 relative z-10">
                          <item.icon className="w-7 h-7 text-primary" />
                        </div>
                        <div className="text-xs text-primary font-mono mb-2">{item.step}</div>
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </FadeContent>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="max-w-6xl mx-auto px-6 py-24">
            <FadeContent blur duration={600}>
              <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                  Built for safety
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  Multiple layers of protection ensure your arisan is secure and fair.
                </p>
              </div>
            </FadeContent>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <FadeContent key={i} blur duration={600} delay={i * 100}>
                  <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-primary/30 transition-all duration-300 h-full">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-xs text-primary font-medium mb-1">{feature.highlight}</div>
                        <h3 className="font-semibold mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                </FadeContent>
              ))}
            </div>
          </section>

          <section id="security" className="bg-black/20 backdrop-blur-sm border-y border-white/10">
            <div className="max-w-6xl mx-auto px-6 py-24">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <FadeContent blur duration={600}>
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-4">
                      <Shield className="w-4 h-4" />
                      Security Architecture
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                      4 layers of protection
                    </h2>
                    <p className="text-muted-foreground mb-8 leading-relaxed">
                      We don't just rely on trust. Every member is protected by multiple security mechanisms 
                      enforced by smart contracts on the blockchain.
                    </p>

                    <div className="space-y-4">
                      {[
                        { title: "Security Deposit", desc: "Collateral locked before participation" },
                        { title: "Social Vouching", desc: "Community members stake for newcomers" },
                        { title: "Debt NFT", desc: "Permanent record of defaults" },
                        { title: "Reputation Score", desc: "On-chain credit history" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                            {i + 1}
                          </div>
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-muted-foreground">{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeContent>

                <FadeContent blur duration={600} delay={200}>
                  <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
                    <h3 className="text-xl font-semibold mb-6">What happens when someone defaults?</h3>
                    <div className="space-y-4 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">1</div>
                        <p className="text-muted-foreground">Admin reports the default after 7-day grace period</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">2</div>
                        <p className="text-muted-foreground">Security deposit is automatically liquidated</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">3</div>
                        <p className="text-muted-foreground">Any vouches received are also liquidated</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">4</div>
                        <p className="text-muted-foreground">Recovered funds compensate the pool</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xs font-bold shrink-0">!</div>
                        <p className="text-muted-foreground">Defaulter receives Debt NFT (permanent record)</p>
                      </div>
                    </div>
                  </div>
                </FadeContent>
              </div>
            </div>
          </section>

          <section id="comparison" className="max-w-6xl mx-auto px-6 py-24">
            <FadeContent blur duration={600}>
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                  Traditional vs ArisanAman
                </h2>
              </div>
            </FadeContent>

            <FadeContent blur duration={600} delay={100}>
              <div className="max-w-2xl mx-auto">
                <div className="rounded-2xl border border-white/10 overflow-hidden">
                  <div className="grid grid-cols-3 bg-white/5 p-4 text-sm font-medium">
                    <div>Feature</div>
                    <div className="text-center text-red-400">Traditional</div>
                    <div className="text-center text-primary">ArisanAman</div>
                  </div>
                  {comparison.map((item, i) => (
                    <div key={i} className="grid grid-cols-3 p-4 border-t border-white/10 text-sm">
                      <div className="text-muted-foreground">{item.feature}</div>
                      <div className="text-center">
                        {item.traditional ? (
                          <CheckCircle2 className="w-5 h-5 text-muted-foreground mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                        )}
                      </div>
                      <div className="text-center">
                        {item.arisanaman ? (
                          <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 mx-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeContent>
          </section>

          <section id="faq" className="bg-black/20 backdrop-blur-sm border-y border-white/10">
            <div className="max-w-3xl mx-auto px-6 py-24">
              <FadeContent blur duration={600}>
                <div className="text-center mb-12">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                    Frequently asked questions
                  </h2>
                  <p className="text-muted-foreground">
                    Everything you need to know about ArisanAman
                  </p>
                </div>
              </FadeContent>

              <FadeContent blur duration={600} delay={100}>
                <div>
                  {faqs.map((faq, i) => (
                    <FAQItem
                      key={i}
                      q={faq.q}
                      a={faq.a}
                      isOpen={openFaq === i}
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    />
                  ))}
                </div>
              </FadeContent>
            </div>
          </section>

          <section className="max-w-6xl mx-auto px-6 py-24">
            <FadeContent blur duration={600}>
              <div className="rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 p-8 sm:p-16 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(34,197,94,0.1),transparent_70%)]" />
                <div className="relative">
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                    Ready to start your safe arisan?
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto mb-8">
                    Create your first circle in under 2 minutes. No wallet setup, no gas fees. 
                    Just login with Google and invite your community.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="h-12 px-8 text-base" asChild>
                      <Link href="/login">
                        Launch App
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
                      <Link href="https://github.com/Howters/ArisanOnChain" target="_blank">
                        View on GitHub
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </FadeContent>
          </section>
        </main>

        <footer className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2">
                <Link href="/" className="text-xl font-bold tracking-tight mb-4 block">
                  arisan<span className="text-primary">aman</span>
                </Link>
                <p className="text-sm text-muted-foreground max-w-sm">
                  The first on-chain ROSCA for Indonesia. Bringing trust to traditional community savings through blockchain technology.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                  <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a></li>
                  <li><a href="#security" className="hover:text-foreground transition-colors">Security</a></li>
                  <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-4">Links</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="https://github.com/Howters/ArisanOnChain" className="hover:text-foreground transition-colors">GitHub</Link></li>
                  <li><Link href="https://lisk.com" className="hover:text-foreground transition-colors">Lisk L2</Link></li>
                  <li><Link href="https://sepolia-blockscout.lisk.com" className="hover:text-foreground transition-colors">Block Explorer</Link></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Built for Indonesia 🇮🇩 • Lisk Hackathon 2024
              </div>
              <div className="text-sm text-muted-foreground">
                Smart contracts on Lisk Sepolia
              </div>
            </div>
          </div>
        </footer>
    </div>
  );
}
