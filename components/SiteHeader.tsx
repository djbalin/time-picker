import { getTranslations } from "next-intl/server";
import { Icon, Wordmark } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

export async function SiteHeader() {
  const t = await getTranslations("SiteHeader");

  return (
    <header className="sticky top-0 z-20 border-b border-white/60 bg-surface-glass backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-2.5">
        <Link href="/" className="flex items-center">
          <Wordmark label={t("brand")} size="sm" />
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/polls"
            className="text-sm font-bold text-body transition-colors hover:text-strong"
          >
            {t("polls")}
          </Link>
          <Link
            href="/polls/create"
            aria-label={t("newPoll")}
            title={t("newPoll")}
            className="grid h-9 w-9 place-items-center rounded-full bg-accent text-on-accent shadow-accent transition-colors hover:bg-accent-hover"
          >
            <Icon name="add" size={22} />
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
