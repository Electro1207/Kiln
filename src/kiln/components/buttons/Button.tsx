import { forwardRef, type ReactNode } from "react";
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";
import { cn } from "../../cn";
import { press, spring, springSnappy } from "../../motion";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Icon before the label. */
  leading?: ReactNode;
  /** Icon after the label. */
  trailing?: ReactNode;
  children?: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-btn-primary text-btn-primary-ink hover:bg-btn-primary-hover",
  secondary: "bg-btn-secondary text-btn-secondary-ink hover:bg-btn-secondary-hover",
  ghost: "bg-transparent text-ink hover:bg-raised",
  outline: "bg-transparent text-ink border border-line-strong hover:bg-raised",
  danger: "bg-btn-danger text-btn-danger-ink hover:bg-btn-danger-hover",
};

const sizes: Record<ButtonSize, string> = {
  sm: "k-ctl-sm px-3 gap-1.5",
  md: "k-ctl-md px-4 gap-2",
  lg: "k-ctl-lg px-6 gap-2.5",
};

/** The main action. Five variants, three sizes, optional icons and a loading state that keeps its width. Extra props and `ref` go to the `<button>`. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, leading, trailing, children, className, disabled, ...rest },
  ref,
) {
  const inert = disabled || loading;
  return (
    <motion.button
      ref={ref}
      whileTap={inert ? undefined : press}
      transition={springSnappy}
      disabled={inert}
      aria-busy={loading || undefined}
      className={cn(
        "relative inline-flex select-none items-center justify-center whitespace-nowrap rounded-control font-medium",
        "transition-[background-color,color,opacity,border-color] duration-200 ease-out-soft",
        disabled && "opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      <motion.span
        className={cn("inline-flex items-center", sizes[size].split(" ").find((c) => c.startsWith("gap-")))}
        animate={loading ? { opacity: 0, scale: 0.92, filter: "blur(2px)" } : { opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={spring}
      >
        {leading && <span className="inline-flex shrink-0 [&>svg]:size-4">{leading}</span>}
        {children}
        {trailing && <span className="inline-flex shrink-0 [&>svg]:size-4">{trailing}</span>}
      </motion.span>
      <AnimatePresence>
        {loading && (
          <motion.span
            key="spin"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={springSnappy}
            className="absolute inset-0 grid place-items-center"
          >
            <Spinner />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
});

function Spinner() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 animate-spin" aria-hidden>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
