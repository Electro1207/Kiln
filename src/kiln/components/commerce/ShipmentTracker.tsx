import { forwardRef, useMemo, type HTMLAttributes, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ClipboardCheck, Package, PackageCheck, Truck } from "lucide-react";
import { cn } from "../../cn";
import { fade, springFirm } from "../../motion";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";
import { useMediaQuery } from "../shared/useOverlay";

export type ShipmentStep = {
  /** Unique id, used by `current`. */
  id: string;
  label: string;
  /** A line under the label, e.g. where the parcel is. */
  description?: string;
  /** When it happened (or is expected). A Date, a timestamp or any date string. */
  at?: Date | number | string;
  /** The time is a guess, not a fact. */
  estimated?: boolean;
  /** Replaces the icon in the step's dot. */
  icon?: ReactNode;
};

/** The four steps of a typical delivery, with no times. Pass your own `steps` to change them. */
export const shipmentSteps: ShipmentStep[] = [
  { id: "ordered", label: "Ordered", icon: <ClipboardCheck /> },
  { id: "shipped", label: "Shipped", icon: <Package /> },
  { id: "out-for-delivery", label: "Out for delivery", icon: <Truck /> },
  { id: "delivered", label: "Delivered", icon: <PackageCheck /> },
];

const fallbackIcon = <Package />;

/** Text used by ShipmentTracker. Pass a partial via `labels` to translate or reword. */
export interface ShipmentTrackerLabels {
  /** aria-label of the list. */
  list: string;
  /** Spoken state added to each step. */
  state: { done: string; current: string; upcoming: string };
  /** Visible prefix of a time that is a guess. */
  estimated: string;
  /** Formats a step's time. Default: short weekday, day, month and time. */
  time: (at: Date) => string;
}
export const shipmentTrackerLabels: ShipmentTrackerLabels = {
  list: "Delivery progress",
  state: { done: "done", current: "current step", upcoming: "not yet" },
  estimated: "Est.",
  time: (at) =>
    new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(at),
};

/** Icons used by ShipmentTracker. Pass a partial via `icons` to swap any of them. */
export interface ShipmentTrackerIcons {
  /** In the dot of a finished step. */
  check: ReactNode;
}
export const shipmentTrackerIcons: ShipmentTrackerIcons = { check: <Check /> };

export type ShipmentTrackerProps = Omit<HTMLAttributes<HTMLOListElement>, "children"> & {
  /** The steps, in order. Default `shipmentSteps` (ordered, shipped, out for delivery, delivered). */
  steps?: ShipmentStep[];
  /** The step the parcel has reached: its id or its index. Everything before it is done. */
  current: string | number;
  /** "auto" runs across on wide screens and down on phones. Default auto. */
  orientation?: "auto" | "horizontal" | "vertical";
  /** Override any UI text. Merged over `shipmentTrackerLabels`. */
  labels?: Partial<ShipmentTrackerLabels>;
  /** Replace any built-in icon. Merged over `shipmentTrackerIcons`. */
  icons?: Partial<ShipmentTrackerIcons>;
  /** Accessibility features to add for this tracker only. Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

/** One part of the line between two dots. Fills along its length with a spring that stops dead. */
function Segment({ filled, vertical, hidden }: { filled: boolean; vertical: boolean; hidden?: boolean }) {
  return (
    <span aria-hidden className={cn("relative overflow-hidden bg-active", vertical ? "w-0.5 flex-1" : "h-0.5 flex-1", hidden && "invisible")}>
      <motion.span
        className={cn("absolute inset-0 bg-btn-primary", vertical ? "origin-top" : "origin-left")}
        initial={false}
        animate={vertical ? { scaleY: filled ? 1 : 0 } : { scaleX: filled ? 1 : 0 }}
        transition={springFirm}
      />
    </span>
  );
}

function Dot({ state, icon, check }: { state: "done" | "current" | "upcoming"; icon: ReactNode; check: ReactNode }) {
  const reached = state !== "upcoming";
  return (
    <span className="relative grid size-8 shrink-0 place-items-center rounded-full bg-active [&>*]:[grid-area:1/1]">
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full bg-btn-primary"
        initial={false}
        animate={{ opacity: reached ? 1 : 0 }}
        transition={{ ...fade, delay: reached ? 0.18 : 0 }}
      />
      <AnimatePresence initial={false}>
        {state === "current" && (
          <motion.span
            key="ring"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
            className="pointer-events-none absolute -inset-1 rounded-full border-2 border-accent"
          />
        )}
      </AnimatePresence>
      <span
        aria-hidden
        className={cn("relative grid place-items-center transition-colors duration-300 [&>svg]:size-4", reached ? "text-btn-primary-ink" : "text-muted", state === "done" && "[&>svg]:[stroke-width:3]")}
      >
        {state === "done" ? check : icon}
      </span>
    </span>
  );
}

/**
 * Where a parcel is: ordered, shipped, out for delivery, delivered, with the time of each.
 * The line fills towards the current step with a spring, the current step is marked with
 * `aria-current="step"`, and on a phone it runs top to bottom.
 */
export const ShipmentTracker = forwardRef<HTMLOListElement, ShipmentTrackerProps>(function ShipmentTracker(
  { steps = shipmentSteps, current, orientation = "auto", labels, icons, accessibilityFeatures, className, style, ...rest },
  ref,
) {
  const l = { ...shipmentTrackerLabels, ...labels, state: { ...shipmentTrackerLabels.state, ...labels?.state } };
  const ic = useMemo(() => ({ ...shipmentTrackerIcons, ...icons }), [icons]);
  const { rootProps } = useA11yProps(accessibilityFeatures);
  const wide = useMediaQuery("(min-width: 640px)");
  const vertical = orientation === "vertical" || (orientation === "auto" && !wide);
  const at = typeof current === "number" ? current : Math.max(0, steps.findIndex((s) => s.id === current));
  const last = steps.length - 1;

  return (
    <ol
      ref={ref}
      aria-label={l.list}
      {...rest}
      {...rootProps}
      className={cn("flex w-full", vertical ? "flex-col" : "items-start", className)}
      style={{ ...rootProps.style, ...style }}
    >
      {steps.map((s, i) => {
        const state = i < at ? "done" : i === at ? "current" : "upcoming";
        // The last step reached is the end of the line: shown as finished, still the current step to assistive tech.
        const shownState = i === last && at === last ? "done" : state;
        const date = s.at == null ? null : new Date(s.at);
        const when = date && !Number.isNaN(date.getTime()) ? date : null;
        const info = (
          <div className={cn("min-w-0", vertical ? "pb-7 pt-1" : "mt-3 px-1 text-center")}>
            <p className={cn("text-sm", state === "upcoming" ? "text-muted" : "font-medium text-ink")}>
              {s.label}
              <span className="sr-only">, {l.state[state]}</span>
            </p>
            {s.description && <p className="mt-0.5 text-[0.8125rem] text-muted">{s.description}</p>}
            {when && (
              <time dateTime={when.toISOString()} className="tabular mt-0.5 block text-xs text-muted">
                {s.estimated && `${l.estimated} `}
                {l.time(when)}
              </time>
            )}
          </div>
        );
        return (
          <li
            key={s.id}
            aria-current={state === "current" ? "step" : undefined}
            className={cn("flex min-w-0", vertical ? "gap-3" : "w-0 flex-1 flex-col")}
          >
            {vertical ? (
              <>
                <div className="flex flex-col items-center">
                  <Dot state={shownState} icon={s.icon ?? fallbackIcon} check={ic.check} />
                  {i < last && <span className="my-1 flex min-h-6 flex-1"><Segment vertical filled={i < at} /></span>}
                </div>
                {info}
              </>
            ) : (
              <>
                <div className="flex w-full items-center">
                  <Segment vertical={false} filled={i <= at && i > 0} hidden={i === 0} />
                  <Dot state={shownState} icon={s.icon ?? fallbackIcon} check={ic.check} />
                  <Segment vertical={false} filled={i < at} hidden={i === last} />
                </div>
                {info}
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
});
