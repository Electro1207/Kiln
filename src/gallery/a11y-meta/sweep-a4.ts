import type { A11yMetaMap } from "./types";

export const meta: A11yMetaMap = {
  dialog: {
    features: ["reduceMotion", "strongFocus", "largeTargets"],
    pattern: "Dialog (modal)",
    keys: [
      ["Tab or Shift+Tab", "Move between controls; focus stays inside the window"],
      ["Esc", "Close"],
    ],
    notes: [
      "The window is named by its title and described by its description. The page behind it is not reachable while it is open.",
      "Focus moves in when it opens and returns to the button that opened it when it closes.",
      "Reduced motion fades the window in place instead of scaling it up or sliding the phone sheet.",
      "On a phone the drag handle is an extra way to close; the close button and Esc always work.",
    ],
  },
  "alert-dialog": {
    features: ["reduceMotion", "strongFocus", "largeTargets"],
    pattern: "Alert dialog",
    keys: [
      ["Tab or Shift+Tab", "Move between Cancel and the confirm button"],
      ["Esc", "Cancel"],
    ],
    notes: [
      "Announced as an alert dialog, so the question is read out at once.",
      "Focus starts on Cancel, the safe answer, never on the destructive button.",
      "While the action runs, the confirm button shows a spinner and the dialog cannot be dismissed.",
      "Reduced motion fades it in place.",
    ],
  },
  drawer: {
    features: ["reduceMotion", "strongFocus", "largeTargets"],
    pattern: "Dialog (modal)",
    keys: [
      ["Tab or Shift+Tab", "Move between controls; focus stays inside the panel"],
      ["Esc", "Close"],
    ],
    notes: [
      "The panel is named by its title, or by its label when it has no visible title.",
      "Dragging toward the edge closes it, but the close button and Esc do the same without a pointer.",
      "Focus returns to the opener when it closes.",
      "Reduced motion fades the panel in place instead of sliding it from the edge.",
    ],
  },
  popover: {
    features: ["reduceMotion", "strongFocus"],
    pattern: "Disclosure dialog",
    keys: [
      ["Enter or Space", "Open from the button"],
      ["Esc", "Close and return to the button"],
    ],
    notes: [
      "The button says whether the panel is open, and points to it while it is.",
      "Pressing outside closes it; focus goes back to the button after Esc or the close action.",
      "Reduced motion fades it in place instead of popping.",
    ],
  },
  "hover-card": {
    features: ["extendedTime", "reduceMotion"],
    pattern: "Tooltip-like preview (WCAG 1.4.13)",
    keys: [
      ["Tab", "Focus the link; the card opens"],
      ["Esc", "Close the card"],
    ],
    notes: [
      "Opens on keyboard focus as well as hover, so it is not pointer-only.",
      "The pointer can move onto the card without it closing, and it stays while the link is focused.",
      "Extended time keeps it open three times longer after the pointer leaves.",
      "Reduced motion fades it in place.",
    ],
  },
  lightbox: {
    features: ["reduceMotion", "strongFocus", "largeTargets"],
    pattern: "Dialog (modal) with image gallery",
    keys: [
      ["Enter", "Open a thumbnail"],
      ["← →", "Previous or next picture"],
      ["Esc", "Close and return to the thumbnail"],
    ],
    notes: [
      "Each thumbnail is a button named by its picture's description. The open picture is named by that description too, with \"2 of 6\" under it.",
      "Previous, next and close are real buttons as well as swipes and clicks.",
      "Reduced motion fades the picture in and out instead of flying it between the thumbnail and the screen.",
    ],
  },
  "keyboard-shortcuts": {
    features: ["screenReaderHints", "reduceMotion"],
    pattern: "Dialog (modal)",
    keys: [
      ["?", "Open the list from anywhere outside a text field"],
      ["Type", "Filter the list; focus starts in the filter"],
      ["Esc", "Close"],
    ],
    notes: [
      "Shortcuts are a definition list: each action is paired with its keys, so a screen reader reads them together.",
      "Screen reader hints announce how many shortcuts match as you type.",
      "The \"?\" key is ignored while typing in a field, so it never steals text.",
    ],
  },
  "cookie-consent": {
    features: ["reduceMotion", "strongFocus", "largeTargets"],
    pattern: "Non-modal dialog",
    keys: [
      ["Tab", "Move through Accept, Reject, Choose and the policy link"],
      ["Space", "Switch a category on or off"],
    ],
    notes: [
      "Accept and Reject look the same size and weight, so neither is the easy way out.",
      "Choose says whether the categories are open. Required categories are shown switched on and cannot be changed.",
      "The card does not trap focus or hide the page, so the page stays usable.",
      "Reduced motion fades the card and shows the categories at once.",
    ],
  },
  "field-message": {
    features: ["reduceMotion", "colourSafe"],
    pattern: "Live region",
    notes: [
      "An error is read out at once; a hint or a success is read out politely.",
      "Errors and successes carry an icon, so the red or green is never the only signal.",
      "Tie it to its field with the id so the field reads the message too.",
      "Reduced motion fades the line in without sliding.",
    ],
  },
  meter: {
    features: ["colourSafe", "reduceMotion", "screenReaderHints"],
    pattern: "Meter",
    notes: [
      "Read out as a meter with its value, such as \"4.2 of 10 GB\", and \"nearly full\" or \"full\" once it passes the warning levels.",
      "Colour safe writes \"nearly full\" or \"full\" beside the figure, so amber and red are never the only signal.",
      "Segments are listed with their names and amounts below the bar.",
      "Reduced motion jumps to the value instead of easing.",
    ],
  },
  progress: {
    features: ["calm", "reduceMotion", "colourSafe"],
    pattern: "Progressbar",
    notes: [
      "A known amount is read as a value; with no value it is read as busy with no percentage.",
      "Calm and reduced motion hold the busy band still instead of running it back and forth.",
      "Colour safe stripes an error bar so it is not red alone.",
      "Put the number in the value text too, so the amount is never only in the bar.",
    ],
  },
  "progress-ring": {
    features: ["reduceMotion", "calm"],
    pattern: "Progressbar",
    notes: [
      "Read out as a progress bar with its percentage; the drawn arc and the number are hidden from screen readers so the value is not read twice.",
      "Give it a label so it says what is progressing.",
      "Reduced motion and calm jump to the value instead of easing the arc and number.",
    ],
  },
  "empty-state": {
    features: ["calm", "reduceMotion"],
    pattern: "Heading and text",
    notes: [
      "A heading, a sentence and the one action, in reading order.",
      "The drawn shelf is hidden from screen readers.",
      "Calm and reduced motion show everything at once and hold the tipping pot still.",
    ],
  },
  "notification-center": {
    features: ["reduceMotion", "screenReaderHints"],
    pattern: "Disclosure dialog with tabs",
    keys: [
      ["Enter or Space", "Open the inbox or a notice"],
      ["← →", "Move between All, Unread and Mentions"],
      ["Esc", "Close and return to the bell"],
    ],
    notes: [
      "The bell says how many notices are unread.",
      "Each row says Unread or Read in words, not only with the dot.",
      "Opening a notice marks it read; a row leaving the Unread tab folds away.",
      "Reduced motion fades the empty message in place.",
    ],
  },
  "onboarding-wizard": {
    features: ["reduceMotion", "calm", "strongFocus"],
    pattern: "Form wizard",
    keys: [
      ["Enter", "Continue, or Finish on the summary"],
      ["Tab", "Move through the step's fields and the Back and Continue buttons"],
    ],
    notes: [
      "Progress is written as \"Step 2 of 4\" and also drawn as a progress bar.",
      "After each move focus goes to the new step's heading, so a screen reader starts reading from the top of it.",
      "A failed Continue shows each message next to its field and keeps what was typed.",
      "Reduced motion and calm fade between steps instead of sliding, and the height changes at once.",
    ],
  },
};
