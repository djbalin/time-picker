import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { CreatePollForm } from "./CreatePollForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("CreatePollPage");
  return {
    title: t("heading"),
    description: t("subtitle"),
  };
}

export default async function CreatePollPage() {
  const t = await getTranslations("CreatePollPage");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          {t("heading")}
        </h1>
        <p className="mt-1 text-sm font-semibold text-slate">{t("subtitle")}</p>
      </header>

      <Card pad="none" className="px-5 py-6 sm:px-8 sm:py-8">
        <CreatePollForm />
      </Card>

      <Link
        href="/polls"
        className="text-sm font-extrabold text-slate underline-offset-2 transition hover:text-ink hover:underline"
      >
        {t("backLink")}
      </Link>
    </main>
  );
}
