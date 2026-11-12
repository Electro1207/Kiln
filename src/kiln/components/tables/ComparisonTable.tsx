import { Fragment, type ReactNode } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "../../cn";

export type ComparisonPlan = { id: string; name: string; price: string; note?: string; featured?: boolean; action?: ReactNode };
export type ComparisonRow = {
  feature: string;
  /** true = included, false = not, or text such as "3 a month". Keyed by plan id. */
  values: Record<string, boolean | string>;
};
/** Text used by ComparisonTable. Pass a partial via `labels` to translate or reword. */
export interface ComparisonTableLabels {
  /** Screen-reader text for a check mark. */
  included: string;
  /** Screen-reader text for a dash. */
  notIncluded: string;
}
/** Icons used by ComparisonTable. Pass a partial via `icons` to replace them. */
export interface ComparisonTableIcons {
  /** Feature included in a plan. */
  included: ReactNode;
  /** Feature not in a plan. */
  notIncluded: ReactNode;
}
export const comparisonTableIcons: ComparisonTableIcons = { included: <Check />, notIncluded: <Minus /> };

export const comparisonTableLabels: ComparisonTableLabels = { included: "Included", notIncluded: "Not included" };

export type ComparisonGroup = { title: string; rows: ComparisonRow[] };

/**
 * Plans across, features down. The header with the plan names stays at the top
 * of the scroll area and the feature column stays at the left on phones.
 */
export function ComparisonTable({
  plans, groups, caption, maxHeight = 520, className, labels, icons,
}: {
  plans: ComparisonPlan[]; groups: ComparisonGroup[]; caption: string; maxHeight?: number; className?: string;
  /** Override any UI text. Merged over `comparisonTableLabels`. */
  labels?: Partial<ComparisonTableLabels>;
  /** Replace any built-in icon. Merged over `comparisonTableIcons`. */
  icons?: Partial<ComparisonTableIcons>;
}) {
  const l = { ...comparisonTableLabels, ...labels };
  const ic = { ...comparisonTableIcons, ...icons };
  return (
    <div
      className={cn("w-full overflow-auto rounded-card border border-line bg-surface", className)}
      style={{ maxHeight }}
      role="region"
      aria-label={caption}
      tabIndex={0}
    >
      <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className="sticky left-0 top-0 z-30 w-[34%] border-b border-line bg-surface p-4 text-left align-bottom font-medium text-muted">
              Compare plans
            </th>
            {plans.map((p) => (
              <th
                key={p.id}
                scope="col"
                className={cn("sticky top-0 z-20 border-b border-line bg-surface p-4 text-left align-bottom font-normal", p.featured && "bg-accent-soft")}
              >
                <span className="block font-semibold text-ink">{p.name}</span>
                <span className="tabular block text-ink">{p.price}</span>
                {p.note && <span className="block text-xs text-muted">{p.note}</span>}
                {p.action && <span className="mt-3 block">{p.action}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <Fragment key={g.title}>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={plans.length + 1}
                  className="border-b border-line bg-raised px-4 py-2 text-left text-[13px] font-semibold text-ink"
                >
                  <span className="sticky left-4">{g.title}</span>
                </th>
              </tr>
              {g.rows.map((r) => (
                <tr key={r.feature} className="group">
                  <th scope="row" className="sticky left-0 z-10 h-12 border-b border-line bg-surface px-4 text-left font-normal text-ink transition-colors duration-200 group-hover:bg-raised group-last:border-b-0">
                    {r.feature}
                  </th>
                  {plans.map((p) => {
                    const v = r.values[p.id];
                    return (
                      <td
                        key={p.id}
                        className={cn(
                          "h-12 border-b border-line px-4 transition-colors duration-200 group-last:border-b-0",
                          p.featured ? "bg-accent-soft/50 group-hover:bg-accent-soft" : "group-hover:bg-raised",
                        )}
                      >
                        {v === true ? (
                          <span className="flex items-center text-ink">
                            <span className="grid place-items-center text-accent [&>svg]:size-4" aria-hidden>{ic.included}</span>
                            <span className="sr-only">{l.included}</span>
                          </span>
                        ) : v === false || v == null ? (
                          <span className="flex items-center text-faint">
                            <span className="grid place-items-center [&>svg]:size-4" aria-hidden>{ic.notIncluded}</span>
                            <span className="sr-only">{l.notIncluded}</span>
                          </span>
                        ) : (
                          <span className="tabular text-ink">{v}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
