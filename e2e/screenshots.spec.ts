import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "@playwright/test";
import { auditLayout } from "./audit";
import { locales, openScreen, screens, screenTitle } from "./screens";

/**
 * Not a test — a camera. Saves every screen for the AI review loop
 * (`pnpm ui:shots`, used by the /ui-review skill):
 *
 *   ui-review/shots/<viewport>/<screen>.<locale>/
 *     full.png       the whole page, for humans
 *     01.png, 02.png one viewport-height tile each — what the AI reads, since
 *                    a tall full-page image gets shrunk until text is a blur
 *     layout.json    the measured layout report (see audit.ts)
 *
 * Tagged @shots so the regular test run skips it.
 */
export const SHOTS_DIR = path.join(__dirname, "..", "ui-review", "shots");

for (const screen of screens) {
  for (const locale of locales) {
    test(
      `${screenTitle(screen, locale)} shots`,
      { tag: "@shots" },
      async ({ page }, testInfo) => {
        await openScreen(page, screen, locale);

        const dir = path.join(
          SHOTS_DIR,
          testInfo.project.name,
          `${screen.name}.${locale}`,
        );
        rmSync(dir, { recursive: true, force: true });
        mkdirSync(dir, { recursive: true });

        const report = await auditLayout(page);
        writeFileSync(
          path.join(dir, "layout.json"),
          JSON.stringify(report, null, 2),
        );

        await page.screenshot({
          path: path.join(dir, "full.png"),
          fullPage: true,
          animations: "disabled",
        });

        const { width, height } = report.viewport;
        const tiles = Math.ceil(report.pageHeight / height);
        for (let i = 0; i < tiles; i++) {
          const y = i * height;
          await page.screenshot({
            path: path.join(dir, `${String(i + 1).padStart(2, "0")}.png`),
            fullPage: true,
            animations: "disabled",
            clip: {
              x: 0,
              y,
              width,
              height: Math.min(height, report.pageHeight - y),
            },
          });
        }
      },
    );
  }
}
