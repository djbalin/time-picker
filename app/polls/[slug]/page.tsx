import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPollBySlug } from "@/lib/db/queries";
import { PollWorkspace } from "./PollWorkspace";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const poll = await getPollBySlug(slug);

  if (!poll) {
    return { title: "Poll not found · Time Picker" };
  }

  return {
    title: `${poll.title} · Time Picker`,
    description:
      poll.description || `Pick the dates that work for you: ${poll.title}`,
  };
}

export default async function PollPage({ params }: PageProps) {
  const { slug } = await params;
  const poll = await getPollBySlug(slug);

  if (!poll) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-6 py-8">
      <Link
        className="self-start text-sm font-extrabold text-slate underline-offset-2 transition hover:text-ink hover:underline"
        href="/polls"
      >
        ← All polls
      </Link>

      <PollWorkspace poll={poll} />
    </main>
  );
}
