import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "../../cn";
import { spring } from "../../motion";
import { MenuContent } from "../menus/DropdownMenu";

export type Crumb = { label: string; href?: string; onClick?: () => void };

/** Text used by Breadcrumbs. Pass a partial via `labels` to translate or reword. */
export interface BreadcrumbsLabels {
  /** aria-label of the nav landmark. */
  nav: string;
  /** aria-label of the button that opens the folded levels. */
  showMore: (count: number) => string;
  /** aria-label of the folded-levels menu. */
  hiddenLevels: string;
}
/** Icons used by Breadcrumbs. Pass a partial via `icons` to swap any of them. */
export interface BreadcrumbsIcons {
  /** The separator between levels. */
  separator: ReactNode;
  /** The button that opens the folded levels. */
  more: ReactNode;
}
export const breadcrumbsIcons: BreadcrumbsIcons = { separator: <ChevronRight />, more: <MoreHorizontal /> };
export const breadcrumbsLabels: BreadcrumbsLabels = { nav: "Breadcrumb", showMore: (n) => `Show ${n} more`, hiddenLevels: "Hidden levels" };

export type BreadcrumbsProps = {
  items: Crumb[];
  className?: string;
  /** Override any UI text. Merged over `breadcrumbsLabels`. */
  labels?: Partial<BreadcrumbsLabels>;
  /** Replace any built-in icon. Merged over `breadcrumbsIcons`. */
  icons?: Partial<BreadcrumbsIcons>;
};

/** A trail of links. When the trail is wider than its box, the middle folds into a menu. */
export function Breadcrumbs({ items, className, labels, icons }: BreadcrumbsProps) {
  const l = { ...breadcrumbsLabels, ...labels };
  const ic = { ...breadcrumbsIcons, ...icons };
  const boxRef = useRef<HTMLElement>(null);
  const ghostRef = useRef<HTMLOListElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [menu, setMenu] = useState(false);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const ghost = ghostRef.current;
    if (!box || !ghost) return;
    const check = () => setCollapsed(items.length > 3 && ghost.scrollWidth > box.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(box);
    return () => ro.disconnect();
  }, [items]);

  const hidden = collapsed ? items.slice(1, -2) : [];
  const visible: Array<Crumb | "more"> = collapsed ? [items[0], "more", ...items.slice(-2)] : items;

  const link = (c: Crumb, last: boolean) => {
    if (last) return <span aria-current="page" className="truncate font-medium text-ink">{c.label}</span>;
    if (!c.href && !c.onClick) return <span className="truncate text-muted">{c.label}</span>;
    if (!c.href) {
      return (
        <button type="button" onClick={c.onClick} className="truncate rounded-[4px] text-muted transition-colors hover:text-ink">
          {c.label}
        </button>
      );
    }
    return (
      <a
        href={c.href}
        onClick={(e) => {
          if (c.onClick) { e.preventDefault(); c.onClick(); }
        }}
        className="truncate rounded-[4px] text-muted transition-colors hover:text-ink"
      >
        {c.label}
      </a>
    );
  };

  const sep = <span aria-hidden className="grid shrink-0 place-items-center text-faint [&>svg]:size-3.5">{ic.separator}</span>;

  return (
    <nav ref={boxRef} aria-label={l.nav} className={cn("relative w-full min-w-0 text-sm", className)}>
      <ol ref={ghostRef} aria-hidden className="pointer-events-none invisible absolute flex w-max items-center gap-1.5">
        {items.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5 whitespace-nowrap">{i > 0 && sep}{c.label}</li>
        ))}
      </ol>
      <ol className="flex min-w-0 items-center gap-1.5">
        {visible.map((c, i) => {
          const last = i === visible.length - 1;
          return (
            <motion.li
              key={c === "more" ? "more" : c.label}
              layout="position"
              transition={spring}
              initial={false}
              className={cn("flex items-center gap-1.5 whitespace-nowrap", last ? "min-w-0" : "shrink-0", !last && i > 0 && "max-w-40")}
            >
              {i > 0 && sep}
              {c === "more" ? (
                <>
                  <button
                    ref={moreRef}
                    type="button"
                    aria-label={l.showMore(hidden.length)}
                    aria-haspopup="menu"
                    aria-expanded={menu}
                    onClick={() => setMenu((m) => !m)}
                    className="grid h-6 w-7 place-items-center rounded-[6px] text-muted transition-colors hover:bg-raised hover:text-ink"
                  >
                    <span className="grid place-items-center [&>svg]:size-4" aria-hidden>{ic.more}</span>
                  </button>
                  <MenuContent
                    open={menu}
                    anchor={moreRef}
                    label={l.hiddenLevels}
                    minWidth={180}
                    onClose={() => setMenu(false)}
                    items={hidden.map((h) => ({
                      label: h.label,
                      onSelect: () => (h.onClick ? h.onClick() : h.href && (window.location.href = h.href)),
                    }))}
                  />
                </>
              ) : (
                link(c, last)
              )}
            </motion.li>
          );
        })}
      </ol>
    </nav>
  );
}
