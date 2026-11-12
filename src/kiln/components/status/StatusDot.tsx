import { useRef, type HTMLAttributes, type Ref } from "react";
import { useLoop } from "../shared/useLoop";
import { cn } from "../../cn";

export type Status = "online" | "busy" | "away" | "offline";

const colour: Record<Status, string> = {
  online: "bg-positive",
  busy: "bg-negative",
  away: "bg-warning",
  offline: "bg-faint",
};

/** Text used by StatusDot. Pass a partial via `labels` to translate or reword. */
export interface StatusDotLabels {
  /** Name of each status. */
  status: Record<Status, string>;
}
export const statusDotLabels: StatusDotLabels = { status: { online: "Online", busy: "Busy", away: "Away", offline: "Offline" } };

export type StatusDotProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  status: Status;
  /** A slow ring that breathes out from the dot, for things that are live right now. */
  pulse?: boolean;
  /** Show the status as text beside the dot. */
  showLabel?: boolean;
  /** Override the label text. */
  label?: string;
  /** Dot diameter in pixels. Defaults to 8. */
  size?: number;
  /** Override any UI text. Merged over `statusDotLabels`. */
  labels?: Partial<StatusDotLabels>;
  ref?: Ref<HTMLSpanElement>;
};

/** A presence or health dot. */
export function StatusDot({ status, pulse, showLabel, label, size = 8, labels, className, ref, ...rest }: StatusDotProps) {
  const l = { ...statusDotLabels, ...labels };
  const text = label ?? l.status[status];
  const ring = useRef<HTMLSpanElement>(null);
  useLoop(
    ring,
    (el) =>
      pulse
        ? [el.animate([{ transform: "scale(1)", opacity: 0.55 }, { transform: "scale(2.8)", opacity: 0 }], { duration: 1800, endDelay: 400, iterations: Infinity, easing: "cubic-bezier(0.22, 1, 0.36, 1)" })]
        : [],
    [pulse],
  );
  return (
    <span ref={ref} {...rest} className={cn("inline-flex items-center gap-2 text-sm", className)}>
      <span className="relative inline-flex" style={{ width: size, height: size }} role="img" aria-label={showLabel ? undefined : text}>
        <span ref={ring} aria-hidden className={cn("absolute inset-0 rounded-full", colour[status], !pulse && "hidden")} style={{ opacity: 0 }} />
        <span className={cn("relative size-full rounded-full transition-colors duration-300", colour[status])} />
      </span>
      {showLabel && <span className="text-ink">{text}</span>}
    </span>
  );
}
