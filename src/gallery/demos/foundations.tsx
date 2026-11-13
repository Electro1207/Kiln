import type { Category } from "../types";
import { MotionPresets, PaletteDemo, ScrollDemo, ThemeDemo, Tokens, Type, GlazePickerDemo, GlazeDemo } from "./parts/foundations";

export const category: Category = {
  id: "foundations",
  name: "Foundations",
  summary: "The tokens, type and motion every component is built from, and the pieces that run the whole page.",
  entries: [
    { id: "colour-tokens", name: "Colour tokens", summary: "Every colour in the library; click one to copy its variable. Edit them in tokens.css or the Theme studio.", files: ["src/kiln/tokens.css", "src/kiln/kiln.css"], Demo: Tokens },
    { id: "type-scale", name: "Type scale", summary: "IBM Plex Sans in five sizes; most screens need only three.", files: ["src/kiln/kiln.css"], Demo: Type },
    { id: "motion-presets", name: "Motion presets", summary: "The springs every component shares, so the whole library moves with one voice.", files: ["src/kiln/motion.ts"], Demo: MotionPresets },
    { id: "theme-toggle", name: "Theme toggle", summary: "Switches light and dark; the new theme opens as a circle from the button.", files: ["src/kiln/components/primitives/ThemeToggle.tsx", "src/kiln/theme.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: ThemeDemo },
    { id: "glaze-picker", name: "Glaze picker", summary: "Swatches that re-glaze the page, or one part of it, opening the new colours as a circle from the swatch pressed.", files: ["src/kiln/components/primitives/GlazePicker.tsx", "src/kiln/glaze.ts", "src/kiln/theme.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: GlazePickerDemo },
    { id: "glaze", name: "Glaze", summary: "One part of a page in its own colours: pass a ground, an ink and an accent, and every component inside follows.", files: ["src/kiln/components/primitives/Glaze.tsx", "src/kiln/glaze.ts", "src/kiln/theme.tsx", "src/kiln/cn.ts"], Demo: GlazeDemo },
    { id: "scroll-area", name: "Scroll area & scrollbar", summary: "An overlay scrollbar that fades in while you scroll, plus thin token-coloured native scrollbars everywhere.", files: ["src/kiln/components/primitives/ScrollArea.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: ScrollDemo },
    { id: "command-palette", name: "Command palette", summary: "A keyboard-first launcher with grouped results; the highlight fades between rows.", files: ["src/kiln/components/menus/CommandPalette.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: PaletteDemo },
  ],
};
