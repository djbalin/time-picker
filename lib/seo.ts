import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { type AppLocale, routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site-url";

const OG_LOCALES: Record<AppLocale, string> = { en: "en_US", da: "da_DK" };

/** `path` as it appears in `locale`'s URL: unprefixed for English, `/da…` for Danish. */
export function localizedPath(locale: AppLocale, path: string): string {
  return getPathname({ href: path, locale });
}

export function absoluteUrl(locale: AppLocale, path: string): string {
  return new URL(localizedPath(locale, path), SITE_URL).toString();
}

/**
 * The link-preview image from app/[locale]/opengraph-image.tsx. Next only adds
 * it on its own to pages that don't set `openGraph`, so pages that do must
 * list it. The path is excluded from the locale proxy (proxy.ts), or the
 * English one would redirect.
 */
export function ogImage(locale: AppLocale, alt: string) {
  return { url: `/${locale}/opengraph-image`, width: 1200, height: 630, alt };
}

/**
 * Metadata for a page search engines should index: its own canonical URL and
 * hreflang links to the same page in every language, plus the link-preview
 * tags. Set per page, never in the layout, or every page would inherit the
 * homepage's canonical and translations.
 *
 * The title is absolute because the layout's `%s · brand` template doesn't
 * apply to the homepage (same route segment as the layout). `openGraph` is
 * rebuilt in full because metadata merges shallowly: a page that sets any
 * `openGraph` field replaces the layout's object wholesale.
 */
export function indexableMetadata({
  locale,
  path,
  siteName,
  title,
  description,
}: {
  locale: AppLocale;
  path: string;
  siteName: string;
  title: string;
  description: string;
}): Metadata {
  const url = localizedPath(locale, path);
  const image = ogImage(locale, siteName);
  return {
    title: { absolute: `${title} · ${siteName}` },
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(
          routing.locales.map((l) => [l, localizedPath(l, path)]),
        ),
        "x-default": localizedPath(routing.defaultLocale, path),
      },
    },
    openGraph: {
      type: "website",
      siteName,
      url,
      locale: OG_LOCALES[locale],
      title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

/** For pages that must stay out of search results: private polls, lookups. */
export const NOINDEX: Metadata["robots"] = { index: false };
