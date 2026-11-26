import type { A11yMetaMap } from "./types";

export const meta: A11yMetaMap = {
  "accessibility-menu": {
    features: ["reduceMotion", "largeTargets", "textScale", "strongFocus"],
    pattern: "Dialog (non-modal) with toggle buttons and switches",
    keys: [
      ["Tab", "Move between profiles, switches and Reset"],
      ["Space or Enter", "Turn a profile or switch on or off"],
      ["← →", "Change the text size"],
      ["Esc", "Close and return focus to the button"],
    ],
    notes: [
      "Each profile is a toggle button with aria-pressed, and its tick shows the state as well as colour.",
      "Features the device already turns on (reduced motion, more contrast) are held on and say so.",
      "Reset is announced to screen readers.",
    ],
  },
  "accessibility-scope": {
    features: ["reduceMotion", "calm", "textScale", "largeTargets", "strongFocus", "highContrast"],
    notes: [
      "A scope or prop only adds: it never switches off what the person chose.",
      "A local text size zooms the scope by the extra amount over the page, so nesting never compounds.",
    ],
  },
  "skip-link": {
    features: ["strongFocus"],
    pattern: "Skip link (landmark bypass)",
    keys: [
      ["Tab", "The first stop on the page; the link fades in"],
      ["Enter", "Move focus to the main content"],
    ],
    notes: ["Stays in the tab order while hidden, so it is always the first thing a keyboard user reaches."],
  },
  "visually-hidden": {
    features: ["screenReaderHints"],
    notes: [
      "Read by screen readers, not shown.",
      "With `focusable` it appears while it or anything inside it has focus.",
    ],
  },
  "live-announcer": {
    features: ["screenReaderHints"],
    pattern: "Live region (status and alert)",
    notes: [
      "Polite waits for the reader to finish; assertive interrupts. Use assertive sparingly.",
      "The region is emptied first, so the same message twice is read twice.",
    ],
  },
};
