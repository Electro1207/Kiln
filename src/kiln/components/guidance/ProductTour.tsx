import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion, type MotionValue } from "motion/react";
import { X } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, springFirm, springSoft } from "../../motion";
import { Button } from "../buttons/Button";
import { Portal, useMediaQuery, useModalLayer, type Side } from "../shared/useOverlay";

export type TourStep = {
  /** A CSS selector for the element to point at, e.g. '[data-tour="search"]'. */
  target: string;
  title: ReactNode;
  body: ReactNode;
  /** Where the card prefers to sit. Falls through to the other sides, then docks, if there is no room. */
  side?: Side;
};

/** Text used by ProductTour. Pass a partial via `labels` to translate or reword. */
export interface ProductTourLabels {
  /** "Step 2 of 5" text. */
  stepOf: (step: number, total: number) => string;
  /** aria-label of the close button. */
  skip: string;
  /** Back button. */
  back: string;
  /** Next button. */
  next: string;
  /** Button on the last step. */
  done: string;
}
export const productTourLabels: ProductTourLabels = {
  stepOf: (s, t) => `Step ${s} of ${t}`,
  skip: "Skip tour",
  back: "Back",
  next: "Next",
  done: "Done",
};

export type ProductTourProps = {
  steps: TourStep[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after the last step's Done. */
  onFinish?: () => void;
  /** Override any UI text. Merged over `productTourLabels`. */
  labels?: Partial<ProductTourLabels>;
};

const GAP = 14;
const EDGE = 16;
const PAD = 8;
const CARD_W = 320;
/** The part being explained may be re-checked once the page has stopped moving after a scroll. */
const SETTLE_MS = 300;
const ARROW = 12;
type Place = { side: Side | "dock-top" | "dock-bottom"; x: number; y: number };
type Base = { idx: number; lit: { x: number; y: number; w: number; h: number }; placed: { x: number; y: number } };

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function place(box: DOMRect, w: number, h: number, prefer: Side, vw: number, vh: number, narrow: boolean): Place {
  if (!narrow) {
    const midY = clamp(box.top + box.height / 2 - h / 2, EDGE, vh - h - EDGE);
    const midX = clamp(box.left + box.width / 2 - w / 2, EDGE, vw - w - EDGE);
    const all: Record<Side, Place & { fits: boolean }> = {
      right: { side: "right", x: box.right + GAP, y: midY, fits: box.right + GAP + w <= vw - EDGE },
      left: { side: "left", x: box.left - GAP - w, y: midY, fits: box.left - GAP - w >= EDGE },
      bottom: { side: "bottom", x: midX, y: box.bottom + GAP, fits: box.bottom + GAP + h <= vh - EDGE },
      top: { side: "top", x: midX, y: box.top - GAP - h, fits: box.top - GAP - h >= EDGE },
    };
    const order = [prefer, ...(["right", "left", "bottom", "top"] as Side[]).filter((s) => s !== prefer)];
    const hit = order.map((s) => all[s]).find((o) => o.fits);
    if (hit) return hit;
  }
  const low = box.top + box.height / 2 > vh * 0.55;
  return low ? { side: "dock-top", x: EDGE, y: EDGE } : { side: "dock-bottom", x: EDGE, y: vh - h - EDGE };
}

/**
 * Coach marks. The page is dimmed by a hairline spotlight round the part
 * being explained (the scrim is the spotlight's own huge shadow). Between parts the spotlight and the card
 * do not travel by animating their own position: what is drawn is the live position of the part plus a
 * "glide" offset that eases to nothing, so a scroll moves the spotlight with no lag and a step eases it
 * onto the next part. Everything is written to `transform` (and the card's `opacity`); layout is read only
 * on a step, a resize or a scroll, never in a frame loop. Esc or Skip leaves at any time; arrows step.
 */
export function ProductTour(props: ProductTourProps) {
  return (
    <Portal>
      <AnimatePresence>{props.open && <TourLayer key="tour" {...props} />}</AnimatePresence>
    </Portal>
  );
}

function TourLayer({ steps, onOpenChange, onFinish, labels }: ProductTourProps) {
  const l = { ...productTourLabels, ...labels };
  const reduced = !!useReducedMotion();
  const narrow = useMediaQuery("(max-width: 639px)");
  const [index, setIndex] = useState(0);
  const [side, setSide] = useState<Place["side"]>("right");
  const titleId = useId();
  const bodyId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const base = useRef<Base | null>(null);
  const sideRef = useRef<Place["side"]>("right");
  const reserveRef = useRef(-1);
  const indexRef = useRef(0);
  indexRef.current = index;
  // Glide offsets (px): how far what is drawn is from where the part is. They ease to nothing.
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const gw = useMotionValue(0);
  const gh = useMotionValue(0);
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);
  const step = steps[index];
  const last = index === steps.length - 1;
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
  useModalLayer(cardRef, close);

  const paint = useCallback(() => {
    const b = base.current;
    const spot = spotRef.current;
    const card = cardRef.current;
    if (!b || !spot || !card) return;
    const w = Math.max(1, b.lit.w);
    const h = Math.max(1, b.lit.h);
    const sx = (w + gw.get()) / w;
    const sy = (h + gh.get()) / h;
    spot.style.transform = `translate3d(${b.lit.x + gx.get()}px, ${b.lit.y + gy.get()}px, 0) scale(${Math.max(0, sx)}, ${Math.max(0, sy)})`;
    card.style.transform = `translate3d(${b.placed.x + cx.get()}px, ${b.placed.y + cy.get()}px, 0)`;
  }, [gx, gy, gw, gh, cx, cy]);

  useEffect(() => {
    const offs = [gx, gy, gw, gh, cx, cy].map((m) => m.on("change", paint));
    return () => offs.forEach((off) => off());
  }, [gx, gy, gw, gh, cx, cy, paint]);

  const ease = useCallback(
    (m: MotionValue<number>, from: number) => {
      if (reduced || Math.abs(from) < 0.5) {
        m.jump(0);
        return;
      }
      m.jump(from);
      animate(m, 0, springFirm);
    },
    [reduced],
  );

  const setReserve = useCallback((v: number) => {
    if (reserveRef.current === v) return;
    reserveRef.current = v;
    document.documentElement.style.setProperty("--k-tour-reserve", `${v}px`);
  }, []);

  const measure = useCallback(() => {
    const st = steps[indexRef.current];
    const el = st && document.querySelector<HTMLElement>(st.target);
    const card = cardRef.current;
    const spot = spotRef.current;
    if (!el || !card || !spot) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const r = el.getBoundingClientRect();
    const box = new DOMRect(r.left - PAD, r.top - PAD, r.width + PAD * 2, r.height + PAD * 2);
    const x0 = Math.max(box.left, 4);
    const y0 = Math.max(box.top, 4);
    const lit = {
      x: x0,
      y: y0,
      w: Math.max(0, Math.min(box.right, vw - 4) - x0),
      h: Math.max(0, Math.min(box.bottom, vh - 4) - y0),
    };
    const p = place(box, card.offsetWidth, card.offsetHeight, st.side ?? "right", vw, vh, narrow);
    if (p.side !== sideRef.current) {
      sideRef.current = p.side;
      setSide(p.side);
    }
    const placed = { x: Math.round(p.x), y: Math.round(p.y) };
    const prev = base.current;
    if (!prev) {
      ease(gx, -14);
      ease(gy, -14);
      ease(gw, 28);
      ease(gh, 28);
    } else if (prev.idx !== indexRef.current) {
      ease(gx, prev.lit.x + gx.get() - lit.x);
      ease(gy, prev.lit.y + gy.get() - lit.y);
      ease(gw, prev.lit.w + gw.get() - lit.w);
      ease(gh, prev.lit.h + gh.get() - lit.h);
      ease(cx, prev.placed.x + cx.get() - placed.x);
      ease(cy, prev.placed.y + cy.get() - placed.y);
    } else {
      // The same stop: a scroll moves the card with the part, so only a jump beyond that is eased.
      const jx = prev.placed.x + cx.get() + (lit.x - prev.lit.x) - placed.x;
      const jy = prev.placed.y + cy.get() + (lit.y - prev.lit.y) - placed.y;
      if (Math.abs(jx) > 0.5 || Math.abs(jy) > 0.5) {
        ease(cx, jx);
        ease(cy, jy);
      }
    }
    base.current = { idx: indexRef.current, lit, placed };
    spot.style.width = `${lit.w}px`;
    spot.style.height = `${lit.h}px`;
    paint();
    setReserve(narrow ? card.offsetHeight + EDGE * 2 : 24);
  }, [steps, narrow, ease, gx, gy, gw, gh, cx, cy, paint, setReserve]);

  useLayoutEffect(() => {
    measure();
    const el = document.querySelector<HTMLElement>(step.target);
    if (!el) return;
    const reserve = reserveRef.current >= 0 ? reserveRef.current : 24;
    const prevTop = el.style.scrollMarginTop;
    const prevBottom = el.style.scrollMarginBottom;
    el.style.scrollMarginTop = `${reserve}px`;
    el.style.scrollMarginBottom = `${reserve}px`;
    const scroll = () => {
      const r = el.getBoundingClientRect();
      if (r.top < reserve - 1 || r.bottom > window.innerHeight - reserve + 1) {
        el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduced ? "auto" : "smooth" });
      }
    };
    scroll();
    const settle = setTimeout(scroll, SETTLE_MS);
    return () => {
      clearTimeout(settle);
      el.style.scrollMarginTop = prevTop;
      el.style.scrollMarginBottom = prevBottom;
    };
  }, [index, step, measure, reduced]);

  // Follow the part on a scroll (read once per frame at most), a resize, or the card changing height.
  useEffect(() => {
    let frame = 0;
    const later = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    };
    window.addEventListener("scroll", later, { capture: true, passive: true });
    window.addEventListener("resize", later);
    const ro = new ResizeObserver(later);
    if (cardRef.current) ro.observe(cardRef.current);
    const target = document.querySelector(step.target);
    if (target) ro.observe(target);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", later, { capture: true });
      window.removeEventListener("resize", later);
      ro.disconnect();
    };
  }, [measure, step]);

  useEffect(() => () => { document.documentElement.style.removeProperty("--k-tour-reserve"); }, []);

  const next = () => {
    if (last) {
      close();
      onFinish?.();
    } else setIndex(index + 1);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setIndex((i) => Math.max(0, i - 1));
    }
  };

  const docked = side === "dock-top" || side === "dock-bottom";
  const t = reduced ? { duration: 0.01 } : { duration: 0.22, ease: easeOut };

  return (
    <motion.div
      className="fixed inset-0 z-[80]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: reduced ? { duration: 0.01 } : { duration: 0.18, ease: easeOut } }}
      transition={t}
    >
      {/* Clicks outside the card do nothing: the page is paused, not dismissed. */}
      <div className="absolute inset-0" aria-hidden />
      <div ref={spotRef} aria-hidden className="k-tour-spot pointer-events-none fixed left-0 top-0 origin-top-left will-change-transform" />
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        tabIndex={-1}
        onKeyDown={onKey}
        style={{ width: docked ? `calc(100vw - ${EDGE * 2}px)` : `min(${CARD_W}px, calc(100vw - ${EDGE * 2}px))` }}
        className="fixed left-0 top-0 outline-none will-change-transform"
      >
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0.01 } : { ...springSoft, opacity: { duration: 0.26, ease: easeOut, delay: 0.1 } }}
          className="relative rounded-card border border-line bg-surface p-4 text-ink shadow-float"
        >
          {(side === "right" || side === "left") && (
            <span
              aria-hidden
              style={{ width: ARROW, height: ARROW }}
              className={cn(
                "absolute top-[calc(50%-6px)] rotate-45 bg-surface",
                side === "right" ? "-left-1.5 border-b border-l border-line" : "-right-1.5 border-r border-t border-line",
              )}
            />
          )}
          <div className="flex items-center justify-between">
            <span className="tabular text-xs font-medium text-muted">
              {l.stepOf(index + 1, steps.length)}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label={l.skip}
              className="-mr-1.5 -mt-1 grid size-7 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>
          <div aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={index}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0, transition: { duration: reduced ? 0.01 : 0.25, ease: easeOut } }}
                exit={{ opacity: 0, transition: { duration: 0.08 } }}
              >
                <h2 id={titleId} className="mt-1 text-[15px] font-semibold leading-snug">{step.title}</h2>
                <p id={bodyId} className="mt-1.5 text-[13.5px] leading-5 text-muted">{step.body}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex flex-1 items-center gap-1.5" aria-hidden>
              {steps.map((_, i) => (
                <span key={i} className={cn("size-1.5 rounded-full transition-colors duration-300", i === index ? "bg-accent" : "bg-line-strong")} />
              ))}
            </div>
            {index > 0 && (
              <Button size="sm" variant="ghost" onClick={() => setIndex(index - 1)}>
                {l.back}
              </Button>
            )}
            <Button size="sm" onClick={next} data-autofocus>
              {last ? l.done : l.next}
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
