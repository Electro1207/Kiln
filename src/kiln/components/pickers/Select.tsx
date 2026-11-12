import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../cn";
import { springSnappy } from "../../motion";
import { useControllable, type Size } from "../../controllable";
import { AnchoredLayer, RowHighlight, SwapText, optionClass } from "../shared/Anchored";

export type SelectOption = { value: string; label: string; hint?: string; icon?: ReactNode; disabled?: boolean };

const triggerSizes: Record<Size, string> = {
  sm: "k-ctl-sm px-2.5",
  md: "k-ctl-md px-3",
  lg: "k-ctl-lg px-4",
};

/** Text used by Select. Pass a partial via `labels` to translate or reword. */
export interface SelectLabels {
  /** Trigger text when nothing is chosen and the `placeholder` prop is not given. */
  placeholder: string;
}
export const selectLabels: SelectLabels = { placeholder: "Choose…" };

export type SelectProps = {
  options: SelectOption[];
  /** Controlled value (`null` for nothing chosen). Leave out and use `defaultValue` to let it keep its own. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string) => void;
  /** Controlled open state of the list. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  /** Visible label. Without one, pass `aria-label`. */
  label?: string;
  "aria-label"?: string;
  size?: Size;
  disabled?: boolean;
  /** Root (label + trigger). Set a width here, e.g. `w-[240px]`; the default fills its container. */
  className?: string;
  /** The trigger button only. */
  triggerClassName?: string;
  /** Override any UI text. Merged over `selectLabels`. */
  labels?: Partial<SelectLabels>;
};

/** A single choice from a list, with keyboard navigation and typeahead. */
export function Select({
  options, value: valueProp, defaultValue = null, onChange: onChangeProp, open: openProp, defaultOpen = false, onOpenChange,
  placeholder, label, "aria-label": ariaLabel, size = "md", disabled, className, triggerClassName, labels,
}: SelectProps) {
  const l = { ...selectLabels, ...labels };
  const [value, setValue] = useControllable<string | null>(valueProp, defaultValue, onChangeProp as (v: string | null) => void);
  const onChange = (v: string) => setValue(v);
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const [, setOpenCount] = useState(0);
  const [active, setActive] = useState(-1);
  const typed = useRef({ text: "", at: 0 });
  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = options[selectedIndex];

  const show = () => {
    if (disabled) return;
    setActive(selectedIndex >= 0 ? selectedIndex : firstEnabled(options, 0, 1));
    setOpenCount((c) => c + 1);
    setOpen(true);
  };
  const close = () => setOpen(false);

  const choose = (i: number) => {
    const o = options[i];
    if (!o || o.disabled) return;
    onChange(o.value);
    close();
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (open) requestAnimationFrame(() => listRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const typeahead = (key: string) => {
    const now = Date.now();
    typed.current.text = now - typed.current.at > 600 ? key : typed.current.text + key;
    typed.current.at = now;
    const q = typed.current.text.toLowerCase();
    const i = options.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(q));
    return i;
  };

  const onTriggerKey = (e: KeyboardEvent) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      show();
    } else if (e.key.length === 1) {
      const i = typeahead(e.key);
      if (i >= 0) onChange(options[i].value);
    }
  };

  const onListKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => firstEnabled(options, a + 1, 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => firstEnabled(options, a - 1, -1)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(firstEnabled(options, 0, 1)); }
    else if (e.key === "End") { e.preventDefault(); setActive(firstEnabled(options, options.length - 1, -1)); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(active); }
    else if (e.key === "Tab") close();
    else if (e.key.length === 1) {
      const i = typeahead(e.key);
      if (i >= 0) setActive(i);
    }
  };

  return (
    <div className={cn("k-fill flex min-w-0 flex-col gap-1.5", className)}>
      {label && (
        <span id={`${id}-label`} className="text-[13px] font-medium text-ink">
          {label}
        </span>
      )}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-labelledby={label ? `${id}-label ${id}-value` : undefined}
        aria-label={label ? undefined : ariaLabel}
        onClick={() => (open ? close() : show())}
        onKeyDown={onTriggerKey}
        className={cn(
          "flex w-full items-center gap-2 rounded-control border border-line-strong bg-surface text-left",
          triggerSizes[size],
          "transition-[border-color,background-color] duration-200 ease-out-soft hover:border-faint",
          open && "border-accent",
          "disabled:opacity-50",
          triggerClassName,
        )}
      >
        {selected?.icon && <span className="inline-flex shrink-0 text-muted [&>svg]:size-4">{selected.icon}</span>}
        <span id={`${id}-value`} className="min-w-0 flex-1">
          <SwapText value={selected?.value ?? "placeholder"} className={cn(!selected && "text-muted")}>
            {selected?.label ?? placeholder ?? l.placeholder}
          </SwapText>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={springSnappy} className="inline-flex text-muted">
          <ChevronDown className="size-4" />
        </motion.span>
      </button>

      <AnchoredLayer
        open={open}
        onClose={close}
        anchor={triggerRef}
        matchWidth
        layerRef={listRef}
        id={`${id}-list`}
        role="listbox"
        aria-labelledby={label ? `${id}-label` : undefined}
        tabIndex={-1}
        aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
        onKeyDown={onListKey}
        className="max-h-72 overflow-y-auto"
      >
        {options.map((o, i) => (
          <div
            key={o.value}
            data-index={i}
            role="option"
            id={`${id}-opt-${i}`}
            aria-selected={o.value === value}
            aria-disabled={o.disabled || undefined}
            onPointerMove={() => !o.disabled && setActive(i)}
            onClick={() => choose(i)}
            className={cn(optionClass, o.disabled && "opacity-45")}
          >
            <RowHighlight on={active === i} />
            {o.icon && <span className="inline-flex text-muted [&>svg]:size-4">{o.icon}</span>}
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate">{o.label}</span>
              {o.hint && <span className="truncate text-xs text-muted">{o.hint}</span>}
            </span>
            <span className="inline-flex size-4 text-accent">
              <AnimatePresence initial={false}>
                {o.value === value && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={springSnappy}
                    className="inline-flex"
                  >
                    <Check className="size-4" strokeWidth={2.5} />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </div>
        ))}
      </AnchoredLayer>
    </div>
  );
}

export function firstEnabled<T extends { disabled?: boolean }>(items: T[], from: number, dir: 1 | -1): number {
  const n = items.length;
  if (!n) return -1;
  for (let k = 0; k < n; k++) {
    const i = (((from + k * dir) % n) + n) % n;
    if (!items[i].disabled) return i;
  }
  return -1;
}
