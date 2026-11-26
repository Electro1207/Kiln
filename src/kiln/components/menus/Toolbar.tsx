import { Fragment, forwardRef, useRef, useState, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { springSnappy } from "../../motion";
import { useControllable, type Size } from "../../controllable";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

type ItemBase = { id: string; label: string; icon?: ReactNode; /** Show the label next to the icon. Without an icon the label always shows. */ showLabel?: boolean; disabled?: boolean };

/** A button that does something once per press. */
export type ToolbarButton = ItemBase & { type?: "button"; onClick?: () => void };
/** A button that stays pressed: bold, italic, align left. */
export type ToolbarToggle = ItemBase & { type: "toggle"; pressed?: boolean; defaultPressed?: boolean; onPressedChange?: (pressed: boolean) => void };
export type ToolbarSeparator = { type: "separator" };
/** Items that belong together. Two groups next to each other get a separator between them. */
export type ToolbarGroup = { type: "group"; label?: string; items: (ToolbarButton | ToolbarToggle)[] };
export type ToolbarEntry = ToolbarButton | ToolbarToggle | ToolbarSeparator | ToolbarGroup;

export type ToolbarProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  items: ToolbarEntry[];
  orientation?: "horizontal" | "vertical";
  size?: Size;
  /** Accessible name of the toolbar. Required: there can be several on a page. */
  label: string;
  /** Turn accessibility features on for this component only. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

const sizes: Record<Size, string> = {
  sm: "h-8 min-w-8 px-2 text-[0.8125rem]",
  md: "h-10 min-w-10 px-2.5 text-sm",
  lg: "h-12 min-w-12 px-3 text-[0.9375rem]",
};

type Cell = { entry: ToolbarButton | ToolbarToggle };
const flat = (items: ToolbarEntry[]): Cell[] =>
  items.flatMap((e) => (e.type === "group" ? e.items.map((entry) => ({ entry })) : e.type === "separator" ? [] : [{ entry: e }]));

/**
 * A row (or column) of tool buttons that is one stop in the Tab order: arrow keys move between
 * the tools, Home and End jump to the ends. Items are buttons or toggles; groups are separated.
 */
export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(function Toolbar(
  { items, orientation = "horizontal", size = "md", label, accessibilityFeatures, className, style, onKeyDown, ...rest },
  ref,
) {
  const { rootProps } = useA11yProps(accessibilityFeatures);
  const root = useRef<HTMLDivElement | null>(null);
  const setRef = (el: HTMLDivElement | null) => {
    root.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };
  const cells = flat(items);
  const firstId = cells.find((c) => !c.entry.disabled)?.entry.id;
  const [current, setCurrent] = useState<string | undefined>(undefined);
  const stop = cells.some((c) => c.entry.id === current && !c.entry.disabled) ? current : firstId;
  const vertical = orientation === "vertical";

  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const prev = vertical ? "ArrowUp" : "ArrowLeft";
    const next = vertical ? "ArrowDown" : "ArrowRight";
    if (![prev, next, "Home", "End"].includes(e.key)) return;
    const els = Array.from(root.current?.querySelectorAll<HTMLButtonElement>("[data-tb-item]:not(:disabled)") ?? []);
    const at = els.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0 || !els.length) return;
    e.preventDefault();
    const to = e.key === "Home" ? 0 : e.key === "End" ? els.length - 1 : (at + (e.key === next ? 1 : -1) + els.length) % els.length;
    els[to].focus();
  };

  const render = (entry: ToolbarButton | ToolbarToggle) => (
    <ToolItem key={entry.id} entry={entry} size={size} tabbable={entry.id === stop} onFocusItem={() => setCurrent(entry.id)} />
  );
  const sep = (k: string) => (
    <div key={k} role="separator" aria-orientation={vertical ? "horizontal" : "vertical"} className={cn("shrink-0 bg-line", vertical ? "mx-1 my-1 h-px w-auto" : "mx-1 h-5 w-px self-center")} />
  );

  return (
    <div
      ref={setRef}
      role="toolbar"
      aria-label={label}
      aria-orientation={orientation}
      {...rest}
      {...rootProps}
      onKeyDown={key}
      style={{ ...rootProps.style, ...style }}
      className={cn(
        "inline-flex max-w-full gap-0.5 rounded-card border border-line bg-surface p-1",
        vertical ? "flex-col items-stretch" : "flex-wrap items-center",
        className,
      )}
    >
      {items.map((e, i) => {
        if (e.type === "separator") return sep(`s${i}`);
        if (e.type === "group")
          return (
            <Fragment key={`g${i}`}>
              {i > 0 && items[i - 1].type === "group" && sep(`gs${i}`)}
              <div role="group" aria-label={e.label} className={cn("flex gap-0.5", vertical && "flex-col")}>{e.items.map(render)}</div>
            </Fragment>
          );
        return render(e);
      })}
    </div>
  );
});

function ToolItem({ entry, size, tabbable, onFocusItem }: { entry: ToolbarButton | ToolbarToggle; size: Size; tabbable: boolean; onFocusItem: () => void }) {
  const toggle = entry.type === "toggle";
  const [pressed, setPressed] = useControllable<boolean>(toggle ? entry.pressed : undefined, toggle ? !!entry.defaultPressed : false, toggle ? entry.onPressedChange : undefined);
  const text = entry.showLabel || !entry.icon;
  return (
    <motion.button
      type="button"
      data-tb-item=""
      aria-pressed={toggle ? pressed : undefined}
      aria-label={text ? undefined : entry.label}
      title={text ? undefined : entry.label}
      disabled={entry.disabled}
      tabIndex={tabbable ? 0 : -1}
      onFocus={onFocusItem}
      onClick={() => (toggle ? setPressed(!pressed) : entry.onClick?.())}
      whileTap={{ scale: 0.95 }}
      transition={springSnappy}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control font-medium transition-[background-color,color] duration-200 ease-out-soft disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-4",
        sizes[size],
        toggle && pressed ? "bg-btn-secondary text-btn-secondary-ink" : "text-muted hover:bg-raised hover:text-ink",
      )}
    >
      {entry.icon}
      {text && <span>{entry.label}</span>}
    </motion.button>
  );
}
