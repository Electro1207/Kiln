import type { A11yMetaMap } from "./types";

export const meta: A11yMetaMap = {
  "kanban-board": {
    features: ["screenReaderHints", "largeTargets", "strongFocus"],
    pattern: "Drag and drop with a keyboard path (pick up, move, drop)",
    keys: [
      ["Tab", "Move between cards and their menu buttons"],
      ["Space or Enter", "Pick a card up, then drop it"],
      ["↑ ↓", "While held: move within the column"],
      ["← →", "While held: move to the next or previous column"],
      ["Esc", "While held: put the card back"],
      ["Enter on the ⋯ button", "Open the move menu: Move to a column, to the top, up or down"],
    ],
    notes: [
      "Every move, by pointer, keyboard or menu, is announced with the new column and position.",
      "A held card shows a ring as well as being announced.",
    ],
  },
  "sortable-list": {
    features: ["screenReaderHints", "largeTargets"],
    pattern: "Reorderable list with drag handles",
    keys: [
      ["Tab", "Move to a row's handle"],
      ["↑ ↓", "Move the row one place"],
      ["Home or End", "Move the row to the top or bottom"],
    ],
    notes: ["Each move is announced as \"Title, position 2 of 5\"."],
  },
  "resizable-panels": {
    features: ["reduceMotion", "largeTargets", "strongFocus"],
    pattern: "Window splitter",
    keys: [
      ["Tab", "Focus the divider"],
      ["← → (↑ ↓ when stacked)", "Resize by 2%"],
      ["Shift + arrows", "Resize by 10%"],
      ["Home or End", "Go to the smallest or largest first panel"],
      ["Enter", "Reset to the starting size"],
    ],
    notes: ["The divider reports its value and limits, and reads out both shares (\"40% / 60%\")."],
  },
  "signature-pad": {
    features: ["largeTargets", "strongFocus"],
    pattern: "Canvas with a typed alternative",
    keys: [
      ["Tab", "Move to Undo, Clear, Type instead and Download"],
      ["Enter on Type instead", "Switch to a name field, drawn in a script style"],
    ],
    notes: [
      "Drawing needs a pointer, so a typed signature is always one button away and works with a keyboard alone.",
      "The mode change is announced.",
    ],
  },
  "image-cropper": {
    features: ["reduceMotion", "largeTargets", "strongFocus"],
    pattern: "Slider-like control with 2D movement",
    keys: [
      ["← → ↑ ↓", "Move the picture by 10 px"],
      ["Shift + arrows", "Move by 40 px"],
      ["+ or −", "Zoom in or out"],
      ["Tab", "Go to the zoom slider"],
    ],
    notes: ["Zoom and position are read out as one value, for example \"Zoom 150%, 20% left, centred down\"."],
  },
  "compare-slider": {
    features: ["reduceMotion", "largeTargets", "strongFocus"],
    pattern: "Slider",
    keys: [
      ["← → or ↑ ↓", "Move the handle by 2%"],
      ["Shift + arrows", "Move by 10%"],
      ["Home or End", "Show all of one side"],
    ],
    notes: ["The value is read out as the share of each side, for example \"50% Before, 50% After\"."],
  },
  "otp-input": {
    features: ["largeTargets", "screenReaderHints"],
    pattern: "Single text field drawn as cells",
    keys: [
      ["0 to 9", "Type the code"],
      ["Ctrl or Cmd + V", "Paste the whole code at once, spaces and dashes are ignored"],
    ],
    notes: [
      "One real input, so SMS autofill (autocomplete one-time-code) and the numeric keyboard work.",
      "Completion is announced.",
    ],
  },
  "auth-forms": {
    features: ["extendedTime", "largeTargets", "strongFocus"],
    pattern: "Form with labelled fields",
    keys: [
      ["Tab", "Move between fields, links and buttons"],
      ["Enter", "Submit"],
    ],
    notes: [
      "Fields carry the right autocomplete values (username, email, name, current or new password), so password managers fill them.",
      "Paste is never blocked. Errors are announced as alerts.",
    ],
  },
  "password-field": {
    features: ["colourSafe", "screenReaderHints", "largeTargets"],
    pattern: "Text field with a toggle button",
    keys: [
      ["Tab", "Move to the Show password button"],
      ["Space or Enter", "Show or hide the password"],
    ],
    notes: [
      "Each rule says whether it is met in words, not just by its tick colour.",
      "The strength is a word as well as a bar.",
    ],
  },
  "video-player": {
    features: ["captions", "reduceMotion", "calm", "largeTargets"],
    pattern: "Media player with a landmark region",
    keys: [
      ["Space or K", "Play or pause"],
      ["J or L, ← →", "Back or forward"],
      ["M", "Mute"],
      ["C", "Captions on or off"],
      ["F or T", "Full screen or theater"],
    ],
    notes: ["With the Captions setting on, a player that has captions starts with them showing."],
  },
  "media-player": {
    features: ["reduceMotion", "largeTargets"],
    pattern: "Media player with a seek slider",
    keys: [
      ["Space or K", "Play or pause"],
      ["← →", "Seek on the waveform"],
      ["Home or End", "Go to the start or end"],
    ],
    notes: ["The seek bar reads out the time, \"1:12 of 3:45\"."],
  },
  "audio-spectrum": {
    features: ["calm", "reduceMotion", "noFlashing", "highContrast", "largeTargets"],
    pattern: "Button and image",
    keys: [["Enter or Space", "Play or pause the file"]],
    notes: [
      "The meter is one picture named \"Live spectrum of the sound\"; it never announces levels as they change.",
      "With decorative on, the meter is hidden from screen readers, for use beside a player or mic control that already says what is happening.",
      "Calm, reduced motion and no flashing show one still level instead of moving bars.",
      "High contrast makes the peak caps solid ink.",
      "Sound only starts when someone presses play. The microphone is measured, never played back.",
    ],
  },
  "infinite-feed": {
    features: ["calm", "screenReaderHints", "extendedTime"],
    pattern: "Feed",
    keys: [
      ["Tab", "Move to the Load more button after the last item"],
      ["Enter", "Load the next page without scrolling"],
    ],
    notes: [
      "The list is a feed, marked busy while a page loads.",
      "Load more is always reachable by keyboard, and stays visible when calm or extended time is on.",
    ],
  },
  "virtual-list": {
    features: ["screenReaderHints"],
    pattern: "Listbox",
    keys: [
      ["↑ ↓", "Move the active row"],
      ["Page Up or Page Down", "Move by a page"],
      ["Home or End", "First or last row"],
      ["Enter", "Choose the active row"],
    ],
    notes: ["Rows that are not drawn are still counted: each row says its place, \"12 of 10,000\"."],
  },
  "rich-text-editor": {
    features: ["largeTargets", "strongFocus"],
    pattern: "Toolbar with roving focus",
    keys: [
      ["Tab", "Enter and leave the toolbar (it is one stop)"],
      ["← →", "Move between tools"],
      ["Home or End", "First or last tool"],
      ["Ctrl or Cmd + B, I, U", "Bold, italic, underline"],
    ],
    notes: ["Each tool says whether it is on (pressed), not only by its fill."],
  },
  tag: {
    features: ["largeTargets"],
    notes: ["The remove button keeps its look and gains a larger hit area."],
  },
  "tag-input": {
    features: ["largeTargets"],
    notes: ["The remove buttons on chips keep their look and gain a larger hit area."],
  },
  banner: {
    features: ["largeTargets", "extendedTime"],
    notes: ["The dismiss button keeps its look and gains a larger hit area."],
  },
  alert: {
    features: ["largeTargets"],
    notes: ["The dismiss button keeps its look and gains a larger hit area."],
  },
};
