import { forwardRef, useEffect, useRef } from "react";
import { AnimatePresence, motion, useAnimate, type HTMLMotionProps } from "motion/react";
import { Bell } from "lucide-react";
import { cn } from "../../cn";
import { press, springSnappy, springSoft } from "../../motion";

/** Text used by NotificationBell. Pass a partial via `labels` to translate or reword. */
export interface NotificationBellLabels {
  /** aria-label of the button. */
  notifications: string;
  /** aria-label when there are unread notices. */
  unread: (count: number) => string;
}
export const notificationBellLabels: NotificationBellLabels = {
  notifications: "Notifications",
  unread: (n) => `Notifications, ${n} unread`,
};

export type NotificationBellProps = Omit<HTMLMotionProps<"button">, "children"> & {
  count: number;
  /** Counts above this show as "99+". */
  max?: number;
  /** Override any UI text. Merged over `notificationBellLabels`. */
  labels?: Partial<NotificationBellLabels>;
};

/** A bell with an unread count. When the count goes up the bell rings once and the number rolls. */
export const NotificationBell = forwardRef<HTMLButtonElement, NotificationBellProps>(function NotificationBell(
  { count, max = 99, labels, className, ...rest },
  ref,
) {
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const [badge, animateBadge] = useAnimate<HTMLSpanElement>();
  const l = { ...notificationBellLabels, ...labels };
  const prev = useRef(count);
  const up = count > prev.current;

  useEffect(() => {
    if (count > prev.current && scope.current) {
      animate(
        scope.current,
        { rotate: [0, 16, -13, 9, -6, 3, 0] },
        { duration: 0.75, ease: "easeOut" },
      );
      if (prev.current > 0 && badge.current) animateBadge(badge.current, { scale: [1, 1.22, 1] }, { duration: 0.42, ease: [0.22, 1, 0.36, 1] });
    }
    prev.current = count;
  }, [count, animate, scope, animateBadge, badge]);

  const text = count > max ? `${max}+` : String(count);

  return (
    <motion.button
      ref={ref}
      type="button"
      whileTap={press}
      transition={springSoft}
      aria-label={count > 0 ? l.unread(count) : l.notifications}
      className={cn(
        "relative grid size-10 place-items-center rounded-full text-ink transition-colors hover:bg-raised",
        className,
      )}
      {...rest}
    >
      <span ref={scope} className="inline-flex" style={{ transformOrigin: "50% 2px" }}>
        <Bell className="size-5" />
      </span>
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key="badge"
            ref={badge}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={springSoft}
            className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center overflow-hidden rounded-full bg-btn-danger px-1 text-[11px] font-semibold leading-none text-btn-danger-ink tabular ring-2 ring-surface"
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={text}
                initial={{ y: up ? 10 : -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: up ? -10 : 10, opacity: 0 }}
                transition={springSnappy}
              >
                {text}
              </motion.span>
            </AnimatePresence>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
});
