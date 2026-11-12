import { useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Columns3, X } from "lucide-react";
import { cn } from "../../cn";
import { fade, springSnappy, springSoft } from "../../motion";
import { Button } from "../buttons/Button";
import { DropdownMenu } from "../menus/DropdownMenu";
import { Pagination } from "../wayfinding/Pagination";
import { SearchField, type SearchFieldIcons } from "../text-input/SearchField";
import { SegmentedControl } from "../buttons/SegmentedControl";
import { TickBox, tableIcons, useRowFlip, type TableIcons } from "./Table";

export type GridColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Value used for sorting. Omit to make the column unsortable. */
  sortValue?: (row: T) => string | number;
  /** Text the filter searches. Defaults to the sort value. */
  filterText?: (row: T) => string;
  align?: "left" | "right";
  /** Minimum width in px. */
  width?: number;
  /** Starts hidden; can be shown from the columns menu. */
  hidden?: boolean;
  /** Always shown. The first column is always shown and sticky, with the row's checkbox. */
  required?: boolean;
};

/** Text used by DataGrid. Pass a partial via `labels` to translate or reword. */
export interface DataGridLabels {
  /** Filter field placeholder and aria-label; `plural` is `noun[1]`. */
  filter: (plural: string) => string;
  /** Name of the density control. */
  density: string;
  compact: string;
  comfortable: string;
  /** Columns menu button. */
  columns: string;
  /** Heading inside the columns menu. */
  showColumns: string;
  /** Header checkbox; `plural` is `noun[1]`. */
  selectAll: (plural: string) => string;
  /** Row checkbox. */
  selectRow: (id: string) => string;
  /** Footer count, e.g. "1–8 of 40 ships". */
  range: (from: number, to: number, total: number, noun: string) => string;
  /** Footer text when nothing matches. */
  none: (plural: string) => string;
  /** aria-label of the bulk action toolbar. */
  bulkBar: string;
  /** "3 selected". */
  selected: (count: number) => string;
  /** aria-label of the clear-selection button. */
  clearSelection: string;
}
/** Icons used by DataGrid. Pass a partial via `icons` to replace them. */
export interface DataGridIcons extends TableIcons {
  /** Columns menu button. */
  columns: ReactNode;
  /** Button that clears the row selection. */
  clearSelection: ReactNode;
  /** Icons for the filter field. */
  search: Partial<SearchFieldIcons>;
}
export const dataGridIcons: DataGridIcons = { ...tableIcons, columns: <Columns3 />, clearSelection: <X />, search: {} };

export const dataGridLabels: DataGridLabels = {
  filter: (p) => `Filter ${p}`,
  density: "Row density",
  compact: "Compact",
  comfortable: "Comfortable",
  columns: "Columns",
  showColumns: "Show columns",
  selectAll: (p) => `Select all ${p} on this page`,
  selectRow: (id) => `Select ${id}`,
  range: (f, t, n, noun) => `${f}–${t} of ${n} ${noun}`,
  none: (p) => `0 ${p}`,
  bulkBar: "Actions for the selection",
  selected: (n) => `${n} selected`,
  clearSelection: "Clear selection",
};

export type BulkAction = { label: string; icon?: ReactNode; tone?: "neutral" | "danger"; onRun: (ids: string[]) => void };

export type DataGridProps<T> = {
  rows: T[];
  columns: GridColumn<T>[];
  rowKey: (row: T) => string;
  /** What one row is, for counts and empty states: "ship", "ships". */
  noun: [string, string];
  caption: string;
  pageSize?: number;
  bulkActions?: BulkAction[];
  className?: string;
  /** Override any UI text. Merged over `dataGridLabels`. */
  labels?: Partial<DataGridLabels>;
  /** Replace any built-in icon. Merged over `dataGridIcons`. */
  icons?: Partial<DataGridIcons>;
};

type Density = "compact" | "comfortable";
type Sort = { key: string; dir: "asc" | "desc" } | null;

/**
 * A working table: filter, sort, choose columns, page through, change density
 * and act on a selection. The first column stays put while the rest scrolls.
 */
export function DataGrid<T>({ rows, columns, rowKey, noun, caption, pageSize = 8, bulkActions = [], className, labels, icons }: DataGridProps<T>) {
  const l = { ...dataGridLabels, ...labels };
  const ic = useMemo(() => ({ ...dataGridIcons, ...icons }), [icons]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>(null);
  const [page, setPage] = useState(1);
  const [density, setDensity] = useState<Density>("comfortable");
  const [hidden, setHidden] = useState<Set<string>>(() => new Set(columns.filter((c) => c.hidden).map((c) => c.key)));
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visible = columns.filter((c) => !hidden.has(c.key));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      columns.some((c) => {
        const t = c.filterText ? c.filterText(r) : c.sortValue ? String(c.sortValue(r)) : "";
        return t.toLowerCase().includes(q);
      }),
    );
  }, [rows, columns, query]);

  const sorted = useMemo(() => {
    const col = sort && columns.find((c) => c.key === sort.key);
    if (!sort || !col?.sortValue) return filtered;
    const get = col.sortValue;
    return [...filtered].sort((a, b) => {
      const va = get(a), vb = get(b);
      const r = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
      return sort.dir === "asc" ? r : -r;
    });
  }, [filtered, columns, sort]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  if (page > pageCount) setPage(pageCount);
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);

  const pageIds = pageRows.map(rowKey);
  const all = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const some = !all && pageIds.some((id) => selected.has(id));
  const toggleAll = () => {
    const next = new Set(selected);
    pageIds.forEach((id) => (all ? next.delete(id) : next.add(id)));
    setSelected(next);
  };
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };
  const body = useRef<HTMLTableSectionElement>(null);
  const capture = useRowFlip(body, pageRows.map(rowKey).join("|") + `|${page}|${query}`);
  const cycle = (key: string) => {
    capture();
    setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null));
  };

  const rowH = density === "compact" ? "h-10" : "h-[52px]";
  // Density: the body dips out, the rows change height while it is invisible,
  // and it comes back. No remount and no height tween.
  const changeDensity = (d: Density) => {
    const el = body.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDensity(d);
      return;
    }
    const out = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 110, easing: "ease-out", fill: "forwards" });
    out.onfinish = () => {
      setDensity(d);
      requestAnimationFrame(() => {
        el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: "ease-out" });
        out.cancel();
      });
    };
  };
  const from = sorted.length ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, sorted.length);

  return (
    <div className={cn("relative flex w-full min-w-0 flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <SearchField
          value={query}
          onValueChange={(v) => {
            setQuery(v);
            setPage(1);
          }}
          placeholder={l.filter(noun[1])}
          aria-label={l.filter(noun[1])}
          icons={ic.search}
          className="min-w-0 flex-1 basis-56"
        />
        <div className="flex items-center gap-2">
          <SegmentedControl<Density>
            size="sm"
            label={l.density}
            value={density}
            onChange={changeDensity}
            options={[
              { value: "compact", label: l.compact },
              { value: "comfortable", label: l.comfortable },
            ]}
          />
          <DropdownMenu
            label={l.columns}
            placement="bottom-end"
            items={[
              { type: "label", label: l.showColumns },
              ...columns
                .filter((c, i) => i > 0 && !c.required)
                .map((c) => ({
                  type: "checkbox" as const,
                  label: c.header,
                  checked: !hidden.has(c.key),
                  onCheckedChange: (v: boolean) =>
                    setHidden((h) => {
                      const n = new Set(h);
                      if (v) n.delete(c.key);
                      else n.add(c.key);
                      return n;
                    }),
                })),
            ]}
            trigger={({ open, ...p }) => (
              <Button {...p} size="sm" variant="secondary" leading={ic.columns} className={cn(open && "bg-btn-secondary-hover")}>
                {l.columns}
              </Button>
            )}
          />
        </div>
      </div>

      <div className="relative overflow-hidden rounded-card border border-line bg-surface">
        <div className="overflow-x-auto" role="region" aria-label={caption} tabIndex={0}>
          <table className="w-full border-separate border-spacing-0 text-sm">
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr>
                {visible.map((c, ci) => {
                  const active = sort?.key === c.key;
                  return (
                    <th
                      key={c.key}
                      scope="col"
                      aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined}
                      style={{ minWidth: c.width }}
                      className={cn(
                        "h-11 whitespace-nowrap border-b border-line bg-surface px-4 font-medium text-muted",
                        c.align === "right" ? "text-right" : "text-left",
                        ci === 0 && "sticky left-0 z-20 border-r pl-4",
                      )}
                    >
                      {ci === 0 && (
                        <span className="mr-3 inline-flex align-middle">
                          <TickBox checked={all} mixed={some} onChange={toggleAll} label={l.selectAll(noun[1])} icons={ic} />
                        </span>
                      )}
                      {c.sortValue ? (
                        <button
                          type="button"
                          onClick={() => cycle(c.key)}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-control py-1 transition-colors duration-200 hover:text-ink",
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
            <AnimatePresence initial={false} mode="wait">
              <motion.tbody
                ref={body}
                key={`${page}-${query}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
              >
                {pageRows.map((row) => {
                  const id = rowKey(row);
                  const isSel = selected.has(id);
                  const bg = isSel ? "bg-accent-soft" : "bg-surface group-hover:bg-raised";
                  return (
                    <tr key={id} data-row={id} className="group">
                      {visible.map((c, ci) => (
                        <td
                          key={c.key}
                          className={cn(
                            "whitespace-nowrap border-b border-line px-4 text-ink transition-[background-color] duration-200 ease-out-soft",
                            rowH,
                            bg,
                            c.align === "right" && "tabular text-right",
                            ci === 0 && "sticky left-0 z-10 border-r pl-4",
                          )}
                        >
                          {ci === 0 ? (
                            <span className="flex items-center gap-3">
                              <TickBox checked={isSel} onChange={() => toggle(id)} label={l.selectRow(id)} icons={ic} />
                              {c.render(row)}
                            </span>
                          ) : (
                            c.render(row)
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {pageRows.length === 0 && (
                  <tr>
                    <td colSpan={visible.length} className="h-40 px-4 text-center text-muted">
                      No {noun[1]} match “{query}”.
                    </td>
                  </tr>
                )}
              </motion.tbody>
            </AnimatePresence>
          </table>
        </div>
        <div className="grid [&>*]:[grid-area:1/1]">
          <motion.div
            className="flex min-h-14 flex-wrap items-center justify-between gap-3 px-4 py-2.5"
            initial={false}
            animate={{ opacity: selected.size > 0 ? 0 : 1 }}
            transition={fade}
            style={{ pointerEvents: selected.size > 0 ? "none" : "auto" }}
            aria-hidden={selected.size > 0 || undefined}
          >
            <span className="tabular text-[13px] text-muted">
              {sorted.length ? l.range(from, to, sorted.length, sorted.length === 1 ? noun[0] : noun[1]) : l.none(noun[1])}
            </span>
            {pageCount > 1 && <Pagination page={page} pageCount={pageCount} onChange={setPage} />}
          </motion.div>
          <AnimatePresence>
            {selected.size > 0 && (
              <motion.div
                key="bulk"
                role="toolbar"
                aria-label={l.bulkBar}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12, transition: { ...springSoft, opacity: fade } }}
                transition={springSoft}
                className="flex min-h-14 items-center gap-1 bg-surface px-2 py-2.5 sm:px-3"
              >
                <span className="tabular mr-auto whitespace-nowrap pl-2 text-[13px] font-medium text-ink">
                  {l.selected(selected.size)}
                </span>
                {bulkActions.map((a) => (
                  <motion.button
                    key={a.label}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    transition={springSnappy}
                    onClick={() => {
                      a.onRun([...selected]);
                      setSelected(new Set());
                    }}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-control px-3 text-[13px] font-medium transition-colors duration-200 [&>svg]:size-4",
                      a.tone === "danger" ? "text-negative hover:bg-negative-soft" : "text-ink hover:bg-raised",
                    )}
                  >
                    {a.icon}
                    <span className="hidden sm:inline">{a.label}</span>
                    <span className="sr-only sm:hidden">{a.label}</span>
                  </motion.button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  aria-label={l.clearSelection}
                  className="grid size-9 place-items-center rounded-control text-muted transition-colors duration-200 hover:bg-raised hover:text-ink [&>svg]:size-4"
                >
                  {ic.clearSelection}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
