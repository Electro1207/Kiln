import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clock, CornerDownLeft, Search, X } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade, springSoft } from "../../motion";
import { Portal, useModalLayer } from "../shared/useOverlay";
import { Highlight } from "../pickers/Combobox";

export type SpotlightItem = {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  icon?: ReactNode;
  /** Extra words that should match, e.g. aliases. */
  keywords?: string;
  preview: ReactNode;
};

/** Text used by SpotlightSearch. Pass a partial via `labels` to translate or reword. */
export interface SpotlightSearchLabels {
  /** aria-label of the dialog. */
  dialog: string;
  /** Default input placeholder. */
  placeholder: string;
  /** aria-label of the clear button. */
  clear: string;
  /** Name of the first category tab, which shows everything. */
  all: string;
  /** aria-label of the results list. */
  results: string;
  /** Heading above recent and suggested results. */
  recent: string;
  /** Empty state for a query. */
  noResults: (query: string) => string;
  /** Footer hint for moving. */
  hintMove: string;
  /** Footer hint for categories. */
  hintCategories: string;
  /** Footer hint for opening. */
  hintOpen: string;
  /** Footer hint for closing. */
  hintClose: string;
}
export const spotlightSearchLabels: SpotlightSearchLabels = {
  dialog: "Search",
  placeholder: "Search everything",
  clear: "Clear",
  all: "All",
  results: "Results",
  recent: "Recent and suggested",
  noResults: (q) => `Nothing found for “${q}”. Try another word.`,
  hintMove: "↑ ↓ to move",
  hintCategories: "Tab for categories",
  hintOpen: "Enter to open",
  hintClose: "Esc to close",
};

export type SpotlightSearchProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SpotlightItem[];
  categories: string[];
  onPick: (item: SpotlightItem) => void;
  placeholder?: string;
  /** Override any UI text. Merged over `spotlightSearchLabels`. */
  labels?: Partial<SpotlightSearchLabels>;
  /** Replace any built-in icon. Merged over `spotlightSearchIcons`. */
  icons?: Partial<SpotlightSearchIcons>;
};

/** Icons used by SpotlightSearch. Pass a partial via `icons` to swap any of them. */
export interface SpotlightSearchIcons {
  /** Beside the input. */
  search: ReactNode;
  /** Clears the query. */
  clear: ReactNode;
  /** Beside the "Recent" heading. */
  recent: ReactNode;
  /** Enter hint on the active row. */
  enter: ReactNode;
}
export const spotlightSearchIcons: SpotlightSearchIcons = { search: <Search />, clear: <X />, recent: <Clock />, enter: <CornerDownLeft /> };

const RECENT_KEY = "kiln-spotlight-recent";
const readRecent = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
};

/**
 * A search window with categories, recent searches and a preview of the
 * highlighted result on the right. Up and Down move, Tab cycles categories,
 * Enter opens, Esc closes. The preview hides on narrow screens.
 */
export function SpotlightSearch(props: SpotlightSearchProps) {
  return (
    <Portal>
      <AnimatePresence>{props.open && <Window {...props} />}</AnimatePresence>
    </Portal>
  );
}

function Window({ onOpenChange, items, categories, onPick, placeholder, labels, icons }: SpotlightSearchProps) {
  const l = { ...spotlightSearchLabels, ...labels };
  const ic = useMemo(() => ({ ...spotlightSearchIcons, ...icons }), [icons]);
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const all = labels?.all ?? spotlightSearchLabels.all;
  const [cat, setCat] = useState<string>(all);
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>(readRecent);
  useModalLayer(panelRef, () => onOpenChange(false));

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = items.filter((i) => cat === all || i.category === cat);
    if (term) {
      list = list
        .filter((i) => `${i.title} ${i.subtitle ?? ""} ${i.keywords ?? ""}`.toLowerCase().includes(term))
        .sort((a, b) => Number(!a.title.toLowerCase().startsWith(term)) - Number(!b.title.toLowerCase().startsWith(term)));
    } else {
      const ids = recent.filter((r) => list.some((i) => i.id === r));
      list = [...ids.map((r) => list.find((i) => i.id === r)!), ...list.filter((i) => !ids.includes(i.id))].slice(0, 8);
    }
    return list.slice(0, 40);
  }, [items, q, cat, recent, all]);

  const [seen, setSeen] = useState({ q, cat });
  if (seen.q !== q || seen.cat !== cat) {
    setSeen({ q, cat });
    setActive(0);
  }
  useEffect(() => {
    listRef.current?.querySelector(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const pick = (it: SpotlightItem) => {
    const next = [it.id, ...recent.filter((r) => r !== it.id)].slice(0, 5);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch { /* ignore */ }
    onPick(it);
    onOpenChange(false);
  };

  const tabs = [l.all, ...categories];
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && results[active]) { e.preventDefault(); pick(results[active]); }
    else if (e.key === "Tab" && !e.altKey) {
      e.preventDefault();
      const i = tabs.indexOf(cat);
      setCat(tabs[(i + (e.shiftKey ? -1 : 1) + tabs.length) % tabs.length]);
    }
  };

  const current = results[active];
  const showingRecent = !q.trim() && recent.length > 0;


  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center p-3 pt-[10vh] sm:p-6 sm:pt-[12vh]">
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-scrim"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={fade}
        onClick={() => onOpenChange(false)}
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={l.dialog}
        initial={{ opacity: 0, scale: 0.97, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0, transition: springSoft }}
        exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.14, ease: easeOut } }}
        className="relative flex max-h-[min(36rem,80vh)] w-full max-w-3xl flex-col overflow-hidden rounded-sheet bg-surface shadow-float"
      >
        <div className="flex items-center gap-3 px-4">
          <span className="grid shrink-0 text-muted [&>svg]:size-5" aria-hidden>{ic.search}</span>
          <input
            data-autofocus
            role="combobox"
            aria-expanded
            aria-controls={`${id}-list`}
            aria-activedescendant={current ? `${id}-${active}` : undefined}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder={placeholder ?? l.placeholder}
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
          />
          {q && (
            <button type="button" aria-label={l.clear} onClick={() => setQ("")} className="grid size-7 place-items-center rounded-full text-muted hover:bg-raised hover:text-ink [&>svg]:size-4">
              {ic.clear}
            </button>
          )}
        </div>
        <div role="tablist" aria-label="Categories" className="flex gap-1 overflow-x-auto px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((t) => {
            const on = t === cat;
            return (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={on}
                tabIndex={-1}
                onClick={() => setCat(t)}
                className={cn("relative h-7 shrink-0 rounded-full px-3 text-[13px] transition-[color] duration-0 [transition-delay:80ms]", on ? "text-btn-primary-ink" : "text-muted hover:text-ink")}
              >
                <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-0 rounded-full bg-btn-primary" />
                <span className="relative z-[1]">{t}</span>
              </button>
            );
          })}
        </div>

        <div className="grid min-h-0 flex-1 bg-raised/50 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div ref={listRef} id={`${id}-list`} role="listbox" aria-label={l.results} className="min-h-0 overflow-y-auto p-2">
            {showingRecent && <p className="flex items-center gap-1.5 px-2.5 pb-1 pt-1.5 text-xs text-muted"><span className="grid [&>svg]:size-3.5" aria-hidden>{ic.recent}</span> {l.recent}</p>}
            {results.length === 0 && <p className="px-3 py-10 text-center text-sm text-muted">{l.noResults(q)}</p>}
            {results.map((it, i) => {
              const head = !showingRecent && it.category !== (i ? results[i - 1].category : "") ? it.category : null;
              const on = i === active;
              return (
                <div key={it.id}>
                  {head && <p className="px-2.5 pb-1 pt-2.5 text-xs text-muted">{head}</p>}
                  <div
                    id={`${id}-${i}`}
                    data-i={i}
                    role="option"
                    aria-selected={on}
                    onPointerMove={() => !on && setActive(i)}
                    onClick={() => pick(it)}
                    className="relative flex cursor-default items-center gap-3 rounded-[8px] px-2.5 py-2"
                  >
                    <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-0 rounded-[8px] bg-elevated" />
                    {it.icon && <span className="relative z-[1] grid size-8 shrink-0 place-items-center rounded-control bg-elevated text-muted [&>svg]:size-4">{it.icon}</span>}
                    <span className="relative z-[1] min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink"><Highlight text={it.title} query={q} /></span>
                      {it.subtitle && <span className="block truncate text-xs text-muted">{it.subtitle}</span>}
                    </span>
                    <span className={cn("relative z-[1] grid shrink-0 text-muted transition-opacity duration-150 [&>svg]:size-3.5", on ? "opacity-100" : "opacity-0")} aria-hidden>{ic.enter}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="hidden min-h-0 overflow-y-auto p-4 sm:grid [&>*]:[grid-area:1/1]" aria-live="polite">
            <AnimatePresence initial={false}>
              {current && (
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.18, delay: 0.04 } }}
                  exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  className="min-w-0"
                >
                  {current.preview}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center gap-4 px-4 py-2.5 text-xs text-muted">
          <span>{l.hintMove}</span>
          <span>{l.hintCategories}</span>
          <span>{l.hintOpen}</span>
          <span className="ml-auto">{l.hintClose}</span>
        </div>
      </motion.div>
    </div>
  );
}
