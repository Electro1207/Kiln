import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Clock } from "lucide-react";
import { cn } from "../../cn";
import { AnchoredLayer, SwapText } from "../shared/Anchored";
import { useControllable, type Size } from "../../controllable";
import { inputSizes } from "../shared/Field";

export type Time = { hours: number; minutes: number };

const ITEM = 36;
const VISIBLE = 5;
const pad = (n: number) => String(n).padStart(2, "0");
export const formatTime = (t: Time) => `${pad(t.hours)}:${pad(t.minutes)}`;

/** Text used by TimeWheels. Pass a partial via `labels` to translate or reword. */
export interface TimeWheelsLabels {
  /** aria-label of the hours wheel. */
  hours: string;
  /** aria-label of the minutes wheel. */
  minutes: string;
}
export const timeWheelsLabels: TimeWheelsLabels = { hours: "Hours", minutes: "Minutes" };

/** One scroll-snapping wheel. Native scrolling does the motion; rows fade with distance from the centre. */
function Wheel({ items, value, onChange, label }: { items: number[]; value: number; onChange: (v: number) => void; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const settle = useRef<number | undefined>(undefined);
  const index = Math.max(0, items.indexOf(value));

  const paint = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const center = el.scrollTop / ITEM;
    el.querySelectorAll<HTMLElement>("[data-i]").forEach((row) => {
      const d = Math.min(Math.abs(Number(row.dataset.i) - center), 3);
      row.style.opacity = String(1 - d * 0.28);
      row.style.transform = `scale(${1 - d * 0.06})`;
    });
  }, []);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && Math.round(el.scrollTop / ITEM) !== index) el.scrollTop = index * ITEM;
    paint();
  }, [index, paint]);

  useEffect(() => () => window.clearTimeout(settle.current), []);

  const onScroll = () => {
    requestAnimationFrame(paint);
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const i = Math.min(items.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM)));
      if (items[i] !== value) onChange(items[i]);
    }, 110);
  };

  const step = (n: number) => {
    const i = Math.min(items.length - 1, Math.max(0, index + n));
    ref.current?.scrollTo({ top: i * ITEM, behavior: "smooth" });
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); step(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); step(-1); }
    else if (e.key === "PageDown") { e.preventDefault(); step(4); }
    else if (e.key === "PageUp") { e.preventDefault(); step(-4); }
  };

  return (
    <div
      ref={ref}
      role="spinbutton"
      tabIndex={0}
      aria-label={label}
      aria-valuenow={value}
      aria-valuetext={pad(value)}
      aria-valuemin={items[0]}
      aria-valuemax={items[items.length - 1]}
      onScroll={onScroll}
      onKeyDown={onKey}
      className="relative z-[1] w-16 snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-control outline-offset-[-2px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ height: ITEM * VISIBLE, paddingBlock: ITEM * 2 }}
    >
      {items.map((n, i) => (
        <button
          key={n}
          type="button"
          tabIndex={-1}
          data-i={i}
          onClick={() => ref.current?.scrollTo({ top: i * ITEM, behavior: "smooth" })}
          className={cn(
            "flex w-full snap-center items-center justify-center text-[17px] tabular will-change-transform",
            n === value ? "font-medium text-ink" : "text-muted",
          )}
          style={{ height: ITEM }}
        >
          {pad(n)}
        </button>
      ))}
    </div>
  );
}

/** Hours and minutes as two wheels on a centre band. */
export function TimeWheels({ value, onChange, minuteStep = 5, labels }: {
  value: Time;
  onChange: (t: Time) => void;
  minuteStep?: number;
  /** Override any UI text. Merged over `timeWheelsLabels`. */
  labels?: Partial<TimeWheelsLabels>;
}) {
  const l = { ...timeWheelsLabels, ...labels };
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);
  return (
    <div className="relative flex items-center justify-center gap-1 px-3 py-2">
      <span aria-hidden className="pointer-events-none absolute inset-x-3 top-1/2 -translate-y-1/2 rounded-control bg-raised" style={{ height: ITEM }} />
      <Wheel label={l.hours} items={hours} value={value.hours} onChange={(h) => onChange({ ...value, hours: h })} />
      <span aria-hidden className="relative z-[1] pb-0.5 text-[17px] font-medium text-muted">:</span>
      <Wheel
        label={l.minutes}
        items={minutes}
        value={minutes.includes(value.minutes) ? value.minutes : 0}
        onChange={(m) => onChange({ ...value, minutes: m })}
      />
    </div>
  );
}

/** Icons used by TimePicker. Pass a partial via `icons` to replace them. */
export interface TimePickerIcons {
  /** Leading icon of the trigger. */
  clock: ReactNode;
}
export const timePickerIcons: TimePickerIcons = { clock: <Clock /> };

/** Text used by TimePicker. Pass a partial via `labels` to translate or reword. */
export interface TimePickerLabels extends TimeWheelsLabels {
  /** Trigger text when nothing is picked and the `placeholder` prop is not given. */
  placeholder: string;
  /** aria-label of the wheels popup. */
  dialog: string;
}
export const timePickerLabels: TimePickerLabels = { ...timeWheelsLabels, placeholder: "Pick a time", dialog: "Choose a time" };

export type TimePickerProps = {
  /** Selected time; leave out to let the component keep it. */
  value?: Time | null;
  /** Starting time when uncontrolled. */
  defaultValue?: Time | null;
  onChange?: (t: Time) => void;
  label?: string;
  placeholder?: string;
  /** Minutes between wheel stops. Defaults to 5. */
  minuteStep?: number;
  /** Trigger height and text size. Defaults to md. */
  size?: Size;
  /** Override any UI text. Merged over `timePickerLabels`. */
  labels?: Partial<TimePickerLabels>;
  /** Replace any built-in icon. Merged over `timePickerIcons`. */
  icons?: Partial<TimePickerIcons>;
  className?: string;
};

/** A button that opens hour and minute wheels. Controlled with `value` + `onChange`, or uncontrolled with `defaultValue`. */
export function TimePicker({ value: valueProp, defaultValue = null, onChange: onChangeProp, label, placeholder, minuteStep = 5, size = "md", labels, icons, className }: TimePickerProps) {
  const l = { ...timePickerLabels, ...labels };
  const ic = { ...timePickerIcons, ...icons };
  const id = useId();
  const [value, setValue] = useControllable<Time | null>(valueProp, defaultValue, (t) => t && onChangeProp?.(t));
  const onChange = (t: Time) => setValue(t);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const shown = value ?? { hours: 9, minutes: 0 };
  return (
    <div className={cn("k-fill flex min-w-0 flex-col gap-1.5", className)}>
      {label && (
        <span id={`${id}-label`} className="text-[13px] font-medium text-ink">
          {label}
        </span>
      )}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={label ? `${id}-label ${id}-value` : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2 rounded-control border border-line-strong bg-surface text-left",
          inputSizes[size],
          "transition-[border-color] duration-200 ease-out-soft hover:border-faint",
          open && "border-accent",
        )}
      >
        <span className="grid shrink-0 place-items-center text-muted [&>svg]:size-4" aria-hidden>{ic.clock}</span>
        <span id={`${id}-value`} className="min-w-0 flex-1">
          <SwapText value={value ? formatTime(value) : "none"} className={cn("tabular", !value && "text-muted")}>
            {value ? formatTime(value) : (placeholder ?? l.placeholder)}
          </SwapText>
        </span>
      </button>
      <AnchoredLayer open={open} onClose={() => setOpen(false)} anchor={triggerRef} role="dialog" aria-label={l.dialog}>
        <TimeWheels value={shown} onChange={onChange} minuteStep={minuteStep} labels={l} />
      </AnchoredLayer>
    </div>
  );
}
