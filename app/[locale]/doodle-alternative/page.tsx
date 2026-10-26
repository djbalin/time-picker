import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { toAppLocale } from "@/i18n/routing";
import { indexableMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = toAppLocale((await params).locale);
  const [t, tSite] = await Promise.all([
    getTranslations({ locale, namespace: "DoodleAlternative" }),
    getTranslations({ locale, namespace: "Metadata" }),
  ]);
  return indexableMetadata({
    locale,
    path: "/doodle-alternative",
    siteName: tSite("title"),
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

const BENEFIT_KEYS = [
  "free",
  "noAccount",
  "dates",
  "bestDate",
  "languages",
] as const;

/**
 * Comparison landing page for people searching "doodle alternative". Only
 * claims about WhenWhenWhen itself, plus an honest note on when Doodle is the
 * better pick — nothing about Doodle's plans or pricing, which change and
 * which we can't vouch for.
 */
export default async function DoodleAlternativePage() {
  const t = await getTranslations("DoodleAlternative");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-10">
      <header>
        <p className="text-xs font-extrabold uppercase tracking-wide text-mist">
          {t("eyebrow")}
        </p>
        <h1 className="mt-1 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          {t("heading")}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate">{t("lead")}</p>
      </header>

      <section>
        <h2 className="mb-4 font-display text-2xl font-semibold text-ink">
          {t("benefitsHeading")}
        </h2>
        <ul className="flex flex-col gap-3">
          {BENEFIT_KEYS.map((key) => (
            <li
              key={key}
              className="rounded-lg border border-line bg-white p-5 shadow-soft"
            >
              <h3 className="font-display text-lg font-semibold text-ink">
                {t(`benefits.${key}.title`)}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate">
                {t(`benefits.${key}.body`)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-display text-2xl font-semibold text-ink">
          {t("whenDoodleHeading")}
        </h2>
        <p className="leading-relaxed text-slate">{t("whenDoodleBody")}</p>
      </section>

      <section className="flex flex-col items-center justify-between gap-6 rounded-lg bg-ink px-8 py-10 text-center sm:flex-row sm:text-left">
        <div>
          <h2 className="font-display text-2xl font-semibold text-paper">
            {t("ctaHeading")}
          </h2>
          <p className="mt-1 text-sm font-semibold text-silver">
            {t("ctaBody")}
          </p>
        </div>
        <Link
          href="/polls/create"
          className="inline-flex items-center justify-center rounded-full bg-sky px-6 py-3.5 text-base font-extrabold text-white shadow-raised transition hover:bg-sky-light"
        >
          {t("ctaButton")}
        </Link>
      </section>
    </main>
  );
}
