import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { CornerDownLeft, Search } from "lucide-react";
import { cn } from "../../cn";
import { fade, springSoft } from "../../motion";

export type CommandItem = {
  id: string;
  label: string;
  group?: string;
  /** Extra words that should match, e.g. synonyms. */
  keywords?: string;
  hint?: ReactNode;
  icon?: ReactNode;
  onSelect: () => void;
};

/** Text used by CommandPalette. Pass a partial via `labels` to translate or reword. */
export interface CommandPaletteLabels {
  /** aria-label of the dialog. */
  dialog: string;
  /** Default input placeholder. */
  placeholder: string;
  /** Default empty-state text. */
  empty: string;
  /** Text of the key hint beside the input. */
  escape: string;
}
export const commandPaletteLabels: CommandPaletteLabels = {
  dialog: "Command palette",
  placeholder: "Search…",
  empty: "Nothing matches that.",
  escape: "Esc",
};

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandItem[];
  placeholder?: string;
  emptyText?: string;
  /** A key that opens and closes the palette with ⌘ (Mac) or Ctrl held, anywhere on the page, e.g. "k". Off when left out. */
  shortcut?: string;
  /** Override any UI text. Merged over `commandPaletteLabels`. */
  labels?: Partial<CommandPaletteLabels>;
  /** Replace any built-in icon. Merged over `commandPaletteIcons`. */
  icons?: Partial<CommandPaletteIcons>;
};

/** Icons used by CommandPalette. Pass a partial via `icons` to swap any of them. */
export interface CommandPaletteIcons {
  /** Beside the input. */
  search: ReactNode;
  /** Enter hint on the active row. */
  enter: ReactNode;
}
export const commandPaletteIcons: CommandPaletteIcons = { search: <Search />, enter: <CornerDownLeft /> };

/** Open with ⌘K / Ctrl+K anywhere on the page. Pass `key = ""` to turn it off. */
export function useCommandShortcut(onOpen: () => void, key = "k") {
  useEffect(() => {
    if (!key) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpen, key]);
}

function score(item: CommandItem, q: string) {
  if (!q) return 1;
  const label = item.label.toLowerCase();
  if (label.startsWith(q)) return 3;
  if (label.includes(q)) return 2;
  if ((item.group + " " + (item.keywords ?? "")).toLowerCase().includes(q)) return 1;
  return 0;
}

function Highlight({ text, q }: { text: string; q: string }) {
  const i = q ? text.toLowerCase().indexOf(q) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className="font-semibold text-ink">{text.slice(i, i + q.length)}</span>
      {text.slice(i + q.length)}
    </>
  );
}

/** A searchable command menu in a dialog. Always controlled: you decide when it is `open`; set `shortcut` to open it from the keyboard. */
export function CommandPalette({ open, onOpenChange, items, placeholder, emptyText, shortcut, labels, icons }: CommandPaletteProps) {
  const openRef = useRef(open);
  const changeRef = useRef(onOpenChange);
  useLayoutEffect(() => { openRef.current = open; changeRef.current = onOpenChange; });
  const toggleOpen = useCallback(() => changeRef.current(!openRef.current), []);
  useCommandShortcut(toggleOpen, shortcut ?? "");
  const l = { ...commandPaletteLabels, ...labels };
  const ic = useMemo(() => ({ ...commandPaletteIcons, ...icons }), [icons]);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const restore = useRef<HTMLElement | null>(null);
  const listId = useId();
  const q = query.trim().toLowerCase();

  const results = useMemo(
    () => items.map((it) => ({ it, s: score(it, q) })).filter((r) => r.s > 0).sort((a, b) => b.s - a.s).map((r) => r.it),
    [items, q],
  );
  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const r of results) {
      const g = r.group ?? "";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(r);
    }
    return [...map.entries()];
  }, [results]);
  const flat = groups.flatMap(([, g]) => g);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery("");
      setIndex(0);
    }
  }

  useEffect(() => {
    if (open) {
      restore.current = document.activeElement as HTMLElement;
      requestAnimationFrame(() => input.current?.focus());
      const w = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${w}px`;
      return () => {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        restore.current?.focus?.();
      };
    }
  }, [open]);

  const [seenQ, setSeenQ] = useState(q);
  if (q !== seenQ) {
    setSeenQ(q);
    setIndex(0);
  }

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.scrollIntoView({ block: "nearest" });
  }, [index]);

  const choose = (it?: CommandItem) => {
    if (!it) return;
    onOpenChange(false);
    // Let the palette leave before the action runs, so both animations stay smooth.
    window.setTimeout(it.onSelect, 120);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIndex((i) => Math.min(flat.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIndex((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); choose(flat[index]); }
    else if (e.key === "Escape") { e.preventDefault(); onOpenChange(false); }
  };

  let n = -1;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]" onKeyDown={onKeyDown}>
          <motion.div
            className="absolute inset-0 bg-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={l.dialog}
            className="relative flex max-h-[min(560px,70vh)] w-full max-w-[600px] flex-col overflow-hidden bg-surface shadow-float"
            style={{ borderRadius: 16 }}
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: springSoft }}
            exit={{ opacity: 0, scale: 0.98, y: -4, transition: { duration: 0.15 } }}
          >
            <div className="flex items-center gap-3 px-4">
              <span className="grid shrink-0 text-muted [&>svg]:size-[18px]" aria-hidden>{ic.search}</span>
              <input
                ref={input}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder ?? l.placeholder}
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={flat[index] ? `${listId}-${flat[index].id}` : undefined}
                className="h-14 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-faint"
              />
              <kbd className="hidden shrink-0 rounded-md bg-raised px-1.5 py-0.5 text-xs text-muted sm:block">{l.escape}</kbd>
            </div>
            <div ref={list} id={listId} role="listbox" className="overflow-y-auto overscroll-contain px-2 pb-2">
              {flat.length === 0 && <p className="px-3 py-10 text-center text-muted">{emptyText ?? l.empty}</p>}
              {groups.map(([g, its]) => (
                <div key={g} role="group" aria-label={g || undefined} className="pb-1">
                  {g && <div className="px-3 pb-1 pt-2 text-xs text-muted">{g}</div>}
                  {its.map((it) => {
                    n += 1;
                    const i = n;
                    const on = i === index;
                    return (
                      <div
                        key={it.id}
                        id={`${listId}-${it.id}`}
                        role="option"
                        aria-selected={on}
                        data-index={i}
                        onPointerMove={() => index !== i && setIndex(i)}
                        onClick={() => choose(it)}
                        className={cn("relative flex h-11 cursor-pointer items-center gap-3 px-3 text-[14px]", on ? "text-ink" : "text-muted")}
                      >
                        <motion.div aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-0 bg-raised" style={{ borderRadius: 10 }} />
                        {it.icon && <span className="relative z-[1] inline-flex shrink-0 [&>svg]:size-4">{it.icon}</span>}
                        <span className="relative z-[1] min-w-0 flex-1 truncate"><Highlight text={it.label} q={q} /></span>
                        {it.hint && <span className="relative z-[1] shrink-0 text-xs text-muted">{it.hint}</span>}
                        {on && <span className="relative z-[1] grid shrink-0 text-muted [&>svg]:size-3.5" aria-hidden>{ic.enter}</span>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
