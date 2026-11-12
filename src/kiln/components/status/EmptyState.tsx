import { useRef, type ReactNode } from "react";
import { useLoop } from "../shared/useLoop";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { staggerChild, staggerParent } from "../../motion";

export type EmptyStateProps = {
  /** A picture or icon. Defaults to a drawn empty shelf. */
  art?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** One or two buttons. */
  action?: ReactNode;
  className?: string;
};

/** What a list, search or page shows when it has nothing yet: what happened and the one thing to do next. */
export function EmptyState({ art, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      variants={staggerParent}
      initial="hidden"
      animate="visible"
      className={cn("mx-auto flex max-w-sm flex-col items-center px-4 py-8 text-center", className)}
    >
      <motion.div variants={staggerChild} className="mb-5 text-muted">
        {art ?? <Shelf />}
      </motion.div>
      <motion.h3 variants={staggerChild} className="text-base font-semibold text-ink">
        {title}
      </motion.h3>
      {description && (
        <motion.p variants={staggerChild} className="mt-1.5 text-sm text-muted">
          {description}
        </motion.p>
      )}
      {action && (
        <motion.div variants={staggerChild} className="mt-5 flex flex-wrap justify-center gap-2">
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}

/** Three pots on a shelf, the last one gently tipping as if just set down. */
function Shelf() {
  const pot = useRef<SVGGElement>(null);
  useLoop(
    pot,
    (el) => [
      el.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(-4deg)" }, { transform: "rotate(0deg)" }], {
        duration: 3200, endDelay: 1200, iterations: Infinity, easing: "ease-in-out",
      }),
    ],
    [],
  );
  return (
    <svg width="120" height="76" viewBox="0 0 120 76" fill="none" aria-hidden>
      <rect x="6" y="64" width="108" height="6" rx="3" className="fill-active" />
      <path d="M22 64c-4-8-4-20 2-26h12c6 6 6 18 2 26z" className="fill-raised stroke-line-strong" strokeWidth="1.5" />
      <rect x="25" y="32" width="10" height="6" rx="2" className="fill-raised stroke-line-strong" strokeWidth="1.5" />
      <path d="M50 64c-2-10 0-24 10-30 10 6 12 20 10 30z" className="fill-raised stroke-line-strong" strokeWidth="1.5" />
      <g ref={pot} style={{ transformBox: "view-box", transformOrigin: "88px 64px" }}>
        <path d="M80 64v-18c0-4 4-6 8-6s8 2 8 6v18z" className="fill-accent-soft stroke-accent" strokeWidth="1.5" />
        <path d="M84 40v-4h8v4" className="stroke-accent" strokeWidth="1.5" />
      </g>
    </svg>
  );
}
