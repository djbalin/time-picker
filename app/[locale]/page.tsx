import { getLocale, getTranslations } from "next-intl/server";
import { buttonClass } from "@/components/ui";
import { Link } from "@/i18n/navigation";
import { type DemoDay, MiniMonth } from "./MiniMonth";
import { SamplePoll } from "./SamplePoll";

// The "how it works" months: the same sample poll at three moments.
const STEP_YEAR = 2027;
const STEP_MONTH = 0;
const STEP_TOTAL = 6;
const PROPOSED = [8, 9, 15, 16, 22, 23, 29, 30];
const PARTWAY: Record<number, number> = {
  8: 2,
  9: 3,
  15: 1,
  16: 4,
  22: 1,
  23: 3,
  29: 1,
  30: 2,
};
const SETTLED: Record<number, number> = {
  8: 3,
  9: 4,
  15: 2,
  16: 6,
  22: 2,
  23: 4,
  29: 1,
  30: 3,
};

const asDays = (counts?: Record<number, number>) =>
  Object.fromEntries(
    PROPOSED.map((day) => [day, { yes: counts?.[day] } satisfies DemoDay]),
  );

export default async function Home() {
  const t = await getTranslations("Home");
  const locale = await getLocale();

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
    <main data-surface="home" className="flex flex-1 flex-col">
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
