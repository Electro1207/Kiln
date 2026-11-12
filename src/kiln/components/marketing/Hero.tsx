import type { ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { cn } from "../../cn";
import { spring } from "../../motion";

export type HeroProps = {
  title: ReactNode;
  lead: ReactNode;
  actions?: ReactNode;
  image: { src: string; alt: string; width: number; height: number };
  /** A short fact set under the actions: opening hours, a price, a date. */
  aside?: ReactNode;
  /** Use 2 when the hero is not the page's first screen. */
  headingLevel?: 1 | 2;
  className?: string;
};

const parent: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
const child: Variants = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: spring } };

/** A first screen: title, one sentence, the action, and a large picture. */
export function Hero({ title, lead, actions, image, aside, headingLevel = 1, className }: HeroProps) {
  const Heading = headingLevel === 2 ? motion.h2 : motion.h1;
  return (
    <motion.section
      className={cn("grid w-full items-center gap-8 md:grid-cols-[1.05fr_1fr] md:gap-12", className)}
      variants={parent}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="flex min-w-0 flex-col">
        <Heading variants={child} className="text-[clamp(2.25rem,6vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-ink">
          {title}
        </Heading>
        <motion.p variants={child} className="mt-6 max-w-[34ch] text-[17px] leading-relaxed text-ink">
          {lead}
        </motion.p>
        {actions && (
          <motion.div variants={child} className="mt-8 flex flex-wrap gap-3">
            {actions}
          </motion.div>
        )}
        {aside && (
          <motion.div variants={child} className="mt-6 text-sm text-muted">
            {aside}
          </motion.div>
        )}
      </div>
      <motion.div variants={child} className="relative aspect-[4/5] overflow-hidden rounded-sheet bg-raised md:aspect-[4/5]">
        <motion.img decoding="async"
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className="size-full object-cover"
          initial={{ scale: 1.12 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.div>
    </motion.section>
  );
}
