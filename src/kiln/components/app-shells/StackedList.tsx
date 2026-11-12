import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../cn";
import { useControllable } from "../../controllable";
import { TickBox } from "../tables/Table";

/** Text used by StackedList. Pass a partial via `labels` to translate or reword. */
export interface StackedListLabels {
  /** aria-label of a row's checkbox, with the row's plain-text `label`. */
  selectRow: (label: string) => string;
}
export const stackedListLabels: StackedListLabels = { selectRow: (label) => `Select ${label}` };

export type StackedRow = {
  id: string;
  title: ReactNode;
  /** Plain text name, for labels. */
  label: string;
  subtitle?: ReactNode;
  leading?: ReactNode;
  /** Right column, top line: a status or a figure. */
  status?: ReactNode;
  /** Right column, second line: a time or a detail. */
  detail?: ReactNode;
  href?: string;
};

/**
 * Rows with a picture, two lines on the left and two on the right, and a chevron.
 * With `selected`, each row gets a checkbox; without it, each row is a link or button.
 * The right column folds under the title on narrow containers.
 */
export function StackedList({
  rows, selected: selectedProp, defaultSelected, onSelectedChange, onOpen, label, className, labels,
}: {
  rows: StackedRow[];
  /** Selected row ids. Passing `selected`, `defaultSelected` or `onSelectedChange` turns on the checkboxes. */
  selected?: Set<string>;
  /** Starting selection when uncontrolled. */
  defaultSelected?: Set<string>;
  onSelectedChange?: (next: Set<string>) => void;
  onOpen?: (id: string) => void;
  label: string;
  className?: string;
  /** Override any UI text. Merged over `stackedListLabels`. */
  labels?: Partial<StackedListLabels>;
}) {
  const l = { ...stackedListLabels, ...labels };
  const selectable = !!(selectedProp || defaultSelected || onSelectedChange);
  const [selected, setSelected] = useControllable<Set<string>>(selectedProp, defaultSelected ?? new Set(), onSelectedChange);
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };
  return (
    <ul aria-label={label} className={cn("@container w-full overflow-hidden rounded-card border border-line bg-surface", className)}>
      {rows.map((r) => {
        const on = selected?.has(r.id) ?? false;
        const body = (
          <>
            {r.leading && <span className="shrink-0">{r.leading}</span>}
            <span className="flex min-w-0 flex-1 flex-col gap-0.5 @lg:flex-row @lg:items-center @lg:gap-6">
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-ink">{r.title}</span>
                {r.subtitle && <span className="truncate text-[13px] text-muted">{r.subtitle}</span>}
              </span>
              {(r.status || r.detail) && (
                <span className="flex shrink-0 items-center gap-2 @lg:flex-col @lg:items-end @lg:gap-0.5">
                  {r.status && <span className="text-[13px] text-ink">{r.status}</span>}
                  {r.detail && <span className="tabular text-xs text-muted">{r.detail}</span>}
                </span>
              )}
            </span>
            {!selectable && <ChevronRight aria-hidden className="size-4 shrink-0 text-faint transition-transform duration-200 group-hover:translate-x-0.5" />}
          </>
        );
        const rowCls = cn(
          "group flex min-h-16 w-full items-center gap-4 px-4 py-3 text-left transition-colors duration-200",
          on ? "bg-accent-soft" : "hover:bg-raised",
        );
        return (
          <li key={r.id} className="border-b border-line last:border-b-0">
            {selectable ? (
              <div className={rowCls} onClick={(e) => (e.target as HTMLElement).closest("button") || toggle(r.id)}>
                <TickBox checked={on} onChange={() => toggle(r.id)} label={l.selectRow(r.label)} />
                {body}
              </div>
            ) : r.href ? (
              <a href={r.href} className={rowCls}>
                {body}
              </a>
            ) : (
              <button type="button" className={rowCls} onClick={() => onOpen?.(r.id)}>
                {body}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
