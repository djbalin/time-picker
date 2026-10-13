"use client";

import { useLocale, useTranslations } from "next-intl";
import type { ComponentType } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// Flags are inline SVG, not emoji: Windows renders flag emoji as plain
// letters ("DK", "GB").
const LANGUAGES: Record<string, { name: string; Flag: ComponentType }> = {
  en: { name: "English", Flag: FlagGB },
  da: { name: "Dansk", Flag: FlagDK },
};

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
    <nav aria-label={t("label")} className="inline-flex items-center gap-1.5">
      {routing.locales.map((locale) => {
        const { name, Flag } = LANGUAGES[locale];
        const active = locale === activeLocale;
        return (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            aria-current={active ? "true" : undefined}
            aria-label={name}
            title={name}
            className={`block overflow-hidden rounded-[4px] transition-opacity ${
              active
                ? "opacity-100 ring-2 ring-white shadow-rest"
                : "opacity-45 hover:opacity-100"
            }`}
          >
            <Flag />
          </Link>
        );
      })}
    </nav>
  );
}

function FlagDK() {
  return (
    <svg
      viewBox="0 0 37 28"
      width="22"
      height="16"
      aria-hidden="true"
      className="block"
    >
      <rect width="37" height="28" fill="#C8102E" />
      <rect x="12" width="4" height="28" fill="#fff" />
      <rect y="12" width="37" height="4" fill="#fff" />
    </svg>
  );
}

function FlagGB() {
  return (
    <svg
      viewBox="0 0 60 30"
      width="22"
      height="16"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="block"
    >
      <clipPath id="flag-gb-diagonals">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path
        d="M0,0 L60,30 M60,0 L0,30"
        clipPath="url(#flag-gb-diagonals)"
        stroke="#C8102E"
        strokeWidth="4"
      />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}
