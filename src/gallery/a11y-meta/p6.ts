import type { A11yMetaMap } from "./types";

export const meta: A11yMetaMap = {
  "error-summary": {
    features: ["reduceMotion", "screenReaderHints", "strongFocus"],
    pattern: "Alert, with links to the fields (GOV.UK error summary)",
    keys: [
      ["Tab", "Move between the error links"],
      ["Enter", "Jump to the field and focus it"],
    ],
    notes: [
      "Takes focus when errors appear, and again after each failed submit (focusKey), so the list is read first.",
      "role=alert announces it; each message is a real link to its field, so it works without a mouse.",
      "Scrolls the field into view without animation when reduced motion is on.",
    ],
  },
  fieldset: {
    features: ["screenReaderHints", "highContrast"],
    pattern: "Group (fieldset and legend)",
    notes: [
      "A real fieldset with a legend: screen readers say the group name before each field inside.",
      "Description and error are tied to the group with aria-describedby; disabling the group disables every field natively.",
    ],
  },
  "masked-input": {
    features: ["largeTargets", "textScale", "highContrast"],
    pattern: "Text input with input masking",
    keys: [
      ["Type or paste", "Punctuation is added for you; extra characters are ignored"],
      ["Backspace", "Deletes the digit before the caret, stepping over punctuation"],
    ],
    notes: [
      "The caret stays where you are typing, even in the middle of the text.",
      "The placeholder shows the shape (___) ___-____, and the numeric keyboard opens on phones when only digits are allowed.",
      "The value you receive is raw, without punctuation.",
    ],
  },
  "transfer-list": {
    features: ["largeTargets", "screenReaderHints", "strongFocus"],
    pattern: "Listbox (multi-select), twice",
    keys: [
      ["Tab", "List, then its filter, buttons and the other list"],
      ["↑ ↓", "Move through the list and select"],
      ["Shift + ↑ ↓", "Extend the selection"],
      ["Ctrl + ↑ ↓", "Move without changing the selection"],
      ["Space", "Add or remove the current item"],
      ["Ctrl + A", "Select every item"],
      ["Enter", "Move the selection to the other list"],
    ],
    notes: [
      "Every move is announced: “3 items moved to The Fellowship”.",
      "Selection is shown by a tinted row and aria-selected, not by colour alone.",
      "On a phone the lists stack and the arrows turn to point up and down.",
    ],
  },
  cascader: {
    features: ["reduceMotion", "largeTargets", "strongFocus"],
    pattern: "Tree in columns (select-only)",
    keys: [
      ["↓ or Enter", "Open the panel from the button"],
      ["↑ ↓", "Move within a column"],
      ["→", "Open the next column"],
      ["←", "Back to the column before"],
      ["Enter", "Choose the highlighted leaf"],
      ["Type letters", "Jump to a matching row in this column"],
      ["Esc", "Close and return focus to the button"],
    ],
    notes: [
      "The panel is a tree: each row says its level, whether it opens, and whether it is on the chosen path.",
      "The path is also read from the button: “Outer Rim / Tatooine / Mos Eisley”.",
    ],
  },
  "type-to-confirm-dialog": {
    features: ["screenReaderHints", "extendedTime", "strongFocus"],
    pattern: "Alert dialog (modal)",
    keys: [
      ["Tab", "Stays inside the dialog"],
      ["Enter", "Confirm, once the text matches"],
      ["Esc", "Cancel"],
    ],
    notes: [
      "Focus lands in the field. The confirm button is disabled until the text matches, and a polite announcement says when it is ready.",
      "No timer: a person can take as long as they need.",
      "With screen reader hints on, an extra sentence explains why the button is disabled.",
    ],
  },
  toolbar: {
    features: ["largeTargets", "strongFocus"],
    pattern: "Toolbar",
    keys: [
      ["Tab", "One stop for the whole toolbar"],
      ["← →", "Next or previous tool (↑ ↓ when vertical)"],
      ["Home / End", "First or last tool"],
      ["Space or Enter", "Press, or toggle"],
    ],
    notes: [
      "Roving tabindex: tabbing out and back returns to the tool you left.",
      "Toggles use aria-pressed; icon-only tools carry their name as aria-label and a tooltip.",
    ],
  },
  menubar: {
    features: ["reduceMotion", "largeTargets", "strongFocus"],
    pattern: "Menu bar",
    keys: [
      ["Tab", "One stop for the whole bar"],
      ["← →", "Move between menus; while one is open, switch to the next"],
      ["↓ or Enter", "Open the menu on its first item"],
      ["↑ ↓", "Move within a menu"],
      ["→ in a submenu row", "Open the submenu"],
      ["Esc", "Close and return focus to the bar"],
    ],
    notes: [
      "Roving tabindex across the bar; opening with the keyboard lands on the first item.",
      "Hovering another menu while one is open switches to it, as native menu bars do.",
    ],
  },
  "bottom-tab-bar": {
    features: ["largeTargets", "highContrast", "colourSafe"],
    pattern: "Navigation landmark with current-page links",
    keys: [
      ["Tab", "Move between the tabs"],
      ["Enter or Space", "Open the tab"],
    ],
    notes: [
      "Each tab is at least 48px tall and wide; the bar keeps clear of the home indicator.",
      "The current tab has aria-current=page, a filled pill and bolder ink: not colour alone.",
      "A badge is read with the name: “Inbox, 3 new”; a dot badge reads “new activity”.",
    ],
  },
  "table-of-contents": {
    features: ["reduceMotion", "strongFocus"],
    pattern: "Navigation landmark with in-page links",
    keys: [
      ["Tab", "Move between the headings"],
      ["Enter", "Scroll to the heading and focus it"],
    ],
    notes: [
      "The heading you are at has aria-current=location and a bar beside it, as well as stronger ink.",
      "Jumping moves focus to the heading, so a screen reader continues from there.",
      "Scrolling jumps instantly instead of gliding when reduced motion is on.",
    ],
  },
};
