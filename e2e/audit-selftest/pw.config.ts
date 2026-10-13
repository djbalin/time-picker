import { defineConfig } from "@playwright/test";

/**
 * Checks audit.ts itself against hand-built broken and clean pages, so a
 * change to the measuring code can't silently stop catching problems. Needs
 * no app server: `pnpm test:audit`.
 */
export default defineConfig({
  testDir: ".",
  outputDir: "../../test-results/audit-selftest",
  use: {
    browserName: "chromium",
    viewport: { width: 393, height: 852 },
    hasTouch: true,
    isMobile: true,
  },
});
