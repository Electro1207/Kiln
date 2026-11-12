import { useEffect, useId, useState, type MouseEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../cn";
import { easeOut, spring, fade } from "../../motion";

export type NavLink = { label: string; href: string };

/** Text used by Navbar. Pass a partial via `labels` to translate or reword. */
export interface NavbarLabels {
  /** aria-label of the menu button when the menu is open. */
  closeMenu: string;
  /** aria-label of the menu button when the menu is closed. */
  openMenu: string;
}
export const navbarLabels: NavbarLabels = { closeMenu: "Close menu", openMenu: "Open menu" };

export type NavbarProps = {
  brand: ReactNode;
  links: NavLink[];
  /** The one action on the right, usually a Button. */
  action?: ReactNode;
  /** Small controls that stay in the bar at every width, beside the menu button on a phone (a theme switch, a search button). */
  utility?: ReactNode;
  /** Href of the current page. */
  current?: string;
  onNavigate?: (href: string) => void;
  /** Keep the phone menu inside the bar's own box (for previews) instead of covering the screen. */
  contained?: boolean;
  /** Override any UI text. Merged over `navbarLabels`. */
  labels?: Partial<NavbarLabels>;
  className?: string;
};

/** Menu button whose two lines turn into a cross. */
export function MenuToggle({ open, onClick, controls, labels }: { open: boolean; onClick: () => void; controls?: string; labels?: Partial<NavbarLabels> }) {
  const l = { ...navbarLabels, ...labels };
  return (
    <button
      type="button"
      aria-label={open ? l.closeMenu : l.openMenu}
      aria-expanded={open}
      aria-controls={controls}
      onClick={onClick}
      className="relative grid size-10 place-items-center rounded-control transition-colors hover:bg-raised"
    >
      <motion.span
        initial={false}
        animate={open ? { y: 0, rotate: 45 } : { y: -4, rotate: 0 }}
        transition={spring}
        className="absolute h-[1.5px] w-[18px] rounded-full bg-ink"
      />
      <motion.span
        initial={false}
        animate={open ? { y: 0, rotate: -45 } : { y: 4, rotate: 0 }}
        transition={spring}
        className="absolute h-[1.5px] w-[18px] rounded-full bg-ink"
      />
    </button>
  );
}

/** Wordmark, a few links and one action. Below 640px of its own width the links fold into a menu. */
export function Navbar({ brand, links, action, utility, current, onNavigate, contained, labels, className }: NavbarProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    if (!open || contained) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, contained]);

  const go = (href: string) => (e: MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(href);
    }
    setOpen(false);
  };

  return (
    <header className={cn("@container relative w-full bg-surface", className)}>
      <div className="flex h-16 items-center gap-6 px-4 @2xl:px-6">
        <div className="flex shrink-0 items-center">{brand}</div>

        <nav aria-label="Main" className="hidden flex-1 @2xl:block">
          <ul className="flex items-center gap-1" onPointerLeave={() => setHover(null)}>
            {links.map((l) => {
              const on = l.href === current;
              return (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={go(l.href)}
                    onPointerEnter={() => setHover(l.href)}
                    onFocus={() => setHover(l.href)}
                    onBlur={() => setHover(null)}
                    aria-current={on ? "page" : undefined}
                    className={cn("relative block rounded-control px-3 py-2 text-sm transition-colors duration-200", on ? "text-ink" : "text-muted hover:text-ink")}
                  >
                    <motion.span aria-hidden initial={false} animate={{ opacity: hover === l.href ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-0 bg-raised" style={{ borderRadius: 8 }} />
                    <span className={cn("relative z-[1]", on && "font-medium")}>{l.label}</span>
                    <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-ink" />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden @md:block">{action}</div>
          {utility}
          <div className="@2xl:hidden">
            <MenuToggle open={open} onClick={() => setOpen((o) => !o)} controls={`${id}-menu`} labels={labels} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id={`${id}-menu`}
            key="menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, transition: spring }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.18, ease: easeOut } }}
            className={cn(
              "z-50 bg-surface px-4 pb-6 pt-2 @2xl:hidden",
              contained ? "absolute inset-x-0 top-16 rounded-b-card shadow-float" : "fixed inset-x-0 bottom-0 top-16 overflow-y-auto",
            )}
          >
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } } }}
              className="flex flex-col"
            >
              {links.map((l) => (
                <motion.li
                  key={l.href}
                  variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: spring } }}
                >
                  <a
                    href={l.href}
                    onClick={go(l.href)}
                    aria-current={l.href === current ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between py-3 text-2xl tracking-[-0.02em] transition-colors",
                      l.href === current ? "font-medium text-ink" : "text-muted hover:text-ink",
                    )}
                  >
                    {l.label}
                    {l.href === current && <span className="size-2 rounded-full bg-accent" aria-hidden />}
                  </a>
                </motion.li>
              ))}
              {action && (
                <motion.li variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: spring } }} className="pt-4 @md:hidden">
                  {action}
                </motion.li>
              )}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
