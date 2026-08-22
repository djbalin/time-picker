import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Only the marketing/entry pages are listed — individual polls are private,
 * unguessable-slug links meant for the people they're shared with, not for
 * search engines to crawl and index.
 */
const PUBLIC_PATHS = ["", "/polls", "/polls/create"];

function localizedPath(locale: string, path: string): string {
  // Mirrors the `localePrefix: "as-needed"` routing config: English stays
  // unprefixed, Danish gets `/da`.
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${SITE_URL}${prefix}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({
    url: localizedPath(routing.defaultLocale, path),
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, localizedPath(locale, path)]),
      ),
    },
  }));
}
