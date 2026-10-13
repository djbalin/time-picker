/**
 * The polls every UI test renders. Fixed slugs, names and dates keep
 * screenshots comparable between runs; the dates sit in 2030 so they never
 * drift into the past and get greyed out.
 *
 * Each fixture is chosen to stress layout differently — add one here when a
 * real poll looks broken in a way none of these cover.
 */

export type PollFixture = {
  slug: string;
  title: string;
  description: string;
  dates: string[];
  participants: string[];
  /**
   * Which dates each participant said yes to, by participant index. A missing
   * index means that person hasn't answered yet.
   */
  answers: Record<number, string[]>;
  /** The participant the test "is" (stored as the browser's identity). */
  me: number;
  finalizedDate?: string;
};

export const FIXTURE_CREATOR_EMAIL = "ui-fixtures@example.com";
/** Every fixture shares this admin token, so owner views are one localStorage key away. */
export const FIXTURE_ADMIN_TOKEN = "ui-fixture-admin-token";

function range(start: string, count: number, stepDays = 1): string[] {
  const [y, m, d] = start.split("-").map(Number);
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(Date.UTC(y, m - 1, d + i * stepDays));
    return date.toISOString().slice(0, 10);
  });
}

/** Every `n`th date, starting at `offset` — deterministic "random-looking" answers. */
function every(dates: string[], n: number, offset = 0): string[] {
  return dates.filter((_, i) => (i + offset) % n === 0);
}

const typicalDates = [
  ...range("2030-09-05", 4, 7),
  ...range("2030-10-03", 3, 2),
  ...range("2030-10-17", 3),
];

const crowdedDates = range("2030-09-02", 40, 2);

export const pollFixtures = {
  /** What most polls look like: a handful of people, ten dates, one holdout. */
  typical: {
    slug: "ui-typical",
    title: "Summer cabin weekend",
    description: "Tick every night you could make it.",
    dates: typicalDates,
    participants: ["Freja", "Ida", "William", "Noah", "Sofie", "Alfred"],
    answers: {
      0: every(typicalDates, 2),
      1: every(typicalDates, 3),
      2: every(typicalDates, 2, 1),
      3: typicalDates.slice(0, 6),
      4: every(typicalDates, 1).slice(3),
    },
    me: 0,
  },
  /**
   * The stress case: long title and description, sixteen people with long
   * names, forty dates over three months.
   */
  crowded: {
    slug: "ui-crowded",
    title:
      "Annual family reunion at Grandma's summer house in Skagen — please answer before Friday",
    description:
      "We need a weekend when at least most of us can come. Kids are welcome, dogs too. If none of these work, write in the group chat and we'll add more dates.",
    dates: crowdedDates,
    participants: [
      "Anne-Sofie Kristiansen",
      "Maximilian Østergaard-Johansen",
      "Ida",
      "Bo",
      "Christian Frederik",
      "Emma",
      "Mikkel",
      "Laura Marie Skovgaard",
      "Oliver",
      "Noah",
      "Freja",
      "Rasmus",
      "Sofie",
      "William",
      "Karoline Bjerregaard-Nielsen",
      "Alfred",
    ],
    answers: Object.fromEntries(
      Array.from({ length: 13 }, (_, i) => [
        i,
        every(crowdedDates, (i % 4) + 1, i),
      ]),
    ),
    me: 1,
  },
  /** Brand new: a few dates, nobody has answered yet. */
  fresh: {
    slug: "ui-fresh",
    title: "Board game night",
    description: "",
    dates: ["2030-11-07", "2030-11-08", "2030-11-14", "2030-11-15"],
    participants: ["Ida", "Bo", "Cleo"],
    answers: {},
    me: 0,
  },
  /** Seen by its creator after locking in a date. */
  settled: {
    slug: "ui-settled",
    title: "Team dinner",
    description: "Somewhere central, around 18:30.",
    dates: range("2030-09-10", 5),
    participants: ["Freja", "Ida", "Emma", "Lucas"],
    answers: {
      0: range("2030-09-10", 5),
      1: ["2030-09-11", "2030-09-12"],
      2: ["2030-09-12", "2030-09-13"],
      3: ["2030-09-12"],
    },
    me: 0,
    finalizedDate: "2030-09-12",
  },
} satisfies Record<string, PollFixture>;

export type PollFixtureKey = keyof typeof pollFixtures;

/** What global setup learns from the database and hands to the tests. */
export type FixtureManifest = Record<
  PollFixtureKey,
  { slug: string; meId: number; participantIds: number[] }
>;
