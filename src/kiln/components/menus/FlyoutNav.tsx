import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade, springSnappy, springSoft } from "../../motion";

export type FlyoutLink = { label: string; href: string; description?: string; icon?: ReactNode };
export type FlyoutGroup = { title: string; links: FlyoutLink[] };
export type FlyoutItem =
  | { kind: "link"; label: string; href: string }
  | { kind: "flyout"; label: string; links: FlyoutLink[]; footer?: ReactNode }
  | { kind: "mega"; label: string; groups: FlyoutGroup[]; featured?: ReactNode };

/** Text used by FlyoutNav. Pass a partial via `labels` to translate or reword. */
export interface FlyoutNavLabels {
  /** aria-label of the menu button when the mobile menu is open. */
  closeMenu: string;
  /** aria-label of the menu button when the mobile menu is closed. */
  openMenu: string;
}
export const flyoutNavLabels: FlyoutNavLabels = { closeMenu: "Close menu", openMenu: "Open menu" };

export type FlyoutNavProps = {
  brand: ReactNode;
  items: FlyoutItem[];
  /** The one action on the right. */
  action?: ReactNode;
  onNavigate?: (href: string) => void;
  /** Override any UI text. Merged over `flyoutNavLabels`. */
  labels?: Partial<FlyoutNavLabels>;
  /** Replace any built-in icon. Merged over `flyoutNavIcons`. */
  icons?: Partial<FlyoutNavIcons>;
  className?: string;
};

/** Icons used by FlyoutNav. Pass a partial via `icons` to swap any of them. */
export interface FlyoutNavIcons {
  /** Chevron on a menu trigger; it flips when open. */
  expand: ReactNode;
}
export const flyoutNavIcons: FlyoutNavIcons = { expand: <ChevronDown /> };

const OPEN_DELAY = 90;
const CLOSE_DELAY = 220;

function LinkRow({ link, onNavigate, compact }: { link: FlyoutLink; onNavigate?: (href: string) => void; compact?: boolean }) {
  return (
    <a
      href={link.href}
      role="menuitem"
      onClick={(e) => {
        if (onNavigate) {
          e.preventDefault();
          onNavigate(link.href);
        }
      }}
      className={cn(
        "group/link flex gap-3 rounded-card outline-offset-[-2px] transition-colors duration-200 hover:bg-raised focus-visible:bg-raised",
        compact ? "p-2.5" : "p-3",
      )}
    >
      {link.icon && (
        <span className="grid size-9 shrink-0 place-items-center rounded-control bg-raised text-muted transition-colors duration-200 group-hover/link:bg-surface group-hover/link:text-ink [&>svg]:size-[18px]">
          {link.icon}
        </span>
      )}
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{link.label}</span>
        {link.description && <span className="mt-0.5 block text-[13px] leading-snug text-muted">{link.description}</span>}
      </span>
    </a>
  );
}

/**
 * Marketing navigation with flyout and mega-menu panels. Panels open on hover
 * after a short intent delay, stay open while the pointer crosses the gap, and
 * swap contents in place when you move to a neighbour. Keyboard: Enter, Space or
 * Down opens and enters a panel; Esc closes and returns focus. Under 768px of its
 * own width the bar folds into a menu where each panel is an accordion.
 */
export function FlyoutNav({ brand, items, action, onNavigate, labels, icons, className }: FlyoutNavProps) {
  const l = { ...flyoutNavLabels, ...labels };
  const ic = useMemo(() => ({ ...flyoutNavIcons, ...icons }), [icons]);
  const id = useId();
  const [open, setOpen] = useState<number | null>(null);
  const [mobile, setMobile] = useState(false);
  const [section, setSection] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const barRef = useRef<HTMLElement>(null);
  const triggers = useRef<Record<number, HTMLButtonElement | null>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [panelH, setPanelH] = useState<number | "auto">("auto");

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (open == null || !el) {
      setPanelH("auto");
      return;
    }
    const ro = new ResizeObserver(() => setPanelH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  const schedule = (fn: () => void, ms: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(fn, ms);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (open == null) return;
    const down = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpen(null);
    };
    const key = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const i = open;
      setOpen(null);
      triggers.current[i]?.focus();
    };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  const enterPanel = () => requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("a,button")?.focus());

  const onTriggerKey = (e: KeyboardEvent, i: number) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(i);
      enterPanel();
    }
  };

  const onPanelKey = (e: KeyboardEvent) => {
    const links = Array.from(panelRef.current?.querySelectorAll<HTMLElement>("a[role=menuitem]") ?? []);
    const at = links.indexOf(document.activeElement as HTMLElement);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = links.length;
      links[(at + (e.key === "ArrowDown" ? 1 : -1) + n) % n]?.focus();
    }
  };

  const go = (href: string) => {
    onNavigate?.(href);
    setOpen(null);
    setMobile(false);
  };

  const current = open != null ? items[open] : null;

  return (
    <header
      ref={barRef}
      className={cn("@container relative z-20 w-full bg-surface", className)}
      onPointerLeave={(e) => e.pointerType === "mouse" && schedule(() => setOpen(null), CLOSE_DELAY)}
      onBlur={(e) => {
        if (!barRef.current?.contains(e.relatedTarget as Node)) setOpen(null);
      }}
    >
      <div className="flex h-16 items-center gap-6 px-4 @3xl:px-6">
        <div className="flex shrink-0 items-center">{brand}</div>

        <nav aria-label="Main" className="hidden flex-1 @3xl:block">
          <ul className="flex items-center gap-1">
            {items.map((it, i) =>
              it.kind === "link" ? (
                <li key={it.label}>
                  <a
                    href={it.href}
                    onClick={(e) => {
                      if (onNavigate) {
                        e.preventDefault();
                        go(it.href);
                      }
                    }}
                    onPointerEnter={(e) => e.pointerType === "mouse" && schedule(() => setOpen(null), OPEN_DELAY)}
                    className="block rounded-control px-3 py-2 text-sm text-muted transition-colors hover:bg-raised hover:text-ink"
                  >
                    {it.label}
                  </a>
                </li>
              ) : (
                <li key={it.label}>
                  <button
                    ref={(el) => {
                      triggers.current[i] = el;
                    }}
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={open === i}
                    aria-controls={`${id}-panel`}
                    onPointerEnter={(e) => e.pointerType === "mouse" && schedule(() => setOpen(i), open == null ? OPEN_DELAY : 0)}
                    onClick={() => setOpen((o) => (o === i ? null : i))}
                    onKeyDown={(e) => onTriggerKey(e, i)}
                    className={cn(
                      "flex items-center gap-1 rounded-control px-3 py-2 text-sm transition-colors duration-200",
                      open === i ? "bg-raised text-ink" : "text-muted hover:bg-raised hover:text-ink",
                    )}
                  >
                    {it.label}
                    <motion.span initial={false} animate={{ rotate: open === i ? 180 : 0 }} transition={springSnappy} className="grid [&>svg]:size-3.5">
                      {ic.expand}
                    </motion.span>
                  </button>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden @md:block">{action}</div>
          <button
            type="button"
            aria-label={mobile ? l.closeMenu : l.openMenu}
            aria-expanded={mobile}
            onClick={() => setMobile((m) => !m)}
            className="relative grid size-10 place-items-center rounded-control transition-colors hover:bg-raised @3xl:hidden"
          >
            <motion.span initial={false} animate={mobile ? { y: 0, rotate: 45 } : { y: -4, rotate: 0 }} transition={springSoft} className="absolute h-[1.5px] w-[18px] rounded-full bg-ink" />
            <motion.span initial={false} animate={mobile ? { y: 0, rotate: -45 } : { y: 4, rotate: 0 }} transition={springSoft} className="absolute h-[1.5px] w-[18px] rounded-full bg-ink" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {current && current.kind !== "link" && (
          <motion.div
            key="panel"
            id={`${id}-panel`}
            ref={panelRef}
            role="menu"
            aria-label={current.label}
            onKeyDown={onPanelKey}
            onPointerEnter={() => window.clearTimeout(timer.current)}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0, transition: springSoft }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.14, ease: easeOut } }}
            className="absolute inset-x-0 top-full hidden px-4 pt-2 @3xl:block @3xl:px-6"
          >
            <div className="rounded-sheet bg-surface p-3 shadow-float">
              <motion.div initial={false} animate={{ height: panelH }} transition={springSoft} className="overflow-hidden">
              <div className="grid [&>*]:[grid-area:1/1]">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={open}
                    ref={contentRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { ...fade, delay: 0.06 } }}
                    exit={{ opacity: 0, transition: { duration: 0.08 } }}
                  >
                    {current.kind === "mega" ? (
                      <div className="grid grid-cols-[1fr_1fr_minmax(0,18rem)] gap-2">
                        {current.groups.map((g) => (
                          <div key={g.title} className="min-w-0">
                            <p className="px-3 pb-1 pt-2 text-[13px] font-medium text-muted">{g.title}</p>
                            {g.links.map((l) => (
                              <LinkRow key={l.href} link={l} onNavigate={onNavigate ? go : undefined} />
                            ))}
                          </div>
                        ))}
                        {current.featured && <div className="min-w-0">{current.featured}</div>}
                      </div>
                    ) : (
                      <div className="grid max-w-xl grid-cols-2 gap-1">
                        {current.links.map((l) => (
                          <LinkRow key={l.href} link={l} onNavigate={onNavigate ? go : undefined} />
                        ))}
                        {current.footer && <div className="col-span-2 mt-1 rounded-card bg-raised px-3 py-2.5 text-[13px] text-muted">{current.footer}</div>}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobile && (
          <motion.div
            key="m"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, transition: springSoft }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.16, ease: easeOut } }}
            className="absolute inset-x-0 top-full max-h-[70vh] overflow-y-auto rounded-b-sheet bg-surface px-3 pb-4 shadow-float @3xl:hidden"
          >
            {items.map((it, i) =>
              it.kind === "link" ? (
                <a
                  key={it.label}
                  href={it.href}
                  onClick={(e) => {
                    if (onNavigate) {
                      e.preventDefault();
                      go(it.href);
                    }
                  }}
                  className="flex h-12 items-center rounded-control px-3 text-[15px] text-ink transition-colors hover:bg-raised"
                >
                  {it.label}
                </a>
              ) : (
                <div key={it.label}>
                  <button
                    type="button"
                    aria-expanded={section === i}
                    onClick={() => setSection((s) => (s === i ? null : i))}
                    className="flex h-12 w-full items-center justify-between rounded-control px-3 text-[15px] text-ink transition-colors hover:bg-raised"
                  >
                    {it.label}
                    <motion.span initial={false} animate={{ rotate: section === i ? 180 : 0 }} transition={springSnappy} className="grid text-muted [&>svg]:size-4">
                      {ic.expand}
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {section === i && (
                      <motion.div
                        key="body"
                        role="menu"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ height: springSoft, opacity: fade }}
                        className="overflow-hidden"
                      >
                        <div className="pb-2 pl-2">
                          {(it.kind === "mega" ? it.groups.flatMap((g) => g.links) : it.links).map((l) => (
                            <LinkRow key={l.href} link={l} compact onNavigate={onNavigate ? go : undefined} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ),
            )}
            {action && <div className="px-3 pt-3 @md:hidden">{action}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
