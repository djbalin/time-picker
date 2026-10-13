import { readFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import {
  FIXTURE_ADMIN_TOKEN,
  FIXTURE_CREATOR_EMAIL,
  type FixtureManifest,
  type PollFixtureKey,
} from "./fixtures/polls";

/**
 * Every screen state the UI tests visit. Layout checks, accessibility checks,
 * visual baselines and the AI review screenshots all iterate this one list,
 * so adding a state here covers it everywhere.
 */

export const locales = ["en", "da"] as const;
export type Locale = (typeof locales)[number];

export type Screen = {
  name: string;
  /** Path without the locale prefix. */
  path: (m: FixtureManifest) => string;
  /** localStorage to plant before the page loads (identity, admin token). */
  storage?: (m: FixtureManifest) => Record<string, string>;
  /** Interactions that put the page into this state, then wait for it. */
  setup?: (page: Page) => Promise<void>;
  /**
   * False when the screen shows something time-dependent (today's month,
   * "updated 3 days ago"), so a pixel baseline would rot on its own.
   */
  stableVisual?: boolean;
};

const answeringAs = (key: PollFixtureKey) => (m: FixtureManifest) => ({
  [`time-picker:identity:${m[key].slug}`]: String(m[key].meId),
});

const asOwner = (key: PollFixtureKey) => (m: FixtureManifest) => ({
  ...answeringAs(key)(m),
  [`time-picker:admin:${m[key].slug}`]: FIXTURE_ADMIN_TOKEN,
});

const poll = (key: PollFixtureKey) => (m: FixtureManifest) =>
  `/polls/${m[key].slug}`;

/** The month/nights switch is the only tablist on the poll screen. */
async function showNights(page: Page) {
  await page.getByRole("tab").nth(1).click();
}

export const screens: Screen[] = [
  { name: "home", path: () => "/" },
  { name: "create", path: () => "/polls/create", stableVisual: false },
  { name: "my-polls-empty", path: () => "/polls" },
  {
    name: "my-polls-list",
    path: () => "/polls",
    stableVisual: false,
    setup: async (page) => {
      await page.locator('input[type="email"]').fill(FIXTURE_CREATOR_EMAIL);
      await page.locator('input[type="email"]').press("Enter");
      await page.getByText("Summer cabin weekend").first().waitFor();
    },
  },
  { name: "poll-pick-identity", path: poll("typical") },
  {
    name: "poll-month",
    path: poll("typical"),
    storage: answeringAs("typical"),
  },
  {
    name: "poll-nights",
    path: poll("typical"),
    storage: answeringAs("typical"),
    setup: showNights,
  },
  {
    name: "poll-group-dialog",
    path: poll("typical"),
    storage: answeringAs("typical"),
    setup: async (page) => {
      await page.locator("aside nav button").first().click();
    },
  },
  { name: "poll-fresh", path: poll("fresh"), storage: answeringAs("fresh") },
  {
    name: "poll-owner-settled",
    path: poll("settled"),
    storage: asOwner("settled"),
  },
  {
    name: "poll-crowded",
    path: poll("crowded"),
    storage: answeringAs("crowded"),
  },
  {
    name: "poll-crowded-nights",
    path: poll("crowded"),
    storage: answeringAs("crowded"),
    setup: showNights,
  },
  { name: "poll-crowded-pick-identity", path: poll("crowded") },
  { name: "not-found", path: () => "/polls/this-poll-does-not-exist" },
];

let manifest: FixtureManifest | null = null;

/** Written by global setup, so read lazily — test files load before it runs. */
function readManifest(): FixtureManifest {
  manifest ??= JSON.parse(
    readFileSync(path.join(__dirname, ".fixtures.json"), "utf8"),
  ) as FixtureManifest;
  return manifest;
}

/**
 * Opens a screen in a given locale and waits until it has settled: fonts
 * (including the Material Symbols icon font) loaded, client effects run, the
 * Next dev overlay hidden so it never lands in a screenshot.
 */
export async function openScreen(page: Page, screen: Screen, locale: Locale) {
  const manifest = readManifest();
  const storage = screen.storage?.(manifest) ?? {};
  await page.addInitScript((entries) => {
    for (const [key, value] of Object.entries(entries)) {
      window.localStorage.setItem(key, value);
    }
  }, storage);

  // English is unprefixed ("as-needed" routing), Danish lives under /da.
  const path = screen.path(manifest);
  const prefix = locale === "en" ? "" : `/${locale}`;
  await page.goto(prefix && path === "/" ? prefix : `${prefix}${path}`);
  await page.addStyleTag({
    content: "nextjs-portal { display: none !important; }",
  });
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  await screen.setup?.(page);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
}

export function screenTitle(screen: Screen, locale: Locale) {
  return `${screen.name} [${locale}]`;
}
