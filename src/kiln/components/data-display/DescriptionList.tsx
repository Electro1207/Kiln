import type { ReactNode } from "react";
import { cn } from "../../cn";
import { CopyButton } from "../buttons/CopyButton";

export type DescriptionItem = {
  term: string;
  value: ReactNode;
  /** Plain text to copy. Shows a copy button when set. */
  copy?: string;
  /** Set mono for IDs, keys and codes. */
  mono?: boolean;
};

/** Text used by DescriptionList. Pass a partial via `labels` to translate or reword. */
export interface DescriptionListLabels {
  /** Label of a row copy button, given the term. */
  copy: (term: string) => string;
}
export const descriptionListLabels: DescriptionListLabels = { copy: (term) => `Copy ${term.toLowerCase()}` };

/**
 * Key and value pairs for the detail of one thing. Two columns from 640px,
 * stacked on phones. Values that people paste elsewhere carry a copy button
 * that keeps its place, so rows never shift.
 */
export function DescriptionList({ items, className, title, labels }: { items: DescriptionItem[]; className?: string; title?: string; /** Override any UI text. Merged over `descriptionListLabels`. */ labels?: Partial<DescriptionListLabels> }) {
  const l = { ...descriptionListLabels, ...labels };
  return (
    <dl aria-label={title} className={cn("w-full overflow-hidden rounded-card border border-line bg-surface", className)}>
      {items.map((it) => (
        <div
          key={it.term}
          className="grid min-h-12 grid-cols-1 gap-x-6 gap-y-0.5 border-b border-line px-4 py-3 last:border-b-0 sm:grid-cols-[minmax(0,200px)_1fr] sm:items-center sm:py-0"
        >
          <dt className="text-[13px] text-muted sm:py-3">{it.term}</dt>
          <dd className="flex min-w-0 items-center justify-between gap-2 text-sm text-ink">
            <span className={cn("min-w-0 break-words", it.mono && "font-mono text-[13px]")}>{it.value}</span>
            {it.copy != null && <CopyButton value={it.copy} label={l.copy(it.term)} className="-my-1 -mr-2 shrink-0" />}
          </dd>
        </div>
      ))}
    </dl>
  );
}
