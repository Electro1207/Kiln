/* Colorways: a whole theme from a handful of colours. Pick a ground, an ink and an accent (and, if you
   like, a surface and the four signal colours) for light, dark or both; every Kiln token is worked
   out from them, with button fills darkened until their text reads at 4.5:1. ThemeProvider takes a
   list of colorways and switches between them; <Colorway> applies one to part of a page. */

export type ColorwayMode = "light" | "dark";

/** The colours you choose for one mode. Everything else is derived. */
export type ColorwayColors = {
  /** The page behind everything. */
  ground: string;
  /** Text. */
  ink: string;
  /** Links, rings, selected things and primary buttons. */
  accent: string;
  /** Cards and inputs. Left out, it is the ground lifted a little towards white (light) or the ink (dark). */
  surface?: string;
  positive?: string;
  negative?: string;
  warning?: string;
  info?: string;
  /** A fixed fill for primary buttons. Left out, it is derived from the accent. */
  button?: string;
  /** A fixed fill for danger buttons. Left out, it is derived from `negative`. */
  dangerButton?: string;
};

export type ColorwayTheme = {
  id: string;
  /** Shown in pickers and read to screen readers. */
  name: string;
  /** Colours for light mode. A colorway with only `light` or only `dark` uses it in both, and choosing it switches to that mode. */
  light?: ColorwayColors;
  dark?: ColorwayColors;
  /** Corner radius of controls in px (cards and sheets scale from it; 999 makes pills). Left out, the radius stays as it is. */
  radius?: number;
  /** Colour of the colorway's swatch. Left out, its accent (or ground, when the accent is near the ground). */
  swatch?: string;
};

type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: RGB) {
  return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}

/** Mix a towards b by t (0..1). */
export function mix(a: string, b: string, t: number) {
  const x = hexToRgb(a), y = hexToRgb(b);
  return rgbToHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
}

function luminance(hex: string) {
  const c = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** WCAG contrast ratio between two hex colours. */
export function contrast(a: string, b: string) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function toHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}

function fromHsl(h: number, s: number, l: number) {
  const k = (n: number) => (n + h * 12) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex([f(0) * 255, f(8) * 255, f(4) * 255]);
}

/** A solid fill for a button from a brand colour: darkened until white text reads at 4.5:1, or kept
    with dark text when it is a pale colour by nature (a yellow, a near-white) that would turn muddy. */
function buttonFill(c: string, hoverToward: string) {
  const [h, s, l] = toHsl(c);
  const lift = (nl: number, sat = s) => fromHsl(h, sat, hoverToward === "#ffffff" ? nl + 0.05 : nl - 0.05);
  if (contrast(c, "#ffffff") >= 4.5) return { bg: c, hover: lift(l), ink: "#ffffff" };
  const deg = h * 360;
  if ((deg >= 35 && deg <= 75 && s > 0.4) || l > 0.85) return { bg: c, hover: mix(c, "#000000", 0.08), ink: mix(c, "#000000", 0.85) };
  const sat = Math.min(s, 0.62);
  for (let nl = l; nl >= 0.12; nl -= 0.005) {
    const m = fromHsl(h, sat, nl);
    if (contrast(m, "#ffffff") >= 4.6) return { bg: m, hover: lift(nl, sat), ink: "#ffffff" };
  }
  return { bg: c, hover: mix(c, "#000000", 0.08), ink: mix(c, "#000000", 0.85) };
}

/** A fill chosen exactly: kept, with whichever text colour reads better on it. */
function exactFill(c: string) {
  const deep = mix(c, "#000000", 0.85);
  const ink = contrast(c, "#ffffff") >= contrast(c, deep) ? "#ffffff" : deep;
  return { bg: c, hover: mix(c, ink === "#ffffff" ? "#000000" : "#ffffff", 0.1), ink };
}

const SIGNALS: Record<ColorwayMode, Required<Pick<ColorwayColors, "positive" | "negative" | "warning" | "info">>> = {
  light: { positive: "#1e7b4f", negative: "#c4242a", warning: "#8a4b0b", info: "#2f63b0" },
  dark: { positive: "#4cc488", negative: "#f0706f", warning: "#e8b04f", info: "#7fa9ec" },
};

/** Fill in the colours a colorway left out. */
export function completeColors(c: ColorwayColors, mode: ColorwayMode): Required<Omit<ColorwayColors, "button" | "dangerButton">> & Pick<ColorwayColors, "button" | "dangerButton"> {
  const dark = mode === "dark";
  return {
    ...SIGNALS[mode],
    surface: dark ? mix(c.ground, c.ink, 0.05) : mix(c.ground, "#ffffff", 0.6),
    ...c,
  };
}

/** Every colour token of one mode, from the colours chosen for it. */
export function colorwayTokens(colors: ColorwayColors, mode: ColorwayMode): Record<string, string> {
  const p = completeColors(colors, mode);
  const dark = mode === "dark";
  const deep = mix(p.accent, "#000000", 0.85);
  const onAccent = contrast(p.accent, "#ffffff") >= contrast(p.accent, deep) ? "#ffffff" : deep;
  const primary = p.button ? exactFill(p.button) : buttonFill(p.accent, dark ? "#ffffff" : "#000000");
  const danger = p.dangerButton ? exactFill(p.dangerButton) : buttonFill(p.negative, dark ? "#ffffff" : "#000000");
  return {
    "--k-btn-primary": primary.bg,
    "--k-btn-primary-hover": primary.hover,
    "--k-btn-primary-ink": primary.ink,
    "--k-btn-secondary": mix(p.ground, p.ink, dark ? 0.12 : 0.06),
    "--k-btn-secondary-hover": mix(p.ground, p.ink, dark ? 0.17 : 0.1),
    "--k-btn-secondary-ink": p.ink,
    "--k-btn-danger": danger.bg,
    "--k-btn-danger-hover": danger.hover,
    "--k-btn-danger-ink": danger.ink,
    "--k-ground": p.ground,
    "--k-surface": p.surface,
    "--k-raised": mix(p.ground, p.ink, dark ? 0.06 : 0.025),
    "--k-active": mix(p.ground, p.ink, dark ? 0.11 : 0.06),
    "--k-elevated": dark ? mix(p.surface, p.ink, 0.13) : p.surface,
    "--k-line": mix(p.surface, p.ink, dark ? 0.11 : 0.1),
    "--k-line-strong": mix(p.surface, p.ink, dark ? 0.2 : 0.22),
    "--k-ink": p.ink,
    "--k-muted": mix(p.ink, p.surface, dark ? 0.34 : 0.38),
    "--k-faint": mix(p.ink, p.surface, dark ? 0.56 : 0.5),
    "--k-accent": p.accent,
    "--k-accent-hover": mix(p.accent, dark ? "#ffffff" : "#000000", 0.16),
    "--k-accent-soft": mix(p.surface, p.accent, dark ? 0.2 : 0.12),
    "--k-focus-edge": dark ? mix(p.surface, p.ink, 0.34) : mix(p.accent, p.surface, 0.06),
    "--k-focus-wash": dark ? mix(p.surface, p.ink, 0.1) : mix(p.surface, p.accent, 0.25),
    "--k-on-accent": onAccent,
    "--k-positive": p.positive,
    "--k-positive-soft": mix(p.surface, p.positive, dark ? 0.18 : 0.13),
    "--k-negative": p.negative,
    "--k-negative-soft": mix(p.surface, p.negative, dark ? 0.18 : 0.1),
    "--k-warning": p.warning,
    "--k-warning-soft": mix(p.surface, p.warning, dark ? 0.16 : 0.1),
    "--k-info": p.info,
    "--k-info-soft": mix(p.surface, p.info, dark ? 0.18 : 0.1),
  };
}

/** Radius tokens from the control radius. */
export function radiusTokens(r: number): Record<string, string> {
  const pill = r >= 999;
  return {
    "--k-radius-control": pill ? "999px" : `${r}px`,
    "--k-radius-card": pill ? "20px" : `${Math.round(r * 1.5)}px`,
    "--k-radius-sheet": pill ? "28px" : `${Math.round(r * 2.25)}px`,
  };
}

/** The colours a colorway uses in a mode: its own for that mode, else the one it has. */
export function colorwayColors(g: ColorwayTheme, mode: ColorwayMode): ColorwayColors {
  const c = g[mode] ?? g.light ?? g.dark;
  if (!c) throw new Error(`Colorway "${g.id}" has neither light nor dark colours`);
  return c;
}

/** The mode a one-mode colorway belongs to; undefined when it has both. */
export function colorwayOwnMode(g: ColorwayTheme): ColorwayMode | undefined {
  if (g.light && !g.dark) return "light";
  if (g.dark && !g.light) return "dark";
  return undefined;
}

/** The swatch colour for a colorway in a mode. */
export function colorwaySwatch(g: ColorwayTheme, mode: ColorwayMode) {
  if (g.swatch) return g.swatch;
  const c = colorwayColors(g, mode);
  return contrast(c.accent, c.ground) < 1.4 ? c.ground : c.accent;
}

const block = (sel: string, vars: Record<string, string>, extra = "") =>
  `${sel} {\n${Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n${extra}}\n`;

/** CSS that applies a colorway to the whole page, over tokens.css. */
export function colorwayCss(g: ColorwayTheme) {
  const r = g.radius != null ? radiusTokens(g.radius) : {};
  return (
    block(":root:root, :root.light", { ...colorwayTokens(colorwayColors(g, "light"), "light"), ...r }) +
    block(":root.dark", colorwayTokens(colorwayColors(g, "dark"), "dark"))
  );
}

/** A complete replacement for src/kiln/tokens.css. */
export function colorwayTokensFile(g: ColorwayTheme) {
  return `/* Kiln tokens, generated from the "${g.name}" colorway. Replace src/kiln/tokens.css with this file. */

${block(":root, .light", { ...colorwayTokens(colorwayColors(g, "light"), "light"), ...radiusTokens(g.radius ?? 8) }, `  --k-float-shadow: 0 1px 2px rgb(20 20 19 / 0.06), 0 12px 32px -8px rgb(20 20 19 / 0.18);
  --k-scrim: rgb(20 20 19 / 0.32);
  color-scheme: light;
`)}
${block(".dark", colorwayTokens(colorwayColors(g, "dark"), "dark"), `  --k-float-shadow: 0 1px 2px rgb(0 0 0 / 0.4), 0 16px 40px -8px rgb(0 0 0 / 0.6);
  --k-scrim: rgb(0 0 0 / 0.55);
  color-scheme: dark;
`)}`;
}

/** Kiln's own colorways, the ones the gallery and theme studio start from. */
export const kilnColorways: ColorwayTheme[] = [
  {
    id: "celadon", name: "Celadon", radius: 8,
    light: { ground: "#f3f4f2", surface: "#ffffff", ink: "#141413", accent: "#1b6c80", positive: "#1e7b4f", negative: "#c4242a", warning: "#8a4b0b", info: "#2f63b0" },
    dark: { ground: "#0f1011", surface: "#17181a", ink: "#ededea", accent: "#5fb4c6", positive: "#4cc488", negative: "#f0706f", warning: "#e8b04f", info: "#7fa9ec" },
  },
  {
    id: "graphite", name: "Graphite", radius: 6,
    light: { ground: "#f4f4f5", surface: "#ffffff", ink: "#111113", accent: "#18181b", positive: "#1d7a4c", negative: "#c42a2a", warning: "#8a4b0b", info: "#2e5fab" },
    dark: { ground: "#0b0b0c", surface: "#151517", ink: "#f2f2f3", accent: "#f2f2f3", positive: "#48c084", negative: "#ef6f6e", warning: "#e5ad4d", info: "#7ea7ea" },
  },
  {
    id: "moss", name: "Moss", radius: 10,
    light: { ground: "#f3f5f0", surface: "#ffffff", ink: "#151a14", accent: "#3d6b2c", positive: "#2c7a3a", negative: "#bf2f2a", warning: "#86510c", info: "#2f62a8" },
    dark: { ground: "#0e110d", surface: "#161a15", ink: "#e8ede4", accent: "#9fcf7e", positive: "#69c97b", negative: "#ee7470", warning: "#e2b15a", info: "#83a9e6" },
  },
  {
    id: "harbor", name: "Harbor", radius: 999,
    light: { ground: "#f2f5f9", surface: "#ffffff", ink: "#0f1722", accent: "#1f5fd1", positive: "#17794b", negative: "#c42a33", warning: "#8a4b0b", info: "#1f5fd1" },
    dark: { ground: "#0a0e14", surface: "#121822", ink: "#e9eef6", accent: "#7aa7ff", positive: "#4cc38a", negative: "#f17179", warning: "#e7b04f", info: "#7aa7ff" },
  },
  {
    id: "marigold", name: "Marigold", radius: 4,
    light: { ground: "#f7f6f1", surface: "#ffffff", ink: "#16150f", accent: "#e0a100", positive: "#2a7a3e", negative: "#c22f25", warning: "#8a4b0b", info: "#2c5fa6" },
    dark: { ground: "#100f0b", surface: "#191812", ink: "#efeeea", accent: "#f2be2e", positive: "#5cc27c", negative: "#ef7468", warning: "#f2be2e", info: "#7ea6e6" },
  },
];
