# Kiln taxonomy

Section, then group, then entry, then component files. Generated from `src/gallery/registry.ts` (`TAXONOMY`) and the `files` of each demo entry; the entry ids and file names match the gallery exactly.

Every group is one gallery page (`#/<group id>`). The **Folder** is the home of the group's component files (the move is done): `src/kiln/components/<folder>/<File>.tsx`. Folders are kebab-case and unique. Only the first (primary) file of an entry moves with it; other files an entry lists are shared helpers (see the end).

## Foundations

Section id: `foundations`

### Tokens
Group id: `tokens` · Folder: `tokens/` · 3 entries

| Entry | Id | Files |
| --- | --- | --- |
| Colour tokens | `colour-tokens` | `src/kiln/tokens.css`, `src/kiln/kiln.css` |
| Type scale | `type-scale` | `src/kiln/kiln.css` |
| Motion presets | `motion-presets` | `src/kiln/motion.ts` |

### Primitives
Group id: `primitives` · Folder: `primitives/` · 6 entries

| Entry | Id | Files |
| --- | --- | --- |
| Theme toggle | `theme-toggle` | `ThemeToggle.tsx`, `src/kiln/theme.tsx` |
| Glaze picker | `glaze-picker` | `GlazePicker.tsx`, `src/kiln/glaze.ts`, `src/kiln/theme.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts` |
| Glaze | `glaze` | `Glaze.tsx`, `src/kiln/glaze.ts`, `src/kiln/theme.tsx`, `src/kiln/cn.ts` |
| Scroll area & scrollbar | `scroll-area` | `ScrollArea.tsx` |
| Separator | `separator` | `Separator.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Image | `aspect-image` | `AspectImage.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |

## Actions & inputs

Section id: `inputs`

### Buttons & links
Group id: `buttons` · Folder: `buttons/` · 9 entries

| Entry | Id | Files |
| --- | --- | --- |
| Button | `button` | `Button.tsx` |
| Icon button | `icon-button` | `IconButton.tsx` |
| Button group and split button | `button-group` | `ButtonGroup.tsx`, `SplitButton.tsx` |
| Toggle button | `toggle-button` | `ToggleButton.tsx`, `src/kiln/controllable.ts` |
| Segmented control | `segmented-control` | `SegmentedControl.tsx`, `src/kiln/controllable.ts` |
| Copy button | `copy-button` | `CopyButton.tsx` |
| Hold to confirm | `hold-button` | `HoldButton.tsx` |
| Magnetic button | `magnetic-button` | `MagneticButton.tsx` |
| Link | `link` | `Link.tsx` |

### Text input
Group id: `text-input` · Folder: `text-input/` · 11 entries

| Entry | Id | Files |
| --- | --- | --- |
| Text field | `text-field` | `TextField.tsx`, `Field.tsx`, `src/kiln/controllable.ts` |
| Textarea | `textarea` | `Textarea.tsx`, `Field.tsx`, `src/kiln/controllable.ts` |
| Password field | `password-field` | `PasswordField.tsx`, `Field.tsx`, `src/kiln/controllable.ts` |
| Search field | `search-field` | `SearchField.tsx`, `src/kiln/controllable.ts` |
| Number field | `number-field` | `NumberField.tsx`, `src/kiln/controllable.ts` |
| One-time code | `otp-input` | `OTPInput.tsx`, `src/kiln/controllable.ts` |
| Phone input | `phone-input` | `PhoneInput.tsx`, `src/kiln/components/caret.ts`, `Anchored.tsx`, `Field.tsx`, `src/kiln/controllable.ts` |
| Currency input | `currency-input` | `CurrencyInput.tsx`, `src/kiln/components/caret.ts`, `Field.tsx`, `src/kiln/controllable.ts` |
| Placeholder input | `placeholder-input` | `PlaceholderInput.tsx`, `src/kiln/components/useLoop.ts` |
| Mentions | `mentions-textarea` | `MentionsTextarea.tsx`, `Anchored.tsx`, `Avatar.tsx` |
| Rich text | `rich-text-editor` | `RichTextEditor.tsx`, `Anchored.tsx` |

### Choice controls
Group id: `choice` · Folder: `choice-controls/` · 7 entries

| Entry | Id | Files |
| --- | --- | --- |
| Checkbox | `checkbox` | `Checkbox.tsx`, `CheckboxGroup.tsx`, `src/kiln/controllable.ts` |
| Radio group | `radio-group` | `RadioGroup.tsx`, `src/kiln/controllable.ts` |
| Switch | `switch` | `Switch.tsx`, `src/kiln/controllable.ts` |
| Slider | `slider` | `Slider.tsx`, `src/kiln/controllable.ts` |
| Rating | `rating` | `Rating.tsx` |
| Colour swatches | `color-swatches` | `ColorSwatches.tsx`, `src/kiln/controllable.ts` |
| Colour picker | `color-picker` | `ColorPicker.tsx`, `Anchored.tsx`, `SegmentedControl.tsx`, `src/kiln/controllable.ts` |

### Pickers
Group id: `pickers` · Folder: `pickers/` · 9 entries

| Entry | Id | Files |
| --- | --- | --- |
| Select | `select` | `Select.tsx`, `Anchored.tsx`, `src/kiln/controllable.ts` |
| Combobox | `combobox` | `Combobox.tsx`, `Anchored.tsx`, `src/kiln/controllable.ts` |
| Tag input | `tag-input` | `TagInput.tsx`, `Combobox.tsx`, `Anchored.tsx`, `src/kiln/controllable.ts` |
| Chip filter | `chip-filter` | `ChipFilter.tsx` |
| Date picker | `date-picker` | `DatePicker.tsx`, `Anchored.tsx` |
| Time picker | `time-picker` | `TimePicker.tsx`, `Anchored.tsx` |
| Booking | `booking-slots` | `BookingSlots.tsx`, `DatePicker.tsx` |
| File dropzone | `file-dropzone` | `FileDropzone.tsx` |
| Signature pad | `signature-pad` | `SignaturePad.tsx` |

### Forms
Group id: `forms` · Folder: `forms/` · 5 entries

| Entry | Id | Files |
| --- | --- | --- |
| Sign in, sign up, reset | `auth-forms` | `AuthForms.tsx`, `TextField.tsx`, `PasswordField.tsx`, `Field.tsx`, `Button.tsx`, `src/kiln/controllable.ts` |
| Settings section | `settings-section` | `SettingsSection.tsx`, `SaveBar.tsx` |
| Inline edit | `inline-edit` | `InlineEdit.tsx` |
| Avatar upload and cropper | `avatar-upload` | `AvatarUpload.tsx`, `ImageCropper.tsx`, `Slider.tsx`, `src/kiln/controllable.ts` |
| Key–value editor | `key-value-editor` | `KeyValueEditor.tsx` |

## Navigation

Section id: `navigation`

### Menus & bars
Group id: `menus` · Folder: `menus/` · 8 entries

| Entry | Id | Files |
| --- | --- | --- |
| Navbar | `navbar` | `Navbar.tsx`, `Button.tsx` |
| Flyout and mega menu | `flyout-nav` | `FlyoutNav.tsx` |
| Sidebar | `sidebar-nav` | `SidebarNav.tsx` |
| Docs navigation | `docs-nav` | `DocsNav.tsx`, `SearchField.tsx`, `ScrollArea.tsx` |
| Dropdown menu | `dropdown-menu` | `DropdownMenu.tsx`, `Anchored.tsx` |
| Context menu | `context-menu` | `ContextMenu.tsx`, `DropdownMenu.tsx`, `Anchored.tsx` |
| Command palette | `command-palette` | `CommandPalette.tsx` |
| Spotlight search | `spotlight-search` | `SpotlightSearch.tsx`, `src/kiln/components/useOverlay.ts`, `Combobox.tsx`, `src/kiln/controllable.ts` |

### Wayfinding
Group id: `wayfinding` · Folder: `wayfinding/` · 8 entries

| Entry | Id | Files |
| --- | --- | --- |
| Tabs | `tabs` | `Tabs.tsx`, `src/kiln/controllable.ts` |
| Accordion | `accordion` | `Accordion.tsx`, `src/kiln/controllable.ts` |
| Breadcrumbs | `breadcrumbs` | `Breadcrumbs.tsx`, `DropdownMenu.tsx`, `Anchored.tsx` |
| Pagination | `pagination` | `Pagination.tsx`, `src/kiln/controllable.ts` |
| Stepper | `stepper` | `Stepper.tsx` |
| Back to top | `back-to-top` | `BackToTop.tsx` |
| Scroll progress | `scroll-progress` | `ScrollProgress.tsx` |
| Scroll checkpoints | `scroll-checkpoints` | `ScrollCheckpoints.tsx`, `src/kiln/controllable.ts` |

## Overlays & feedback

Section id: `feedback`

### Overlays
Group id: `overlays` · Folder: `overlays/` · 7 entries

| Entry | Id | Files |
| --- | --- | --- |
| Dialog | `dialog` | `Dialog.tsx`, `src/kiln/components/useOverlay.ts`, `Button.tsx` |
| Alert dialog | `alert-dialog` | `AlertDialog.tsx`, `Dialog.tsx`, `src/kiln/components/useOverlay.ts`, `Button.tsx` |
| Drawer | `drawer` | `Drawer.tsx`, `src/kiln/components/useOverlay.ts` |
| Popover | `popover` | `Popover.tsx`, `src/kiln/components/useOverlay.ts` |
| Tooltip | `tooltip` | `Tooltip.tsx`, `src/kiln/components/useOverlay.ts` |
| Hover card | `hover-card` | `HoverCard.tsx`, `src/kiln/components/useOverlay.ts` |
| Lightbox | `lightbox` | `Lightbox.tsx`, `src/kiln/components/useOverlay.ts` |

### Notices
Group id: `notices` · Folder: `notices/` · 8 entries

| Entry | Id | Files |
| --- | --- | --- |
| Toast | `toast` | `Toast.tsx`, `src/kiln/components/useOverlay.ts` |
| Alert | `alert` | `Alert.tsx` |
| Banner | `banner` | `Banner.tsx` |
| Field message | `field-message` | `FieldMessage.tsx` |
| Undo bar | `undo-bar` | `UndoBar.tsx` |
| Notification bell | `notification-bell` | `NotificationBell.tsx` |
| Notification center | `notification-center` | `NotificationCenter.tsx`, `NotificationBell.tsx`, `Popover.tsx`, `Avatar.tsx`, `src/kiln/components/useOverlay.ts` |
| Cookie consent | `cookie-consent` | `CookieConsent.tsx`, `Switch.tsx`, `Button.tsx`, `src/kiln/components/useOverlay.ts` |

### Status & loading
Group id: `status` · Folder: `status/` · 8 entries

| Entry | Id | Files |
| --- | --- | --- |
| Badge and status dot | `badge` | `Badge.tsx`, `StatusDot.tsx` |
| Progress bar | `progress` | `Progress.tsx` |
| Progress ring | `progress-ring` | `ProgressRing.tsx` |
| Meter | `meter` | `Meter.tsx` |
| Spinner | `spinner` | `Spinner.tsx` |
| Skeleton | `skeleton` | `Skeleton.tsx` |
| Multi-step loader | `multi-step-loader` | `MultiStepLoader.tsx` |
| Empty state | `empty-state` | `EmptyState.tsx` |

### Guidance
Group id: `guidance` · Folder: `guidance/` · 3 entries

| Entry | Id | Files |
| --- | --- | --- |
| Product tour | `product-tour` | `ProductTour.tsx`, `Button.tsx`, `src/kiln/components/useOverlay.ts` |
| Onboarding wizard | `onboarding-wizard` | `OnboardingWizard.tsx`, `Button.tsx` |
| Keyboard shortcuts | `keyboard-shortcuts` | `KeyboardShortcutsSheet.tsx`, `Dialog.tsx` |

## Data & charts

Section id: `data`

### Data display
Group id: `display` · Folder: `data-display/` · 10 entries

| Entry | Id | Files |
| --- | --- | --- |
| Avatar | `avatar` | `Avatar.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Tag | `tag` | `Tag.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Keyboard key | `kbd` | `Kbd.tsx`, `src/kiln/cn.ts` |
| Stat | `stat` | `Stat.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Number ticker | `number-ticker` | `NumberTicker.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Description list | `description-list` | `DescriptionList.tsx`, `CopyButton.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| List | `list` | `List.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Timeline | `timeline` | `Timeline.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Activity strip | `heat-strip` | `HeatStrip.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Code block | `code-block` | `CodeBlock.tsx`, `CopyButton.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |

### Tables & lists
Group id: `tables` · Folder: `tables/` · 5 entries

| Entry | Id | Files |
| --- | --- | --- |
| Table | `table` | `Table.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Data grid | `data-grid` | `DataGrid.tsx`, `Table.tsx`, `SearchField.tsx`, `SegmentedControl.tsx`, `DropdownMenu.tsx`, `Anchored.tsx`, `Pagination.tsx`, `Button.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts` |
| Comparison table | `comparison-table` | `ComparisonTable.tsx`, `src/kiln/cn.ts` |
| Virtual list | `virtual-list` | `VirtualList.tsx` |
| Infinite feed | `infinite-feed` | `InfiniteFeed.tsx`, `Skeleton.tsx` |

### Charts
Group id: `charts` · Folder: `charts/` · 11 entries

| Entry | Id | Files |
| --- | --- | --- |
| Bar chart | `bar-chart` | `BarChart.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Line chart | `line-chart` | `LineChart.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Stacked area | `area-chart` | `AreaChart.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Donut | `donut` | `DonutChart.tsx`, `Anchored.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Sparkline | `sparkline` | `Sparkline.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Gauge | `gauge` | `GaugeChart.tsx`, `NumberTicker.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Funnel | `funnel` | `FunnelChart.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Radar | `radar` | `RadarChart.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Treemap | `treemap` | `TreemapChart.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Year calendar heatmap | `year-heatmap` | `YearHeatmap.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Sankey | `sankey` | `SankeyChart.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |

## Surfaces & media

Section id: `surfaces`

### Cards
Group id: `cards` · Folder: `cards/` · 8 entries

| Entry | Id | Files |
| --- | --- | --- |
| Card | `card` | `Card.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Media card | `media-card` | `Card.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Choice card | `interactive-card` | `Card.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Stat card | `stat-card` | `Card.tsx`, `Stat.tsx`, `BarChart.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Expanding card | `expandable-card` | `ExpandableCard.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Tilt card | `tilt-card` | `TiltCard.tsx` |
| Floating card | `floating-card` | `FloatingCard.tsx`, `src/kiln/components/shared/useLoop.ts` |
| Pricing | `pricing` | `PricingCard.tsx`, `NumberTicker.tsx`, `Button.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |

### Media
Group id: `media` · Folder: `media/` · 6 entries

| Entry | Id | Files |
| --- | --- | --- |
| Video player | `video-player` | `VideoPlayer.tsx` |
| Media player | `media-player` | `MediaPlayer.tsx`, `Slider.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts` |
| Carousel | `carousel` | `Carousel.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Masonry gallery | `masonry` | `Masonry.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Compare slider | `compare-slider` | `CompareSlider.tsx` |
| Marquee | `marquee` | `Marquee.tsx`, `src/kiln/cn.ts` |

## Layouts & patterns

Section id: `patterns`

### App shells
Group id: `shells` · Folder: `app-shells/` · 6 entries

| Entry | Id | Files |
| --- | --- | --- |
| Sidebar layout | `app-shell` | `AppShell.tsx`, `Drawer.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Stacked layout | `stacked-layout` | `StackedLayout.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Headings | `headings-layout` | `PageHeading.tsx`, `HeadingParts.tsx`, `Breadcrumbs.tsx`, `DropdownMenu.tsx`, `Button.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Grid lists | `grid-list` | `GridList.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Stacked list | `stacked-list` | `StackedList.tsx`, `Table.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Dashboard screen | `dashboard` | `Stat.tsx`, `BarChart.tsx`, `Card.tsx`, `StackedList.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |

### Workspace
Group id: `workspace` · Folder: `workspace/` · 10 entries

| Entry | Id | Files |
| --- | --- | --- |
| Tree view | `tree-view` | `TreeView.tsx` |
| Kanban board | `kanban-board` | `KanbanBoard.tsx`, `DropdownMenu.tsx`, `Anchored.tsx` |
| Sortable list | `sortable-list` | `SortableList.tsx` |
| Resizable panels | `resizable-panels` | `ResizablePanels.tsx` |
| Filter bar | `filter-bar` | `FilterBar.tsx`, `DropdownMenu.tsx`, `Anchored.tsx` |
| File manager | `file-manager` | `FileManager.tsx`, `DropdownMenu.tsx`, `Anchored.tsx`, `SegmentedControl.tsx`, `src/kiln/controllable.ts` |
| Calendar month | `calendar-month` | `CalendarMonth.tsx`, `Anchored.tsx` |
| Week calendar | `week-calendar` | `WeekCalendar.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Gantt chart | `gantt` | `GanttChart.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Notification preferences | `notification-preferences` | `NotificationPreferences.tsx` |

### Communication
Group id: `communication` · Folder: `communication/` · 4 entries

| Entry | Id | Files |
| --- | --- | --- |
| Chat thread | `chat-thread` | `ChatThread.tsx`, `Avatar.tsx` |
| Comment thread | `comment-thread` | `CommentThread.tsx`, `Avatar.tsx`, `Button.tsx`, `DropdownMenu.tsx`, `Anchored.tsx` |
| Comment feed | `comment-feed` | `CommentFeed.tsx`, `Avatar.tsx`, `Button.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Message composer | `message-composer` | `MessageComposer.tsx` |

### AI interfaces
Group id: `ai` · Folder: `ai/` · 8 entries

| Entry | Id | Files |
| --- | --- | --- |
| Conversation | `conversation` | `PromptInput.tsx`, `StreamingText.tsx`, `Reasoning.tsx`, `Citation.tsx`, `MessageActions.tsx`, `ChatMessage.tsx`, `Suggestions.tsx` |
| Prompt input | `prompt-input` | `PromptInput.tsx`, `DropdownMenu.tsx`, `Anchored.tsx` |
| Streaming message | `streaming-message` | `StreamingText.tsx`, `ChatMessage.tsx`, `CodeBlock.tsx` |
| Reasoning | `reasoning` | `Reasoning.tsx`, `src/kiln/components/useLoop.ts` |
| Sources and citations | `sources` | `Citation.tsx`, `HoverCard.tsx` |
| Tool call | `tool-call` | `ToolCall.tsx`, `Button.tsx` |
| Suggestions | `suggestions` | `Suggestions.tsx` |
| Message actions | `message-actions` | `MessageActions.tsx`, `CopyButton.tsx`, `Tooltip.tsx` |

### Developer tools
Group id: `devtools` · Folder: `dev-tools/` · 5 entries

| Entry | Id | Files |
| --- | --- | --- |
| Diff viewer | `diff-viewer` | `DiffViewer.tsx`, `SegmentedControl.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts` |
| JSON viewer | `json-viewer` | `JSONViewer.tsx`, `CopyButton.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Terminal | `terminal` | `Terminal.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Terminal script | `terminal-script` | `TerminalScript.tsx`, `Terminal.tsx`, `src/kiln/components/shared/useLoop.ts`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Log stream | `log-stream` | `LogStream.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |

### Commerce
Group id: `commerce` · Folder: `commerce/` · 8 entries

| Entry | Id | Files |
| --- | --- | --- |
| Product gallery | `product-gallery` | `ProductGallery.tsx`, `src/kiln/components/commerce.ts` |
| Quick view | `product-quick-view` | `ProductQuickView.tsx`, `SizePicker.tsx`, `ProductGallery.tsx`, `Dialog.tsx`, `src/kiln/components/commerce.ts` |
| Cart drawer | `cart-drawer` | `CartDrawer.tsx`, `Drawer.tsx`, `src/kiln/components/commerce.ts` |
| Checkout | `checkout-form` | `CheckoutForm.tsx`, `src/kiln/components/commerce.ts` |
| Reviews | `reviews-summary` | `ReviewsSummary.tsx` |
| Category filters | `category-filters` | `CategoryFilters.tsx`, `Slider.tsx`, `Checkbox.tsx`, `src/kiln/controllable.ts` |
| Order history | `order-history` | `OrderHistory.tsx`, `Badge.tsx`, `src/kiln/components/commerce.ts`, `src/kiln/controllable.ts` |
| Invoice | `invoice` | `Invoice.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |

### Marketing
Group id: `marketing` · Folder: `marketing/` · 16 entries

| Entry | Id | Files |
| --- | --- | --- |
| Hero | `hero` | `Hero.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Feature section | `feature-split` | `FeatureSplit.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |
| Bento grid | `bento-grid` | `BentoGrid.tsx` |
| Feature tabs | `feature-tabs` | `FeatureTabs.tsx` |
| Stats section | `stats-section` | `StatsSection.tsx`, `PageHeading.tsx` |
| Call to action | `cta-section` | `CTASection.tsx` |
| Newsletter sign-up | `newsletter` | `NewsletterSignup.tsx`, `Button.tsx` |
| Contact section | `contact-section` | `ContactSection.tsx`, `TextField.tsx`, `Textarea.tsx`, `Select.tsx`, `src/kiln/controllable.ts` |
| Team grid | `team-grid` | `TeamGrid.tsx`, `Avatar.tsx` |
| FAQ section | `faq-section` | `FAQSection.tsx`, `Accordion.tsx`, `src/kiln/controllable.ts` |
| Testimonials | `testimonials` | `Testimonials.tsx`, `Avatar.tsx` |
| Blog list | `blog-list` | `BlogList.tsx`, `Avatar.tsx` |
| Changelog | `changelog` | `Changelog.tsx` |
| Page and section headings | `headings` | `PageHeading.tsx` |
| 404 page | `not-found` | `NotFound.tsx` |
| Footer | `footer` | `Footer.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts` |

## Motion

Section id: `motion`

### Text effects
Group id: `text-effects` · Folder: `text-effects/` · 5 entries

| Entry | Id | Files |
| --- | --- | --- |
| Text animate | `text-animate` | `TextAnimate.tsx` |
| Typewriter | `typewriter` | `Typewriter.tsx`, `src/kiln/components/useLoop.ts` |
| Word rotate | `word-rotate` | `WordRotate.tsx`, `src/kiln/components/useLoop.ts` |
| Scramble text | `scramble-text` | `ScrambleText.tsx`, `src/kiln/components/useLoop.ts` |
| Scroll words | `scroll-words` | `ScrollWords.tsx`, `src/kiln/components/shared/useLoop.ts` |

### Effects
Group id: `effects` · Folder: `effects/` · 12 entries

| Entry | Id | Files |
| --- | --- | --- |
| Reveal | `reveal` | `Reveal.tsx`, `src/kiln/components/shared/useLoop.ts` |
| Dock | `dock` | `Dock.tsx` |
| Animated beam | `animated-beam` | `AnimatedBeam.tsx`, `src/kiln/components/useLoop.ts` |
| Orbiting circles | `orbiting-circles` | `OrbitingCircles.tsx`, `src/kiln/components/useLoop.ts` |
| Animated list | `animated-list` | `AnimatedList.tsx`, `src/kiln/components/useLoop.ts` |
| Border beam | `border-beam` | `BorderBeam.tsx`, `src/kiln/components/useLoop.ts` |
| Sticky scroll reveal | `sticky-scroll-reveal` | `StickyScrollReveal.tsx` |
| Scroll story | `scroll-story` | `ScrollStory.tsx`, `src/kiln/components/shared/useLoop.ts` |
| Scroll timeline | `scroll-timeline` | `ScrollTimeline.tsx`, `src/kiln/components/shared/useLoop.ts` |
| Parallax | `parallax` | `Parallax.tsx`, `src/kiln/components/shared/useLoop.ts` |
| Parallax section | `parallax-section` | `ParallaxSection.tsx`, `src/kiln/components/shared/useLoop.ts` |
| Card journey | `card-journey` | `CardJourney.tsx`, `src/kiln/components/shared/useLoop.ts` |

## Where files live now

- Each component file sits in its group's folder: `src/kiln/components/<folder>/<File>.tsx`. Entry file names in the tables above are relative to that folder, or to `src/kiln/components/` for the old flat names.
- `Stat.tsx` is in `data-display/` and `PageHeading.tsx` is in `app-shells/`; the other group imports them.
- Helpers used by more than one group live in **`src/kiln/components/shared/`**: `Anchored.tsx`, `Field.tsx`, `useLoop.ts`, `useOverlay.ts`.
- `cn.ts`, `motion.ts`, `controllable.ts` and `theme.tsx` stay in `src/kiln/`, next to each other.
- A helper used by one group lives in that group's folder (`caret.ts` in `text-input/`, `commerce.ts` in `commerce/`, `SplitButton.tsx` in `buttons/`, and so on).
- To copy one component, copy its file plus the helpers its demo entry lists under `files`; each entry's list is derived from the real imports, transitively. Keeping the folder layout (or fixing the relative imports) is all it takes.
- `scripts/reorganise-components.mjs` did the move and is idempotent.
