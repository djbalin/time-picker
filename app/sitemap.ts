import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo";

/**
 * Only the indexable pages: the ones that call `indexableMetadata`. Polls are
 * private links and `/polls` is an email lookup; both are `noindex`.
 *
 * No `lastModified`: this file is built on every deploy, so a date here would
 * claim every page changed on every deploy, and Google stops trusting a
 * sitemap's dates once they prove inaccurate. `changeFrequency` and
 * `priority` are ignored by Google, so they're left out too.
 */
const INDEXABLE_PATHS = ["/", "/polls/create", "/doodle-alternative"];

export default function sitemap(): MetadataRoute.Sitemap {
  // Every language version gets its own entry, each listing all versions
  // (itself included): Google's format for multilingual sitemaps.
  return INDEXABLE_PATHS.flatMap((path) => {
    const languages = {
      ...Object.fromEntries(
        routing.locales.map((locale) => [locale, absoluteUrl(locale, path)]),
      ),
      "x-default": absoluteUrl(routing.defaultLocale, path),
    };
    return routing.locales.map((locale) => ({
      url: absoluteUrl(locale, path),
      alternates: { languages },
    }));
  });
}
