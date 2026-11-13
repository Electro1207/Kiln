import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Gem } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, springSoft } from "../../motion";

/** Text used by SecretHunt. Pass a partial via `labels` to translate or reword. */
export interface SecretHuntLabels {
  /** The notice when one is picked up. */
  found: (count: number, total: number) => string;
  /** The notice when the last one is picked up. */
  complete: (total: number) => string;
}
export const secretHuntLabels: SecretHuntLabels = {
  found: (n, total) => `Secret found · ${n} of ${total}`,
  complete: (total) => `All ${total} secrets found`,
};

/** Icons used by SecretHunt. Pass a partial via `icons` to replace any. */
export interface SecretHuntIcons {
  /** Shown in the notice. */
  notice: ReactNode;
}
export const secretHuntIcons: SecretHuntIcons = { notice: <Gem /> };

type HuntValue = {
  found: ReadonlySet<string>;
  total: number;
  collect: (id: string) => void;
  /** Forget every find (for a "start again" control). */
  reset: () => void;
};
const HuntContext = createContext<HuntValue | null>(null);

export type SecretHuntProps = {
  children: ReactNode;
  /** How many secrets there are to find. */
  total: number;
  /** Where finds are remembered between visits (localStorage). Leave out to forget them on reload. */
  storageKey?: string;
  /** Called with the secret's id and the new count each time one is found. */
  onFound?: (id: string, count: number) => void;
  /** Called once, when the last secret is found. */
  onComplete?: () => void;
  /** How long the notice stays, in ms. Default 2800. */
  noticeFor?: number;
  /** Classes for the notice (it sits fixed at the bottom centre by default). */
  noticeClassName?: string;
  /** Override any UI text. Merged over `secretHuntLabels`. */
  labels?: Partial<SecretHuntLabels>;
  /** Override any icon. Merged over `secretHuntIcons`. */
  icons?: Partial<SecretHuntIcons>;
};

function readFound(key?: string): Set<string> {
  if (!key) return new Set();
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? "[]");
    return new Set(Array.isArray(v) ? v.filter((x) => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

/**
 * A hunt for secrets hidden around a page, in the manner of the collectibles in an adventure game.
 * Put `<Secret id>` pieces anywhere inside it; picking one up plays a small lift and shows a quiet
 * notice with the count. Finds can be remembered between visits. Nothing appears unless someone
 * goes looking: the secrets are small, and the notice only answers a find.
 */
export function SecretHunt({ children, total, storageKey, onFound, onComplete, noticeFor = 2800, noticeClassName, labels, icons }: SecretHuntProps) {
  const l = { ...secretHuntLabels, ...labels };
  const ic = { ...secretHuntIcons, ...icons };
  const [found, setFound] = useState<Set<string>>(() => readFound(storageKey));
  const [notice, setNotice] = useState<{ key: number; text: string } | null>(null);
  const cb = useRef({ onFound, onComplete });
  useEffect(() => { cb.current = { onFound, onComplete }; });
  const timer = useRef(0);

  const collect = useCallback((id: string) => {
    setFound((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      try { if (storageKey) localStorage.setItem(storageKey, JSON.stringify([...next])); } catch { /* storage blocked */ }
      const n = next.size;
      queueMicrotask(() => {
        cb.current.onFound?.(id, n);
        if (n === total) cb.current.onComplete?.();
      });
      setNotice({ key: Date.now(), text: n >= total ? l.complete(total) : l.found(n, total) });
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setNotice(null), noticeFor);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, total, noticeFor]);

  const reset = useCallback(() => {
    setFound(new Set());
    try { if (storageKey) localStorage.removeItem(storageKey); } catch { /* storage blocked */ }
  }, [storageKey]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const value = useMemo(() => ({ found, total, collect, reset }), [found, total, collect, reset]);
  return (
    <HuntContext.Provider value={value}>
      {children}
      <div aria-live="polite" className={cn("pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center", noticeClassName)}>
        <AnimatePresence>
          {notice && (
            <motion.div
              key={notice.key}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, transition: { duration: 0.25, ease: easeOut } }}
              transition={springSoft}
              className="flex items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink shadow-float"
            >
              <span aria-hidden className="grid size-4 place-items-center text-accent [&>svg]:size-4">{ic.notice}</span>
              {notice.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </HuntContext.Provider>
  );
}

/** The hunt's state, for a counter or a reward: `{ found, total, reset }`. */
export function useSecretHunt() {
  const ctx = useContext(HuntContext);
  if (!ctx) throw new Error("useSecretHunt must be used inside <SecretHunt>");
  return { found: ctx.found, total: ctx.total, reset: ctx.reset };
}

export type SecretProps = {
  /** Unique within the hunt. */
  id: string;
  /** What the secret is, for screen readers ("A jade dragon"). */
  label: string;
  /** What it looks like. Default a small gem. */
  children?: ReactNode;
  className?: string;
};

/** One secret: a small button that lifts, spins and vanishes when picked up, and stays gone once found. */
export function Secret({ id, label, children, className }: SecretProps) {
  const ctx = useContext(HuntContext);
  if (!ctx) throw new Error("Secret must be used inside <SecretHunt>");
  const taken = ctx.found.has(id);
  return (
    <AnimatePresence initial={false}>
      {!taken && (
        <motion.button
          type="button"
          aria-label={label}
          onClick={() => ctx.collect(id)}
          exit={{ y: -28, rotate: 200, scale: 1.4, opacity: 0, transition: { duration: 0.7, ease: easeOut } }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          transition={springSoft}
          className={cn(
            "inline-grid size-8 place-items-center rounded-full text-accent opacity-40 outline-none transition-opacity duration-300 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent [&>svg]:size-4",
            className,
          )}
        >
          {children ?? <Gem />}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
