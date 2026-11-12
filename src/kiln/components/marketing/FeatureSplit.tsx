import type { ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { cn } from "../../cn";
import { spring } from "../../motion";

export type FeatureSplitProps = {
  title: ReactNode;
  body: ReactNode;
  points?: { title: string; text: string }[];
  image: { src: string; alt: string; width: number; height: number };
  /** Put the picture on the left. */
  reverse?: boolean;
  className?: string;
};

const parent: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const child: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: spring } };

/** A section of text beside its picture. The picture eases sideways into place. */
export function FeatureSplit({ title, body, points, image, reverse, className }: FeatureSplitProps) {
  return (
    <motion.section
      className={cn("grid w-full items-center gap-8 md:grid-cols-2 md:gap-14", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
      variants={parent}
    >
      <div className={cn("flex min-w-0 flex-col", reverse && "md:order-2")}>
        <motion.h2 variants={child} className="text-[clamp(1.75rem,3.6vw,2.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-ink">
          {title}
        </motion.h2>
        <motion.p variants={child} className="mt-4 max-w-[52ch] text-base leading-relaxed text-ink">
          {body}
        </motion.p>
        {points && (
          <motion.dl variants={parent} className="mt-8 grid gap-5 sm:grid-cols-2">
            {points.map((p) => (
              <motion.div key={p.title} variants={child}>
                <dt className="font-semibold text-ink">{p.title}</dt>
                <dd className="mt-1 text-sm text-muted">{p.text}</dd>
              </motion.div>
            ))}
          </motion.dl>
        )}
      </div>
      <motion.div
        className={cn("relative aspect-[5/4] overflow-hidden rounded-sheet bg-raised", reverse && "md:order-1")}
        variants={{ hidden: { opacity: 0, x: reverse ? -32 : 32 }, visible: { opacity: 1, x: 0, transition: { ...spring, visualDuration: 0.7 } } }}
      >
        <img decoding="async" src={image.src} alt={image.alt} width={image.width} height={image.height} loading="lazy" className="size-full object-cover" />
      </motion.div>
    </motion.section>
  );
}
