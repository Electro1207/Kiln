import type { A11yMetaMap } from "./types";

/** Notes for the menus and wayfinding folders (package A3). */
export const meta: A11yMetaMap = {
  navbar: {
    features: ["reduceMotion", "calm", "highContrast", "largeTargets"],
    pattern: "Navigation landmark with a disclosure button",
    keys: [
      ["Tab", "Move through the links"],
      ["Enter or Space", "Open or close the menu on a phone"],
      ["Esc", "Close the phone menu"],
    ],
    notes: [
      "The links sit in a navigation landmark and the current page is marked, not only underlined.",
      "The menu button says whether it is open and which panel it controls.",
      "Hover fades and the menu slide follow reduced motion.",
      "Page scroll is locked while the phone menu covers the screen, and comes back on close.",
    ],
  },
  tabs: {
    features: ["reduceMotion", "calm", "highContrast", "largeTargets"],
    pattern: "Tabs",
    keys: [
      ["← →", "Move to the previous or next tab and show its panel"],
      ["Home or End", "First or last tab"],
      ["Tab", "From the tab list into the panel"],
    ],
    notes: [
      "Only the chosen tab is in the tab order; the arrow keys move between the rest.",
      "Each panel is named by its tab, and can take focus itself.",
      "Calm and reduced motion swap panels at once, with no slide and no height change.",
      "Disabled tabs are skipped by the arrow keys.",
    ],
  },
  breadcrumbs: {
    features: ["highContrast", "largeTargets"],
    pattern: "Breadcrumb",
    keys: [
      ["Tab", "Move through the levels"],
      ["Enter", "Open a level, or the menu of folded levels"],
      ["↑ ↓ Esc", "Move in and close the folded-levels menu"],
    ],
    notes: [
      "A navigation landmark with an ordered list; the last level is marked as the current page.",
      "Separators are hidden from screen readers, and so is the measuring copy of the trail.",
      "Folded levels move into a menu that says how many are hidden.",
    ],
  },
  pagination: {
    features: ["highContrast", "largeTargets"],
    pattern: "Navigation with buttons",
    keys: [
      ["Tab", "Move through the pages"],
      ["Enter or Space", "Go to the page, or to the previous or next one"],
    ],
    notes: [
      "Every page button is named \"Page 4\" and the current one is marked as the current page.",
      "Previous and next are disabled at the ends instead of being hidden.",
      "On a phone the numbers become \"6 of 24\", read out politely when it changes.",
    ],
  },
  stepper: {
    features: ["reduceMotion", "highContrast"],
    pattern: "Ordered list with a current step",
    keys: [
      ["Tab", "Reach finished steps when going back is allowed"],
      ["Enter or Space", "Go back to a finished step"],
    ],
    notes: [
      "Each step reads as \"Step 2: Shipping, done\", so progress never depends on colour.",
      "The current step is marked, and a finished one shows a tick as well as a fill.",
      "Only finished steps are buttons, and only when going back is allowed.",
    ],
  },
  "dropdown-menu": {
    features: ["reduceMotion", "highContrast", "largeTargets"],
    pattern: "Menu button",
    keys: [
      ["Enter, Space or ↓", "Open the menu from its button"],
      ["↑ ↓", "Move between items"],
      ["Home or End", "First or last item"],
      ["Type a letter", "Jump to an item that starts with it"],
      ["→ or ←", "Open or leave a submenu"],
      ["Esc", "Close and return to the button"],
    ],
    notes: [
      "The button says it opens a menu and whether it is open.",
      "Checkbox items say whether they are checked; disabled items stay readable but cannot be chosen.",
      "Focus returns to the button after a choice or Esc.",
      "The menu opens in a layer above the page, so it carries its own accessibility settings.",
    ],
  },
  "context-menu": {
    features: ["reduceMotion", "highContrast", "largeTargets"],
    pattern: "Menu (context)",
    keys: [
      ["Shift F10 or the Menu key", "Open the menu from the keyboard"],
      ["↑ ↓", "Move between items"],
      ["Esc", "Close and return to the area"],
    ],
    notes: [
      "Right-click is never the only way: the area takes focus and opens with the keyboard.",
      "The area's name tells people which keys open the menu.",
      "Choosing an item returns focus to the area.",
    ],
  },
  accordion: {
    features: ["reduceMotion", "calm", "highContrast", "largeTargets"],
    pattern: "Accordion",
    keys: [
      ["Enter or Space", "Open or close the section"],
      ["↑ ↓", "Move between section headings"],
      ["Home or End", "First or last heading"],
    ],
    notes: [
      "Each heading is a button that says whether its section is open and which panel it controls.",
      "Opened panels are named by their heading.",
      "Calm and reduced motion open and close sections at once, with no height change.",
    ],
  },
  "sidebar-nav": {
    features: ["reduceMotion", "calm", "highContrast", "largeTargets"],
    pattern: "Navigation landmark with disclosure groups",
    keys: [
      ["Tab", "Move through the items"],
      ["Enter or Space", "Choose an item, or open or close a group"],
    ],
    notes: [
      "The current page is marked; groups say whether they are open.",
      "In the narrow icon rail every item keeps its name as a tooltip and for screen readers.",
      "A badge on a collapsed item is still read out as \"3 new\".",
      "Calm and reduced motion fold the rail and the groups at once, with no sliding.",
    ],
  },
  "docs-nav": {
    features: ["reduceMotion", "calm", "highContrast", "largeTargets"],
    pattern: "Navigation landmark with disclosure groups",
    keys: [
      ["/ (or your key)", "Jump to the filter field"],
      ["↓", "From the filter into the list"],
      ["Enter", "Open the first match"],
      ["Esc", "Clear or leave the filter"],
      ["Tab", "Move through the rows"],
    ],
    notes: [
      "Groups say whether they are open and which list they control; the open one is kept in view without scrolling smoothly.",
      "The current page is marked, and the filter field is named.",
      "Calm and reduced motion open and close groups at once.",
      "This is the sidebar the gallery itself uses.",
    ],
  },
  "back-to-top": {
    features: ["reduceMotion", "calm", "highContrast", "largeTargets"],
    pattern: "Button",
    keys: [["Enter or Space", "Scroll to the top"]],
    notes: [
      "A named button that only appears once you have scrolled; the ring is hidden from screen readers.",
      "Calm and reduced motion jump to the top instead of scrolling smoothly.",
    ],
  },
  "scroll-checkpoints": {
    features: ["reduceMotion", "calm", "highContrast", "largeTargets"],
    pattern: "Navigation landmark",
    keys: [
      ["Tab", "Move through the ticks and show each preview"],
      ["Enter or Space", "Travel to that part of the page"],
    ],
    notes: [
      "Each tick is a button named \"Pricing, 3 of 5\"; the current part is marked as the current location.",
      "Previews show on focus as well as hover, and are hidden from screen readers because the name already says it.",
      "Calm and reduced motion jump to the part instead of scrolling smoothly.",
      "High contrast makes the inactive ticks darker.",
    ],
  },
  "command-palette": {
    features: ["reduceMotion", "highContrast"],
    pattern: "Dialog (modal) with a combobox",
    keys: [
      ["Ctrl or ⌘ K", "Open or close it, when a shortcut is set"],
      ["↑ ↓", "Move between results"],
      ["Enter", "Run the chosen command"],
      ["Esc", "Close"],
    ],
    notes: [
      "The search field keeps focus and points at the highlighted result, so screen readers follow along.",
      "Results are in a list with named groups; the highlighted one is also selected, not only tinted.",
      "The field shows focus with an underline.",
      "Focus returns to where it was when the palette closes.",
    ],
  },
  "scroll-hint": {
    features: ["calm", "reduceMotion", "highContrast"],
    pattern: "Button",
    keys: [["Enter or Space", "Scroll to the next part"]],
    notes: [
      "A real button with visible text, not just an arrow.",
      "The nudging arrow is decoration and is hidden from screen readers.",
      "Calm and reduced motion hold the arrow still and make the scroll instant.",
      "When hidden, it leaves the tab order.",
    ],
  },
  "scroll-progress": {
    features: ["calm", "reduceMotion", "highContrast"],
    pattern: "Progress bar",
    notes: [
      "A progress bar from 0 to 100 named \"Reading progress\"; the number updates without announcing every step.",
      "Calm and reduced motion drop the smoothing, so the fill follows the scroll exactly.",
      "The percentage in the ring is hidden from screen readers because the bar already says it.",
    ],
  },
  "flyout-nav": {
    features: ["reduceMotion", "calm", "highContrast", "largeTargets"],
    pattern: "Disclosure navigation menu",
    keys: [
      ["Enter, Space or ↓", "Open a panel and move into it"],
      ["↑ ↓", "Move between links in the panel"],
      ["Esc", "Close the panel and return to its button"],
    ],
    notes: [
      "Panels open by keyboard as well as by hover, and close when focus leaves the bar.",
      "Triggers say whether their panel is open; each panel is named after its trigger.",
      "The panel's height no longer animates; contents cross-fade instead.",
      "On a phone each panel folds as an accordion, at once under calm or reduced motion.",
    ],
  },
  toolbar: {
    features: ["highContrast", "largeTargets"],
    pattern: "Toolbar",
    keys: [
      ["← →", "Move between tools (↑ ↓ when vertical)"],
      ["Home or End", "First or last tool"],
      ["Tab", "Leave the toolbar"],
    ],
    notes: [
      "The whole toolbar is one stop in the tab order; the arrow keys move inside it.",
      "Groups are named, and separators are real separators.",
      "Toggle tools say whether they are pressed, not only how they look.",
    ],
  },
  menubar: {
    features: ["reduceMotion", "highContrast"],
    pattern: "Menubar",
    keys: [
      ["← →", "Move between menus"],
      ["Enter, Space or ↓", "Open the menu"],
      ["Home or End", "First or last menu"],
      ["Esc", "Close and return to the bar"],
    ],
    notes: [
      "The bar is one stop in the tab order; the arrow keys move inside it.",
      "Menus open as menus, with the same keyboard map as a dropdown menu.",
    ],
  },
  "spotlight-search": {
    features: ["reduceMotion", "highContrast"],
    pattern: "Dialog (modal) with a combobox",
    keys: [
      ["↑ ↓", "Move between results"],
      ["Tab or Shift Tab", "Change category"],
      ["Enter", "Open the chosen result"],
      ["Esc", "Close"],
    ],
    notes: [
      "The search field keeps focus and points at the highlighted result, so screen readers follow along.",
      "The preview is a polite live region, and it is hidden on narrow screens where there is no room.",
      "The field shows focus with an underline; the clear button is named.",
      "Recent picks are kept in this browser only.",
    ],
  },
};
