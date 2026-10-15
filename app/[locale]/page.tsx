import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { toAppLocale } from "@/i18n/routing";
import { absoluteUrl, indexableMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const locale = toAppLocale((await params).locale);
  const [t, tSite] = await Promise.all([
    getTranslations({ locale, namespace: "Home" }),
    getTranslations({ locale, namespace: "Metadata" }),
  ]);
  return indexableMetadata({
    locale,
    path: "/",
    siteName: tSite("title"),
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

const FAQ_KEYS = [
  "free",
  "account",
  "howTo",
  "changeAnswers",
  "doodle",
] as const;

export default async function Home({ params }: PageProps) {
  const locale = toAppLocale((await params).locale);
  const [t, tSite] = await Promise.all([
    getTranslations("Home"),
    getTranslations("Metadata"),
  ]);

  // Describes the app to search engines. No rating/review markup: there are
  // no real reviews to back it.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tSite("title"),
    url: absoluteUrl(locale, "/"),
    description: t("metaDescription"),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    inLanguage: locale,
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };

  const features = [
    {
      icon: "📅",
      tint: "bg-sky-tint",
      title: t("feature1Title"),
      body: t("feature1Body"),
    },
    {
      icon: "🔗",
      tint: "bg-green-tint",
      title: t("feature2Title"),
      body: t("feature2Body"),
    },
    {
      icon: "✓",
      tint: "bg-orange-tint",
      title: t("feature3Title"),
      body: t("feature3Body"),
    },
  ];

  return (
    <main className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be inline; `<` is escaped so no string can close the tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <section className="mx-auto w-full max-w-5xl px-6 pt-10 pb-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-sky-tint px-3.5 py-1.5 text-xs font-extrabold text-sky-deep">
              <span className="h-2 w-2 rounded-full bg-sky" />
              {t("badge")}
            </div>
            <h1 className="mb-4 font-display text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
              {t("heading")}
            </h1>
            <p className="mb-8 max-w-md text-lg leading-relaxed text-slate">
              {t("lead")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/polls/create"
                className="inline-flex items-center justify-center rounded-full bg-ink px-6 py-3.5 text-base font-extrabold text-paper shadow-raised transition hover:bg-graphite"
              >
                {t("createPoll")}
              </Link>
              {/* <Link
                href="/polls"
                className="inline-flex items-center justify-center rounded-full border border-line bg-white px-6 py-3.5 text-base font-extrabold text-ink transition hover:border-silver"
              >
                {t("viewPolls")}
              </Link> */}
            </div>
          </div>

          <div className="grid place-items-center">
            <div className="relative flex h-52 w-52 items-center justify-center rounded-lg bg-gradient-to-br from-sky-light to-sky text-7xl shadow-float">
              🗓️
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-16">
        <h2 className="mb-5 font-display text-2xl font-semibold text-ink">
          {t("howItWorks")}
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-line bg-white p-6 shadow-soft"
            >
              <div
                className={`mb-4 grid h-11 w-11 place-items-center rounded-md text-xl ${feature.tint}`}
              >
                {feature.icon}
              </div>
              <h3 className="mb-1.5 font-display text-lg font-semibold text-ink">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Real questions people search for. Plain visible HTML, no FAQPage
          JSON-LD: Google only shows FAQ rich results for government and
          health sites now. */}
      <section className="mx-auto w-full max-w-3xl px-6 pb-16">
        <h2 className="mb-5 font-display text-2xl font-semibold text-ink">
          {t("faqHeading")}
        </h2>
        <div className="flex flex-col gap-3">
          {FAQ_KEYS.map((key) => (
            <details
              key={key}
              className="rounded-lg border border-line bg-white px-5 py-4 shadow-soft"
            >
              <summary className="cursor-pointer font-display text-lg font-semibold text-ink">
                <h3 className="inline">{t(`faq.${key}.q`)}</h3>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                {t.rich(`faq.${key}.a`, {
                  link: (chunks) => (
                    <Link
                      href="/doodle-alternative"
                      className="font-bold text-ink underline underline-offset-2"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <div className="flex flex-col items-center justify-between gap-6 rounded-lg bg-ink px-8 py-10 text-center sm:flex-row sm:text-left">
          <div>
            <div className="font-display text-2xl font-semibold text-paper">
              {t("ctaHeading")}
            </div>
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
        </div>
      </section>
    </main>
  );
}
