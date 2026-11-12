import { motion } from "motion/react";
import { cn } from "../../cn";
import { spring } from "../../motion";

export type MasonryItem = { id: string; src: string; alt: string; width: number; height: number; caption?: string };

/** Pictures of mixed heights in columns. Each rises in as it enters the view. */
export function Masonry({ items, columns = 3, className }: { items: MasonryItem[]; columns?: 2 | 3 | 4; className?: string }) {
  const cols = { 2: "sm:columns-2", 3: "sm:columns-2 lg:columns-3", 4: "sm:columns-3 lg:columns-4" }[columns];
  return (
    <ul className={cn("w-full columns-2 gap-3 sm:gap-4", cols, className)}>
      {items.map((it, i) => (
        <motion.li
          key={it.id}
          className="mb-3 break-inside-avoid sm:mb-4"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -8% 0px" }}
          transition={{ ...spring, delay: (i % columns) * 0.07 }}
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
  );
}
