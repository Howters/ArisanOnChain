"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <Button 
      variant="ghost" 
      size="sm"
      className="h-8 px-2 text-xs gap-1"
      onClick={() => switchLocale(locale === "id" ? "en" : "id")}
    >
      <Globe className="h-3.5 w-3.5" />
      {locale === "id" ? "EN" : "ID"}
    </Button>
  );
}



