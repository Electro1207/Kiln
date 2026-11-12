/* Anchored layer: the floating panel behind Select, Combobox, DatePicker,
   DropdownMenu and ContextMenu. Portalled to <body>, positioned against an
   element or a point, flips when there is no room, closes on outside press
   and Esc (only the topmost layer), and returns focus to its trigger. */

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../cn";
import { easeOut, fade, springSoft } from "../../motion";

export type Placement = "bottom-start" | "bottom" | "bottom-end" | "right-start";
type Side = "top" | "bottom" | "left" | "right";
type Anchor = RefObject<HTMLElement | null> | (() => DOMRect);

export type AnchoredLayerProps = {
  open: boolean;
  onClose: () => void;
  anchor: Anchor;
  placement?: Placement;
  offset?: number;
  /** Make the panel at least as wide as its anchor. */
  matchWidth?: boolean;
  /** Layers in one group do not close each other on outside press (menus and their submenus). */
  group?: string;
  /** Return focus to the anchor on Esc. Default true. */
  restoreFocus?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
  role?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-multiselectable"?: boolean;
  "aria-activedescendant"?: string;
  tabIndex?: number;
  onKeyDown?: (e: KeyboardEvent<HTMLDivElement>) => void;
  layerRef?: RefObject<HTMLDivElement | null>;
  children: ReactNode;
};

/** Ordered stack of open layers, so Esc closes only the topmost. */
const stack: string[] = [];

/** Shared look of a floating panel. */
export const panelClass = "rounded-card border border-line bg-surface p-1 text-ink shadow-float";

/** Shared look of a row in a list or menu. Pair with a highlight element behind it. */
export const optionClass =
  "relative flex w-full cursor-default select-none items-center gap-2 rounded-[6px] px-2.5 py-2 text-left text-sm outline-none [&>*]:relative [&>*]:z-[1]";

/** A floating panel anchored to an element or point: positions itself, closes on outside click or Escape, and restores focus. */
export function AnchoredLayer(props: AnchoredLayerProps) {
  if (typeof document === "undefined") return null;
  return createPortal(<AnimatePresence>{props.open && <Layer {...props} />}</AnimatePresence>, document.body);
}

function rectOf(anchor: Anchor): DOMRect | null {
  if (typeof anchor === "function") return anchor();
  return anchor.current?.getBoundingClientRect() ?? null;
}

function Layer({
  onClose,
  anchor,
  placement = "bottom-start",
  offset = 6,
  matchWidth,
  group,
  restoreFocus = true,
  className,
  style,
  layerRef,
  children,
  onKeyDown,
  ...aria
}: AnchoredLayerProps) {
  const ownId = useId();
  const groupId = group ?? ownId;
  const ref = useRef<HTMLDivElement | null>(null);
  const sideRef = useRef<Side | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number; side: Side; minWidth?: number } | null>(null);
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  const setRefs = (el: HTMLDivElement | null) => {
    ref.current = el;
    if (layerRef) layerRef.current = el;
  };

  const update = useCallback(() => {
    const el = ref.current;
    const a = rectOf(anchor);
    if (!el || !a) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const minWidth = matchWidth ? a.width : undefined;
    if (minWidth) el.style.minWidth = `${minWidth}px`;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const m = 8;
    let top: number;
    let left: number;
    let side: Side;

    if (placement === "right-start") {
      side = sideRef.current ?? (a.right + offset + w <= vw - m || a.left - offset - w < m ? "right" : "left");
      left = side === "right" ? a.right + offset : a.left - offset - w;
      top = Math.min(Math.max(a.top - 5, m), vh - h - m);
    } else {
      const below = a.bottom + offset;
      const fitsBelow = below + h <= vh - m;
      const fitsAbove = a.top - offset - h >= m;
      side = sideRef.current ?? (!fitsBelow && fitsAbove ? "top" : "bottom");
      top = side === "bottom" ? below : a.top - offset - h;
      if (placement === "bottom-start") left = a.left;
      else if (placement === "bottom-end") left = a.right - w;
      else left = a.left + a.width / 2 - w / 2;
    }
    left = Math.min(Math.max(left, m), Math.max(m, vw - w - m));
    sideRef.current = side;
    setPos({ top, left, side, minWidth });
  }, [anchor, placement, offset, matchWidth]);

  useLayoutEffect(update, [update]);

  useEffect(() => {
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    const ro = new ResizeObserver(schedule);
    if (ref.current) ro.observe(ref.current);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
      ro.disconnect();
    };
  }, [update]);

  useEffect(() => {
    stack.push(ownId);
    const anchorEl = typeof anchor === "function" ? null : anchor.current;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (!t) return;
      if (anchorEl?.contains(t)) return;
      if (t.closest(`[data-kiln-layer="${CSS.escape(groupId)}"]`)) return;
      onCloseRef.current();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape" || stack[stack.length - 1] !== ownId) return;
      e.preventDefault();
      onCloseRef.current();
      if (restoreFocus) anchorEl?.focus();
    };
    document.addEventListener("pointerdown", onDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      const i = stack.lastIndexOf(ownId);
      if (i >= 0) stack.splice(i, 1);
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [anchor, groupId, ownId, restoreFocus]);

  const origin =
    pos?.side === "top"
      ? placement === "bottom-end" ? "bottom right" : placement === "bottom" ? "bottom center" : "bottom left"
      : pos?.side === "left"
        ? "top right"
        : pos?.side === "right"
          ? "top left"
          : placement === "bottom-end" ? "top right" : placement === "bottom" ? "top center" : "top left";

  return (
    <motion.div
      ref={setRefs}
      data-kiln-layer={groupId}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1, transition: springSoft }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.13, ease: easeOut } }}
      onKeyDown={onKeyDown}
      className={cn("fixed z-[70] outline-none", panelClass, className)}
      style={{
        top: pos?.top ?? 0,
        left: pos?.left ?? 0,
        minWidth: pos?.minWidth,
        visibility: pos ? "visible" : "hidden",
        transformOrigin: origin,
        ...style,
      }}
      {...aria}
    >
      {children}
    </motion.div>
  );
}

/** The highlight behind the active row of a list. Every row owns one and it fades in place:
    nothing travels across other rows. Inline position and z-index beat optionClass's
    `[&>*]:relative z-[1]`, so it always sits under the row's label. */
export function RowHighlight({ on }: { on: boolean }) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none inset-0 bg-raised"
      style={{ position: "absolute", zIndex: 0, borderRadius: 6 }}
      initial={false}
      animate={{ opacity: on ? 1 : 0 }}
      transition={fade}
    />
  );
}

/** Two states of a value in one grid cell, cross-fading with a small vertical drift.
    Both versions share the cell, so neither lands on a second line for a frame. */
export function SwapText({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  return (
    <span className={cn("grid min-w-0 overflow-hidden [&>*]:[grid-area:1/1]", className)}>
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={springSoft}
          className="block min-w-0 truncate"
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
