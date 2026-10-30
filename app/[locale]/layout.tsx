import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Arimo, Righteous } from "next/font/google";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { isAppLocale, routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

// Meety runs on two Google-hosted faces: Righteous for the 70s display voice
// (headlines, day numbers, the wordmark — one weight only), Arimo (a classic
// Helvetica/Arial-metric grotesque) for everything else.
const righteous = Righteous({
  variable: "--font-righteous",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const gabarito = Arimo({
  variable: "--font-gabarito",
  subsets: ["latin"],
  display: "swap",
});

// The icon font, self-hosted as a subset of only the glyphs the app uses
// (see components/ui/icon-names.ts). `block` keeps a ligature's name, like
// "check", from flashing as text before the font arrives; at a few KB and
// preloaded, it arrives almost at once.
const materialSymbols = localFont({
  src: "../../components/ui/material-symbols-rounded.woff2",
  variable: "--font-icons",
  display: "block",
  adjustFontFallback: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    // Turns every relative URL below (and in page-level metadata) into an
    // absolute one, which is what OpenGraph/canonical tags need.
    metadataBase: new URL(SITE_URL),
    // Only a fallback: every indexable page sets its own keyword title via
    // `indexableMetadata` (lib/seo.ts), which also sets its canonical and
    // hreflang links. Those can't live here, or every page would inherit the
    // homepage's.
    title: { default: t("title"), template: `%s · ${t("title")}` },
    description: t("description"),
    // What chat apps show when a link is pasted. Pages that set their own
    // `openGraph` replace this object wholesale (metadata merges shallowly).
    openGraph: {
      type: "website",
      siteName: t("title"),
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function RootLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!isAppLocale(locale)) {
    notFound();
  }

  // Static rendering (generateStaticParams above) needs the locale set
  // explicitly here, or every request falls back to the default at build
  // time regardless of which locale is actually being rendered.
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${righteous.variable} ${gabarito.variable} ${materialSymbols.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-body">
        <NextIntlClientProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
