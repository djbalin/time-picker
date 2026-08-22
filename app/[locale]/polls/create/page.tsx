import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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

      <section className="rounded-lg border border-line bg-white px-6 py-6 shadow-soft sm:px-8">
        <CreatePollForm />
      </section>

      <Link
        href="/polls"
        className="text-sm font-extrabold text-slate underline-offset-2 transition hover:text-ink hover:underline"
      >
        {t("backLink")}
      </Link>
    </main>
  );
}
