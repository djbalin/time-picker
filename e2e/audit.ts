import type { Page } from "@playwright/test";

/**
 * Measures a rendered page for the layout problems that can be decided
 * objectively, so neither you nor an AI reviewer has to eyeball them:
 *
 * - `horizontalOverflow`: the page scrolls sideways (px of overflow).
 * - `offscreen`: visible text/controls sticking out past the viewport edge.
 * - `clipped`: text/controls cut off by an `overflow: hidden` ancestor.
 * - `smallTargets`: tap targets under 44×44 (Apple/Material guidance).
 * - `tinyText`: text under 11px (the `text-2xs` token is 11px, kept for
 *   uppercase eyebrow labels on purpose).
 * - `edgeHugging`: on phones, text/controls within 12px of the screen edge.
 * - `overlaps`: two controls whose boxes intersect.
 *
 * `hardFailures` turns the subset that is unambiguously broken into test
 * failures; everything else is advisory and feeds the AI review.
 */

export type Box = { x: number; y: number; w: number; h: number };
export type Finding = { element: string; box: Box; detail?: string };

export type LayoutReport = {
  viewport: { width: number; height: number };
  pageHeight: number;
  horizontalOverflow: number;
  offscreen: Finding[];
  clipped: Finding[];
  smallTargets: Finding[];
  tinyText: Finding[];
  edgeHugging: Finding[];
  overlaps: Finding[];
};

export async function auditLayout(page: Page): Promise<LayoutReport> {
  return page.evaluate(() => {
    // The layout viewport, not innerWidth: mobile Chrome zooms out to fit
    // overflowing content, and innerWidth grows along with it.
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const isPhone = vw < 640;

    const INTERACTIVE =
      'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="tab"], [role="checkbox"], [role="switch"], [role="link"], [tabindex]:not([tabindex="-1"])';

    const round = (n: number) => Math.round(n);
    const boxOf = (r: DOMRect) => ({
      x: round(r.left + window.scrollX),
      y: round(r.top + window.scrollY),
      w: round(r.width),
      h: round(r.height),
    });

    function isVisible(el: Element) {
      const r = el.getBoundingClientRect();
      // 1–2px boxes are visually-hidden (sr-only) helpers, not real UI.
      if (r.width <= 2 || r.height <= 2) return false;
      const style = getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none")
        return false;
      if (Number(style.opacity) === 0) return false;
      return (
        el.closest('[aria-hidden="true"]') === null || el.matches(INTERACTIVE)
      );
    }

    /** A short, human-readable handle: `button "Nights"`, `div.text-xs "Summer…"`. */
    function describe(el: Element) {
      const tag = el.tagName.toLowerCase();
      const role = el.getAttribute("role");
      const label =
        el.getAttribute("aria-label") ??
        (el as HTMLElement).innerText?.replace(/\s+/g, " ").trim() ??
        "";
      const cls = (el.getAttribute("class") ?? "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 3)
        .join(".");
      const head = `${tag}${role ? `[role=${role}]` : ""}${cls ? `.${cls}` : ""}`;
      const text = label.length > 40 ? `${label.slice(0, 40)}…` : label;
      return text ? `${head} "${text}"` : head;
    }

    function hasOwnText(el: Element) {
      for (const node of el.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
          return true;
        }
      }
      return false;
    }

    /**
     * Where the content actually is: a control's own box, but for text the
     * box around its glyphs — a padded paragraph's box reaches the screen
     * edge even when its words sit comfortably inside.
     */
    function contentRect(el: Element): DOMRect {
      if (el.matches(INTERACTIVE)) return el.getBoundingClientRect();
      let left = Infinity;
      let top = Infinity;
      let right = -Infinity;
      let bottom = -Infinity;
      for (const node of el.childNodes) {
        if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim())
          continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const r = range.getBoundingClientRect();
        left = Math.min(left, r.left);
        top = Math.min(top, r.top);
        right = Math.max(right, r.right);
        bottom = Math.max(bottom, r.bottom);
      }
      return right > left
        ? new DOMRect(left, top, right - left, bottom - top)
        : el.getBoundingClientRect();
    }

    /**
     * The nearest ancestor that hides horizontal overflow, or null. Stops at
     * a scroll container: content inside one is reachable, not cut off.
     */
    function clippingAncestor(el: Element): Element | null {
      for (
        let a = el.parentElement;
        a && a !== document.body;
        a = a.parentElement
      ) {
        const ox = getComputedStyle(a).overflowX;
        if (ox === "auto" || ox === "scroll") return null;
        if (ox === "hidden" || ox === "clip") return a;
      }
      return null;
    }

    function insideScroller(el: Element) {
      for (
        let a = el.parentElement;
        a && a !== document.body;
        a = a.parentElement
      ) {
        const ox = getComputedStyle(a).overflowX;
        if (ox === "auto" || ox === "scroll") return true;
      }
      return false;
    }

    const interactive = [...document.querySelectorAll(INTERACTIVE)].filter(
      isVisible,
    );
    const textEls = [...document.querySelectorAll("body *")].filter(
      (el) => hasOwnText(el) && isVisible(el),
    );
    const subjects = [...new Set([...interactive, ...textEls])];

    const offscreen: {
      element: string;
      box: ReturnType<typeof boxOf>;
      detail?: string;
    }[] = [];
    const clipped: typeof offscreen = [];
    const edgeHugging: typeof offscreen = [];

    for (const el of subjects) {
      const r = contentRect(el);
      const clipper = clippingAncestor(el);
      if (clipper) {
        const c = clipper.getBoundingClientRect();
        const cutRight = r.right - c.right;
        const cutLeft = c.left - r.left;
        if (cutRight > 1 || cutLeft > 1) {
          clipped.push({
            element: describe(el),
            box: boxOf(r),
            detail: `cut off by ${describe(clipper).slice(0, 60)} (${round(Math.max(cutRight, cutLeft))}px hidden)`,
          });
          continue;
        }
      }
      if (insideScroller(el)) continue;
      if (r.right > vw + 1 || r.left < -1) {
        offscreen.push({
          element: describe(el),
          box: boxOf(r),
          detail:
            r.right > vw
              ? `${round(r.right - vw)}px past right edge`
              : `${round(-r.left)}px past left edge`,
        });
      } else if (isPhone && (r.left < 12 || r.right > vw - 12)) {
        edgeHugging.push({
          element: describe(el),
          box: boxOf(r),
          detail: `${round(Math.min(r.left, vw - r.right))}px from screen edge`,
        });
      }
    }

    // Text inside a paragraph is exempt from target size (WCAG 2.5.8 "inline").
    const smallTargets = interactive
      .filter((el) => getComputedStyle(el).display !== "inline")
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.width < 44 || r.height < 44)
      .map(({ el, r }) => ({
        element: describe(el),
        box: boxOf(r),
        detail: `${round(r.width)}×${round(r.height)}px`,
      }));

    const tinyText = textEls
      .map((el) => ({
        el,
        size: Number.parseFloat(getComputedStyle(el).fontSize),
      }))
      .filter(
        ({ el, size }) => size < 11 && !el.closest(".ms, [aria-hidden='true']"),
      )
      .map(({ el, size }) => ({
        element: describe(el),
        box: boxOf(el.getBoundingClientRect()),
        detail: `${size}px`,
      }));

    const overlaps: typeof offscreen = [];
    for (let i = 0; i < interactive.length; i++) {
      for (let j = i + 1; j < interactive.length; j++) {
        const a = interactive[i];
        const b = interactive[j];
        if (a.contains(b) || b.contains(a)) continue;
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        const w = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
        const h = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
        if (w > 2 && h > 2) {
          overlaps.push({
            element: describe(a),
            box: boxOf(ra),
            detail: `overlaps ${describe(b)} by ${round(w)}×${round(h)}px`,
          });
        }
      }
    }

    return {
      viewport: { width: vw, height: vh },
      pageHeight: document.documentElement.scrollHeight,
      horizontalOverflow: Math.max(
        0,
        document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      ),
      offscreen,
      clipped,
      smallTargets,
      tinyText,
      edgeHugging,
      overlaps,
    };
  });
}

/**
 * The findings that are broken no matter whose taste you ask. Tap targets
 * fail only below WCAG 2.2's 24px floor on touch screens; 24–44px is left
 * to the advisory report.
 */
export function hardFailures(report: LayoutReport, isTouch: boolean): string[] {
  const out: string[] = [];
  if (report.horizontalOverflow > 0) {
    out.push(`Page scrolls sideways by ${report.horizontalOverflow}px`);
  }
  for (const f of report.offscreen)
    out.push(`Off-screen: ${f.element} — ${f.detail}`);
  for (const f of report.clipped)
    out.push(`Clipped: ${f.element} — ${f.detail}`);
  for (const f of report.overlaps)
    out.push(`Overlap: ${f.element} — ${f.detail}`);
  if (isTouch) {
    for (const f of report.smallTargets) {
      if (f.box.w < 24 || f.box.h < 24) {
        out.push(`Tap target under 24px: ${f.element} — ${f.detail}`);
      }
    }
  }
  return out;
}
