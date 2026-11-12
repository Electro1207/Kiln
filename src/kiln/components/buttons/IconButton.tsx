import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "../../cn";
import { springSnappy } from "../../motion";

export type IconButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  /** Required: an icon-only button has no visible name. */
  "aria-label": string;
  icon: ReactNode;
  variant?: "solid" | "soft" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  shape?: "round" | "square";
};

const variants = {
  solid: "bg-btn-primary text-btn-primary-ink hover:bg-btn-primary-hover",
  soft: "bg-btn-secondary text-btn-secondary-ink hover:bg-btn-secondary-hover",
  ghost: "text-muted hover:text-ink hover:bg-raised",
  outline: "border border-line-strong text-ink hover:bg-raised",
};
const sizes = { sm: "size-8 [&_svg]:size-4", md: "size-10 [&_svg]:size-[18px]", lg: "size-12 [&_svg]:size-5" };

/** A square or round button with only an icon. Needs an `aria-label`. Sizes sm, md and lg are 32, 40 and 48px. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, variant = "ghost", size = "md", shape = "round", className, disabled, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type="button"
      whileTap={disabled ? undefined : { scale: 0.9 }}
      transition={springSnappy}
      disabled={disabled}
      className={cn(
        "inline-grid shrink-0 place-items-center transition-[background-color,color] duration-200 ease-out-soft disabled:opacity-50",
        shape === "round" ? "rounded-full" : "rounded-control",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {icon}
    </motion.button>
  );
});
