import { cloneElement, useEffect, useId, useRef, useState, type ReactElement, type ReactNode, type Ref } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../cn";
import { easeOut, springSoft } from "../../motion";
import { originFor, Portal, useAnchored, type Side } from "../shared/useOverlay";

/* One tooltip is open at a time. Leaving a trigger keeps its tooltip for a
   short grace period; if the pointer reaches another trigger in that time
   (across a toolbar gap, say), the old one vanishes and the new one appears
   in the same frame, with no fade on either: a clean hand-over, no flicker.
   For a moment after the last one closes, the next opens without delay. */
const GRACE_MS = 90;
const WARM_MS = 450;
let warmUntil = 0;
let current: { id: string; handOver: () => void } | null = null;

type TriggerProps = {
  ref?: Ref<HTMLElement>;
  onPointerEnter?: (e: React.PointerEvent) => void;
  onPointerLeave?: (e: React.PointerEvent) => void;
  onFocus?: (e: React.FocusEvent) => void;
  onBlur?: (e: React.FocusEvent) => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  "aria-describedby"?: string;
};

export type TooltipProps = {
  content: ReactNode;
  children: ReactElement<TriggerProps>;
  side?: Side;
  /** Delay before the first tooltip opens, in ms. */
  delay?: number;
  className?: string;
};

/** A short label on hover or keyboard focus. Not for anything the user must read to act. */
export function Tooltip({ content, children, side = "top", delay = 450, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [instant, setInstant] = useState(false);
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const id = useId();
  const { anchorRef, floatingRef, placement, floatingStyle } = useAnchored(open, side, "center", 8);

  const clearTimers = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  };

  const reallyOpen = (now: boolean) => {
    if (current && current.id !== id) current.handOver();
    current = { id, handOver: () => { clearTimers(); setInstant(true); setOpen(false); } };
    setInstant(now);
    setOpen(true);
  };

  const show = () => {
    clearTimers();
    if (open) return;
    const warm = current !== null || Date.now() < warmUntil;
    if (warm) reallyOpen(true);
    else openTimer.current = window.setTimeout(() => reallyOpen(false), delay);
  };

  const close = () => {
    clearTimers();
    setInstant(false);
    setOpen(false);
  };

  const hide = (grace = true) => {
    window.clearTimeout(openTimer.current);
    if (!open) return;
    window.clearTimeout(closeTimer.current);
    if (grace) closeTimer.current = window.setTimeout(close, GRACE_MS);
    else close();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (current?.id === id) current = null;
      warmUntil = Date.now() + WARM_MS;
    };
  }, [open, id]);

  useEffect(() => () => clearTimers(), []);

  const p = children.props;
  const trigger = cloneElement(children, {
    ref: anchorRef as Ref<HTMLElement>,
    onPointerEnter: (e) => { p.onPointerEnter?.(e); if (e.pointerType === "mouse") show(); },
    onPointerLeave: (e) => { p.onPointerLeave?.(e); hide(); },
    onPointerDown: (e) => { p.onPointerDown?.(e); hide(false); },
    onFocus: (e) => { p.onFocus?.(e); if ((e.target as HTMLElement).matches(":focus-visible")) show(); },
    onBlur: (e) => { p.onBlur?.(e); hide(false); },
    "aria-describedby": open ? id : undefined,
  });

  const s = placement?.side ?? side;
  const offsetFrom = { top: { y: 4 }, bottom: { y: -4 }, left: { x: 4 }, right: { x: -4 } }[s];

  return (
    <>
      {trigger}
      <Portal>
        {/* `custom` reaches a child that is already leaving, so a hand-over can make its exit instant. */}
        <AnimatePresence custom={instant}>
          {open && (
            <motion.div
              key="tip"
              id={id}
              ref={floatingRef}
              role="tooltip"
              initial={instant ? { opacity: 1 } : { opacity: 0, scale: 0.94, ...offsetFrom }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              custom={instant}
              variants={{
                exit: (now: boolean) => (now ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, transition: { duration: 0.12, ease: easeOut } }),
              }}
              exit="exit"
              transition={springSoft}
              style={{ ...floatingStyle, transformOrigin: originFor(placement) }}
              className={cn(
                "pointer-events-none z-[60] max-w-64 rounded-[7px] bg-ink px-2.5 py-1.5 text-[12.5px] font-medium leading-[18px] text-surface shadow-float",
                "dark:bg-elevated dark:text-ink dark:ring-1 dark:ring-inset dark:ring-line-strong/60",
                className,
              )}
            >
              {content}
              {placement && <Arrow side={placement.side} at={placement.arrow} />}
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}

function Arrow({ side, at }: { side: Side; at: number }) {
  const pos: React.CSSProperties =
    side === "top" ? { left: at - 4, bottom: -4 }
    : side === "bottom" ? { left: at - 4, top: -4 }
    : side === "left" ? { top: at - 4, right: -4 }
    : { top: at - 4, left: -4 };
  return <span aria-hidden className="absolute size-2 rotate-45 rounded-[1px] bg-ink dark:bg-elevated" style={pos} />;
}
