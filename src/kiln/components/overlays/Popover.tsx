import { cloneElement, useEffect, useId, useState, type ReactElement, type ReactNode, type Ref } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../cn";
import { popVariants } from "../../motion";
import { originFor, Portal, useAnchored, useDismiss, type Align, type Side } from "../shared/useOverlay";

type TriggerProps = {
  ref?: Ref<HTMLElement>;
  onClick?: (e: React.MouseEvent) => void;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: "dialog";
  "aria-controls"?: string;
};

export type PopoverProps = {
  /** The element that opens it: a Button or any element that accepts a ref. */
  trigger: ReactElement<TriggerProps>;
  children: ReactNode | ((close: () => void) => ReactNode);
  side?: Side;
  align?: Align;
  /** Controlled open state (optional). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Accessible name for the panel. */
  label?: string;
  /** No padding and no width rules: the content sets its own size (menus, inboxes). */
  bare?: boolean;
  className?: string;
};

/** A small floating panel tied to a trigger. Closes on Esc, outside click, or `close()`. */
export function Popover({ trigger, children, side = "bottom", align = "center", open: openProp, onOpenChange, label, bare, className }: PopoverProps) {
  const [inner, setInner] = useState(false);
  const open = openProp ?? inner;
  const setOpen = (v: boolean) => {
    if (openProp === undefined) setInner(v);
    onOpenChange?.(v);
  };
  const id = useId();
  const { anchorRef, floatingRef, placement, floatingStyle } = useAnchored(open, side, align, 8);
  useDismiss(open, () => setOpen(false), [anchorRef, floatingRef]);

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => floatingRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(raf);
  }, [open, floatingRef]);

  const close = () => {
    setOpen(false);
    anchorRef.current?.focus({ preventScroll: true });
  };

  const triggerEl = cloneElement(trigger, {
    ref: anchorRef as Ref<HTMLElement>,
    onClick: (e: React.MouseEvent) => {
      trigger.props.onClick?.(e);
      setOpen(!open);
    },
    "aria-expanded": open,
    "aria-haspopup": "dialog",
    "aria-controls": open ? id : undefined,
  });

  return (
    <>
      {triggerEl}
      <Portal>
        <AnimatePresence>
          {open && (
            <motion.div
              key="popover"
              id={id}
              ref={floatingRef}
              role="dialog"
              aria-label={label}
              variants={popVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ ...floatingStyle, transformOrigin: originFor(placement) }}
              className={cn(
                "z-50 rounded-card border border-line bg-surface text-ink shadow-float",
                bare ? "overflow-hidden" : "w-max max-w-[calc(100vw-16px)] p-4",
                className,
              )}
            >
              {typeof children === "function" ? children(close) : children}
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
