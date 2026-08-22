import { defineRouting } from "next-intl/routing";

/**
 * English stays unprefixed ("as-needed") so every URL that already existed
 * keeps working and keeps its SEO value — only Danish gets a `/da` prefix.
 */
export const routing = defineRouting({
  locales: ["en", "da"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];

/** This next-intl version doesn't export a `hasLocale` helper, so: */
export function isAppLocale(value: string | undefined): value is AppLocale {
  return (routing.locales as readonly string[]).includes(value ?? "");
}
