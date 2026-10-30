import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { toAppLocale } from "@/i18n/routing";
import { NOINDEX } from "@/lib/seo";
import { buttonClass } from "@/lib/ui";
import { MyPolls } from "./MyPolls";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PollsPage");
  return {
    title: t("heading"),
    description: t("subtitle"),
    // An email lookup form: nothing here for search results.
    robots: NOINDEX,
  };
}

export default async function PollsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // Static rendering needs the locale set in every page, not only the
  // layout: they render independently, and without it next-intl falls back
  // to reading request headers, which makes the route dynamic.
  setRequestLocale(toAppLocale((await params).locale));
  const t = await getTranslations("PollsPage");

  return (
    <main
      data-surface="warm"
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 pt-10 pb-16 lg:pt-14"
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[clamp(2.25rem,4vw,3rem)] leading-tight text-strong">
            {t("heading")}
          </h1>
          <p className="mt-2 max-w-[48ch] text-lg leading-relaxed text-body">
            {t("subtitle")}
          </p>
        </div>
        <Link href="/polls/create" className={buttonClass({ size: "md" })}>
          {t("createPoll")}
        </Link>
      </header>

      <MyPolls />
    </main>
  );
}
