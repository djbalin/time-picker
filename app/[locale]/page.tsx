import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function Home() {
  const t = await getTranslations("Home");

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
              <Link
                href="/polls"
                className="inline-flex items-center justify-center rounded-full border border-line bg-white px-6 py-3.5 text-base font-extrabold text-ink transition hover:border-silver"
              >
                {t("viewPolls")}
              </Link>
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
              <div className="mb-1.5 font-display text-lg font-semibold text-ink">
                {feature.title}
              </div>
              <p className="text-sm leading-relaxed text-slate">
                {feature.body}
              </p>
            </div>
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
