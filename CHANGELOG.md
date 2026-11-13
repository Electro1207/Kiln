# Changelog

Every release of Kiln, newest first. The npm package and the copy-in registry ship from the same release, so this list is true for both. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and versions follow [semantic versioning](https://semver.org/). The gallery shows this file at [usekiln.pages.dev/whats-new](https://usekiln.pages.dev/whats-new).

## [Unreleased]

### Changed

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

[Unreleased]: https://github.com/Electro1207/Kiln/compare/v0.4.1...HEAD
[0.4.1]: https://github.com/Electro1207/Kiln/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/Electro1207/Kiln/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/Electro1207/Kiln/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/Electro1207/Kiln/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Electro1207/Kiln/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/Electro1207/Kiln/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/Electro1207/Kiln/releases/tag/v0.1.1
