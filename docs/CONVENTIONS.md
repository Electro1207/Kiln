# Kiln conventions

The bar is **production grade**: no visible quirk, overlap, flicker, jump or 1px misalignment, in either theme, at any width. Each rule below comes from a fault that was actually shipped and caught.

## Standing rules

1. **Designed, not defaulted.** No ornamental labels, stray hairlines, icon-in-tinted-square cards, gradient glows or grey-on-grey low-contrast text. Running text is full ink at 16px or more; muted is for secondary notes. Every screen should look decided in both themes.
2. **Media must be free to use.** Every picture, video and audio file is CC0, public domain, Unsplash Licence (picsum) or CC BY. CC BY media carries a full credit line (title, creator, licence, source link, and "modified: resized / greyscale / trimmed" when changed) in three places: next to the media, in the gallery footer, and in `CREDITS.md` at the project root.
3. **60fps in real use**, not only in the walkthrough. Record frame times in a real browser (Playwright plus Chrome DevTools CPU throttling) while wheel-scrolling each page and sweeping and dragging the pointer across every demo: zero long frames at 1x, and no runs of long frames during pointer-driven motion at 4x. Pointer-follow effects write motion values; never React state on every `pointermove`.
4. **Every link and button does something real; no placeholder targets.** Open a Dialog or Sheet, show a toast, change state, navigate within the gallery (`#/<category>/<entry>`), or link to a real external page with `target="_blank" rel="noreferrer"`.

## Motion

| Preset (`src/kiln/motion.ts`) | Use for |
| --- | --- |
| `springSoft` (= `spring`) | Almost everything: surfaces, panels, lists, entrances. The house feel. |
| `springFirm` | Anything that comes to rest against an edge or a target: switch thumbs, slider handles, sliding indicators and rings, drawers. Same feel, **zero overshoot**. |
| `springSnappy` | Tiny marks only: a tick, a chevron, an icon swap. Zero overshoot. |
| `springBouncy` | Deliberate rewards only (a rating star). Rare. |
| `fade` | Opacity-only changes. |

- **No overshoot against an edge.** A thumb that bounces off the end of its track, or a ring that overshoots its tile, is a bug.
- **State marks fade; they don't travel.** A radio dot, a checkbox fill or a selected tick fades (plus at most a tiny scale for a tick being drawn). Something that moves or scales inside its container reads as a wobble.
- **Swaps share one cell.** When an icon or a label swaps, both versions sit in the same grid cell (`grid [&>*]:[grid-area:1/1]`) and cross-fade. Never `AnimatePresence mode="popLayout"` inside a flex or grid that centres, because the incoming element lands in a second row for a few frames. The cell keeps the width of the larger version, so nothing reflows.
- **Only transform and opacity animate.** A small element's `width` is allowed when a shape must stay a pill (the switch thumb). Never animate `top`, `left`, `margin` or `padding`.
- `layoutId` elements with rounded corners set `borderRadius` in `style`, in px.

## Selection indicators: disappear and reappear

- **A selection or hover indicator never travels across other items.** That covers highlights, pills, rings, underlines, page markers, menu-row highlights and tab underlines. Every item owns its own indicator, and it fades out on the old item and in on the new one (`animate={{ opacity: on ? 1 : 0 }}` with `fade`, `initial={false}`, `pointer-events-none`). The user's call (2026-11-12): sliding indicators read as odd whether they pass behind or in front of their neighbours; disappear-and-reappear feels natural.
- The indicator sits under the item's content: give the content `relative z-[1]` and the indicator no z-index.
- When a fill's text colour flips (a dark fill with light text), switch the text colour part-way through the fade (`transition-[color] delay-[80ms] duration-0`) so no frame shows grey on grey.
- Things that **physically move** still travel: switch thumbs, slider handles, carousels, drawers, sheets, swipe-dismiss, drag and drop. A shared-element morph (a card opening into a detail view, the lightbox) is a morph, not an indicator, and keeps `layoutId`.

## Hover

- **Hover state belongs to a stable container**, never to children that have gaps between them or that move. Moving the pointer across a 2px gap between two cells, or across an element that is animating away from it, must not flip the state back and forth. Compute the hovered item from the pointer position over the container, or keep the last hovered item until the pointer leaves the container.
- A hover that moves things (fan-out, expand) must not move them out from under the pointer. The hover zone is the expanded area, set as padding on a stable parent.

- Anything hoverable must not move under the pointer when its own state changes; reserve the width of changing labels (stack all variants in one grid cell) so a centred row never shifts.

## Colour

- Colours come only from token utilities. Never use raw hex in components.
- **Filled controls** (primary buttons, checked checkboxes, switch tracks when on, selected filled chips, filled icon buttons) use `bg-btn-primary text-btn-primary-ink`. **Danger** fills use `bg-btn-danger text-btn-danger-ink`. **Neutral** fills use `bg-btn-secondary text-btn-secondary-ink`.
- `accent` is for text links, rings, focus, underlines, small dots and the chart's main series. It is not a large fill, because in dark mode it is pale.
- Things sitting on a demo well (`bg-raised`) use `bg-surface` so they stay visible. Never put a raised-on-raised tile.
- **A pill or thumb that rises out of a `bg-raised` track** (segmented controls, tab pills, billing toggles, a selected chip in a track) uses `bg-elevated`: white in light mode and a lifted grey in dark. `bg-surface` there looks sunken in dark mode.

## Copy

- Sample content is **fun and cult-classic**: Star Wars, The Lord of the Rings, Transformers, Back to the Future, Ghostbusters, The Matrix, Jurassic Park, Indiana Jones, Alien, Blade Runner and so on.
- The data shapes stay realistic: prices, dates, counts and statuses that add up.
- Quotes are real lines.

## Performance: 60fps, no dropped frames

- Animate only `transform` and `opacity` on anything that runs often or in parallel. No `width`, `height`, `top`, `left`, `margin` or `padding` tweens, except a one-off height fold on a single element (accordion, alert dismiss) inside a contained section.
- **No `filter: blur()` in motion**, except on one small element at a time (a digit landing). Blur is repainted on every frame.
- No two animation engines driving one visual: don't animate `x` and `width` of the same thing together. Mixing Motion's JS path and the compositor desynchronises them and stutters, which is what the old switch did.
- Don't put `content-visibility: auto` on page sections: the estimated heights change as sections render, and the page jumps while scrolling.
- Check by recording every frame while each demo is exercised, at normal speed and at 4× CPU slowdown, and fix anything that drops a frame.

## Testing (mandatory before calling anything done)

Capture animations frame by frame with a controlled clock: in Playwright, remove `Element.prototype.animate` in an init script so Motion runs on its JS path, then step `requestAnimationFrame` with a fake clock and screenshot each step. Also capture the real-time end state, and a full-page phone screenshot at 390px.

For every animated interaction, look at the frames in **both themes**, and at 390px for anything that changes layout on phones. Check:

- overlaps, and anything passing under a neighbour;
- overshoot past a target;
- elements in the wrong row for a frame;
- text reflow or width jumps;
- flicker when hovering across gaps;
- 1px misalignment of icons against text.
