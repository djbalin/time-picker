import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    // Everything may be crawled, polls included. Polls are kept out of search
    // results by the `noindex` tag on their pages instead: a crawler that is
    // disallowed from a page never sees its `noindex`, and can still index
    // the bare URL if someone links to it. Crawl access also lets link-preview
    // bots (Facebook, Slack, …) build the card for a shared poll.
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
