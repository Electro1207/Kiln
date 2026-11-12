import { useId, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../cn";
import { useControllable } from "../../controllable";
import { easeOut, springSnappy, springSoft } from "../../motion";

/** Icons used by Accordion. Pass a partial via `icons` to swap any of them. */
export interface AccordionIcons {
  /** The chevron on each row; it turns over when the row opens. */
  expand: ReactNode;
}
export const accordionIcons: AccordionIcons = { expand: <ChevronDown /> };

export type AccordionItem = { id: string; title: string; content: ReactNode; disabled?: boolean };

export type AccordionProps = {
  items: AccordionItem[];
  /** single: opening one closes the others. */
  type?: "single" | "multiple";
  /** Ids open at first, when uncontrolled. */
  defaultOpen?: string[];
  /** Controlled list of open ids. */
  value?: string[];
  onChange?: (open: string[]) => void;
  /** lines: rows split by a rule. cards: each row its own tinted panel. */
  variant?: "lines" | "cards";
  className?: string;
  /** Replace any built-in icon. Merged over `accordionIcons`. */
  icons?: Partial<AccordionIcons>;
};

/** Rows that open to show more. Uncontrolled by default; pass `value` and `onChange` to control which are open. */
export function Accordion({ items, type = "single", defaultOpen = [], value, onChange, variant = "lines", className, icons }: AccordionProps) {
  const id = useId();
  const ic = { ...accordionIcons, ...icons };
  const [open, setOpen] = useControllable<string[]>(value, defaultOpen, onChange);

  const toggle = (itemId: string) =>
    setOpen((cur) =>
      cur.includes(itemId) ? cur.filter((x) => x !== itemId) : type === "single" ? [itemId] : [...cur, itemId],
    );

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const triggers = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("[data-acc-trigger]:not(:disabled)"));
    const at = triggers.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    let next = -1;
    if (e.key === "ArrowDown") next = (at + 1) % triggers.length;
    else if (e.key === "ArrowUp") next = (at - 1 + triggers.length) % triggers.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = triggers.length - 1;
    if (next < 0) return;
    e.preventDefault();
    triggers[next].focus();
  };

  return (
    <div onKeyDown={onKey} className={cn("w-full", variant === "cards" ? "flex flex-col gap-2" : "", className)}>
      {items.map((it) => {
        const isOpen = open.includes(it.id);
        return (
          <div
            key={it.id}
            className={cn(
              variant === "lines" ? "border-b border-line" : "rounded-card bg-surface px-4",
            )}
          >
            <h3 className="m-0">
              <button
                type="button"
                data-acc-trigger
                id={`${id}-t-${it.id}`}
                aria-expanded={isOpen}
                aria-controls={`${id}-p-${it.id}`}
                disabled={it.disabled}
                onClick={() => toggle(it.id)}
                className="group flex w-full items-center gap-4 py-4 text-left text-[15px] font-medium text-ink disabled:opacity-40"
              >
                <span className="flex-1">{it.title}</span>
                <motion.span
                  initial={false}
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={springSnappy}
                  className="grid size-7 shrink-0 place-items-center rounded-full text-muted transition-colors group-hover:bg-active group-hover:text-ink [&>svg]:size-4"
                >
                  {ic.expand}
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="panel"
                  id={`${id}-p-${it.id}`}
                  role="region"
                  aria-labelledby={`${id}-t-${it.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1, transition: { height: springSoft, opacity: { duration: 0.25, ease: easeOut, delay: 0.05 } } }}
                  exit={{ height: 0, opacity: 0, transition: { height: springSoft, opacity: { duration: 0.15, ease: easeOut } } }}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={{ y: -6 }}
                    animate={{ y: 0 }}
                    exit={{ y: -6 }}
                    transition={springSoft}
                    className="max-w-prose pb-5 pr-11 text-sm leading-relaxed text-ink"
                  >
                    {it.content}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
