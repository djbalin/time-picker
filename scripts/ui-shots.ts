/**
 * `pnpm ui:shots` — photographs every screen for the AI review loop, then
 * writes ui-review/shots/SUMMARY.md: one row per screenshot folder with its
 * tile count and the advisory layout findings, so a reviewer knows where to
 * look before opening a single image.
 *
 *   pnpm ui:shots                                  everything
 *   pnpm ui:shots --project=mobile                 one viewport
 *   pnpm ui:shots --screen poll-month --locale da  a subset (regexes;
 *                                                  `--screen crowded` matches
 *                                                  every crowded state)
 *
 * Any other flag is passed straight to `playwright test`.
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import type { LayoutReport } from "../e2e/audit";

const SHOTS_DIR = path.join(__dirname, "..", "ui-review", "shots");

const passthrough: string[] = [];
let screen = "";
let locale = "";
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--screen") screen = args[++i] ?? "";
  else if (args[i] === "--locale") locale = args[++i] ?? "";
  else passthrough.push(args[i]);
}

// Test titles look like "poll-month [en] shots @shots".
const grep = [
  "(?=.*@shots)",
  screen && `(?=.*(?:${screen})\\S* \\[)`,
  locale && `(?=.*\\[(?:${locale})\\])`,
]
  .filter(Boolean)
  .join("");

const run = spawnSync(
  "pnpm",
  [
    "exec",
    "playwright",
    "test",
    "--grep",
    `^${grep}`,
    "--reporter=line",
    ...passthrough,
  ],
  { stdio: "inherit" },
);

writeSummary();
process.exit(run.status ?? 1);

function writeSummary() {
  if (!existsSync(SHOTS_DIR)) return;
  const rows: string[] = [];
  for (const viewport of readdirSync(SHOTS_DIR).sort()) {
    const viewportDir = path.join(SHOTS_DIR, viewport);
    if (!statSync(viewportDir).isDirectory()) continue;
    for (const shot of readdirSync(viewportDir).sort()) {
      const dir = path.join(viewportDir, shot);
      const reportPath = path.join(dir, "layout.json");
      if (!existsSync(reportPath)) continue;
      const r = JSON.parse(readFileSync(reportPath, "utf8")) as LayoutReport;
      const tiles = readdirSync(dir).filter((f) => /^\d+\.png$/.test(f)).length;
      const flags = [
        r.horizontalOverflow > 0 &&
          `**sideways scroll ${r.horizontalOverflow}px**`,
        r.offscreen.length > 0 && `**${r.offscreen.length} off-screen**`,
        r.clipped.length > 0 && `**${r.clipped.length} clipped**`,
        r.overlaps.length > 0 && `**${r.overlaps.length} overlapping**`,
        r.smallTargets.length > 0 && `${r.smallTargets.length} targets <44px`,
        r.tinyText.length > 0 && `${r.tinyText.length} text <11px`,
        r.edgeHugging.length > 0 && `${r.edgeHugging.length} hugging edge`,
      ].filter(Boolean);
      rows.push(
        `| ${viewport} (${r.viewport.width}px) | ${shot} | ${tiles} | ${flags.join(", ") || "—"} |`,
      );
    }
  }

  writeFileSync(
    path.join(SHOTS_DIR, "SUMMARY.md"),
    [
      "# UI screenshots",
      "",
      `Generated ${new Date().toISOString()}. Folder: \`ui-review/shots/<viewport>/<screen>.<locale>/\` — read the numbered tiles, details in \`layout.json\`. Bold = objectively broken.`,
      "",
      "| Viewport | Screen | Tiles | Measured findings |",
      "| --- | --- | --- | --- |",
      ...rows,
      "",
    ].join("\n"),
  );
  console.log(
    `\nSummary: ${path.relative(process.cwd(), path.join(SHOTS_DIR, "SUMMARY.md"))}`,
  );
}
