import { Children, cloneElement, forwardRef, isValidElement, useLayoutEffect, useRef, type ReactElement, type ReactNode } from "react";
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";
import { X } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, spring, springSnappy } from "../../motion";
import type { Size } from "../../controllable";

export type TagTone = "neutral" | "accent" | "positive" | "negative" | "warning" | "info";

/** Text used by Tag. Pass a partial via `labels` to translate or reword. */
export interface TagLabels {
  /** aria-label of the remove button, given the tag text (or `tag` when it is not plain text). */
  remove: (name: string) => string;
  /** Name used in the remove label when the children are not a string. */
  tag: string;
}
export const tagLabels: TagLabels = { remove: (name) => `Remove ${name}`, tag: "tag" };

export type TagProps = Omit<HTMLMotionProps<"span">, "children"> & {
  children: ReactNode;
  tone?: TagTone;
  /** Height and text size. Defaults to md. */
  size?: Size;
  leading?: ReactNode;
  /** Shows a remove button. */
  onRemove?: () => void;
  /** Override any UI text. Merged over `tagLabels`. */
  labels?: Partial<TagLabels>;
  /** Replace any built-in icon. Merged over `tagIcons`. */
  icons?: Partial<TagIcons>;
};

export interface TagIcons {
  /** Remove button. */
  remove: ReactNode;
}
export const tagIcons: TagIcons = { remove: <X /> };

const tagSizes: Record<Size, string> = { sm: "h-6 text-xs", md: "h-7 text-[13px]", lg: "h-8 text-sm" };

const tones: Record<TagTone, string> = {
  neutral: "bg-active text-ink",
  accent: "bg-accent-soft text-accent",
  positive: "bg-positive-soft text-positive",
  negative: "bg-negative-soft text-negative",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
};

/** A tag or chip. Put a list of them in <TagGroup> for smooth add and remove. */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { children, tone = "neutral", size = "md", leading, onRemove, className, labels, icons, ...rest },
  ref,
) {
  const l = { ...tagLabels, ...labels };
  const ic = { ...tagIcons, ...icons };
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.12, ease: easeOut } }}
      transition={spring}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium",
        tagSizes[size],
        onRemove ? "pl-2.5 pr-1" : "px-2.5",
        tones[tone],
        className,
      )}
      {...rest}
    >
      {leading && <span className="inline-flex [&>svg]:size-3.5">{leading}</span>}
      {children}
      {onRemove && (
        <motion.button
          type="button"
          onClick={onRemove}
          whileTap={{ scale: 0.85 }}
          transition={springSnappy}
          aria-label={l.remove(typeof children === "string" ? children : l.tag)}
          className="grid size-5 place-items-center rounded-full opacity-70 transition-[opacity,background-color] hover:bg-ink/10 hover:opacity-100 [&>svg]:size-3 [&>svg]:stroke-[2.5]"
        >
          {ic.remove}
        </motion.button>
      )}
    </motion.span>
  );
});

function flipRects(box: HTMLElement | null) {
  const m = new Map<string, { x: number; y: number }>();
  if (!box) return m;
  const o = box.getBoundingClientRect();
  box.querySelectorAll<HTMLElement>("[data-flip]").forEach((el) => {
    const r = el.getBoundingClientRect();
    m.set(el.dataset.flip!, { x: r.left - o.left, y: r.top - o.top });
  });
  return m;
}

/**
 * A wrapping row of tags (or any keyed elements) that make room for each other
 * smoothly. Removed items fade where they were; the rest glide to their new
 * places with a FLIP on the compositor, so nothing is measured per frame.
 */
export function TagGroup({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<Record<string, unknown>>[];
  const keys = items.map((c) => String(c.key)).join("|");
  const committed = useRef(keys);
  const snap = useRef(new Map<string, { x: number; y: number }>());

  // Each commit records where every tag sits; when the keys change, the last record is the "before".
  useLayoutEffect(() => {
    const prev = snap.current;
    const changed = keys !== committed.current;
    committed.current = keys;
    const next = flipRects(box.current);
    snap.current = next;
    if (!changed || !box.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    box.current.querySelectorAll<HTMLElement>("[data-flip]").forEach((el) => {
      const id = el.dataset.flip!;
      const was = prev.get(id);
      const now = next.get(id);
      if (!was || !now || el.style.position === "absolute") return;
      const dx = was.x - now.x, dy = was.y - now.y;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      el.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0px 0px" }], { duration: 480, easing: `cubic-bezier(${easeOut.join(",")})`, composite: "add" });
    });
  });

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      snap.current = flipRects(el);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} aria-label={label} className={cn("relative flex flex-wrap gap-2", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        {items.map((c) => cloneElement(c, { "data-flip": String(c.key) }))}
      </AnimatePresence>
    </div>
  );
}
