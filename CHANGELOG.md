# Changelog

Every release of Kiln, newest first. The npm package and the copy-in registry ship from the same release, so this list is true for both. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [semantic versioning](https://semver.org/). The gallery shows this file at [usekiln.pages.dev/whats-new](https://usekiln.pages.dev/whats-new).

## [Unreleased]

## [0.8.2] - 2026-11-26

A crisper BorderBeam.

### Fixed

- `BorderBeam`'s beam now sits exactly on the card's 1px border instead of spilling half a pixel onto the card, so its edge is crisp and no longer looks doubled at the corners.

## [0.8.1] - 2026-11-26

A VideoPlayer Settings menu that fits what it shows.

### Fixed

- `VideoPlayer`: the Settings menu is now as tall as the page it shows instead of the tallest one, and long chapter lists scroll inside it without pushing the rows past the right edge, which showed in Firefox.

## [0.8.0] - 2026-11-26

An accessibility system: people tune the page to themselves, developers add support per component, and 18 new components.

### Added

- `AccessibilityProvider`, `useA11y`, `useA11yProps`, `useA11ySettings`, `AccessibilityScope` and `resolveA11y` in `kiln/a11y`: ten profiles made of thirteen features (reduced motion, no flashing, calm, high contrast, strong focus, text size, readable font, text spacing, large targets, colour-safe, extended time, screen-reader hints, captions), merged from system settings, the person's choices, the nearest scope and the component's prop.
- `AccessibilityMenu`: a popover or panel of profiles and switches, saved on the device. The gallery header has one, and an accessibility view (`?a11y=1`) that shows each entry's keyboard map, ARIA pattern and supported features.
- Every component takes `accessibilityFeatures`. Charts also take `tableToggle`, get a summary, a data table, patterns and marker shapes under colour-safe, and arrow-key navigation (bar, line, area, donut).
- `SkipLink`, `VisuallyHidden`, `announce` and `useAnnounce`.
- New components: `ErrorSummary`, `Fieldset`, `MaskedInput`, `TransferList`, `Cascader`, `TypeToConfirmDialog`, `Toolbar`, `Menubar`, `BottomTabBar`, `TableOfContents`, `SessionTimeout`, `ConnectionStatus`, `Countdown`, `ModelPicker`, `UsageMeter`, `VoiceInput`, `CouponField`, `ShipmentTracker`.
- Demo entries for `ImageCropper`, `SizePicker`, `TimeWheels`, `HeadingTabs` and `Stars`.
- `Carousel` takes `autoPlay` (ms), with a pause button; the gallery shows it. `MenuContent` takes `initialFocus`.
- Tailwind `motion-reduce:` and `motion-safe:` also follow the in-app reduced-motion setting; `k-hit` enlarges small hit areas.

### Changed

- Toasts with an action never auto-dismiss; `HoldButton` becomes press-then-confirm under extended time; `Tooltip` follows WCAG 1.4.13; `Marquee` and `Carousel` have a pause control.
- `KanbanBoard` and `SortableList` can be moved with the keyboard and announce moves; `SignaturePad` has a "Type instead" mode; `ImageCropper`, `ResizablePanels`, `OTPInput` and `AuthForms` have the keyboard and autofill behaviour a screen-reader or phone user expects.
- Fixed pixel text sizes became rem so the text size setting applies; every `outline-none` has a visible focus replacement.

### Fixed

- DocsNav: opening or closing a group no longer scrolls the list back to the active row.

## [0.7.1] - 2026-11-26

VideoPlayer fixes: controls you can bring back on a phone, and a cleaner poster line.

### Fixed

- `VideoPlayer` no longer starts the line on its poster with a stray "·" before the chapter count when the video's length is not known yet.
- `VideoPlayer`'s controls can be brought back on a phone: tapping the picture now shows or hides them instead of always hiding them, they still fade out after a moment while the video plays, and tapping a control keeps them up.

## [0.7.0] - 2026-11-26

A video player you can drive from outside and shape to your product: switch any control off, add your own, mark moments on the timeline.

### Added

- `VideoPlayer` takes a `ref`. It gives `play()`, `pause()`, `toggle()`, `seek(t)`, `setRate(r)`, `setVolume(v)`, `enterFullscreen()` and `exitFullscreen()`, plus `currentTime`, `duration`, `paused` and the raw `video` element, so buttons outside the player can drive it.
- `VideoPlayer` plays one file with `src`, no quality menu needed. `renditions` still works; give one or the other.
- `VideoPlayer` can hide its title and subtitle with `showTitle={false}`. The title stays the player's accessible name.
- Every built-in `VideoPlayer` control can be switched off: `skipButtons` (or a different number of seconds), `volume`, `speed`, `quality`, `captions`, `pip`, `theaterButton`, `fullscreen`, `keyboard`, `autoHideControls` (a delay, or `false`) and `bigPlayButton`. The keys and shortcuts-sheet rows of a switched-off control go with it. The defaults are the player you already have.
- `VideoPlayer` has `timelineSplit` (the scrubber as one segment per chapter, on by default, `false` for one bar) and `showChapterTitle`, which shows the current chapter's name in the control bar.
- `VideoPlayer` has `markers`: numbered, glowing hit markers on the scrubber. A click near one seeks exactly to it.
- `VideoPlayer` has `cues`: captions from data instead of a `.vtt` file.
- `VideoPlayer` has `controlsStart` and `controlsEnd`, which put your own controls in the bar, and `VideoPlayerControl`, an icon button with label, tooltip, key hint and an `active` underline, so they look like the built-in ones.
- `VideoPlayer` has `overlay`, rendered inside the player so a side panel or a note stays visible in full screen.
- `VideoPlayer` has `onKeyDown` for shortcuts of your own, and `shortcuts` to list them in its shortcuts sheet.
- `VideoPlayer` reports `onTimeUpdate`, `onPlay`, `onPause`, `onEnded`, `onSeek`, `onLoadedMetadata`, `onRateChange`, `onVolumeChange` and `onFullscreenChange`.
- `useVideoTime(ref)` returns a `VideoPlayer`'s current time as a motion value that updates every frame while it plays, so a playhead or a highlighted row can follow it without a React render.
- `videoPlayerLabels` has `skipBack` and `skipForward` for skip buttons that are not ten seconds.

### Changed

- `VideoPlayer`'s `captions` also accepts `false`, and its `renditions` prop is now optional (give `src` instead). Nothing changes for existing uses.
- The gallery's Video player shows four variants: the default, a minimal one, one with chapters and markers, and one driven from outside.

## [0.6.1] - 2026-11-25

A sidebar that collapses without moving the rest of the screen.

### Fixed

- `AppShell` no longer shifts the whole screen when the sidebar collapses or expands. The top bar's actions and the sheet's right edge stay where they are, only the sheet's left edge slides with the sidebar, and the page content reflows once at the start.

## [0.6.0] - 2026-11-16

A new way to show credentials, and columns that line up in Safari.

### Added

- `StampTrail`: credentials as seals pressed into the page as you scroll. Words run round each seal's edge, its mark sits in the middle, and an inked ring shows the score; each seal drifts at its own depth beside its details. The first `initialCount` show until Show more carries the trail on (`open`, `defaultOpen`, `onOpenChange`).

### Fixed

- `Testimonials` and `Masonry` lay out their columns the same in Safari as everywhere else. Testimonials no longer stacks its quotes unevenly or cuts the last card off, and Masonry's columns end level.

## [0.5.0] - 2026-11-13

Lighter on low-end devices, with the same motion everywhere else.

### Added

- Motion tiers for low-end devices. `useMotionTier()` is `"full"` or `"lite"`, detected from device memory, CPU cores, Save-Data and one short frame-rate probe; force it with `<MotionTierProvider tier="full" | "lite">`. In `"lite"`, only the effects that can't be made cheap change, and each keeps its curve and timing.

### Changed

- `SidebarNav` in the lite tier folds with a clip and sets its width once, so the page beside it is laid out once instead of on every frame. Everywhere else the width still glides.
- `Button` (loading) and `OTPInput` (a digit landing) skip their 2–3px blur in the lite tier.
- Loops (`Spinner`, `Skeleton`, `OrbitingCircles`, `BorderBeam`, `AnimatedBeam`, `Firefly` and every other `useLoop` user) share one IntersectionObserver and one reduced-motion listener per page instead of one each.

## [0.4.1] - 2026-11-13

### Changed

- The Kiln mark (`KilnMark`, used by `PoweredByKiln`) is a rounded K, matching the favicon.

## [0.4.0] - 2026-11-13

Colorways, a card that carries a whole page, and the pieces a scroll-driven portfolio needs.

### Added

- Colorways: whole colour themes made from a ground, an ink and an accent. Kiln works out every other colour and keeps button text readable. Pass them to `ThemeProvider` with `colorways` and `defaultColorway`, switch with `useTheme().setColorway`.
- `ColorwayPicker`, swatches that recolour the page, and `Colorway`, which colours one section with colours passed as props.
- `CardJourney`: one pinned card that rests at each stop of a page, then spins and glides to the next with a new face.
- `DriftField`: small live controls floating up the edges of a page at two speeds. `pin` keeps one at the foot of its column.
- `ScrollCheckpoints`: a tick for each part of a page, with a preview on hover.
- `TerminalScript`: a scripted terminal session that types itself, then takes commands.
- `SecretHunt`: collectibles hidden around a page, with a quiet count of what has been found.
- `CardFan`: a hand of cards dealt onto an arc as it scrolls into view; a card lifts out of the hand while hovered.
- `Firefly`: small lights drifting across a dark area; catch one and it says something.
- `TerminalScript` puts the cursor in its prompt when the script ends (`focusWhenDone`), so people can type at once.
- `ScrollHint`: the nudging invitation to scroll on from a first screen.
- `ScrollProgress` has a `ring` variant with the percentage in the middle.
- `CommandPalette` has a `shortcut` prop that opens it with ⌘ or Ctrl and a key.
- `VideoPlayer` has `freeze`, which holds the picture still while playback continues.
- `Button` has a `shape` prop for pill and square corners.
- `PoweredByKiln`, a small credit with the Kiln mark, and a `credit` slot on `Footer` to hold it.
- `Footer` takes external links and plain lines, sets the name to fill the width, and has a `reveal` mode that uncovers it from under the page.
- A privacy policy and terms of use, shown in the gallery.
- This changelog, and a What's new page in the gallery.
- `kiln-css`, a command in the npm package that points Tailwind at only the Kiln files your app imports, roughly halving the CSS of a small site.

### Changed

- The site and the copy-in registry deploy from the same GitHub release that publishes npm, and CI fails if the two ever differ.
- The gallery's sample photographs are hosted with the site instead of loaded from picsum.

### Fixed

- A video on a resting `CardJourney` card keeps playing in Safari, and sits straight and correctly clipped in Firefox: side stops rest upright unless you set the new `lean` prop, and a face showing a video stops bobbing, so the picture stays with its card.
- `CardJourney`, `DriftField` and the `ScrollProgress` ring do less work per scroll frame.
- The `DocsNav` chevron turns in place, and its footer is set apart from the contents.
- `WordRotate` no longer clips the marks above and below letters in scripts such as Devanagari and Kannada.
- A clickable `MediaCard` keeps its picture at the top of a stretched card.

## [0.3.1] - 2026-11-12

### Fixed

- `ParallaxSection` fades its content instead of laying a scrim over it.

## [0.3.0] - 2026-11-12

### Added

- `FloatingCard`: a card that hangs in the air, bobs at rest and leans towards the pointer.
- `ParallaxSection`: sections that hang back and fade as they leave, so the next one slides over them.
- `VideoPlayer` can autoplay, loop and start muted.

## [0.2.0] - 2026-11-12

Scroll storytelling.

### Added

- `Parallax`, `ScrollWords`, `ScrollTimeline` and `ScrollStory`.

### Fixed

- Sticky content works inside `Tabs`.

## [0.1.2] - 2026-11-12

### Added

- `Button` renders as a link when given an `href`.
- `Navbar` has a utility slot that stays in the bar on phones.
- `Reveal` lets anything rise into place the first time it scrolls into view.

## [0.1.1] - 2026-11-12

The first release on npm, published with provenance.

### Added

- About 190 animated React components for Tailwind v4 and Motion, in light and dark.
- The copy-in registry for the shadcn CLI, and a zero-dependency installer.
- Replaceable icons on every component that draws one.

### Changed

- Every component with state works both controlled and uncontrolled, with `value` and `defaultValue` (or the matching pair).

### Fixed

- `Switch` and `HeatStrip` fixes, and zero lint warnings.

[Unreleased]: https://github.com/Electro1207/Kiln/compare/v0.8.2...HEAD
[0.8.2]: https://github.com/Electro1207/Kiln/compare/v0.8.1...v0.8.2
[0.8.1]: https://github.com/Electro1207/Kiln/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/Electro1207/Kiln/compare/v0.7.1...v0.8.0
[0.7.1]: https://github.com/Electro1207/Kiln/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/Electro1207/Kiln/compare/v0.6.1...v0.7.0
[0.6.1]: https://github.com/Electro1207/Kiln/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/Electro1207/Kiln/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/Electro1207/Kiln/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/Electro1207/Kiln/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/Electro1207/Kiln/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/Electro1207/Kiln/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/Electro1207/Kiln/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Electro1207/Kiln/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/Electro1207/Kiln/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/Electro1207/Kiln/releases/tag/v0.1.1
