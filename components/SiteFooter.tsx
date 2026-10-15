import { getTranslations } from "next-intl/server";
import { Wordmark } from "@/components/ui";
import { Link } from "@/i18n/navigation";

/**
 * Brand and the pages worth crawling. Besides helping people, these links are
 * how search engines find the marketing pages from every other page. The
 * language switch stays in the header only: rendering it twice would
 * duplicate its SVG ids.
 */
export async function SiteFooter() {
  const t = await getTranslations("SiteFooter");

  return (
    <footer className="mt-auto border-t border-white/60 bg-surface-glass">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <Link href="/" className="flex items-center">
            <Wordmark label={t("brand")} size="sm" />
          </Link>
          <p className="text-xs font-semibold text-muted">{t("tagline")}</p>
        </div>

        <nav
          aria-label={t("label")}
          className="flex flex-wrap items-center gap-5"
        >
          <Link
            href="/polls/create"
            className="text-sm font-bold text-body transition-colors hover:text-strong"
          >
            {t("createPoll")}
          </Link>
          <Link
            href="/doodle-alternative"
            className="text-sm font-bold text-body transition-colors hover:text-strong"
          >
            {t("doodleAlternative")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
