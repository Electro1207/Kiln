/* Kiln accessibility core.

   Two layers. The person's choices (AccessibilityMenu, saved on the device, applied page-wide)
   and the developer's choices (the `accessibilityFeatures` prop on one component, or an
   <AccessibilityScope> round a subtree). What a component sees is their union: booleans OR,
   textScale max. A developer can add support; they can never take a person's choice away.

   CSS does the page-wide work: the provider writes `data-k-*` attributes and `--k-text-scale` on
   <html>, a scope or a component writes the same on its own root, and one set of selectors in
   kiln.css answers both. Everything here works without a provider (system settings only) and
   renders safely on the server. */

import { createContext, useContext, useLayoutEffect, useMemo, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { cn } from "./cn";
import { useControllable } from "./controllable";

export type A11yProfile =
  | "low-vision" | "colour-blind" | "screen-reader" | "vestibular" | "photosensitive"
  | "motor" | "adhd" | "dyslexia" | "cognitive" | "deaf";
export const A11Y_PROFILES: readonly A11yProfile[] = [
  "low-vision", "colour-blind", "screen-reader", "vestibular", "photosensitive", "motor", "adhd", "dyslexia", "cognitive", "deaf",
];

export type A11yFeatures = {
  /** No parallax/tilt/magnetic/drift; Motion reducedMotion "always"; CSS motion-reduce: variants fire. */
  reduceMotion: boolean;
  /** Nothing flickers/scrambles/blinks faster than 3 per second; scramble shows final text. */
  noFlashing: boolean;
  /** Nothing moves or changes on its own: autoplay off, loops paused, rotating text holds, pulses/shimmer off. */
  calm: boolean;
  /** Muted text becomes ink, stronger lines, solid borders on controls. */
  highContrast: boolean;
  /** 3px solid accent outline, 2px offset on :focus-visible. */
  strongFocus: boolean;
  /** 1 | 1.125 | 1.25 | 1.5 */
  textScale: number;
  readableFont: boolean;
  /** WCAG 1.4.12 (line-height 1.5, paragraph spacing 2em, letter .12em, word .16em). */
  textSpacing: boolean;
  /** Every control gets a hit area of at least 44px. */
  largeTargets: boolean;
  /** Never colour alone: chart patterns and marker shapes, Okabe–Ito palette, status icons. */
  colourSafe: boolean;
  /** No auto-dismiss, ×3 timers, hold-to-confirm becomes press-then-confirm. */
  extendedTime: boolean;
  /** Extra descriptions, chart data tables shown, fuller announcements. */
  screenReaderHints: boolean;
  /** Media starts with captions on. */
  captions: boolean;
};
export type A11yFeatureKey = keyof A11yFeatures;

/** The features that are plain on/off switches, in the order the menu lists them. */
export const A11Y_BOOLEAN_KEYS = [
  "reduceMotion", "noFlashing", "calm", "highContrast", "strongFocus", "readableFont", "textSpacing",
  "largeTargets", "colourSafe", "extendedTime", "screenReaderHints", "captions",
] as const satisfies readonly A11yFeatureKey[];
export type A11yBooleanKey = (typeof A11Y_BOOLEAN_KEYS)[number];

/** The text sizes the menu offers. */
export const A11Y_TEXT_SCALES = [1, 1.125, 1.25, 1.5] as const;

/** Everything off, text at 100%. */
export const A11Y_OFF: A11yFeatures = Object.freeze({
  reduceMotion: false, noFlashing: false, calm: false, highContrast: false, strongFocus: false, textScale: 1,
  readableFont: false, textSpacing: false, largeTargets: false, colourSafe: false, extendedTime: false,
  screenReaderHints: false, captions: false,
});

/** Which features each profile turns on. */
export const A11Y_PROFILE_FEATURES: Record<A11yProfile, Partial<A11yFeatures>> = {
  "low-vision": { highContrast: true, strongFocus: true, largeTargets: true, textScale: 1.25 },
  "colour-blind": { colourSafe: true },
  "screen-reader": { screenReaderHints: true },
  vestibular: { reduceMotion: true },
  photosensitive: { noFlashing: true, reduceMotion: true },
  motor: { largeTargets: true, extendedTime: true },
  adhd: { calm: true, reduceMotion: true },
  dyslexia: { readableFont: true, textSpacing: true },
  cognitive: { calm: true, extendedTime: true, textSpacing: true },
  deaf: { captions: true },
};

export type AccessibilityFeaturesProp = "all" | "none" | A11yProfile | A11yProfile[] | Partial<A11yFeatures>;

const A11Y_ALL: A11yFeatures = Object.freeze({
  ...A11Y_OFF,
  ...Object.fromEntries(A11Y_BOOLEAN_KEYS.map((k) => [k, true])),
  textScale: 1.25,
});

const ATTR: Record<A11yBooleanKey, string> = {
  reduceMotion: "data-k-reduce-motion",
  noFlashing: "data-k-no-flashing",
  calm: "data-k-calm",
  highContrast: "data-k-high-contrast",
  strongFocus: "data-k-strong-focus",
  readableFont: "data-k-readable-font",
  textSpacing: "data-k-text-spacing",
  largeTargets: "data-k-large-targets",
  colourSafe: "data-k-colour-safe",
  extendedTime: "data-k-extended-time",
  screenReaderHints: "data-k-sr-hints",
  captions: "data-k-captions",
};
const SCALE_VAR = "--k-text-scale";

/* ---------------------------------------------------------------- pure helpers */

function fromPartial(p: Partial<A11yFeatures> | undefined): A11yFeatures {
  const out: A11yFeatures = { ...A11Y_OFF };
  if (!p) return out;
  for (const k of A11Y_BOOLEAN_KEYS) if (p[k] === true) out[k] = true;
  if (typeof p.textScale === "number" && Number.isFinite(p.textScale) && p.textScale > 0) out.textScale = p.textScale;
  return out;
}

/** Turn the prop a component takes into a full set of features. */
export function resolveA11y(p?: AccessibilityFeaturesProp): A11yFeatures {
  if (p === undefined || p === "none") return A11Y_OFF;
  if (p === "all") return A11Y_ALL;
  if (typeof p === "string") return fromPartial(A11Y_PROFILE_FEATURES[p]);
  if (Array.isArray(p)) return mergeA11y(...p.map((x) => fromPartial(A11Y_PROFILE_FEATURES[x])));
  return fromPartial(p);
}

/** Union: booleans are ORed, textScale takes the largest. */
export function mergeA11y(...f: A11yFeatures[]): A11yFeatures {
  const out: A11yFeatures = { ...A11Y_OFF };
  for (const x of f) {
    for (const k of A11Y_BOOLEAN_KEYS) if (x[k]) out[k] = true;
    if (x.textScale > out.textScale) out.textScale = x.textScale;
  }
  return out;
}

export type A11yAttrs = Record<string, string | undefined> & { style?: CSSProperties };

/** data-k-* attributes for exactly these features (only the true ones) + style {"--k-text-scale"} when ≠ 1. */
export function a11yAttrs(f: A11yFeatures): A11yAttrs {
  const out: Record<string, unknown> = {};
  for (const k of A11Y_BOOLEAN_KEYS) if (f[k]) out[ATTR[k]] = "";
  if (f.textScale !== 1) out.style = { [SCALE_VAR]: String(f.textScale) } as CSSProperties;
  return out as A11yAttrs;
}

/** Attributes for the *local* features only. A local text size is applied as CSS `zoom` by the
    ratio to what is already inherited, so nesting never compounds: the union stays a max. */
function localAttrs(local: A11yFeatures, inheritedScale: number): A11yAttrs {
  const ratio = local.textScale > inheritedScale ? local.textScale / inheritedScale : 1;
  return a11yAttrs({ ...local, textScale: ratio });
}

/* ---------------------------------------------------------------- the system's own settings */

const SYSTEM_QUERIES = ["(prefers-reduced-motion: reduce)", "(prefers-contrast: more)", "(forced-colors: active)"] as const;
let queries: MediaQueryList[] | null = null;
const queriesOf = () => (queries ??= SYSTEM_QUERIES.map((q) => window.matchMedia(q)));
const systemListeners = new Set<() => void>();
const onSystemChange = () => systemListeners.forEach((f) => f());

function subscribeSystem(f: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  if (systemListeners.size === 0) queriesOf().forEach((m) => m.addEventListener("change", onSystemChange));
  systemListeners.add(f);
  return () => {
    systemListeners.delete(f);
    if (systemListeners.size === 0) queriesOf().forEach((m) => m.removeEventListener("change", onSystemChange));
  };
}
/** Bit 0 reduced motion, bit 1 more contrast, bit 2 forced colours. A number, so the snapshot is stable. */
function systemMask() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return 0;
  return queriesOf().reduce((n, m, i) => n | (m.matches ? 1 << i : 0), 0);
}

const systemCache = new Map<number, { features: A11yFeatures; partial: Partial<A11yFeatures> }>();
function systemOf(mask: number) {
  let hit = systemCache.get(mask);
  if (!hit) {
    const partial: Partial<A11yFeatures> = {};
    if (mask & 1) partial.reduceMotion = true;
    if (mask & 6) partial.highContrast = true;
    hit = { features: fromPartial(partial), partial };
    systemCache.set(mask, hit);
  }
  return hit;
}
function useSystemMask() {
  return useSyncExternalStore(subscribeSystem, systemMask, () => 0);
}

/* ---------------------------------------------------------------- settings (the person's choices) */

export type A11ySettings = { profiles: A11yProfile[]; features: Partial<A11yFeatures> };

const EMPTY: A11ySettings = { profiles: [], features: {} };

/** The features a person's settings add up to: their profiles, then their manual overrides on top. */
export function resolveSettings(s: A11ySettings): A11yFeatures {
  const base = mergeA11y(...s.profiles.map((p) => fromPartial(A11Y_PROFILE_FEATURES[p])));
  const out: A11yFeatures = { ...base };
  for (const k of A11Y_BOOLEAN_KEYS) if (typeof s.features[k] === "boolean") out[k] = s.features[k] as boolean;
  if (typeof s.features.textScale === "number" && s.features.textScale > 0) out.textScale = s.features.textScale;
  return out;
}

function readSettings(key: string | false): A11ySettings | undefined {
  if (key === false || typeof localStorage === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;
    const v = JSON.parse(raw) as Partial<A11ySettings> | null;
    if (!v || typeof v !== "object") return undefined;
    const profiles = Array.isArray(v.profiles) ? v.profiles.filter((p): p is A11yProfile => A11Y_PROFILES.includes(p)) : [];
    const features: Partial<A11yFeatures> = {};
    const f = (v.features ?? {}) as Record<string, unknown>;
    for (const k of A11Y_BOOLEAN_KEYS) if (typeof f[k] === "boolean") features[k] = f[k] as boolean;
    if (typeof f.textScale === "number" && f.textScale >= 1 && f.textScale <= 2) features.textScale = f.textScale;
    return { profiles, features };
  } catch {
    return undefined;
  }
}

function writeSettings(key: string | false, s: A11ySettings) {
  if (key === false) return;
  try {
    if (s.profiles.length === 0 && Object.keys(s.features).length === 0) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(s));
  } catch { /* storage blocked */ }
}

function applyToRoot(f: A11yFeatures | null) {
  const root = document.documentElement;
  for (const k of A11Y_BOOLEAN_KEYS) {
    if (f?.[k]) root.setAttribute(ATTR[k], "");
    else root.removeAttribute(ATTR[k]);
  }
  if (f && f.textScale !== 1) root.style.setProperty(SCALE_VAR, String(f.textScale));
  else root.style.removeProperty(SCALE_VAR);
}

type A11yApi = {
  settings: A11ySettings;
  /** Everything in force on the page: system ∪ the person's choices. */
  effective: A11yFeatures;
  /** What the system alone turns on (reduced motion, more contrast, forced colours). */
  system: Partial<A11yFeatures>;
  setSettings(s: A11ySettings): void;
  toggleProfile(p: A11yProfile): void;
  /** Override one feature by hand. Pass `undefined` to go back to what the profiles say. */
  setFeature<K extends A11yFeatureKey>(k: K, v: A11yFeatures[K] | undefined): void;
  reset(): void;
};

const A11yContext = createContext<A11yApi | null>(null);
const ScopeContext = createContext<A11yFeatures | null>(null);

export type AccessibilityProviderProps = {
  children: ReactNode;
  /** Controlled settings. Leave out to let the provider keep (and save) them. */
  value?: A11ySettings;
  /** Settings before the person picks any. Default: what was saved, else nothing. */
  defaultValue?: A11ySettings;
  /** Called on every change, controlled or not. */
  onChange?: (s: A11ySettings) => void;
  /** Read prefers-reduced-motion, prefers-contrast: more and forced-colors. Default true. */
  respectSystem?: boolean;
  /** localStorage key, or false to not persist. Default "kiln-a11y". */
  storageKey?: string | false;
};

/**
 * Holds the person's accessibility choices, saves them on the device and applies them to the whole
 * page. Also sets Motion's `reducedMotion`, so wrap it inside or instead of your own MotionConfig.
 */
export function AccessibilityProvider({ children, value, defaultValue, onChange, respectSystem = true, storageKey = "kiln-a11y" }: AccessibilityProviderProps) {
  const [initial] = useState(() => defaultValue ?? readSettings(storageKey) ?? EMPTY);
  const [settings, set] = useControllable<A11ySettings>(value, initial, (s) => {
    writeSettings(storageKey, s);
    onChange?.(s);
  });
  const mask = useSystemMask();
  const sys = respectSystem ? systemOf(mask) : systemOf(0);
  const person = useMemo(() => resolveSettings(settings), [settings]);
  const effective = useMemo(() => mergeA11y(person, sys.features), [person, sys]);

  useLayoutEffect(() => {
    applyToRoot(effective);
  }, [effective]);
  useLayoutEffect(() => () => applyToRoot(null), []);

  const api = useMemo<A11yApi>(() => ({
    settings,
    effective,
    system: sys.partial,
    setSettings: (s) => set(s),
    toggleProfile: (p) => set((prev) => {
      const on = prev.profiles.includes(p);
      const features = { ...prev.features };
      // Switching a profile on or off clears the hand-set values for what it touches, so it does what it says.
      for (const k of Object.keys(A11Y_PROFILE_FEATURES[p]) as A11yFeatureKey[]) delete features[k];
      return { profiles: on ? prev.profiles.filter((x) => x !== p) : [...prev.profiles, p], features };
    }),
    setFeature: (k, v) => set((prev) => {
      const features = { ...prev.features } as Record<string, unknown>;
      const fromProfiles = resolveSettings({ profiles: prev.profiles, features: {} })[k];
      if (v === undefined || Object.is(v, fromProfiles)) delete features[k];
      else features[k] = v;
      return { ...prev, features: features as Partial<A11yFeatures> };
    }),
    reset: () => set(EMPTY),
  }), [settings, effective, sys, set]);

  return (
    <A11yContext.Provider value={api}>
      <MotionConfig reducedMotion={effective.reduceMotion ? "always" : "user"}>{children}</MotionConfig>
    </A11yContext.Provider>
  );
}

/** Person's settings; throws outside AccessibilityProvider. */
export function useA11ySettings(): A11yApi {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error("useA11ySettings must be used inside <AccessibilityProvider>");
  return ctx;
}

/* ---------------------------------------------------------------- reading the features */

function useResolvedProp(prop: AccessibilityFeaturesProp | undefined) {
  const key = prop === undefined ? "" : typeof prop === "string" ? prop : JSON.stringify(prop);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => resolveA11y(prop), [key]);
}

/** Effective features for this spot: system ∪ person ∪ scope ∪ prop. Safe without a provider. */
export function useA11y(prop?: AccessibilityFeaturesProp): A11yFeatures {
  const mask = useSystemMask();
  const ctx = useContext(A11yContext);
  const scope = useContext(ScopeContext);
  const local = useResolvedProp(prop);
  return useMemo(
    () => mergeA11y(ctx ? ctx.effective : systemOf(mask).features, scope ?? A11Y_OFF, local),
    [ctx, mask, scope, local],
  );
}

/** For a component root: features + the attributes to spread for the *local* prop only. */
export function useA11yProps(prop?: AccessibilityFeaturesProp): { a11y: A11yFeatures; rootProps: A11yAttrs } {
  const a11y = useA11y(prop);
  const ctx = useContext(A11yContext);
  const scope = useContext(ScopeContext);
  const local = useResolvedProp(prop);
  const inherited = Math.max(ctx?.effective.textScale ?? 1, scope?.textScale ?? 1);
  const rootProps = useMemo(() => localAttrs(local, inherited), [local, inherited]);
  return { a11y, rootProps };
}

export type AccessibilityScopeProps = {
  /** What to turn on inside: "all", "none", a profile, several profiles, or single features. */
  features: AccessibilityFeaturesProp;
  children: ReactNode;
  className?: string;
};

/**
 * Turns accessibility features on for everything inside it, whatever the page's own settings are.
 * It adds to them; it never switches off what a person chose. Without a local text size it adds no
 * box of its own (`display: contents`).
 */
export function AccessibilityScope({ features, children, className }: AccessibilityScopeProps) {
  const ctx = useContext(A11yContext);
  const parent = useContext(ScopeContext);
  const local = useResolvedProp(features);
  const merged = useMemo(() => mergeA11y(parent ?? A11Y_OFF, local), [parent, local]);
  const inherited = Math.max(ctx?.effective.textScale ?? 1, parent?.textScale ?? 1);
  const attrs = useMemo(() => localAttrs(local, inherited), [local, inherited]);
  // `zoom` has no effect on display: contents, so a local text size gets a real block wrapper.
  const zoomed = attrs.style !== undefined;
  return (
    <ScopeContext.Provider value={merged}>
      <div {...attrs} className={cn(!zoomed && "contents", className)}>{children}</div>
    </ScopeContext.Provider>
  );
}
