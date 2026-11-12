import { type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../cn";
import { useControllable } from "../../controllable";
import { easeOut, press, springSoft } from "../../motion";

/** Text used by Pagination. Pass a partial via `labels` to translate or reword. */
export interface PaginationLabels {
  /** aria-label of the nav landmark. */
  nav: string;
  /** aria-label of the previous button. */
  previous: string;
  /** aria-label of the next button. */
  next: string;
  /** aria-label of a page-number button. */
  page: (page: number) => string;
  /** "Page 2 of 9": accessible name of the compact phone readout. */
  pageOf: (page: number, count: number) => string;
  /** Visible text after the current page on phones ("of 9"). */
  of: (count: number) => string;
}
/** Icons used by Pagination. Pass a partial via `icons` to swap any of them. */
export interface PaginationIcons {
  /** The previous-page button. */
  previous: ReactNode;
  /** The next-page button. */
  next: ReactNode;
}
export const paginationIcons: PaginationIcons = { previous: <ChevronLeft />, next: <ChevronRight /> };
export const paginationLabels: PaginationLabels = {
  nav: "Pagination",
  previous: "Previous page",
  next: "Next page",
  page: (p) => `Page ${p}`,
  pageOf: (p, n) => `Page ${p} of ${n}`,
  of: (n) => `of ${n}`,
};

export type PaginationProps = {
  /** Controlled page (1-based). Leave out and use `defaultPage` to let it keep its own. */
  page?: number;
  defaultPage?: number;
  pageCount: number;
  onChange?: (page: number) => void;
  /** Pages shown on each side of the current one. */
  siblings?: number;
  className?: string;
  /** Override any UI text. Merged over `paginationLabels`. */
  labels?: Partial<PaginationLabels>;
  /** Replace any built-in icon. Merged over `paginationIcons`. */
  icons?: Partial<PaginationIcons>;
};

export function pageRange(page: number, count: number, siblings = 1): Array<number | "gap-l" | "gap-r"> {
  const total = siblings * 2 + 5;
  if (count <= total) return Array.from({ length: count }, (_, i) => i + 1);
  const left = Math.max(page - siblings, 1);
  const right = Math.min(page + siblings, count);
  const showL = left > 3;
  const showR = right < count - 2;
  if (!showL) return [...Array.from({ length: 3 + siblings * 2 }, (_, i) => i + 1), "gap-r", count];
  if (!showR) return [1, "gap-l", ...Array.from({ length: 3 + siblings * 2 }, (_, i) => count - (2 + siblings * 2) + i)];
  return [1, "gap-l", ...Array.from({ length: right - left + 1 }, (_, i) => left + i), "gap-r", count];
}

const cell = "grid h-9 min-w-9 place-items-center rounded-control px-2 text-sm tabular";
const gap = "grid h-9 w-6 place-items-center";

/**
 * Page numbers. The current page's fill fades in place (nothing travels across the other
 * numbers); its number turns to the fill's ink part-way through the fade, never grey on grey.
 */
/** Page numbers with previous/next. Collapses to "page x of y" on phones. */
export function Pagination({ page: pageProp, defaultPage = 1, pageCount, onChange: onChangeProp, siblings = 1, className, labels, icons }: PaginationProps) {
  const l = { ...paginationLabels, ...labels };
  const ic = { ...paginationIcons, ...icons };
  const [page, onChange] = useControllable(pageProp, defaultPage, onChangeProp);
  const go = (p: number) => onChange(Math.min(pageCount, Math.max(1, p)));
  const items = pageRange(page, pageCount, siblings);

  const arrow =
    "grid size-9 place-items-center rounded-control text-ink transition-colors duration-200 hover:bg-active disabled:pointer-events-none disabled:opacity-35";

  return (
    <nav aria-label={l.nav} className={cn("flex items-center gap-1", className)}>
      <motion.button whileTap={press} type="button" aria-label={l.previous} disabled={page <= 1} onClick={() => go(page - 1)} className={arrow}>
        <span className="grid place-items-center [&>svg]:size-4" aria-hidden>{ic.previous}</span>
      </motion.button>

      <ul className="hidden items-center gap-1 sm:flex">
        {items.map((p) =>
          typeof p === "number" ? (
            <li key={p}>
              <button
                type="button"
                aria-current={p === page ? "page" : undefined}
                aria-label={l.page(p)}
                onClick={() => go(p)}
                className={cn(
                  cell,
                  "relative",
                  p === page ? "text-btn-primary-ink transition-[color] delay-[80ms] duration-0" : "text-ink transition-colors duration-200 hover:bg-active",
                )}
              >
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-control bg-btn-primary"
                  initial={false}
                  animate={{ opacity: p === page ? 1 : 0 }}
                  transition={{ duration: 0.16, ease: easeOut }}
                />
                <span className="relative z-[1]">{p}</span>
              </button>
            </li>
          ) : (
            <li key={p} aria-hidden className={cn(gap, "text-faint")}>…</li>
          ),
        )}
      </ul>

      <span className="grid min-w-20 overflow-hidden px-2 text-center text-sm text-muted tabular sm:hidden [&>*]:[grid-area:1/1]" role="status" aria-label={l.pageOf(page, pageCount)} aria-live="polite">
        <AnimatePresence initial={false}>
          <motion.span key={page} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={springSoft}>
            <span className="font-medium text-ink">{page}</span> {l.of(pageCount)}
          </motion.span>
        </AnimatePresence>
      </span>

      <motion.button whileTap={press} type="button" aria-label={l.next} disabled={page >= pageCount} onClick={() => go(page + 1)} className={arrow}>
        <span className="grid place-items-center [&>svg]:size-4" aria-hidden>{ic.next}</span>
      </motion.button>
    </nav>
  );
}
