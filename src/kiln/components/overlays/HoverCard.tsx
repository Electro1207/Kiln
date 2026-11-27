import { cloneElement, useCallback, useEffect, useRef, useState, type ReactElement, type ReactNode, type Ref } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { cn } from "../../cn";
import { fade, popVariants } from "../../motion";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";
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
  /** Accessibility features to add for this card only (`extendedTime` keeps it open three times longer after the pointer leaves; `reduceMotion` fades instead of popping). Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

const fadeVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: fade }, exit: { opacity: 0, transition: { duration: 0.12 } } };

/** One pending timeout, cleared on unmount. */
function useTimeout() {
  const id = useRef<number | undefined>(undefined);
  const clear = useCallback(() => window.clearTimeout(id.current), []);
  const set = useCallback((fn: () => void, ms: number) => {
    window.clearTimeout(id.current);
    id.current = window.setTimeout(fn, ms);
  }, []);
  useEffect(() => clear, [clear]);
  return { set };
}

/** A rich preview that opens when a link is hovered or focused, and stays open while the pointer is on it. */
export function HoverCard({ children, content, side = "bottom", align = "start", openDelay = 380, closeDelay = 180, className, accessibilityFeatures }: HoverCardProps) {
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const [open, setOpen] = useState(false);
  const timer = useTimeout();
  const { setAnchor, floatingRef, placement, floatingStyle } = useAnchored(open, side, align, 10);

  const schedule = (next: boolean) => {
    timer.set(() => setOpen(next), next ? openDelay : a11y.extendedTime ? closeDelay * 3 : closeDelay);
  };
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const p = children.props;
  const trigger = cloneElement(children, {
    ref: setAnchor as Ref<HTMLElement>,
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
              {...rootProps}
              variants={a11y.reduceMotion ? fadeVariants : popVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onPointerEnter={() => schedule(true)}
              onPointerLeave={() => schedule(false)}
              style={{ ...rootProps.style, ...floatingStyle, transformOrigin: originFor(placement) }}
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
