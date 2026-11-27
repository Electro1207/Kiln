import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "../../cn";
import { fade, springSnappy } from "../../motion";
import { useControllable, type Size } from "../../controllable";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";
import { AnchoredLayer, RowHighlight, SwapText, optionClass } from "../shared/Anchored";

export type CascaderOption = { value: string; label: string; children?: CascaderOption[]; disabled?: boolean };

const triggerSizes: Record<Size, string> = {
  sm: "k-ctl-sm px-2.5",
  md: "k-ctl-md px-3",
  lg: "k-ctl-lg px-4",
};

/** Text used by Cascader. Pass a partial via `labels` to translate or reword. */
export interface CascaderLabels {
  /** Trigger text when nothing is chosen and the `placeholder` prop is not given. */
  placeholder: string;
  /** Shown in an empty column. */
  empty: string;
}
export const cascaderLabels: CascaderLabels = { placeholder: "Choose…", empty: "Nothing here" };

/** Icons used by Cascader. Pass a partial via `icons` to replace them. */
export interface CascaderIcons {
  /** Chevron on the trigger; it turns over while open. */
  chevron: ReactNode;
  /** Arrow at the end of a row that opens another column. */
  branch: ReactNode;
  /** Tick on a row that is part of the chosen path. */
  check: ReactNode;
}
export const cascaderIcons: CascaderIcons = { chevron: <ChevronDown />, branch: <ChevronRight />, check: <Check /> };

export type CascaderProps = {
  /** The tree. A row with `children` opens another column; a row without is a choice. */
  options: CascaderOption[];
  /** Controlled path of ids, from the first column to the last (`null` for nothing chosen). */
  value?: string[] | null;
  defaultValue?: string[] | null;
  onChange?: (path: string[]) => void;
  /** Controlled open state of the panel. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  /** Visible label. Without one, pass `aria-label`. */
  label?: string;
  "aria-label"?: string;
  size?: Size;
  disabled?: boolean;
  /** Between the names of the chosen path on the trigger. Default " / ". */
  separator?: string;
  /** Root (label + trigger). Set a width here, e.g. `w-[280px]`. */
  className?: string;
  /** The trigger button only. */
  triggerClassName?: string;
  /** Override any UI text. Merged over `cascaderLabels`. */
  labels?: Partial<CascaderLabels>;
  /** Replace any built-in icon. Merged over `cascaderIcons`. */
  icons?: Partial<CascaderIcons>;
  /** Turn accessibility features on for this component only. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

/** Walk `path` down the tree; returns the node at each step, or stops at the first id that is missing. */
function nodesAlong(options: CascaderOption[], path: string[]): CascaderOption[] {
  const out: CascaderOption[] = [];
  let level = options;
  for (const id of path) {
    const n = level.find((o) => o.value === id);
    if (!n) break;
    out.push(n);
    level = n.children ?? [];
  }
  return out;
}
const firstEnabled = (list: CascaderOption[]) => list.find((o) => !o.disabled);

/** Pick one leaf of a tree in side-by-side columns: country, then region, then city. */
export const Cascader = forwardRef<HTMLButtonElement, CascaderProps>(function Cascader(
  { options, value: valueProp, defaultValue = null, onChange, open: openProp, defaultOpen = false, onOpenChange, placeholder, label, "aria-label": ariaLabel, size = "md", disabled, separator = " / ", className, triggerClassName, labels, icons, accessibilityFeatures },
  ref,
) {
  const l = { ...cascaderLabels, ...labels };
  const ic = useMemo(() => ({ ...cascaderIcons, ...icons }), [icons]);
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const setRefs = (el: HTMLButtonElement | null) => {
    triggerRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };
  const [value, setValue] = useControllable<string[] | null>(valueProp, defaultValue, onChange as (v: string[] | null) => void);
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const chosen = useMemo(() => nodesAlong(options, value ?? []), [options, value]);
  const complete = chosen.length > 0 && !chosen[chosen.length - 1].children?.length;
  const text = complete ? chosen.map((n) => n.label).join(separator) : "";
  const typed = useRef({ text: "", at: 0 });

  /** Ids from the first column to the focused row. */
  const [active, setActive] = useState<string[]>([]);

  const show = () => {
    if (disabled) return;
    setActive(complete ? chosen.map((n) => n.value) : firstEnabled(options) ? [firstEnabled(options)!.value] : []);
    setOpen(true);
  };
  const close = () => setOpen(false);

  const trail = nodesAlong(options, active);
  /** One column per level that has something to show: the first, plus the children of each focused branch. */
  const columns: { parent: string; rows: CascaderOption[] }[] = [{ parent: "root", rows: options }];
  trail.forEach((n) => { if (n.children?.length) columns.push({ parent: n.value, rows: n.children }); });
  const focusedDepth = active.length - 1;

  const choose = (path: string[]) => {
    setValue(path);
    close();
    triggerRef.current?.focus();
  };

  const enter = (path: string[]) => {
    const n = nodesAlong(options, path).pop();
    if (!n || n.disabled) return;
    if (n.children?.length) {
      const prefer = (value ?? [])[path.length];
      const into = n.children.find((c) => c.value === prefer && !c.disabled) ?? firstEnabled(n.children);
      setActive(into ? [...path, into.value] : path);
    } else choose(path);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const col = columns[focusedDepth];
    const rows = col?.rows ?? [];
    const at = rows.findIndex((r) => r.value === active[focusedDepth]);
    const to = (i: number) => active.length ? setActive([...active.slice(0, focusedDepth), rows[i].value]) : setActive([rows[i].value]);
    const stepFrom = (from: number, dir: 1 | -1) => {
      for (let k = 1; k <= rows.length; k++) {
        const i = (((from + k * dir) % rows.length) + rows.length) % rows.length;
        if (!rows[i].disabled) return i;
      }
      return from;
    };
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); if (rows.length) to(stepFrom(at, 1)); break;
      case "ArrowUp": e.preventDefault(); if (rows.length) to(stepFrom(at < 0 ? 0 : at, -1)); break;
      case "Home": e.preventDefault(); if (rows.length) to(stepFrom(-1, 1)); break;
      case "End": e.preventDefault(); if (rows.length) to(stepFrom(0, -1)); break;
      case "ArrowRight": {
        e.preventDefault();
        const n = trail[focusedDepth];
        if (n?.children?.length && !n.disabled) enter(active);
        break;
      }
      case "ArrowLeft": e.preventDefault(); if (active.length > 1) setActive(active.slice(0, -1)); break;
      case "Enter": case " ": e.preventDefault(); if (active.length) enter(active); break;
      case "Tab": close(); break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key) && !e.ctrlKey && !e.metaKey) {
          const now = Date.now();
          typed.current.text = now - typed.current.at > 600 ? e.key : typed.current.text + e.key;
          typed.current.at = now;
          const q = typed.current.text.toLowerCase();
          const i = rows.findIndex((r) => !r.disabled && r.label.toLowerCase().startsWith(q));
          if (i >= 0) to(i);
        }
    }
  };

  useEffect(() => {
    if (open) requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
  }, [open]);

  // Keep the focused row and the newest column in view.
  const activeId = active.length ? `${id}-${encodeURIComponent(active.join(">"))}` : undefined;
  useEffect(() => {
    if (!open || !activeId) return;
    const panel = panelRef.current;
    const el = document.getElementById(activeId);
    if (!panel || !el) return;
    const col = el.parentElement as HTMLElement;
    if (el.offsetTop < col.scrollTop) col.scrollTop = el.offsetTop - 4;
    else if (el.offsetTop + el.offsetHeight > col.scrollTop + col.clientHeight) col.scrollTop = el.offsetTop + el.offsetHeight - col.clientHeight + 4;
    const pr = panel.getBoundingClientRect(), er = col.getBoundingClientRect();
    if (er.right > pr.right) panel.scrollLeft += er.right - pr.right;
    else if (er.left < pr.left) panel.scrollLeft -= pr.left - er.left;
  }, [activeId, open, columns.length]);

  const hover = useCallback((path: string[]) => setActive(path), []);

  return (
    <div {...rootProps} className={cn("k-fill flex min-w-0 flex-col gap-1.5", className)} style={rootProps.style}>
      {label && <span id={`${id}-label`} className="text-[0.8125rem] font-medium text-ink">{label}</span>}
      <button
        ref={setRefs}
        type="button"
        disabled={disabled}
        aria-haspopup="tree"
        aria-expanded={open}
        aria-controls={open ? `${id}-panel` : undefined}
        aria-labelledby={label ? `${id}-label ${id}-value` : undefined}
        aria-label={label ? undefined : ariaLabel}
        onClick={() => (open ? close() : show())}
        onKeyDown={(e) => { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); show(); } }}
        className={cn(
          "flex w-full items-center gap-2 rounded-control border border-line-strong bg-surface text-left",
          triggerSizes[size],
          "transition-[border-color,background-color] duration-200 ease-out-soft hover:border-faint",
          open && "border-accent",
          "disabled:opacity-50",
          triggerClassName,
        )}
      >
        <span id={`${id}-value`} className="min-w-0 flex-1">
          <SwapText value={complete ? chosen.map((n) => n.value).join(">") : "placeholder"} className={cn(!complete && "text-muted")}>
            {complete ? text : placeholder ?? l.placeholder}
          </SwapText>
        </span>
        <motion.span animate={{ rotate: open && !(a11y.calm || a11y.reduceMotion) ? 180 : 0 }} transition={springSnappy} className="inline-flex text-muted [&>svg]:size-4">{ic.chevron}</motion.span>
      </button>

      <AnchoredLayer
        open={open}
        onClose={close}
        anchor={triggerRef}
        layerRef={panelRef}
        id={`${id}-panel`}
        role="tree"
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-label={label ? undefined : ariaLabel}
        tabIndex={-1}
        aria-activedescendant={activeId}
        onKeyDown={onKey}
        className="flex max-w-[calc(100vw-16px)] overflow-x-auto p-0"
      >
        {columns.map((c, depth) => (
          <motion.div
            key={c.parent}
            role="group"
            initial={depth === 0 ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={fade}
            className={cn("max-h-72 min-w-40 shrink-0 overflow-y-auto p-1", depth > 0 && "border-l border-line")}
          >
            {c.rows.length === 0 && <p className="px-2.5 py-2 text-sm text-muted">{l.empty}</p>}
            {c.rows.map((o) => {
              const path = [...active.slice(0, depth), o.value];
              const branch = !!o.children?.length;
              const here = active[depth] === o.value;
              const onPath = !!value && value.length > depth && value.slice(0, depth + 1).join(">") === path.join(">");
              return (
                <div
                  key={o.value}
                  id={`${id}-${encodeURIComponent(path.join(">"))}`}
                  role="treeitem"
                  aria-level={depth + 1}
                  aria-selected={onPath}
                  aria-expanded={branch ? here && columns.length > depth + 1 : undefined}
                  aria-disabled={o.disabled || undefined}
                  onPointerMove={() => !o.disabled && !(here && active.length === depth + 1) && hover(path)}
                  onClick={() => !o.disabled && enter(path)}
                  className={cn(optionClass, o.disabled && "opacity-45", onPath && "font-medium")}
                >
                  <RowHighlight on={here} />
                  <span className="min-w-0 flex-1 truncate">{o.label}</span>
                  {branch ? (
                    <span className="grid text-muted [&>svg]:size-4" aria-hidden>{ic.branch}</span>
                  ) : (
                    <motion.span aria-hidden initial={false} animate={{ opacity: onPath ? 1 : 0 }} transition={fade} className="grid text-accent [&>svg]:size-4 [&>svg]:[stroke-width:2.5]">{ic.check}</motion.span>
                  )}
                </div>
              );
            })}
          </motion.div>
        ))}
      </AnchoredLayer>
    </div>
  );
});
