/* Kiln motion presets. Every component takes its timing from here, so the
   whole library moves with one voice. Springs are set by how long they look
   (visualDuration) and how much they overshoot (bounce). */

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
