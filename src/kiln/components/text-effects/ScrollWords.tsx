import { useMemo, useRef, type ElementType, type RefObject } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { cn } from "../../cn";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

export type ScrollWordsProps = {
  text: string;
  /** Element to render. Default `p`. */
  as?: ElementType;
  /** Opacity of a word not yet reached, 0 to 1. Default 0.2. */
  dim?: number;
  /**
   * Where the reading line sits, as a fraction of the screen height from the top.
   * A word is fully lit once the text has scrolled that far. Default 0.55.
   */
  line?: number;
  /** The scrolling element, when it isn't the page. */
  container?: RefObject<HTMLElement | null>;
  className?: string;
  /**
   * Accessibility features this component supports on its own, on top of the person's settings and any
   * AccessibilityScope: "all", "none", a profile name, a list of profiles, or single features.
   * Reduced motion shows the whole paragraph fully lit.
   */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

/**
 * A paragraph that lights up word by word as it is scrolled, as if someone were
 * reading it to you. Each word's opacity reads one shared scroll value, so it
 * costs no React renders, and the words never move, so nothing reflows. Screen
 * readers get the plain sentence; with reduced motion it is fully lit.
 */
export function ScrollWords({ text, as: Tag = "p", dim = 0.2, line = 0.55, container, className, accessibilityFeatures }: ScrollWordsProps) {
  const ref = useRef<HTMLElement>(null);
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const reduce = a11y.reduceMotion;
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);
  const { scrollYProgress } = useScroll({ target: ref, container, offset: ["start 0.9", `end ${line}`] });
  const n = words.length;
  return (
    <Tag ref={ref} className={cn(className)} {...rootProps}>
      {words.map((w, i) => (
        <Word key={i} p={scrollYProgress} from={i / n} to={(i + 1) / n} dim={reduce ? 1 : dim}>
          {w}
        </Word>
      ))}
    </Tag>
  );
}

function Word({ p, from, to, dim, children }: { p: MotionValue<number>; from: number; to: number; dim: number; children: string }) {
  const opacity = useTransform(p, [from, to], [dim, 1]);
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{" "}
    </>
  );
}
