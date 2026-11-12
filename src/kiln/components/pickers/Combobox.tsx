import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { cn } from "../../cn";
import { useControllable, type Size } from "../../controllable";
import { inputSizes } from "../shared/Field";
import { springSnappy, springSoft } from "../../motion";
import { AnchoredLayer, RowHighlight, optionClass } from "../shared/Anchored";

export type ComboboxOption = { value: string; label: string; hint?: string };

/** Text used by Combobox. Pass a partial via `labels` to translate or reword. */
export interface ComboboxLabels {
  /** Input placeholder when the `placeholder` prop is not given. */
  placeholder: string;
  /** Empty-list text when the `emptyText` prop is not given. */
  empty: (query: string) => string;
  /** aria-label of the clear button. */
  clear: string;
}
export const comboboxLabels: ComboboxLabels = {
  placeholder: "Search…",
  empty: (q) => `Nothing matches “${q}”`,
  clear: "Clear",
};

export type ComboboxProps = {
  options: ComboboxOption[];
  /** Controlled value (`null` for nothing). Leave out and use `defaultValue` to let it keep its own. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  label?: string;
  placeholder?: string;
  /** Shown when nothing matches. */
  emptyText?: string | ((query: string) => string);
  /** Height and text size. Defaults to md. */
  size?: Size;
  /** Override any UI text. Merged over `comboboxLabels`. */
  labels?: Partial<ComboboxLabels>;
  className?: string;
};

/** Bold the part of `text` that matches `query`. */
export function Highlight({ text, query }: { text: string; query: string }): ReactNode {
  const q = query.trim();
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[3px] bg-accent-soft font-medium text-ink">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

/** A text box that filters a list as you type and picks one option. */
export function Combobox({ options, value: valueProp, defaultValue = null, onChange: onChangeProp, label, placeholder, emptyText, size = "md", labels, className }: ComboboxProps) {
  const l = { ...comboboxLabels, ...labels };
  const [value, onChange] = useControllable<string | null>(valueProp, defaultValue, onChangeProp);
  const id = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = options.find((o) => o.value === value) ?? null;
  const [query, setQuery] = useState(selected?.label ?? "");
  const [open, setOpen] = useState(false);
  const [, setOpenCount] = useState(0);
  const [active, setActive] = useState(0);
  const [typing, setTyping] = useState(false);

  const results = useMemo(() => {
    const q = typing ? query.trim().toLowerCase() : "";
    if (!q) return options;
    return options
      .filter((o) => o.label.toLowerCase().includes(q) || o.hint?.toLowerCase().includes(q))
      .sort((a, b) => Number(!a.label.toLowerCase().startsWith(q)) - Number(!b.label.toLowerCase().startsWith(q)));
  }, [options, query, typing]);

  const show = () => {
    if (!open) setOpenCount((c) => c + 1);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    setTyping(false);
    setQuery(selected?.label ?? "");
  };
  const choose = (o: ComboboxOption) => {
    onChange(o.value);
    setQuery(o.label);
    setTyping(false);
    setOpen(false);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); show(); setActive((a) => Math.min(a + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && open && results[active]) { e.preventDefault(); choose(results[active]); }
    else if (e.key === "Tab") close();
  };

  return (
    <div className={cn("k-fill flex min-w-0 flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={`${id}-input`} className="text-[13px] font-medium text-ink">
          {label}
        </label>
      )}
      <div
        ref={wrapRef}
        className={cn(
          "flex items-center gap-2 rounded-control border border-line-strong bg-surface",
          inputSizes[size],
          "transition-[border-color] duration-200 ease-out-soft hover:border-faint focus-within:border-accent",
        )}
      >
        <Search className="size-4 shrink-0 text-muted" aria-hidden />
        <input
          ref={inputRef}
          id={`${id}-input`}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={open && results[active] ? `${id}-opt-${results[active].value}` : undefined}
          autoComplete="off"
          value={query}
          placeholder={placeholder ?? l.placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setTyping(true);
            setActive(0);
            show();
          }}
          onFocus={(e) => e.target.select()}
          onClick={show}
          onKeyDown={onKey}
          className="h-full min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-faint"
        />
        <AnimatePresence initial={false}>
          {query && (
            <motion.button
              type="button"
              aria-label={l.clear}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={springSnappy}
              onClick={() => {
                setQuery("");
                setTyping(true);
                onChange(null);
                inputRef.current?.focus();
                show();
              }}
              className="grid size-6 place-items-center rounded-full text-muted hover:bg-active hover:text-ink"
            >
              <X className="size-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnchoredLayer
        open={open}
        onClose={close}
        anchor={wrapRef}
        matchWidth
        restoreFocus={false}
        id={`${id}-list`}
        role="listbox"
        className="max-h-72 overflow-y-auto overflow-x-hidden"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {results.map((o, i) => (
            <motion.div
              layout="position"
              key={o.value}
              id={`${id}-opt-${o.value}`}
              role="option"
              aria-selected={o.value === value}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={springSoft}
              onPointerMove={() => setActive(i)}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => choose(o)}
              className={optionClass}
            >
              <RowHighlight on={active === i} />
              <span className="min-w-0 flex-1 truncate">
                <Highlight text={o.label} query={typing ? query : ""} />
              </span>
              {o.hint && <span className="shrink-0 text-xs text-muted">{o.hint}</span>}
            </motion.div>
          ))}
          {results.length === 0 && (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-2.5 py-3 text-sm text-muted"
            >
              {typeof emptyText === "function" ? emptyText(query) : (emptyText ?? l.empty(query))}
            </motion.p>
          )}
        </AnimatePresence>
      </AnchoredLayer>
    </div>
  );
}
