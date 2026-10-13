import { expect, test } from "@playwright/test";
import { auditLayout, hardFailures } from "../audit";

test("audit catches known problems", async ({ page }) => {
  await page.setContent(`
    <meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;font-family:sans-serif}</style>
    <div style="width:600px;background:#eee">too wide</div>
    <div style="width:200px;overflow:hidden"><button style="width:300px;height:48px">clipped button text here</button></div>
    <button style="width:18px;height:18px">x</button>
    <p style="font-size:10px;padding-left:20px">tiny text</p>
    <span style="position:absolute;width:1px;height:1px;overflow:hidden">sr</span>
    <div style="position:relative;height:60px"><button style="position:absolute;left:20px;top:0;width:50px;height:50px">a</button><button style="position:absolute;left:40px;top:0;width:50px;height:50px">b</button></div>
    <p style="padding:0 20px">inline <a href="#">link</a> ok</p>
  `);
  const r = await auditLayout(page);
  expect(r.horizontalOverflow).toBeGreaterThan(0);
  expect(r.clipped.length).toBe(1);
  expect(r.overlaps.length).toBe(1);
  expect(r.tinyText.some((f) => f.element.includes("tiny"))).toBe(true);
  expect(r.smallTargets.some((f) => f.detail === "18×18px")).toBe(true);
  expect(r.smallTargets.some((f) => f.element.includes('"link"'))).toBe(false);
  // Padded text is not "hugging the edge"; unpadded text and controls are.
  expect(r.edgeHugging.map((f) => f.element).sort()).toEqual([
    'button "x"',
    'div "too wide"',
  ]);
});

test("audit is quiet on a clean page", async ({ page }) => {
  await page.setContent(
    `<meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;font:16px sans-serif}</style><main style="padding:16px"><h1>Hello</h1><button style="min-width:44px;height:44px">Go</button></main>`,
  );
  const r = await auditLayout(page);
  expect(hardFailures(r, true)).toEqual([]);
  expect(r.smallTargets).toEqual([]);
  expect(r.edgeHugging).toEqual([]);
});
