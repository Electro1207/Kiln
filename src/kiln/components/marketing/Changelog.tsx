import { useMemo, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { fade } from "../../motion";

/** Kinds of change, in the order a release lists them. `new` and `improved` are Keep a Changelog's Added and Changed. */
export const changeKinds = ["new", "improved", "deprecated", "removed", "fixed", "security"] as const;
export type ChangeKind = (typeof changeKinds)[number];

export type Release = {
  /** "2.4.0", or "Unreleased" for what is merged but not yet released. */
  version: string;
  /** Shown as given ("10 Nov 2026"), or formatted by `formatDate`. Left out for an unreleased entry. */
  date?: string;
  title?: ReactNode;
  /** A line or two on what the release is about. A string may use `code`, **bold** and [links](https://…). */
  body?: ReactNode;
  /** A string may use `code`, **bold** and [links](https://…). */
  changes: { kind: ChangeKind; text: ReactNode }[];
  /** Where the full diff or release page lives. */
  href?: string;
};

/** Text used by Changelog. Pass a partial via `labels` to translate or reword. */
export interface ChangelogLabels {
  /** Badge text per kind of change. */
  kind: Record<ChangeKind, string>;
  /** The filter's first option. */
  all: string;
  /** aria-label of the filter. */
  filter: string;
  /** Shown in place of the version "Unreleased". */
  unreleased: string;
  /** Badge on the newest released version (with `markLatest`). */
  latest: string;
  /** Link to a release's `href`. */
  compare: string;
  showOlder: (n: number) => string;
  empty: string;
}
export const changelogLabels: ChangelogLabels = {
  kind: { new: "New", improved: "Improved", deprecated: "Deprecated", removed: "Removed", fixed: "Fixed", security: "Security" },
  all: "All",
  filter: "Show one kind of change",
  unreleased: "Next release",
  latest: "Latest",
  compare: "Full list of changes",
  showOlder: (n) => `Show ${n} older ${n === 1 ? "release" : "releases"}`,
  empty: "No changes of this kind.",
};

export type ChangelogProps = {
  title?: ReactNode;
  description?: ReactNode;
  /** Newest first. Write them by hand, or read a CHANGELOG.md with `parseChangelog`. */
  releases: Release[];
  /** Chips above the list that narrow every release to one kind of change. Default false. */
  filter?: boolean;
  /** How many releases show before a "Show older" button. Default: all. */
  initialCount?: number;
  /** Badge the newest released version. Default false. */
  markLatest?: boolean;
  /** Give each release an anchor id, `${idPrefix}${version}`, for links to one release. Leave out for none. */
  idPrefix?: string;
  /** Format each date (e.g. ISO dates from `parseChangelog`). Default: shown as given. */
  formatDate?: (date: string) => string;
  /** Override any UI text. Merged over `changelogLabels`. */
  labels?: Partial<ChangelogLabels>;
  className?: string;
  /** Classes for each release's card, e.g. `bg-raised!` when the list sits on a surface (`!` to beat the default fill). */
  cardClassName?: string;
};

const kindClass: Record<ChangeKind, string> = {
  new: "bg-accent-soft text-ink",
  improved: "bg-info-soft text-info",
  deprecated: "bg-warning-soft text-warning",
  removed: "bg-negative-soft text-negative",
  fixed: "bg-positive-soft text-positive",
  security: "bg-negative-soft text-negative",
};

const isUnreleased = (r: Release) => /^unreleased$/i.test(r.version);

/** `code`, **bold** and [links](url) in a line of text; anything else is left as it is. */
function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(/`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g)) {
    const at = m.index ?? 0;
    if (at > last) parts.push(text.slice(last, at));
    if (m[1]) parts.push(<code key={at} className="rounded-[5px] bg-active px-1 py-px font-mono text-[0.88em]">{m[1]}</code>);
    else if (m[2]) parts.push(<strong key={at} className="font-semibold">{m[2]}</strong>);
    else
      parts.push(
        <a key={at} href={m[4]} {...(/^https?:/.test(m[4]) ? { target: "_blank", rel: "noreferrer" } : {})} className="text-accent underline decoration-current/40 underline-offset-2 hover:decoration-current">
          {m[3]}
        </a>,
      );
    last = at + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
const rich = (n: ReactNode) => (typeof n === "string" ? <Inline text={n} /> : n);

const HEADINGS: Record<string, ChangeKind> = { added: "new", new: "new", changed: "improved", improved: "improved", deprecated: "deprecated", removed: "removed", fixed: "fixed", security: "security" };

/**
 * Read a Keep a Changelog file: `## [1.2.0] - 2026-11-12` headings, an optional paragraph under each
 * (the release's `body`), then `### Added` (Changed, Deprecated, Removed, Fixed, Security) with `- `
 * lines. Link references at the foot become each release's `href`. Dates stay ISO; pass `formatDate`.
 */
export function parseChangelog(markdown: string): Release[] {
  const refs = new Map<string, string>();
  for (const m of markdown.matchAll(/^\[([^\]]+)\]:\s*(\S+)\s*$/gm)) refs.set(m[1].toLowerCase(), m[2]);
  const releases: Release[] = [];
  let rel: Release | undefined;
  let kind: ChangeKind | undefined;
  let inSection = false;
  let body: string[] = [];
  const flush = () => {
    if (rel && body.length) rel.body = body.join(" ");
    body = [];
  };
  for (const raw of markdown.split("\n")) {
    const t = raw.trim();
    const h2 = /^##\s/.test(t) && t.match(/^##\s+\[?([^\]\s]+)\]?(?:\s*-\s*(\S+))?/);
    if (h2) {
      flush();
      rel = { version: h2[1], date: h2[2], changes: [], href: refs.get(h2[1].toLowerCase()) };
      releases.push(rel);
      kind = undefined;
      inSection = false;
      continue;
    }
    if (!rel || /^\[[^\]]+\]:/.test(t)) continue;
    const h3 = t.match(/^###\s+(\w+)/);
    if (h3) {
      flush();
      kind = HEADINGS[h3[1].toLowerCase()];
      inSection = true;
      continue;
    }
    const item = t.match(/^[-*]\s+(.*)$/);
    if (item && kind) rel.changes.push({ kind, text: item[1] });
    else if (t && !inSection) body.push(t);
  }
  flush();
  return releases;
}

/**
 * Releases, newest first. The version and date sit in their own column on wide screens. Optionally a
 * filter narrows every release to one kind of change, older releases wait behind a button, and each
 * release gets an anchor. Strings may carry `code`, **bold** and links, so a CHANGELOG.md read with
 * `parseChangelog` renders as written.
 */
export function Changelog({ title, description, releases, filter = false, initialCount, markLatest = false, idPrefix, formatDate, labels, className, cardClassName }: ChangelogProps) {
  const l = { ...changelogLabels, ...labels, kind: { ...changelogLabels.kind, ...labels?.kind } };
  const [only, setOnly] = useState<ChangeKind | "all">("all");
  const [count, setCount] = useState(initialCount ?? releases.length);
  const latest = markLatest ? releases.find((r) => !isUnreleased(r)) : undefined;

  const totals = useMemo(() => {
    const t: Partial<Record<ChangeKind, number>> = {};
    for (const r of releases) for (const c of r.changes) t[c.kind] = (t[c.kind] ?? 0) + 1;
    return t;
  }, [releases]);
  const present = changeKinds.filter((k) => totals[k]);

  const listed = releases.slice(0, count);
  const shown = listed.filter((r) => only === "all" || r.changes.some((c) => c.kind === only));
  const older = releases.length - listed.length;

  return (
    <section className={cn("@container w-full", className)}>
      {title && <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink text-balance @2xl:text-[1.75rem]">{title}</h2>}
      {description && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink">{description}</p>}

      {filter && present.length > 1 && (
        <div role="radiogroup" aria-label={l.filter} className={cn("flex w-fit max-w-full flex-wrap gap-1 rounded-[20px] bg-raised p-1", !!(title || description) && "mt-6")}>
          {(["all", ...present] as const).map((k) => {
            const on = only === k;
            return (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setOnly(k)}
                className="relative inline-flex h-8 items-center gap-2 rounded-full px-3.5 text-sm font-medium text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-0 rounded-full bg-elevated" />
                <span className="relative z-[1]">{k === "all" ? l.all : l.kind[k]}</span>
                {k !== "all" && <span className="relative z-[1] text-muted tabular">{totals[k]}</span>}
              </button>
            );
          })}
        </div>
      )}

      <ol className={cn("flex flex-col gap-10", !!(title || description || filter) && "mt-8")}>
        {shown.map((r) => {
          const changes = r.changes.filter((c) => only === "all" || c.kind === only);
          return (
            <li
              key={r.version}
              id={idPrefix !== undefined ? `${idPrefix}${r.version.toLowerCase()}` : undefined}
              className="grid scroll-mt-24 gap-3 @3xl:grid-cols-[10rem_minmax(0,1fr)] @3xl:gap-8"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 @3xl:flex-col @3xl:gap-1">
                <span className="text-[15px] font-semibold text-ink tabular">{isUnreleased(r) ? l.unreleased : `v${r.version}`}</span>
                {r.date && <time dateTime={r.date} className="text-[13px] text-muted tabular">{formatDate ? formatDate(r.date) : r.date}</time>}
                {r === latest && <span className="rounded-full bg-positive-soft px-2 text-xs leading-5 text-positive">{l.latest}</span>}
              </div>
              <div className={cn("rounded-card bg-surface p-5 @2xl:p-6", cardClassName)}>
                {r.title && <h3 className="text-lg font-semibold tracking-[-0.01em] text-ink">{r.title}</h3>}
                {r.body && <p className={cn("text-sm leading-relaxed text-ink", !!r.title && "mt-2")}>{rich(r.body)}</p>}
                {changes.length > 0 && (
                  <ul className={cn("flex flex-col gap-2.5", !!(r.title || r.body) && "mt-4")}>
                    {changes.map((c, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-ink">
                        <span className={cn("mt-px w-[5.75rem] shrink-0 rounded-full px-2 text-center text-xs leading-5", kindClass[c.kind])}>{l.kind[c.kind]}</span>
                        <span className="min-w-0 leading-relaxed">{rich(c.text)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {r.href && (
                  <a href={r.href} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-medium text-accent hover:underline">
                    {l.compare}
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {shown.length === 0 && <p className="mt-8 text-muted">{l.empty}</p>}
      {older > 0 && (
        <button
          type="button"
          onClick={() => setCount(releases.length)}
          className="mt-10 h-10 rounded-full bg-btn-secondary px-5 text-sm font-medium text-btn-secondary-ink outline-none transition-transform hover:bg-btn-secondary-hover focus-visible:ring-2 focus-visible:ring-accent active:scale-[0.97]"
        >
          {l.showOlder(older)}
        </button>
      )}
    </section>
  );
}
