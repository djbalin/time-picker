/**
 * The site's public origin, for absolute URLs (OpenGraph tags, sitemap,
 * robots). `NEXT_PUBLIC_SITE_URL` wins when set; on Vercel, the production
 * domain Vercel provides is the fallback, so link previews never point at
 * localhost.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
