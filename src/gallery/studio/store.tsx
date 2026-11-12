import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_THEME, liveCss, type StudioTheme } from "./tokens";
import { StudioContext, type Ctx } from "./context";

const KEY = "kiln-studio";

function load(): StudioTheme | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StudioTheme) : null;
  } catch {
    return null;
  }
}

/** Holds the studio's theme and applies it live as a style tag over tokens.css. */
export function StudioProvider({ children }: { children: ReactNode }) {
  const [stored] = useState(load);
  const [theme, setThemeState] = useState<StudioTheme>(stored ?? DEFAULT_THEME);
  const [edited, setEdited] = useState(stored !== null);

  useEffect(() => {
    let tag = document.getElementById("kiln-studio") as HTMLStyleElement | null;
    if (!edited) {
      tag?.remove();
      return;
    }
    if (!tag) {
      tag = document.createElement("style");
      tag.id = "kiln-studio";
      document.head.appendChild(tag);
    }
    tag.textContent = liveCss(theme);
  }, [theme, edited]);

  const value = useMemo<Ctx>(
    () => ({
      theme,
      edited,
      setTheme: (t) => {
        setThemeState(t);
        setEdited(true);
        try { localStorage.setItem(KEY, JSON.stringify(t)); } catch { /* ignore */ }
      },
      reset: () => {
        setThemeState(DEFAULT_THEME);
        setEdited(false);
        try { localStorage.removeItem(KEY); } catch { /* ignore */ }
      },
    }),
    [theme, edited],
  );
  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}
