import { type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { easeOut, springSnappy } from "../../motion";
import { useControllable, type Size } from "../../controllable";

/** A button that stays pressed: bold, mute, favourite, follow. */
/** Text swaps hand over rather than overlap: the old words leave quickly, then the new ones arrive. */
const textSwap = (show: boolean) => (show ? { duration: 0.18, delay: 0.08, ease: easeOut } : { duration: 0.09, ease: easeOut });

export function ToggleButton({
  pressed: pressedProp, defaultPressed = false, onPressedChange, children, pressedChildren, icon, pressedIcon, className, size = "md", disabled, "aria-label": ariaLabel,
}: {
  /** Controlled state. Leave out and use `defaultPressed` to let the button keep its own. */
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (v: boolean) => void;
  disabled?: boolean;
  children?: ReactNode;
  /** Label shown while pressed ("Saved"). Shares a cell with `children`, so the width never jumps. */
  pressedChildren?: ReactNode;
  icon?: ReactNode;
  /** Shown instead of `icon` while pressed. */
  pressedIcon?: ReactNode;
  className?: string;
  size?: Size;
  "aria-label"?: string;
}) {
  const [pressed, setPressed] = useControllable(pressedProp, defaultPressed, onPressedChange);
  const swapIcon = !!pressedIcon;
  const swapLabel = pressedChildren != null;
  return (
    <motion.button
      type="button"
      aria-pressed={pressed}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => setPressed(!pressed)}
      whileTap={{ scale: 0.96 }}
      transition={springSnappy}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-control font-medium transition-[background-color,color] duration-200 ease-out-soft disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
        size === "sm" ? "h-8 min-w-8 px-2.5 text-[13px]" : size === "lg" ? "h-12 min-w-12 px-4 text-[15px]" : "h-10 min-w-10 px-3.5 text-sm",
        pressed ? "bg-btn-secondary text-btn-secondary-ink" : "bg-transparent text-muted hover:bg-raised hover:text-ink",
        className,
      )}
    >
      {icon && (
        <span className="grid size-4 shrink-0 [&>*]:[grid-area:1/1]" aria-hidden>
          <motion.span className="grid place-items-center" initial={false} animate={{ opacity: pressed && swapIcon ? 0 : 1, scale: pressed && swapIcon ? 0.7 : 1 }} transition={springSnappy}>
            {icon}
          </motion.span>
          {swapIcon && (
            <motion.span className={cn("grid place-items-center", pressed && "text-accent")} initial={false} animate={{ opacity: pressed ? 1 : 0, scale: pressed ? 1 : 0.7 }} transition={springSnappy}>
              {pressedIcon}
            </motion.span>
          )}
        </span>
      )}
      {children != null && (
        swapLabel ? (
          <span className="grid justify-items-center [&>*]:[grid-area:1/1]">
            <motion.span initial={false} animate={{ opacity: pressed ? 0 : 1 }} transition={textSwap(!pressed)} aria-hidden={pressed}>{children}</motion.span>
            <motion.span initial={false} animate={{ opacity: pressed ? 1 : 0 }} transition={textSwap(pressed)} aria-hidden={!pressed}>{pressedChildren}</motion.span>
          </span>
        ) : <span>{children}</span>
      )}
    </motion.button>
  );
}
