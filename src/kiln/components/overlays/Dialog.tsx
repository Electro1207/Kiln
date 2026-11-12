import { useId, useMemo, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, useDragControls, type PanInfo } from "motion/react";
import { X } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade, springFirm, springSoft } from "../../motion";
import { Portal, useIsPhone, useModalLayer } from "../shared/useOverlay";

/** Text used by Dialog. Pass a partial via `labels` to translate or reword. */
export interface DialogLabels {
  /** aria-label of the corner close button. */
  close: string;
}
export const dialogLabels: DialogLabels = { close: "Close" };

/** Icons used by Dialog. Pass a partial via `icons` to swap any of them. */
export interface DialogIcons {
  /** Close button. */
  close: ReactNode;
}
export const dialogIcons: DialogIcons = { close: <X /> };

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Buttons, right-aligned on desktop, stacked full width on a phone. */
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** Close on scrim click and Esc. Default true. */
  dismissible?: boolean;
  /** "alertdialog" for confirmations that need an answer. */
  role?: "dialog" | "alertdialog";
  /** Hide the corner close button. */
  hideClose?: boolean;
  /** Override any UI text. Merged over `dialogLabels`. */
  labels?: Partial<DialogLabels>;
  /** Replace any built-in icon. Merged over `dialogIcons`. */
  icons?: Partial<DialogIcons>;
  className?: string;
};

const widths = { sm: "sm:max-w-sm", md: "sm:max-w-md", lg: "sm:max-w-2xl" };

/**
 * A modal window. Scales up from 96% on desktop; on a phone it becomes a
 * bottom sheet you can drag down to close.
 */
export function Dialog(props: DialogProps) {
  return (
    <Portal>
      <AnimatePresence>{props.open && <DialogLayer key="dialog" {...props} />}</AnimatePresence>
    </Portal>
  );
}

function DialogLayer({
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  dismissible = true,
  role = "dialog",
  hideClose,
  labels,
  icons,
  className,
}: DialogProps) {
  const l = { ...dialogLabels, ...labels };
  const ic = useMemo(() => ({ ...dialogIcons, ...icons }), [icons]);
  const ref = useRef<HTMLDivElement>(null);
  const phone = useIsPhone();
  const drag = useDragControls();
  const titleId = useId();
  const descId = useId();
  const close = () => dismissible && onOpenChange(false);
  useModalLayer(ref, close);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-scrim"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.2, ease: easeOut } }}
        transition={fade}
        onClick={close}
      />
      <motion.div
        ref={ref}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        initial={phone ? { y: "100%" } : { opacity: 0, scale: 0.96, y: 8 }}
        animate={phone ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
        exit={
          phone
            ? { y: "100%", transition: { duration: 0.28, ease: easeOut } }
            : { opacity: 0, scale: 0.98, y: 4, transition: { duration: 0.16, ease: easeOut } }
        }
        transition={phone ? springFirm : springSoft}
        drag={phone ? "y" : false}
        dragListener={false}
        dragControls={drag}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.05, bottom: 0.7 }}
        onDragEnd={onDragEnd}
        className={cn(
          "relative flex max-h-[88dvh] w-full flex-col bg-surface text-ink shadow-float outline-none dark:ring-1 dark:ring-line",
          "rounded-t-sheet pb-[env(safe-area-inset-bottom)] sm:rounded-sheet sm:pb-0",
          widths[size],
          className,
        )}
      >
        {phone && (
          <div
            className="flex h-6 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
            onPointerDown={(e) => drag.start(e)}
          >
            <span className="h-1 w-10 rounded-full bg-line-strong" />
          </div>
        )}
        <div className={cn("flex items-start gap-4 px-5 sm:px-6", phone ? "pt-1" : "pt-6")}>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-[17px] font-semibold leading-snug">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1.5 text-sm text-muted">
                {description}
              </p>
            )}
          </div>
          {!hideClose && dismissible && (
            <motion.button
              type="button"
              aria-label={l.close}
              onClick={() => onOpenChange(false)}
              whileTap={{ scale: 0.9 }}
              className="-mr-2 -mt-1 grid size-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-ink [&>svg]:size-4"
            >
              {ic.close}
            </motion.button>
          )}
        </div>
        {children != null && <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-4 sm:px-6">{children}</div>}
        {footer && (
          <div className="flex flex-col-reverse gap-2 px-5 pb-5 pt-5 sm:flex-row sm:justify-end sm:px-6 sm:pb-6 [&>*]:w-full sm:[&>*]:w-auto">
            {footer}
          </div>
        )}
        {!footer && <div className="h-5 sm:h-6" />}
      </motion.div>
    </div>
  );
}
