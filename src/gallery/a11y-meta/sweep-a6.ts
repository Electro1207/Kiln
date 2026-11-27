import type { A11yMetaMap } from "./types";

export const meta: A11yMetaMap = {
  conversation: {
    features: ["calm", "reduceMotion", "noFlashing", "screenReaderHints"],
    pattern: "Log of messages with a form",
    keys: [
      ["Enter", "Send the prompt"],
      ["Shift + Enter", "New line in the prompt"],
      ["Tab", "Move through message actions and sources"],
    ],
    notes: [
      "Each turn is a named group (\"You said\", \"Assistant said\"), so a screen reader knows who is speaking.",
      "The streamed answer is announced once when it finishes, not word by word.",
      "Reasoning, sources and tool calls open and close with buttons that say whether they are expanded.",
      "Calm and reduced motion show the answer without writing in and fold panels at once.",
    ],
  },
  "prompt-input": {
    features: ["calm", "reduceMotion", "largeTargets"],
    pattern: "Textarea with toolbar buttons",
    keys: [
      ["Enter", "Send"],
      ["Shift + Enter", "New line"],
      ["Tab", "Attach, model menu, then Send or Stop"],
    ],
    notes: [
      "The text area has a hidden label; Send becomes \"Stop generating\" while a reply streams, and is named for what it does.",
      "Every attachment has a remove button named with the file.",
      "The text area grows with its text at once, with no animated height.",
      "Calm and reduced motion swap Send and Stop and fold the attachment row without animating.",
    ],
  },
  sources: {
    features: ["calm", "reduceMotion", "screenReaderHints"],
    pattern: "Link with hover card; disclosure",
    keys: [
      ["Tab", "Focus a citation to show its source"],
      ["Enter or Space", "Open or close the list of sources"],
      ["Esc", "Dismiss the hover card"],
    ],
    notes: [
      "A citation is a real link named with the site; the hover card also opens on keyboard focus.",
      "The Sources button says whether the list is expanded.",
      "Site marks are decorative and hidden from screen readers.",
      "Calm and reduced motion open the list at once.",
    ],
  },
  "tool-call": {
    features: ["calm", "reduceMotion", "colourSafe"],
    pattern: "Disclosure with a status region",
    keys: [
      ["Enter or Space", "Show or hide the arguments"],
      ["Tab", "Move to Approve and Deny"],
    ],
    notes: [
      "The status (\"Needs approval\", \"Running\", \"Completed\", \"Denied\") is words plus an icon, never colour alone, and is announced when it changes.",
      "Only the current status chip is exposed; the others are hidden.",
      "Calm and reduced motion stop the spinner and open or fold the body at once.",
    ],
  },
  suggestions: {
    features: ["calm", "reduceMotion", "largeTargets"],
    pattern: "List of buttons",
    keys: [
      ["Tab", "Move between suggestions"],
      ["Enter or Space", "Pick a suggestion"],
    ],
    notes: [
      "Each chip is a button with its own text as its name.",
      "On a phone the row scrolls sideways and every chip stays reachable by keyboard.",
      "Calm and reduced motion show the chips without the staggered rise.",
    ],
  },
  "message-actions": {
    features: ["calm", "reduceMotion", "largeTargets"],
    pattern: "Group of buttons",
    keys: [
      ["Tab", "Move between Copy, rating and Regenerate"],
      ["Enter or Space", "Press the button"],
    ],
    notes: [
      "The row is a named group; the ratings are toggle buttons with aria-pressed, filled as well as coloured.",
      "Copy announces \"Copied\".",
      "Calm and reduced motion stop the regenerate icon turning.",
    ],
  },
  "app-shell": {
    features: ["calm", "reduceMotion", "largeTargets", "strongFocus"],
    pattern: "Landmarks with a navigation list and a drawer",
    keys: [
      ["Tab", "Move through the menu button, sidebar and page"],
      ["Enter or Space", "Go to a section, or collapse or expand the sidebar"],
      ["Esc", "Close the phone drawer"],
    ],
    notes: [
      "The sidebar, navigation and page are separate landmarks; the current section has aria-current=\"page\".",
      "In the icon rail every item keeps its name as a label.",
      "Calm and reduced motion collapse the sidebar in one step instead of sliding.",
    ],
  },
  "stacked-layout": {
    features: ["calm", "reduceMotion", "largeTargets", "strongFocus"],
    pattern: "Landmarks with a disclosure menu",
    keys: [
      ["Tab", "Move through links and actions"],
      ["Enter or Space", "Go to a page, or open and close the phone menu"],
    ],
    notes: [
      "The current link has aria-current=\"page\"; the menu button says whether the panel is expanded.",
      "Calm and reduced motion show the phone menu panel without sliding.",
    ],
  },
  "headings-layout": {
    features: ["calm", "reduceMotion", "largeTargets"],
    pattern: "Headings, tabs and a menu",
    keys: [
      ["← →", "Move between heading tabs"],
      ["Home or End", "First or last tab"],
      ["Tab", "Move to actions or the More menu"],
    ],
    notes: [
      "Titles are real headings, so a screen reader can jump between them.",
      "Tabs have one stop in the tab order and arrow keys move between them.",
      "On a phone the secondary actions fold into a named More menu; the primary one stays.",
    ],
  },
  headings: {
    features: ["calm", "reduceMotion", "largeTargets"],
    pattern: "Headings and tabs",
    keys: [
      ["← →", "Move between tabs"],
      ["Home or End", "First or last tab"],
    ],
    notes: [
      "The title is a real heading at the level you choose.",
      "Tabs have one stop in the tab order; arrow keys move between them and select.",
      "Calm and reduced motion show the selected underline without fading.",
    ],
  },
  "grid-list": {
    features: ["calm", "reduceMotion", "largeTargets"],
    pattern: "List of cards with action buttons",
    keys: [
      ["Tab", "Move between actions and links"],
      ["Enter or Space", "Press an action"],
    ],
    notes: [
      "Every action is named with the person (\"Email Ada Lovelace\"), not just \"Email\".",
      "The coloured project initials are decorative and hidden from screen readers.",
      "Calm and reduced motion show the cards without rising in.",
    ],
  },
  "stacked-list": {
    features: ["calm", "reduceMotion", "largeTargets"],
    pattern: "List of links or checkable rows",
    keys: [
      ["Tab", "Move between rows"],
      ["Enter", "Open a row"],
      ["Space", "Tick a row in select mode"],
    ],
    notes: [
      "The list is named; in select mode every row has a checkbox named with the row.",
      "The chevron is decorative and hidden from screen readers.",
      "Focus shows as an outline inside the row.",
    ],
  },
  "comment-feed": {
    features: ["calm", "reduceMotion", "largeTargets"],
    pattern: "Ordered list with a form",
    keys: [
      ["Ctrl or Cmd + Enter", "Send the comment"],
      ["Tab", "Move to the Comment button"],
    ],
    notes: [
      "Entries are an ordered list with real <time> elements.",
      "Event icons are decorative; the text carries the meaning.",
      "The comment box has a hidden label, and the shortcut is written next to the button.",
      "Calm and reduced motion add new comments without rising.",
    ],
  },
  "week-calendar": {
    features: ["calm", "reduceMotion", "highContrast", "largeTargets"],
    pattern: "Time grid with tabs for days on phones",
    keys: [
      ["Tab", "Move to an event, then press Enter to select it"],
      ["← →", "Switch day on phones"],
      ["Home or End", "First or last day on phones"],
    ],
    notes: [
      "Each day is a named list; every event is a button named with its title, times and place.",
      "The line for the current time is an image named \"Now, 10:30\".",
      "High contrast outlines every event.",
      "The width is measured only to choose week or day layout and can never grow from its own content.",
    ],
  },
  gantt: {
    features: ["calm", "reduceMotion", "highContrast"],
    pattern: "Figure with a scrollable region",
    keys: [
      ["Tab", "Focus the timeline"],
      ["← → ↑ ↓", "Scroll the timeline"],
    ],
    notes: [
      "The chart is a figure with a name; the timeline is a focusable, labelled region you can scroll by keyboard.",
      "Every task is named with its dates and progress (\"Design: 1 Mar to 4 Mar, 40% done\"), so the bars are not read as bare shapes.",
      "Highlighting the chain on hover is extra; nothing depends on it.",
    ],
  },
  "chat-thread": {
    features: ["calm", "reduceMotion", "noFlashing", "screenReaderHints"],
    pattern: "Log with a form",
    keys: [
      ["Enter", "Send"],
      ["Tab", "Move to the jump pill and Send"],
    ],
    notes: [
      "The messages are a polite log, so new ones are read as they arrive.",
      "The typing indicator is a status with the typist's name.",
      "Calm, reduced motion and no flashing hold the dots still and make scrolling jump instead of glide.",
      "The jump pill says how many new messages are waiting.",
    ],
  },
  "comment-thread": {
    features: ["calm", "reduceMotion", "largeTargets"],
    pattern: "Articles with menus and toggle buttons",
    keys: [
      ["Tab", "Move between reactions, Reply and menus"],
      ["Enter or Space", "Toggle a reaction or open a menu"],
      ["Esc", "Cancel an edit or reply"],
      ["Ctrl or Cmd + Enter", "Save an edit"],
    ],
    notes: [
      "Each comment is an article named with its author; reactions are toggle buttons that say the name and count.",
      "Reply says whether its box is expanded.",
      "Calm and reduced motion add, delete and fold comments at once and stop the count roll.",
      "The edit box resizes at once; only adding or deleting a comment folds its height.",
    ],
  },
  "diff-viewer": {
    features: ["colourSafe", "highContrast", "calm", "reduceMotion"],
    pattern: "Table-like list with a view switch",
    keys: [
      ["← →", "Switch between Split and Unified"],
      ["Tab", "Move to Show unchanged lines buttons"],
    ],
    notes: [
      "Added and removed lines carry + and − and a hidden \"Added:\" or \"Removed:\" word, not just green and red.",
      "Colour safe adds markers in the split view and underlines or strikes the changed words.",
      "Folded stretches are buttons that say how many lines they hide.",
      "The width is measured only to choose split or unified and can never grow from its own content.",
    ],
  },
  "json-viewer": {
    features: ["calm", "reduceMotion", "largeTargets"],
    pattern: "Tree",
    keys: [
      ["↑ ↓", "Move between rows"],
      ["→ ←", "Open or close a branch"],
      ["Tab", "Move to a row's copy buttons"],
    ],
    notes: [
      "The document is a tree; branches say whether they are expanded.",
      "Search marks matches with a highlight and opens the branches that hold them.",
      "Copy buttons are named for what they copy and change their name after copying.",
    ],
  },
  terminal: {
    features: ["calm", "reduceMotion", "noFlashing"],
    pattern: "Log with a command input",
    keys: [
      ["Enter", "Run the command"],
      ["↑ ↓", "Walk through earlier commands"],
      ["Tab", "Move to the jump button"],
    ],
    notes: [
      "The output is a polite log; the real input has a label (\"Command\").",
      "Calm, reduced motion and no flashing keep the caret solid instead of blinking.",
      "Colour tones are decoration on top of text that already says the same.",
      "A button takes you back to the latest line after you scroll up.",
    ],
  },
  "terminal-script": {
    features: ["calm", "reduceMotion", "noFlashing"],
    pattern: "Log with a command input",
    keys: [
      ["Any key or click", "Skip the typing and show the whole session"],
      ["Enter", "Run a command once the script ends"],
    ],
    notes: [
      "With calm or reduced motion the whole session is printed at once; nothing types by itself.",
      "Pressing a key or clicking while it plays skips to the end, so the animation is never a trap.",
      "After the script the prompt is live and takes focus only when nothing else has it.",
    ],
  },
  "log-stream": {
    features: ["calm", "reduceMotion", "screenReaderHints"],
    pattern: "Log with filter toggle buttons",
    keys: [
      ["Tab", "Move between level filters, the log and the jump pill"],
      ["↑ ↓ Page Up Page Down", "Scroll the log"],
    ],
    notes: [
      "Level filters are toggle buttons with a count; each line says its level in words as well as colour.",
      "The tail holds still while the pointer is over it, while focus is inside it, and always under calm; new lines wait behind a pill.",
      "The log is not live, so a fast stream never floods a screen reader.",
    ],
  },
  "file-manager": {
    features: ["calm", "reduceMotion", "largeTargets"],
    pattern: "Listbox with a context menu",
    keys: [
      ["Arrow keys", "Move between files"],
      ["Shift + Arrow keys", "Extend the selection"],
      ["Space", "Toggle a file"],
      ["Enter", "Open"],
      ["F2", "Rename"],
      ["Backspace", "Go up a folder"],
      ["Delete", "Remove"],
      ["Ctrl or Cmd + A", "Select all"],
    ],
    notes: [
      "Files are a multi-select listbox named with the folder and count; every drag-and-drop move has a menu path.",
      "Breadcrumbs show where you are as text.",
      "The context menu is a real menu and opens from the keyboard.",
    ],
  },
  "notification-preferences": {
    features: ["calm", "reduceMotion", "largeTargets"],
    pattern: "Grid of checkboxes",
    keys: [
      ["Tab", "Move between switches"],
      ["Space", "Turn a channel on or off"],
    ],
    notes: [
      "Each channel and event pair is a checkbox named with both (\"Email, Comments\").",
      "Select-all boxes for a row or column show a mixed state when only some are on.",
      "On a phone the grid becomes cards with the same controls.",
    ],
  },
  "message-composer": {
    features: ["calm", "reduceMotion", "largeTargets"],
    pattern: "Textarea with buttons",
    keys: [
      ["Enter", "Send"],
      ["Shift + Enter", "New line"],
      ["Tab", "Move to attach, remove and Send"],
    ],
    notes: [
      "The text area has a name; Attach and Send are named buttons, and every attachment has a remove button naming the file.",
      "Send is marked aria-disabled until there is something to send, and stays reachable.",
      "The box grows with the text at once, with no animated height.",
    ],
  },
  "tree-view": {
    features: ["calm", "reduceMotion", "largeTargets"],
    pattern: "Tree",
    keys: [
      ["↑ ↓", "Move between visible items"],
      ["→", "Open a folder, or step into it"],
      ["←", "Close a folder, or step out"],
      ["Home or End", "First or last item"],
      ["*", "Open all siblings"],
      ["Enter or Space", "Select"],
      ["Type a name", "Jump to it"],
    ],
    notes: [
      "Follows the WAI-ARIA tree pattern with level, set size, position and expanded state on every item.",
      "One item is in the tab order; arrows move inside the tree.",
      "Folder icons are decorative. Opening a folder is the one allowed height fold, and it happens at once under calm or reduced motion.",
    ],
  },
  "calendar-month": {
    features: ["calm", "reduceMotion", "largeTargets"],
    pattern: "Grid",
    keys: [
      ["← →", "Previous or next day"],
      ["↑ ↓", "Previous or next week"],
      ["Enter or Space", "Pick the day"],
      ["Tab", "Move to the +N more button"],
    ],
    notes: [
      "Each day is a button named with the full date and how many events it has.",
      "The month title is a polite region, so changing month is announced.",
      "Event dots on a phone are decorative; the day name carries the count and the agenda lists the events as text.",
      "Calm and reduced motion change month and day without sliding. The day agenda resizes at once.",
    ],
  },
  "filter-bar": {
    features: ["calm", "reduceMotion", "largeTargets"],
    pattern: "Search, chips, listbox editors and tabs",
    keys: [
      ["Tab", "Move between search, chips and menus"],
      ["↑ ↓", "Move in a filter's options"],
      ["Enter or Space", "Tick an option"],
    ],
    notes: [
      "Search has a hidden label; each active filter is a chip with a remove button named with its field.",
      "Option lists are multi-select listboxes that show focus with a ring.",
      "Saved views are tabs in a named tab strip. Clear all appears as a real button once any filter is set.",
    ],
  },
};
