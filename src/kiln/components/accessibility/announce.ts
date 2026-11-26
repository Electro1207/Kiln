/* Tell screen readers something without moving focus: "3 items moved", "Back online".
   Two visually hidden live regions (polite and assertive) are made on first use and live in
   document.body. No provider needed. */

export type Politeness = "polite" | "assertive";

const regions: Partial<Record<Politeness, HTMLElement>> = {};
const timers: Partial<Record<Politeness, number>> = {};

const HIDDEN =
  "position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0;";

function regionFor(politeness: Politeness) {
  let el = regions[politeness];
  if (el && el.isConnected) return el;
  el = document.createElement("div");
  el.setAttribute("data-k-live", politeness);
  el.setAttribute("role", politeness === "assertive" ? "alert" : "status");
  el.setAttribute("aria-live", politeness);
  el.setAttribute("aria-atomic", "true");
  el.style.cssText = HIDDEN;
  document.body.appendChild(el);
  regions[politeness] = el;
  return el;
}

/**
 * Speak `message` to screen readers. The region is emptied first, so saying the same thing twice
 * is read twice. `assertive` interrupts; use it only for what cannot wait.
 */
export function announce(message: string, politeness: Politeness = "polite") {
  if (typeof document === "undefined" || !message) return;
  const el = regionFor(politeness);
  window.clearTimeout(timers[politeness]);
  el.textContent = "";
  timers[politeness] = window.setTimeout(() => {
    el.textContent = message;
  }, 60);
}

/** `announce`, for components that prefer a hook. The function never changes. */
export function useAnnounce() {
  return announce;
}
