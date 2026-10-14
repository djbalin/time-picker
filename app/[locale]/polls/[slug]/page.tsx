import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPollBySlug } from "@/lib/db/queries";
import { SelectDatesApp } from "./SelectDatesApp";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [poll, t, tSite] = await Promise.all([
    getPollBySlug(slug),
    getTranslations("PollPage"),
    getTranslations("Metadata"),
  ]);

  if (!poll) {
    return { title: t("notFound") };
  }

  const description = poll.description || t("defaultDescription");
  return {
    title: poll.title,
    description,
    // The link preview in Messenger, Slack, iMessage, … — the poll's own
    // title rather than the site's.
    openGraph: {
      type: "website",
      siteName: tSite("title"),
      title: poll.title,
      description,
    },
    twitter: { card: "summary", title: poll.title, description },
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
    // <main className="mx-auto flex w-full max-w-[1360px] flex-1 flex-col gap-4 px-4 py-6 sm:px-8">
    <div className="flex place-items-center justify-center ">
      {/* <Link
        className="text-xs font-bold text-muted underline-offset-2 transition-colors hover:text-body hover:underline"
        href="/polls"
      >
        {t("backLink")}
      </Link> */}
      <SelectDatesApp poll={poll} />
    </div>
    // </main>
  );
}
