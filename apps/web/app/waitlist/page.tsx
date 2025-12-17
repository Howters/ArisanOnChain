"use client";

import { useState, useEffect } from "react";
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
  Loader2,
  MapPin,
  Mail,
  Phone,
  User,
  MessageSquare
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

interface WaitlistStats {
  total: number;
  byRole: { admin: number; member: number };
  recentSignups: number;
}

export default function WaitlistPage() {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    whatsapp: "",
    kota: "",
    peran: "",
    ukuranGrup: "",
    alasan: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<WaitlistStats | null>(null);

  useEffect(() => {
    fetch("/api/waitlist")
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        if (data && typeof data.total === "number") {
          setStats(data);
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan");
        return;
      }
      
      setIsSubmitted(true);
    } catch {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialProof = [
    { value: stats?.total ? `${stats.total}+` : "500+", label: "Orang sudah daftar" },
    { value: stats?.byRole?.admin ? `${stats.byRole.admin}+` : "50+", label: "Admin grup menunggu" },
    { value: stats?.recentSignups ? `${stats.recentSignups}+` : "20+", label: "Daftar minggu ini" },
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
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
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 max-w-md w-full text-center p-8 rounded-2xl bg-white/5 border border-primary/40 backdrop-blur-sm"
        >
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Terima Kasih! 🎉</h1>
          <p className="text-muted-foreground mb-6">
            Kamu sudah terdaftar di waiting list ArisanAman. 
            Kami akan menghubungi kamu melalui WhatsApp atau email saat platform siap diluncurkan.
          </p>
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 mb-6">
            <p className="text-sm">
              <strong className="text-primary">Tips:</strong> Share halaman ini ke teman-teman arisan kamu!
            </p>
          </div>
          <Button asChild>
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

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

        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <FadeContent blur duration={600} delay={200}>
              <div className="p-8 rounded-2xl bg-white/5 border border-primary/40 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">Daftar Waiting List</h2>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      required
                      placeholder="Masukkan nama lengkap"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-primary/40 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="contoh@email.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-primary/40 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      Nomor WhatsApp
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      required
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-primary/40 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      Kota Domisili
                    </label>
                    <input
                      type="text"
                      name="kota"
                      value={formData.kota}
                      onChange={handleChange}
                      required
                      placeholder="Jakarta, Bandung, Surabaya, dll"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-primary/40 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      Peran di Arisan
                    </label>
                    <select
                      name="peran"
                      value={formData.peran}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-primary/40 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                    >
                      <option value="" className="bg-background">Pilih peran</option>
                      <option value="Admin/Ketua Arisan" className="bg-background">Admin/Ketua Arisan</option>
                      <option value="Anggota" className="bg-background">Anggota</option>
                      <option value="Keduanya" className="bg-background">Keduanya (Admin & Anggota)</option>
                    </select>
                  </div>

                  {(formData.peran === "Admin/Ketua Arisan" || formData.peran === "Keduanya") && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        Ukuran Grup Arisan
                      </label>
                      <select
                        name="ukuranGrup"
                        value={formData.ukuranGrup}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-primary/40 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                      >
                        <option value="" className="bg-background">Pilih ukuran</option>
                        <option value="5-10 orang" className="bg-background">5-10 orang</option>
                        <option value="11-20 orang" className="bg-background">11-20 orang</option>
                        <option value="21-50 orang" className="bg-background">21-50 orang</option>
                        <option value="50+ orang" className="bg-background">50+ orang</option>
                      </select>
                    </motion.div>
                  )}

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium mb-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      Apa yang kamu harapkan dari ArisanAman? (opsional)
                    </label>
                    <textarea
                      name="alasan"
                      value={formData.alasan}
                      onChange={handleChange}
                      placeholder="Ceritakan pengalaman arisanmu atau fitur yang kamu inginkan..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-primary/40 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50 resize-none"
                    />
                  </div>

                  <Button 
                    type="submit"
                    size="lg" 
                    className="w-full h-14 text-base"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Mendaftarkan...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Daftar Sekarang
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Data kamu aman dan tidak akan dibagikan ke pihak ketiga.
                  </p>
                </form>
              </div>
            </FadeContent>

            <div className="space-y-6">
              <FadeContent blur duration={600} delay={300}>
                <h2 className="text-2xl font-bold mb-6">
                  Keuntungan Early Adopter 🚀
                </h2>
              </FadeContent>

              {benefits.map((benefit, i) => (
                <FadeContent key={i} blur duration={600} delay={400 + i * 100}>
                  <div className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-primary/40 hover:bg-white/[0.08] transition-all">
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

              <FadeContent blur duration={600} delay={900}>
                <div className="p-5 rounded-xl bg-white/5 border border-primary/40">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong className="text-foreground">Tips:</strong> Share halaman ini ke teman-teman arisan kamu agar bisa dapat akses bareng saat launch!
                  </p>
                </div>
              </FadeContent>
            </div>
          </div>
        </section>

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
                      className="p-5 rounded-xl bg-white/5 border border-primary/40"
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
      </main>

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
