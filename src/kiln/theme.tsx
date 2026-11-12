import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";

export type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
  mode: ThemeMode;
  /** The mode actually showing after "system" is resolved. */
  resolved: "light" | "dark";
  /** Change mode. Pass the clicked element to open the new theme as a circle from it. */
  setMode: (mode: ThemeMode, origin?: HTMLElement | null) => void;
  toggle: (origin?: HTMLElement | null) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
/* Actions live in their own context with a value that never changes, so anything that only
   needs to switch the theme (a shell, a toggle in a menu) never re-renders when it switches. */
type ThemeActions = Pick<ThemeContextValue, "setMode" | "toggle">;
const ThemeActionsContext = createContext<ThemeActions | null>(null);
const STORAGE_KEY = "kiln-theme";

function readStored(): ThemeMode {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch { /* storage blocked */ }
  return "system";
}

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children, defaultMode }: { children: ReactNode; defaultMode?: ThemeMode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => defaultMode ?? readStored());
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolved: "light" | "dark" = mode === "system" ? (systemDark ? "dark" : "light") : mode;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolved === "dark");
  }, [resolved]);

  const setMode = useCallback((next: ThemeMode, origin?: HTMLElement | null) => {
    const apply = () => {
      setModeState(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (!doc.startViewTransition || reduce) {
      apply();
      return;
    }
    const root = document.documentElement;
    const rect = origin?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : 0;
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    root.style.setProperty("--k-reveal-x", `${x}px`);
    root.style.setProperty("--k-reveal-y", `${y}px`);
    root.style.setProperty("--k-reveal-r", `${r}px`);
    doc.startViewTransition(() => {
      flushSync(apply);
      // The class must change inside the callback so the new snapshot has it.
      const dark = next === "system" ? systemPrefersDark() : next === "dark";
      root.classList.toggle("dark", dark);
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

  const actions = useMemo(() => ({ setMode, toggle }), [setMode, toggle]);
  const value = useMemo(() => ({ mode, resolved, setMode, toggle }), [mode, resolved, setMode, toggle]);
  return (
    <ThemeActionsContext.Provider value={actions}>
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </ThemeActionsContext.Provider>
  );
}

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
