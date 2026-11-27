import { test, expect, type Page } from "@playwright/test";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";

/* Smoke test of every gallery demo. One page load per gallery group and mode covers every entry
   (section[id]) on it. Exceptions live in smoke-allow.json, each with a reason.
   Checks: page and console errors, runaway demo size, horizontal overflow at 390px, visible focus
   on the first three focusables of each demo, in light and in dark. */

type Allow = { entry: string; check: string; reason: string };
const allow: Allow[] = JSON.parse(readFileSync("tests/smoke-allow.json", "utf8")).allow;
const allowed = (entry: string, check: string) => allow.some((a) => a.entry === entry && (a.check === check || a.check === "*"));

const sitemap = readFileSync("dist/sitemap.xml", "utf8");
const groups = [...new Set([...sitemap.matchAll(/<loc>[^<]*?\/([a-z0-9-]+)\/[a-z0-9-]+<\/loc>/g)].map((m) => m[1]))]
  .filter((g) => !["r", "demo", "assets"].includes(g));

const MAX_W = 2, MAX_H = 6000;
type Failure = { entry: string; check: string; message: string };

async function demoChecks(page: Page, vw: number) {
  return page.evaluate(({ vw, MAX_W, MAX_H }) => {
    const out: { entry: string; check: string; message: string }[] = [];
    for (const s of document.querySelectorAll<HTMLElement>("main section[id], section[id]")) {
      const demo = (s.children[1] as HTMLElement) ?? s; // after the heading block
      const r = demo.getBoundingClientRect();
      // The Stage (src/gallery/ui.tsx, class min-h-40) is the well a demo sits in; a runaway grows it.
      const w = Math.max(r.width, ...[...demo.querySelectorAll<HTMLElement>(".min-h-40")].map((e) => e.getBoundingClientRect().width));
      if (w > vw * MAX_W) out.push({ entry: s.id, check: "runaway-size", message: `width ${Math.round(w)}px > ${MAX_W}x viewport (${vw}px)` });
      if (r.height > MAX_H) out.push({ entry: s.id, check: "runaway-size", message: `height ${Math.round(r.height)}px > ${MAX_H}px` });
    }
    return out;
  }, { vw, MAX_W, MAX_H });
}

async function focusChecks(page: Page) {
  await page.keyboard.press("Tab"); // keyboard modality, so :focus-visible matches programmatic focus
  const ids = await page.$$eval("section[id]", (n) => n.map((s) => s.id));
  const out: Failure[] = [];
  for (const id of ids) {
    const res = await page.evaluate((id) => {
      const demo = document.getElementById(id)?.children[1];
      if (!demo) return [];
      const sel = 'a[href],button,input,select,textarea,summary,[tabindex],[contenteditable="true"],[role="slider"]';
      const items = [...demo.querySelectorAll<HTMLElement>(sel)].filter((e) => {
        const ti = e.getAttribute("tabindex");
        if ((e as HTMLButtonElement).disabled || (ti !== null && Number(ti) < 0) || e.getAttribute("aria-hidden") === "true") return false;
        if (e instanceof HTMLInputElement && e.type === "hidden") return false;
        const r = e.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== "hidden";
      }).slice(0, 3);
      const msgs: string[] = [];
      for (const el of items) {
        el.focus({ preventScroll: true });
        if (document.activeElement !== el) continue;
        let shown = false;
        // The ring may sit on the control or on a wrapper that reacts to focus-within, anywhere up to the
        // demo's own root (a visually hidden input, like Terminal's, shows focus on the component's frame).
        // Never above the demo, so gallery chrome can't count.
        for (let n: HTMLElement | null = el; n && demo.contains(n); n = n.parentElement) {
          const cs = getComputedStyle(n);
          const outline = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0;
          const shadow = cs.boxShadow !== "none";
          if (n === el ? outline || shadow : (outline || shadow) && n.matches(":focus-within")) { shown = true; break; }
        }
        if (!shown) msgs.push(`${el.tagName.toLowerCase()}${el.getAttribute("aria-label") ? `[${el.getAttribute("aria-label")}]` : ""}: no outline or box-shadow when focused`);
        el.blur();
      }
      return msgs;
    }, id);
    for (const message of res) out.push({ entry: id, check: "focus-visible", message });
  }
  return out;
}

const modes = [
  { name: "light", theme: "light", viewport: { width: 1280, height: 800 } },
  { name: "dark", theme: "dark", viewport: { width: 1280, height: 800 } },
  { name: "phone", theme: "light", viewport: { width: 390, height: 844 } },
] as const;

for (const group of groups) {
  for (const mode of modes) {
    test(`${group} · ${mode.name}`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: mode.viewport, reducedMotion: "no-preference" });
      await ctx.addInitScript((t) => { try { localStorage.setItem("kiln-theme", t); } catch {} }, mode.theme);
      // Web fonts come from Google; keep the run offline-safe.
      await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
      const page = await ctx.newPage();
      const failures: Failure[] = [];
      let current = group;
      const errs: string[] = [];
      page.on("pageerror", (e) => errs.push(`pageerror: ${e.message.split("\n")[0]}`));
      page.on("console", (m) => { if (m.type() === "error") errs.push(`console.error: ${m.text().split("\n")[0].slice(0, 200)}`); });

      await page.goto(`/${group}`, { waitUntil: "load" });
      await page.waitForSelector("section[id]");
      await page.waitForTimeout(800); // let measuring demos settle
      expect(await page.evaluate(() => document.documentElement.classList.contains("dark"))).toBe(mode.theme === "dark");

      for (const e of errs) failures.push({ entry: current, check: "errors", message: e });
      failures.push(...(await demoChecks(page, mode.viewport.width)));
      if (mode.name === "phone") {
        const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        // The gallery scrolls inside its own sheet, so look for content past the viewport edge that no
        // scroll container or clip on the way up hides.
        const offenders = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth;
          const clipped = (el: HTMLElement) => {
            for (let n = el.parentElement; n && n !== document.documentElement; n = n.parentElement) {
              const o = getComputedStyle(n).overflowX;
              if (o !== "visible" && n.getBoundingClientRect().right <= vw + 1) return true;
            }
            return false;
          };
          const out: { entry: string; message: string }[] = [];
          for (const s of document.querySelectorAll<HTMLElement>("section[id]")) {
            const demo = (s.children[1] as HTMLElement) ?? s;
            for (const el of demo.querySelectorAll<HTMLElement>("*")) {
              const cs = getComputedStyle(el);
              if (cs.position === "fixed" || cs.display === "none") continue;
              const r = el.getBoundingClientRect();
              if (r.width === 0 || r.right <= vw + 1) continue;
              if (clipped(el)) continue;
              out.push({ entry: s.id, message: `<${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : ""}> reaches ${Math.round(r.right)}px in a ${vw}px viewport` });
              break;
            }
          }
          return out;
        });
        for (const o of offenders) failures.push({ entry: o.entry, check: "overflow-390", message: o.message });
        if (over > 1 && !offenders.length) failures.push({ entry: group, check: "overflow-390", message: `page scrolls sideways by ${over}px` });
      } else {
        failures.push(...(await focusChecks(page)));
      }
      await ctx.close();

      const real = failures.filter((f) => !allowed(f.entry, f.check));
      mkdirSync("test-results/failures", { recursive: true });
      writeFileSync(`test-results/failures/${group}-${mode.name}.json`, JSON.stringify(real, null, 1));
      const text = real.map((f) => `  ${f.entry} [${f.check}] ${f.message}`).join("\n");
      expect(real, `${real.length} failing check(s) on /${group} (${mode.name}):\n${text}`).toEqual([]);
    });
  }
}
