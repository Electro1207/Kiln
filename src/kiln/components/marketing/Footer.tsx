import { useLayoutEffect, useRef, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { easeOut } from "../../motion";

/** One line in a column: a link (`href`), or plain text when there is none. */
export type FooterLink = {
  label: ReactNode;
  href?: string;
  /** Opens in a new tab with `rel="noreferrer"`. */
  external?: boolean;
};

export type FooterProps = {
  /** Set at full width at the foot, sized so it exactly fills the line, however long it is. */
  name: string;
  columns: { title: string; links: FooterLink[] }[];
  /** Address, hours, a contact line. */
  details?: ReactNode;
  legal?: ReactNode;
  /** At the end of the legal line: a credit such as `<PoweredByKiln />`. */
  credit?: ReactNode;
  /**
   * Make it a curtain: the footer fills the screen and stays put at the bottom while the page above
   * scrolls off it, so it is uncovered rather than scrolled to. Give the content above it a background
   * and `position: relative; z-index: 1`. Default false.
   */
  reveal?: boolean;
  className?: string;
};

function Line({ link }: { link: FooterLink }) {
  if (!link.href) return <span className="text-sm opacity-75">{link.label}</span>;
  return (
    <a
      href={link.href}
      {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="group inline-flex w-fit text-sm opacity-75 transition-opacity hover:opacity-100"
    >
      <span className="relative">
        {link.label}
        <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-300 ease-out-soft group-hover:scale-x-100" />
      </span>
    </a>
  );
}

/** The name, measured once per width and sized to fill it exactly. */
function Wordmark({ name }: { name: string }) {
  const box = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLParagraphElement>(null);
  useLayoutEffect(() => {
    const b = box.current, t = text.current;
    if (!b || !t) return;
    const fit = () => {
      t.style.fontSize = "100px";
      const w = t.scrollWidth;
      if (w) t.style.fontSize = `${(100 * b.clientWidth) / w}px`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(b);
    document.fonts?.ready.then(fit).catch(() => {});
    return () => ro.disconnect();
  }, [name]);
  return (
    <div ref={box} className="mt-6 w-full">
      <motion.p
        ref={text}
        aria-hidden
        className="w-fit select-none whitespace-nowrap font-semibold leading-[0.78] tracking-[-0.05em]"
        initial={{ y: "35%", opacity: 0 }}
        whileInView={{ y: "12%", opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: easeOut }}
      >
        {name}
      </motion.p>
    </div>
  );
}

/** A designed close: link columns, then the name returns at full width. Can sit under the page as a curtain. */
export function Footer({ name, columns, details, legal, credit, reveal = false, className }: FooterProps) {
  return (
    <footer
      className={cn(
        "w-full overflow-hidden bg-ink px-5 pt-10 text-surface dark:bg-elevated dark:text-ink sm:px-8 sm:pt-12",
        reveal ? "sticky bottom-0 z-0 grid min-h-svh grid-rows-[auto_1fr_auto] pb-6" : "rounded-sheet",
        className,
      )}
    >
      <div
        className={cn("grid gap-10 sm:grid-cols-2", details ? "lg:grid-cols-[1.4fr_repeat(var(--k-footer-cols),1fr)]" : "lg:grid-cols-[repeat(var(--k-footer-cols),1fr)]")}
        style={{ ["--k-footer-cols" as string]: columns.length }}
      >
        {details && <div className="text-sm leading-relaxed opacity-80">{details}</div>}
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title} className="flex flex-col gap-2.5">
            <span className="text-sm font-semibold">{c.title}</span>
            {c.links.map((l, i) => <Line key={i} link={l} />)}
          </nav>
        ))}
      </div>
      {reveal && <div />}
      <div>
        {(legal || credit) && (
          <div className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            {legal && <div className="text-xs opacity-60">{legal}</div>}
            {credit}
          </div>
        )}
        <Wordmark name={name} />
      </div>
    </footer>
  );
}
