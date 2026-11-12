# Kiln: guide for agents building UI with it

Kiln is a folder of React + Tailwind v4 + Motion components. It reaches a project in one of two ways: copied in as `src/kiln/` (shadcn CLI, the `kiln-add.mjs` script, or by hand), or installed as the npm package `@electro1207/kiln`. Read this file before writing any UI. Rules are binding; the code in `components/` is the reference for props (every prop has JSDoc).

Peer deps: `react`, `react-dom`, `motion`, `lucide-react`, `tailwindcss` v4, `@tailwindcss/vite`.

## 1. Setup (Vite + React + Tailwind v4)

Skip anything already done. Paths assume this folder is `src/kiln/`.

```bash
npm i motion lucide-react
npm i -D tailwindcss @tailwindcss/vite
```

`vite.config.ts`: add `tailwindcss()` (from `@tailwindcss/vite`) to `plugins`.

`src/index.css` (order matters):

```css
@import "tailwindcss";
@import "./kiln/kiln.css";
```

`src/main.tsx`:

```tsx
import "./index.css";
import { MotionConfig } from "motion/react";
import { ThemeProvider } from "./kiln/theme";

<ThemeProvider>
  <MotionConfig reducedMotion="user">
    <App />
  </MotionConfig>
</ThemeProvider>
```

`index.html` `<head>`: the font and a script that sets `.dark` before first paint (storage key is `kiln-theme`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
<script>
  try {
    var m = localStorage.getItem("kiln-theme") || "system";
    if (m === "dark" || (m === "system" && matchMedia("(prefers-color-scheme: dark)").matches)) document.documentElement.classList.add("dark");
  } catch (e) {}
</script>
```

Theme: `useTheme()` gives `{ mode, resolved, setMode, toggle }`; `ThemeToggle` (primitives) is the ready-made switch. Dark mode is the `.dark` class on `<html>`.

Toasts need `<ToastProvider>` (from `components/notices/Toast`) above any `useToast()` call. Overlays (Dialog, Drawer, AlertDialog, CommandPalette, SpotlightSearch, KeyboardShortcutsSheet, ProductTour, CartDrawer, ProductQuickView, Banner) are always controlled (`open` + `onOpenChange`).

### Installed from npm instead

If `@electro1207/kiln` is in `package.json`, do not copy files. In your CSS: `@import "tailwindcss"; @import "@electro1207/kiln/styles.css";` (that file already scans the package for class names). Import everything from the package root, `import { Button, Alert } from "@electro1207/kiln"`, or from a folder entry such as `"@electro1207/kiln/overlays"` (folder names as below). Wrap the app in `ThemeProvider` and `MotionConfig` as above. Every other rule in this guide is the same; read the paths below as folder names, and read props from `node_modules/@electro1207/kiln/lib/**/*.d.ts`. Two type names differ from the source files: `ChatThreadMessage` (the type in `ChatThread`), `AnchoredPlacement` and `OverlayPlacement` (`Placement` in `shared/`).

## 2. Find a component

Look here first, then open the file for props. Imports use real paths, e.g. `import { Button } from "./kiln/components/buttons/Button"`. All paths below are under `kiln/components/`. Names in parentheses are the file's other exports.

### `ai/`
- `ChatMessage` (ChatMessage, AssistantMark) — One chat message, user or assistant, with avatar and name; AssistantMark is the logo
- `Citation` (Citation, Sources) — Inline citation chips with a hover card, and the list of everything it read
- `MessageActions` — Copy, rate up or down, and regenerate, under an answer
- `PromptInput` — Assistant composer: grows with text, attachments, model picker, Send turns into Stop while streaming
- `Reasoning` — The model’s thinking behind one line: open while it works, folded when it’s done
- `StreamingText` — An answer that writes itself in token by token; earlier text never re-renders
- `Suggestions` — Prompt starters as chips; they scroll sideways on a phone
- `ToolCall` — A tool the assistant wants to run, with its arguments, waiting for Approve or Deny

### `app-shells/`
- `AppShell` — A tinted frame with a collapsible sidebar and a top bar around a sheet; a drawer on phones
- `GridList` (PeopleGrid, ProjectGrid) — People as cards with a split footer of actions, and projects as compact tiles
- `HeadingParts` (CollapsingActions, CardHeading) — Page-heading actions that fold into a menu when narrow; CardHeading for the top of a card
- `PageHeading` (HeadingTabs, SectionHeading, PageHeading) — Page, section and card headings; a page's secondary actions fold into a menu when it gets narrow
- `StackedLayout` — One top bar, the page heading on the ground, then the content on a sheet; the links fold into a panel on phones
- `StackedList` — Rows with a picture, two lines each side and a chevron; switch to select mode for checkboxes

### `buttons/`
- `Button` — The main way to act: five variants, three sizes, icons, and a loading state that keeps its width
- `ButtonGroup` — Related buttons joined into one strip, and a main action with its alternatives in a menu
- `CopyButton` — Copies text and confirms with a drawn tick
- `HoldButton` — For actions that cannot be undone: fills while held, rewinds when released early
- `IconButton` — A square or round button that shows only an icon and is named for screen readers
- `Link` — Inline text link with an underline that draws in from the left
- `MagneticButton` — A button that leans gently towards the pointer before you reach it
- `SegmentedControl` — Switch between views; the selection fades onto the one you pick
- `SplitButton` — A main action with a menu of related actions beside it
- `ToggleButton` — A button that stays on, with its icon swapping as it does

### `cards/`
- `Card` (Card, CardHeader, MediaCard, InteractiveCard) — Plain surface with CardHeader; MediaCard and InteractiveCard (selectable) too
- `ExpandableCard` — A card that grows into its own detail view; press Esc or the cross to send it back
- `PricingCard` (BillingToggle, PricingCard) — Plans with a billing switch; the prices roll to their new figures
- `TiltCard` (TiltCard, TiltLayer) — A card that leans towards the pointer in 3D, with layers floating above its surface

### `charts/`
- `AreaChart` — Layers of a total over time, with a readout of every layer under the cursor
- `BarChart` — Bars that grow from the baseline, with the current period in the accent
- `DonutChart` — Parts of a whole, drawn in one after another; hover a segment or its legend row
- `FunnelChart` — Stages that narrow, with how many went on at each step
- `GaugeChart` — A half-ring meter with an optional target mark; the fill stops dead on its value
- `LineChart` — A line that wipes in, with a cursor that follows the pointer or the arrow keys
- `RadarChart` — Scores on spokes for one or two series; the spoke nearest the pointer is read out
- `SankeyChart` — Amounts flowing between columns; hover a node or band to bring its connections forward
- `Sparkline` — A word-sized trend for running text and table cells
- `TreemapChart` — Parts of a whole as tiles sized by value; hover reads out a tile without flicker across the gaps
- `YearHeatmap` — A whole year of daily counts with weekday and month labels

### `choice-controls/`
- `Checkbox` — A drawn tick, an indeterminate dash, and a group with select all
- `CheckboxGroup` — Checkboxes with a select-all parent that goes indeterminate
- `ColorPicker` (ColorPickerPanel, ColorPicker) — Saturation and brightness, hue and alpha, typed values, the screen eyedropper where supported, and saved swatches; inline or in a popover
- `ColorSwatches` — Pick one colour from a set; the ring fades onto it
- `RadioGroup` — One choice from a short list, as rows or as tiles whose ring fades in place
- `Rating` — Stars with a hover preview and a small wave when picked
- `Slider` — One value or a range, with a value bubble while dragging and full keyboard steps
- `Switch` — On or off, taking effect at once

### `commerce/`
- `CartDrawer` — Line items, steppers, rows that fold away, a free-shipping bar and totals that add up
- `CategoryFilters` (CategoryFilters, FilterPanel) — Facets with counts, a price range and colours; chips for what's on; a drawer on phones
- `CheckoutForm` — Contact, address, delivery and a demo payment step beside a summary that stays in view
- `Invoice` — An invoice or receipt as a document, with totals computed from its lines
- `OrderHistory` — Past orders with status, items, tracking that folds open and buy again
- `ProductGallery` — Large picture, thumbnails, a magnifier under the pointer, swipe on phones, arrow keys
- `ProductQuickView` — A product in a dialog: gallery, colour, size with sold-out sizes struck, quantity and add to cart
- `ReviewsSummary` (Stars, ReviewsSummary) — Average, a distribution that grows in, sorting and helpful votes
- `SizePicker` — Product size chips with sold-out sizes struck through
- `commerce` — Types and money maths (cents) shared by the commerce components; not a component

### `communication/`
- `ChatThread` — Messages grouped by sender, a typing indicator, and a pill that takes you down to new messages
- `CommentFeed` — A thread of comments and events with a box to add one; new comments rise into place
- `CommentThread` — Nested replies, reactions whose counts roll, and Edit or Delete on your own comments
- `MessageComposer` — Grows with the text, holds attachments, and its send button fills in when there is something to send

### `data-display/`
- `Avatar` (Avatar, AvatarGroup) — A person as a picture or initials, each with a colour of their own, alone or in a group
- `CodeBlock` — Highlighted code with line numbers and a copy button
- `DescriptionList` — The details of one thing as terms and values; values people paste elsewhere can be copied
- `HeatStrip` — Half a year of daily counts at a glance; the readout follows the pointer without flicker
- `Kbd` — A key cap that presses down when the real key does
- `List` (List, ListItem) — Rows with a leading picture and trailing detail; swipe left for actions
- `NumberTicker` — Digits that roll to their new value, like a departure board
- `Stat` — A key figure that counts up once it comes into view, with its change against the last period
- `Tag` (Tag, TagGroup) — Labels in six tones, removable; in a TagGroup they make room for each other smoothly
- `Timeline` — An activity feed whose entries rise in one after another

### `dev-tools/`
- `DiffViewer` — Two versions side by side or unified, with the changed words marked and unchanged stretches folded away
- `JSONViewer` — A document as a tree: fold branches, copy any path or value, and search to open what matches
- `LogStream` — A live tail with level filters that pauses under the pointer and renders only the rows in view
- `Terminal` — Scrollback with coloured output, a typed prompt with a blinking caret, and auto-scroll that lets go when you scroll up

### `effects/`
- `AnimatedBeam` — Curved connectors with a light travelling along them, drawn as a moving dash
- `AnimatedList` — Items landing one at a time at the top of a stack, like notifications
- `BorderBeam` — A short bright segment running round a card’s border, following its radius exactly
- `Dock` — macOS magnification by transform only: icons swell, neighbours part, the bar widens
- `OrbitingCircles` — Icons circling a centre on the compositor, upright the whole way round
- `StickyScrollReveal` — Words scroll past a picture that stays pinned and cross-fades with each step

### `forms/`
- `AuthForms` — One card for all three; fields come and go and the card eases to its new height
- `AvatarUpload` — Upload, then drag and zoom inside a round frame; the result is a 512px PNG
- `ImageCropper` — Pan and zoom a picture inside a round frame (used by AvatarUpload)
- `InlineEdit` — Click or press Enter to edit text where it sits; Escape puts it back
- `KeyValueEditor` — Environment-variable rows with validation and secrets that stay masked until revealed
- `SaveBar` — Bar that rises from the bottom when a form has unsaved changes
- `SettingsSection` (SettingsSection, SettingsRow) — Label column beside a panel of controls, and a bar that rises when there are unsaved changes

### `guidance/`
- `KeyboardShortcutsSheet` — Press ? for a filterable, grouped list of every shortcut
- `OnboardingWizard` — Steps that check themselves, Back that keeps your answers, and a summary with links back
- `ProductTour` — Coach marks: a hairline spotlight dims the page around one feature and eases onto the next, following it as the page scrolls

### `marketing/`
- `BentoGrid` (BentoGrid, BentoTile) — Tiles of different sizes, each with a small live picture; reflows to two columns and then one
- `BlogList` — Articles with cover, category, reading time and author
- `CTASection` — The closing ask: a field of colour, or a split with a picture
- `Changelog` — Releases with what is new, improved and fixed
- `ContactSection` — Offices beside a short form that checks itself and confirms when sent
- `FAQSection` — Two columns: the heading and a way to ask, then the questions
- `FeatureSplit` — Text and its picture side by side, either way round
- `FeatureTabs` — Features on one side, a picture panel that cross-fades on the other; advances on its own and pauses on hover
- `Footer` — A designed close: link columns, then the name at full width
- `Hero` — A first screen: the title, one sentence, the action and a large picture
- `NewsletterSignup` — Email field with inline validation, a loading state and a success message in place
- `NotFound` — A plain way back and the places people usually meant
- `StatsSection` — Large figures that count up once as they come into view
- `TeamGrid` — People and their roles; links rise into view on hover and stay visible on touch
- `Testimonials` — One quotation set large, then the rest in columns

### `media/`
- `Carousel` — Drag or flick with momentum and it settles on a slide; arrows and keys work too
- `CompareSlider` — Before and after with a handle you drag or move with the arrow keys
- `Marquee` — An endless row without a seam, which eases to a stop under the pointer
- `Masonry` — Pictures of mixed heights in columns, rising in as they scroll into view
- `MediaPlayer` — An audio player that scrubs along the track’s real waveform, with skip, playback speed and volume
- `VideoPlayer` — Chapters and frame previews on the scrubber, speed and quality that keep your place, captions, picture-in-picture, theater and full screen

### `menus/`
- `CommandPalette` — A keyboard-first launcher with grouped results; the highlight fades between rows
- `ContextMenu` — The same menu, opened at the pointer with a right-click
- `DocsNav` — The sidebar this gallery uses: labelled sections of collapsible groups, a filter field (with an optional shortcut key), counts, and an active row whose fill fades in place
- `DropdownMenu` (MenuContent, DropdownMenu) — Actions with icons, shortcuts, ticks and a submenu
- `FlyoutNav` — Navigation with wide panels of grouped links and a featured card; hover intent, keyboard, and an accordion on phones
- `Navbar` (MenuToggle, Navbar) — Wordmark, links and one action; on a phone the links fold into a menu with a morphing button
- `SidebarNav` — Side navigation with nested groups that folds into an icon rail
- `SpotlightSearch` — A search window with categories, recent searches and a live preview of the highlighted result

### `notices/`
- `Alert` — A calm inline card; the tone lives in the icon
- `Banner` — A full-width announcement for the top of an app that slides down into the space it opens
- `CookieConsent` — A corner card with equal Accept and Reject; Choose opens the categories in place
- `FieldMessage` — The hint or error under a field; it slides in and the space opens smoothly
- `NotificationBell` — An unread count that rolls and bumps; the bell rings once when it goes up
- `NotificationCenter` — A bell that opens an inbox with All, Unread and Mentions; opened notices fade to read
- `Toast` (ToastProvider, useToast) — Stacked notifications (iOS style). Wrap the app in ToastProvider, then useToast()
- `UndoBar` — “Removed X · Undo” with a ring counting down; it pauses while you hover

### `overlays/`
- `AlertDialog` — A confirmation that must be answered, with a spinner while the action runs
- `Dialog` — A modal window that grows in from 96%; on a phone it becomes a bottom sheet you can drag away
- `Drawer` — A panel from the left, right or bottom edge
- `HoverCard` — A rich preview of a person or link that stays while you read it
- `Lightbox` — A picture grows from its thumbnail to the full screen and back
- `Popover` — A small panel tied to its trigger that flips to stay on screen
- `Tooltip` — A short label on hover or keyboard focus; once one is open, its neighbours open instantly

### `pickers/`
- `BookingSlots` — Length, day and time in the visitor's time zone, then details and a confirmation
- `ChipFilter` — Toggle chips for filtering, one or several at a time
- `Combobox` (Highlight, Combobox) — Type to filter a long list; matches are marked and rows glide as the list narrows
- `DatePicker` (Calendar, DatePicker, DateRangePicker) — A calendar that slides by month, for one date or a range with presets
- `FileDropzone` — Drag files in or browse; each upload reports progress and can be retried or removed
- `Select` — A custom listbox: arrow keys, type to jump, a tick on the chosen row
- `SignaturePad` — Smooth strokes that follow pressure and speed, with undo, clear and PNG export
- `TagInput` — Several values in one field
- `TimePicker` (TimeWheels, TimePicker) — Two scroll-snapping wheels, driven by native scrolling

### `primitives/`
- `AspectImage` — A picture that holds its space, shows a blurred preview, then fades in sharp
- `ScrollArea` — An overlay scrollbar that fades in while you scroll, plus thin token-coloured native scrollbars everywhere
- `Separator` — A line between things, drawn in from the centre, with or without a label
- `ThemeToggle` (ThemeToggle, ThemeSwitcher) — Switches light and dark; the new theme opens as a circle from the button

### `status/`
- `Badge` — Short statuses and counts, and a presence dot that breathes when something is live
- `EmptyState` — What a page shows when it has nothing yet, and the one thing to do next
- `Meter` — How much of a limit is used, split by kind, turning amber then red as it fills
- `MultiStepLoader` — A checklist that completes itself, with a line filling down as it goes
- `Progress` — Fills on a spring when the amount is known; runs a band when it isn’t
- `ProgressRing` — A circular gauge whose arc and number move on the same spring
- `Skeleton` (Skeleton, SkeletonText) — Placeholders that hold the shape of content still loading, then cross-fade to it
- `Spinner` — Four ways to say “working”, all following the text colour
- `StatusDot` — Presence dot: online, busy, away, offline, optional pulse and label

### `tables/`
- `ComparisonTable` — Plans across, features down, with the plan names held at the top as you scroll
- `DataGrid` — Filter, sort, choose columns, change density, page through and act on a selection
- `InfiniteFeed` — Loads the next page as you near the end, with skeleton rows and no jump in scroll position
- `Table` (Table, TickBox) — Sortable, selectable rows that glide to their new order; the header stays put while the body scrolls
- `VirtualList` — 10,000 rows of mixed heights with sticky group headers; only what is near the viewport is drawn

### `text-effects/`
- `ScrambleText` — A Matrix-style decode on view or hover, letter cells fixed so the line never shifts
- `TextAnimate` — Headlines that arrive word by word or letter by letter as they come into view
- `Typewriter` — Phrases typed and deleted in turn, with a real caret that blinks only when idle
- `WordRotate` — One word swapping in place; the cell is as wide as the longest, so nothing reflows

### `text-input/`
- `CurrencyInput` — Money formatted for the locale as you type; stored in minor units
- `MentionsTextarea` — Type @ to suggest people; picked names become tokens
- `NumberField` — A stepper whose digits roll; hold a button to count quickly, or type a number
- `OTPInput` — Six boxes on one real input, so paste and SMS autofill work
- `PasswordField` — Show and hide, plus a strength meter and the rules it is measured against
- `PhoneInput` (COUNTRIES, PhoneInput) — A searchable country code and a number that formats as you type, with the caret kept in place
- `PlaceholderInput` — Example questions cycle while empty; sent text drifts up and dissolves
- `RichTextEditor` — A light editor with a toolbar, shortcuts, markdown shortcuts and clean HTML out
- `SearchField` — A rounded search box with a shortcut hint at rest and a clear button once typed in
- `TextField` — Label above, hint below; errors arrive with a small shake, and a clear button appears once there is text
- `Textarea` — Grows smoothly with its text and counts characters against a limit
- `caret` — Caret-preserving helpers for inputs that reformat as you type; not a component

### `wayfinding/`
- `Accordion` — Questions that open to their answers with a smooth change of height
- `BackToTop` — Appears once you have scrolled; its ring fills with your progress down the page
- `Breadcrumbs` — Where you are
- `Pagination` — Pages with gaps; the current page’s fill fades in place, and on a phone it becomes “6 of 24”
- `ScrollProgress` — A reading bar that fills as you scroll, smoothed so it never jumps
- `Stepper` — Progress through a flow; the line fills as each step is finished
- `Tabs` — A line or a fill fades onto the chosen tab; panels slide in from the side you moved towards

### `workspace/`
- `CalendarMonth` — A month of events with a day agenda; months and days slide the way you move
- `FileManager` — Grid or list, breadcrumbs, Shift and Ctrl/Cmd selection, drag onto folders, rename in place, a context menu
- `FilterBar` — Search, filter chips with their own editors, a sort menu and saved views
- `GanttChart` — Task bars over dates with dependency arrows and a line for today; hover a task to bring its chain forward
- `KanbanBoard` — Drag cards within and between columns, or move them from each card’s menu
- `NotificationPreferences` — Events against channels, with select-all for each row and column; cards on a phone
- `ResizablePanels` — Split panes with a draggable divider: arrow keys, limits, and a double-click to reset
- `SortableList` — Reorder by dragging a handle, or focus the handle and use the arrow keys
- `TreeView` — A file explorer with the full keyboard model of a tree; folders open with a smooth change of height
- `WeekCalendar` — Events on a time grid, overlapping ones side by side, a line for now; one day at a time on phones

Shared helpers (imported by many, not components): `components/shared/` has `Anchored` (floating panel behind Select, menus, pickers), `Field` (label, hint, error wrapper), `useLoop` (compositor loops, `usePrefersReducedMotion`), `useOverlay` (portal, scroll lock, focus trap, Esc layer stack).

## 3. Copy a single component into a project

Take the component file plus every local file it imports, transitively, keeping the folder layout (relative imports like `../../cn` depend on it). Always also have `cn.ts`, `motion.ts`, `controllable.ts`, `theme.tsx`, `tokens.css`, `kiln.css` once. Run from the project root; replace the path with the component's:

```bash
deps(){ for r in $(grep -ohE 'from "\.[^"]+"' "$1" | cut -d'"' -f2); do p=$(realpath -m "$(dirname "$1")/$r"); for e in .tsx .ts ""; do [ -f "$p$e" ] && { grep -qx "$p$e" "$K" || { echo "$p$e" | tee -a "$K"; deps "$p$e"; }; break; }; done; done; }
K=$(mktemp); deps src/kiln/components/tables/DataGrid.tsx; rm "$K"
```

It prints every local dependency (not the file itself). Copy those into the same relative locations in the target project. Components also import `motion/react` and `lucide-react`; install them.

## 4. Usage rules

1. **Use existing components first.** Search section 2 before writing UI. A page is made of Kiln components plus layout classes.
2. **Compose, don't fork.** Build a variant by wrapping (`<Card><Stat/><Sparkline/></Card>`) and passing `className`/slot classNames. Edit a component file only to fix a bug or add a prop everyone benefits from. Never copy one to `MyButton.tsx`.
3. **Size and width.** Controls take `size="sm" | "md" | "lg"` (32/40/48px, default `md`). Never set `h-*` or `text-*` on a control; use `size`. Inputs, Select, Tabs, Slider, Progress fill their container; set a width on the root: `className="w-[240px]"` (`containerClassName` on TextField and Textarea). Pixel-measured things take numbers: `<Avatar size={64}/>`, `<Spinner size={32}/>`.
4. **`className` lands on the root** (on the `<input>` for TextField/Textarea). Slots: TextField `containerClassName` and `boxClassName`; Textarea `containerClassName`; Select `triggerClassName`; Tabs `listClassName`. `cn` does not dedupe: to beat a built-in value, use `size`, or Tailwind's important modifier (`h-14!`).
5. **Tokens only, never hard-coded colours.** No hex, no `bg-white`, `text-gray-*`, `bg-black`, `border-neutral-*`, no `dark:` overrides for colour. Token utilities switch with the theme by themselves:

   | Use | Utilities |
   | --- | --- |
   | Page, cards, wells | `bg-ground`, `bg-surface`, `bg-raised` (inputs at rest, hovered rows), `bg-active` (pressed/selected neutral), `bg-elevated` (pill or thumb rising out of a `bg-raised` track) |
   | Text | `text-ink`, `text-muted`, `text-faint` (placeholder, disabled) |
   | Borders | `border-line` (cards), `border-line-strong` (form controls), `divide-line` |
   | Filled controls | `bg-btn-primary text-btn-primary-ink`, `bg-btn-secondary text-btn-secondary-ink`, `bg-btn-danger text-btn-danger-ink` (each has `-hover`) |
   | Accent | `text-accent`, `ring-accent`, `bg-accent-soft` (tint behind selected things). Accent is for links, rings, dots, underlines: not a large fill (it is pale in dark mode) |
   | Signals | `text-positive`/`bg-positive-soft`, `negative`, `warning`, `info` |
   | Shape and depth | `rounded-control` (buttons, inputs), `rounded-card`, `rounded-sheet`, `shadow-float` (only floating things: menus, dialogs, toasts; nothing at rest), `bg-scrim` |
   | Helpers | `tabular` (tabular numbers), `k-fill` (width 100%), `k-ctl-sm|md|lg` (control height and text size) |

   Surface nesting: card `bg-surface` on page `bg-ground`; things on a `bg-raised` well use `bg-surface`; never raised-on-raised.
6. **Change colours only in `tokens.css`** (`:root` for light, `.dark` for dark). Never override them in a component, in `index.css`, or with inline styles. To restyle every button, edit the `--k-btn-*` tokens.
7. **State: controlled or uncontrolled.** Leave out the value prop to let the component keep state (`defaultChecked`, `defaultValue`, `defaultOpen`, `defaultPage`, ...). Pass the value prop plus handler to own it. Every input works both ways; overlays are always controlled, and whole flows (AuthForms, CheckoutForm, OnboardingWizard, BookingSlots, FileManager and similar) keep their own state and report through a callback. The full lists are in `docs/API.md`. Names: `value`/`onChange(value)`; `checked`/`onCheckedChange`; `pressed`/`onPressedChange`; `open`/`onOpenChange`; `page`/`onChange`. Text inputs also keep native `onChange(event)` and add `onValueChange(text)`. Do not mix (a `value` without a handler freezes the component). Use `useControllable(value, default, onChange)` from `controllable.ts` in your own stateful components.
8. **Accessibility.** Give every control a visible `label`, or an `aria-label` (required on `IconButton` and icon-only `ToggleButton`). Pair `error` with the field (it sets `aria-invalid`). Everything must work from the keyboard (Tab, Enter/Space, arrows, Esc); keep the focus ring (never `outline-none` without a replacement). Dialogs need a `title`. Use real `<button>` and `<a>`, not clickable `<div>`s. Images need `alt`.
9. **Every link and button does something real.** Open a Dialog or Sheet, show a toast, change state, navigate to a real route, or link to a real URL with `target="_blank" rel="noreferrer"`. No `href="#"`, no empty `onClick`, no dead buttons.
10. **Icons** come from `lucide-react`, passed to `leading`, `trailing` or `icon` props. Never edit a component's source to change an icon it draws itself (a close X, a chevron, a tone icon, a star): pass `icons={{ close: <Cross /> }}` (`Partial<XIcons>`, defaults exported as `xIcons`). A dedicated `icon`/`leading`/`trailing` prop wins over `icons`. Any element works; it is sized and coloured by the component's wrapper, so don't pass size props. Full list in `docs/API.md`, section 8. The theme toggle's sun and moon is the one exception (an animated morph).

## 5. Motion rules

Import presets from `kiln/motion.ts`; do not write spring numbers.

| Preset | Use for |
| --- | --- |
| `springSoft` (= `spring`) | Default for almost everything: surfaces, panels, lists, entrances |
| `springFirm` | Things that rest against an edge: switch thumbs, slider handles, drawers. Zero overshoot |
| `springSnappy` | Tiny marks: tick, chevron, icon swap. Zero overshoot |
| `springBouncy` | Deliberate rewards only (a rating star). Rare |
| `fade` | Opacity-only changes |
| `press` | `whileTap` feedback (`scale: 0.97`) |

Also `springLand` (typed character landing), `easeOut`/`easeInOut` (tween curves), `popVariants` (menu entrance), `staggerParent`/`staggerChild`.

- Animate **`transform` and `opacity` only** (`x`, `y`, `scale`, `rotate`, `opacity`). Never tween `width`, `height`, `top`, `left`, `margin`, `padding`. One-off height fold on a single element (accordion, alert dismiss) is the only exception.
- **No `filter: blur()` in motion** (repainted every frame). Existing presets that blur do so on one small element only; don't add blur elsewhere.
- **Never animate `x` and `width` of the same element together** (two engines desync and stutter). Scale a full-size element with `scaleX` from `transformOrigin` instead.
- **Selection and hover indicators never travel.** A highlight, pill, ring, underline or tab marker belongs to each item and fades out on the old one and in on the new (`animate={{ opacity: on ? 1 : 0 }}`, `transition={fade}`, `initial={false}`, `pointer-events-none`). Content sits above it with `relative z-[1]`. Things that physically move (switch thumbs, slider handles, carousels, drawers, drag and drop) still travel.
- `layoutId` is only for shared-element morphs (a card opening into its detail view, a lightbox). Never for indicators.
- **Swaps share one cell**: put both versions in `grid [&>*]:[grid-area:1/1]` and cross-fade. No `AnimatePresence mode="popLayout"` inside a centring flex or grid.
- **Hover belongs to a stable container**, not to children with gaps between them or that move. Compute the hovered item from the pointer over the container, or hold the last one until the pointer leaves.
- **Nothing hoverable shifts under the pointer.** A hover that expands or fans out must keep the pointer inside the hover zone (pad the stable parent).
- **Reduced motion**: `MotionConfig reducedMotion="user"` at the root handles Motion. For CSS animations add `motion-reduce:` variants. Keep `MotionConfig` in place.
- **Hold 60fps in real use** (scroll, hover, drag), not just in a demo. Pointer-follow effects write motion values (`useMotionValue`, `useSpring`), never React state on every `pointermove`.
- No overshoot against an edge. State marks (radio dot, checkbox fill, tick) fade, they don't scale around.

## 6. Do / Don't

```tsx
// Colour
<div className="bg-white text-gray-900 border-gray-200">        // Don't
<div className="bg-surface text-ink border-line">               // Do

<button className="bg-blue-600 text-white rounded">Save</button> // Don't
<Button>Save</Button>                                            // Do (bg-btn-primary)

// Sizing
<Button className="h-12 text-base px-6">Go</Button>             // Don't
<Button size="lg">Go</Button>                                    // Do

// Fork vs compose
// Don't: copy Card.tsx to FancyCard.tsx and edit it
<Card className="bg-raised"><Stat ... /></Card>                  // Do

// Springs
transition={{ type: "spring", stiffness: 300, damping: 20 }}     // Don't
transition={springSoft}                                          // Do (import from kiln/motion)

// Animated size
<motion.div animate={{ width: `${pct}%` }} />                    // Don't
<motion.div className="origin-left w-full" animate={{ scaleX: pct / 100 }} transition={springFirm} />  // Do

// Moving indicator
<motion.span layoutId="tab-pill" className="absolute inset-0 bg-elevated" />        // Don't (travels)
<motion.span className="pointer-events-none absolute inset-0 rounded-control bg-elevated"
  initial={false} animate={{ opacity: active ? 1 : 0 }} transition={fade} />          // Do (one per item)

// Dead controls
<a href="#">Pricing</a>   <Button onClick={() => {}}>Save</Button>  // Don't
<Button onClick={() => toast({ title: "Saved", variant: "success" })}>Save</Button>   // Do

// Icon-only control
<IconButton icon={<Trash2 />} />                                  // Don't (no name)
<IconButton icon={<Trash2 />} aria-label="Delete" />              // Do

// State
<Switch checked={on} />                                           // Don't (frozen)
<Switch checked={on} onCheckedChange={setOn} />  or  <Switch defaultChecked />   // Do
```

## 7. Copy tone

Placeholder and demo copy is fun and cult-classic: Star Wars, The Lord of the Rings, Transformers, Back to the Future, Ghostbusters, The Matrix, Jurassic Park, Indiana Jones, Alien, Blade Runner. Names, button labels, toasts, table rows: "Engage hyperdrive", "Follow the white rabbit", "Cross the streams". Keep data shapes realistic (prices, dates, counts add up). Quotes are real lines. Real product copy the user supplied is never replaced.

## 8. Media

Any image, video or audio must be free to use: CC0, public domain, Unsplash licence (e.g. `picsum.photos`) or CC BY. CC BY needs a full credit line (title, creator, licence, source link, and "modified: resized / trimmed" when changed) next to the media and in the project's credits file. Never hotlink or use unlicensed pictures.

## 9. Add a new component

Only when nothing in section 2 fits, even composed.

1. **Location**: `kiln/components/<folder>/<Name>.tsx`, one component per file, PascalCase, in the folder whose purpose matches (section 2). Shared helper used by several folders goes in `components/shared/`.
2. **Imports**: `cn` from `../../cn`, presets from `../../motion`, `Size` and `useControllable` from `../../controllable`. Other Kiln components by relative path. Nothing outside `kiln/`.
3. **Props**: export a typed `NameProps`; one-line JSDoc on the component and on every non-obvious prop; a default for every prop it can guess. Stateful: controllable via `useControllable` with the names in rule 7. A control takes `size?: Size` (default `md`) using `k-ctl-sm|md|lg`. `className` goes on the root (appended after the component's own classes); spread `...rest` onto the root element and `forwardRef` when it renders one meaningful element. Optional `label`/`aria-label` as in rule 8.
4. **Both themes**: tokens only, check light and dark. Floating things get `shadow-float`; nothing else has a shadow.
5. **Keyboard and a11y**: roles, labels, focus-visible, arrows/Enter/Esc as the pattern requires.
6. **Motion**: follow section 5, `springSoft` by default.
7. **Verify**: `npx tsc --noEmit` clean, look at it in a browser in light and dark, at 390px width, and keyboard through it.
