import { useId, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade, springSoft } from "../../motion";

export type StackedLink = { id: string; label: string };

/** Text used by StackedLayout. Pass a partial via `labels` to translate or reword. */
export interface StackedLayoutLabels {
  /** aria-label of the navigation landmarks. */
  main: string;
  /** aria-label of the phone menu button while the panel is closed. */
  openMenu: string;
  /** aria-label of the phone menu button while the panel is open. */
  closeMenu: string;
}
export const stackedLayoutLabels: StackedLayoutLabels = { main: "Main", openMenu: "Open menu", closeMenu: "Close menu" };

/** Icons used by StackedLayout. Pass a partial via `icons` to replace any. */
export interface StackedLayoutIcons {
  /** Opens the narrow-width menu. */
  menu: ReactNode;
  /** Closes it again. */
  close: ReactNode;
}
export const stackedLayoutIcons: StackedLayoutIcons = { menu: <Menu />, close: <X /> };

export type StackedLayoutProps = {
  brand: ReactNode;
  links: StackedLink[];
  value: string;
  onNavigate: (id: string) => void;
  /** Right side of the bar: notifications, account. */
  actions?: ReactNode;
  /** Sits under the bar on the ground colour: usually a PageHeading. */
  header?: ReactNode;
  children: ReactNode;
  height?: number | string;
  className?: string;
  /** Override any UI text. Merged over `stackedLayoutLabels`. */
  labels?: Partial<StackedLayoutLabels>;
  /** Replace any built-in icon. Merged over `stackedLayoutIcons`. */
  icons?: Partial<StackedLayoutIcons>;
};

/**
 * Stacked application layout: one top bar, the page heading on the ground, then
 * the content on a sheet. Below 768px of its own width the links fold into a
 * panel under the bar.
 */
export function StackedLayout({ brand, links, value, onNavigate, actions, header, children, height = 640, className, labels, icons }: StackedLayoutProps) {
  const l = { ...stackedLayoutLabels, ...labels };
  const ic = useMemo(() => ({ ...stackedLayoutIcons, ...icons }), [icons]);
  const [open, setOpen] = useState(false);
  const panel = useId();
  return (
    <div className={cn("@container relative flex w-full flex-col overflow-hidden bg-ground", className)} style={{ height }}>
      <header className="relative z-20 shrink-0 bg-ground">
        <div className="flex h-14 items-center gap-6 px-4 @3xl:px-6">
          <div className="shrink-0">{brand}</div>
          <nav aria-label={l.main} className="hidden h-full items-stretch gap-1 @3xl:flex">
            {links.map((l) => {
              const on = l.id === value;
              return (
                <button
                  key={l.id}
                  type="button"
                  aria-current={on ? "page" : undefined}
                  onClick={() => onNavigate(l.id)}
                  className={cn(
                    "relative flex items-center px-3 text-sm transition-colors duration-200",
                    on ? "font-medium text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  <span className="relative z-[1]">{l.label}</span>
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-ink"
                    initial={false}
                    animate={{ opacity: on ? 1 : 0 }}
                    transition={fade}
                  />
                </button>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 @3xl:flex">{actions}</div>
            <button
              type="button"
              aria-label={open ? l.closeMenu : l.openMenu}
              aria-expanded={open}
              aria-controls={panel}
              onClick={() => setOpen((o) => !o)}
              className="grid size-9 place-items-center rounded-control text-ink transition-colors duration-200 hover:bg-raised @3xl:hidden [&>*]:[grid-area:1/1]"
            >
              <motion.span className="grid [&>svg]:size-5" aria-hidden initial={false} animate={{ opacity: open ? 0 : 1, rotate: open ? 45 : 0 }} transition={springSoft}>
                {ic.menu}
              </motion.span>
              <motion.span className="grid [&>svg]:size-5" aria-hidden initial={false} animate={{ opacity: open ? 1 : 0, rotate: open ? 0 : -45 }} transition={springSoft}>
                {ic.close}
              </motion.span>
            </button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              id={panel}
              key="panel"
              className="absolute inset-x-0 top-14 border-b border-line bg-ground px-3 pb-3 shadow-float @3xl:hidden"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.16, ease: easeOut } }}
              transition={springSoft}
            >
              <nav aria-label={l.main} className="flex flex-col gap-0.5">
                {links.map((l) => {
                  const on = l.id === value;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      aria-current={on ? "page" : undefined}
                      onClick={() => {
                        onNavigate(l.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex h-11 items-center rounded-control px-3 text-left text-[15px] transition-colors duration-200",
                        on ? "bg-active font-medium text-ink" : "text-muted hover:bg-raised hover:text-ink",
                      )}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </nav>
              {actions && <div className="mt-3 flex items-center gap-2 border-t border-line px-1 pt-3">{actions}</div>}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {header && <div className="px-4 pb-5 pt-4 @3xl:px-6 @3xl:pt-6">{header}</div>}
        <div className="min-h-full rounded-t-sheet border border-b-0 border-line bg-surface @3xl:mx-2">{children}</div>
      </div>
    </div>
  );
}
