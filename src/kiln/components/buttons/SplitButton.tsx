import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../cn";
import { popVariants, springSnappy } from "../../motion";

/** Text used by SplitButton. Pass a partial via `labels` to translate or reword. */
export interface SplitButtonLabels {
  /** aria-label of the menu button. */
  moreActions: string;
}
export const splitButtonLabels: SplitButtonLabels = { moreActions: "More actions" };

export type SplitAction = { label: string; description?: string; icon?: ReactNode; onSelect: () => void };

/** A main action with a menu of related ones beside it. */
export function SplitButton({ label, onClick, actions, className, labels }: {
  label: ReactNode;
  onClick: () => void;
  actions: SplitAction[];
  className?: string;
  /** Override any UI text. Merged over `splitButtonLabels`. */
  labels?: Partial<SplitButtonLabels>;
}) {
  const l = { ...splitButtonLabels, ...labels };
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);
  useEffect(() => { if (open) items.current[active]?.focus(); }, [open, active]);

  const close = () => { setOpen(false); trigger.current?.focus(); };

  return (
    <div ref={root} className={cn("relative inline-flex", className)}>
      <motion.button type="button" onClick={onClick} whileTap={{ scale: 0.97 }} transition={springSnappy}
        className="h-10 rounded-l-control bg-btn-primary px-4 text-sm font-medium text-btn-primary-ink transition-colors duration-200 hover:bg-btn-primary-hover">
        {label}
      </motion.button>
      <motion.button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={l.moreActions}
        onClick={() => { setActive(0); setOpen((o) => !o); }}
        onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setActive(0); setOpen(true); } }}
        whileTap={{ scale: 0.94 }}
        transition={springSnappy}
        className="grid h-10 w-10 place-items-center rounded-r-control border-l border-btn-primary-ink/25 bg-btn-primary text-btn-primary-ink transition-colors duration-200 hover:bg-btn-primary-hover"
      >
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={springSnappy} className="grid"><ChevronDown className="size-4" /></motion.span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            variants={popVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ transformOrigin: "top right" }}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % actions.length); }
              if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + actions.length) % actions.length); }
              if (e.key === "Tab") setOpen(false);
            }}
            className="absolute right-0 top-full z-30 mt-2 w-64 rounded-card border border-line bg-surface p-1.5 shadow-float"
          >
            {actions.map((a, i) => (
              <button
                key={a.label}
                ref={(el) => { items.current[i] = el; }}
                role="menuitem"
                type="button"
                tabIndex={i === active ? 0 : -1}
                onMouseEnter={() => setActive(i)}
                onClick={() => { a.onSelect(); close(); }}
                className="flex w-full items-start gap-3 rounded-control px-2.5 py-2 text-left outline-none transition-colors duration-150 hover:bg-raised focus-visible:bg-raised"
              >
                {a.icon && <span className="mt-0.5 text-muted [&_svg]:size-4">{a.icon}</span>}
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">{a.label}</span>
                  {a.description && <span className="block text-[13px] text-muted">{a.description}</span>}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
