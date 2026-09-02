import {
  formatDateKey,
  fromDateKey,
  isDateKey,
  toDateKey,
} from "../lib/date-keys";
import { formatRelative } from "../lib/format";
import { generateAdminToken, generateSlug } from "../lib/ids";
import { summarizePoll } from "../lib/poll-summary";
import {
  createPollSchema,
  dedupeNames,
  emailSchema,
  nameIsTaken,
  normalizeDateKeys,
} from "../lib/validation";

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    failures++;
    console.log(`FAIL ${label}\n  got      ${a}\n  expected ${e}`);
  } else console.log(`ok   ${label}`);
}

// --- date keys ---
check("toDateKey local", toDateKey(new Date(2026, 8, 4)), "2026-09-04");
check("fromDateKey is local midnight", fromDateKey("2026-09-04").getHours(), 0);
check("roundtrip", toDateKey(fromDateKey("2026-12-31")), "2026-12-31");
check("isDateKey valid", isDateKey("2026-02-28"), true);
check("isDateKey rejects Feb 31", isDateKey("2026-02-31"), false);
check("isDateKey rejects month 13", isDateKey("2026-13-01"), false);
check("isDateKey rejects garbage", isDateKey("not-a-date"), false);
check("isDateKey rejects non-string", isDateKey(42), false);

// --- normalize ---
check(
  "normalize sorts+dedupes+filters",
  normalizeDateKeys([
    "2026-09-04",
    "2026-09-01",
    "2026-09-04",
    "junk",
    7,
    null,
  ]),
  ["2026-09-01", "2026-09-04"],
);

// --- names ---
check(
  "dedupeNames case-insensitive",
  dedupeNames(["Freja", " freja ", "Ida", ""]),
  ["Freja", "Ida"],
);
check("nameIsTaken", nameIsTaken(" IDA ", ["Ida"]), true);
check("nameIsTaken negative", nameIsTaken("Bo", ["Ida"]), false);

// --- email ---
check(
  "emailSchema trims + lowercases",
  emailSchema.safeParse("  Freja@Example.COM "),
  { success: true, data: "freja@example.com" },
);
check(
  "emailSchema rejects garbage",
  emailSchema.safeParse("nope").success,
  false,
);

// --- create poll schema ---
const good = createPollSchema.safeParse({
  title: "  Offsite  ",
  description: "",
  creatorEmail: "Ida@Example.com",
  dates: ["2026-09-04"],
  participants: ["Ida"],
});
check("schema accepts + trims", good.success && good.data.title, "Offsite");
check(
  "schema lowercases creatorEmail",
  good.success && good.data.creatorEmail,
  "ida@example.com",
);
const noDates = createPollSchema.safeParse({
  title: "x",
  description: "",
  creatorEmail: "ida@example.com",
  dates: [],
  participants: ["Ida"],
});
check("schema rejects empty dates", noDates.success, false);
const noTitle = createPollSchema.safeParse({
  title: "   ",
  description: "",
  creatorEmail: "ida@example.com",
  dates: ["2026-09-04"],
  participants: ["Ida"],
});
check("schema rejects blank title", noTitle.success, false);
const noEmail = createPollSchema.safeParse({
  title: "x",
  description: "",
  creatorEmail: "",
  dates: ["2026-09-04"],
  participants: ["Ida"],
});
check("schema rejects missing email", noEmail.success, false);
const badDate = createPollSchema.safeParse({
  title: "x",
  description: "",
  creatorEmail: "ida@example.com",
  dates: ["2026-02-31"],
  participants: ["Ida"],
});
check("schema rejects impossible date", badDate.success, false);

// --- summary ---
const participants = [
  { id: 1, name: "Ida" },
  { id: 2, name: "Bo" },
  { id: 3, name: "Cleo" }, // has not answered
];
const dates = ["2026-09-01", "2026-09-02", "2026-09-03"];
const availability = { 1: ["2026-09-01", "2026-09-02"], 2: ["2026-09-02"] };
const s = summarizePoll({
  dates,
  participants,
  availability,
  respondedIds: [1, 2],
});

check("respondedCount", s.respondedCount, 2);
check("totalCount counts everyone", s.totalCount, 3);
check("topCount", s.topCount, 2);
check(
  "topDates",
  s.topDates.map((d) => d.date),
  ["2026-09-02"],
);
check("day1 yes", s.byDate[0].yesCount, 1);
check(
  "day1 unavailable",
  s.byDate[0].unavailable.map((p) => p.name),
  ["Bo"],
);
check(
  "day1 pending (not counted as a no)",
  s.byDate[0].pending.map((p) => p.name),
  ["Cleo"],
);
check(
  "nobody works for everyone while Cleo is out",
  s.byDate.map((d) => d.worksForEveryone),
  [false, false, false],
);
check("day3 nobody", s.byDate[2].yesCount, 0);
check("day3 not top", s.byDate[2].isTop, false);

// everyone answered and agrees
const all = summarizePoll({
  dates: ["2026-09-02"],
  participants,
  availability: { 1: ["2026-09-02"], 2: ["2026-09-02"], 3: ["2026-09-02"] },
  respondedIds: [1, 2, 3],
});
check("worksForEveryone", all.byDate[0].worksForEveryone, true);

// nobody answered at all
const none = summarizePoll({
  dates,
  participants,
  availability: {},
  respondedIds: [],
});
check("no answers -> topCount 0", none.topCount, 0);
check("no answers -> no topDates", none.topDates.length, 0);
check(
  "no answers -> nothing marked top",
  none.byDate.some((d) => d.isTop),
  false,
);
check(
  "no answers -> not worksForEveryone",
  none.byDate.some((d) => d.worksForEveryone),
  false,
);

// empty poll (no participants)
const empty = summarizePoll({
  dates,
  participants: [],
  availability: {},
  respondedIds: [],
});
check(
  "no participants -> not everyone",
  empty.byDate[0].worksForEveryone,
  false,
);

// --- ids ---
const slugs = new Set(Array.from({ length: 2000 }, () => generateSlug()));
check("slugs unique over 2000", slugs.size, 2000);
check("slug length", generateSlug().length, 10);
check(
  "slug alphabet safe",
  /^[23456789abcdefghjkmnpqrstuvwxyz]+$/.test(generateSlug()),
  true,
);
check("adminToken length", generateAdminToken().length, 32);
check("adminToken hex", /^[0-9a-f]{32}$/.test(generateAdminToken()), true);

// --- format ---
const now = new Date(2026, 7, 21, 12, 0, 0);
check(
  "relative just now",
  formatRelative(new Date(2026, 7, 21, 11, 59, 30), "en", now),
  "now",
);
check(
  "formatDateKey nonempty",
  formatDateKey("2026-09-04", "en").length > 0,
  true,
);

console.log(
  failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`,
);
process.exit(failures === 0 ? 0 : 1);
