import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Next.js renamed the `middleware` file convention to `proxy`; next-intl's
// helper is still called `createMiddleware`, it just gets re-exported here
// under the name this runtime looks for.
export const proxy = createMiddleware(routing);

export const config = {
  // Runs on every path except static assets, image optimization, and API
  // routes — those don't have (or need) a locale.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
