"use client";

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
  X,
  History,
  HelpCircle,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const t = useTranslations("sidebar");
  const pathname = usePathname();

  const navigation = [
    { name: t("dashboard"), href: "/dashboard", icon: LayoutDashboard, exact: true },
    { name: t("arisan"), href: "/circles", icon: CircleDot, exact: false },
    { name: t("history"), href: "/history", icon: History, exact: false },
    { name: t("faq"), href: "/faq", icon: HelpCircle, exact: false },
    { name: t("profile"), href: "/profile", icon: User, exact: true },
    { name: t("settings"), href: "/settings", icon: Settings, exact: false },
  ];

  const isActiveLink = (item: typeof navigation[0]) => {
    const cleanPath = pathname.replace(/^\/(id|en)/, "");
    if (item.exact) {
      return cleanPath === item.href;
    }
    return cleanPath === item.href || cleanPath.startsWith(item.href + "/");
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
  width={140} 
  height={90} 
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
                  {t("createNew")}
                </Link>
              </Button>
            </div>

            <nav className="space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = isActiveLink(item);
                return (
                  <Link
                    key={item.href}
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
                {t("poweredBy")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("secureNote")}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
