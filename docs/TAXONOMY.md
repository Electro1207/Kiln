# Kiln taxonomy

Section, then group, then entry, then component files. Generated from `src/gallery/registry.ts` (`TAXONOMY`) and the `files` of each demo entry; the entry ids and file names match the gallery exactly.

Every group is one gallery page (`/<group id>`). The **Folder** is the home of the group's component files (the move is done): `src/kiln/components/<folder>/<File>.tsx`. Folders are kebab-case and unique. Only the first (primary) file of an entry moves with it; other files an entry lists are shared helpers (see the end).

## Foundations

Section id: `foundations`

### Tokens
Group id: `tokens` · Folder: `tokens/` · 3 entries

| Entry | Id | Files |
| --- | --- | --- |
| Colour tokens | `colour-tokens` | `src/kiln/tokens.css` |
| Type scale | `type-scale` | `src/kiln/kiln.css` |
| Motion presets | `motion-presets` | `src/kiln/motion.ts` |

### Primitives
Group id: `primitives` · Folder: `primitives/` · 6 entries

| Entry | Id | Files |
| --- | --- | --- |
| Theme toggle | `theme-toggle` | `ThemeToggle.tsx`, `src/kiln/theme.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/colorway.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Colorway picker | `colorway-picker` | `ColorwayPicker.tsx`, `src/kiln/colorway.ts`, `src/kiln/theme.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Colorway | `colorway` | `Colorway.tsx`, `src/kiln/colorway.ts`, `src/kiln/theme.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Scroll area & scrollbar | `scroll-area` | `ScrollArea.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Separator | `separator` | `Separator.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Image | `aspect-image` | `AspectImage.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |

### Accessibility
Group id: `accessibility` · Folder: `accessibility/` · 5 entries

| Entry | Id | Files |
| --- | --- | --- |
| Accessibility menu | `accessibility-menu` | `AccessibilityMenu.tsx`, `src/kiln/a11y.tsx`, `announce.ts`, `Button.tsx`, `IconButton.tsx`, `SegmentedControl.tsx`, `Switch.tsx`, `Popover.tsx`, `useOverlay.ts`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts` |
| Accessibility scope and prop | `accessibility-scope` | `src/kiln/a11y.tsx`, `src/kiln/cn.ts`, `src/kiln/controllable.ts` |
| Skip link | `skip-link` | `SkipLink.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Visually hidden | `visually-hidden` | `VisuallyHidden.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Live announcer | `live-announcer` | `announce.ts` |

## Actions & inputs

Section id: `inputs`

### Buttons & links
Group id: `buttons` · Folder: `buttons/` · 9 entries

| Entry | Id | Files |
| --- | --- | --- |
| Button | `button` | `Button.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Icon button | `icon-button` | `IconButton.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Button group and split button | `button-group` | `ButtonGroup.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Toggle button | `toggle-button` | `ToggleButton.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Segmented control | `segmented-control` | `SegmentedControl.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Copy button | `copy-button` | `CopyButton.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Hold to confirm | `hold-button` | `HoldButton.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Magnetic button | `magnetic-button` | `MagneticButton.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Link | `link` | `Link.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |

### Text input
Group id: `text-input` · Folder: `text-input/` · 12 entries

| Entry | Id | Files |
| --- | --- | --- |
| Text field | `text-field` | `TextField.tsx`, `Field.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Textarea | `textarea` | `Textarea.tsx`, `Field.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Password field | `password-field` | `PasswordField.tsx`, `Field.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Search field | `search-field` | `SearchField.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Number field | `number-field` | `NumberField.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| One-time code | `otp-input` | `OTPInput.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Phone input | `phone-input` | `PhoneInput.tsx`, `caret.ts`, `Anchored.tsx`, `Field.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Currency input | `currency-input` | `CurrencyInput.tsx`, `caret.ts`, `Field.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Placeholder input | `placeholder-input` | `PlaceholderInput.tsx`, `useLoop.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Mentions | `mentions-textarea` | `MentionsTextarea.tsx`, `Anchored.tsx`, `Avatar.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx`, `announce.ts` |
| Masked input | `masked-input` | `MaskedInput.tsx`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx`, `TextField.tsx`, `src/kiln/motion.ts`, `Field.tsx` |
| Rich text | `rich-text-editor` | `RichTextEditor.tsx`, `Anchored.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `Button.tsx`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |

### Choice controls
Group id: `choice` · Folder: `choice-controls/` · 7 entries

| Entry | Id | Files |
| --- | --- | --- |
| Checkbox | `checkbox` | `Checkbox.tsx`, `src/kiln/controllable.ts`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx` |
| Radio group | `radio-group` | `RadioGroup.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Switch | `switch` | `Switch.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Slider | `slider` | `Slider.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Rating | `rating` | `Rating.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Colour swatches | `color-swatches` | `ColorSwatches.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Colour picker | `color-picker` | `ColorPicker.tsx`, `Anchored.tsx`, `SegmentedControl.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |

### Pickers
Group id: `pickers` · Folder: `pickers/` · 12 entries

| Entry | Id | Files |
| --- | --- | --- |
| Select | `select` | `Select.tsx`, `Anchored.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Combobox | `combobox` | `Combobox.tsx`, `Anchored.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `Field.tsx`, `src/kiln/a11y.tsx`, `announce.ts` |
| Tag input | `tag-input` | `TagInput.tsx`, `Combobox.tsx`, `Anchored.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `Field.tsx`, `src/kiln/a11y.tsx`, `announce.ts` |
| Chip filter | `chip-filter` | `ChipFilter.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Date picker | `date-picker` | `DatePicker.tsx`, `Anchored.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `Field.tsx`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Time picker | `time-picker` | `TimePicker.tsx`, `Anchored.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `Field.tsx`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Booking | `booking-slots` | `BookingSlots.tsx`, `DatePicker.tsx`, `Field.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `Anchored.tsx`, `Avatar.tsx`, `Button.tsx`, `Textarea.tsx`, `TextField.tsx`, `SegmentedControl.tsx`, `src/kiln/a11y.tsx`, `announce.ts` |
| File dropzone | `file-dropzone` | `FileDropzone.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `announce.ts`, `src/kiln/controllable.ts` |
| Signature pad | `signature-pad` | `SignaturePad.tsx`, `Button.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts`, `announce.ts` |
| Transfer list | `transfer-list` | `TransferList.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx`, `announce.ts`, `IconButton.tsx`, `TextField.tsx`, `Field.tsx` |
| Cascader | `cascader` | `Cascader.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx`, `Anchored.tsx` |
| Time wheels | `time-wheels` | `TimePicker.tsx`, `src/kiln/cn.ts`, `Anchored.tsx`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `Field.tsx`, `src/kiln/a11y.tsx` |

### Forms
Group id: `forms` · Folder: `forms/` · 8 entries

| Entry | Id | Files |
| --- | --- | --- |
| Sign in, sign up, reset | `auth-forms` | `AuthForms.tsx`, `TextField.tsx`, `PasswordField.tsx`, `Field.tsx`, `Button.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Settings section | `settings-section` | `SettingsSection.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Inline edit | `inline-edit` | `InlineEdit.tsx`, `src/kiln/controllable.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Avatar upload and cropper | `avatar-upload` | `AvatarUpload.tsx`, `ImageCropper.tsx`, `Slider.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `Button.tsx`, `src/kiln/a11y.tsx` |
| Key–value editor | `key-value-editor` | `KeyValueEditor.tsx`, `src/kiln/controllable.ts`, `Button.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `announce.ts` |
| Fieldset | `fieldset` | `Fieldset.tsx`, `src/kiln/cn.ts`, `FieldMessage.tsx`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Error summary | `error-summary` | `ErrorSummary.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Image cropper | `image-cropper` | `ImageCropper.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts`, `Slider.tsx` |

## Navigation

Section id: `navigation`

### Menus & bars
Group id: `menus` · Folder: `menus/` · 11 entries

| Entry | Id | Files |
| --- | --- | --- |
| Navbar | `navbar` | `Navbar.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Flyout and mega menu | `flyout-nav` | `FlyoutNav.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Sidebar | `sidebar-nav` | `SidebarNav.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Docs navigation | `docs-nav` | `DocsNav.tsx`, `SearchField.tsx`, `ScrollArea.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Dropdown menu | `dropdown-menu` | `DropdownMenu.tsx`, `Anchored.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Context menu | `context-menu` | `ContextMenu.tsx`, `DropdownMenu.tsx`, `Anchored.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Command palette | `command-palette` | `CommandPalette.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Spotlight search | `spotlight-search` | `SpotlightSearch.tsx`, `useOverlay.ts`, `Combobox.tsx`, `src/kiln/controllable.ts`, `Anchored.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `Field.tsx`, `src/kiln/a11y.tsx`, `announce.ts` |
| Menubar | `menubar` | `Menubar.tsx`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx`, `DropdownMenu.tsx`, `src/kiln/motion.ts`, `Anchored.tsx` |
| Toolbar | `toolbar` | `Toolbar.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Bottom tab bar | `bottom-tab-bar` | `BottomTabBar.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |

### Wayfinding
Group id: `wayfinding` · Folder: `wayfinding/` · 10 entries

| Entry | Id | Files |
| --- | --- | --- |
| Tabs | `tabs` | `Tabs.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Accordion | `accordion` | `Accordion.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Breadcrumbs | `breadcrumbs` | `Breadcrumbs.tsx`, `DropdownMenu.tsx`, `Anchored.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Pagination | `pagination` | `Pagination.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Stepper | `stepper` | `Stepper.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Back to top | `back-to-top` | `BackToTop.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Scroll progress | `scroll-progress` | `ScrollProgress.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Scroll checkpoints | `scroll-checkpoints` | `ScrollCheckpoints.tsx`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Scroll hint | `scroll-hint` | `ScrollHint.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Table of contents | `table-of-contents` | `TableOfContents.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |

## Overlays & feedback

Section id: `feedback`

### Overlays
Group id: `overlays` · Folder: `overlays/` · 8 entries

| Entry | Id | Files |
| --- | --- | --- |
| Dialog | `dialog` | `Dialog.tsx`, `useOverlay.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Alert dialog | `alert-dialog` | `AlertDialog.tsx`, `Dialog.tsx`, `useOverlay.ts`, `Button.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Drawer | `drawer` | `Drawer.tsx`, `useOverlay.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Popover | `popover` | `Popover.tsx`, `useOverlay.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Tooltip | `tooltip` | `Tooltip.tsx`, `useOverlay.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Hover card | `hover-card` | `HoverCard.tsx`, `useOverlay.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Lightbox | `lightbox` | `Lightbox.tsx`, `useOverlay.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Type-to-confirm dialog | `type-to-confirm-dialog` | `TypeToConfirmDialog.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts`, `announce.ts`, `Button.tsx`, `src/kiln/motion.ts`, `TextField.tsx`, `Field.tsx`, `Dialog.tsx`, `useOverlay.ts` |

### Notices
Group id: `notices` · Folder: `notices/` · 10 entries

| Entry | Id | Files |
| --- | --- | --- |
| Toast | `toast` | `Toast.tsx`, `useOverlay.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Alert | `alert` | `Alert.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Banner | `banner` | `Banner.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Field message | `field-message` | `FieldMessage.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Undo bar | `undo-bar` | `UndoBar.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Notification bell | `notification-bell` | `NotificationBell.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Notification center | `notification-center` | `NotificationCenter.tsx`, `NotificationBell.tsx`, `Popover.tsx`, `Avatar.tsx`, `useOverlay.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Cookie consent | `cookie-consent` | `CookieConsent.tsx`, `Switch.tsx`, `Button.tsx`, `useOverlay.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Session timeout | `session-timeout` | `SessionTimeout.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts`, `announce.ts`, `Button.tsx`, `Dialog.tsx`, `useOverlay.ts` |
| Connection status | `connection-status` | `ConnectionStatus.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts`, `announce.ts` |

### Status & loading
Group id: `status` · Folder: `status/` · 9 entries

| Entry | Id | Files |
| --- | --- | --- |
| Badge and status dot | `badge` | `Badge.tsx`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Progress bar | `progress` | `Progress.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `useLoop.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Progress ring | `progress-ring` | `ProgressRing.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Meter | `meter` | `Meter.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Spinner | `spinner` | `Spinner.tsx`, `useLoop.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Skeleton | `skeleton` | `Skeleton.tsx`, `src/kiln/cn.ts`, `useLoop.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Multi-step loader | `multi-step-loader` | `MultiStepLoader.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Countdown | `countdown` | `Countdown.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts`, `announce.ts` |
| Empty state | `empty-state` | `EmptyState.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `useLoop.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |

### Guidance
Group id: `guidance` · Folder: `guidance/` · 3 entries

| Entry | Id | Files |
| --- | --- | --- |
| Product tour | `product-tour` | `ProductTour.tsx`, `Button.tsx`, `useOverlay.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Onboarding wizard | `onboarding-wizard` | `OnboardingWizard.tsx`, `Button.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Keyboard shortcuts | `keyboard-shortcuts` | `KeyboardShortcutsSheet.tsx`, `Dialog.tsx`, `useOverlay.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |

## Data & charts

Section id: `data`

### Data display
Group id: `display` · Folder: `data-display/` · 10 entries

| Entry | Id | Files |
| --- | --- | --- |
| Avatar | `avatar` | `Avatar.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Tag | `tag` | `Tag.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Keyboard key | `kbd` | `Kbd.tsx`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Stat | `stat` | `Stat.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Number ticker | `number-ticker` | `NumberTicker.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Description list | `description-list` | `DescriptionList.tsx`, `CopyButton.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| List | `list` | `List.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Timeline | `timeline` | `Timeline.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Activity strip | `heat-strip` | `HeatStrip.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Code block | `code-block` | `CodeBlock.tsx`, `CopyButton.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |

### Tables & lists
Group id: `tables` · Folder: `tables/` · 5 entries

| Entry | Id | Files |
| --- | --- | --- |
| Table | `table` | `Table.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Data grid | `data-grid` | `DataGrid.tsx`, `Table.tsx`, `SearchField.tsx`, `SegmentedControl.tsx`, `DropdownMenu.tsx`, `Anchored.tsx`, `Pagination.tsx`, `Button.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Comparison table | `comparison-table` | `ComparisonTable.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Virtual list | `virtual-list` | `VirtualList.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Infinite feed | `infinite-feed` | `InfiniteFeed.tsx`, `Skeleton.tsx`, `src/kiln/cn.ts`, `useLoop.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |

### Charts
Group id: `charts` · Folder: `charts/` · 11 entries

| Entry | Id | Files |
| --- | --- | --- |
| Bar chart | `bar-chart` | `BarChart.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `ChartA11y.tsx`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts`, `Button.tsx` |
| Line chart | `line-chart` | `LineChart.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `ChartA11y.tsx`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts`, `Button.tsx`, `announce.ts` |
| Stacked area | `area-chart` | `AreaChart.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `ChartA11y.tsx`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts`, `Button.tsx`, `announce.ts` |
| Donut | `donut` | `DonutChart.tsx`, `Anchored.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `ChartA11y.tsx`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts`, `Button.tsx` |
| Sparkline | `sparkline` | `Sparkline.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `ChartA11y.tsx`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts`, `Button.tsx` |
| Gauge | `gauge` | `GaugeChart.tsx`, `NumberTicker.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `ChartA11y.tsx`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts`, `Button.tsx` |
| Funnel | `funnel` | `FunnelChart.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `ChartA11y.tsx`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts`, `Button.tsx` |
| Radar | `radar` | `RadarChart.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `ChartA11y.tsx`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts`, `Button.tsx`, `announce.ts` |
| Treemap | `treemap` | `TreemapChart.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `ChartA11y.tsx`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts`, `Button.tsx` |
| Year calendar heatmap | `year-heatmap` | `YearHeatmap.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `ChartA11y.tsx`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts`, `Button.tsx` |
| Sankey | `sankey` | `SankeyChart.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `ChartA11y.tsx`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts`, `Button.tsx` |

## Surfaces & media

Section id: `surfaces`

### Cards
Group id: `cards` · Folder: `cards/` · 8 entries

| Entry | Id | Files |
| --- | --- | --- |
| Card | `card` | `Card.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Media card | `media-card` | `Card.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Choice card | `interactive-card` | `Card.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Stat card | `stat-card` | `Card.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Expanding card | `expandable-card` | `ExpandableCard.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Tilt card | `tilt-card` | `TiltCard.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Floating card | `floating-card` | `FloatingCard.tsx`, `src/kiln/motion.ts`, `useLoop.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Pricing | `pricing` | `PricingCard.tsx`, `NumberTicker.tsx`, `Button.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |

### Media
Group id: `media` · Folder: `media/` · 7 entries

| Entry | Id | Files |
| --- | --- | --- |
| Video player | `video-player` | `VideoPlayer.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Media player | `media-player` | `MediaPlayer.tsx`, `Slider.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Audio spectrum | `audio-spectrum` | `AudioSpectrum.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Carousel | `carousel` | `Carousel.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Masonry gallery | `masonry` | `Masonry.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Compare slider | `compare-slider` | `CompareSlider.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Marquee | `marquee` | `Marquee.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |

## Layouts & patterns

Section id: `patterns`

### App shells
Group id: `shells` · Folder: `app-shells/` · 7 entries

| Entry | Id | Files |
| --- | --- | --- |
| Sidebar layout | `app-shell` | `AppShell.tsx`, `Drawer.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `useOverlay.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Stacked layout | `stacked-layout` | `StackedLayout.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Headings | `headings-layout` | `PageHeading.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Grid lists | `grid-list` | `GridList.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Stacked list | `stacked-list` | `StackedList.tsx`, `Table.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Heading tabs | `heading-tabs` | `PageHeading.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Dashboard screen | `dashboard` | `Stat.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |

### Workspace
Group id: `workspace` · Folder: `workspace/` · 10 entries

| Entry | Id | Files |
| --- | --- | --- |
| Tree view | `tree-view` | `TreeView.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Kanban board | `kanban-board` | `KanbanBoard.tsx`, `DropdownMenu.tsx`, `Anchored.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx`, `announce.ts` |
| Sortable list | `sortable-list` | `SortableList.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx`, `announce.ts` |
| Resizable panels | `resizable-panels` | `ResizablePanels.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Filter bar | `filter-bar` | `FilterBar.tsx`, `DropdownMenu.tsx`, `Anchored.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| File manager | `file-manager` | `FileManager.tsx`, `DropdownMenu.tsx`, `Anchored.tsx`, `SegmentedControl.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Calendar month | `calendar-month` | `CalendarMonth.tsx`, `Anchored.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Week calendar | `week-calendar` | `WeekCalendar.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Gantt chart | `gantt` | `GanttChart.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Notification preferences | `notification-preferences` | `NotificationPreferences.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |

### Communication
Group id: `communication` · Folder: `communication/` · 4 entries

| Entry | Id | Files |
| --- | --- | --- |
| Chat thread | `chat-thread` | `ChatThread.tsx`, `Avatar.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `useLoop.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Comment thread | `comment-thread` | `CommentThread.tsx`, `Avatar.tsx`, `Button.tsx`, `DropdownMenu.tsx`, `Anchored.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Comment feed | `comment-feed` | `CommentFeed.tsx`, `Avatar.tsx`, `Button.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Message composer | `message-composer` | `MessageComposer.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |

### AI interfaces
Group id: `ai` · Folder: `ai/` · 11 entries

| Entry | Id | Files |
| --- | --- | --- |
| Conversation | `conversation` | `PromptInput.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `DropdownMenu.tsx`, `Anchored.tsx`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Prompt input | `prompt-input` | `PromptInput.tsx`, `DropdownMenu.tsx`, `Anchored.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Streaming message | `streaming-message` | `StreamingText.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts`, `announce.ts` |
| Reasoning | `reasoning` | `Reasoning.tsx`, `useLoop.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Sources and citations | `sources` | `Citation.tsx`, `HoverCard.tsx`, `useOverlay.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Tool call | `tool-call` | `ToolCall.tsx`, `Button.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Suggestions | `suggestions` | `Suggestions.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Message actions | `message-actions` | `MessageActions.tsx`, `CopyButton.tsx`, `Tooltip.tsx`, `useOverlay.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Model picker | `model-picker` | `ModelPicker.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx`, `Anchored.tsx` |
| Usage meter | `usage-meter` | `UsageMeter.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Voice input | `voice-input` | `VoiceInput.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx`, `announce.ts` |

### Developer tools
Group id: `devtools` · Folder: `dev-tools/` · 5 entries

| Entry | Id | Files |
| --- | --- | --- |
| Diff viewer | `diff-viewer` | `DiffViewer.tsx`, `SegmentedControl.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| JSON viewer | `json-viewer` | `JSONViewer.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Terminal | `terminal` | `Terminal.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Terminal script | `terminal-script` | `TerminalScript.tsx`, `Terminal.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Log stream | `log-stream` | `LogStream.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |

### Commerce
Group id: `commerce` · Folder: `commerce/` · 12 entries

| Entry | Id | Files |
| --- | --- | --- |
| Product gallery | `product-gallery` | `ProductGallery.tsx`, `commerce.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Quick view | `product-quick-view` | `ProductQuickView.tsx`, `SizePicker.tsx`, `ProductGallery.tsx`, `Dialog.tsx`, `commerce.ts`, `useOverlay.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `Button.tsx`, `NumberField.tsx`, `ColorSwatches.tsx`, `src/kiln/a11y.tsx` |
| Cart drawer | `cart-drawer` | `CartDrawer.tsx`, `Drawer.tsx`, `commerce.ts`, `useOverlay.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `Button.tsx`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx`, `announce.ts` |
| Checkout | `checkout-form` | `CheckoutForm.tsx`, `commerce.ts`, `Button.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `Select.tsx`, `Anchored.tsx`, `src/kiln/controllable.ts`, `RadioGroup.tsx`, `TextField.tsx`, `Field.tsx`, `src/kiln/a11y.tsx` |
| Reviews | `reviews-summary` | `ReviewsSummary.tsx`, `SegmentedControl.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `Button.tsx`, `src/kiln/a11y.tsx` |
| Category filters | `category-filters` | `CategoryFilters.tsx`, `Slider.tsx`, `Checkbox.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `Button.tsx`, `Drawer.tsx`, `useOverlay.ts`, `src/kiln/a11y.tsx` |
| Order history | `order-history` | `OrderHistory.tsx`, `Badge.tsx`, `commerce.ts`, `src/kiln/controllable.ts`, `src/kiln/cn.ts`, `Button.tsx`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx` |
| Invoice | `invoice` | `Invoice.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Size picker | `size-picker` | `SizePicker.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Stars | `stars` | `ReviewsSummary.tsx`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `Button.tsx`, `SegmentedControl.tsx`, `src/kiln/a11y.tsx` |
| Coupon field | `coupon-field` | `CouponField.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx`, `Button.tsx`, `Tag.tsx`, `TextField.tsx`, `Field.tsx`, `FieldMessage.tsx` |
| Shipment tracker | `shipment-tracker` | `ShipmentTracker.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts`, `useOverlay.ts` |

### Marketing
Group id: `marketing` · Folder: `marketing/` · 17 entries

| Entry | Id | Files |
| --- | --- | --- |
| Hero | `hero` | `Hero.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Feature section | `feature-split` | `FeatureSplit.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Bento grid | `bento-grid` | `BentoGrid.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Feature tabs | `feature-tabs` | `FeatureTabs.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/controllable.ts`, `src/kiln/a11y.tsx` |
| Stats section | `stats-section` | `StatsSection.tsx`, `PageHeading.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Call to action | `cta-section` | `CTASection.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Newsletter sign-up | `newsletter` | `NewsletterSignup.tsx`, `Button.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Contact section | `contact-section` | `ContactSection.tsx`, `TextField.tsx`, `Textarea.tsx`, `Select.tsx`, `src/kiln/controllable.ts`, `Anchored.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `Field.tsx`, `Button.tsx`, `src/kiln/a11y.tsx` |
| Team grid | `team-grid` | `TeamGrid.tsx`, `Avatar.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| FAQ section | `faq-section` | `FAQSection.tsx`, `Accordion.tsx`, `src/kiln/controllable.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |
| Testimonials | `testimonials` | `Testimonials.tsx`, `Avatar.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Blog list | `blog-list` | `BlogList.tsx`, `Avatar.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Changelog | `changelog` | `Changelog.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Page and section headings | `headings` | `PageHeading.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| 404 page | `not-found` | `NotFound.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Footer | `footer` | `Footer.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Powered by Kiln | `powered-by-kiln` | `PoweredByKiln.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |

## Motion

Section id: `motion`

### Text effects
Group id: `text-effects` · Folder: `text-effects/` · 5 entries

| Entry | Id | Files |
| --- | --- | --- |
| Text animate | `text-animate` | `TextAnimate.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Typewriter | `typewriter` | `Typewriter.tsx`, `useLoop.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Word rotate | `word-rotate` | `WordRotate.tsx`, `useLoop.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Scramble text | `scramble-text` | `ScrambleText.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Scroll words | `scroll-words` | `ScrollWords.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |

### Effects
Group id: `effects` · Folder: `effects/` · 17 entries

| Entry | Id | Files |
| --- | --- | --- |
| Reveal | `reveal` | `Reveal.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Dock | `dock` | `Dock.tsx`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Animated beam | `animated-beam` | `AnimatedBeam.tsx`, `useLoop.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Orbiting circles | `orbiting-circles` | `OrbitingCircles.tsx`, `useLoop.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Animated list | `animated-list` | `AnimatedList.tsx`, `useLoop.ts`, `src/kiln/motion.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Border beam | `border-beam` | `BorderBeam.tsx`, `useLoop.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Sticky scroll reveal | `sticky-scroll-reveal` | `StickyScrollReveal.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Scroll story | `scroll-story` | `ScrollStory.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Scroll timeline | `scroll-timeline` | `ScrollTimeline.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Parallax | `parallax` | `Parallax.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Parallax section | `parallax-section` | `ParallaxSection.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Card journey | `card-journey` | `CardJourney.tsx`, `useLoop.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Drift field | `drift-field` | `DriftField.tsx`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Secret hunt | `secret-hunt` | `SecretHunt.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Firefly | `firefly` | `Firefly.tsx`, `useLoop.ts`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Card fan | `card-fan` | `CardFan.tsx`, `src/kiln/cn.ts`, `src/kiln/motion.ts`, `src/kiln/a11y.tsx`, `src/kiln/controllable.ts` |
| Stamp trail | `stamp-trail` | `StampTrail.tsx`, `src/kiln/controllable.ts`, `src/kiln/cn.ts`, `src/kiln/a11y.tsx` |

## Where files live now

- Each component file sits in its group's folder: `src/kiln/components/<folder>/<File>.tsx`. Entry file names in the tables above are relative to that folder, or to `src/kiln/components/` for the old flat names.
- `Stat.tsx` is in `data-display/` and `PageHeading.tsx` is in `app-shells/`; the other group imports them.
- Helpers used by more than one group live in **`src/kiln/components/shared/`**: `Anchored.tsx`, `Field.tsx`, `useLoop.ts`, `useOverlay.ts`.
- `cn.ts`, `motion.ts`, `controllable.ts`, `a11y.tsx` (the accessibility core) and `theme.tsx` stay in `src/kiln/`, next to each other.
- A helper used by one group lives in that group's folder (`caret.ts` in `text-input/`, `commerce.ts` in `commerce/`, `SplitButton.tsx` in `buttons/`, and so on).
- To copy one component, copy its file plus the helpers its demo entry lists under `files`; each entry's list is derived from the real imports, transitively. Keeping the folder layout (or fixing the relative imports) is all it takes.
- `scripts/reorganise-components.mjs` did the move and is idempotent.
