"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABELS: Record<string, string> = { en: "EN", da: "DA" };

/**
 * Swaps locale while staying on the same page — `usePathname`/`Link` here are
 * next-intl's locale-aware versions, so passing `locale` renders the href
 * with the right prefix (or none, for the default locale) automatically.
 */
export function LanguageSwitcher() {
  const pathname = usePathname();
  const activeLocale = useLocale();
  const t = useTranslations("LanguageSwitcher");

  return (
    <nav
      aria-label={t("label")}
      className="inline-flex overflow-hidden rounded-full border border-line text-xs font-extrabold"
    >
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          aria-current={locale === activeLocale ? "true" : undefined}
          className={`px-2.5 py-1 transition ${
            locale === activeLocale
              ? "bg-ink text-paper"
              : "text-slate hover:bg-cloud"
          }`}
        >
          {LABELS[locale]}
        </Link>
      ))}
    </nav>
  );
}
