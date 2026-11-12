import { useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { cn } from "../../cn";
import { usePrefersReducedMotion } from "../shared/useLoop";

export type ParallaxSectionProps = {
  children: ReactNode;
  /** Element to render. Default `section`. */
  as?: "section" | "header" | "footer" | "div" | "article";
  /**
   * How much it hangs back as it leaves, as a share of its own height: 0 scrolls
   * normally, 0.5 moves at half speed. Default 0.35.
   */
  lag?: number;
  /** The scale it shrinks to by the time it has left. Default 0.94. */
  scale?: number;
  /** How far it fades into what lies behind it by the time it has left, 0 to 1. Default 0.6. */
  dim?: number;
  /** The scrolling element, when it isn't the page. */
  container?: RefObject<HTMLElement | null>;
  id?: string;
  className?: string;
  style?: CSSProperties;
  "aria-labelledby"?: string;
  "aria-label"?: string;
};

/**
 * A section that hangs back as you scroll past it, so the next one slides over
 * it like a sheet over a stage: once its bottom edge reaches the bottom of the
 * screen it moves slower than the page, eases back and fades. It works at
 * any height, because nothing happens until the section is leaving. Give each
 * section an opaque background and stack them in order; later sections paint
 * over earlier ones. Transform and opacity only, tied to scroll; still under
 * reduced motion. Nothing is laid over the content, so at rest it is the
 * section and nothing else.
 */
export function ParallaxSection({ children, as = "section", lag = 0.35, scale = 0.94, dim = 0.6, container, id, className, style, ...aria }: ParallaxSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, container, offset: ["end end", "end start"] });
  const y = useTransform(scrollYProgress, (p) => (reduce ? "0%" : `${p * lag * 100}%`));
  const s = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, scale]);
  const opacity = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1 - dim]);
  const Tag = motion[as];
  return (
    <Tag ref={ref as never} id={id} {...aria} style={style} className={cn("relative", className)}>
      <motion.div style={{ y, scale: s, opacity, transformOrigin: "50% 100%" }} className="relative will-change-transform">
        {children}
      </motion.div>
    </Tag>
  );
}
