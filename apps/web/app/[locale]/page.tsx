"use client";

import { Button } from "@/components/ui/button";
import { useActiveAccount } from "thirdweb/react";
import Image from "next/image";
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
import GradientText from "@/components/GradientText";
import FadeContent from "@/components/FadeContent";
import BlurText from "@/components/BlurText";
import Particles from "@/components/Particles";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

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
  const t = useTranslations("landing");
  const tc = useTranslations("common");

  const stats = [
    { value: "Rp 2.5B+", label: t("stats.protectedVolume"), icon: Shield },
    { value: "1,234", label: t("stats.activeCircles"), icon: Users },
    { value: "0%", label: t("stats.defaultRate"), icon: BadgeCheck },
    { value: "1.5%", label: t("stats.platformFee"), icon: Coins },
  ];

  const features = [
    {
      icon: Shield,
      title: t("features.items.securityDeposit.title"),
      desc: t("features.items.securityDeposit.desc"),
      highlight: t("features.items.securityDeposit.highlight"),
    },
    {
      icon: Users,
      title: t("features.items.socialVouching.title"),
      desc: t("features.items.socialVouching.desc"),
      highlight: t("features.items.socialVouching.highlight"),
    },
    { 
      icon: Zap,
      title: t("features.items.gasless.title"),
      desc: t("features.items.gasless.desc"),
      highlight: t("features.items.gasless.highlight"),
    },
    {
      icon: FileText,
      title: t("features.items.debtNft.title"),
      desc: t("features.items.debtNft.desc"),
      highlight: t("features.items.debtNft.highlight"),
    },
    {
      icon: BadgeCheck,
      title: t("features.items.reputation.title"),
      desc: t("features.items.reputation.desc"),
      highlight: t("features.items.reputation.highlight"),
    },
    {
      icon: Coins,
      title: t("features.items.transparentFees.title"),
      desc: t("features.items.transparentFees.desc"),
      highlight: t("features.items.transparentFees.highlight"),
    },
  ];

  const howItWorks = [
    {
      step: t("howItWorks.steps.step1.num"),
      title: t("howItWorks.steps.step1.title"),
      desc: t("howItWorks.steps.step1.desc"),
      icon: Users,
    },
    {
      step: t("howItWorks.steps.step2.num"),
      title: t("howItWorks.steps.step2.title"),
      desc: t("howItWorks.steps.step2.desc"),
      icon: Lock,
    },
    {
      step: t("howItWorks.steps.step3.num"),
      title: t("howItWorks.steps.step3.title"),
      desc: t("howItWorks.steps.step3.desc"),
      icon: Wallet,
    },
    {
      step: t("howItWorks.steps.step4.num"),
      title: t("howItWorks.steps.step4.title"),
      desc: t("howItWorks.steps.step4.desc"),
      icon: Trophy,
    },
    {
      step: t("howItWorks.steps.step5.num"),
      title: t("howItWorks.steps.step5.title"),
      desc: t("howItWorks.steps.step5.desc"),
      icon: ArrowDownCircle,
    },
  ];

  const comparison = [
    { feature: t("comparison.items.scamProtection"), traditional: false, arisanaman: true },
    { feature: t("comparison.items.transparentRecords"), traditional: false, arisanaman: true },
    { feature: t("comparison.items.defaultAccountability"), traditional: false, arisanaman: true },
    { feature: t("comparison.items.creditHistory"), traditional: false, arisanaman: true },
    { feature: t("comparison.items.noSetupFee"), traditional: true, arisanaman: true },
    { feature: t("comparison.items.communityTrust"), traditional: true, arisanaman: true },
  ];

  const faqs = [
    { q: t("faq.items.q1.q"), a: t("faq.items.q1.a") },
    { q: t("faq.items.q2.q"), a: t("faq.items.q2.a") },
    { q: t("faq.items.q3.q"), a: t("faq.items.q3.a") },
    { q: t("faq.items.q4.q"), a: t("faq.items.q4.a") },
    { q: t("faq.items.q5.q"), a: t("faq.items.q5.a") },
    { q: t("faq.items.q6.q"), a: t("faq.items.q6.a") },
    { q: t("faq.items.q7.q"), a: t("faq.items.q7.a") },
    { q: t("faq.items.q8.q"), a: t("faq.items.q8.a") },
  ];

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
          className=""
        />
      </div>
      <header className="border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <Image src="/KelasRutin.jpeg" alt="ArisanAman" width={140} height={90} />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">{tc("features")}</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">{tc("howItWorks")}</a>
            <a href="#security" className="text-muted-foreground hover:text-foreground transition-colors">{tc("security")}</a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">{tc("faq")}</a>
            <Link href="/waitlist" className="text-primary hover:text-primary/80 transition-colors font-medium">{tc("waitingList")}</Link>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <Button asChild size="sm">
                <Link href="/dashboard">{tc("openApp")}</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                  <Link href="/login">{tc("login")}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/login">{tc("getStarted")}</Link>
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
                  {t("badge")}
                </div>
              </FadeContent>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
                <BlurText
                  text={t("heroLine1")}
                  className="block mb-2"
                  delay={50}
                  animateBy="words"
                  direction="top"
                />
                <GradientText
                  colors={["#22c55e", "#10b981", "#22c55e"]}
                  animationSpeed={6}
                  className="mx-0 text-4xl sm:text-5xl lg:text-7xl font-bold align-start"
                >{t("heroLine2")}
                </GradientText>
              </h1>

              <FadeContent blur duration={800} delay={300}>
                <p className="text-lg sm:text-xl max-w-xl mb-4 leading-relaxed font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-green-600">
                  {t("heroDesc")}
                </p>
              </FadeContent>

              <FadeContent blur duration={800} delay={400}>
                <div className="flex flex-wrap gap-4 text-sm mb-12">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-green-600">
                      {t("checkSecurity")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-green-600">
                      {t("checkReputation")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-400 to-green-600">
                      {t("checkNoCrypto")}
                    </span>
                  </div>
                </div>
              </FadeContent>

              <FadeContent blur duration={800} delay={500}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="h-12 px-8 text-base" asChild>
                    <Link href="/login">
                      {t("startCircle")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-8 text-base"
                    asChild
                  >
                    <a href="#how-it-works">{t("seeHowItWorks")}</a>
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
                {t("problem.badge")}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                {t("problem.title")} <span className="text-red-400">{t("problem.titleHighlight")}</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("problem.desc")}
              </p>
            </div>
          </FadeContent>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <FadeContent blur duration={600} delay={100}>
              <div className="p-8 rounded-2xl bg-red-500/5 border border-red-500/20">
                <h3 className="text-xl font-semibold mb-6 text-red-400">{t("problem.traditional")}</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{t("problem.traditionalItems.runAway")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{t("problem.traditionalItems.noCollateral")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{t("problem.traditionalItems.noRecord")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{t("problem.traditionalItems.trustOnly")}</span>
                  </li>
                </ul>
              </div>
            </FadeContent>

            <FadeContent blur duration={600} delay={200}>
              <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20">
                <h3 className="text-xl font-semibold mb-6 text-primary">{t("problem.arisanaman")}</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{t("problem.arisanamanItems.depositLock")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{t("problem.arisanamanItems.loseDeposit")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{t("problem.arisanamanItems.onChainRep")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{t("problem.arisanamanItems.smartContract")}</span>
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
                  {t("howItWorks.title")}
                </h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                  {t("howItWorks.desc")}
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
                {t("features.title")}
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                {t("features.desc")}
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
                    {t("security.badge")}
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                    {t("security.title")}
                  </h2>
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    {t("security.desc")}
                  </p>

                  <div className="space-y-4">
                    {[
                      { title: t("security.layers.layer1.title"), desc: t("security.layers.layer1.desc") },
                      { title: t("security.layers.layer2.title"), desc: t("security.layers.layer2.desc") },
                      { title: t("security.layers.layer3.title"), desc: t("security.layers.layer3.desc") },
                      { title: t("security.layers.layer4.title"), desc: t("security.layers.layer4.desc") },
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
                  <h3 className="text-xl font-semibold mb-6">{t("security.defaultTitle")}</h3>
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">1</div>
                      <p className="text-muted-foreground">{t("security.defaultSteps.step1")}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">2</div>
                      <p className="text-muted-foreground">{t("security.defaultSteps.step2")}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">3</div>
                      <p className="text-muted-foreground">{t("security.defaultSteps.step3")}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">4</div>
                      <p className="text-muted-foreground">{t("security.defaultSteps.step4")}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-xs font-bold shrink-0">!</div>
                      <p className="text-muted-foreground">{t("security.defaultSteps.step5")}</p>
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
                {t("comparison.title")}
              </h2>
            </div>
          </FadeContent>

          <FadeContent blur duration={600} delay={100}>
            <div className="max-w-2xl mx-auto">
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <div className="grid grid-cols-3 bg-white/5 p-4 text-sm font-medium">
                  <div>{t("comparison.feature")}</div>
                  <div className="text-center text-red-400">{t("comparison.traditional")}</div>
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
                  {t("faq.title")}
                </h2>
                <p className="text-muted-foreground">
                  {t("faq.desc")}
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
                  {t("cta.title")}
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  {t("cta.desc")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="h-12 px-8 text-base" asChild>
                    <Link href="/login">
                      {tc("launchApp")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base" asChild>
                    <a href="https://github.com/Howters/ArisanOnChain" target="_blank">
                      {tc("viewOnGitHub")}
                    </a>
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
                {t("footer.brand")}<span className="text-primary">{t("footer.brandHighlight")}</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-sm">
                {t("footer.desc")}
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">{t("footer.product")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">{tc("features")}</a></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">{tc("howItWorks")}</a></li>
                <li><a href="#security" className="hover:text-foreground transition-colors">{tc("security")}</a></li>
                <li><a href="#faq" className="hover:text-foreground transition-colors">{tc("faq")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">{t("footer.links")}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="https://github.com/Howters/ArisanOnChain" className="hover:text-foreground transition-colors">GitHub</a></li>
                <li><a href="https://lisk.com" className="hover:text-foreground transition-colors">Lisk L2</a></li>
                <li><a href="https://sepolia-blockscout.lisk.com" className="hover:text-foreground transition-colors">Block Explorer</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              {t("footer.builtFor")}
            </div>
            <div className="text-sm text-muted-foreground">
              {t("footer.contracts")}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


