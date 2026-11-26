import { forwardRef, useEffect, useImperativeHandle, useRef, type MouseEvent, type ReactNode } from "react";
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";
import { AlertCircle } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, springFirm } from "../../motion";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

/** One problem: the id of the field it belongs to, and what is wrong. */
export type ErrorSummaryItem = { id: string; message: ReactNode };

/** Text used by ErrorSummary. Pass a partial via `labels` to translate or reword. */
export interface ErrorSummaryLabels {
  /** Heading when there is more than one error. */
  title: (count: number) => string;
}
export const errorSummaryLabels: ErrorSummaryLabels = {
  title: (n) => (n === 1 ? "There is 1 problem with this form" : `There are ${n} problems with this form`),
};

/** Icons used by ErrorSummary. Pass a partial via `icons` to replace them. */
export interface ErrorSummaryIcons {
  /** Beside the heading. */
  alert: ReactNode;
}
export const errorSummaryIcons: ErrorSummaryIcons = { alert: <AlertCircle /> };

export type ErrorSummaryProps = Omit<HTMLMotionProps<"div">, "title" | "children" | "ref"> & {
  /** What is wrong, one entry per field. `id` is the id of the field's input. Empty hides the summary. */
  errors: ErrorSummaryItem[];
  /** Heading. Defaults to "There are N problems with this form". */
  title?: ReactNode;
  /** Move focus to the summary when errors appear. Default true. */
  autoFocus?: boolean;
  /** Change this (a submit counter) to move focus to the summary again after another failed submit. */
  focusKey?: string | number;
  /** Called after a link has focused its field. */
  onItemClick?: (item: ErrorSummaryItem) => void;
  /** Override any UI text. Merged over `errorSummaryLabels`. */
  labels?: Partial<ErrorSummaryLabels>;
  /** Replace any built-in icon. Merged over `errorSummaryIcons`. */
  icons?: Partial<ErrorSummaryIcons>;
  /** Turn accessibility features on for this component only. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

/** Focus a field by id and bring it into view. Falls back to the element's first focusable child. */
function focusField(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  const target = el.matches("input,select,textarea,button,[tabindex]") ? el : el.querySelector<HTMLElement>("input,select,textarea,button,[tabindex]") ?? el;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || !!document.querySelector("[data-k-reduce-motion]");
  target.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  target.focus({ preventScroll: true });
  return true;
}

/**
 * The list of everything wrong with a form, shown above it after a failed submit. It takes focus,
 * is announced as an alert, and each line is a link that jumps to its field.
 */
export const ErrorSummary = forwardRef<HTMLDivElement, ErrorSummaryProps>(function ErrorSummary(
  { errors, title, autoFocus = true, focusKey, onItemClick, labels, icons, accessibilityFeatures, className, style, ...rest },
  ref,
) {
  const l = { ...errorSummaryLabels, ...labels };
  const ic = { ...errorSummaryIcons, ...icons };
  const { rootProps } = useA11yProps(accessibilityFeatures);
  const show = errors.length > 0;
  return (
    <AnimatePresence initial={false}>
      {show && (
        <Panel
          key="summary"
          ref={ref}
          {...rest}
          {...rootProps}
          style={{ ...rootProps.style, ...style }}
          className={className}
          errors={errors}
          heading={title ?? l.title(errors.length)}
          icon={ic.alert}
          autoFocus={autoFocus}
          focusKey={focusKey}
          onItemClick={onItemClick}
        />
      )}
    </AnimatePresence>
  );
});

type PanelProps = Omit<ErrorSummaryProps, "title" | "labels" | "icons" | "accessibilityFeatures"> & { heading: ReactNode; icon: ReactNode };

const Panel = forwardRef<HTMLDivElement, PanelProps>(function Panel(
  { errors, heading, icon, autoFocus, focusKey, onItemClick, className, style, ...rest },
  ref,
) {
  const box = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => box.current!);
  useEffect(() => {
    if (autoFocus) box.current?.focus({ preventScroll: false });
  }, [autoFocus, focusKey]);

  const go = (e: MouseEvent, item: ErrorSummaryItem) => {
    e.preventDefault();
    if (focusField(item.id)) onItemClick?.(item);
  };

  return (
    <motion.div
      ref={box}
      role="alert"
      tabIndex={-1}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0, transition: springFirm }}
      exit={{ opacity: 0, y: -4, transition: { duration: 0.14, ease: easeOut } }}
      {...rest}
      style={style}
      className={cn("rounded-card border border-negative bg-negative-soft p-4 text-ink outline-none focus-visible:ring-[3px] focus-visible:ring-negative/30", className)}
    >
      <h2 className="flex items-center gap-2 text-[0.9375rem] font-semibold">
        <span className="grid shrink-0 text-negative [&>svg]:size-4" aria-hidden>{icon}</span>
        {heading}
      </h2>
      <ul className="mt-2 space-y-1 pl-6">
        {errors.map((item) => (
          <li key={item.id} className="list-disc text-sm marker:text-negative">
            <a
              href={`#${item.id}`}
              onClick={(e) => go(e, item)}
              className="rounded-[4px] font-medium text-negative underline underline-offset-2 hover:no-underline"
            >
              {item.message}
            </a>
          </li>
        ))}
      </ul>
    </motion.div>
  );
});
