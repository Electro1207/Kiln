import { useCallback, useRef, useState, type ReactNode } from "react";
import { cn } from "../../cn";
import { MenuContent, type DropdownMenuIcons, type MenuEntry } from "./DropdownMenu";

/** Text used by ContextMenu. Pass a partial via `labels` to translate or reword. */
export interface ContextMenuLabels {
  /** aria-label of the area: the menu label plus a keyboard hint. */
  area: (label: string) => string;
}
export const contextMenuLabels: ContextMenuLabels = { area: (label) => `${label}: press Shift F10 for the menu` };

export type ContextMenuProps = {
  items: MenuEntry[];
  children: ReactNode;
  label?: string;
  /** Override any UI text. Merged over `contextMenuLabels`. */
  labels?: Partial<ContextMenuLabels>;
  /** Replace any built-in icon. Merged over `dropdownMenuIcons`. */
  icons?: Partial<DropdownMenuIcons>;
  className?: string;
};

/** Right-click (or Shift+F10 / the Menu key) anywhere inside opens a menu at the pointer. */
export function ContextMenu({ items, children, label = "Actions", labels, icons, className }: ContextMenuProps) {
  const l = { ...contextMenuLabels, ...labels };
  const areaRef = useRef<HTMLDivElement>(null);
  const point = useRef({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);
  const [n, setN] = useState(0);
  const anchor = useCallback(() => new DOMRect(point.current.x, point.current.y, 0, 0), []);

  const openAt = (x: number, y: number) => {
    point.current = { x, y };
    setN((k) => k + 1); // a fresh panel each time, so it grows from the new point
    setOpen(true);
  };

  return (
    <>
      <div
        ref={areaRef}
        tabIndex={0}
        aria-haspopup="menu"
        aria-label={l.area(label)}
        onContextMenu={(e) => {
          e.preventDefault();
          openAt(e.clientX, e.clientY);
        }}
        onKeyDown={(e) => {
          if ((e.shiftKey && e.key === "F10") || e.key === "ContextMenu") {
            e.preventDefault();
            const r = areaRef.current!.getBoundingClientRect();
            openAt(r.left + r.width / 2, r.top + r.height / 2);
          }
        }}
        className={cn("outline-offset-2", className)}
      >
        {children}
      </div>
      <MenuContent
        key={n}
        open={open}
        anchor={anchor}
        items={items}
        label={label}
        icons={icons}
        onClose={(reason) => {
          setOpen(false);
          if (reason === "select") areaRef.current?.focus();
        }}
        restoreFocus
      />
    </>
  );
}
