import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { toAppLocale } from "@/i18n/routing";
import { getPollBySlug } from "@/lib/db/queries";
import { localizedPath, NOINDEX, ogImage } from "@/lib/seo";
import { SelectDatesApp } from "./SelectDatesApp";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const [poll, t, tSite] = await Promise.all([
    getPollBySlug(slug),
    getTranslations("PollPage"),
    getTranslations("Metadata"),
  ]);

  // Polls are private links: never in search results. They stay crawlable
  // (see app/robots.ts) so this tag can be seen and link previews work.
  if (!poll) {
    return { title: t("notFound"), robots: NOINDEX };
  }

  const appLocale = toAppLocale(locale);
  const description = poll.description || t("defaultDescription");
  const image = ogImage(appLocale, tSite("title"));
  return {
    title: poll.title,
    description,
    robots: NOINDEX,
    // The link preview in Messenger, Slack, iMessage, … — the poll's own
    // title rather than the site's, over the site-wide image.
    openGraph: {
      type: "website",
      siteName: tSite("title"),
      url: localizedPath(appLocale, `/polls/${slug}`),
      title: poll.title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: poll.title,
      description,
      images: [image],
    },
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
    <main
      data-surface="warm"
      className="flex place-items-center justify-center"
    >
      {/* <Link
        className="text-xs font-bold text-muted underline-offset-2 transition-colors hover:text-body hover:underline"
        href="/polls"
      >
        {t("backLink")}
      </Link> */}
      <SelectDatesApp poll={poll} />
    </main>
    // </main>
  );
}
