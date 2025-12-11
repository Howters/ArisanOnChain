"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Users, 
  CheckCircle2,
  Sparkles,
  Gift,
  Bell,
  Shield,
  ExternalLink
} from "lucide-react";
import Particles from "@/components/Particles";
import GradientText from "@/components/GradientText";
import FadeContent from "@/components/FadeContent";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: Gift,
    title: "Akses Awal Eksklusif",
    desc: "Jadilah yang pertama mencoba ArisanAman sebelum publik",
  },
  {
    icon: Shield,
    title: "Zero Platform Fee",
    desc: "Gratis biaya platform selama 3 bulan pertama untuk early adopters",
  },
  {
    icon: Bell,
    title: "Update Langsung",
    desc: "Notifikasi langsung saat fitur baru diluncurkan",
  },
  {
    icon: Users,
    title: "Komunitas Prioritas",
    desc: "Bergabung dengan grup WhatsApp eksklusif early adopters",
  },
];

const socialProof = [
  { value: "500+", label: "Orang sudah daftar" },
  { value: "50+", label: "Grup arisan menunggu" },
  { value: "Rp 2M+", label: "Potensi volume" },
];

// TODO: Replace with your Google Forms link
const GOOGLE_FORMS_URL = "https://forms.gle/K8Umay6HJdbpkrqg8";

export default function WaitlistPage() {
  const handleJoinWaitlist = () => {
    window.open(GOOGLE_FORMS_URL, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={['#16C47F', '#16C47F']}
          particleCount={150}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={200}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
          className=""
        />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <Image src="/KelasRutin.jpeg" alt="ArisanAman" width={140} height={90} />
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">← Beranda</Link>
          </Button>
        </nav>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-12">
          <FadeContent blur duration={600}>
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
                <Sparkles className="w-4 h-4" />
                Segera Hadir
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                Gabung{" "}
                <GradientText
                  colors={["#22c55e", "#10b981", "#22c55e"]}
                  animationSpeed={6}
                  className="text-4xl sm:text-5xl font-bold"
                >
                  Waiting List
                </GradientText>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                ArisanAman sedang dalam tahap pengembangan. Daftarkan dirimu sekarang 
                untuk jadi yang <strong className="text-foreground">pertama</strong> mencoba 
                platform arisan on-chain pertama di Indonesia.
              </p>
            </div>
          </FadeContent>

          {/* Social Proof */}
          <FadeContent blur duration={600} delay={100}>
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              {socialProof.map((item, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-bold text-primary">{item.value}</div>
                  <div className="text-sm text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
          </FadeContent>
        </section>

        {/* Main Content */}
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* CTA Card */}
            <FadeContent blur duration={600} delay={200}>
              <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-primary" />
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-4">Daftar Waiting List</h2>
                  
                  <p className="text-muted-foreground mb-8 leading-relaxed">
                    Isi formulir singkat untuk bergabung dengan waiting list ArisanAman. 
                    Kami akan menghubungi kamu melalui WhatsApp atau email saat platform siap diluncurkan.
                  </p>

                  <div className="space-y-4">
                    <Button 
                      size="lg" 
                      className="w-full h-14 text-base"
                      onClick={handleJoinWaitlist}
                    >
                      <span className="flex items-center gap-2">
                        Daftar Sekarang
                        <ExternalLink className="w-4 h-4" />
                      </span>
                    </Button>

                    <p className="text-xs text-muted-foreground">
                      Kamu akan diarahkan ke Google Forms. Data kamu aman dan tidak akan dibagikan ke pihak ketiga.
                    </p>
                  </div>

                  {/* What we'll ask */}
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <h3 className="text-sm font-medium mb-4 text-left">Yang akan kami tanyakan:</h3>
                    <div className="grid grid-cols-2 gap-3 text-left">
                      {[
                        "Nama lengkap",
                        "Email",
                        "Nomor WhatsApp",
                        "Kota domisili",
                        "Peran (Admin/Anggota)",
                        "Ukuran grup arisan",
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </FadeContent>

            {/* Benefits */}
            <div className="space-y-6">
              <FadeContent blur duration={600} delay={300}>
                <h2 className="text-2xl font-bold mb-6">
                  Keuntungan Early Adopter 🚀
                </h2>
              </FadeContent>

              {benefits.map((benefit, i) => (
                <FadeContent key={i} blur duration={600} delay={400 + i * 100}>
                  <div className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                    </div>
                  </div>
                </FadeContent>
              ))}

              <FadeContent blur duration={600} delay={800}>
                <div className="p-6 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20">
                  <h3 className="font-semibold mb-2">🎯 Target Launch: Q1 2026</h3>
                  <p className="text-sm text-muted-foreground">
                    Kami sedang dalam tahap final development. Kamu akan jadi yang pertama 
                    tahu saat ArisanAman siap digunakan.
                  </p>
                </div>
              </FadeContent>

              {/* Share CTA */}
              <FadeContent blur duration={600} delay={900}>
                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong className="text-foreground">Tips:</strong> Share halaman ini ke teman-teman arisan kamu agar bisa dapat akses bareng saat launch!
                  </p>
                </div>
              </FadeContent>
            </div>
          </div>
        </section>

        {/* Problem Reminder */}
        <section className="bg-black/20 backdrop-blur-sm border-y border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <FadeContent blur duration={600}>
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                  Kenapa harus ArisanAman?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Arisan tradisional punya risiko besar: anggota kabur setelah dapat giliran, 
                  tidak ada jaminan, dan tidak ada rekam jejak. ArisanAman hadir untuk menyelesaikan masalah ini.
                </p>
                
                <div className="grid sm:grid-cols-3 gap-6">
                  {[
                    {
                      icon: Shield,
                      title: "Security Deposit",
                      desc: "Setiap anggota wajib menyetorkan jaminan sebelum ikut",
                    },
                    {
                      icon: "📜",
                      title: "On-Chain Record",
                      desc: "Rekam jejak permanen di blockchain, tidak bisa dihapus",
                    },
                    {
                      icon: "⚡",
                      title: "Tanpa Ribet",
                      desc: "Login dengan Google, tanpa perlu setup crypto wallet",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-5 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="text-3xl mb-3">
                        {typeof item.icon === "string" ? item.icon : <item.icon className="w-8 h-8 text-primary mx-auto" />}
                      </div>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeContent>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <FadeContent blur duration={600}>
            <div className="rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 p-8 sm:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(34,197,94,0.1),transparent_70%)]" />
              <div className="relative">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                  Siap jadi bagian dari revolusi arisan?
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  Jangan sampai ketinggalan. Daftar sekarang dan jadilah yang pertama 
                  merasakan arisan yang aman dan transparan.
                </p>
                <Button size="lg" className="h-12 px-8 text-base" onClick={handleJoinWaitlist}>
                  Daftar Waiting List
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </FadeContent>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2024 ArisanAman. Built for Indonesia 🇮🇩</p>
            <Link href="/" className="hover:text-foreground transition-colors">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

