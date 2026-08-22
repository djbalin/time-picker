import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonClass } from "@/lib/ui";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-lg bg-sky-tint text-3xl">
        🗓️
      </div>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
        {t("title")}
      </h1>
      <p className="text-sm font-semibold text-slate">{t("body")}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link href="/polls" className={buttonClass()}>
          {t("yourPolls")}
        </Link>
        <Link
          href="/polls/create"
          className={buttonClass({ variant: "secondary" })}
        >
          {t("createPoll")}
        </Link>
      </div>
    </main>
  );
}
