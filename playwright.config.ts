import { defineConfig } from "@playwright/test";

/**
 * UI tests run against a server you start yourself (`pnpm dev`) — there is
 * deliberately no `webServer` block, so neither Playwright nor an agent ever
 * boots Next on its own. Point at another server with `BASE_URL=...`.
 *
 * Every test runs once per viewport below. Chromium only: the point is layout
 * at different widths, not cross-engine quirks, and one browser keeps the
 * install small and the screenshots comparable.
 */
const baseURL = process.env.BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  // Has its own config and needs no app server: `pnpm test:audit`.
  testIgnore: "**/audit-selftest/**",
  globalSetup: "./e2e/global-setup.ts",
  outputDir: "./test-results",
  // The dev server compiles routes on demand; too many parallel workers just
  // make every page time out together.
  workers: process.env.CI ? 2 : 4,
  fullyParallel: true,
  timeout: 60_000,
  expect: {
    toHaveScreenshot: {
      // Backdrop blur and gradients antialias slightly differently run to run.
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
    },
  },
  // First run writes baselines instead of failing; later runs compare.
  updateSnapshots: "missing",
  snapshotPathTemplate:
    "{testDir}/__screenshots__/{testFilePath}/{projectName}/{arg}{ext}",
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    browserName: "chromium",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "mobile-sm",
      use: {
        viewport: { width: 360, height: 740 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "mobile",
      use: {
        viewport: { width: 393, height: 852 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "tablet",
      use: {
        viewport: { width: 820, height: 1180 },
        deviceScaleFactor: 1,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "desktop",
      use: {
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      },
    },
  ],
});
