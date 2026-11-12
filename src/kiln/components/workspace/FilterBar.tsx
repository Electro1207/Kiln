import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDownUp, Check, ChevronDown, Plus, Search, X } from "lucide-react";
import { cn } from "../../cn";
import { fade, springFirm } from "../../motion";
import { AnchoredLayer, RowHighlight, SwapText, optionClass } from "../shared/Anchored";
import { DropdownMenu } from "../menus/DropdownMenu";
import { useControllable } from "../../controllable";

export type FilterField = { id: string; label: string; options: { value: string; label: string }[] };
export type FilterValues = Record<string, string[]>;
export type SortOption = { id: string; label: string };
export type SavedView = { id: string; label: string; query?: string; filters: FilterValues; sort?: string };

export type FilterBarProps = {
  fields: FilterField[];
  /** Active filters by field id; leave out to let the bar keep them. */
  filters?: FilterValues;
  /** Starting filters when uncontrolled. */
  defaultFilters?: FilterValues;
  onFiltersChange?: (f: FilterValues) => void;
  /** Search text; leave out to let the bar keep it. */
  query?: string;
  /** Starting search text when uncontrolled. */
  defaultQuery?: string;
  onQueryChange?: (q: string) => void;
  sorts?: SortOption[];
  /** Chosen sort id; leave out to let the bar keep it. */
  sort?: string;
  /** Starting sort id when uncontrolled. */
  defaultSort?: string;
  onSortChange?: (id: string) => void;
  views?: SavedView[];
  /** Shown after the controls, e.g. "12 results". */
  summary?: string;
  /** Search field label and placeholder. Wins over `labels.search`. */
  searchLabel?: string;
  /** Override any UI text. Merged over `filterBarLabels`. */
  labels?: Partial<FilterBarLabels>;
  className?: string;
};

/** Text used by FilterBar. Pass a partial via `labels` to translate or reword. */
export interface FilterBarLabels {
  /** Search field label and placeholder. */
  search: string;
  /** aria-label of the clear-search button. */
  clearSearch: string;
  /** aria-label of the saved views tab strip. */
  savedViews: string;
  /** Chip value when a filter has nothing chosen. */
  any: string;
  /** Chip value when three or more options are chosen: "3 selected". */
  selected: (count: number) => string;
  /** aria-label of a chip's remove button. */
  removeFilter: (field: string) => string;
  /** Menu label of the add-filter menu. */
  addFilter: string;
  /** Add-filter button text. */
  filter: string;
  /** Clear-everything button text. */
  clearAll: string;
  /** Sort menu label and heading. */
  sortBy: string;
  /** Sort button text when no sort is chosen. */
  sort: string;
}
export const filterBarLabels: FilterBarLabels = {
  search: "Search",
  clearSearch: "Clear search",
  savedViews: "Saved views",
  any: "any",
  selected: (n) => `${n} selected`,
  removeFilter: (field) => `Remove ${field} filter`,
  addFilter: "Add a filter",
  filter: "Filter",
  clearAll: "Clear all",
  sortBy: "Sort by",
  sort: "Sort",
};

const active = (f: FilterValues) => Object.entries(f).filter(([, v]) => v.length > 0);

/** The editor inside a filter chip: a tickable list of the field's values. */
function ValueList({ field, value, onChange }: { field: FilterField; value: string[]; onChange: (v: string[]) => void }) {
  const id = useId();
  const [hl, setHl] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const raf = requestAnimationFrame(() => listRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(raf);
  }, []);
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setHl((h) => Math.min(h + 1, field.options.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHl((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(field.options[hl].value); }
  };
  return (
    <div
      role="listbox"
      aria-multiselectable
      aria-label={field.label}
      tabIndex={0}
      aria-activedescendant={`${id}-${hl}`}
      onKeyDown={onKey}
      className="outline-none"
      ref={listRef}
    >
      {field.options.map((o, i) => {
        const on = value.includes(o.value);
        return (
          <div
            key={o.value}
            id={`${id}-${i}`}
            role="option"
            aria-selected={on}
            onPointerMove={() => setHl(i)}
            onClick={() => toggle(o.value)}
            className={optionClass}
          >
            <RowHighlight on={hl === i} />
            <span className={cn("grid size-4 place-items-center rounded-[4px] border transition-colors duration-200", on ? "border-transparent bg-btn-primary text-btn-primary-ink" : "border-line-strong")}>
              <motion.span initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="grid">
                <Check className="size-3" strokeWidth={3} />
              </motion.span>
            </span>
            <span className="min-w-0 flex-1 truncate">{o.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function FilterChip({ field, value, onChange, onRemove, autoOpen, l }: {
  l: FilterBarLabels; field: FilterField; value: string[]; onChange: (v: string[]) => void; onRemove: () => void; autoOpen: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(autoOpen);
  const labels = field.options.filter((o) => value.includes(o.value)).map((o) => o.label);
  const text = labels.length === 0 ? l.any : labels.length <= 2 ? labels.join(", ") : l.selected(labels.length);
  return (
    <span className="inline-flex h-8 items-center rounded-full bg-surface text-[13px] text-ink">
      <button
        ref={ref}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-full items-center gap-1.5 rounded-l-full pl-3 pr-1.5 transition-colors hover:bg-active"
      >
        <span className="text-muted">{field.label}</span>
        <SwapText value={text} className="max-w-40 font-medium">{text}</SwapText>
        <ChevronDown className="size-3.5 text-muted" />
      </button>
      <button
        type="button"
        aria-label={l.removeFilter(field.label)}
        onClick={onRemove}
        className="grid h-full w-7 place-items-center rounded-r-full text-muted transition-colors hover:bg-active hover:text-ink"
      >
        <X className="size-3.5" />
      </button>
      <AnchoredLayer open={open} onClose={() => { setOpen(false); if (value.length === 0) onRemove(); }} anchor={ref} className="w-56">
        <ValueList field={field} value={value} onChange={onChange} />
      </AnchoredLayer>
    </span>
  );
}

/**
 * Search, filter chips with their own editors, a sort menu and saved views.
 * Each active filter is a chip; "Clear all" appears once anything is set.
 */
export function FilterBar({
  fields, filters: filtersProp, defaultFilters = {}, onFiltersChange, query: queryProp, defaultQuery = "", onQueryChange,
  sorts, sort: sortProp, defaultSort, onSortChange, views, summary, searchLabel, labels, className,
}: FilterBarProps) {
  const l = { ...filterBarLabels, ...labels };
  const search = searchLabel ?? l.search;
  const [filters, setFilters] = useControllable<FilterValues>(filtersProp, defaultFilters, onFiltersChange);
  const [query, setQuery] = useControllable<string>(queryProp, defaultQuery, onQueryChange);
  const [sort, setSort] = useControllable<string | undefined>(sortProp, defaultSort, (id) => id && onSortChange?.(id));
  const [justAdded, setJustAdded] = useState<string | null>(null);
  // Fields the person added but hasn't chosen values for yet still show their chip.
  const [pending, setPending] = useState<string[]>([]);
  const shownIds = [...new Set([...active(filters).map(([k]) => k), ...pending])];
  const unused = fields.filter((f) => !shownIds.includes(f.id));
  const anything = query.length > 0 || active(filters).length > 0;
  const currentView = views?.find(
    (v) => (v.query ?? "") === query && JSON.stringify(normal(v.filters)) === JSON.stringify(normal(filters)) && (!v.sort || v.sort === sort),
  );

  const set = (fid: string, v: string[]) => setFilters({ ...filters, [fid]: v });
  const remove = (fid: string) => {
    const next = { ...filters };
    delete next[fid];
    setFilters(next);
    setPending((p) => p.filter((x) => x !== fid));
  };
  const clear = () => {
    setFilters({});
    setQuery("");
    setPending([]);
  };

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      {views && views.length > 0 && (
        <div role="tablist" aria-label={l.savedViews} className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {views.map((v) => {
            const on = currentView?.id === v.id;
            return (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setQuery(v.query ?? "");
                  setFilters(v.filters);
                  if (v.sort) setSort(v.sort);
                  setPending([]);
                }}
                className={cn("relative h-8 shrink-0 rounded-full px-3 text-[13px] transition-colors duration-200", on ? "font-medium text-ink" : "text-muted hover:text-ink")}
              >
                <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-0 bg-surface" style={{ borderRadius: 999 }} />
                <span className="relative z-[1]">{v.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex h-8 min-w-0 flex-1 basis-56 items-center gap-2 rounded-full bg-surface px-3 transition-shadow focus-within:ring-2 focus-within:ring-accent sm:max-w-72">
          <Search className="size-4 shrink-0 text-muted" aria-hidden />
          <span className="sr-only">{search}</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={search}
            className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-muted"
          />
          <span className="grid size-5 shrink-0 [&>*]:[grid-area:1/1]">
            <AnimatePresence initial={false}>
              {query && (
                <motion.button
                  type="button"
                  aria-label={l.clearSearch}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={fade}
                  onClick={() => setQuery("")}
                  className="grid size-5 place-items-center rounded-full text-muted transition-colors hover:bg-active hover:text-ink"
                >
                  <X className="size-3" />
                </motion.button>
              )}
            </AnimatePresence>
          </span>
        </label>

        <AnimatePresence initial={false} mode="popLayout">
          {shownIds.map((fid) => {
            const field = fields.find((f) => f.id === fid)!;
            return (
              <motion.span
                key={fid}
                layout="position"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.12 } }}
                transition={springFirm}
                className="inline-flex"
              >
                <FilterChip
                  field={field}
                  value={filters[fid] ?? []}
                  onChange={(v) => set(fid, v)}
                  onRemove={() => remove(fid)}
                  autoOpen={justAdded === fid}
                  l={l}
                />
              </motion.span>
            );
          })}

          {unused.length > 0 && (
            <motion.span key="add" layout="position" transition={springFirm} className="inline-flex">
              <DropdownMenu
                label={l.addFilter}
                items={unused.map((f) => ({
                  label: f.label,
                  onSelect: () => {
                    setPending((p) => [...p, f.id]);
                    setJustAdded(f.id);
                  },
                }))}
                trigger={({ open, ...p }) => (
                  <button
                    {...p}
                    className={cn("inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] text-muted transition-colors hover:bg-active hover:text-ink", open && "bg-active text-ink")}
                  >
                    <Plus className="size-3.5" /> {l.filter}
                  </button>
                )}
              />
            </motion.span>
          )}

          {anything && (
            <motion.button
              key="clear"
              type="button"
              layout="position"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ layout: springFirm, opacity: fade }}
              onClick={clear}
              className="h-8 rounded-full px-3 text-[13px] text-accent transition-colors hover:bg-active"
            >
              {l.clearAll}
            </motion.button>
          )}
        </AnimatePresence>

        <div className="ml-auto flex items-center gap-3">
          {summary && <SwapText value={summary} className="text-[13px] text-muted tabular">{summary}</SwapText>}
          {sorts && sorts.length > 0 && (
            <DropdownMenu
              label={l.sortBy}
              placement="bottom-end"
              items={[
                { type: "label", label: l.sortBy },
                ...sorts.map((s) => ({ type: "checkbox" as const, label: s.label, checked: s.id === sort, onCheckedChange: () => setSort(s.id) })),
              ]}
              trigger={({ open, ...p }) => (
                <button
                  {...p}
                  className={cn("inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] text-ink transition-colors hover:bg-active", open && "bg-active")}
                >
                  <ArrowDownUp className="size-3.5 text-muted" />
                  <SwapText value={sort ?? ""}>{sorts.find((s) => s.id === sort)?.label ?? l.sort}</SwapText>
                </button>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function normal(f: FilterValues) {
  return Object.fromEntries(Object.entries(f).filter(([, v]) => v.length).map(([k, v]) => [k, [...v].sort()]).sort());
}

