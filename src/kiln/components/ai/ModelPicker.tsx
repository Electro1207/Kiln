import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Brain, Check, ChevronDown, Gauge, Zap } from "lucide-react";
import { cn } from "../../cn";
import { springSnappy } from "../../motion";
import { useControllable, type Size } from "../../controllable";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";
import { AnchoredLayer, RowHighlight, SwapText, optionClass } from "../shared/Anchored";

export type ModelSpeed = "fast" | "balanced" | "thorough";

export type ModelOption = {
  /** Unique id; this is the `value`. */
  value: string;
  name: string;
  /** One line on what it is good at. */
  description?: string;
  /** How quick it answers. Shown as a badge with an icon. */
  speed?: ModelSpeed;
  /** Relative price, 1 to 3. Shown as "$", "$$" or "$$$". */
  cost?: 1 | 2 | 3;
  /** Extra badges, e.g. "New" or "Vision". */
  badges?: string[];
  icon?: ReactNode;
  disabled?: boolean;
};

/** Text used by ModelPicker. Pass a partial via `labels` to translate or reword. */
export interface ModelPickerLabels {
  /** Trigger text when nothing is chosen and the `placeholder` prop is not given. */
  placeholder: string;
  /** Badge and spoken text of each speed. */
  speed: Record<ModelSpeed, string>;
  /** Badge text of the cost, given 1 to 3. */
  cost: (n: 1 | 2 | 3) => string;
  /** Spoken form of the cost. */
  costSpoken: (n: 1 | 2 | 3) => string;
}
export const modelPickerLabels: ModelPickerLabels = {
  placeholder: "Choose a model…",
  speed: { fast: "Fast", balanced: "Balanced", thorough: "Thorough" },
  cost: (n) => "$".repeat(n),
  costSpoken: (n) => (n === 1 ? "low cost" : n === 2 ? "medium cost" : "high cost"),
};

/** Icons used by ModelPicker. Pass a partial via `icons` to replace them. */
export interface ModelPickerIcons {
  /** Chevron on the trigger; it turns over while open. */
  chevron: ReactNode;
  /** Tick on the selected option. */
  check: ReactNode;
  /** Speed badge icons. */
  speed: Record<ModelSpeed, ReactNode>;
}
export const modelPickerIcons: ModelPickerIcons = {
  chevron: <ChevronDown />,
  check: <Check />,
  speed: { fast: <Zap />, balanced: <Gauge />, thorough: <Brain /> },
};

export type ModelPickerProps = {
  models: ModelOption[];
  /** Controlled id of the chosen model (`null` for none). Leave out and use `defaultValue` to let it keep its own. */
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
  /** Root (label + trigger). Set a width here, e.g. `w-[280px]`; the default fills its container. */
  className?: string;
  /** The trigger button only. */
  triggerClassName?: string;
  /** Override any UI text. Merged over `modelPickerLabels`. */
  labels?: Partial<ModelPickerLabels>;
  /** Replace any built-in icon. Merged over `modelPickerIcons`. */
  icons?: Partial<ModelPickerIcons>;
  /** Accessibility features to add for this picker only. Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

const triggerSizes: Record<Size, string> = { sm: "k-ctl-sm px-2.5", md: "k-ctl-md px-3", lg: "k-ctl-lg px-4" };

const badge = "inline-flex h-5 items-center gap-1 rounded-full bg-active px-2 text-[0.7188rem] font-medium leading-none text-muted [&>svg]:size-3";

function nextEnabled(items: { disabled?: boolean }[], from: number, dir: 1 | -1) {
  const n = items.length;
  for (let k = 0; k < n; k++) {
    const i = (((from + k * dir) % n) + n) % n;
    if (!items[i].disabled) return i;
  }
  return -1;
}

/** A model chooser: name, a line of description and speed and cost badges on every row. Listbox pattern with typeahead. */
export function ModelPicker({
  models, value: valueProp, defaultValue = null, onChange: onChangeProp, open: openProp, defaultOpen = false, onOpenChange,
  placeholder, label, "aria-label": ariaLabel, size = "md", disabled, className, triggerClassName, labels, icons, accessibilityFeatures,
}: ModelPickerProps) {
  const l = { ...modelPickerLabels, ...labels, speed: { ...modelPickerLabels.speed, ...labels?.speed } };
  const ic = useMemo(() => ({ ...modelPickerIcons, ...icons, speed: { ...modelPickerIcons.speed, ...icons?.speed } }), [icons]);
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const [value, setValue] = useControllable<string | null>(valueProp, defaultValue, onChangeProp as (v: string | null) => void);
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const [active, setActive] = useState(-1);
  const typed = useRef({ text: "", at: 0 });
  const selectedIndex = models.findIndex((m) => m.value === value);
  const selected = models[selectedIndex];

  const show = () => {
    if (disabled) return;
    setActive(selectedIndex >= 0 ? selectedIndex : nextEnabled(models, 0, 1));
    setOpen(true);
  };
  const close = () => setOpen(false);
  const choose = (i: number) => {
    const m = models[i];
    if (!m || m.disabled) return;
    setValue(m.value);
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
    return models.findIndex((m) => !m.disabled && m.name.toLowerCase().startsWith(q));
  };

  const onTriggerKey = (e: KeyboardEvent) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      show();
    } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
      const i = typeahead(e.key);
      if (i >= 0) setValue(models[i].value);
    }
  };
  const onListKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => nextEnabled(models, a + 1, 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => nextEnabled(models, a - 1, -1)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(nextEnabled(models, 0, 1)); }
    else if (e.key === "End") { e.preventDefault(); setActive(nextEnabled(models, models.length - 1, -1)); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(active); }
    else if (e.key === "Tab") close();
    else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
      const i = typeahead(e.key);
      if (i >= 0) setActive(i);
    }
  };

  const spokenExtras = (m: ModelOption) =>
    [m.speed && l.speed[m.speed], m.cost && l.costSpoken(m.cost), ...(m.badges ?? [])].filter(Boolean).join(", ") + ".";

  return (
    <div {...rootProps} className={cn("k-fill flex min-w-0 flex-col gap-1.5", className)} style={rootProps.style}>
      {label && <span id={`${id}-label`} className="text-[0.8125rem] font-medium text-ink">{label}</span>}
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
        {selected?.icon && <span aria-hidden className="inline-flex shrink-0 text-muted [&>svg]:size-4">{selected.icon}</span>}
        <span id={`${id}-value`} className="min-w-0 flex-1">
          <SwapText value={selected?.value ?? "placeholder"} className={cn(!selected && "text-muted")}>
            {selected?.name ?? placeholder ?? l.placeholder}
          </SwapText>
        </span>
        {selected?.speed && (
          <span aria-hidden className={cn(badge, "hidden shrink-0 sm:inline-flex")}>
            {ic.speed[selected.speed]}
            {l.speed[selected.speed]}
          </span>
        )}
        <motion.span aria-hidden animate={{ rotate: open ? 180 : 0 }} transition={springSnappy} className="inline-flex shrink-0 text-muted [&>svg]:size-4">
          {ic.chevron}
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
        aria-label={label ? undefined : ariaLabel}
        tabIndex={-1}
        aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
        onKeyDown={onListKey}
        className="max-h-80 w-max max-w-[min(26rem,calc(100vw-1rem))] overflow-y-auto"
      >
        {models.map((m, i) => (
          <div
            key={m.value}
            data-index={i}
            role="option"
            id={`${id}-opt-${i}`}
            aria-label={m.name}
            aria-selected={m.value === value}
            aria-disabled={m.disabled || undefined}
            aria-describedby={`${id}-desc-${i}`}
            onPointerMove={() => !m.disabled && setActive(i)}
            onClick={() => choose(i)}
            className={cn(optionClass, "items-start py-2.5", m.disabled && "opacity-45", a11y.largeTargets && "min-h-11")}
          >
            <RowHighlight on={active === i} />
            {m.icon && <span aria-hidden className="mt-0.5 inline-flex text-muted [&>svg]:size-4">{m.icon}</span>}
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="truncate font-medium">{m.name}</span>
              {m.description && <span aria-hidden className="text-[0.8125rem] leading-snug text-muted">{m.description}</span>}
              {(m.speed || m.cost || m.badges?.length) && (
                <span aria-hidden className="flex flex-wrap gap-1.5">
                  {m.speed && <span className={badge}>{ic.speed[m.speed]}{l.speed[m.speed]}</span>}
                  {m.cost && <span className={cn(badge, "tabular")}>{l.cost(m.cost)}</span>}
                  {m.badges?.map((b) => <span key={b} className={badge}>{b}</span>)}
                </span>
              )}
              <span id={`${id}-desc-${i}`} className="sr-only">{[m.description, spokenExtras(m)].filter(Boolean).join(" ")}</span>
            </span>
            <span className="mt-0.5 inline-flex size-4 shrink-0 text-accent">
              <AnimatePresence initial={false}>
                {m.value === value && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={springSnappy}
                    className="inline-flex [&>svg]:size-4 [&>svg]:[stroke-width:2.5]"
                  >
                    {ic.check}
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
