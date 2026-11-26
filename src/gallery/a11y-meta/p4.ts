import type { A11yMetaMap } from "./types";

const table = "Every chart carries a one-sentence summary and a real data table for screen readers; “View as table” swaps the chart for it (shown with tableToggle or when screen-reader hints are on).";
const safe = "Colour-safe mode draws series in the colour-blind-safe palette with a pattern and a marker shape, so colour is never the only cue.";

export const meta: A11yMetaMap = {
  "bar-chart": {
    features: ["colourSafe", "screenReaderHints"],
    pattern: "Roving tabindex (one tab stop)",
    keys: [
      ["Tab", "Enter the chart on one bar; Tab again leaves it"],
      ["← → ↑ ↓", "Move between bars; the tooltip shows on the focused bar"],
      ["Home / End", "Jump to the first or last bar"],
    ],
    notes: [table, "The highlighted bar gets a diagonal pattern in colour-safe mode, so it differs from the rest by more than colour."],
  },
  "line-chart": {
    features: ["colourSafe", "screenReaderHints"],
    pattern: "Chart with a keyboard cursor",
    keys: [
      ["Tab", "One tab stop for the whole chart"],
      ["← →", "Move the cursor point by point; the value is announced"],
      ["Home / End", "Jump to the first or last point"],
    ],
    notes: [table, "Colour-safe mode marks the line's points with circles and the comparison line's with squares."],
  },
  "area-chart": {
    features: ["colourSafe", "screenReaderHints"],
    pattern: "Chart with a keyboard cursor",
    keys: [
      ["Tab", "One tab stop for the whole chart"],
      ["← →", "Move along the weeks; every layer and the total are announced"],
      ["Home / End", "Jump to the first or last week"],
    ],
    notes: [table, "Colour-safe mode fills each layer with its own pattern and marks its readout with its own shape."],
  },
  donut: {
    features: ["colourSafe", "screenReaderHints"],
    pattern: "Roving tabindex (one tab stop)",
    keys: [
      ["Tab", "Enter the legend on one row"],
      ["← → ↑ ↓", "Move between segments; the centre reads the focused one and a ring marks it"],
      ["Home / End", "Jump to the first or last segment"],
    ],
    notes: [table, "Colour-safe mode gives each segment its own colour and pattern, in the legend too."],
  },
  sparkline: {
    features: ["colourSafe", "screenReaderHints"],
    notes: [
      "The label is read as the chart's name; with screen-reader hints it also reads the range, highest, lowest and direction.",
      "Colour-safe mode ends a trend line with an up or down triangle, so rising and falling never rely on green and red.",
    ],
  },
  gauge: {
    features: ["colourSafe", "screenReaderHints"],
    pattern: "Meter",
    notes: [
      "Read as a meter with its value, range and (with screen-reader hints) its target.",
      "In colour-safe mode a triangle marks the end of the fill once the value passes the danger line, besides the colour change.",
    ],
  },
  funnel: {
    features: ["colourSafe", "screenReaderHints"],
    notes: [table, "Colour-safe mode gives each stage its own pattern; every stage also carries its number."],
  },
  radar: {
    features: ["colourSafe", "screenReaderHints"],
    keys: [
      ["Tab", "One tab stop for the chart"],
      ["← → ↑ ↓", "Move between spokes; the scores are announced"],
      ["Home / End", "Jump to the first or last spoke"],
    ],
    notes: [table, "Colour-safe mode draws the second series dashed, and gives each series its own marker shape."],
  },
  treemap: {
    features: ["colourSafe", "screenReaderHints"],
    pattern: "Roving tabindex (one tab stop)",
    keys: [
      ["Tab", "Enter the map on its largest tile"],
      ["← → ↑ ↓", "Move to the next or previous tile, biggest first"],
      ["Home / End", "Jump to the biggest or smallest tile"],
    ],
    notes: [table, safe],
  },
  "year-heatmap": {
    features: ["colourSafe", "screenReaderHints"],
    pattern: "Grid with roving tabindex",
    keys: [
      ["Tab", "Enter the grid on the last day"],
      ["← →", "Previous or next week"],
      ["↑ ↓", "Previous or next day"],
    ],
    notes: [
      "The table lists the total for each month.",
      "Colour-safe mode adds a texture to every level (lines, dots, crosshatch), so the legend reads without colour.",
    ],
  },
  sankey: {
    features: ["colourSafe", "screenReaderHints"],
    notes: [
      "Every flow is in the summary and the table, since the diagram itself is read by pointer only.",
      "Colour-safe mode colours each band by its source and gives each node its own pattern; names and amounts are always written out.",
    ],
  },
};
