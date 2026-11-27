# Smoke suite baseline

Run against sweep-b (current code, no component fixes). 84 tests (28 gallery groups x light, dark, 390px phone), covering all 241 entries, about 55 s with default workers. Page and console errors: 0. Runaway size: 0. Horizontal overflow at 390px: 0. Failures: 10 entries, all `focus-visible`, each failing in light and dark.

Note: the focus check looks for an outline or box-shadow on the focused control or on a `:focus-within` ancestor within 3 levels. Inputs inside a wrapper that signals focus another way (e.g. border colour only) are reported too; they need a visible ring either way (CONVENTIONS rule).

| Entry | Check | Message |
|---|---|---|
| combobox | focus-visible | input: no outline or box-shadow when focused |
| tag-input | focus-visible | input: no outline or box-shadow when focused |
| transfer-list | focus-visible | div: no outline or box-shadow when focused |
| tabs | focus-visible | div: no outline or box-shadow when focused |
| terminal | focus-visible | input[Command]: no outline or box-shadow when focused |
| terminal-script | focus-visible | input[Command]: no outline or box-shadow when focused |
| product-tour | focus-visible | input[Search sightings]: no outline or box-shadow when focused |
| floating-card | focus-visible | div[Seek]: no outline or box-shadow when focused |
| video-player | focus-visible | div[Seek]: no outline or box-shadow when focused |
| resizable-panels | focus-visible | div[Resize the message list] and div[Resize the reply]: no outline or box-shadow when focused |


Regression proof: with `[contain:inline-size]` removed from Carousel.tsx and `flex-nowrap` from demos/parts/surfaces.tsx, `carousel [runaway-size] height 25166132px > 6000px` fails in light, dark and phone. Both changes restored.
