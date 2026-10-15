import { defineRouting } from "next-intl/routing";

/**
 * English stays unprefixed ("as-needed") so every URL that already existed
 * keeps working and keeps its SEO value — only Danish gets a `/da` prefix.
 */
export const routing = defineRouting({
  locales: ["en", "da"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  // next-intl would otherwise send hreflang `Link` headers for every path,
  // noindex polls included. The per-page tags from `indexableMetadata`
  // (lib/seo.ts) are the single source of truth instead.
  alternateLinks: false,
});

export type AppLocale = (typeof routing.locales)[number];

/** This next-intl version doesn't export a `hasLocale` helper, so: */
export function isAppLocale(value: string | undefined): value is AppLocale {
  return (routing.locales as readonly string[]).includes(value ?? "");
}

/** The `[locale]` param as a known locale. Invalid ones 404 in the layout. */
export function toAppLocale(value: string): AppLocale {
  return isAppLocale(value) ? value : routing.defaultLocale;
}
