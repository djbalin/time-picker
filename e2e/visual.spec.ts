import { expect, test } from "@playwright/test";
import { locales, openScreen, screens, screenTitle } from "./screens";

/**
 * Pixel baselines: catches "I fixed the poll page on mobile and broke the
 * create page on desktop". The first run writes baselines into
 * e2e/__screenshots__ (commit them); later runs diff against them. After an
 * intentional change, accept the new look with `pnpm test:visual:update`.
 */

for (const screen of screens.filter((s) => s.stableVisual !== false)) {
  for (const locale of locales) {
    test(`${screenTitle(screen, locale)} visual`, async ({ page }) => {
      await openScreen(page, screen, locale);
      await expect(page).toHaveScreenshot(`${screen.name}.${locale}.png`, {
        fullPage: true,
      });
    });
  }
}
