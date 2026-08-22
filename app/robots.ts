import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // Individual polls carry an unguessable slug and are meant to be
      // reached only via the link they were shared with — not crawled or
      // indexed. `/polls/create` is more specific than the `/polls/*`
      // disallow below, so crawlers apply the longer match and still allow
      // it (same for the `/da` prefix).
      allow: ["/", "/polls", "/polls/create", "/da/polls", "/da/polls/create"],
      disallow: ["/polls/*", "/da/polls/*"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
