import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { openScreen, screens, screenTitle } from "./screens";

/**
 * axe-core accessibility scan (contrast, labels, roles, …). Fails on
 * "serious" and "critical" violations only. Run on one phone and one desktop
 * width in English — contrast and labelling rarely differ by width or locale,
 * and Danish copy is covered by the layout checks.
 */
const A11Y_PROJECTS = ["mobile", "desktop"];

for (const screen of screens) {
  test(`${screenTitle(screen, "en")} a11y`, async ({ page }, testInfo) => {
    test.skip(
      !A11Y_PROJECTS.includes(testInfo.project.name),
      "a11y runs on the mobile and desktop projects only",
    );
    await openScreen(page, screen, "en");
    const results = await new AxeBuilder({ page })
      .exclude("nextjs-portal") // the dev-mode overlay, not the app
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    await testInfo.attach("axe-results.json", {
      body: JSON.stringify(results.violations, null, 2),
      contentType: "application/json",
    });

    const blocking = results.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map(
        (v) =>
          `${v.id} (${v.impact}): ${v.help} — ${v.nodes
            .slice(0, 3)
            .map((n) => n.target.join(" "))
            .join(
              " | ",
            )}${v.nodes.length > 3 ? ` (+${v.nodes.length - 3} more)` : ""}`,
      );
    expect(blocking).toEqual([]);
  });
}
