import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PenLine, ThumbsUp } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade, springFirm } from "../../motion";
import { Button } from "../buttons/Button";
import { SegmentedControl } from "../buttons/SegmentedControl";

export type Review = {
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** ISO date. */
  date: string;
  title: string;
  body: string;
  helpful: number;
  verified?: boolean;
};

const STAR = "M12 2.8l2.75 5.6 6.15.9-4.45 4.33 1.05 6.12L12 16.86l-5.5 2.9 1.05-6.13L3.1 9.3l6.15-.9z";

/** Text used by Stars. Pass a partial via `labels` to translate or reword. */
export interface StarsLabels {
  /** aria-label of the star image, given the value formatted to one decimal. */
  rating: (value: string) => string;
}
export const starsLabels: StarsLabels = { rating: (v) => `${v} out of 5 stars` };

/** Read-only stars that can show a fraction (4.3 fills 4 and a third). */
export function Stars({ value, size = 16, label, labels }: { value: number; size?: number; label?: string; labels?: Partial<StarsLabels> }) {
  const l = { ...starsLabels, ...labels };
  const id = useId();
  return (
    <span className="inline-flex" role="img" aria-label={label ?? l.rating(value.toFixed(1))}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <svg key={i} viewBox="0 0 24 24" width={size} height={size} aria-hidden>
            <defs><clipPath id={`${id}-${i}`}><rect x="0" y="0" width={24 * fill} height="24" /></clipPath></defs>
            <path d={STAR} className="fill-active" />
            <path d={STAR} className="fill-warning" clipPath={`url(#${id}-${i})`} />
          </svg>
        );
      })}
    </span>
  );
}

/** Text used by ReviewsSummary. Pass a partial via `labels` to translate or reword. */
export interface ReviewsSummaryLabels {
  /** Suffix after the average, e.g. "out of 5". */
  outOf: string;
  /** Review count text, given the formatted count. */
  reviews: (count: string) => string;
  /** aria-label of the distribution list. */
  ratingsByStars: string;
  /** Row label in the distribution, e.g. "5 star". */
  star: (n: number) => string;
  /** aria-label of a distribution count. */
  starCount: (count: number) => string;
  /** Write-a-review button. */
  write: string;
  /** Heading above the reviews. */
  heading: string;
  /** aria-label of the sort control. */
  sort: string;
  sortHelpful: string;
  sortNewest: string;
  /** Badge after the author of a verified review (keep the leading " · "). */
  verified: string;
  /** Helpful vote button text. */
  helpful: string;
  /** aria-label of the helpful count. */
  helpfulCount: (count: number) => string;
}
export const reviewsSummaryLabels: ReviewsSummaryLabels = {
  outOf: "out of 5",
  reviews: (count) => `${count} reviews`,
  ratingsByStars: "Ratings by stars",
  star: (n) => `${n} star`,
  starCount: (count) => `${count} reviews`,
  write: "Write a review",
  heading: "What people say",
  sort: "Sort reviews",
  sortHelpful: "Most helpful",
  sortNewest: "Newest",
  verified: " · Verified buyer",
  helpful: "Helpful",
  helpfulCount: (count) => `${count} people found this helpful`,
};

/**
 * Average, distribution and the reviews themselves. The bars grow in once when
 * scrolled into view; "Helpful" votes count up in place.
 */
export function ReviewsSummary({ reviews, onWrite, className, locale, labels }: {
  reviews: Review[];
  onWrite: () => void;
  className?: string;
  /** BCP 47 locale for dates and numbers. Defaults to "en-US". */
  locale?: string;
  /** Override any UI text. Merged over `reviewsSummaryLabels`. */
  labels?: Partial<ReviewsSummaryLabels>;
}) {
  const l = { ...reviewsSummaryLabels, ...labels };
  const [sort, setSort] = useState<"helpful" | "newest">("helpful");
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const total = reviews.length;
  const average = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const counts = [5, 4, 3, 2, 1].map((n) => reviews.filter((r) => r.rating === n).length);
  const sorted = useMemo(() => [...reviews].sort((a, b) =>
    sort === "helpful" ? b.helpful - a.helpful : b.date.localeCompare(a.date)), [reviews, sort]);
  const fmt = (d: string) => new Date(d + "T12:00:00").toLocaleDateString(locale ?? "en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className={cn("grid w-full gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-12", className)}>
      <div className="flex flex-col gap-5">
        <div>
          <p className="flex items-baseline gap-2">
            <span className="text-[40px] font-semibold leading-none tracking-[-0.02em] text-ink tabular">{average.toFixed(1)}</span>
            <span className="text-sm text-muted">{l.outOf}</span>
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Stars value={average} size={18} />
            <span className="text-[13px] text-muted">{l.reviews(total.toLocaleString())}</span>
          </div>
        </div>
        <motion.ul className="flex flex-col gap-2" initial="hidden" whileInView="shown" viewport={{ once: true, amount: 0.6 }} aria-label={l.ratingsByStars}>
          {[5, 4, 3, 2, 1].map((n, i) => {
            const share = total ? counts[i] / total : 0;
            return (
              <li key={n} className="grid grid-cols-[44px_minmax(0,1fr)_36px] items-center gap-3 text-[13px]">
                <span className="text-muted tabular">{l.star(n)}</span>
                <span className="h-2 overflow-hidden rounded-full bg-active" aria-hidden>
                  <motion.span
                    className="block h-full origin-left rounded-full bg-warning"
                    variants={{ hidden: { scaleX: 0 }, shown: { scaleX: share, transition: { ...springFirm, delay: 0.05 + i * 0.06 } } }}
                  />
                </span>
                <span className="text-right text-muted tabular" aria-label={l.starCount(counts[i])}>{counts[i].toLocaleString()}</span>
              </li>
            );
          })}
        </motion.ul>
        <Button variant="outline" leading={<PenLine />} onClick={onWrite} className="self-start">{l.write}</Button>
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-ink">{l.heading}</h3>
          <SegmentedControl size="sm" label={l.sort} value={sort} onChange={setSort} options={[{ value: "helpful", label: l.sortHelpful }, { value: "newest", label: l.sortNewest }]} />
        </div>
        {/* Re-sorting fades the list out and back in; cards never fly across each other. */}
        <AnimatePresence initial={false} mode="wait">
        <motion.ul key={sort} className="flex flex-col gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.2, ease: easeOut } }} exit={{ opacity: 0, transition: { duration: 0.1 } }}>
          {sorted.map((r) => {
            const on = !!voted[r.id];
            const count = r.helpful + (on ? 1 : 0);
            return (
              <li key={r.id} className="rounded-card bg-surface p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Stars value={r.rating} size={14} />
                  <span className="text-sm font-medium text-ink">{r.title}</span>
                </div>
                <p className="mt-2 text-sm text-ink">{r.body}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[13px] text-muted">
                  <span>{r.author}{r.verified && <span className="text-positive">{l.verified}</span>} · {fmt(r.date)}</span>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setVoted((v) => ({ ...v, [r.id]: !v[r.id] }))}
                    className={cn("inline-flex h-8 items-center gap-1.5 rounded-control px-2.5 transition-colors duration-200", on ? "bg-btn-secondary text-btn-secondary-ink" : "hover:bg-raised hover:text-ink")}
                  >
                    <ThumbsUp className="size-3.5" aria-hidden />
                    {l.helpful}
                    <span className="grid min-w-[2ch] text-left tabular [&>*]:[grid-area:1/1]" aria-label={l.helpfulCount(count)}>
                      <motion.span initial={false} animate={{ opacity: on ? 0 : 1 }} transition={on ? { duration: 0.09, ease: easeOut } : { ...fade, delay: 0.08 }} aria-hidden>{r.helpful}</motion.span>
                      <motion.span initial={false} animate={{ opacity: on ? 1 : 0 }} transition={on ? { ...fade, delay: 0.08 } : { duration: 0.09, ease: easeOut }} aria-hidden>{r.helpful + 1}</motion.span>
                    </span>
                  </button>
                </div>
              </li>
            );
          })}
        </motion.ul>
        </AnimatePresence>
      </div>
    </div>
  );
}
