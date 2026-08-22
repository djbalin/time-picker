import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware drop-ins for `next/link` and `next/navigation`. Every page
 * and component should import `Link`/`useRouter` from here instead of
 * `next/link`/`next/navigation`, so a link to `/polls` from a Danish page
 * correctly points at `/da/polls`.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
