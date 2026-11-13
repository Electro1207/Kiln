/* Kiln motion presets. Every component takes its timing from here, so the
   whole library moves with one voice. Springs are set by how long they look
   (visualDuration) and how much they overshoot (bounce). */

import { createContext, createElement, useContext, useSyncExternalStore, type ReactNode } from "react";
import type { Transition, Variants } from "motion/react";

/** The house spring: calm, smooth, barely any overshoot. Use it for almost everything. */
export const springSoft: Transition = { type: "spring", visualDuration: 0.5, bounce: 0.08 };

/** Default for anything that moves position or size. Same as springSoft. */
export const spring: Transition = springSoft;

/** For things that stop against a hard edge (switch thumbs, slider handles,
    drawers, indicators inside a track): springSoft with no overshoot at all. */
export const springFirm: Transition = { type: "spring", visualDuration: 0.5, bounce: 0 };

/** Tiny marks only (a tick, a caret, an icon swap). No overshoot. */
export const springSnappy: Transition = { type: "spring", visualDuration: 0.3, bounce: 0 };

/** A typed character landing in its cell: very quick, barely underdamped. */
export const springLand: Transition = { type: "spring", stiffness: 720, damping: 34, mass: 0.5 };

/** A touch of play, kept for deliberate rewards (a rating star). Use sparingly. */
export const springBouncy: Transition = { type: "spring", visualDuration: 0.45, bounce: 0.25 };

/** Tweens, for opacity and colour where a spring adds nothing. */
export const easeOut = [0.22, 1, 0.36, 1] as const;
export const easeInOut = [0.65, 0, 0.35, 1] as const;
export const fade: Transition = { duration: 0.2, ease: easeOut };

/** Press feedback for anything clickable. */
export const press = { scale: 0.97 };

/** Popover / menu entrance: grows from its anchor. */
export const popVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: -4 },
  visible: { opacity: 1, scale: 1, y: 0, transition: springSnappy },
  exit: { opacity: 0, scale: 0.98, y: -2, transition: { duration: 0.14, ease: easeOut } },
};

/** Staggered list children. */
export const staggerParent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035, delayChildren: 0.02 } },
};
export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: spring },
};

/* ── Motion tier ──────────────────────────────────────────────────────────────
   Most Kiln motion runs on the compositor and costs a slow phone almost nothing.
   A few effects can't be made cheap without changing how they look: a sidebar
   whose width glides (the page beside it is laid out again on every frame) and
   animated blur (repainted every frame). On a low-end device the "lite" tier
   swaps just those for a cheaper version; every curve and timing stays the same.

   The tier is detected by itself (device memory, CPU cores, Save-Data, then one
   short frame-rate probe once the page is idle), so nothing needs setting up.
   Wrap part of the app in <MotionTierProvider tier="full" | "lite"> to force it. */

/** "full": every effect as designed. "lite": the few costly effects swapped for cheap equivalents. */
export type MotionTier = "full" | "lite";

type Nav = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

/** What the device says about itself: memory, cores and Save-Data. */
export function deviceMotionTier(): MotionTier {
  if (typeof navigator === "undefined") return "full";
  const n = navigator as Nav;
  const mem = n.deviceMemory;
  const cores = n.hardwareConcurrency;
  if (n.connection?.saveData) return "lite";
  if ((mem !== undefined && mem <= 2) || (cores !== undefined && cores > 0 && cores <= 2)) return "lite";
  if (mem !== undefined && mem <= 4 && cores !== undefined && cores > 0 && cores <= 4) return "lite";
  return "full";
}

let tier: MotionTier | null = null;
let probed = false;
const tierListeners = new Set<() => void>();

/** One probe per page: 60 frames, once the page has settled. A median frame over 25ms
    (the device can't hold even 40fps while idle) moves the whole page to "lite". */
function probe() {
  if (probed || typeof window === "undefined" || typeof requestAnimationFrame !== "function") return;
  probed = true;
  const start = () => {
    if (document.visibilityState !== "visible") return void document.addEventListener("visibilitychange", start, { once: true });
    const gaps: number[] = [];
    let last = 0;
    const step = (t: number) => {
      if (last) gaps.push(t - last);
      last = t;
      if (gaps.length < 60) return void requestAnimationFrame(step);
      gaps.sort((a, b) => a - b);
      if (gaps[30] > 25 && tier !== "lite") {
        tier = "lite";
        tierListeners.forEach((f) => f());
      }
    };
    requestAnimationFrame(step);
  };
  setTimeout(start, 1500);
}

function subscribeTier(f: () => void) {
  tierListeners.add(f);
  probe();
  return () => void tierListeners.delete(f);
}
const tierSnapshot = () => (tier ??= deviceMotionTier());
const serverTier = (): MotionTier => "full";

const MotionTierContext = createContext<MotionTier | "auto">("auto");

/** Forces the tier for everything inside ("auto", the default, detects it). */
export function MotionTierProvider({ tier: forced = "auto", children }: { tier?: MotionTier | "auto"; children?: ReactNode }) {
  return createElement(MotionTierContext.Provider, { value: forced }, children);
}

/** The tier in effect here: forced by the nearest MotionTierProvider, or detected. */
export function useMotionTier(): MotionTier {
  const forced = useContext(MotionTierContext);
  const auto = useSyncExternalStore(subscribeTier, tierSnapshot, serverTier);
  return forced === "auto" ? auto : forced;
}
