import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "../../cn";
import { springSnappy } from "../../motion";
import { AnchoredLayer, RowHighlight, optionClass, type Placement } from "../shared/Anchored";

export type MenuEntry =
  | { type?: "item"; label: string; icon?: ReactNode; shortcut?: string; onSelect?: () => void; danger?: boolean; disabled?: boolean }
  | { type: "checkbox"; label: string; checked: boolean; onCheckedChange: (v: boolean) => void; shortcut?: string; disabled?: boolean }
  | { type: "submenu"; label: string; icon?: ReactNode; items: MenuEntry[]; disabled?: boolean }
  | { type: "label"; label: string }
  | { type: "separator" };

const focusable = (e: MenuEntry) => e.type !== "separator" && e.type !== "label" && !("disabled" in e && e.disabled);

type MenuContentProps = {
  open: boolean;
  onClose: (reason: "select" | "dismiss") => void;
  anchor: RefObject<HTMLElement | null> | (() => DOMRect);
  items: MenuEntry[];
  placement?: Placement;
  group?: string;
  restoreFocus?: boolean;
  /** For submenus: Left arrow returns to the parent. */
  onBack?: () => void;
  label?: string;
  minWidth?: number;
};

/** The panel of a menu. Shared by DropdownMenu and ContextMenu; submenus are nested MenuContents. */
export function MenuContent({ open, onClose, anchor, items, placement = "bottom-start", group, restoreFocus = true, onBack, label, minWidth = 208 }: MenuContentProps) {
  const id = useId();
  const groupId = group ?? id;
  const panelRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [active, setActive] = useState(-1);
  const [sub, setSub] = useState<number | null>(null);
  const [, setOpenCount] = useState(0);
  const hoverTimer = useRef<number | undefined>(undefined);
  const typed = useRef({ text: "", at: 0 });

  useEffect(() => {
    if (!open) return;
    setOpenCount((c) => c + 1);
    setActive(-1);
    setSub(null);
    const raf = requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(raf);
  }, [open]);

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const move = (from: number, dir: 1 | -1) => {
    const n = items.length;
    for (let k = 1; k <= n; k++) {
      const i = (((from + k * dir) % n) + n) % n;
      if (focusable(items[i])) return i;
    }
    return from;
  };

  const activate = (i: number) => {
    const e = items[i];
    if (!e || !focusable(e)) return;
    if (e.type === "submenu") { setSub(i); return; }
    if (e.type === "checkbox") { e.onCheckedChange(!e.checked); return; }
    if (e.type === "item" || e.type === undefined) {
      onClose("select");
      e.onSelect?.();
    }
  };

  const onKey = (ev: KeyboardEvent<HTMLDivElement>) => {
    if (ev.target !== panelRef.current) return;
    const k = ev.key;
    if (k === "ArrowDown") { ev.preventDefault(); setActive((a) => move(a < 0 ? -1 : a, 1)); }
    else if (k === "ArrowUp") { ev.preventDefault(); setActive((a) => move(a < 0 ? 0 : a, -1)); }
    else if (k === "Home") { ev.preventDefault(); setActive(move(-1, 1)); }
    else if (k === "End") { ev.preventDefault(); setActive(move(0, -1)); }
    else if (k === "Enter" || k === " ") { ev.preventDefault(); activate(active); }
    else if (k === "ArrowRight" && items[active]?.type === "submenu") { ev.preventDefault(); setSub(active); }
    else if (k === "ArrowLeft" && onBack) { ev.preventDefault(); onBack(); }
    else if (k === "Tab") { ev.preventDefault(); onClose("dismiss"); }
    else if (k.length === 1 && /\S/.test(k)) {
      const now = Date.now();
      typed.current.text = now - typed.current.at > 600 ? k : typed.current.text + k;
      typed.current.at = now;
      const q = typed.current.text.toLowerCase();
      const i = items.findIndex((e) => focusable(e) && "label" in e && e.label.toLowerCase().startsWith(q));
      if (i >= 0) setActive(i);
    }
  };

  const hoverRow = (i: number) => {
    setActive(i);
    window.clearTimeout(hoverTimer.current);
    const e = items[i];
    hoverTimer.current = window.setTimeout(() => setSub(e?.type === "submenu" && focusable(e) ? i : null), 110);
  };

  const subEntry = sub != null ? items[sub] : null;
  const subAnchor = useCallback(
    () => (sub != null && rowRefs.current[sub] ? rowRefs.current[sub]!.getBoundingClientRect() : new DOMRect()),
    [sub],
  );

  return (
    <AnchoredLayer
      open={open}
      onClose={() => onClose("dismiss")}
      anchor={anchor}
      placement={placement}
      offset={placement === "right-start" ? 2 : 6}
      group={groupId}
      restoreFocus={restoreFocus}
      layerRef={panelRef}
      role="menu"
      aria-label={label}
      tabIndex={-1}
      aria-activedescendant={active >= 0 ? `${id}-row-${active}` : undefined}
      onKeyDown={onKey}
      style={{ minWidth }}
      className="max-h-[min(24rem,80vh)] overflow-y-auto"
    >
      <div onPointerLeave={() => sub == null && setActive(-1)}>
        {items.map((e, i) => {
          if (e.type === "separator") return <div key={i} role="separator" className="-mx-1 my-1 h-px bg-line" />;
          if (e.type === "label") return <div key={i} className="px-2.5 pb-1 pt-2 text-xs text-muted">{e.label}</div>;
          const disabled = "disabled" in e && e.disabled;
          const danger = (e.type === "item" || e.type === undefined) && e.danger;
          const icon = "icon" in e ? e.icon : null;
          const shortcut = "shortcut" in e ? e.shortcut : null;
          return (
            <div
              key={i}
              ref={(el) => { rowRefs.current[i] = el; }}
              id={`${id}-row-${i}`}
              role={e.type === "checkbox" ? "menuitemcheckbox" : "menuitem"}
              aria-checked={e.type === "checkbox" ? e.checked : undefined}
              aria-haspopup={e.type === "submenu" ? "menu" : undefined}
              aria-expanded={e.type === "submenu" ? sub === i : undefined}
              aria-disabled={disabled || undefined}
              onPointerMove={() => !disabled && active !== i && hoverRow(i)}
              onClick={() => activate(i)}
              className={cn(optionClass, disabled && "opacity-40", danger ? "text-negative" : "text-ink")}
            >
              <RowHighlight on={active === i} />
              {e.type === "checkbox" ? (
                <span className="inline-flex size-4 text-accent">
                  <AnimatePresence initial={false}>
                    {e.checked && (
                      <motion.span initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={springSnappy} className="inline-flex">
                        <Check className="size-4" strokeWidth={2.5} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              ) : icon ? (
                <span className={cn("inline-flex [&>svg]:size-4", danger ? "" : "text-muted")}>{icon}</span>
              ) : null}
              <span className="min-w-0 flex-1 truncate">{e.label}</span>
              {shortcut && <span className="pl-4 text-xs text-muted tabular">{shortcut}</span>}
              {e.type === "submenu" && <ChevronRight className="size-4 text-muted" />}
            </div>
          );
        })}
      </div>
      {subEntry?.type === "submenu" && sub != null && (
        <MenuContent
          key={sub}
          open
          items={subEntry.items}
          anchor={subAnchor}
          placement="right-start"
          group={groupId}
          restoreFocus={false}
          label={subEntry.label}
          onBack={() => {
            setSub(null);
            panelRef.current?.focus({ preventScroll: true });
          }}
          onClose={(reason) => {
            setSub(null);
            if (reason === "select") onClose("select");
            else panelRef.current?.focus({ preventScroll: true });
          }}
        />
      )}
    </AnchoredLayer>
  );
}

export type DropdownTriggerProps = {
  ref: RefObject<HTMLButtonElement | null>;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
};

export type DropdownMenuProps = {
  items: MenuEntry[];
  /** Render the button that opens the menu, spreading the props onto it. */
  trigger: (props: DropdownTriggerProps & { open: boolean }) => ReactNode;
  placement?: Placement;
  label?: string;
};

/** A menu that opens from a trigger. Items can be actions, checkboxes, labels, separators or submenus. */
export function DropdownMenu({ items, trigger, placement = "bottom-start", label }: DropdownMenuProps) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <>
      {trigger({
        ref,
        open,
        "aria-haspopup": "menu",
        "aria-expanded": open,
        onClick: () => setOpen((o) => !o),
        onKeyDown: (e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); }
        },
      })}
      <MenuContent
        open={open}
        anchor={ref}
        items={items}
        placement={placement}
        label={label}
        onClose={(reason) => {
          setOpen(false);
          if (reason === "select") ref.current?.focus();
        }}
      />
    </>
  );
}
