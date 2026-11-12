import { type ReactNode } from "react";
import { cn } from "../../cn";

/** Text used by Changelog. Pass a partial via `labels` to translate or reword. */
export interface ChangelogLabels {
  /** Badge text per kind of change. */
  kind: Record<"new" | "improved" | "fixed", string>;
}
export const changelogLabels: ChangelogLabels = { kind: { new: "New", improved: "Improved", fixed: "Fixed" } };

export type ChangeKind = "new" | "improved" | "fixed";
export type Release = { version: string; date: string; title: string; body?: string; changes: { kind: ChangeKind; text: string }[] };

export type ChangelogProps = { title: ReactNode; description?: ReactNode; releases: Release[];
  /** Override any UI text. Merged over `changelogLabels`. */
  labels?: Partial<ChangelogLabels>; className?: string };

const kind: Record<ChangeKind, { label: string; cls: string }> = {
  new: { label: "New", cls: "bg-accent-soft text-ink" },
  improved: { label: "Improved", cls: "bg-info-soft text-info" },
  fixed: { label: "Fixed", cls: "bg-positive-soft text-positive" },
};

/** Releases, newest first. The version and date sit in their own column on wide screens. */
export function Changelog({ title, description, releases, labels, className }: ChangelogProps) {
  const kindLabel = { ...changelogLabels.kind, ...labels?.kind };
  return (
    <section className={cn("@container w-full", className)}>
      <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink text-balance @2xl:text-[1.75rem]">{title}</h2>
      {description && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink">{description}</p>}
      <ol className="mt-8 flex flex-col gap-10">
        {releases.map((r) => (
          <li key={r.version} className="grid gap-3 @3xl:grid-cols-[10rem_minmax(0,1fr)] @3xl:gap-8">
            <div className="flex items-baseline gap-3 @3xl:flex-col @3xl:gap-1">
              <span className="text-[15px] font-semibold text-ink tabular">v{r.version}</span>
              <time className="text-[13px] text-muted tabular">{r.date}</time>
            </div>
            <div className="rounded-card bg-surface p-5 @2xl:p-6">
              <h3 className="text-lg font-semibold tracking-[-0.01em] text-ink">{r.title}</h3>
              {r.body && <p className="mt-2 text-sm leading-relaxed text-ink">{r.body}</p>}
              <ul className="mt-4 flex flex-col gap-2.5">
                {r.changes.map((c) => (
                  <li key={c.text} className="flex items-start gap-3 text-sm text-ink">
                    <span className={cn("mt-px w-[4.75rem] shrink-0 rounded-full px-2 text-center text-xs leading-5", kind[c.kind].cls)}>{kindLabel[c.kind]}</span>
                    <span className="min-w-0">{c.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
