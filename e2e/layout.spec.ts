import { expect, test } from "@playwright/test";
import { auditLayout, hardFailures } from "./audit";
import { locales, openScreen, screens, screenTitle } from "./screens";

/**
 * Objective layout checks on every screen × locale × viewport: no sideways
 * scroll, nothing off-screen or clipped, no overlapping controls, no tap
 * targets below WCAG's 24px floor — and no runtime or hydration errors.
 */

for (const screen of screens) {
  for (const locale of locales) {
    test(`${screenTitle(screen, locale)} layout`, async ({
      page,
    }, testInfo) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });

      await openScreen(page, screen, locale);
      const report = await auditLayout(page);
      await testInfo.attach("layout-report.json", {
        body: JSON.stringify(report, null, 2),
        contentType: "application/json",
      });

      const isTouch = testInfo.project.use.hasTouch === true;
      expect(hardFailures(report, isTouch), "layout problems").toEqual([]);
      expect(errors, "console / runtime errors").toEqual([]);
    });
  }
}
