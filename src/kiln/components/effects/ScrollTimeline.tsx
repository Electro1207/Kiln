import { useMemo, useRef, type ReactNode, type RefObject } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { cn } from "../../cn";
import { usePrefersReducedMotion } from "../shared/useLoop";

export type ScrollTimelineItem = {
  id: string;
  /** When, as it should read: "Dec 2024 to now". */
  time: string;
  /** Machine-readable date for the `<time>` element, e.g. "2024-12". */
  dateTime?: string;
  title: ReactNode;
  /** One line under the title: the kind of role, the place. */
  meta?: ReactNode;
  /** A sentence or two; it arrives after the title. */
  body?: ReactNode;
  /** Short labels (skills, tools) that arrive one after another as you read on. */
  tags?: string[];
  /** Marks the entry that is still going on. */
  current?: boolean;
};

/** Text used by ScrollTimeline. Pass a partial via `labels` to translate or reword. */
export interface ScrollTimelineLabels {
  /** Badge on the entry marked `current`. */
  current: string;
  /** aria-label of an entry's tag list, given its position. */
  tags: (index: number) => string;
}
export const scrollTimelineLabels: ScrollTimelineLabels = { current: "Now", tags: (i) => `Tags for entry ${i + 1}` };

export type ScrollTimelineProps = {
  items: ScrollTimelineItem[];
  /**
   * Where the reading line sits, as a fraction of the screen height from the top.
   * The rail fills to it, and an entry is fully told once it has passed it. Default 0.6.
   */
  line?: number;
  /** Heading level of each entry's title. Default 3. */
  headingLevel?: 2 | 3 | 4;
  /** The scrolling element, when it isn't the page. */
  container?: RefObject<HTMLElement | null>;
  className?: string;
  /** Override any UI text. Merged over `scrollTimelineLabels`. */
  labels?: Partial<ScrollTimelineLabels>;
};

/**
 * A history told as you scroll. A rail fills down to a reading line; each entry
 * lights its dot as the rail reaches it, then its title, its words and finally
 * its tags, one after another, so the further you read the more there is. Every
 * entry keeps its full height from the start, so nothing below it moves, and the
 * motion is opacity and transform tied to scroll. With reduced motion everything
 * is simply shown.
 */
export function ScrollTimeline({ items, line = 0.6, headingLevel = 3, container, className, labels }: ScrollTimelineProps) {
  const l = useMemo(() => ({ ...scrollTimelineLabels, ...labels }), [labels]);
  const ref = useRef<HTMLOListElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, container, offset: [`start ${line}`, `end ${line}`] });
  const fill = useTransform(scrollYProgress, (p) => (reduce ? 1 : p));

  return (
    <ol ref={ref} className={cn("relative", className)}>
      <span aria-hidden className="absolute bottom-2 top-2 left-[7px] w-px bg-line md:left-[calc(11rem+7px)]" />
      <motion.span
        aria-hidden
        style={{ scaleY: fill }}
        className="absolute bottom-2 top-2 left-[7px] w-px origin-top bg-accent md:left-[calc(11rem+7px)]"
      />
      {items.map((item, i) => (
        <Entry key={item.id} item={item} index={i} line={line} reduce={reduce} container={container} headingLevel={headingLevel} l={l} />
      ))}
    </ol>
  );
}

function Entry({
  item, index, line, reduce, container, headingLevel, l,
}: {
  item: ScrollTimelineItem; index: number; line: number; reduce: boolean;
  container?: RefObject<HTMLElement | null>; headingLevel: 2 | 3 | 4; l: ScrollTimelineLabels;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, container, offset: [`start ${Math.min(line + 0.25, 0.98)}`, `end ${line}`] });
  const dot = useTransform(p, [0.08, 0.16], reduce ? [1, 1] : [0, 1]);
  const head = useTransform(p, [0, 0.18], reduce ? [1, 1] : [0.28, 1]);
  const headY = useTransform(p, [0, 0.18], reduce ? [0, 0] : [14, 0]);
  const body = useTransform(p, [0.14, 0.38], reduce ? [1, 1] : [0, 1]);
  const bodyY = useTransform(p, [0.14, 0.38], reduce ? [0, 0] : [12, 0]);
  const H = `h${headingLevel}` as const;
  const tags = item.tags ?? [];

  return (
    <li ref={ref} className="relative grid gap-x-10 pb-14 pl-9 last:pb-0 md:grid-cols-[11rem_minmax(0,1fr)] md:pl-0">
      <span aria-hidden className="absolute left-0 top-[0.4em] grid size-[15px] place-items-center rounded-full border border-line-strong bg-ground md:left-[11rem]">
        <motion.span style={{ opacity: dot }} className="size-[7px] rounded-full bg-accent" />
      </span>
      <motion.p style={{ opacity: head, y: headY }} className="pb-1 text-sm text-muted tabular md:pr-6 md:pt-[0.15em] md:text-right">
        <time dateTime={item.dateTime}>{item.time}</time>
      </motion.p>
      <div className="min-w-0 md:pl-10">
        <motion.div style={{ opacity: head, y: headY }}>
          <H className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xl font-semibold leading-tight tracking-[-0.015em] text-ink md:text-2xl">
            {item.title}
            {item.current && (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium tracking-normal text-accent">{l.current}</span>
            )}
          </H>
          {item.meta && <p className="mt-1 text-[15px] text-muted">{item.meta}</p>}
        </motion.div>
        {item.body && (
          <motion.div style={{ opacity: body, y: bodyY }} className="mt-3 max-w-2xl text-base leading-7 text-ink">
            {item.body}
          </motion.div>
        )}
        {tags.length > 0 && (
          <ul aria-label={l.tags(index)} className="mt-4 flex max-w-2xl flex-wrap gap-1.5">
            {tags.map((t, j) => (
              <TagChip key={t} p={p} reduce={reduce} from={0.3 + (0.6 * j) / tags.length} span={0.6 / tags.length + 0.08}>
                {t}
              </TagChip>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function TagChip({ p, reduce, from, span, children }: { p: MotionValue<number>; reduce: boolean; from: number; span: number; children: string }) {
  const opacity = useTransform(p, [from, from + span], reduce ? [1, 1] : [0, 1]);
  const y = useTransform(p, [from, from + span], reduce ? [0, 0] : [8, 0]);
  return (
    <motion.li style={{ opacity, y }} className="rounded-full border border-line bg-surface px-2.5 py-1 text-[13px] leading-none text-ink">
      {children}
    </motion.li>
  );
}
