/* The theme studio works on Kiln's colorways: the colour maths lives in src/kiln/colorway.ts, so what the
   studio exports, what ColorwayPicker applies and what <Colorway> scopes are worked out the same way. */
import { contrast, colorwayCss, colorwayTokens, colorwayTokensFile, hexToRgb, kilnColorways, mix, type ColorwayTheme, type ColorwayColors, type ColorwayMode } from "../../kiln/colorway";

export type ModeKey = ColorwayMode;

/** The colours a person picks. Everything else is derived. */
export type Palette = Required<Pick<ColorwayColors, "ground" | "surface" | "ink" | "accent" | "positive" | "negative" | "warning" | "info">> &
  Pick<ColorwayColors, "button" | "dangerButton">;

export type StudioTheme = { light: Palette; dark: Palette; radius: number };

const asTheme = (g: ColorwayTheme): StudioTheme => ({ radius: g.radius ?? 8, light: g.light as Palette, dark: g.dark as Palette });
const asColorway = (t: StudioTheme, name = "your Theme Studio"): ColorwayTheme => ({ id: "studio", name, radius: t.radius, light: t.light, dark: t.dark });

export const PRESETS: { id: string; name: string; theme: StudioTheme }[] = kilnColorways.map((g) => ({ id: g.id, name: g.name, theme: asTheme(g) }));
export const DEFAULT_THEME = PRESETS[0].theme;

export { contrast, hexToRgb, mix };

/** Every token of one mode, from its picked colours. */
export const derive = (p: Palette, mode: ModeKey) => colorwayTokens(p, mode);

/** The button fills a palette produces, for showing in the studio. */
export function buttonFills(p: Palette, mode: ModeKey) {
  const t = colorwayTokens(p, mode);
  return { button: t["--k-btn-primary"], dangerButton: t["--k-btn-danger"] };
}

/** The CSS applied live in the gallery (overrides tokens.css). */
export const liveCss = (t: StudioTheme) => colorwayCss(asColorway(t));

/** A complete replacement for src/kiln/tokens.css. */
export const tokensFile = (t: StudioTheme) => colorwayTokensFile(asColorway(t));

export const FIELDS: { key: keyof Palette; label: string }[] = [
  { key: "accent", label: "Accent" },
  { key: "ground", label: "Frame" },
  { key: "surface", label: "Surface" },
  { key: "ink", label: "Text" },
  { key: "positive", label: "Positive" },
  { key: "negative", label: "Negative" },
  { key: "warning", label: "Warning" },
  { key: "info", label: "Info" },
];
