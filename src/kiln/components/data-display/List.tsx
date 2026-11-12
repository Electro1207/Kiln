import { useRef, type ReactNode, type Ref } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type PanInfo } from "motion/react";
import { cn } from "../../cn";
import { springFirm } from "../../motion";

export type ListAction = {
  label: string;
  icon: ReactNode;
  tone?: "neutral" | "danger" | "accent";
  onSelect: () => void;
};

/** Text used by ListItem. Pass a partial via `labels` to translate or reword. */
export interface ListItemLabels {
  /** aria-label of a row that has actions but no click handler, given its title and the action labels. */
  rowWithActions: (title: string, actions: string[]) => string;
}
export const listItemLabels: ListItemLabels = { rowWithActions: (title, actions) => `${title}. Actions: ${actions.join(", ")}` };

export type ListItemProps = {
  title: ReactNode;
  description?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** Revealed by swiping left on touch, or by focusing the row (Tab), then Tab again into the actions. Wrap items in <AnimatePresence initial={false}> to animate removal. */
  actions?: ListAction[];
  onClick?: () => void;
  className?: string;
  ref?: Ref<HTMLLIElement>;
  /** Override any UI text. Merged over `listItemLabels`. */
  labels?: Partial<ListItemLabels>;
};

const ACTION_W = 72;
const tones = {
  neutral: "bg-btn-secondary text-btn-secondary-ink hover:bg-btn-secondary-hover",
  accent: "bg-btn-primary text-btn-primary-ink hover:bg-btn-primary-hover",
  danger: "bg-btn-danger text-btn-danger-ink hover:bg-btn-danger-hover",
};

/** A vertical list of ListItem rows. */
export function List({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <ul aria-label={label} className={cn("overflow-hidden rounded-card border border-line bg-surface", className)}>
      {children}
    </ul>
  );
}

/** A list row with a title, description, leading and trailing content, and actions. */
export function ListItem({ title, description, leading, trailing, actions, onClick, className, ref, labels }: ListItemProps) {
  const l = { ...listItemLabels, ...labels };
  const x = useMotionValue(0);
  const width = (actions?.length ?? 0) * ACTION_W;
  const actionsOpacity = useTransform(x, [-width, -16, 0], [1, 0.4, 0]);
  const rowRef = useRef<HTMLLIElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  // While the row is shut its actions are invisible (not just transparent), so
  // they can't be hovered, clicked or tabbed to through the row. Set straight
  // from the motion value: no re-render per frame.
  useMotionValueEvent(x, "change", (v) => {
    if (actionsRef.current) actionsRef.current.style.visibility = v < -0.5 ? "visible" : "hidden";
  });

  const settle = (target: number) => animate(x, target, springFirm);
  const onDragEnd = (_: unknown, info: PanInfo) => {
    const open = info.offset.x < -width / 2 || info.velocity.x < -400;
    settle(open && !(info.velocity.x > 400) ? -width : 0);
  };

  return (
    <motion.li
      ref={(el: HTMLLIElement | null) => {
        rowRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) ref.current = el;
      }}
      initial={false}
      exit={{ opacity: 0, height: 0, borderBottomWidth: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
      className={cn("relative overflow-hidden border-b border-line bg-surface outline-offset-[-2px] last:border-b-0", className)}
      tabIndex={width && !onClick ? 0 : undefined}
      aria-label={width && !onClick && typeof title === "string" ? l.rowWithActions(title, actions!.map((a) => a.label)) : undefined}
      onFocus={() => {
        if (width) settle(-width);
      }}
      onBlur={(e) => {
        if (width && !rowRef.current?.contains(e.relatedTarget as Node)) settle(0);
      }}
    >
      {actions && actions.length > 0 && (
        <motion.div
          ref={(el: HTMLDivElement | null) => {
            actionsRef.current = el;
            if (el) el.style.visibility = x.get() < -0.5 ? "visible" : "hidden";
          }}
          className="absolute inset-y-0 right-0 flex"
          style={{ opacity: actionsOpacity }}
        >
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => {
                a.onSelect();
                settle(0);
              }}
              className={cn(
                "flex h-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-200 [&>svg]:size-4",
                tones[a.tone ?? "neutral"],
              )}
              style={{ width: ACTION_W }}
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </motion.div>
      )}
      <motion.div
        drag={width ? "x" : false}
        dragDirectionLock
        dragConstraints={{ left: -width, right: 0 }}
        dragElastic={{ left: 0.12, right: 0.04 }}
        onDragEnd={onDragEnd}
        style={{ x, touchAction: "pan-y" }}
        className="relative flex min-h-16 items-center gap-3 bg-surface px-4 py-3"
      >
        {onClick && <button type="button" onClick={onClick} className="absolute inset-0 transition-colors hover:bg-raised" aria-label={typeof title === "string" ? title : undefined} />}
        {leading && <span className="pointer-events-none relative shrink-0">{leading}</span>}
        <span className="pointer-events-none relative flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium text-ink">{title}</span>
          {description && <span className="truncate text-[13px] text-muted">{description}</span>}
        </span>
        {trailing && <span className="relative shrink-0 text-[13px] text-muted">{trailing}</span>}
      </motion.div>
    </motion.li>
  );
}
