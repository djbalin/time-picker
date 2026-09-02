import type { Metadata } from "next";
import { Arimo, Righteous } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/SiteHeader";
import { isAppLocale, routing } from "@/i18n/routing";
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
    // absolute one, which is what OpenGraph/canonical tags need. Set
    // NEXT_PUBLIC_SITE_URL once there's a real domain to deploy to.
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ),
    title: { default: t("title"), template: `%s · ${t("title")}` },
    description: t("description"),
    alternates: {
      // Tells search engines the English and Danish pages are the same
      // content in different languages, not duplicates.
      languages: { en: "/", da: "/da" },
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
      className={`${righteous.variable} ${gabarito.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Meety's icon set. Loaded here, not via @import in globals.css —
            the CSS build strips remote imports. The axis ranges keep the
            FILL/weight toggles in `.ms` working. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="flex min-h-full flex-col font-sans text-body">
        <NextIntlClientProvider>
          <SiteHeader />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
