import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buttonClass, Icon } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { toAppLocale } from "@/i18n/routing";
import { absoluteUrl, indexableMetadata } from "@/lib/seo";
import { type DemoDay, MiniMonth } from "./MiniMonth";
import { SamplePoll } from "./SamplePoll";

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

// The "how it works" months: the same sample poll at three moments.
const STEP_YEAR = 2027;
const STEP_MONTH = 0;
const STEP_TOTAL = 6;
const PROPOSED = [8, 9, 15, 16, 21, 22, 23, 24, 29, 30];
const PARTWAY: Record<number, number> = {
  8: 2,
  9: 3,
  15: 1,
  16: 4,
  21: 2,
  22: 1,
  23: 3,
  24: 1,
  29: 1,
  30: 2,
};
const SETTLED: Record<number, number> = {
  8: 3,
  9: 4,
  15: 2,
  16: 6,
  21: 3,
  22: 2,
  23: 4,
  24: 2,
  29: 1,
  30: 3,
};

const asDays = (counts?: Record<number, number>) =>
  Object.fromEntries(
    PROPOSED.map((day) => [day, { yes: counts?.[day] } satisfies DemoDay]),
  );

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

  const steps = [
    { title: t("step1Title"), body: t("step1Body"), days: asDays() },
    { title: t("step2Title"), body: t("step2Body"), days: asDays(PARTWAY) },
    {
      title: t("step3Title"),
      body: t("step3Body"),
      days: asDays(SETTLED),
      winner: 16,
    },
  ];

  return (
    <main data-surface="warm" className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be inline; `<` is escaped so no string can close the tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 pt-10 pb-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-16 lg:pb-28">
        <div>
          <h1 className="font-display text-[clamp(2.6rem,5.2vw,4.4rem)] leading-[1.04] tracking-display text-balance text-strong">
            {t.rich("heading", {
              hl: (chunks) => <Highlight>{chunks}</Highlight>,
            })}
          </h1>
          <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-body">
            {t("lead")}
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link href="/polls/create" className={buttonClass({ size: "lg" })}>
              {t("createPoll")}
            </Link>
            <a
              href="#how"
              className="font-bold text-plum-600 underline decoration-plum-100 decoration-2 underline-offset-[6px] transition-colors hover:decoration-plum-600"
            >
              {t("seeHow")}
            </a>
          </div>
          {/* <p className="mt-2 text-sm text-apricot-800">{t("minute")}</p> */}
        </div>

        <SamplePoll />
      </section>

      <section id="how" className="scroll-mt-20 bg-plum-800">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:py-24">
          <h2 className="max-w-[18ch] font-display text-[clamp(2rem,3.6vw,3rem)] leading-tight text-apricot-50">
            {t("howHeading")}
          </h2>
          <ol className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((step, index) => (
              <li key={step.title}>
                <div
                  aria-hidden="true"
                  className="rounded-[18px] bg-paper p-4 shadow-[0_20px_34px_-18px_rgba(0,0,0,0.6)]"
                >
                  <MiniMonth
                    year={STEP_YEAR}
                    month={STEP_MONTH}
                    locale={locale}
                    days={step.days}
                    total={STEP_TOTAL}
                    winner={step.winner}
                    size="sm"
                  />
                </div>
                <h3 className="mt-6 flex items-baseline gap-3 text-xl font-bold text-apricot-50">
                  <span className="font-display text-3xl text-butter-300">
                    {index + 1}
                  </span>
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[34ch] leading-relaxed text-plum-100">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Real questions people search for. Plain visible HTML, no FAQPage
          JSON-LD: Google only shows FAQ rich results for government and
          health sites now. */}
      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 pt-24 lg:grid-cols-[1fr_1.7fr] lg:gap-16 lg:pt-28">
        <h2 className="font-display text-[clamp(2rem,3.6vw,3rem)] leading-tight text-strong">
          {t("faqHeading")}
        </h2>
        <div className="border-t border-apricot-300">
          {FAQ_KEYS.map((key) => (
            <details key={key} className="group border-b border-apricot-300">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-bold text-strong transition-colors hover:text-plum-700 [&::-webkit-details-marker]:hidden">
                <h3>{t(`faq.${key}.q`)}</h3>
                <Icon
                  name="expand_more"
                  className="shrink-0 text-plum-600 transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <p className="max-w-[60ch] pb-6 leading-relaxed text-body">
                {t.rich(`faq.${key}.a`, {
                  link: (chunks) => (
                    <Link
                      href="/doodle-alternative"
                      className="font-bold text-plum-600 underline decoration-plum-300 decoration-2 underline-offset-4 hover:decoration-plum-600"
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

      <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-8 px-6 py-24 sm:flex-row sm:items-center sm:justify-between lg:py-28">
        <h2 className="max-w-[20ch] font-display text-[clamp(2rem,4vw,3.25rem)] leading-tight text-strong">
          {t("closeHeading")}
        </h2>
        <Link
          href="/polls/create"
          className={buttonClass({ size: "lg", className: "shrink-0" })}
        >
          {t("createPoll")}
        </Link>
      </section>
    </main>
  );
}

/** A butter swash drawn under the words that matter in the headline. */
function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative whitespace-nowrap">
      <svg
        viewBox="0 0 300 24"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute -bottom-[0.08em] left-[-2%] -z-10 h-[0.42em] w-[104%] text-butter-300"
      >
        <path
          d="M4 16C60 6 130 4 296 10c-80 2-170 6-240 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </svg>
      {children}
    </span>
  );
}
