import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { glazeCss, glazeOwnMode, type GlazeTheme } from "./glaze";

export type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  mode: ThemeMode;
  /** The mode actually showing after "system" is resolved. */
  resolved: "light" | "dark";
  /** Change mode. Pass the clicked element to open the new theme as a circle from it. */
  setMode: (mode: ThemeMode, origin?: HTMLElement | null) => void;
  toggle: (origin?: HTMLElement | null) => void;
  /** The glazes passed to ThemeProvider (empty when none). */
  glazes: GlazeTheme[];
  /** Id of the glaze in use, or undefined when the page uses tokens.css as it is. */
  glaze: string | undefined;
  /** Re-glaze the page. Pass the clicked element to open the new colours as a circle from it. */
  setGlaze: (id: string, origin?: HTMLElement | null) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
/* Actions live in their own context with a value that never changes, so anything that only
   needs to switch the theme (a shell, a toggle in a menu) never re-renders when it switches. */
type ThemeActions = Pick<ThemeContextValue, "setMode" | "toggle" | "setGlaze">;
const ThemeActionsContext = createContext<ThemeActions | null>(null);
const STORAGE_KEY = "kiln-theme";
const GLAZE_KEY = "kiln-glaze";
const STYLE_ID = "kiln-glaze";

function readStored(): ThemeMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch { /* storage blocked */ }
  return "system";
}

function readGlaze(glazes: GlazeTheme[], fallback?: string) {
  if (!glazes.length) return undefined;
  try {
    const v = localStorage.getItem(GLAZE_KEY);
    if (v && glazes.some((g) => g.id === v)) return v;
  } catch { /* storage blocked */ }
  return glazes.some((g) => g.id === fallback) ? fallback : glazes[0].id;
}

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function writeGlazeCss(g: GlazeTheme | undefined) {
  let tag = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!g) return tag?.remove();
  if (!tag) {
    tag = document.createElement("style");
    tag.id = STYLE_ID;
    document.head.appendChild(tag);
  }
  tag.textContent = glazeCss(g);
}

/** Run `apply` inside a view transition whose new state opens as a circle from `origin`. */
function reveal(origin: HTMLElement | null | undefined, apply: () => void) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (!doc.startViewTransition || reduce) return apply();
  const root = document.documentElement;
  const rect = origin?.getBoundingClientRect();
  const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const y = rect ? rect.top + rect.height / 2 : 0;
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  root.style.setProperty("--k-reveal-x", `${x}px`);
  root.style.setProperty("--k-reveal-y", `${y}px`);
  root.style.setProperty("--k-reveal-r", `${r}px`);
  doc.startViewTransition(apply);
}

export type ThemeProviderProps = {
  children: ReactNode;
  /** Mode before the visitor picks one. Default "system". */
  defaultMode?: ThemeMode;
  /**
   * Whole themes to switch between, each made from a few colours (see `GlazeTheme` in glaze.ts and
   * `kilnGlazes` for examples). The visitor's choice is remembered. Leave out to use tokens.css as it is.
   */
  glazes?: GlazeTheme[];
  /** Id of the glaze before the visitor picks one. Default: the first. */
  defaultGlaze?: string;
};

export function ThemeProvider({ children, defaultMode, glazes = NONE, defaultGlaze }: ThemeProviderProps) {
  const [glaze, setGlazeState] = useState<string | undefined>(() => readGlaze(glazes, defaultGlaze));
  const own = (id: string | undefined) => { const g = glazes.find((x) => x.id === id); return g ? glazeOwnMode(g) : undefined; };
  const [mode, setModeState] = useState<ThemeMode>(() => own(glaze) ?? defaultMode ?? readStored());
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolved: "light" | "dark" = mode === "system" ? (systemDark ? "dark" : "light") : mode;

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [resolved]);

  // The glaze's colours sit in one <style> after tokens.css; written before paint so nothing flashes.
  const glazesRef = useRef(glazes);
  useLayoutEffect(() => { glazesRef.current = glazes; });
  useLayoutEffect(() => {
    writeGlazeCss(glazes.find((g) => g.id === glaze));
  }, [glaze, glazes]);
  useEffect(() => () => writeGlazeCss(undefined), []);

  const setMode = useCallback((next: ThemeMode, origin?: HTMLElement | null) => {
    const root = document.documentElement;
    reveal(origin, () => {
      flushSync(() => setModeState(next));
      try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
      // The class must change inside the callback so the new snapshot has it.
      root.classList.toggle("dark", next === "system" ? systemPrefersDark() : next === "dark");
    });
  }, []);

  const setGlaze = useCallback((id: string, origin?: HTMLElement | null) => {
    const g = glazesRef.current.find((x) => x.id === id);
    if (!g) return;
    const ownMode = glazeOwnMode(g);
    reveal(origin, () => {
      // Colours first, synchronously, so the transition's new snapshot already has them.
      writeGlazeCss(g);
      flushSync(() => {
        setGlazeState(id);
        if (ownMode) setModeState(ownMode);
      });
      if (ownMode) document.documentElement.classList.toggle("dark", ownMode === "dark");
      try { localStorage.setItem(GLAZE_KEY, id); } catch { /* ignore */ }
    });
  }, []);

  const resolvedRef = useRef(resolved);
  useLayoutEffect(() => {
    resolvedRef.current = resolved;
  });
  const toggle = useCallback(
    (origin?: HTMLElement | null) => setMode(resolvedRef.current === "dark" ? "light" : "dark", origin),
    [setMode],
  );

  const actions = useMemo(() => ({ setMode, toggle, setGlaze }), [setMode, toggle, setGlaze]);
  const value = useMemo(() => ({ mode, resolved, setMode, toggle, glazes, glaze, setGlaze }), [mode, resolved, setMode, toggle, glazes, glaze, setGlaze]);
  return (
    <ThemeActionsContext.Provider value={actions}>
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </ThemeActionsContext.Provider>
  );
}

const NONE: GlazeTheme[] = [];

/** Switch the theme without subscribing to it: the caller never re-renders on a theme change. */
export function useThemeActions() {
  const ctx = useContext(ThemeActionsContext);
  if (!ctx) throw new Error("useThemeActions must be used inside <ThemeProvider>");
  return ctx;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
