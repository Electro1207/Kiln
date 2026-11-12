import { useMemo, useState, type ReactNode } from "react";
import { useControllable } from "../../controllable";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade, springFirm, springSnappy, springSoft } from "../../motion";

export type SidebarItem = { id: string; label: string; icon: ReactNode; badge?: number; children?: { id: string; label: string }[] };
export type SidebarSection = { label?: string; items: SidebarItem[] };

/** Text used by SidebarNav. Pass a partial via `labels` to translate or reword. */
export interface SidebarNavLabels {
  /** aria-label of the collapse button. */
  collapse: string;
  /** aria-label of the expand button. */
  expand: string;
  /** aria-label of a badge dot, given the badge value. */
  badge: (badge: string | number) => string;
}
export const sidebarNavLabels: SidebarNavLabels = { collapse: "Collapse sidebar", expand: "Expand sidebar", badge: (b) => `${b} new` };

export type SidebarNavProps = {
  sections: SidebarSection[];
  /** Active item id; leave out to let the nav keep it. */
  value?: string;
  /** Starting item when uncontrolled. Defaults to the first item. */
  defaultValue?: string;
  onChange?: (id: string) => void;
  /** Shown at the top; receives whether the rail is collapsed. */
  header?: (collapsed: boolean) => ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  /** Override any UI text. Merged over `sidebarNavLabels`. */
  labels?: Partial<SidebarNavLabels>;
  /** Replace any built-in icon. Merged over `sidebarNavIcons`. */
  icons?: Partial<SidebarNavIcons>;
  className?: string;
};

/** Icons used by SidebarNav. Pass a partial via `icons` to swap any of them. */
export interface SidebarNavIcons {
  /** Collapses the rail. */
  collapse: ReactNode;
  /** Opens the collapsed rail. */
  expand: ReactNode;
  /** Chevron on an item with children; it flips when open. */
  chevron: ReactNode;
}
export const sidebarNavIcons: SidebarNavIcons = { collapse: <PanelLeftClose />, expand: <PanelLeftOpen />, chevron: <ChevronDown /> };

/**
 * A side navigation. Each row owns its fill, which fades in when active; the whole bar folds into an icon rail.
 * Controlled with `value` + `onChange`, or uncontrolled with `defaultValue`.
 */
export function SidebarNav({ sections, value: valueProp, defaultValue, onChange: onChangeProp, header, collapsible = true, defaultCollapsed = false, labels, icons, className }: SidebarNavProps) {
  const l = { ...sidebarNavLabels, ...labels };
  const ic = useMemo(() => ({ ...sidebarNavIcons, ...icons }), [icons]);
  const [value, onChange] = useControllable<string>(valueProp, defaultValue ?? sections[0]?.items[0]?.id ?? "", onChangeProp);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [expanded, setExpanded] = useState<string[]>(() =>
    sections.flatMap((s) => s.items).filter((i) => i.children?.some((c) => c.id === value)).map((i) => i.id),
  );

  const label = (text: string, extra?: string) => (
    <AnimatePresence initial={false}>
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0, transition: { ...springSoft, delay: 0.06 } }}
          exit={{ opacity: 0, x: -6, transition: { duration: 0.1, ease: easeOut } }}
          className={cn("relative z-[1] min-w-0 flex-1 truncate text-left", extra)}
        >
          {text}
        </motion.span>
      )}
    </AnimatePresence>
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 248 }}
      transition={springFirm}
      className={cn("flex h-full shrink-0 flex-col overflow-hidden bg-ground p-3", className)}
    >
      <div className="mb-3 flex h-9 items-center gap-2">
        <div className="min-w-0 flex-1 overflow-hidden">{header?.(collapsed)}</div>
        {collapsible && !collapsed && (
          <button
            type="button"
            aria-label={l.collapse}
            onClick={() => setCollapsed(true)}
            className="grid size-8 shrink-0 place-items-center rounded-control text-muted transition-colors hover:bg-active hover:text-ink [&>svg]:size-4"
          >
            {ic.collapse}
          </button>
        )}
      </div>
      {collapsible && collapsed && (
        <button
          type="button"
          aria-label={l.expand}
          onClick={() => setCollapsed(false)}
          className="mb-2 grid size-10 shrink-0 place-items-center rounded-control text-muted transition-colors hover:bg-active hover:text-ink [&>svg]:size-4"
        >
          {ic.expand}
        </button>
      )}

      <nav aria-label="Sidebar" className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overflow-x-hidden">
        {sections.map((s, si) => (
          <div key={si} className="flex flex-col gap-0.5">
            {s.label && (
              <div className="relative h-7 px-3">
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-x-3 top-1 truncate text-xs text-muted">
                      {s.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            )}
            {s.items.map((it) => {
              const childActive = it.children?.some((c) => c.id === value);
              const on = it.id === value || (collapsed && childActive);
              const isOpen = expanded.includes(it.id) && !collapsed;
              return (
                <div key={it.id}>
                  <button
                    type="button"
                    title={collapsed ? it.label : undefined}
                    aria-current={it.id === value ? "page" : undefined}
                    aria-expanded={it.children ? isOpen : undefined}
                    onClick={() => {
                      if (it.children) {
                        if (collapsed) { setCollapsed(false); setExpanded((e) => [...new Set([...e, it.id])]); }
                        else setExpanded((e) => (e.includes(it.id) ? e.filter((x) => x !== it.id) : [...e, it.id]));
                      } else onChange(it.id);
                    }}
                    className={cn(
                      "relative flex h-10 w-full items-center gap-3 rounded-control px-3 text-sm transition-colors duration-200",
                      on ? "font-medium text-ink" : "text-muted hover:bg-raised hover:text-ink",
                    )}
                  >
                    <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-0 bg-active" style={{ borderRadius: 8 }} />
                    <span className="relative z-[1] inline-flex shrink-0 [&>svg]:size-[18px]">
                      {it.icon}
                      <AnimatePresence initial={false}>
                        {it.badge != null && collapsed && (
                          <motion.span
                            key="dot"
                            aria-label={l.badge(it.badge)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={fade}
                            className="absolute -right-1 -top-0.5 size-2 rounded-full bg-btn-primary ring-2 ring-ground"
                          />
                        )}
                      </AnimatePresence>
                    </span>
                    {label(it.label)}
                    <AnimatePresence initial={false}>
                      {it.badge != null && !collapsed && (
                        <motion.span
                          key="count"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1, transition: { ...fade, delay: 0.06 } }}
                          exit={{ opacity: 0, transition: { duration: 0.1 } }}
                          className="relative z-[1] min-w-[18px] rounded-full bg-btn-primary px-1.5 text-center text-[11px] font-medium leading-[18px] text-btn-primary-ink tabular"
                        >
                          {it.badge}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {it.children && !collapsed && (
                      <motion.span initial={false} animate={{ rotate: isOpen ? 180 : 0 }} transition={springSnappy} className="relative z-[1] inline-flex text-faint [&>svg]:size-4">
                        {ic.chevron}
                      </motion.span>
                    )}
                  </button>
                  <AnimatePresence initial={false}>
                    {it.children && isOpen && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={springSoft}
                        className="overflow-hidden"
                      >
                        {it.children.map((c) => (
                          <li key={c.id}>
                            <button
                              type="button"
                              aria-current={c.id === value ? "page" : undefined}
                              onClick={() => onChange(c.id)}
                              className={cn(
                                "relative ml-[21px] flex h-9 w-[calc(100%-21px)] items-center rounded-control pl-5 pr-3 text-[13px] transition-colors",
                                c.id === value ? "font-medium text-ink" : "text-muted hover:text-ink",
                              )}
                            >
                              <span aria-hidden className={cn("absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full transition-colors duration-300", c.id === value ? "bg-ink" : "bg-line")} />
                              <motion.span aria-hidden initial={false} animate={{ opacity: c.id === value ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-y-0 left-2 right-0 bg-active" style={{ borderRadius: 8 }} />
                              <span className="relative z-[1] truncate">{c.label}</span>
                            </button>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ))}
      </nav>
    </motion.aside>
  );
}
