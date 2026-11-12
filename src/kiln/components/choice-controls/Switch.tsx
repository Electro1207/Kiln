import { forwardRef, useId, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { springFirm } from "../../motion";
import { useControllable, type Size } from "../../controllable";

/** How far the thumb grows into a pill while pressed, in px. */
const STRETCH = 5;
/** A touch quicker than springFirm: a switch is a small, frequent control. */
const thumbSpring = { ...springFirm, visualDuration: 0.36 };

const sizes = {
  sm: { track: "h-5 w-8", thumb: 16, travel: 12, pad: 2 },
  md: { track: "h-6 w-10", thumb: 20, travel: 16, pad: 2 },
  lg: { track: "h-7 w-12", thumb: 24, travel: 20, pad: 2 },
};

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "defaultChecked" | "children"> & {
  /** Controlled state. Leave out and use `defaultChecked` to let the switch keep its own. */
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  size?: Size;
  /** Put the switch on the right of its label, as in settings rows. */
  labelFirst?: boolean;
};

/** An on/off control. `<Switch label="Wi-Fi" defaultChecked />` is enough to start. */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked: checkedProp, defaultChecked = false, onCheckedChange, label, description, size = "md", disabled, className, labelFirst, id: idProp, ...rest },
  ref,
) {
  const [checked, setChecked] = useControllable(checkedProp, defaultChecked, onCheckedChange);
  const autoId = useId();
  const id = idProp ?? autoId;
  const s = sizes[size];
  const [pressed, setPressed] = useState(false);
  const release = () => setPressed(false);
  const stretch = pressed && !disabled ? STRETCH : 0;
  // Transform-only pill: two round caps and a bridge between them. While pressed the thumb grows
  // towards the middle of the track (the far cap moves), so nothing animates width or layout.
  const a = checked ? -stretch : 0;
  const b = checked ? 0 : stretch;
  const r = s.thumb / 2;
  const control = (
    <button
      {...rest}
      ref={ref}
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-describedby={description ? `${id}-d` : undefined}
      disabled={disabled}
      onClick={(e) => { rest.onClick?.(e); if (!e.defaultPrevented) setChecked(!checked); }}
      onPointerDown={(e) => { rest.onPointerDown?.(e); setPressed(true); }}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 ease-out-soft disabled:opacity-50",
        checked ? "bg-btn-primary" : "bg-line-strong",
        s.track,
      )}
    >
      <motion.span
        aria-hidden
        className="relative block"
        style={{ width: s.thumb, height: s.thumb, marginLeft: s.pad }}
        initial={false}
        animate={{ x: checked ? s.travel : 0 }}
        transition={thumbSpring}
      >
        <motion.span className="absolute left-0 top-0 rounded-full bg-white" style={{ width: s.thumb, height: s.thumb }} initial={false} animate={{ x: a }} transition={thumbSpring} />
        <motion.span className="absolute left-0 top-0 rounded-full bg-white" style={{ width: s.thumb, height: s.thumb }} initial={false} animate={{ x: b }} transition={thumbSpring} />
        <motion.span
          className="absolute top-0 bg-white"
          style={{ left: r, width: 1, height: s.thumb, originX: 0 }}
          initial={false}
          animate={{ x: a, scaleX: Math.max(b - a, 0.001) }}
          transition={thumbSpring}
        />
      </motion.span>
    </button>
  );
  if (!label) return <span className={className}>{control}</span>;
  return (
    <div className={cn("flex items-start gap-3", labelFirst && "flex-row-reverse justify-between", disabled && "opacity-50", className)}>
      <span className="pt-0.5">{control}</span>
      <div className="min-w-0">
        <label htmlFor={id} className="block cursor-pointer select-none text-sm font-medium text-ink">{label}</label>
        {description && <p id={`${id}-d`} className="text-[13px] text-muted">{description}</p>}
      </div>
    </div>
  );
});
