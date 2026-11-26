import { forwardRef, useId, useMemo, useRef, useState, type HTMLAttributes, type KeyboardEvent } from "react";
import { cn } from "../../cn";
import type { Size } from "../../controllable";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";
import { MenuContent, type DropdownMenuIcons, type MenuEntry } from "./DropdownMenu";

/** One menu in the bar: its name and what drops down. */
export type MenubarMenu = { id: string; label: string; items: MenuEntry[]; disabled?: boolean };

export type MenubarProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  menus: MenubarMenu[];
  size?: Size;
  /** Accessible name of the menu bar. Default "Application". */
  label?: string;
  /** Replace any built-in icon of the menus. Merged over `dropdownMenuIcons`. */
  icons?: Partial<DropdownMenuIcons>;
  /** Turn accessibility features on for this component only. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

const sizes: Record<Size, string> = {
  sm: "h-7 px-2.5 text-[0.8125rem]",
  md: "h-8 px-3 text-sm",
  lg: "h-10 px-3.5 text-[0.9375rem]",
};

/**
 * An application menu bar (File, Edit, View). One Tab stop; Left and Right move between the
 * menus, Down or Enter opens one, and while one is open Left and Right switch to the next.
 */
export const Menubar = forwardRef<HTMLDivElement, MenubarProps>(function Menubar(
  { menus, size = "md", label = "Application", icons, accessibilityFeatures, className, style, ...rest },
  ref,
) {
  const { rootProps } = useA11yProps(accessibilityFeatures);
  const [open, setOpen] = useState<string | null>(null);
  const [stop, setStop] = useState<string | undefined>(undefined);
  const group = useId();
  const [openFocus, setOpenFocus] = useState<"first" | "none">("none");
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const enabled = menus.filter((m) => !m.disabled);
  const tab = enabled.some((m) => m.id === stop) ? stop : enabled[0]?.id;

  // One stable anchor per menu, so each menu's layer can animate out on its own.
  const key = menus.map((m) => m.id).join("|");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const anchors = useMemo(() => Object.fromEntries(menus.map((m) => [m.id, { current: null as HTMLElement | null }])), [key]);

  const openMenu = (id: string, keyboard: boolean) => {
    setOpenFocus(keyboard ? "first" : "none");
    setStop(id);
    setOpen(id);
  };

  const go = (from: string, dir: 1 | -1 | "first" | "last") => {
    const at = enabled.findIndex((m) => m.id === from);
    const to = dir === "first" ? 0 : dir === "last" ? enabled.length - 1 : (at + dir + enabled.length) % enabled.length;
    return enabled[to]?.id;
  };

  const onBarKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.defaultPrevented) return;
    const from = open ?? (document.activeElement as HTMLElement | null)?.dataset.menu;
    if (!from) return;
    let to: string | undefined;
    if (e.key === "ArrowRight") to = go(from, 1);
    else if (e.key === "ArrowLeft") to = go(from, -1);
    else if (!open && e.key === "Home") to = go(from, "first");
    else if (!open && e.key === "End") to = go(from, "last");
    if (!to) return;
    e.preventDefault();
    if (open) openMenu(to, true);
    else { setStop(to); triggers.current[to]?.focus(); }
  };

  return (
    <div
      ref={ref}
      role="menubar"
      aria-label={label}
      {...rest}
      {...rootProps}
      onKeyDown={onBarKey}
      style={{ ...rootProps.style, ...style }}
      className={cn("inline-flex items-center gap-0.5 rounded-control border border-line bg-surface p-0.5", className)}
    >
      {menus.map((m) => {
        const on = open === m.id;
        return (
          <button
            key={m.id}
            ref={(el) => { triggers.current[m.id] = el; anchors[m.id].current = el; }}
            type="button"
            role="menuitem"
            data-menu={m.id}
            aria-haspopup="menu"
            aria-expanded={on}
            disabled={m.disabled}
            tabIndex={m.id === tab ? 0 : -1}
            onFocus={() => setStop(m.id)}
            onClick={() => (on ? setOpen(null) : openMenu(m.id, false))}
            onPointerEnter={(e) => { if (open && open !== m.id && !m.disabled && e.pointerType === "mouse") openMenu(m.id, false); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") { e.preventDefault(); openMenu(m.id, true); }
            }}
            className={cn(
              "rounded-[6px] font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-45",
              sizes[size],
              on ? "bg-active text-ink" : "text-muted hover:bg-raised hover:text-ink",
            )}
          >
            {m.label}
          </button>
        );
      })}
      {menus.map((m) => (
        <MenuContent
          key={m.id}
          open={open === m.id}
          anchor={anchors[m.id]}
          items={m.items}
          label={m.label}
          icons={icons}
          initialFocus={open === m.id ? openFocus : "none"}
          group={group}
          onClose={(reason) => {
            setOpen((o) => (o === m.id ? null : o));
            if (reason === "select") triggers.current[m.id]?.focus();
          }}
        />
      ))}
    </div>
  );
});
