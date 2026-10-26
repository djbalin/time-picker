import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { routing, toAppLocale } from "@/i18n/routing";

// The picture in link previews (Facebook, Messenger, Slack, …) for every page
// under [locale], poll pages included. Rendered once per locale at build time.
export const alt = "WhenWhenWhen";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Hex copies of tokens in globals.css: the image renderer can't read CSS vars.
const INK_800 = "#332f55";
const INK_600 = "#565273";
const LILAC_300 = "#9c9bf0";
const MINT_300 = "#7fd1b9";
const BLUSH_300 = "#f5a3c7";
const PAGE_GRADIENT =
  "radial-gradient(70% 55% at 8% 4%, #cfefe4 0%, rgba(207, 239, 228, 0) 60%), radial-gradient(65% 50% at 96% 96%, #fbddeb 0%, rgba(251, 221, 235, 0) 62%), linear-gradient(200deg, #e8f4f1, #eae4fb 60%, #fbedf3)";

// A mock "best dates" list: day number, share of the group that can make it.
const SAMPLE_DATES = [
  { day: 14, share: 1, color: MINT_300 },
  { day: 21, share: 0.8, color: LILAC_300 },
  { day: 28, share: 0.6, color: BLUSH_300 },
];

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = toAppLocale((await params).locale);
  const [t, tSite] = await Promise.all([
    getTranslations({ locale, namespace: "OgImage" }),
    getTranslations({ locale, namespace: "Metadata" }),
  ]);
  const brand = tSite("title");
  const headline = t("headline");
  const subline = t("subline");
  const font = await loadRighteous(
    `${brand}${headline}${subline}${SAMPLE_DATES.map((d) => d.day).join("")}`,
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 56,
        padding: "0 80px",
        backgroundImage: PAGE_GRADIENT,
        fontFamily: "Righteous",
        color: INK_800,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex" }}>
            {[LILAC_300, MINT_300, BLUSH_300].map((color) => (
              <div
                key={color}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  background: color,
                  marginRight: -6,
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 40, marginLeft: 12 }}>{brand}</div>
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 72,
            lineHeight: 1.1,
            letterSpacing: -1,
          }}
        >
          {headline}
        </div>
        <div style={{ marginTop: 28, fontSize: 26, color: INK_600 }}>
          {subline}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          width: 300,
          padding: 32,
          borderRadius: 32,
          background: "rgba(255, 255, 255, 0.8)",
          boxShadow: "0 24px 48px -24px rgba(36, 31, 61, 0.35)",
        }}
      >
        {SAMPLE_DATES.map(({ day, share, color }) => (
          <div
            key={day}
            style={{ display: "flex", alignItems: "center", gap: 18 }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 999,
                background: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
                color: "#ffffff",
              }}
            >
              {day}
            </div>
            <div
              style={{
                display: "flex",
                flex: 1,
                height: 16,
                borderRadius: 999,
                background: "#e6e2fb",
              }}
            >
              <div
                style={{
                  width: `${share * 100}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Righteous", data: font, weight: 400, style: "normal" }],
    },
  );
}

/**
 * The brand display face, subset to just the characters drawn. Google Fonts
 * serves TrueType (which the renderer needs, unlike woff2) to clients that
 * don't advertise woff2 support, which includes server-side `fetch`.
 * `force-cache` lets the image be rendered once at build time instead of on
 * every request (uncached fetches make a route dynamic).
 */
async function loadRighteous(text: string): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=Righteous&text=${encodeURIComponent(text)}`,
    { cache: "force-cache" },
  ).then((res) => res.text());
  const url = css.match(
    /src: url\((.+?)\) format\('(?:truetype|opentype)'\)/,
  )?.[1];
  if (!url) {
    throw new Error("Couldn't load the Righteous font for the OG image");
  }
  return fetch(url, { cache: "force-cache" }).then((res) => res.arrayBuffer());
}
