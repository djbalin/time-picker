import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

const PREVIEW_BOTS = [
  "facebookexternalhit",
  "Facebot",
  "Twitterbot",
  "Slackbot",
  "LinkedInBot",
  "WhatsApp",
  "Discordbot",
  "TelegramBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Link-preview bots fetch a poll page to build the card shown when its
      // link is pasted into a chat. Some of them honour robots.txt, so they
      // need explicit access to the polls that search engines are kept out of.
      { userAgent: PREVIEW_BOTS, allow: "/" },
      {
        userAgent: "*",
        // Individual polls carry an unguessable slug and are meant to be
        // reached only via the link they were shared with — not crawled or
        // indexed. `/polls/create` is more specific than the `/polls/*`
        // disallow below, so crawlers apply the longer match and still allow
        // it (same for the `/da` prefix).
        allow: [
          "/",
          "/polls",
          "/polls/create",
          "/da/polls",
          "/da/polls/create",
        ],
        disallow: ["/polls/*", "/da/polls/*"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
