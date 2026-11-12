import { useId, useMemo, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, useDragControls, type PanInfo } from "motion/react";
import { X } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade, springFirm } from "../../motion";
import { Portal, useModalLayer } from "../shared/useOverlay";

/** Text used by Drawer. Pass a partial via `labels` to translate or reword. */
export interface DrawerLabels {
  /** aria-label of the close button. */
  close: string;
}
export const drawerLabels: DrawerLabels = { close: "Close" };

/** Icons used by Drawer. Pass a partial via `icons` to swap any of them. */
export interface DrawerIcons {
  /** Close button. */
  close: ReactNode;
}
export const drawerIcons: DrawerIcons = { close: <X /> };

export type DrawerSide = "left" | "right" | "bottom";

export type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: DrawerSide;
  /** Shown as the drawer's heading and its accessible name. */
  title?: ReactNode;
  /** Accessible name when there is no visible title. */
  label?: string;
  children?: ReactNode;
  footer?: ReactNode;
  /** Width for left/right drawers. Default 360px (capped at 88vw). */
  width?: number;
  className?: string;
  /** Classes for the body around `children`; e.g. "p-0 overflow-hidden" for content that scrolls itself. */
  bodyClassName?: string;
  /** Override any UI text. Merged over `drawerLabels`. */
  labels?: Partial<DrawerLabels>;
  /** Replace any built-in icon. Merged over `drawerIcons`. */
  icons?: Partial<DrawerIcons>;
};

const offscreen: Record<DrawerSide, { x?: string; y?: string }> = {
  left: { x: "-100%" },
  right: { x: "100%" },
  bottom: { y: "100%" },
};

/**
 * A panel that slides in from an edge. Drag it back towards its edge to close;
 * a quick flick is enough.
 */
export function Drawer(props: DrawerProps) {
  return (
    <Portal>
      <AnimatePresence>{props.open && <DrawerLayer key="drawer" {...props} />}</AnimatePresence>
    </Portal>
  );
}

function DrawerLayer({ onOpenChange, side = "right", title, label, children, footer, width = 360, className, bodyClassName, labels, icons }: DrawerProps) {
  const l = { ...drawerLabels, ...labels };
  const ic = useMemo(() => ({ ...drawerIcons, ...icons }), [icons]);
  const ref = useRef<HTMLDivElement>(null);
  const drag = useDragControls();
  const titleId = useId();
  const close = () => onOpenChange(false);
  useModalLayer(ref, close);

  const axis = side === "bottom" ? "y" : "x";
  const dir = side === "left" ? -1 : 1;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const offset = info.offset[axis] * dir;
    const velocity = info.velocity[axis] * dir;
    if (offset > 100 || velocity > 500) close();
  };

  const constraints = { top: 0, bottom: 0, left: 0, right: 0 };
  const elastic =
    side === "bottom" ? { top: 0.04, bottom: 0.8 } : side === "left" ? { left: 0.8, right: 0.04 } : { left: 0.04, right: 0.8 };

  return (
    <div className="fixed inset-0 z-50">
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-scrim"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.24, ease: easeOut } }}
        transition={fade}
        onClick={close}
      />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : label}
        tabIndex={-1}
        initial={offscreen[side]}
        animate={{ x: 0, y: 0 }}
        exit={{ ...offscreen[side], transition: { duration: 0.3, ease: easeOut } }}
        transition={springFirm}
        drag={axis}
        dragListener={side !== "bottom"}
        dragControls={drag}
        dragConstraints={constraints}
        dragElastic={elastic}
        dragMomentum={false}
        onDragEnd={onDragEnd}
        style={side === "bottom" ? undefined : { width: `min(${width}px, 88vw)` }}
        className={cn(
          "absolute flex flex-col bg-surface text-ink shadow-float outline-none dark:ring-1 dark:ring-line",
          side === "left" && "inset-y-0 left-0 rounded-r-sheet",
          side === "right" && "inset-y-0 right-0 rounded-l-sheet",
          side === "bottom" && "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-sheet pb-[env(safe-area-inset-bottom)]",
          className,
        )}
      >
        {side === "bottom" && (
          <div
            className="flex h-7 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
            onPointerDown={(e) => drag.start(e)}
          >
            <span className="h-1 w-10 rounded-full bg-line-strong" />
          </div>
        )}
        {title && (
          <div className={cn("flex items-center gap-3 px-5", side === "bottom" ? "pb-2" : "pb-2 pt-5")}>
            <h2 id={titleId} className="min-w-0 flex-1 truncate text-[17px] font-semibold">
              {title}
            </h2>
            <motion.button
              type="button"
              aria-label={l.close}
              onClick={close}
              whileTap={{ scale: 0.9 }}
              className="-mr-2 grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-ink [&>svg]:size-4"
            >
              {ic.close}
            </motion.button>
          </div>
        )}
        <div className={cn("min-h-0 flex-1 overflow-y-auto px-5 py-3", bodyClassName)}>{children}</div>
        {footer && <div className="flex gap-2 px-5 pb-5 pt-3">{footer}</div>}
      </motion.div>
    </div>
  );
}
