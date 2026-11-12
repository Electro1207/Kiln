import { useLayoutEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { motion } from "motion/react";
import { ArrowDown, Check, Minus } from "lucide-react";
import { cn } from "../../cn";
import { useControllable } from "../../controllable";
import { easeOut, springSnappy } from "../../motion";

/** Text used by Table. Pass a partial via `labels` to translate or reword. */
export interface TableLabels {
  /** Region name when no `caption` is given. */
  table: string;
  /** aria-label of the header checkbox. */
  selectAll: string;
  /** aria-label of a row checkbox. */
  selectRow: (id: string) => string;
}
export const tableLabels: TableLabels = { table: "Table", selectAll: "Select all rows", selectRow: (id) => `Select row ${id}` };

/** Icons used by Table. Pass a partial via `icons` to replace them. */
export interface TableIcons {
  /** Sort arrow in a column header; it turns over for descending. */
  sort: ReactNode;
  /** Tick in a selected row checkbox. */
  check: ReactNode;
  /** Dash in the select-all checkbox when only some rows are selected. */
  indeterminate: ReactNode;
}
export const tableIcons: TableIcons = { sort: <ArrowDown />, check: <Check />, indeterminate: <Minus /> };

export type Column<T> = {
  key: string;
  header: string;
  /** Value used for sorting. Omit to make the column unsortable. */
  sortValue?: (row: T) => string | number;
  render: (row: T) => ReactNode;
  align?: "left" | "right";
  /** Tailwind width class, e.g. "w-32". */
  width?: string;
};

export type TableProps<T> = {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  selectable?: boolean;
  /** Controlled selected row ids. Leave out to let the table keep its own. */
  selected?: Set<string>;
  /** Where uncontrolled selection starts. Default none. */
  defaultSelected?: Set<string>;
  /** Called with the new selection, controlled or not. */
  onSelectedChange?: (next: Set<string>) => void;
  /** Controlled sort, or `null` for the original order. Leave out to let the table keep its own. */
  sort?: TableSort;
  /** Where uncontrolled sorting starts. Default `null`. */
  defaultSort?: TableSort;
  /** Called with the new sort, controlled or not. */
  onSortChange?: (next: TableSort) => void;
  caption?: string;
  /** Max height before the body scrolls under a sticky header. */
  maxHeight?: number;
  className?: string;
  /** Override any UI text. Merged over `tableLabels`. */
  labels?: Partial<TableLabels>;
  /** Replace any built-in icon. Merged over `tableIcons`. */
  icons?: Partial<TableIcons>;
};

/** The column being sorted and its direction, or `null` for the original order. */
export type TableSort = { key: string; dir: "asc" | "desc" } | null;

/**
 * Rows that glide to a new order (FLIP). Call `capture()` just before changing
 * the order: it records where every row is on screen, mid-flight included.
 * After the commit each moved row slides from there with a Web Animation,
 * which runs on the compositor, so a sort costs no main-thread work per frame.
 */
export function useRowFlip(body: RefObject<HTMLElement | null>, order: string) {
  const before = useRef<Map<string, number> | null>(null);
  const capture = () => {
    const el = body.current;
    if (!el) return;
    const m = new Map<string, number>();
    el.querySelectorAll<HTMLElement>("[data-row]").forEach((r) => m.set(r.dataset.row!, r.getBoundingClientRect().top));
    before.current = m;
  };
  useLayoutEffect(() => {
    const el = body.current;
    const prev = before.current;
    before.current = null;
    if (!el || !prev || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.querySelectorAll<HTMLElement>("[data-row]").forEach((r) => {
      r.getAnimations().forEach((a) => a.cancel());
      const from = prev.get(r.dataset.row!);
      if (from == null) return;
      const dy = from - r.getBoundingClientRect().top;
      if (Math.abs(dy) < 0.5) return;
      r.animate([{ transform: `translateY(${dy}px)` }, { transform: "translateY(0)" }], {
        duration: 520,
        easing: `cubic-bezier(${easeOut.join(",")})`,
      });
    });
  }, [order, body]);
  return capture;
}

/** A data table with sortable columns, optional row selection and a sticky header. */
export function Table<T>({
  rows,
  columns,
  rowKey,
  selectable,
  selected: selectedProp,
  defaultSelected,
  onSelectedChange,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  caption,
  maxHeight = 420,
  className,
  labels,
  icons,
}: TableProps<T>) {
  const l = { ...tableLabels, ...labels };
  const ic = useMemo(() => ({ ...tableIcons, ...icons }), [icons]);
  const [sort, setSort] = useControllable<TableSort>(sortProp, defaultSort, onSortChange);
  const [selected, setSelected] = useControllable<Set<string>>(selectedProp, defaultSelected ?? new Set(), onSelectedChange);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const get = col.sortValue;
    return [...rows].sort((a, b) => {
      const va = get(a), vb = get(b);
      const r = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
      return sort.dir === "asc" ? r : -r;
    });
  }, [rows, columns, sort]);

  const body = useRef<HTMLTableSectionElement>(null);
  const capture = useRowFlip(body, sorted.map(rowKey).join("|"));
  const cycle = (key: string) => {
    capture();
    setSort(sort?.key !== key ? { key, dir: "asc" } : sort.dir === "asc" ? { key, dir: "desc" } : null);
  };

  const allIds = rows.map(rowKey);
  const all = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const some = !all && allIds.some((id) => selected.has(id));
  const toggleAll = () => setSelected(all ? new Set() : new Set(allIds));
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <div
      className={cn("relative w-full overflow-auto rounded-card border border-line bg-surface", className)}
      style={{ maxHeight }}
      tabIndex={0}
      role="region"
      aria-label={caption ?? l.table}
    >
      <table className="w-full min-w-[560px] border-separate border-spacing-0 text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {selectable && (
              <th scope="col" className="sticky top-0 z-10 w-12 border-b border-line bg-surface px-4 py-0 text-left">
                <TickBox checked={all} mixed={some} onChange={toggleAll} label={l.selectAll} icons={ic} />
              </th>
            )}
            {columns.map((c) => {
              const active = sort?.key === c.key;
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined}
                  className={cn(
                    "sticky top-0 z-10 h-11 whitespace-nowrap border-b border-line bg-surface px-4 font-medium text-muted",
                    c.align === "right" ? "text-right" : "text-left",
                    c.width,
                  )}
                >
                  {c.sortValue ? (
                    <button
                      type="button"
                      onClick={() => cycle(c.key)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-control py-1 transition-colors hover:text-ink",
                        c.align === "right" && "flex-row-reverse",
                        active && "text-ink",
                      )}
                    >
                      {c.header}
                      <motion.span
                        aria-hidden
                        initial={false}
                        animate={{ opacity: active ? 1 : 0, rotate: active && sort!.dir === "desc" ? 180 : 0 }}
                        transition={springSnappy}
                        className="inline-flex [&>svg]:size-3.5"
                      >
                        {ic.sort}
                      </motion.span>
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody ref={body}>
            {sorted.map((row) => {
              const id = rowKey(row);
              const isSel = selected.has(id);
              return (
                <tr
                  key={id}
                  data-row={id}
                  className={cn("group transition-colors duration-200", isSel ? "bg-accent-soft" : "bg-surface hover:bg-raised")}
                >
                  {selectable && (
                    <td className="border-b border-line px-4">
                      <TickBox checked={isSel} onChange={() => toggle(id)} label={l.selectRow(id)} icons={ic} />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "h-12 whitespace-nowrap border-b border-line px-4 text-ink group-last:border-b-0",
                        c.align === "right" && "tabular text-right",
                      )}
                    >
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

/** Fill changes colour; the tick and the dash share one cell and cross-fade. */
export function TickBox({ checked, mixed, onChange, label, icons }: { checked: boolean; mixed?: boolean; onChange: () => void; label: string; icons?: Pick<TableIcons, "check" | "indeterminate"> }) {
  const ic = icons ?? tableIcons;
  const on = checked || mixed;
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={mixed ? "mixed" : checked}
      aria-label={label}
      onClick={onChange}
      whileTap={{ scale: 0.88 }}
      transition={springSnappy}
      className={cn(
        "grid size-[18px] place-items-center rounded-[5px] border align-middle transition-[background-color,border-color] duration-200 ease-out-soft [&>*]:[grid-area:1/1]",
        on ? "border-btn-primary bg-btn-primary text-btn-primary-ink" : "border-line-strong bg-surface hover:border-faint",
      )}
    >
      <motion.span className="inline-flex [&>svg]:size-3 [&>svg]:[stroke-width:3]" initial={false} animate={{ opacity: checked && !mixed ? 1 : 0, scale: checked && !mixed ? 1 : 0.8 }} transition={springSnappy}>
        {ic.check}
      </motion.span>
      <motion.span className="inline-flex [&>svg]:size-3 [&>svg]:[stroke-width:3]" initial={false} animate={{ opacity: mixed ? 1 : 0, scale: mixed ? 1 : 0.8 }} transition={springSnappy}>
        {ic.indeterminate}
      </motion.span>
    </motion.button>
  );
}
