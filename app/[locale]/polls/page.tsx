import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/lib/ui";
import { MyPolls } from "./MyPolls";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PollsPage");
  return {
    title: t("heading"),
    description: t("subtitle"),
  };
}

export default async function PollsPage() {
  const t = await getTranslations("PollsPage");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-mist">
            {t("eyebrow")}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            {t("heading")}
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate">
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
