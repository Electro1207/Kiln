import type { A11yMetaMap } from "./types";

export const meta: A11yMetaMap = {
  "text-animate": {
    features: ["reduceMotion"],
    notes: [
      "Screen readers get the text once, as plain text; the animated letters are hidden from them.",
      "Reduced motion shows the finished line at once, with no rise or fade.",
    ],
  },
  "typewriter": {
    features: ["reduceMotion", "calm"],
    notes: [
      "Screen readers get the first phrase once; the typed characters and caret are hidden from them.",
      "Reduced motion and calm show the first phrase in full, still, with a steady caret.",
    ],
  },
  "word-rotate": {
    features: ["reduceMotion", "calm"],
    notes: [
      "Screen readers get every word once, as a list; the swapping word is hidden from them.",
      "Reduced motion and calm hold the first word and stop the swap.",
    ],
  },
  "scramble-text": {
    features: ["reduceMotion", "noFlashing"],
    notes: [
      "Screen readers get the text once, as plain text; the animated letters are hidden from them.",
      "Reduced motion and no-flashing show the final text with no decode, so no glyph changes thirty times a second.",
    ],
  },
  "reveal": {
    features: ["reduceMotion"],
    notes: [
      "Reduced motion shows the content already in place, at full opacity.",
    ],
  },
  "dock": {
    features: ["reduceMotion", "largeTargets"],
    pattern: "Toolbar",
    keys: [
      ["Tab", "Move to the next icon"],
      ["Enter or Space", "Open the icon"],
    ],
    notes: [
      "Reduced motion turns the swell off: icons stay at rest size and the bar keeps its width.",
      "Labels still show on hover and keyboard focus.",
    ],
  },
  "tilt-card": {
    features: ["reduceMotion"],
    notes: [
      "Reduced motion keeps the card flat, with no lean or sheen.",
    ],
  },
  "floating-card": {
    features: ["reduceMotion", "calm"],
    notes: [
      "Reduced motion stops the lean and the drift against the page.",
      "Calm also stops the slow bob, so the card sits still.",
    ],
  },
  "parallax-section": {
    features: ["reduceMotion"],
    notes: [
      "Reduced motion keeps each section at full size and opacity, scrolling with the page.",
    ],
  },
  "card-journey": {
    features: ["reduceMotion", "calm"],
    notes: [
      "Reduced motion keeps the card in place and changes its face there, with no spin or glide.",
      "Calm stops the bob at rest.",
      "Every stop has a real anchor, so links and scrollIntoView land on it.",
    ],
  },
  "drift-field": {
    features: ["reduceMotion"],
    notes: [
      "Reduced motion keeps the pieces where they start, so they stay put and usable.",
    ],
  },
  "secret-hunt": {
    features: ["reduceMotion"],
    notes: [
      "Reduced motion makes a found secret fade away, with no spin or hop, and the notice fade in place.",
      "The count is announced politely.",
    ],
  },
  "firefly": {
    features: ["reduceMotion", "calm"],
    notes: [
      "Reduced motion and calm hold the lights still, glowing in place.",
      "Fireflies without a message are hidden from screen readers; with one, each is a button.",
    ],
  },
  "card-fan": {
    features: ["reduceMotion"],
    keys: [
      ["Tab", "Move to the next card (it lifts)"],
    ],
    notes: [
      "Reduced motion shows the hand already dealt, and a lifted card appears without springing.",
    ],
  },
  "magnetic-button": {
    features: ["reduceMotion"],
    notes: [
      "Reduced motion keeps the button where it is; it no longer follows the pointer.",
      "The pull is mouse-only, so touch and keyboard are unaffected.",
    ],
  },
  "animated-beam": {
    features: ["reduceMotion", "calm"],
    notes: [
      "Reduced motion and calm hold the light still, leaving the connecting line.",
      "Decorative: hidden from screen readers.",
    ],
  },
  "orbiting-circles": {
    features: ["reduceMotion", "calm"],
    notes: [
      "Reduced motion and calm hold the items at their starting places.",
      "Decorative: hidden from screen readers.",
    ],
  },
  "animated-list": {
    features: ["reduceMotion", "calm"],
    notes: [
      "Reduced motion and calm stop the cycling and show the first items, still.",
    ],
  },
  "border-beam": {
    features: ["reduceMotion", "calm"],
    notes: [
      "Reduced motion and calm hold the beam still on the border.",
      "Decorative: nothing for screen readers.",
    ],
  },
  "sticky-scroll-reveal": {
    features: ["reduceMotion"],
    pattern: "Region (scrollable, focusable)",
    keys: [
      ["Tab", "Focus the scrolling story"],
      ["↑ ↓", "Scroll through the steps"],
    ],
    notes: [
      "Reduced motion turns it into plain stacked content: each step with its visual above its words, in the normal page scroll.",
    ],
  },
  "scroll-words": {
    features: ["reduceMotion"],
    notes: [
      "Reduced motion lights the whole paragraph at once.",
      "The words are real text, so screen readers read the sentence in order.",
    ],
  },
  "parallax": {
    features: ["reduceMotion"],
    notes: [
      "Reduced motion keeps the layer still.",
    ],
  },
  "scroll-story": {
    features: ["reduceMotion"],
    pattern: "Region with step buttons",
    keys: [
      ["Tab", "Move between the step buttons"],
      ["Enter or Space", "Scroll to that step"],
    ],
    notes: [
      "Reduced motion turns the story into plain stacked content: each step with its visual above it, nothing pinned or faded.",
    ],
  },
  "scroll-timeline": {
    features: ["reduceMotion"],
    notes: [
      "Reduced motion shows every entry fully told, with the rail filled.",
      "Each entry is a list item with a real time element.",
    ],
  },
  "stamp-trail": {
    features: ["reduceMotion"],
    pattern: "Disclosure",
    keys: [
      ["Enter or Space", "Show or fold the rest"],
    ],
    notes: [
      "Reduced motion shows every seal already pressed, with no drift or fade.",
      "Show more is a disclosure button with aria-expanded.",
    ],
  },
  "feature-tabs": {
    features: ["reduceMotion", "calm"],
    pattern: "Tabs (vertical)",
    keys: [
      ["↑ ↓ ← →", "Move between features"],
      ["Tab", "Leave the tab list"],
    ],
    notes: [
      "Reduced motion and calm turn auto-advance off, so the feature changes only when someone picks it.",
      "Hover and focus pause it otherwise.",
    ],
  },
};
