/* The theme studio works on Kiln's glazes: the colour maths lives in src/kiln/glaze.ts, so what the
   studio exports, what GlazePicker applies and what <Glaze> scopes are worked out the same way. */
import { contrast, glazeCss, glazeTokens, glazeTokensFile, hexToRgb, kilnGlazes, mix, type GlazeTheme, type GlazeColors, type GlazeMode } from "../../kiln/glaze";

export type ModeKey = GlazeMode;

/** The colours a person picks. Everything else is derived. */
export type Palette = Required<Pick<GlazeColors, "ground" | "surface" | "ink" | "accent" | "positive" | "negative" | "warning" | "info">> &
  Pick<GlazeColors, "button" | "dangerButton">;

export type StudioTheme = { light: Palette; dark: Palette; radius: number };

const asTheme = (g: GlazeTheme): StudioTheme => ({ radius: g.radius ?? 8, light: g.light as Palette, dark: g.dark as Palette });
const asGlaze = (t: StudioTheme, name = "your Theme Studio"): GlazeTheme => ({ id: "studio", name, radius: t.radius, light: t.light, dark: t.dark });

export const PRESETS: { id: string; name: string; theme: StudioTheme }[] = kilnGlazes.map((g) => ({ id: g.id, name: g.name, theme: asTheme(g) }));
export const DEFAULT_THEME = PRESETS[0].theme;

export { contrast, hexToRgb, mix };

/** Every token of one mode, from its picked colours. */
export const derive = (p: Palette, mode: ModeKey) => glazeTokens(p, mode);

/** The button fills a palette produces, for showing in the studio. */
export function buttonFills(p: Palette, mode: ModeKey) {
  const t = glazeTokens(p, mode);
  return { button: t["--k-btn-primary"], dangerButton: t["--k-btn-danger"] };
}

/** The CSS applied live in the gallery (overrides tokens.css). */
export const liveCss = (t: StudioTheme) => glazeCss(asGlaze(t));

/** A complete replacement for src/kiln/tokens.css. */
export const tokensFile = (t: StudioTheme) => glazeTokensFile(asGlaze(t));

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
