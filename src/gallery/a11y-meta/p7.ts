import type { A11yMetaMap } from "./types";

export const meta: A11yMetaMap = {
  "session-timeout": {
    features: ["extendedTime", "screenReaderHints"],
    pattern: "Alert dialog (modal)",
    keys: [
      ["Tab", "Move between Stay signed in and Sign out; focus stays inside"],
      ["Enter or Space", "Press the focused button"],
    ],
    notes: [
      "Extended time triples the warning window, so there is three times as long to answer.",
      "Screen readers hear the time left at 60 seconds and again, assertively, at 10 seconds.",
      "The countdown is hidden from screen readers; they get the time once, not every second.",
      "Esc does not dismiss it: the session needs an answer, and Stay signed in has focus.",
    ],
  },
  "connection-status": {
    features: ["reduceMotion", "extendedTime"],
    pattern: "Status (polite live region)",
    notes: [
      "Going offline and coming back are announced politely through the shared announcer.",
      "Reduced motion fades the pill in without sliding it.",
      "Extended time keeps \"Back online\" on screen three times as long.",
    ],
  },
  countdown: {
    features: ["calm", "reduceMotion", "screenReaderHints"],
    pattern: "Timer",
    notes: [
      "Screen readers get one label, such as \"2 days 3 hours 14 minutes left\", refreshed once a minute. Seconds are never read out.",
      "Calm updates once a minute and leaves the seconds out.",
      "Digits share a fixed-width cell and cross-fade, so the layout never shifts.",
      "Finishing is announced politely.",
    ],
  },
  "model-picker": {
    features: ["largeTargets", "screenReaderHints"],
    pattern: "Listbox (select-only combobox button)",
    keys: [
      ["↓ ↑ Enter Space", "Open the list from the button"],
      ["↓ ↑ Home End", "Move through the models, skipping unavailable ones"],
      ["Enter or Space", "Choose the highlighted model"],
      ["Type a letter", "Jump to a model by name"],
      ["Esc", "Close and return focus to the button"],
    ],
    notes: [
      "Each option is named by the model, and its description, speed and cost are read as its description.",
      "Speed and cost are words as well as icons and symbols.",
      "Large targets give every row at least 44px.",
    ],
  },
  "usage-meter": {
    features: ["colourSafe", "highContrast"],
    pattern: "Meter",
    notes: [
      "role=\"meter\" with a spoken value such as \"91K of 100K credits, running low\".",
      "Running low and over the limit say so in words and with an icon, not colour alone.",
      "Colour-safe adds a hatch to the filled bar once it warns.",
    ],
  },
  "voice-input": {
    features: ["calm", "noFlashing", "screenReaderHints"],
    pattern: "Toggle button",
    keys: [
      ["Enter or Space", "Start or stop listening"],
    ],
    notes: [
      "One button name, with aria-pressed carrying whether it is on.",
      "Starting and stopping are announced; a blocked or missing microphone is shown as an alert, and the form beside it still works by typing.",
      "The level bars are hidden from screen readers. Calm shows one still level instead of moving bars.",
    ],
  },
  "coupon-field": {
    features: ["largeTargets", "screenReaderHints"],
    pattern: "Text field with a status message",
    keys: [
      ["Enter", "Apply the code from inside the field"],
      ["Tab", "Move from the field to Apply, or to the remove button on an applied code"],
    ],
    notes: [
      "Errors and the applied message sit in a live region tied to the field with aria-describedby.",
      "The field is marked invalid on an error, and the border changes as well as the message.",
      "After applying, focus moves to the chip's remove button; after removing, it returns to the field.",
    ],
  },
  "shipment-tracker": {
    features: ["reduceMotion", "screenReaderHints"],
    pattern: "Ordered list with aria-current=\"step\"",
    notes: [
      "The step the parcel has reached is aria-current=\"step\".",
      "Every step says done, current step or not yet in text, and times are real <time> elements.",
      "Estimated times start with \"Est.\" so they are not read as facts.",
      "Reduced motion fills the line without travelling.",
    ],
  },
  "image-cropper": {
    features: ["reduceMotion"],
    pattern: "Slider with arrow-key panning",
    keys: [
      ["← → ↑ ↓", "Move the picture"],
      ["+ −", "Zoom in and out"],
    ],
    notes: ["The frame carries its zoom and position as its spoken value (aria-valuetext)."],
  },
  "size-picker": {
    features: ["largeTargets"],
    pattern: "Radio group",
    keys: [
      ["← → ↑ ↓", "Move between sizes that are in stock and choose"],
      ["Tab", "Leave the group"],
    ],
    notes: ["Sold-out sizes are struck through and also named \"sold out\" for screen readers."],
  },
  "time-wheels": {
    features: ["reduceMotion"],
    pattern: "Spinbutton (one per wheel)",
    keys: [
      ["↑ ↓", "Change the hour or minute"],
      ["Tab", "Move from the hours wheel to the minutes wheel"],
    ],
    notes: ["Each wheel is a spinbutton with its own name and a spoken value, and also scrolls natively."],
  },
  "heading-tabs": {
    features: ["largeTargets", "highContrast"],
    pattern: "Tabs",
    notes: [
      "A tab list with the selected tab marked by aria-selected and by an underline as well as a heavier weight.",
      "The row scrolls sideways when it is narrower than its tabs.",
    ],
  },
  stars: {
    features: ["colourSafe", "screenReaderHints"],
    pattern: "Image with a text alternative",
    notes: [
      "Read as one image named \"4.3 out of 5 stars\"; the five drawn stars are hidden.",
      "Next to it, show the number as text so the rating never relies on the stars alone.",
    ],
  },
};
