import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { toAppLocale } from "@/i18n/routing";
import { indexableMetadata } from "@/lib/seo";
import { sheetClass } from "@/lib/ui";
import { CreatePollForm } from "./CreatePollForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const locale = toAppLocale((await params).locale);
  const [t, tSite] = await Promise.all([
    getTranslations({ locale, namespace: "CreatePollPage" }),
    getTranslations({ locale, namespace: "Metadata" }),
  ]);
  return indexableMetadata({
    locale,
    path: "/polls/create",
    siteName: tSite("title"),
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

export default async function CreatePollPage() {
  const t = await getTranslations("CreatePollPage");

  return (
    <main
      data-surface="warm"
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 pt-10 pb-16 lg:pt-6"
    >
      <header>
        <h1 className="font-display text-[clamp(2.25rem,4vw,3rem)] leading-tight text-strong">
          {t("heading")}
        </h1>
        <p className="mt-2 max-w-[56ch] text-lg leading-relaxed text-body">
          {t("subtitle")}
        </p>
      </header>

      <div className={`${sheetClass} px-5 py-6 sm:px-8 sm:py-6`}>
        <CreatePollForm />
      </div>
    </main>
  );
}
