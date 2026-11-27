import type { A11yMetaMap } from "./types";

/* Notes for the buttons, choice controls and forms that had none (package A1). */
export const meta: A11yMetaMap = {
  button: {
    features: ["reduceMotion", "calm", "noFlashing", "largeTargets", "strongFocus"],
    pattern: "Button",
    keys: [["Enter or Space", "Press the button (a link with href takes Enter)"]],
    notes: [
      "A real button, or a real link when it has an href. Loading sets aria-busy and blocks presses; the width does not change.",
      "Reduced motion removes the press scale. Calm, reduced motion and no flashing drop the blur while loading, so only a fade remains.",
      "The spinner keeps turning under calm: it is the only sign that something is happening.",
      "Large targets raise every size to at least 44px.",
    ],
  },
  "icon-button": {
    features: ["reduceMotion", "largeTargets", "strongFocus"],
    pattern: "Button",
    keys: [["Enter or Space", "Press the button"]],
    notes: [
      "An icon alone has no name, so aria-label is required by the type.",
      "Reduced motion removes the press scale. Large targets grow every size to 44px.",
    ],
  },
  "button-group": {
    features: ["reduceMotion", "largeTargets", "strongFocus"],
    pattern: "Group, and Menu button for the split button",
    keys: [
      ["Tab", "Move between the buttons in the strip"],
      ["↓", "Open the split button's menu"],
      ["↑ ↓", "Move through the menu items"],
      ["Esc", "Close the menu and return to its button"],
    ],
    notes: [
      "The strip is a named group. The split button's menu has aria-haspopup, aria-expanded and a roving tabindex, and opens with focus on its first item.",
      "Reduced motion removes the press scale, chevron turn and menu pop.",
    ],
  },
  "segmented-control": {
    features: ["highContrast", "largeTargets", "strongFocus"],
    pattern: "Radio group",
    keys: [
      ["← →", "Move to the previous or next option and choose it"],
      ["Tab", "Enter and leave the control (one stop)"],
    ],
    notes: [
      "Options are radios with aria-checked and roving focus; the group takes its name from the label prop.",
      "The chosen option has a raised fill and stronger text, not colour alone.",
    ],
  },
  "toggle-button": {
    features: ["reduceMotion", "largeTargets", "strongFocus"],
    pattern: "Toggle button",
    keys: [["Enter or Space", "Press or release the button"]],
    notes: [
      "State is aria-pressed. The pressed look is a fill, and an optional swapped icon or label, so it is not colour alone.",
      "Reduced motion removes the press scale and the icon swap movement.",
    ],
  },
  "copy-button": {
    features: ["reduceMotion", "extendedTime", "largeTargets", "strongFocus"],
    pattern: "Button",
    keys: [["Enter or Space", "Copy the text"]],
    notes: [
      "\"Copied\" is spoken through a polite live region, and the tick and word both change, so the result is not shown by colour alone.",
      "Extended time keeps the confirmation three times longer.",
      "Reduced motion removes the press scale and the icon movement.",
    ],
  },
  link: {
    features: ["reduceMotion", "calm", "strongFocus"],
    pattern: "Link",
    keys: [["Enter", "Follow the link"]],
    notes: [
      "A real anchor. External links open in a new tab with rel=noreferrer; the arrow is hidden from screen readers.",
      "The underline draws on hover and on keyboard focus. Calm and reduced motion show it at once and keep the arrow still.",
    ],
  },
  "color-swatches": {
    features: ["reduceMotion", "colourSafe", "highContrast", "strongFocus"],
    pattern: "Radio group",
    keys: [
      ["← → ↑ ↓", "Move to another colour and choose it"],
      ["Tab", "Enter and leave the group (one stop)"],
    ],
    notes: [
      "Every swatch is named (\"Ocean\"), and the chosen name is written next to the label, so colour is never the only way to choose.",
      "The chosen swatch has a ring and a tick on top of its colour, so it reads without telling hues apart.",
      "Reduced motion removes the hover and press scale.",
    ],
  },
  "color-picker": {
    features: ["highContrast", "largeTargets", "strongFocus"],
    pattern: "Dialog with sliders",
    keys: [
      ["← → ↑ ↓", "Move the saturation and brightness point, or a hue or opacity slider"],
      ["Shift with arrows", "Move in larger steps"],
      ["Enter", "Commit a typed hex, rgb or hsl value"],
      ["Esc", "Close the popover"],
    ],
    notes: [
      "The colour area, hue and opacity are sliders with values read out, and the colour can always be typed as hex, rgb or hsl.",
      "The trigger button says the colour as text (\"Colour: #1B6C80\"), so nothing depends on seeing it.",
      "Optional saved colours are buttons named with their value.",
    ],
  },
  checkbox: {
    features: ["reduceMotion", "highContrast", "largeTargets", "strongFocus"],
    pattern: "Checkbox (with mixed state)",
    keys: [["Space", "Check or uncheck"]],
    notes: [
      "The box is a role=checkbox with aria-checked true, false or mixed, tied to its label and description.",
      "A tick or a dash shows the state as well as the fill. The group's parent box goes mixed when only some are chosen.",
      "Reduced motion removes the press scale and the staggered entrance of group options.",
    ],
  },
  "radio-group": {
    features: ["highContrast", "largeTargets", "strongFocus"],
    pattern: "Radio group",
    keys: [
      ["↑ ↓ ← →", "Move to the next or previous enabled option and choose it"],
      ["Tab", "Enter and leave the group (one stop)"],
    ],
    notes: [
      "A named radiogroup with roving focus; disabled options are skipped.",
      "The choice is a filled dot, and on card tiles also a border and tint, not colour alone.",
    ],
  },
  switch: {
    features: ["reduceMotion", "highContrast", "largeTargets", "strongFocus"],
    pattern: "Switch",
    keys: [["Space or Enter", "Turn on or off"]],
    notes: [
      "A role=switch with aria-checked, tied to its label and description.",
      "On and off differ by the thumb's side as well as the track colour.",
      "Reduced motion drops the thumb glide and the press stretch.",
    ],
  },
  slider: {
    features: ["reduceMotion", "highContrast", "largeTargets", "strongFocus"],
    pattern: "Slider (and multi-thumb slider)",
    keys: [
      ["← → ↑ ↓", "Change by one step"],
      ["Page Up or Page Down", "Change by a tenth of the range"],
      ["Home or End", "Jump to the minimum or maximum"],
    ],
    notes: [
      "Each thumb is a slider with value, min, max and a spoken value; a range names its thumbs Minimum and Maximum.",
      "The value is written beside the label, and a bubble shows it while dragging or focused.",
      "Reduced motion makes thumbs jump to a new value instead of gliding.",
    ],
  },
  rating: {
    features: ["reduceMotion", "calm", "colourSafe", "strongFocus"],
    pattern: "Slider",
    keys: [
      ["→ ↑", "One star more"],
      ["← ↓", "One star less"],
      ["0 to 9", "Set the rating"],
      ["Home or End", "No stars, or all stars"],
    ],
    notes: [
      "One slider for the whole row, with a spoken value (\"3 of 5\", or a word like \"Good\").",
      "Lit stars are filled and unlit are hollow, so the value does not depend on colour.",
      "Reduced motion and calm skip the hop when a star is chosen.",
    ],
  },
  "settings-section": {
    features: ["reduceMotion", "largeTargets", "strongFocus"],
    pattern: "Region",
    keys: [["Tab", "Move through the controls"]],
    notes: [
      "Each section is a labelled region named by its heading; rows tie their label to the control.",
      "The save bar appears with a polite announcement, so people who cannot see it rise still learn there are unsaved changes.",
      "Reduced motion makes the save bar appear without rising.",
    ],
  },
  "inline-edit": {
    features: ["largeTargets", "strongFocus"],
    pattern: "Button that becomes a text box",
    keys: [
      ["Enter", "Start editing, or save"],
      ["Esc", "Put the old text back"],
    ],
    notes: [
      "The button's name gives the field, its text and the action (\"Ship name: Aurora. Edit\"). Focus moves into the box, and back to the button when done.",
      "The edit pencil also shows on keyboard focus, not only on hover.",
    ],
  },
  "avatar-upload": {
    features: ["reduceMotion", "largeTargets", "strongFocus"],
    pattern: "Buttons and image",
    keys: [
      ["Enter or Space", "Upload, try a sample, remove, cancel or use the picture"],
      ["Arrow keys", "Pan the picture in the cropper"],
    ],
    notes: [
      "The avatar is one image named with the person's name, and says whether there is a picture.",
      "A wrong file type or a file that is too large shows as an alert.",
      "The cropper pans with the arrow keys and zooms with a slider, so nothing needs dragging.",
      "Reduced motion makes the cropper appear without sliding and zoom without gliding.",
    ],
  },
  "key-value-editor": {
    features: ["reduceMotion", "largeTargets", "strongFocus"],
    pattern: "List of text fields",
    keys: [
      ["Tab", "Move between key, value and row buttons"],
      ["Enter on Add", "Add a row and focus its key"],
    ],
    notes: [
      "Each field is named by its column and row number. An invalid or repeated key is described by its error text and marked aria-invalid.",
      "Adding and removing a row is announced, and focus moves to the new row or the nearest one left.",
      "Secrets are marked by a lock icon and a masked field, with Reveal and Hide buttons, so colour is not needed.",
    ],
  },
};
