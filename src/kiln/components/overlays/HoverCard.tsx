import { cloneElement, useEffect, useRef, useState, type ReactElement, type ReactNode, type Ref } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../cn";
import { popVariants } from "../../motion";
import { originFor, Portal, useAnchored, type Align, type Side } from "../shared/useOverlay";

type TriggerProps = {
  ref?: Ref<HTMLElement>;
  onPointerEnter?: (e: React.PointerEvent) => void;
  onPointerLeave?: (e: React.PointerEvent) => void;
  onFocus?: (e: React.FocusEvent) => void;
  onBlur?: (e: React.FocusEvent) => void;
};

export type HoverCardProps = {
  children: ReactElement<TriggerProps>;
  content: ReactNode;
  side?: Side;
  align?: Align;
  openDelay?: number;
  closeDelay?: number;
  className?: string;
};

/** A rich preview that opens when a link is hovered or focused, and stays open while the pointer is on it. */
export function HoverCard({ children, content, side = "bottom", align = "start", openDelay = 380, closeDelay = 180, className }: HoverCardProps) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const { anchorRef, floatingRef, placement, floatingStyle } = useAnchored(open, side, align, 10);

  const schedule = (next: boolean) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), next ? openDelay : closeDelay);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const p = children.props;
  const trigger = cloneElement(children, {
    ref: anchorRef as Ref<HTMLElement>,
    onPointerEnter: (e) => { p.onPointerEnter?.(e); if (e.pointerType === "mouse") schedule(true); },
    onPointerLeave: (e) => { p.onPointerLeave?.(e); schedule(false); },
    onFocus: (e) => { p.onFocus?.(e); schedule(true); },
    onBlur: (e) => { p.onBlur?.(e); schedule(false); },
  });

  return (
    <>
      {trigger}
      <Portal>
        <AnimatePresence>
          {open && (
            <motion.div
              key="hovercard"
              ref={floatingRef}
              variants={popVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onPointerEnter={() => schedule(true)}
              onPointerLeave={() => schedule(false)}
              style={{ ...floatingStyle, transformOrigin: originFor(placement) }}
              className={cn("z-50 w-72 max-w-[calc(100vw-16px)] rounded-card border border-line bg-surface p-4 text-ink shadow-float", className)}
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
