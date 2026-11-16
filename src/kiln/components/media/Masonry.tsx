import { motion } from "motion/react";
import { cn } from "../../cn";
import { spring } from "../../motion";

export type MasonryItem = { id: string; src: string; alt: string; width: number; height: number; caption?: string };

/* One arrangement per width, switched by media queries: 2 columns, then the most `columns` allows. The
   pictures are dealt into columns by their own proportions, each into the shortest column so far, so the
   columns end level in every browser (CSS columns balance differently in Safari and leave one short). */
const LAYOUTS = {
  2: [{ n: 2, className: "flex" }],
  3: [
    { n: 2, className: "flex lg:hidden" },
    { n: 3, className: "hidden lg:flex" },
  ],
  4: [
    { n: 2, className: "flex sm:hidden" },
    { n: 3, className: "hidden sm:flex lg:hidden" },
    { n: 4, className: "hidden lg:flex" },
  ],
} as const;

/** Tallest pictures first, each into the shortest column, so one tall picture late in the list can't
    overhang; then each column goes back into the original order, so it still reads top to bottom. */
function deal(items: MasonryItem[], n: number) {
  const cols = Array.from({ length: n }, () => ({ h: 0, items: [] as { it: MasonryItem; i: number }[] }));
  const byHeight = items.map((it, i) => ({ it, i })).sort((a, b) => b.it.height / b.it.width - a.it.height / a.it.width);
  for (const e of byHeight) {
    const c = cols.reduce((a, b) => (b.h < a.h ? b : a));
    c.items.push(e);
    c.h += e.it.height / e.it.width;
  }
  return cols.map((c) => c.items.sort((a, b) => a.i - b.i).map((e) => e.it));
}

/** Pictures of mixed heights in columns. Each rises in as it enters the view. */
export function Masonry({ items, columns = 3, className }: { items: MasonryItem[]; columns?: 2 | 3 | 4; className?: string }) {
  return (
    <div className={cn("w-full", className)}>
      {LAYOUTS[columns].map(({ n, className: shown }) => (
        <div key={n} className={cn("items-start gap-3 sm:gap-4", shown)}>
          {deal(items, n).map((col, c) => (
            <ul key={c} className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4">
              {col.map((it) => (
                <motion.li
                  key={it.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                  transition={{ ...spring, delay: c * 0.07 }}
                >
                  <figure className="group overflow-hidden rounded-card bg-raised">
                    <img decoding="async"
                      src={it.src}
                      alt={it.alt}
                      width={it.width}
                      height={it.height}
                      loading="lazy"
                      className="block h-auto w-full transition-transform duration-[1200ms] ease-out-soft group-hover:scale-[1.04]"
                    />
                    {it.caption && <figcaption className="px-3 py-2 text-xs text-muted">{it.caption}</figcaption>}
                  </figure>
                </motion.li>
              ))}
            </ul>
          ))}
        </div>
      ))}
    </div>
  );
}
