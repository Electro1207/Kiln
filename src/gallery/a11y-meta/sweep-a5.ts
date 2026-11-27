import type { A11yMetaMap } from "./types";

/* Accessibility notes for the data-display, tables, cards and media entries that had none (package A5). */
export const meta: A11yMetaMap = {
  avatar: {
    features: ["highContrast", "colourSafe", "reduceMotion", "calm"],
    pattern: "Image with a text name",
    notes: [
      "Each avatar is one picture named with the person's name, plus their status in words (\"Ada, online\") when it has one.",
      "The initials and the photo are hidden from screen readers, so the name is read once.",
      "Colour-safe mode gives each status its own shape (circle, square, diamond, hollow circle), so presence is never colour alone.",
      "High contrast adds a solid ring around the avatar.",
      "A group of avatars is one focus stop that fans out on focus or hover; calm and reduced motion fan it out without the spring.",
    ],
  },
  table: {
    features: ["calm", "reduceMotion", "highContrast", "largeTargets"],
    pattern: "Table with sortable columns",
    keys: [
      ["Tab", "Move through the scroll area, sort buttons and checkboxes"],
      ["Enter or Space", "Sort a column (up, down, original order) or tick a row"],
    ],
    notes: [
      "A real table with a caption, column headers and row selection; the scroll area is a labelled region that can be focused and scrolled by keyboard.",
      "The sorted column says \"ascending\" or \"descending\" to screen readers and shows an arrow.",
      "A selected row shows a tick in its checkbox as well as a tinted background.",
      "Calm and reduced motion re-sort the rows instantly instead of gliding them.",
    ],
  },
  "data-grid": {
    features: ["calm", "reduceMotion", "highContrast", "largeTargets"],
    pattern: "Table with filter, sort and paging",
    keys: [
      ["Tab", "Move through the filter, density, columns menu, table and pager"],
      ["Enter or Space", "Sort a column, tick a row, or run a bulk action"],
    ],
    notes: [
      "A real table inside a labelled, focusable scroll region; the first column stays in view while the rest scrolls.",
      "The sorted column says \"ascending\" or \"descending\" and shows an arrow; selected rows also show a tick.",
      "The bulk actions bar is a toolbar named \"Actions for the selection\" and shows how many rows are selected.",
      "Calm and reduced motion change page, filter, density and sort without fades or gliding rows.",
    ],
  },
  "description-list": {
    features: ["highContrast"],
    pattern: "Description list",
    keys: [["Tab", "Reach each copy button"]],
    notes: [
      "Built from a real description list, so screen readers read each term with its value.",
      "Each copy button names the term it copies (\"Copy order id\") and keeps its place, so rows never shift.",
      "High contrast uses the stronger line and text colours from the page-wide rules.",
    ],
  },
  "comparison-table": {
    features: ["colourSafe", "highContrast"],
    pattern: "Table with sticky headers",
    keys: [["Tab", "Focus the scroll area, then arrow keys scroll it"]],
    notes: [
      "A real table: plan names are column headers and each feature is a row header, so every cell is read with its plan and feature.",
      "Included and not included are a check and a dash with a hidden word (\"Included\", \"Not included\"), never colour alone.",
      "The scroll area is a labelled region that can be focused and scrolled by keyboard.",
      "High contrast makes the \"not included\" dashes darker.",
    ],
  },
  list: {
    features: ["calm", "reduceMotion", "largeTargets"],
    pattern: "List with swipe actions",
    keys: [
      ["Tab", "Focus a row; its actions open and become reachable with Tab"],
      ["Enter or Space", "Open the row or run an action"],
    ],
    notes: [
      "Swiping is never the only way: focusing a row opens its actions for the keyboard, and each action is a button with a visible name.",
      "A row with actions but no click handler is named with its title and its actions.",
      "Calm and reduced motion open and close the actions at once, without the spring.",
    ],
  },
  timeline: {
    features: ["calm", "reduceMotion", "noFlashing", "highContrast"],
    pattern: "Ordered list",
    notes: [
      "An ordered list of entries, each with a real time element, so order and time are read out.",
      "The icons and the connecting line are hidden from screen readers.",
      "Calm, reduced motion and no flashing show every entry at once instead of rising in as it scrolls into view.",
      "High contrast makes the connecting line stronger.",
    ],
  },
  "heat-strip": {
    features: ["calm", "reduceMotion", "noFlashing", "highContrast"],
    pattern: "Grid",
    keys: [
      ["Tab", "Enter or leave the grid (one stop)"],
      ["← →", "Move a week back or forward"],
      ["↑ ↓", "Move a day up or down"],
    ],
    notes: [
      "Each day is a cell named with its date and count (\"Mon 3 Mar: 12 deploys\"); the grid is named with the total.",
      "The readout above the strip is a polite live region and follows the focused day.",
      "The shades also sit beside the numbers, never colour alone. High contrast makes the lighter shades stronger.",
      "Calm, reduced motion and no flashing skip the wave that draws the cells in.",
    ],
  },
  "code-block": {
    features: ["highContrast", "largeTargets"],
    pattern: "Preformatted text",
    keys: [["Tab", "Focus the code to scroll it sideways; reach the copy button"]],
    notes: [
      "The code is real text in a preformatted block that can be focused and scrolled by keyboard.",
      "Line numbers are hidden from screen readers and from copying.",
      "The copy button is named \"Copy code\".",
      "Syntax colours are only decoration: the code reads the same without them.",
      "High contrast makes the line numbers stronger.",
    ],
  },
  kbd: {
    features: ["calm", "reduceMotion", "noFlashing", "highContrast"],
    pattern: "Keyboard text",
    notes: [
      "A real keyboard element, so screen readers read the key as text.",
      "The press effect that follows the real key is only a small colour change and a 1px dip; calm, reduced motion and no flashing remove it.",
      "High contrast makes the border and text solid.",
    ],
  },
  dashboard: {
    features: ["calm", "reduceMotion", "noFlashing", "colourSafe", "screenReaderHints"],
    pattern: "Landmark regions with figures and charts",
    notes: [
      "Built from the stat, chart and table parts, so each keeps its own notes: counting numbers show the final figure to screen readers, and charts have a summary and a data table.",
      "Calm, reduced motion and no flashing show figures and charts at once without counting or drawing.",
      "Colour-safe mode switches the charts to patterns and marker shapes.",
    ],
  },
  card: {
    features: ["highContrast"],
    pattern: "Group (plain surface)",
    notes: [
      "A plain bordered surface with no role of its own; headings inside it give it structure.",
      "The card does not move. High contrast uses the stronger border from the page-wide rules.",
    ],
  },
  "media-card": {
    features: ["calm", "reduceMotion", "noFlashing"],
    pattern: "Article, link or button",
    keys: [["Enter or Space", "Open the card when it is a link or button"]],
    notes: [
      "The picture needs alt text, which the component asks for.",
      "As a link or button the whole card is one focus stop with a visible outline; as plain content it is an article.",
      "Calm, reduced motion and no flashing stop the slow zoom on hover and focus.",
    ],
  },
  "interactive-card": {
    features: ["calm", "reduceMotion", "noFlashing", "highContrast", "colourSafe"],
    pattern: "Toggle button",
    keys: [["Enter or Space", "Choose or unchoose the card"]],
    notes: [
      "Each card is one button that says whether it is chosen (pressed).",
      "A chosen card has a thicker border under high contrast and colour-safe mode, not only a tinted background.",
      "The arrow is hidden from screen readers. Calm, reduced motion and no flashing stop the arrow nudge and the press scale.",
    ],
  },
  "stat-card": {
    features: ["calm", "reduceMotion", "noFlashing", "colourSafe", "screenReaderHints"],
    pattern: "Group with a figure and a chart",
    notes: [
      "Built from the stat and bar chart parts: the figure reads as its final number, and the chart has a summary and a hidden data table.",
      "Up and down changes are shown with an arrow and a sign as well as colour.",
      "Calm, reduced motion and no flashing skip the counting and the bar growth.",
    ],
  },
  "expandable-card": {
    features: ["calm", "reduceMotion"],
    pattern: "Dialog (modal) opened from a button",
    keys: [
      ["Enter or Space", "Open the card"],
      ["Esc", "Close it and return focus to the card"],
    ],
    notes: [
      "Each card is a button that opens a dialog named by its title; focus moves to the close button.",
      "Closing by Esc, the close button or the backdrop returns focus to the card that was open.",
      "Calm and reduced motion open and close the card at once instead of flying it out of its place.",
    ],
  },
  pricing: {
    features: ["highContrast", "calm", "reduceMotion"],
    pattern: "Radio group and list",
    keys: [
      ["← →", "Switch between monthly and yearly"],
      ["Tab", "Move to the plan buttons"],
    ],
    notes: [
      "The billing switch is a radio group with one tab stop; the arrow keys change the choice.",
      "The most chosen plan is named in words (\"Most chosen\"), not only by its accent border; high contrast thickens the border.",
      "Each plan's features are a list, and the check marks are hidden from screen readers.",
      "The price counts to its new value; calm, reduced motion and no flashing show it at once (see Number ticker).",
    ],
  },
  masonry: {
    features: ["calm", "reduceMotion", "noFlashing"],
    pattern: "List of figures",
    notes: [
      "Each picture is a list item with its own alt text and optional caption.",
      "Reading order follows the original order of the pictures, column by column.",
      "Calm, reduced motion and no flashing show all pictures at once and stop the hover zoom.",
    ],
  },
};
