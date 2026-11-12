import { useEffect, useState, type RefObject, type ReactNode } from "react";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowUp } from "lucide-react";
import { cn } from "../../cn";
import { press, springSoft } from "../../motion";

/** Text used by BackToTop. Pass a partial via `labels` to translate or reword. */
export interface BackToTopLabels {
  /** aria-label of the button. */
  backToTop: string;
}
export const backToTopLabels: BackToTopLabels = { backToTop: "Back to top" };

/** Icons used by BackToTop. Pass a partial via `icons` to swap any of them. */
export interface BackToTopIcons {
  /** The arrow in the middle of the button. */
  up: ReactNode;
}
export const backToTopIcons: BackToTopIcons = { up: <ArrowUp /> };

export type BackToTopProps = {
  /** The scrolling element. Defaults to the page. */
  container?: RefObject<HTMLElement | null>;
  /** Show after this many pixels. */
  threshold?: number;
  /** fixed: pinned to the window corner. inline: placed by the parent (for previews). */
  position?: "fixed" | "inline";
  className?: string;
  /** Override any UI text. Merged over `backToTopLabels`. */
  labels?: Partial<BackToTopLabels>;
  /** Replace any built-in icon. Merged over `backToTopIcons`. */
  icons?: Partial<BackToTopIcons>;
};

/** A round button that appears once you have scrolled; its ring fills with how far down you are. */
export function BackToTop({ container, threshold = 320, position = "fixed", className, labels, icons }: BackToTopProps) {
  const l = { ...backToTopLabels, ...labels };
  const ic = { ...backToTopIcons, ...icons };
  const { scrollY, scrollYProgress } = useScroll(container ? { container } : undefined);
  const [show, setShow] = useState(false);
  const progress = useSpring(scrollYProgress, { stiffness: 260, damping: 40, mass: 0.6 });
  const dash = useTransform(progress, (p) => 1 - p);

  useEffect(() => scrollY.on("change", (y) => setShow(y > threshold)), [scrollY, threshold]);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = container?.current;
    (el ?? window).scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          aria-label={l.backToTop}
          onClick={toTop}
          initial={{ opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 12 }}
          whileHover={{ y: -2 }}
          whileTap={press}
          transition={springSoft}
          className={cn(
            "grid size-12 place-items-center rounded-full bg-surface text-ink shadow-float",
            position === "fixed" ? "fixed bottom-6 right-6 z-40" : "absolute bottom-4 right-4",
            className,
          )}
        >
          <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx="24" cy="24" r="22" fill="none" stroke="var(--k-line)" strokeWidth="2" />
            <motion.circle cx="24" cy="24" r="22" fill="none" stroke="var(--k-accent)" strokeWidth="2" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" style={{ strokeDashoffset: dash }} />
          </svg>
          <span className="relative grid place-items-center [&>svg]:size-4" aria-hidden>{ic.up}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
