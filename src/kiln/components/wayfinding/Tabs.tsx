import { useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../cn";
import { fade, spring, springSoft } from "../../motion";
import type { Size } from "../../controllable";

const tabSizes: Record<Size, { underline: string; pill: string; text: string }> = {
  sm: { underline: "h-8 px-0.5", pill: "h-7 px-2.5", text: "text-[13px]" },
  md: { underline: "h-10 px-0.5", pill: "h-8 px-3", text: "text-sm" },
  lg: { underline: "h-12 px-1", pill: "h-10 px-4", text: "text-[15px]" },
};

export type TabItem = { id: string; label: string; content: ReactNode; count?: number; disabled?: boolean };

export type TabsProps = {
  items: TabItem[];
  /** Controlled tab id. Leave out (and optionally pass `defaultValue`) to let the tabs keep their own. */
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  /** underline: a line glides under the active tab. pill: a filled shape glides behind it. */
  variant?: "underline" | "pill";
  /** Accessible name for the tab list. */
  label?: string;
  size?: Size;
  className?: string;
  /** The tab list row only. */
  listClassName?: string;
};

/** Tabs with their panels. The panel area's height follows its content smoothly. */
export function Tabs({ items, value, defaultValue, onChange, variant = "underline", label, size = "md", className, listClassName }: TabsProps) {
  const id = useId();
  const [inner, setInner] = useState(defaultValue ?? items[0]?.id);
  const current = value ?? inner;
  const index = items.findIndex((t) => t.id === current);
  const [seen, setSeen] = useState({ index, from: index });
  if (seen.index !== index) setSeen({ index, from: seen.index });
  const dir = index >= seen.from ? 1 : -1;
  const listRef = useRef<HTMLDivElement>(null);

  const select = (tabId: string) => {
    if (value === undefined) setInner(tabId);
    onChange?.(tabId);
  };

  const onKey = (e: KeyboardEvent) => {
    const enabled = items.filter((t) => !t.disabled);
    const at = enabled.findIndex((t) => t.id === current);
    let next = -1;
    if (e.key === "ArrowRight") next = (at + 1) % enabled.length;
    else if (e.key === "ArrowLeft") next = (at - 1 + enabled.length) % enabled.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = enabled.length - 1;
    if (next < 0) return;
    e.preventDefault();
    select(enabled[next].id);
    listRef.current?.querySelector<HTMLButtonElement>(`[data-tab="${enabled[next].id}"]`)?.focus();
  };

  const panelRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [current]);

  const active = items[index];

  return (
    <div className={cn("k-fill flex min-w-0 flex-col", className)}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        onKeyDown={onKey}
        className={cn(
          "flex max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          variant === "underline" ? "gap-5 border-b border-line" : "w-fit gap-1 rounded-control bg-active p-1",
          listClassName,
        )}
      >
        {items.map((t) => {
          const on = t.id === current;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              data-tab={t.id}
              id={`${id}-tab-${t.id}`}
              aria-selected={on}
              aria-controls={`${id}-panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              disabled={t.disabled}
              onClick={() => select(t.id)}
              className={cn(
                "relative flex shrink-0 items-center gap-1.5 whitespace-nowrap transition-colors duration-200 disabled:opacity-40",
                tabSizes[size].text,
                tabSizes[size][variant],
                on ? "font-medium text-ink" : "text-muted hover:text-ink",
              )}
            >
              {variant === "underline" ? (
                <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-ink" />
              ) : (
                <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-0 bg-elevated" style={{ borderRadius: 6 }} />
              )}
              <span className="relative z-[1]">{t.label}</span>
              {t.count != null && (
                <span className={cn("relative z-[1] rounded-full px-1.5 text-xs tabular transition-colors", on ? "bg-accent-soft text-ink" : "bg-active text-muted")}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <motion.div animate={{ height }} transition={springSoft} className="relative overflow-clip" initial={false}>
        <AnimatePresence mode="popLayout" initial={false} custom={dir}>
          {active && (
            <motion.div
              key={active.id}
              ref={panelRef}
              role="tabpanel"
              id={`${id}-panel-${active.id}`}
              aria-labelledby={`${id}-tab-${active.id}`}
              tabIndex={0}
              custom={dir}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 16 }),
                center: { opacity: 1, x: 0, transition: { x: spring, opacity: { duration: 0.22, delay: 0.1 } } },
                exit: (d: number) => ({ opacity: 0, x: d * -16, transition: { duration: 0.1 } }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full pt-5 outline-none"
            >
              {active.content}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
