import { forwardRef, useMemo, type ReactElement, type ReactNode, type Ref, type RefAttributes } from "react";
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";
import { cn } from "../../cn";
import { press, spring, springSnappy } from "../../motion";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

/** Icons used by Button. Pass a partial via `icons` to replace any. */
export interface ButtonIcons {
  /** Shown while `loading`; it spins. */
  spinner: ReactNode;
}
export const buttonIcons: ButtonIcons = {
  spinner: (
    <svg viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

type ButtonOwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Icon before the label. */
  leading?: ReactNode;
  /** Icon after the label. */
  trailing?: ReactNode;
  children?: ReactNode;
  /** Replace any built-in icon. Merged over `buttonIcons`. */
  icons?: Partial<ButtonIcons>;
};

export type ButtonProps = Omit<HTMLMotionProps<"button">, "children"> & ButtonOwnProps & { href?: undefined };

/** A Button that goes somewhere: pass `href` and it renders as an `<a>` with the same look, sizes and press feel. */
export type ButtonLinkProps = Omit<HTMLMotionProps<"a">, "children" | "href"> &
  ButtonOwnProps & {
    href: string;
    /** Opens in a new tab with `rel="noreferrer"`. Explicit `target` and `rel` still win. */
    external?: boolean;
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

type ButtonComponent = {
  (props: ButtonProps & RefAttributes<HTMLButtonElement>): ReactElement | null;
  (props: ButtonLinkProps & RefAttributes<HTMLAnchorElement>): ReactElement | null;
};

/** The main action. Five variants, three sizes, optional icons and a loading state that keeps its width. Extra props and `ref` go to the `<button>`; with `href` it is an `<a>` that looks the same. */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps | ButtonLinkProps>(function Button(
  { variant = "primary", size = "md", loading = false, leading, trailing, children, className, icons, ...rest },
  ref,
) {
  const ic = useMemo(() => ({ ...buttonIcons, ...icons }), [icons]);
  const link = typeof rest.href === "string";
  const { disabled, ...buttonRest } = rest as Omit<ButtonProps, keyof ButtonOwnProps>;
  const inert = (!link && Boolean(disabled)) || loading;
  const classes = cn(
    "relative inline-flex select-none items-center justify-center whitespace-nowrap rounded-control font-medium",
    "transition-[background-color,color,opacity,border-color] duration-200 ease-out-soft",
    !link && disabled && "opacity-50",
    loading && link && "pointer-events-none",
    variants[variant],
    sizes[size],
    className,
  );
  const content = (
    <>
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
            <span className="grid animate-spin [&>svg]:size-4" aria-hidden>{ic.spinner}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );

  if (link) {
    const { external, ...anchor } = rest as Omit<ButtonLinkProps, keyof ButtonOwnProps>;
    return (
      <motion.a
        ref={ref as Ref<HTMLAnchorElement>}
        whileTap={inert ? undefined : press}
        transition={springSnappy}
        aria-busy={loading || undefined}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className={classes}
        {...anchor}
      >
        {content}
      </motion.a>
    );
  }
  return (
    <motion.button
      ref={ref as Ref<HTMLButtonElement>}
      whileTap={inert ? undefined : press}
      transition={springSnappy}
      disabled={inert}
      aria-busy={loading || undefined}
      className={classes}
      {...buttonRest}
    >
      {content}
    </motion.button>
  );
}) as ButtonComponent;
