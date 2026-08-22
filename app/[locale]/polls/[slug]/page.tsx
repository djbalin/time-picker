import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPollBySlug } from "@/lib/db/queries";
import { PollWorkspace } from "./PollWorkspace";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [poll, t] = await Promise.all([
    getPollBySlug(slug),
    getTranslations("PollPage"),
  ]);

  if (!poll) {
    return { title: t("notFound") };
  }

  return {
    title: poll.title,
    description:
      poll.description || t("defaultDescription", { title: poll.title }),
  };
}

export default async function PollPage({ params }: PageProps) {
  const { slug } = await params;
  const [poll, t] = await Promise.all([
    getPollBySlug(slug),
    getTranslations("PollPage"),
  ]);

  if (!poll) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-6 py-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
          {poll.title}
        </h1>
        <Link
          className="shrink-0 text-sm font-extrabold text-slate underline-offset-2 transition hover:text-ink hover:underline"
          href="/polls"
        >
          {t("backLink")}
        </Link>
      </header>
      {poll.description && (
        <p className="-mt-3 text-sm font-semibold text-slate">
          {poll.description}
        </p>
      )}

      <PollWorkspace poll={poll} />
    </main>
  );
}
