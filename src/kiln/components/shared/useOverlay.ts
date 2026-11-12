/* Shared plumbing for everything that floats: a portal, a scroll lock that
   does not shift the page, a focus trap, a layer stack (so Esc and Tab only
   reach the topmost overlay), and fixed positioning against an anchor. */

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

export function Portal({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

let lockCount = 0;
let saved = { overflow: "", paddingRight: "" };

export function useScrollLock(active: boolean) {
  useLayoutEffect(() => {
    if (!active) return;
    const body = document.body;
    if (lockCount === 0) {
      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      saved = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
      const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.overflow = "hidden";
      if (scrollbar > 0) body.style.paddingRight = `${current + scrollbar}px`;
    }
    lockCount++;
    return () => {
      lockCount--;
      if (lockCount === 0) {
        body.style.overflow = saved.overflow;
        body.style.paddingRight = saved.paddingRight;
      }
    };
  }, [active]);
}

const stack: symbol[] = [];
const isTop = (id: symbol) => stack[stack.length - 1] === id;

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

function focusables(node: HTMLElement) {
  return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.getClientRects().length > 0);
}

/**
 * Makes `ref` a modal layer while mounted: locks scroll, traps Tab, closes on
 * Esc (topmost layer only) and gives focus back to whatever had it on unmount.
 */
export function useModalLayer(ref: RefObject<HTMLElement | null>, onClose: () => void, { lockScroll = true } = {}) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useScrollLock(lockScroll);

  useEffect(() => {
    const id = Symbol("layer");
    stack.push(id);
    const previous = document.activeElement as HTMLElement | null;
    const node = ref.current;

    const raf = requestAnimationFrame(() => {
      if (!node || node.contains(document.activeElement)) return;
      const target = node.querySelector<HTMLElement>("[data-autofocus]") ?? focusables(node)[0] ?? node;
      target.focus({ preventScroll: true });
    });

    const onKey = (e: KeyboardEvent) => {
      if (!isTop(id) || !node) return;
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables(node);
      if (items.length === 0) {
        e.preventDefault();
        node.focus();
        return;
      }
      const first = items[0], last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === node)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      const i = stack.indexOf(id);
      if (i >= 0) stack.splice(i, 1);
      if (previous && document.contains(previous)) previous.focus({ preventScroll: true });
    };
  }, [ref]);
}

/** Esc + outside click for non-modal floating things (popover, menu). */
export function useDismiss(
  open: boolean,
  onClose: () => void,
  refs: Array<RefObject<HTMLElement | null>>,
) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const refsRef = useRef(refs);
  refsRef.current = refs;
  useEffect(() => {
    if (!open) return;
    const id = Symbol("float");
    stack.push(id);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isTop(id)) {
        e.stopPropagation();
        closeRef.current();
      }
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (refsRef.current.some((r) => r.current?.contains(t))) return;
      closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      const i = stack.indexOf(id);
      if (i >= 0) stack.splice(i, 1);
    };
  }, [open]);
}

export function useMediaQuery(query: string) {
  const [match, setMatch] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

export const useIsPhone = () => useMediaQuery("(max-width: 639px)");

export type Side = "top" | "bottom" | "left" | "right";
export type Align = "start" | "center" | "end";
export type Placement = { x: number; y: number; side: Side; arrow: number };

const MARGIN = 8;

export function computePlacement(a: DOMRect, w: number, h: number, side: Side, align: Align, offset: number): Placement {
  const vw = window.innerWidth, vh = window.innerHeight;
  const fits = (s: Side) =>
    s === "bottom" ? a.bottom + offset + h <= vh - MARGIN
    : s === "top" ? a.top - offset - h >= MARGIN
    : s === "right" ? a.right + offset + w <= vw - MARGIN
    : a.left - offset - w >= MARGIN;
  const opposite: Record<Side, Side> = { top: "bottom", bottom: "top", left: "right", right: "left" };
  const s = fits(side) || !fits(opposite[side]) ? side : opposite[side];

  let x: number, y: number;
  if (s === "top" || s === "bottom") {
    y = s === "bottom" ? a.bottom + offset : a.top - offset - h;
    x = align === "start" ? a.left : align === "end" ? a.right - w : a.left + a.width / 2 - w / 2;
    x = Math.min(Math.max(x, MARGIN), vw - w - MARGIN);
  } else {
    x = s === "right" ? a.right + offset : a.left - offset - w;
    y = align === "start" ? a.top : align === "end" ? a.bottom - h : a.top + a.height / 2 - h / 2;
    y = Math.min(Math.max(y, MARGIN), vh - h - MARGIN);
  }
  const arrow = s === "top" || s === "bottom" ? a.left + a.width / 2 - x : a.top + a.height / 2 - y;
  return { x: Math.round(x), y: Math.round(y), side: s, arrow: Math.round(arrow) };
}

/**
 * Positions a fixed floating element against an anchor and keeps it there
 * through scroll and resize. The first position is set before paint.
 */
export function useAnchored<A extends HTMLElement = HTMLElement>(open: boolean, side: Side = "bottom", align: Align = "center", offset = 8) {
  const anchorRef = useRef<A | null>(null);
  const floatingRef = useRef<HTMLDivElement | null>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);

  const update = useCallback(() => {
    const a = anchorRef.current, f = floatingRef.current;
    if (!a || !f) return;
    const p = computePlacement(a.getBoundingClientRect(), f.offsetWidth, f.offsetHeight, side, align, offset);
    setPlacement((prev) =>
      prev && prev.x === p.x && prev.y === p.y && prev.side === p.side && prev.arrow === p.arrow ? prev : p,
    );
  }, [side, align, offset]);

  useLayoutEffect(() => {
    // When closing, keep the last placement so the exit animation stays put.
    if (!open) return;
    update();
    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    const ro = new ResizeObserver(schedule);
    if (floatingRef.current) ro.observe(floatingRef.current);
    if (anchorRef.current) ro.observe(anchorRef.current);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
    };
  }, [open, update]);

  /** Style for the floating element: hidden until measured, so it never flashes at 0,0. */
  const floatingStyle: CSSProperties = placement
    ? { position: "fixed", left: placement.x, top: placement.y }
    : { position: "fixed", left: 0, top: 0, visibility: "hidden" };

  return { anchorRef, floatingRef, placement, floatingStyle };
}

/** transform-origin so a floating element grows out of its anchor. */
export function originFor(p: Placement | null): string {
  if (!p) return "center";
  switch (p.side) {
    case "bottom": return `${p.arrow}px top`;
    case "top": return `${p.arrow}px bottom`;
    case "right": return `left ${p.arrow}px`;
    case "left": return `right ${p.arrow}px`;
  }
}
