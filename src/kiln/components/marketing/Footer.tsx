import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { easeOut } from "../../motion";

export type FooterProps = {
  name: string;
  columns: { title: string; links: { label: string; href: string }[] }[];
  /** Address, hours, a contact line. */
  details?: ReactNode;
  legal?: ReactNode;
  className?: string;
};

/** A designed close: link columns, then the name returns at full width. */
export function Footer({ name, columns, details, legal, className }: FooterProps) {
  return (
    <footer className={cn("@container w-full overflow-hidden rounded-sheet bg-ink px-5 pt-10 text-surface dark:bg-elevated dark:text-ink sm:px-8 sm:pt-12", className)}>
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="text-sm leading-relaxed opacity-80">{details}</div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title} className="flex flex-col gap-2.5">
            <span className="text-sm font-semibold">{c.title}</span>
            {c.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="group inline-flex w-fit text-sm opacity-75 transition-opacity hover:opacity-100"
              >
                <span className="relative">
                  {l.label}
                  <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-300 ease-out-soft group-hover:scale-x-100" />
                </span>
              </a>
            ))}
          </nav>
        ))}
      </div>
      {legal && <div className="mt-12 text-xs opacity-60">{legal}</div>}
      <motion.p
        aria-hidden
        className="mt-6 select-none whitespace-nowrap text-[clamp(3rem,19cqw,15rem)] font-semibold leading-[0.78] tracking-[-0.05em]"
        initial={{ y: "35%", opacity: 0 }}
        whileInView={{ y: "12%", opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: easeOut }}
      >
        {name}
      </motion.p>
    </footer>
  );
}
