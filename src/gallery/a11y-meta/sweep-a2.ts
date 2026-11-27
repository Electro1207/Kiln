import type { A11yMetaMap } from "./types";

export const meta: A11yMetaMap = {
  "text-field": {
    features: ["calm", "reduceMotion", "highContrast", "strongFocus", "largeTargets"],
    pattern: "Text input with a visible label",
    keys: [["Tab", "Move to the field, then to its clear button"], ["Enter or Space", "Press the clear button"]],
    notes: [
      "The label is tied to the input; the hint or error is read with it.",
      "An error is also announced as an alert, and shown as text, not colour alone.",
      "Calm and reduced motion skip the small shake on an error and the pop of the clear button.",
    ],
  },
  textarea: {
    features: ["calm", "reduceMotion", "highContrast", "strongFocus"],
    pattern: "Multi-line text input",
    notes: [
      "The label, hint and error are read with the box; the character count is plain text.",
      "The box changes height at once, not by easing, with calm or reduced motion.",
    ],
  },
  "search-field": {
    features: ["calm", "reduceMotion", "highContrast", "strongFocus", "largeTargets"],
    pattern: "Search box",
    keys: [["Esc", "Clear the text"], ["Tab", "Move to the clear button"]],
    notes: [
      "The magnifier and the shortcut hint are hidden from screen readers; the field needs a label or a placeholder.",
      "Calm stops the loading spinner; calm and reduced motion skip the pop of the clear button.",
    ],
  },
  "number-field": {
    features: ["calm", "reduceMotion", "highContrast", "strongFocus", "largeTargets"],
    pattern: "Spin button",
    keys: [["↑ ↓", "Add or take away one step"], ["Type", "Enter a number; Enter or leaving the field applies it"]],
    notes: [
      "The field is a spin button that reports its value, minimum and maximum.",
      "The plus and minus buttons stay out of the tab order; the arrow keys do the same job.",
      "The rolling digits are a picture only. Calm and reduced motion swap the roll for a fade.",
    ],
  },
  "placeholder-input": {
    features: ["calm", "reduceMotion", "highContrast", "strongFocus"],
    pattern: "Text input with a send button",
    keys: [["Enter", "Send the text"]],
    notes: [
      "The cycling examples are hidden from screen readers; the input has its own label.",
      "Calm and reduced motion hold the first example and skip the dissolve after sending.",
    ],
  },
  select: {
    features: ["calm", "reduceMotion", "highContrast", "strongFocus", "largeTargets"],
    pattern: "Listbox (select-only combobox)",
    keys: [
      ["Enter, Space or ↓", "Open the list"],
      ["↑ ↓", "Move between options"],
      ["Home or End", "First or last option"],
      ["A letter", "Jump to the option that starts with it"],
      ["Enter", "Choose and close"],
      ["Esc", "Close and keep the old choice"],
    ],
    notes: [
      "The chosen option is named in the button, so a screen reader hears the label and the value together.",
      "Calm and reduced motion stop the chevron turning and the tick growing.",
    ],
  },
  combobox: {
    features: ["calm", "reduceMotion", "screenReaderHints", "highContrast", "strongFocus"],
    pattern: "Combobox with a listbox",
    keys: [
      ["Type", "Filter the list"],
      ["↑ ↓", "Move between matches"],
      ["Enter", "Choose the highlighted match"],
      ["Esc", "Close the list"],
    ],
    notes: [
      "Focus stays in the text box; the highlighted option is named with aria-activedescendant.",
      "With screen reader hints on, the number of matches is announced as you type.",
      "Calm and reduced motion keep the rows still as the list narrows.",
    ],
  },
  "date-picker": {
    features: ["calm", "reduceMotion", "colourSafe", "highContrast", "strongFocus", "largeTargets"],
    pattern: "Date picker dialog (grid)",
    keys: [
      ["← → ↑ ↓", "Move between days"],
      ["Page Up or Page Down", "Previous or next month"],
      ["Home or End", "Start or end of the week"],
      ["Enter or Space", "Choose the day"],
      ["Esc", "Close the calendar"],
    ],
    notes: [
      "Every day has its full date as its name; today is marked with aria-current.",
      "The month name is read out when it changes.",
      "Colour safe and high contrast add an outline to the days inside a range, so the range is not colour alone.",
      "Calm and reduced motion change month without sliding.",
    ],
  },
  "time-picker": {
    features: ["calm", "reduceMotion", "highContrast", "strongFocus"],
    pattern: "Dialog with two spin buttons",
    keys: [
      ["↑ ↓", "Earlier or later by one stop"],
      ["Page Up or Page Down", "Four stops at a time"],
      ["Esc", "Close the picker"],
    ],
    notes: [
      "Each wheel is a spin button with its value read as two digits.",
      "Calm and reduced motion jump to the new time instead of gliding.",
    ],
  },
  "file-dropzone": {
    features: ["calm", "reduceMotion", "highContrast", "strongFocus", "screenReaderHints"],
    pattern: "File picker with a drop area",
    keys: [["Tab", "Move to the browse button, then to each file's buttons"], ["Enter or Space", "Open the file picker, retry or remove"]],
    notes: [
      "Dragging is never needed: the browse button is always there and works with the keyboard.",
      "A finished or failed upload is announced with the file name; progress is a named progress bar, not a stream of announcements.",
      "Calm and reduced motion stop the cloud lifting and the files sliding in.",
    ],
  },
  "chip-filter": {
    features: ["calm", "reduceMotion", "highContrast", "strongFocus", "largeTargets"],
    pattern: "Toggle buttons in a group",
    keys: [["Tab", "Move between chips"], ["Enter or Space", "Turn a chip on or off"]],
    notes: [
      "Each chip reports whether it is pressed; an active chip also shows a tick, so it is not colour alone.",
      "Calm and reduced motion keep neighbouring chips still when one changes width.",
    ],
  },
  "phone-input": {
    features: ["calm", "reduceMotion", "highContrast", "strongFocus", "largeTargets"],
    pattern: "Text input with a country listbox",
    keys: [["Tab", "Move from the country button to the number"], ["↑ ↓", "Move between countries in the list"], ["Enter", "Choose the country"]],
    notes: [
      "The country button names the country and dial code; the list has a search box.",
      "A wrong length is shown as text under the field.",
      "Calm and reduced motion stop the chevron turning.",
    ],
  },
  "currency-input": {
    features: ["highContrast", "strongFocus"],
    pattern: "Text input with a visible label",
    notes: [
      "The amount is formatted for the locale as you type, and the caret stays beside the digit it was next to.",
      "The currency code is shown as text beside the amount.",
    ],
  },
  "booking-slots": {
    features: ["calm", "reduceMotion", "screenReaderHints", "highContrast", "strongFocus", "largeTargets"],
    pattern: "Stepped form with a calendar",
    keys: [["Tab", "Move between length, day, times and Next"], ["Enter or Space", "Pick a time"], ["← → ↑ ↓", "Move between days in the calendar"]],
    notes: [
      "Each time button reports whether it is chosen.",
      "With screen reader hints on, picking a day announces how many times are free.",
      "The confirmation is a status message. Calm and reduced motion swap the sliding steps for a fade.",
    ],
  },
  "mentions-textarea": {
    features: ["screenReaderHints", "highContrast", "strongFocus"],
    pattern: "Textbox with an autocomplete listbox",
    keys: [["@", "Start a mention"], ["↑ ↓", "Move between people"], ["Enter or Tab", "Insert the person"], ["Esc", "Close the list"]],
    notes: [
      "Focus stays in the text box; the highlighted person is named with aria-activedescendant.",
      "With screen reader hints on, the number of people who match is announced.",
    ],
  },
};
