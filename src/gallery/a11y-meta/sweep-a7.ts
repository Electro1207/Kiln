import type { A11yMetaMap } from "./types";

/* Notes for commerce, marketing, primitives and the tokens group. */
export const meta: A11yMetaMap = {
  "colour-tokens": {
    features: ["highContrast", "colourSafe"],
    notes: [
      "Text and surface pairs are chosen to read at AA contrast in both themes; high contrast makes muted text ink and lines stronger without touching the tokens.",
      "Status colours (positive, negative, warning, info) always come with a word or an icon in the components; the colour-safe palette is the --k-cvd series.",
      "Each swatch is a button that copies its variable name, so it works from the keyboard.",
    ],
  },
  "type-scale": {
    features: [],
    notes: [
      "Sizes are in rem, so the person's text size setting scales every step.",
      "Text spacing and the readable font are applied page-wide and never clip the type.",
    ],
  },
  "motion-presets": {
    features: ["calm", "reduceMotion"],
    notes: [
      "Every preset is a spring or a fade. Reduced motion makes Motion skip them, so nothing travels.",
      "The demo moves only when someone presses Play all.",
    ],
  },
  "theme-toggle": {
    features: ["reduceMotion", "calm"],
    pattern: "Button",
    keys: [["Enter or Space", "Switch between light and dark"]],
    notes: [
      "The button's name says what pressing it does (\"Switch to dark mode\"), so it follows the current theme.",
      "The sun and moon are decoration and hidden from screen readers.",
      "Reduced motion and calm swap the icon at once instead of morphing it; with reduced motion on, the new theme also appears without the circular reveal.",
      "The three-way switch is a radio group: one stop in the Tab order, arrows are not needed because each choice is its own button.",
    ],
  },
  "colorway-picker": {
    features: ["highContrast", "reduceMotion", "colourSafe"],
    pattern: "Radio group",
    keys: [
      ["← → ↑ ↓", "Choose the previous or next colorway"],
      ["Home or End", "First or last colorway"],
    ],
    notes: [
      "Each swatch is named after its colorway, so colour is never the only way to tell them apart.",
      "The chosen swatch has a ring, not just a different colour; the chosen name is also written above.",
      "High contrast makes the swatch outlines solid ink.",
      "Reduced motion applies the new colours without the circular reveal.",
    ],
  },
  colorway: {
    features: ["highContrast"],
    notes: [
      "Recolours one region. The text colour is worked out from the ground so text stays readable.",
      "It adds no roles of its own; give it a label when it is a landmark (section, aside).",
      "Accessibility features set on it apply to everything inside.",
    ],
  },
  "scroll-area": {
    features: ["highContrast", "reduceMotion", "calm"],
    pattern: "Scrollable region",
    keys: [
      ["Tab", "Focus the area"],
      ["↑ ↓, Page Up, Page Down, Home, End", "Scroll it"],
    ],
    notes: [
      "The scrolling area itself takes focus, so keyboard users can scroll it, and it shows the focus ring.",
      "The thumb is a mouse and touch aid only, hidden from screen readers.",
      "High contrast keeps the thumb always visible and darker.",
      "Reduced motion and calm jump instead of gliding when the track is pressed.",
    ],
  },
  separator: {
    features: ["calm", "reduceMotion"],
    pattern: "Separator",
    notes: [
      "A real separator, so screen readers announce the break between groups.",
      "Calm and reduced motion draw the line at once instead of growing it in.",
    ],
  },
  "aspect-image": {
    features: ["calm", "reduceMotion"],
    pattern: "Image",
    notes: [
      "The space is reserved first, so the page does not jump when the picture loads.",
      "The alt text is required; the blurred preview is hidden from screen readers.",
      "A caption makes it a figure with a figcaption.",
      "Calm and reduced motion show the picture without the fade and settle.",
    ],
  },
  hero: {
    features: ["calm", "reduceMotion"],
    pattern: "Section with a heading",
    notes: [
      "The title is a real heading (level 1 or 2 to suit the page), and the picture needs alt text.",
      "Calm and reduced motion show everything in place, with no entrance.",
    ],
  },
  "feature-split": {
    features: ["calm", "reduceMotion"],
    pattern: "Section with a heading",
    notes: [
      "The points are a description list, so each title is tied to its text.",
      "Calm and reduced motion show the text and picture in place, with no entrance.",
    ],
  },
  "bento-grid": {
    features: [],
    pattern: "Group of articles",
    notes: [
      "Each tile is an article with a heading, so screen reader users can jump between tiles.",
      "The picture at the top is whatever you pass: give it a label, or hide it when it only repeats the text.",
    ],
  },
  "stats-section": {
    features: ["calm", "reduceMotion", "noFlashing"],
    pattern: "Description list",
    notes: [
      "Each figure is read once, as its final value; the counting is hidden from screen readers.",
      "Calm, reduced motion and no flashing show the final figures at once instead of counting up.",
      "The final figure reserves its width, so nothing shifts while counting.",
    ],
  },
  "cta-section": {
    features: [],
    pattern: "Section with links",
    notes: [
      "The actions are real links, with a 44px tall hit area.",
      "The text on the filled variant uses the button colours, which are checked for contrast in both themes.",
    ],
  },
  newsletter: {
    features: ["screenReaderHints"],
    pattern: "Form with live feedback",
    keys: [["Enter", "Subscribe"]],
    notes: [
      "The field has a hidden label and is described by its message line.",
      "An error is announced as an alert and the field is marked invalid; the message says what to fix.",
      "On success the form is replaced by a status message that is read out.",
    ],
  },
  "contact-section": {
    features: ["screenReaderHints"],
    pattern: "Form with live feedback",
    keys: [["Enter", "Send, from any field except the message"]],
    notes: [
      "Every field has a visible label; errors show once sending is tried and are tied to their fields.",
      "A failed send is announced as an alert; success is announced as a status.",
      "Phone numbers and emails are links (tel and mailto).",
    ],
  },
  "team-grid": {
    features: [],
    pattern: "List",
    notes: [
      "Initials are hidden from screen readers; the name and role are the text.",
      "Profile links appear on hover and when anything inside has focus, and are always shown on touch screens. Each link is named with the person's name.",
    ],
  },
  "faq-section": {
    features: [],
    pattern: "Accordion",
    keys: [
      ["Enter or Space", "Open or close a question"],
      ["↑ ↓", "Move between questions"],
    ],
    notes: ["The questions use the Accordion pattern; see the Accordion notes for its full keyboard map."],
  },
  testimonials: {
    features: [],
    pattern: "Figure with a quotation",
    notes: [
      "Each quote is a blockquote inside a figure, with the person as the caption.",
      "Only one arrangement is in the page at a time, so nothing is read twice.",
    ],
  },
  "blog-list": {
    features: [],
    pattern: "List of articles",
    notes: [
      "Each title is a link that covers the whole card, so the card has one tab stop.",
      "The date is a time element; covers need alt text, and drawn covers are hidden from screen readers.",
    ],
  },
  changelog: {
    features: ["colourSafe"],
    pattern: "Ordered list with a radio group filter",
    keys: [
      ["Tab", "Move to the filter, then to the older-releases button"],
      ["Enter or Space", "Choose a filter or show older releases"],
    ],
    notes: [
      "The kind of change is written as a word on every line (New, Fixed...), never colour alone.",
      "Each release has an anchor id for links when you set a prefix.",
      "The filter is a radio group; the result updates in place.",
    ],
  },
  "not-found": {
    features: [],
    pattern: "Section with a heading and a navigation",
    notes: [
      "The big code is decoration and hidden from screen readers; the heading says what happened.",
      "The suggestions are a labelled navigation of links.",
    ],
  },
  footer: {
    features: ["highContrast", "calm", "reduceMotion"],
    pattern: "Contentinfo landmark with navigations",
    notes: [
      "Each column is a labelled navigation, so screen readers can list the footer's groups.",
      "The large name at the foot is decoration, hidden from screen readers; link text is the real content.",
      "Links dimmed to 75% return to full strength on hover and keyboard focus, and show an outline when focused.",
      "Calm and reduced motion show the name in place, with no rise.",
    ],
  },
  "powered-by-kiln": {
    features: [],
    pattern: "Link",
    notes: [
      "A real link that opens a new tab; the text says so for screen readers.",
      "It takes the colour of the text around it, so make sure the surrounding contrast is enough.",
    ],
  },
  "product-gallery": {
    features: ["calm", "reduceMotion", "highContrast"],
    pattern: "Group with tabs",
    keys: [
      ["← →", "Previous or next picture, from the large picture or a thumbnail"],
      ["Tab", "Move between the large picture and the thumbnails"],
    ],
    notes: [
      "The large picture is a labelled group that says \"Picture 2 of 5\" with the alt text; thumbnails are tabs named by the same text.",
      "Swiping is only an extra for touch; the arrows and thumbnails do the same job.",
      "Reduced motion and calm turn the magnifying lens off.",
      "High contrast keeps the other thumbnails and the dots at full strength.",
    ],
  },
  "product-quick-view": {
    features: ["extendedTime", "calm", "reduceMotion"],
    pattern: "Dialog (modal)",
    keys: [
      ["Esc", "Close"],
      ["Tab", "Move through colour, size, quantity and the add button"],
    ],
    notes: [
      "Opens as a dialog that keeps focus inside and returns it on close.",
      "Choosing no size shows an alert instead of failing silently.",
      "\"Added to cart\" is announced; with extended time it stays three times as long.",
    ],
  },
  "cart-drawer": {
    features: ["calm", "reduceMotion", "screenReaderHints"],
    pattern: "Dialog (drawer)",
    keys: [
      ["Esc", "Close"],
      ["Tab", "Move through lines, quantity buttons and Remove"],
    ],
    notes: [
      "Each quantity group is named after its product; the count is a live region.",
      "Removing a line is spoken (\"Item removed from your cart\") and focus stays in the drawer.",
      "The free-shipping bar is a progress bar with a label and a value.",
      "Calm and reduced motion remove the fold that closes the gap after a removal.",
    ],
  },
  "checkout-form": {
    features: ["calm", "reduceMotion"],
    pattern: "Form",
    keys: [["Enter", "Apply a promo code, or place the order"]],
    notes: [
      "Every field has a visible label and its own error message; autocomplete hints are set for the browser.",
      "Delivery options are a radio group of cards.",
      "The demo card is shown as readable text, labelled as not editable and not taking payment.",
      "The phone summary toggle says whether it is open (aria-expanded); calm and reduced motion open it without the height fold.",
      "\"Order placed\" is announced as a status.",
    ],
  },
  "reviews-summary": {
    features: ["calm", "reduceMotion", "highContrast"],
    pattern: "Image, list and toggle buttons",
    notes: [
      "Stars are one picture named \"4.3 out of 5 stars\"; the individual stars are hidden.",
      "The rating bars are decoration; each row has the count as text.",
      "\"Helpful\" is a toggle button (aria-pressed) with a spoken count.",
      "Sorting is a segmented control, and the list fades instead of rearranging in view.",
      "Calm and reduced motion show the bars full at once; high contrast darkens the empty stars.",
    ],
  },
  "category-filters": {
    features: ["highContrast", "colourSafe", "reduceMotion"],
    pattern: "Fieldsets with checkboxes",
    keys: [
      ["Space", "Tick a filter or a colour"],
      ["← →", "Move a range handle"],
    ],
    notes: [
      "Each facet is a fieldset with a legend; colour swatches are checkboxes named \"Name, count\".",
      "A chosen colour has a tick and a ring, never colour alone.",
      "The result count is a polite live region, so changes are announced.",
      "Active filters are buttons you can remove one by one, plus Clear all. On phones the filters open in a drawer.",
    ],
  },
  "order-history": {
    features: ["calm", "reduceMotion", "colourSafe", "extendedTime"],
    pattern: "List with disclosure buttons",
    keys: [["Enter or Space", "Open or close tracking, or buy again"]],
    notes: [
      "Status is a word in a badge, never colour alone.",
      "Tracking is a disclosure button with aria-expanded; each step is read as \"Done\" or \"Not yet\".",
      "Colour-safe adds a tick to finished steps.",
      "\"Added to cart\" is announced; with extended time it stays three times as long.",
      "Calm and reduced motion open tracking without the height fold.",
    ],
  },
  invoice: {
    features: ["calm", "reduceMotion"],
    pattern: "Article with a table",
    notes: [
      "The invoice is an article named by its number; the lines are a real table with headings (on phones each row becomes a card, headings stay for screen readers).",
      "Paid is written in the total row and announced; the stamp is decoration.",
      "Calm and reduced motion put the stamp down without the stamping motion.",
    ],
  },
};
