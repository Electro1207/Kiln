import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, spring } from "../../motion";

export type CardProps = HTMLMotionProps<"div"> & { padded?: boolean };

/** A bordered surface. Padded by default; pass `padded={false}` to opt out. Extra props and `ref` go to the root. */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ padded = true, className, ...rest }, ref) {
  return (
    <motion.div
      ref={ref}
      className={cn("min-w-0 rounded-card border border-line bg-surface text-ink", padded && "p-5", className)}
      {...rest}
    />
  );
});

/** A title row for a Card, with an optional description and action on the right. */
export function CardHeader({ title, description, action }: { title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export type MediaCardProps = {
  image: string;
  alt: string;
  title: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
  href?: string;
  /** Makes the whole card a button, e.g. to open a detail dialog. */
  onClick?: () => void;
  className?: string;
};

export function MediaCard({ image, alt, title, meta, children, href, onClick, className }: MediaCardProps) {
  const body = (
    <>
      <div className="relative aspect-[4/3] overflow-hidden bg-raised">
        <motion.img decoding="async"
          src={image}
          alt={alt}
          width={640}
          height={480}
          loading="lazy"
          className="size-full object-cover"
          variants={{ rest: { scale: 1 }, hover: { scale: 1.06 } }}
          transition={{ duration: 1.2, ease: easeOut }}
        />
      </div>
      <div className="flex flex-col gap-1 p-4">
        {meta && <span className="text-xs text-muted">{meta}</span>}
        <span className="font-semibold text-ink">{title}</span>
        {children && <div className="text-sm text-muted">{children}</div>}
      </div>
    </>
  );
  const shared = {
    initial: "rest",
    whileHover: "hover",
    whileFocus: "hover",
    animate: "rest",
    className: cn("group block min-w-0 overflow-hidden rounded-card border border-line bg-surface", className),
  } as const;
  if (onClick) {
    return (
      <motion.button type="button" onClick={onClick} {...shared} className={cn(shared.className, "w-full cursor-pointer text-left outline-offset-2")}>
        {body}
      </motion.button>
    );
  }
  return href ? (
    <motion.a href={href} {...shared}>
      {body}
    </motion.a>
  ) : (
    <motion.article {...shared}>{body}</motion.article>
  );
}

/** Icons used by InteractiveCard. Pass a partial via `icons` to replace any. */
export interface InteractiveCardIcons {
  /** The arrow at the right that nudges on hover. */
  arrow: ReactNode;
}
export const interactiveCardIcons: InteractiveCardIcons = { arrow: <ArrowUpRight /> };

export type InteractiveCardProps = Omit<HTMLMotionProps<"button">, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  selected?: boolean;
  /** Replace any built-in icon. Merged over `interactiveCardIcons`. */
  icons?: Partial<InteractiveCardIcons>;
};

/** A card that is a button: hover lift, press, and a `selected` state for choosing between options. */
export const InteractiveCard = forwardRef<HTMLButtonElement, InteractiveCardProps>(function InteractiveCard(
  { title, description, leading, selected, icons, className, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type="button"
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      whileTap={{ scale: 0.985 }}
      transition={spring}
      aria-pressed={selected}
      className={cn(
        "flex w-full min-w-0 items-start gap-3 rounded-card border bg-surface p-4 text-left",
        "transition-[background-color,border-color] duration-200 ease-out-soft",
        selected ? "border-accent bg-accent-soft" : "border-line hover:bg-raised",
        className,
      )}
      {...rest}
    >
      {leading && <span className="grid size-9 shrink-0 place-items-center rounded-control bg-active text-ink [&>svg]:size-4">{leading}</span>}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-medium text-ink">{title}</span>
        {description && <span className="text-[13px] text-muted">{description}</span>}
      </span>
      <motion.span
        aria-hidden
        className="shrink-0 text-muted [&>svg]:size-4"
        variants={{ rest: { x: 0, y: 0, opacity: 0.5 }, hover: { x: 2, y: -2, opacity: 1 } }}
        transition={spring}
      >
        {icons?.arrow ?? interactiveCardIcons.arrow}
      </motion.span>
    </motion.button>
  );
});
