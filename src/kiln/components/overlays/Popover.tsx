import { cloneElement, useEffect, useId, type ReactElement, type ReactNode, type Ref } from "react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { cn } from "../../cn";
import { useControllable } from "../../controllable";
import { fade, popVariants } from "../../motion";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";
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
  /** Controlled open state. Leave out to let the popover keep its own. */
  open?: boolean;
  /** Whether the uncontrolled popover starts open. Default false. */
  defaultOpen?: boolean;
  /** Called when it opens or closes, controlled or not. */
  onOpenChange?: (open: boolean) => void;
  /** Accessible name for the panel. */
  label?: string;
  /** No padding and no width rules: the content sets its own size (menus, inboxes). */
  bare?: boolean;
  className?: string;
  /** Accessibility features to add for this popover only (`reduceMotion` fades it in place instead of popping). Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

const fadeVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: fade }, exit: { opacity: 0, transition: { duration: 0.12 } } };

/** A small floating panel tied to a trigger. Closes on Esc, outside click, or `close()`. */
export function Popover({ trigger, children, side = "bottom", align = "center", open: openProp, defaultOpen = false, onOpenChange, label, bare, className, accessibilityFeatures }: PopoverProps) {
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const id = useId();
  const { anchorRef, setAnchor, focusAnchor, floatingRef, placement, floatingStyle } = useAnchored(open, side, align, 8);
  useDismiss(open, () => setOpen(false), [anchorRef, floatingRef]);

  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => floatingRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(raf);
  }, [open, floatingRef]);

  const close = () => {
    setOpen(false);
    focusAnchor();
  };

  const triggerEl = cloneElement(trigger, {
    ref: setAnchor as Ref<HTMLElement>,
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
              {...rootProps}
              variants={a11y.reduceMotion ? fadeVariants : popVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{ ...rootProps.style, ...floatingStyle, transformOrigin: originFor(placement) }}
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
