import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, X } from "lucide-react";
import { cn } from "../../cn";
import { useControllable, type Size } from "../../controllable";
import { spring, springSoft } from "../../motion";
import { AnchoredLayer, RowHighlight, optionClass } from "../shared/Anchored";
import { Highlight } from "./Combobox";

/** Icons used by TagInput. Pass a partial via `icons` to replace them. */
export interface TagInputIcons {
  /** Remove button on a tag. */
  remove: ReactNode;
  /** Plus beside the "create" suggestion. */
  create: ReactNode;
}
export const tagInputIcons: TagInputIcons = { remove: <X />, create: <Plus /> };

/** Text used by TagInput. Pass a partial via `labels` to translate or reword. */
export interface TagInputLabels {
  /** Placeholder when empty and the `placeholder` prop is not given. */
  placeholder: string;
  /** Placeholder once `max` is reached: "Up to 5". */
  upTo: (max: number) => string;
  /** aria-label of a chip's remove button. */
  remove: (tag: string) => string;
  /** The word before a new tag in the suggestions: "Create". */
  create: string;
  /** Wraps the new tag after `create`: “tag”. */
  quote: (tag: string) => string;
  /** Counter under the box when `max` is set: "2 of 5". */
  count: (n: number, max: number) => string;
}
export const tagInputLabels: TagInputLabels = {
  placeholder: "Add a tag",
  upTo: (max) => `Up to ${max}`,
  remove: (tag) => `Remove ${tag}`,
  create: "Create",
  quote: (tag) => `“${tag}”`,
  count: (n, max) => `${n} of ${max}`,
};

export type TagInputProps = {
  /** Controlled tags. Leave out and use `defaultValue` to let the field keep its own. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  /** Suggestions offered while typing. */
  suggestions?: string[];
  /** Allow tags that are not in the suggestions. Default true. */
  allowCustom?: boolean;
  max?: number;
  label?: string;
  placeholder?: string;
  /** Minimum height of the box. Defaults to md. */
  size?: Size;
  /** Override any UI text. Merged over `tagInputLabels`. */
  labels?: Partial<TagInputLabels>;
  /** Replace any built-in icon. Merged over `tagInputIcons`. */
  icons?: Partial<TagInputIcons>;
  className?: string;
};

const boxSizes: Record<Size, string> = { sm: "min-h-8", md: "min-h-10", lg: "min-h-12" };
const chipSizes: Record<Size, string> = { sm: "h-5 text-xs", md: "h-7 text-[13px]", lg: "h-8 text-sm" };

/** Chips in a text box, with suggestions. Controlled with `value` + `onChange`, or uncontrolled with `defaultValue`. */
export function TagInput({
  value: valueProp,
  defaultValue = [],
  onChange: onChangeProp,
  suggestions = [],
  allowCustom = true,
  max,
  label,
  placeholder,
  size = "md",
  labels,
  icons,
  className,
}: TagInputProps) {
  const l = { ...tagInputLabels, ...labels };
  const ic = useMemo(() => ({ ...tagInputIcons, ...icons }), [icons]);
  const [value, onChange] = useControllable(valueProp, defaultValue, onChangeProp);
  const id = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [, setOpenCount] = useState(0);
  const [active, setActive] = useState(0);
  const [armed, setArmed] = useState(false);
  const full = max != null && value.length >= max;

  const matches = useMemo(() => {
    const q = text.trim().toLowerCase();
    return suggestions.filter((s) => !value.includes(s) && (!q || s.toLowerCase().includes(q))).slice(0, 8);
  }, [suggestions, value, text]);

  const canCreate = allowCustom && text.trim() && !value.some((v) => v.toLowerCase() === text.trim().toLowerCase()) &&
    !matches.some((m) => m.toLowerCase() === text.trim().toLowerCase());
  const rows = [...matches, ...(canCreate ? [`__create__${text.trim()}`] : [])];

  const add = (tag: string) => {
    const t = tag.trim();
    if (!t || full || value.includes(t)) return;
    onChange([...value, t]);
    setText("");
    setActive(0);
  };
  const remove = (tag: string) => onChange(value.filter((v) => v !== tag));

  const show = () => {
    if (!open) setOpenCount((c) => c + 1);
    setOpen(true);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !text && value.length) {
      e.preventDefault();
      if (armed) {
        remove(value[value.length - 1]);
        setArmed(false);
      } else setArmed(true);
      return;
    }
    setArmed(false);
    if (e.key === "ArrowDown") { e.preventDefault(); show(); setActive((a) => Math.min(a + 1, rows.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const row = open ? rows[active] : undefined;
      if (row) add(row.startsWith("__create__") ? row.slice(10) : row);
      else if (allowCustom) add(text);
    }
  };

  return (
    <div className={cn("k-fill flex min-w-0 flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={`${id}-input`} className="text-[13px] font-medium text-ink">
          {label}
        </label>
      )}
      <div
        ref={boxRef}
        onClick={() => inputRef.current?.focus()}
        className={cn(
          boxSizes[size],
          "flex flex-wrap items-center gap-1.5 rounded-control border border-line-strong bg-surface px-1.5 py-1.5",
          "transition-[border-color] duration-200 ease-out-soft hover:border-faint focus-within:border-accent",
        )}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {value.map((tag, i) => {
            const marked = armed && i === value.length - 1;
            return (
              <motion.span
                key={tag}
                layout="position"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.14 } }}
                transition={spring}
                className={cn(
                  "inline-flex items-center gap-1 rounded-[6px] pl-2.5 pr-1 transition-colors duration-200",
                  chipSizes[size],
                  marked ? "bg-negative-soft text-negative" : "bg-accent-soft text-ink",
                )}
              >
                {tag}
                <button
                  type="button"
                  aria-label={l.remove(tag)}
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(tag);
                  }}
                  className="grid size-5 place-items-center rounded-[4px] text-muted transition-colors hover:bg-surface/70 hover:text-ink [&>svg]:size-3"
                >
                  {ic.remove}
                </button>
              </motion.span>
            );
          })}
          <motion.input
            layout="position"
            transition={spring}
            key="input"
            ref={inputRef}
            id={`${id}-input`}
            role="combobox"
            aria-expanded={open && rows.length > 0}
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            autoComplete="off"
            disabled={full}
            value={text}
            placeholder={full ? l.upTo(max) : value.length ? "" : (placeholder ?? l.placeholder)}
            onChange={(e) => {
              setText(e.target.value);
              setActive(0);
              setArmed(false);
              show();
            }}
            onFocus={show}
            onBlur={() => setArmed(false)}
            onKeyDown={onKey}
            className="h-7 min-w-24 flex-1 bg-transparent px-1.5 text-sm text-ink outline-none placeholder:text-faint"
          />
        </AnimatePresence>
      </div>

      <AnchoredLayer
        open={open && rows.length > 0 && !full}
        onClose={() => setOpen(false)}
        anchor={boxRef}
        matchWidth
        restoreFocus={false}
        id={`${id}-list`}
        role="listbox"
        className="max-h-64 overflow-y-auto"
      >
        {rows.map((r, i) => {
          const create = r.startsWith("__create__");
          const labelText = create ? r.slice(10) : r;
          return (
            <div
              key={r}
              role="option"
              aria-selected={active === i}
              onPointerMove={() => setActive(i)}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => add(labelText)}
              className={optionClass}
            >
              <RowHighlight on={active === i} />
              {create ? (
                <span className="flex items-center gap-2 text-muted">
                  <span className="inline-grid place-items-center [&>svg]:size-4" aria-hidden>{ic.create}</span> {l.create} <span className="text-ink">{l.quote(labelText)}</span>
                </span>
              ) : (
                <span className="truncate">
                  <Highlight text={labelText} query={text} />
                </span>
              )}
            </div>
          );
        })}
      </AnchoredLayer>
      {max != null && (
        <motion.span layout="position" transition={springSoft} className="text-xs text-muted tabular">
          {l.count(value.length, max)}
        </motion.span>
      )}
    </div>
  );
}
