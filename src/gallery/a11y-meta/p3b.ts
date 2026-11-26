import type { A11yMetaMap } from "./types";

export const meta: A11yMetaMap = {
  toast: {
    features: ["extendedTime", "calm", "reduceMotion"],
    pattern: "Status / alert live regions in a labelled region",
    keys: [
      ["Tab", "Move to a toast's action or close button"],
      ["Esc", "Close the focused toast"],
    ],
    notes: [
      "A toast with an action never closes by itself.",
      "With extended time on, no toast closes by itself.",
      "The timer pauses while the stack is hovered, focused or the tab is hidden.",
      "The region is a labelled section; errors are announced assertively, the rest politely.",
    ],
  },
  "undo-bar": {
    features: ["extendedTime"],
    pattern: "Status message with an action",
    keys: [["Tab", "Move to Undo; the countdown pauses while focus is on the bar"]],
    notes: ["The window to undo is three times longer with extended time on.", "The countdown pauses on hover and on focus."],
  },
  "notification-bell": {
    features: ["calm", "reduceMotion", "noFlashing"],
    pattern: "Button",
    keys: [["Enter or Space", "Press the bell"]],
    notes: ["Its name includes the unread count.", "The ringing and the count bounce stop with calm, reduced motion or no flashing."],
  },
  "hold-button": {
    features: ["extendedTime"],
    pattern: "Button (press and hold)",
    keys: [
      ["Hold Space or Enter", "Fill the button; let go early to rewind"],
      ["Esc", "Cancel a hold"],
      ["Enter or Space (extended time)", "Press once to arm, press again within 4 seconds to confirm"],
    ],
    notes: [
      "With extended time on there is nothing to hold: the first press says \"Press again to confirm\" and the second press confirms.",
      "The state change is read out by a live region.",
    ],
  },
  tooltip: {
    features: ["extendedTime"],
    pattern: "Tooltip (WCAG 1.4.13)",
    keys: [
      ["Tab", "Focus the trigger; the tip appears and stays while it has focus"],
      ["Esc", "Dismiss the tip without moving focus"],
    ],
    notes: [
      "Hoverable: the pointer can move onto the tip without it closing.",
      "Dismissable with Esc, and persistent until the pointer and focus both leave.",
      "With extended time on the tip waits longer after the pointer slips off.",
    ],
  },
  carousel: {
    features: ["calm", "reduceMotion", "screenReaderHints"],
    pattern: "Carousel",
    keys: [
      ["← →", "Previous or next slide"],
      ["Tab", "Move to the dots, arrows and pause button"],
    ],
    notes: [
      "Automatic advance (the autoPlay prop) is off with calm or reduced motion.",
      "A pause button fades in on hover or focus (always shown with screen reader hints); autoplay also stops on hover and focus.",
      "The live region is silent while it plays.",
    ],
  },
  marquee: {
    features: ["calm", "reduceMotion", "screenReaderHints"],
    pattern: "Marquee with a pause control (WCAG 2.2.2)",
    keys: [["Tab", "Focus the row (it pauses) and the pause button"], ["Enter or Space", "Pause or resume"]],
    notes: [
      "A pause button fades in on hover or focus, and is always shown with screen reader hints.",
      "With calm or reduced motion it becomes a still row you can scroll by hand.",
    ],
  },
  spinner: {
    features: ["calm", "reduceMotion"],
    pattern: "Status",
    notes: ["Always named (\"Loading\") for screen readers.", "With calm or reduced motion it shows a still mark instead of turning."],
  },
  skeleton: {
    features: ["calm", "reduceMotion"],
    notes: ["Hidden from screen readers.", "The gentle breathing stops with calm or reduced motion."],
  },
  badge: {
    features: ["colourSafe"],
    notes: ["The status is always in the text, never in the colour alone.", "The presence dot gets its own shape per status with colour-safe on, and stops pulsing with calm."],
  },
  "multi-step-loader": {
    features: ["calm", "reduceMotion", "extendedTime"],
    pattern: "Ordered list with aria-current=\"step\"",
    notes: ["It never moves to the next step by itself: you set `current`.", "The progress line fills without animating with calm or reduced motion.", "Each step says \"done\" or \"in progress\" to screen readers."],
  },
  "number-ticker": {
    features: ["calm", "reduceMotion", "noFlashing"],
    notes: ["Screen readers get only the final value, never the digits rolling.", "With calm, reduced motion or no flashing the number simply changes."],
  },
  stat: {
    features: ["calm", "reduceMotion", "noFlashing"],
    notes: ["Screen readers get only the final figure, not the count-up.", "With calm, reduced motion or no flashing the figure shows at once."],
  },
  "streaming-message": {
    features: ["calm", "reduceMotion"],
    pattern: "Busy region + polite live announcement",
    notes: [
      "The text is marked busy while it streams, so readers are not interrupted word by word.",
      "The finished answer is announced once, politely.",
      "With calm or reduced motion the whole answer shows at once.",
    ],
  },
  reasoning: {
    features: ["calm", "reduceMotion"],
    pattern: "Disclosure",
    keys: [["Enter or Space", "Open or fold the thinking"]],
    notes: ["The \"Thinking…\" breathing stops with calm or reduced motion."],
  },
  "product-tour": {
    features: ["calm", "reduceMotion", "extendedTime"],
    pattern: "Dialog (modal)",
    keys: [
      ["→", "Next step"],
      ["←", "Previous step"],
      ["Esc", "Leave the tour"],
    ],
    notes: ["The tour only moves when you press a button, so it never rushes you.", "With calm or reduced motion the spotlight jumps instead of gliding."],
  },
};
