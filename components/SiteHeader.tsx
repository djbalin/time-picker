import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

export async function SiteHeader() {
  const t = await getTranslations("SiteHeader");

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-2">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-sm bg-sky shadow-soft">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="4" />
              <path d="M3 9h18M8 2v4M16 2v4" />
            </svg>
          </div>
          <span className="font-display text-base font-semibold tracking-tight text-ink">
            {t("brand")}
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/polls"
            className="text-sm font-extrabold text-slate transition hover:text-ink"
          >
            {t("polls")}
          </Link>
          <Link
            href="/polls/create"
            className="inline-flex items-center justify-center rounded-full bg-ink px-4 py-1.5 text-sm font-extrabold text-paper shadow-soft transition hover:bg-graphite"
          >
            {t("newPoll")}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
