import { useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "../../cn";
import { fade, springFirm } from "../../motion";
import { Drawer } from "../overlays/Drawer";

export type ShellNavItem = { id: string; label: string; icon: ReactNode; badge?: number };
export type ShellNavSection = { label?: string; items: ShellNavItem[] };

/** Text used by AppShell. Pass a partial via `labels` to translate or reword. */
export interface AppShellLabels {
  /** aria-label of the navigation landmark. */
  main: string;
  /** aria-label of the sidebar. */
  sidebar: string;
  /** aria-label of the phone menu button. */
  openMenu: string;
  /** aria-label of the collapse button. */
  collapseSidebar: string;
  /** aria-label of the expand button. */
  expandSidebar: string;
  /** Accessible name of the phone drawer. */
  menu: string;
}
export const appShellLabels: AppShellLabels = {
  main: "Main",
  sidebar: "Sidebar",
  openMenu: "Open menu",
  collapseSidebar: "Collapse sidebar",
  expandSidebar: "Expand sidebar",
  menu: "Menu",
};

export type AppShellProps = {
  /** Mark and name, shown at the top of the sidebar. `collapsed` is true in the icon rail. */
  brand: (collapsed: boolean) => ReactNode;
  nav: ShellNavSection[];
  value: string;
  onNavigate: (id: string) => void;
  /** The top bar's contents (search, actions, account). */
  topBar?: ReactNode;
  /** Pinned to the bottom of the sidebar (account, settings). */
  footer?: (collapsed: boolean) => ReactNode;
  children: ReactNode;
  /** Height of the shell. Use "100dvh" for a full page; a number for a framed preview. */
  height?: number | string;
  className?: string;
  /** Override any UI text. Merged over `appShellLabels`. */
  labels?: Partial<AppShellLabels>;
};

const FULL = 240;
const RAIL = 64;

/**
 * Sidebar application shell: a tinted frame holds the sidebar and the top bar,
 * and the page sits on a sheet. Collapsing never animates a width: the layout
 * switches at once and the sheet slides from where it was (transform only),
 * so the content never reflows mid-animation. Below 768px of its own width the
 * sidebar moves into a drawer behind a menu button.
 */
export function AppShell({ brand, nav, value, onNavigate, topBar, footer, children, height = 640, className, labels: labelsProp }: AppShellProps) {
  const l = { ...appShellLabels, ...labelsProp };
  const [collapsed, setCollapsed] = useState(false);
  const [labels, setLabels] = useState(true);
  /** Rail-width hit areas: only once the collapse has landed, so nothing visibly squeezes. */
  const [narrow, setNarrow] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const sheetX = useMotionValue(0);
  const busy = useRef(false);

  const collapse = () => {
    if (busy.current) return;
    busy.current = true;
    setLabels(false);
    setCollapsed(true);
    // The sheet is now laid out at the rail; start it where it was and slide it home.
    sheetX.set(FULL - RAIL);
    animate(sheetX, 0, {
      ...springFirm,
      onComplete: () => {
        setNarrow(true);
        busy.current = false;
      },
    });
  };
  const expand = () => {
    if (busy.current) return;
    busy.current = true;
    setNarrow(false);
    setLabels(true);
    // Slide the sheet aside to uncover the labels, then commit the wider sidebar.
    animate(sheetX, FULL - RAIL, {
      ...springFirm,
      onComplete: () => {
        setCollapsed(false);
        sheetX.set(0);
        busy.current = false;
      },
    });
  };

  const navList = (rail: boolean, onPick?: () => void) => (
    <nav aria-label={l.main} className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto">
      {nav.map((s, si) => (
        <div key={si} className="flex flex-col gap-0.5">
          {s.label && (
            <motion.span
              className="truncate px-3 pb-1 text-xs text-muted"
              initial={false}
              animate={{ opacity: rail ? 0 : 1 }}
              transition={fade}
              aria-hidden={rail || undefined}
            >
              {s.label}
            </motion.span>
          )}
          {s.items.map((it) => {
            const on = it.id === value;
            return (
              <button
                key={it.id}
                type="button"
                title={rail ? it.label : undefined}
                aria-label={rail ? it.label : undefined}
                aria-current={on ? "page" : undefined}
                onClick={() => {
                  onNavigate(it.id);
                  onPick?.();
                }}
                className={cn(
                  "relative flex h-9 w-full items-center gap-3 rounded-control px-3 text-left text-sm transition-colors duration-200",
                  on ? "font-medium text-ink" : "text-muted hover:bg-raised hover:text-ink",
                )}
              >
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-control bg-active"
                  initial={false}
                  animate={{ opacity: on ? 1 : 0 }}
                  transition={fade}
                />
                <span className="relative z-[1] inline-flex shrink-0 [&>svg]:size-[18px]">
                  {it.icon}
                  {it.badge != null && (
                    <motion.span
                      aria-hidden
                      className="absolute -right-1 -top-0.5 size-2 rounded-full bg-accent ring-2 ring-ground"
                      initial={false}
                      animate={{ opacity: rail ? 1 : 0 }}
                      transition={fade}
                    />
                  )}
                </span>
                <motion.span
                  className="relative z-[1] flex min-w-0 flex-1 items-center gap-2"
                  initial={false}
                  animate={{ opacity: rail ? 0 : 1 }}
                  transition={rail ? { duration: 0.12 } : { ...fade, delay: 0.08 }}
                >
                  <span className="min-w-0 flex-1 truncate">{it.label}</span>
                  {it.badge != null && (
                    <span className="tabular rounded-full bg-raised px-1.5 text-[11px] font-medium leading-[18px] text-ink">{it.badge}</span>
                  )}
                </motion.span>
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <div className={cn("@container relative w-full overflow-hidden bg-ground", className)} style={{ height }}>
      <div className="flex h-full">
        {/* Sidebar: always laid out at full width, sitting behind the sheet. */}
        <aside
          className="absolute inset-y-0 left-0 hidden flex-col gap-4 p-3 @3xl:flex"
          style={{ width: FULL }}
          aria-label={l.sidebar}
        >
          <div className="flex h-9 items-center gap-2">
            <div className="min-w-0 flex-1 overflow-hidden px-1">{brand(!labels)}</div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col" style={{ width: narrow ? RAIL - 24 : undefined }}>
            {navList(!labels)}
          </div>
          {footer && <div className="shrink-0">{footer(!labels)}</div>}
        </aside>

        {/* Top bar and sheet: offset by the sidebar's width, slid by transform while it changes. */}
        <motion.div
          className={cn("relative z-[1] flex min-w-0 flex-1 flex-col", collapsed ? "@3xl:ml-16" : "@3xl:ml-60")}
          style={{ x: sheetX }}
        >
          <header className="flex h-14 shrink-0 items-center gap-2 px-3 @3xl:px-2">
            <button
              type="button"
              aria-label={l.openMenu}
              onClick={() => setDrawer(true)}
              className="grid size-9 place-items-center rounded-control text-ink transition-colors duration-200 hover:bg-raised @3xl:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0 @3xl:hidden">{brand(false)}</div>
            <button
              type="button"
              aria-label={labels ? l.collapseSidebar : l.expandSidebar}
              aria-expanded={labels}
              onClick={labels ? collapse : expand}
              className="hidden size-9 place-items-center rounded-control text-muted transition-colors duration-200 hover:bg-raised hover:text-ink @3xl:grid [&>*]:[grid-area:1/1]"
            >
              <motion.span className="grid" initial={false} animate={{ opacity: labels ? 1 : 0 }} transition={fade}>
                <PanelLeftClose className="size-[18px]" />
              </motion.span>
              <motion.span className="grid" initial={false} animate={{ opacity: labels ? 0 : 1 }} transition={fade}>
                <PanelLeftOpen className="size-[18px]" />
              </motion.span>
            </button>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2">{topBar}</div>
          </header>
          <main className="mx-0 mb-0 min-h-0 flex-1 overflow-y-auto rounded-t-sheet border border-b-0 border-line bg-surface @3xl:mb-2 @3xl:mr-2 @3xl:rounded-sheet @3xl:border-b">
            {children}
          </main>
        </motion.div>
      </div>

      <Drawer open={drawer} onOpenChange={setDrawer} side="left" width={288} label={l.menu} title={brand(false)}>
        <div className="flex h-full flex-col gap-4">
          {navList(false, () => setDrawer(false))}
          {footer && <div className="shrink-0">{footer(false)}</div>}
        </div>
      </Drawer>
    </div>
  );
}
