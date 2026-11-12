# Kiln API conventions

Every component follows the same few rules. Once you know them, you can guess how a component works before you open its file. The file is still the reference: each exported component and prop has a short JSDoc comment, so hovering in your editor shows it.

## 1. The minimal call is one line

Required props are kept to what the component can't guess. Everything else has a default.

```tsx
<Button>Engage</Button>
<Switch label="Retinal scan" />
<Select aria-label="Ship" options={ships} />
<Tabs items={tabs} />
<Slider label="Volume" />
```

## 2. State: controlled or uncontrolled

Every input works both ways. The exceptions are listed under "Always controlled" and "Keeps its own state" below.

- **Uncontrolled.** Leave out the value prop. The component keeps its own state; pass a `default…` prop to set where it starts.
- **Controlled.** Pass the value prop and its change handler, and the component shows exactly what you give it.

```tsx
// Uncontrolled: starts on, keeps its own state, tells you about changes.
<Switch label="Wi-Fi" defaultChecked onCheckedChange={save} />

// Controlled: you own the state.
const [on, setOn] = useState(true);
<Switch label="Wi-Fi" checked={on} onCheckedChange={setOn} />
```

Components use the shared hook `useControllable(value, defaultValue, onChange)` from `src/kiln/controllable.ts`. Use it for your own components too.

### Prop names

| Kind of state | Value | Start value | Change handler | Components |
| --- | --- | --- | --- | --- |
| A chosen value | `value` | `defaultValue` | `onChange(value)` | Select, Combobox, RadioGroup, SegmentedControl, CheckboxGroup, ColorSwatches, Slider (`number[]`), NumberField, TagInput, OTPInput, Tabs, Accordion (open ids; start with `defaultOpen`), ChipFilter (`string[]`, or `string \| null` with `multiple={false}`), PhoneInput (`{ country, national }`), CurrencyInput (cents or `null`), DatePicker (`Date \| null`), Calendar (`Date | null`, or `{ start, end }` with `mode="range"`; also `defaultMonth`), DateRangePicker (`{ start, end }`), TimePicker (`{ hours, minutes }`), InlineEdit, SizePicker, SidebarNav (active id), DocsNav (active id; change handler is `onSelect(id, groupId)`), CategoryFilters, Rating (number, 0 for none), ColorPicker and ColorPickerPanel (hex string), AvatarUpload (URL or `null`), ProductGallery (index), BillingToggle (`"monthly" \| "yearly"`), CompareSlider (0 to 100), Carousel (index), FeatureTabs (index), ExpandableCards (open id or `null`), AppShell (active nav id; change handler is `onNavigate(id)`), MessageActions (`"up" \| "down" \| null`; handler is `onFeedback`), CalendarMonth (`Date`), RichTextEditor (HTML), MessageComposer, ChatThread, CommentFeed, PlaceholderInput (draft text; the box clears after a send), NotificationPreferences (`{ [eventId]: { [channelId]: boolean } }`), TreeView (selected id or `null`; handler is `onSelect(id, node)`) |
| Several values at once | `filters` / `query` / `sort` | `defaultFilters` / `defaultQuery` / `defaultSort` | `onFiltersChange` / `onQueryChange` / `onSortChange` | FilterBar. DataGrid also takes `query`, `sort`, `page` and `selected` (`defaultQuery` and so on; `onQueryChange`, `onSortChange`, `onPageChange`, `onSelectedChange`), Table takes `selected` and `sort`, ReviewsSummary takes `sort`, JSONViewer takes `expanded` (a set of paths such as `$.crew[0]`) and `query`, TreeView takes `expanded` (folder ids), and PromptInput takes `model` (`defaultModel`, `onModelChange`) and `attachments` (`defaultAttachments`, `onAttachmentsChange`) next to its `value` |
| A list of rows or ids | `rows` / `selected` | `defaultRows` / `defaultSelected` | `onChange(rows)` / `onSelectedChange(set)` | KeyValueEditor, StackedList (passing any of the three turns its checkboxes on), Table and DataGrid (`selected`), CommentThread (`comments` / `defaultComments` / `onChange`), CartDrawer (`lines` / `defaultLines` / `onChange`), KanbanBoard (`columns` / `defaultColumns` / `onChange`), SortableList (`items` / `defaultItems` / `onReorder`) |
| A page | `page` | `defaultPage` | `onChange(page)` | Pagination |
| On/off | `checked` | `defaultChecked` | `onCheckedChange(bool)` | Switch, Checkbox (also accepts `"indeterminate"`) |
| Pressed | `pressed` | `defaultPressed` | `onPressedChange(bool)` | ToggleButton |
| Open/closed | `open` | `defaultOpen` | `onOpenChange(bool)` | Select, Popover, Reasoning (opens and folds with `thinking`), CookieConsent (shows itself and hides after a decision; its `value` / `defaultValue` / `onChange` hold the category choices). Overlays are always controlled; see below. |
| Text in a native input | `value` | `defaultValue` | `onChange(event)` **and** `onValueChange(text)` | TextField, Textarea, PasswordField, SearchField |
| Text with mentions | `value` (`@[Name](id)` tokens) | `defaultValue` | `onValueChange(text)`; `onChange({ text, mentions })` is unchanged | MentionsTextarea |
| A view mode | `view` | `defaultView` | `onViewChange(view)` | DiffViewer (`"split" \| "unified"`) |
| Playback | `playing` / `volume` (0 to 100) / `muted` / `currentTime` (seconds) | `defaultPlaying` / `defaultVolume` / `defaultMuted` / `defaultCurrentTime` | `onPlayingChange` / `onVolumeChange` / `onMutedChange` / `onTimeChange` | MediaPlayer |

**Always controlled.** These overlays and notices are shown or hidden by your code, so they take `open` (and `onOpenChange` where they can close themselves) with no `defaultOpen`: Dialog, Drawer, AlertDialog, CommandPalette, SpotlightSearch, KeyboardShortcutsSheet, ProductTour, CartDrawer (its cart `lines` still work both ways), ProductQuickView and Banner.

**Keeps its own state.** These whole flows and widgets hold their state inside and report through a callback such as `onSubmit`, `onSend`, `onChange` or `onOpenFile`, so there is no value prop to pass: AuthForms, CheckoutForm, OnboardingWizard, BookingSlots, FileManager, FileDropzone, SignaturePad, ImageCropper, Lightbox, ResizablePanels (`defaultSize`, `onResize`), LogStream, Terminal, WeekCalendar, NotificationCenter, OrderHistory and SplitButton.

**Display only.** A `value` here is data to show, not something the user edits: Progress, ProgressRing, Meter, Stat, GaugeChart, NumberTicker, DescriptionList, CopyButton (`value` is the text it copies), PricingCard (`billing` picks the price shown; change it with BillingToggle), Stepper (`current`), Navbar (`current`), MultiStepLoader and the charts.

Components that wrap a native `<input>` or `<textarea>` also take every native attribute: `name`, `required`, `autoComplete`, `onKeyDown`, `aria-*` and so on. Their `onChange` keeps the native signature, so form libraries work unchanged. `onValueChange` gives you the plain string.

## 3. Sizes

Controls share one scale from `src/kiln/controllable.ts`: `type Size = "sm" | "md" | "lg"`. The default is always `md`.

| Size | Height | Text | Use for |
| --- | --- | --- | --- |
| `sm` | 32px | 13px | Toolbars, table rows, dense panels |
| `md` | 40px | 14px | Forms and most UI (default) |
| `lg` | 48px | 15px | Heroes, touch-first screens, sign-up flows |

These take `size`:

- Button, IconButton, ToggleButton, SegmentedControl, Tabs
- TextField, PasswordField, SearchField, Select, NumberField, Textarea (text size and padding)
- Combobox, TagInput, DatePicker, DateRangePicker, TimePicker, PhoneInput, CurrencyInput
- Tag, Kbd (like Badge, these are smaller than a control: Tag is 24, 28 and 32px, Kbd 20, 24 and 28px)
- Switch, Checkbox, CheckboxGroup, RadioGroup
- Badge, Avatar, AvatarGroup, Progress (bar thickness), Dialog (width)

Things measured in pixels take a number:

```tsx
<Avatar name="Kyle Reese" size={64} />   // also "sm" | "md" | "lg"
<Spinner size={32} />
<ProgressRing value={72} size={120} stroke={10} />
<StatusDot status="online" size={10} />
<LineChart title="Visitors" data={d} height={280} />
```

**Width.** Inputs, Select, Combobox, TagInput, the date and time pickers, Slider, Progress, Separator and Tabs fill their container. To size one, set a width on its root. That is `className` for most components, and `containerClassName` for TextField and Textarea:

```tsx
<Select className="w-[240px]" … />
<TextField containerClassName="max-w-sm" … />
```

## 4. className and slots

- **`className` lands on the root element.** It is appended to the component's own classes. For TextField and Textarea it lands on the `<input>`/`<textarea>`, so typed-text styles work.
- **Slot classNames** reach inner parts:

  | Component | Slot | Styles |
  | --- | --- | --- |
  | TextField | `containerClassName` | the root (label, box, message) |
  | TextField | `boxClassName` | the bordered box |
  | Textarea | `containerClassName` | the root |
  | Select | `triggerClassName` | the button |
  | Tabs | `listClassName` | the tab row |

- **Overriding a built-in value.** `cn` joins classes and does not dedupe, so when two classes set the same property, the stylesheet decides which wins, not the order you wrote them in. To beat a built-in height or padding, prefer the `size` prop. Otherwise use Tailwind's important modifier, e.g. `boxClassName="h-14!"`.
- **Rest props.** Button (an `<a>` when you pass `href`, plus `external` for a new tab), IconButton, Card, Badge, Switch, Tag, Link the text inputs, Kbd, StatusDot, Separator, Skeleton, Spinner, Progress and Avatar spread any other prop (`id`, `data-*`, `aria-*`, event handlers) onto their root or their native element, and forward `ref` to it. Where the default width is `k-fill` or the height is `k-ctl-*`, a utility in `className` wins.

## 5. Labels and accessibility

- `label` is the visible label, and it becomes the accessible name.
- Leave it out and pass `aria-label` instead. Icon-only controls (IconButton, an icon ToggleButton) require one.
- RadioGroup has `hideLabel` to keep the name but hide the text.
- `disabled` works the same everywhere: dimmed, not focusable, no hover.
- `error` on a field shows the message in place of the hint, sets `aria-invalid` and gives the field one shake.

## 6. One example per family

**Actions**

```tsx
<Button variant="secondary" size="sm" leading={<Plus />} loading={saving}>Add crew</Button>
<IconButton icon={<Trash />} aria-label="Delete" variant="ghost" />
<ToggleButton icon={<Heart />} pressedIcon={<Heart fill="currentColor" />} aria-label="Like" />
<SegmentedControl options={[{ value: "grid", label: "Grid" }, { value: "list", label: "List" }]} />
```

**Inputs**

```tsx
<TextField label="Email" type="email" name="email" required onValueChange={setEmail} />
<PasswordField meter onValueChange={setPassword} />
<Checkbox label="I agree to the InGen waiver" name="terms" />
<RadioGroup label="Route" options={routes} defaultValue="moria" size="lg" />
<Slider label="Bounty" defaultValue={[40, 180]} max={300} format={(n) => `${n}k`} />
<NumberField label="Proton packs" defaultValue={2} min={0} max={4} />
<OTPInput onComplete={verify} />
```

**Pickers**

```tsx
<Select label="Droid" options={droids} defaultValue="r2" />
<Combobox label="Planet" options={planets} onChange={setPlanet} />
<TagInput label="Crew" suggestions={names} defaultValue={["Ripley"]} />
```

**Navigation**

```tsx
<Tabs variant="pill" size="sm" items={[{ id: "day", label: "Day", content: <Day /> }, …]} />
<Pagination pageCount={12} onChange={load} />
<Accordion items={faq} type="multiple" defaultOpen={["shipping"]} />
```

**Overlays** (Dialog is always controlled: you decide when it opens. Popover can keep its own state.)

```tsx
<Dialog open={open} onOpenChange={setOpen} title="Eject the warp core?" footer={<Button onClick={eject}>Eject</Button>} />
<Popover trigger={<Button variant="outline">Filters</Button>}>…</Popover>
<Tooltip content="Copy link"><IconButton icon={<Link />} aria-label="Copy link" /></Tooltip>
<DropdownMenu items={[{ label: "Rename", onSelect: rename }, { type: "separator" }, { label: "Delete", danger: true, onSelect: remove }]}
  trigger={(p) => <IconButton {...p} icon={<MoreHorizontal />} aria-label="More" />} />
```

**Feedback**

```tsx
const { toast, promise } = useToast();            // inside <ToastProvider>
toast({ title: "Saved", variant: "success", action: { label: "Undo", onClick: undo } });
<Alert tone="warning" title="Low fuel">Refuel before the Kessel Run.</Alert>
<Badge tone="positive" dot size="sm">Online</Badge>
<Progress value={64} label="Uploading" valueText="64%" />
```

**Data and charts**

```tsx
<Table rows={rows} columns={columns} rowKey={(r) => r.id} selectable />
<Avatar name="Leia Organa" status="online" />
<LineChart title="Visitors" data={points} height={240} format={(n) => n.toLocaleString()} />
```

**Surfaces**

```tsx
<Card>…</Card>                                   // padded by default; padded={false} to opt out
<InteractiveCard title="Full crew" description="Four busters" selected={plan === "crew"} onClick={() => setPlan("crew")} />
```

## 7. Text and labels

Kiln has no built-in i18n. Every piece of user-visible text can be changed through props.

- **Content** (a title, a body, a caption) is a prop or children, as in `<Alert title="Low fuel">`.
- **Chrome text** (button labels, aria-labels, empty states, tooltips, units, screen-reader text) goes through one prop: `labels?: Partial<XLabels>`. The component exports `XLabels` (the type) and `xLabels` (the English defaults). Your partial is merged over the defaults, so you only pass what you change.
- Strings that depend on values are functions: `pageOf: (page, count) => ...`.
- A dedicated prop that already existed (`placeholder`, `emptyText`, `doneLabel`, `aria-label`, `label`) is kept and wins over `labels`.
- Components that show dates or numbers accept `locale?: string` and format with `Intl`. Left unset, the output is the same English as before.
- Pass a stable `labels` object (module constant or `useMemo`) to the few components that memoise their rows (JSONViewer, DocsNav).

```tsx
import { Pagination, type PaginationLabels } from "kiln/components/wayfinding/Pagination";

const klingon: Partial<PaginationLabels> = {
  nav: "paghmey",
  previous: "pa' paq",
  next: "veb paq",
  page: (p) => `paq ${p}`,
  pageOf: (p, n) => `paq ${p} vo' ${n}`,
  of: (n) => `vo' ${n}`,
};

<Pagination pageCount={24} labels={klingon} />
<DatePicker locale="de-DE" labels={{ placeholder: "Datum wählen" }} />
```

Defaults are exported too, so you can extend them: `{ ...paginationLabels, next: "Onward" }`.

**Components that accept `labels`** (each exports `<name>Labels`, e.g. `paginationLabels`):

- AI: ChatMessage, MessageActions, Reasoning, ToolCall, PromptInput, Citation and Sources (shared `citationLabels`)
- App shells: AppShell, CollapsingActions, StackedLayout, StackedList
- Buttons: CopyButton, HoldButton, SplitButton
- Cards: ExpandableCards, BillingToggle, PricingCard (+ `locale`)
- Charts: DonutChart, YearHeatmap (has `locale`)
- Choice controls: CheckboxGroup, Slider, ColorPicker and ColorPickerPanel (shared `colorPickerLabels`), Rating (prop is `uiLabels`, because `labels` is already the per-value words)
- Commerce: CartDrawer, CategoryFilters (and FilterPanel), CheckoutForm, Invoice, OrderHistory (+ `locale`), ProductGallery, ProductQuickView, ReviewsSummary (+ `locale`), Stars, SizePicker
- Communication: ChatThread, CommentFeed, CommentThread, MessageComposer
- Data display: Avatar, AvatarGroup, CodeBlock, DescriptionList, HeatStrip (+ `locale`), ListItem, Tag
- Dev tools: DiffViewer, JSONViewer, LogStream (+ `locale`), Terminal
- Effects: Dock, ScrollStory, ScrollTimeline, StickyScrollReveal
- Forms: AuthForms, AvatarUpload (`cropperLabels` for the cropper), ImageCropper, InlineEdit, KeyValueEditor, SaveBar
- Guidance: KeyboardShortcutsSheet, OnboardingWizard, ProductTour
- Marketing: Changelog, BlogList, ContactSection, NewsletterSignup, NotFound, FeatureTabs, StatsSection (only `locale`)
- Media: Carousel, CompareSlider, MediaPlayer, VideoPlayer
- Menus: CommandPalette, ContextMenu, Navbar (and MenuToggle), FlyoutNav, SidebarNav, SpotlightSearch, DocsNav
- Notices: Alert, Banner, CookieConsent, NotificationBell, NotificationCenter, UndoBar, ToastProvider
- Overlays: AlertDialog, Dialog, Drawer, Lightbox
- Pickers: BookingSlots (+ `locale`), Calendar (+ `locale`), DatePicker (+ `locale`), DateRangePicker (+ `locale`), Combobox, FileDropzone, Select, SignaturePad, TagInput, TimeWheels, TimePicker
- Primitives: ThemeToggle, ThemeSwitcher
- Status: StatusDot, Spinner, Meter, MultiStepLoader
- Tables: Table, ComparisonTable, InfiniteFeed, DataGrid
- Text inputs: Field, TextField, SearchField, PasswordField, NumberField, OTPInput, PlaceholderInput, MentionsTextarea, PhoneInput, RichTextEditor
- Wayfinding: Pagination, BackToTop, ScrollProgress, Breadcrumbs, Stepper
- Workspace: CalendarMonth (+ `locale`), WeekCalendar, FilterBar, FileManager, GanttChart, KanbanBoard, NotificationPreferences, ResizablePanels, SortableList

**Left in code on purpose**

- Caller data: chart aria-labels built from `title` and series names, GridList action labels, and anything that is a `label`, `title` or `aria-label` prop.
- Symbols and punctuation: `×`, `%`, range dashes, `" · "`, the `m:ss` time format, key names such as `Ctrl` and `F2`, single-letter colour channels (R, G, B, H, S, L).
- Technical unit abbreviations in `formatBytes` (B, KB, MB).
- Week start is Monday in Calendar and CalendarMonth for every locale (changing it would change behaviour).
- Data lists with their own prop: PhoneInput country names (`countries`), PasswordField rules (`rules`).
- DataGrid does not forward labels to its inner Pagination and SearchField.
- Components with no chrome text (Button, Card, Switch, Tabs, Accordion, Badge and similar) take all their text from props and children.

## 8. Icons

Every icon a component draws itself can be replaced through props, without editing source. It mirrors `labels`.

- Each component with built-in icons takes `icons?: Partial<XIcons>`. `XIcons` maps slot names to `ReactNode`, and the defaults are exported as `xIcons`. Your partial is merged over them.
- A slot takes any element: a lucide icon, your own `<svg>`, an `<img>`. The component's wrapper sets the size and the colour with CSS (`[&>svg]:size-4`, `currentColor`), so don't pass size props. A custom SVG should use `currentColor` for its stroke or fill and let its `viewBox` do the scaling.
- A dedicated `icon`, `leading` or `trailing` prop that already existed is kept and wins over `icons`. `Alert` also takes `icon`, and `icon={null}` hides the tone icon.
- Pass a stable object (module constant or `useMemo`) to components that memoise their rows (DocsNav, JSONViewer).
- Rating takes a lit and an unlit icon (`star`, `starOff`). The lit one gets `fill-current` from the wrapper; give `starOff` an outline version.
- Play, pause and the video speaker are drawn as path morphs. Their slots default to `null`; set any slot in that family and the component cross-fades the slots instead of morphing.
- Spinning icons (Button `spinner`, Toast `loading`, VideoPlayer `spinner`) spin on the wrapper, so a custom icon spins too.

```tsx
import { Alert, Rating, alertIcons } from "@electro1207/kiln";
import { Heart, Skull, Zap } from "lucide-react";

<Alert tone="warning" title="Don't cross the streams" icons={{ warning: <Zap />, error: <Skull /> }} />
<Rating value={4} icons={{ star: <Heart fill="currentColor" />, starOff: <Heart /> }} />
<Alert tone="info" title="Containment unit at 85%" icon={null} />   // hide the icon
// alertIcons holds the defaults, if you want to spread them into your own set.
```

**Slots per component** (each exports `<name>Icons`, e.g. `alertIcons`):

- AI: Citation (`external, expand`); MessageActions (`good, bad, regenerate, copy, copied`); PromptInput (`attach, file, remove, chevron, send, stop`); Reasoning (`brain, expand`); ToolCall (`tool, pending, running, done, denied, expand`)
- App shells: AppShell (`menu, collapse, expand`); CollapsingActions (`more`); StackedLayout (`menu, close`); StackedList (`open`)
- Buttons: Button (`spinner`); CopyButton (`copy, copied`); Link (`external`); SplitButton (`chevron`)
- Cards: InteractiveCard (`arrow`); ExpandableCards (`close`); PricingCard (`check`)
- Choice controls: Checkbox (`check, indeterminate`); ColorPicker (`dropper, add`); ColorSwatches (`check`); Rating (`star, starOff`)
- Commerce: CartDrawer (`shipping, empty, remove, fewer, more`); CategoryFilters (`filters, remove, check`); CheckoutForm (`secure, card, promo, expand`); OrderHistory (`track, expand, reorder, added`); ProductQuickView (`cart, added`); Stars (`star`); ReviewsSummary (`write, helpful, star`)
- Communication: ChatThread (`latest, send`); CommentThread (`agree, love, funny, edit, delete, more, addReaction`); MessageComposer (`attach, image, file, remove, send`)
- Data display: Stat (`up, down`); Tag (`remove`)
- Dev tools: DiffViewer (`unfold`); JSONViewer (`expand, search`); LogStream (`latest, paused`); Terminal (`latest`)
- Forms: AuthForms (`name, email, sent, back`); AvatarUpload (`upload, sample, remove`); InlineEdit (`edit`); KeyValueEditor (`markSecret, reveal, hide, remove, add`)
- Guidance: KeyboardShortcutsSheet (`search`); ProductTour (`close`)
- Marketing: ContactSection (`address, phone, email, success`); NewsletterSignup (`success`); NotFound (`arrow`)
- Media: Carousel (`previous, next`); CompareSlider (`handle`); MediaPlayer (`play, pause, back15, forward15, volume, volumeLow, mute`); VideoPlayer (`play, pause, back10, forward10, volume, volumeLow, mute, captions, settings, pictureInPicture, theater, fullscreen, exitFullscreen, shortcuts, close, next, previous, check, seek, replay, spinner`)
- Menus: CommandPalette (`search, enter`); DocsNav (`expand`); DropdownMenu (`check, submenu`); FlyoutNav (`expand`); SidebarNav (`collapse, expand, chevron`); SpotlightSearch (`search, clear, recent, enter`)
- Notices: Alert (`info, success, warning, error, close`); Banner (`close`); FieldMessage (`error, success`); NotificationBell (`bell`); NotificationCenter (`bell, mention, emptyAll, emptyUnread, emptyMentions`); Toast (`success, error, warning, info, loading, close`)
- Overlays: Dialog (`close`); Drawer (`close`); Lightbox (`close, previous, next`)
- Pickers: BookingSlots (`duration, slot, timeZone, back, booked, calendar`); ChipFilter (`check`); Combobox (`search, clear`); Calendar (`previous, next`); DatePicker (`calendar`); FileDropzone (`upload, image, archive, document, file, done, retry, remove`); Select (`chevron, check`); SignaturePad (`undo, clear, download`); TagInput (`remove, create`); TimePicker (`clock`)
- Status: MultiStepLoader (`check, spinner`)
- Tables: ComparisonTable (`included, notIncluded`); DataGrid (`columns, clearSelection, search`); Table (`sort, check, indeterminate`)
- Text inputs: NumberField (`decrease, increase`); PasswordField (`lock, show, hide`); PhoneInput (`chevron, search`); PlaceholderInput (`send`); RichTextEditor (`bold, italic, underline, strikeThrough, code, link, insertUnorderedList, insertOrderedList, quote`); SearchField (`search, spinner, clear`); TextField (`clear`)
- Wayfinding: Accordion (`expand`); BackToTop (`up`); Breadcrumbs (`separator, more`); Pagination (`previous, next`); Stepper (`check`)
- Workspace: CalendarMonth (`previous, next`); FileManager (`separator, newFolder, grid, list, folder, folderOpen, file, fileImage, fileArchive, fileCode, fileText, rename, delete`); FilterBar (`search, clear, check, chevron, remove, add, sort`); KanbanBoard (`more, moveToColumn, moveToTop, moveUp, moveDown`); NotificationPreferences (`check, mixed`); SortableList (`grip`); TreeView (`chevron, folder, folderOpen, file, fileImage, fileCode, fileText`)

Citation's icons also serve Sources and SourceCard. DatePicker's serve DateRangePicker (`dateRangePickerIcons`), and Calendar's `previous` and `next` pass down to both. DataGrid's extend Table's and take a nested `search` for its filter field. Toast's are a prop on `ToastProvider`. FilterPanel takes the CategoryFilters set.

**Left drawn on purpose**

- ThemeToggle: the sun and moon morph into each other, so they stay drawn.
- Charts and data drawings: Sparkline, LineChart, RadarChart, GaugeChart, SankeyChart, DonutChart, ProgressRing, GanttChart dependency lines, UndoBar countdown ring.
- Content art: EmptyState illustration, the assistant mark in ChatMessage (replace it with its `avatar` prop), SizePicker strike-through, ImageCropper overlay, BorderBeam and AnimatedBeam paths, Spinner kinds (ring, dots, bars, pulse), the per-rule ticks in PasswordField's strength meter.
- Brand marks and logos are never built in: marketing sections take them from props.

## 9. When you add a component

1. Give it a typed `…Props` export, plus a one-line JSDoc on the component and on any prop that isn't obvious.
2. Give it a default for every prop it can guess.
3. If it holds state, make it controllable with `useControllable`, and name the props as in the table above.
4. If it is a control, give it `size?: Size` with the shared heights.
5. Pass `className` to the root, and spread `...rest` onto it when it renders one meaningful element.
6. Put every UI-chrome string in an exported `xLabels` object behind `labels?: Partial<XLabels>` (section 7), and accept `locale` for dates and numbers.
7. Put every icon the component draws itself in an exported `xIcons` object behind `icons?: Partial<XIcons>` (section 8).
8. Follow `docs/CONVENTIONS.md` for motion, colour and copy.
