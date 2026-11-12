import { useId, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { cn } from "../../cn";
import { fade, springFirm, staggerChild, staggerParent } from "../../motion";
import { HoverCard } from "../overlays/HoverCard";

export type Source = {
  title: string;
  url: string;
  /** A sentence from the page that supports the answer. */
  snippet?: string;
};

/** Text used by Citation, SourceCard and Sources. Pass a partial via `labels` to translate or reword. */
export interface CitationLabels {
  /** Link under a source in the hover card. */
  openSource: string;
  /** "Used 4 sources" text under an answer, with the source count. */
  usedSources: (count: number) => string;
}
export const citationLabels: CitationLabels = {
  openSource: "Open source",
  usedSources: (n) => `Used ${n} ${n === 1 ? "source" : "sources"}`,
};

/** The site's own name: en.wikipedia.org reads as wikipedia.org. */
const domain = (url: string) => {
  try {
    const parts = new URL(url).hostname.split(".");
    return parts.slice(-2).join(".");
  } catch {
    return url;
  }
};

/** A small coloured initial standing in for a site's icon; no network call. */
function SiteMark({ url, className }: { url: string; className?: string }) {
  const d = domain(url);
  let h = 0;
  for (const c of d) h = (h * 31 + c.charCodeAt(0)) % 360;
  return (
    <span
      aria-hidden
      className={cn("grid size-4 shrink-0 place-items-center rounded-[4px] text-[9px] font-semibold uppercase", className)}
      style={{ backgroundColor: `light-dark(hsl(${h} 55% 88%), hsl(${h} 30% 28%))`, color: `light-dark(hsl(${h} 45% 28%), hsl(${h} 60% 84%))` }}
    >
      {d[0]}
    </span>
  );
}

function SourceCard({ s, l }: { s: Source; l: CitationLabels }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-muted">
        <SiteMark url={s.url} />
        {domain(s.url)}
      </div>
      <p className="mt-2 text-sm font-semibold leading-snug">{s.title}</p>
      {s.snippet && <p className="mt-1.5 text-[13px] leading-5 text-muted">{s.snippet}</p>}
      <a href={s.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline">
        {l.openSource} <ExternalLink className="size-3" />
      </a>
    </div>
  );
}

/** An inline citation chip, after the sentence it supports. Hover or focus shows the source. */
export function Citation({ sources, className, labels }: {
  sources: Source[];
  className?: string;
  /** Override any UI text. Merged over `citationLabels`. */
  labels?: Partial<CitationLabels>;
}) {
  const l = { ...citationLabels, ...labels };
  const first = sources[0];
  return (
    <HoverCard
      content={
        <div className="space-y-4">
          {sources.map((s) => (
            <SourceCard key={s.url} s={s} l={l} />
          ))}
        </div>
      }
      side="top"
      align="start"
    >
      <a
        href={first.url}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "mx-0.5 inline-flex h-5 translate-y-[-1px] items-center gap-1 rounded-full bg-raised px-1.5 align-middle text-[11.5px] font-medium leading-none text-muted transition-colors hover:bg-active hover:text-ink",
          className,
        )}
      >
        {domain(first.url)}
        {sources.length > 1 && <span className="text-faint">+{sources.length - 1}</span>}
      </a>
    </HoverCard>
  );
}

/** "Used 4 sources" under an answer; opens into the list. */
export function Sources({ sources, className, labels }: {
  sources: Source[];
  className?: string;
  /** Override any UI text. Merged over `citationLabels`. */
  labels?: Partial<CitationLabels>;
}) {
  const l = { ...citationLabels, ...labels };
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={cn("text-sm", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="-ml-1 inline-flex h-8 items-center gap-2 rounded-full px-1 text-muted transition-colors hover:text-ink"
      >
        <span className="flex -space-x-1">
          {sources.slice(0, 3).map((s) => (
            <SiteMark key={s.url} url={s.url} className="ring-2 ring-surface" />
          ))}
        </span>
        {l.usedSources(sources.length)}
        <ChevronDown className={cn("size-3.5 transition-transform duration-300 ease-out-soft", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="list"
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: springFirm, opacity: fade }}
            className="overflow-hidden"
          >
            <motion.ul variants={staggerParent} initial="hidden" animate="visible" className="grid gap-2 pb-1 pt-2 sm:grid-cols-2">
              {sources.map((s) => (
                <motion.li key={s.url} variants={staggerChild}>
                  <a href={s.url} target="_blank" rel="noreferrer" className="flex h-full flex-col gap-1 rounded-[12px] bg-raised p-3 transition-colors hover:bg-active">
                    <span className="flex items-center gap-2 text-xs text-muted">
                      <SiteMark url={s.url} />
                      {domain(s.url)}
                    </span>
                    <span className="line-clamp-2 text-[13px] font-medium leading-5 text-ink">{s.title}</span>
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
