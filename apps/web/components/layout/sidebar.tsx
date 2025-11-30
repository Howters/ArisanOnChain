"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CircleDot,
  User,
  Settings,
  Plus,
  Sparkles,
  X,
  History,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { name: "Arisan", href: "/circles", icon: CircleDot, exact: false },
  { name: "Riwayat", href: "/history", icon: History, exact: false },
  { name: "Profil", href: "/profile/me", icon: User, exact: false },
  { name: "Pengaturan", href: "/settings", icon: Settings, exact: false },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActiveLink = (item: typeof navigation[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r transform transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <Link href="/dashboard" className="flex items-center gap-2">
               <Image 
  src="/KelasRutin.jpeg" 
  alt="ArisanAman" 
  width={100} 
  height={60} 
/>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-4 mb-4">
              <Button asChild className="w-full justify-start" size="lg">
                <Link href="/dashboard/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Arisan Baru
                </Link>
              </Button>
            </div>

            <nav className="space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = isActiveLink(item);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t p-4">
            <div className="rounded-lg bg-primary/10 p-4">
              <p className="text-xs text-muted-foreground mb-2">
                🔐 Powered by Blockchain
              </p>
              <p className="text-xs text-muted-foreground">
                Semua transaksi tercatat di Lisk L2. Aman, transparan, dan tanpa biaya gas.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
