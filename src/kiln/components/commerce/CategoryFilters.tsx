import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useControllable } from "../../controllable";
import { AnimatePresence, motion } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "../../cn";
import { fade, springFirm, springSnappy } from "../../motion";
import { Checkbox } from "../choice-controls/Checkbox";
import { Slider } from "../choice-controls/Slider";
import { Drawer } from "../overlays/Drawer";
import { Button } from "../buttons/Button";

/** Text used by CategoryFilters. Pass a partial via `labels` to translate or reword. */
export interface CategoryFiltersLabels {
  /** aria-label of the sidebar, title of the phone drawer, and label of the phone button. */
  filters: string;
  /** Result count text, e.g. "12 results". Receives the already-rendered number node. */
  results: (count: number, num: ReactNode) => ReactNode;
  /** Phone button text with active chips, e.g. "Filters · 2". */
  filtersWithCount: (n: number) => string;
  /** aria-label of the chip row. */
  activeFilters: string;
  /** aria-label of a chip's remove action, given the chip label. */
  removeFilter: (label: string) => string;
  /** Clear-all button text. */
  clearAll: string;
  /** Drawer confirm button, e.g. "Show 12 results". */
  showResults: (count: number) => string;
  /** aria-label of a colour swatch, given label and count. */
  colourLabel: (label: string, count: number) => string;
  /** title (tooltip) of a colour swatch. */
  colourTitle: (label: string, count: number) => string;
}
export const categoryFiltersLabels: CategoryFiltersLabels = {
  filters: "Filters",
  results: (count, num) => <>{num} {count === 1 ? "result" : "results"}</>,
  filtersWithCount: (n) => `Filters · ${n}`,
  activeFilters: "Active filters",
  removeFilter: (label) => `Remove filter ${label}`,
  clearAll: "Clear all",
  showResults: (count) => `Show ${count} ${count === 1 ? "result" : "results"}`,
  colourLabel: (label, count) => `${label}, ${count}`,
  colourTitle: (label, count) => `${label} (${count})`,
};

export type FacetOption = { value: string; label: string; count: number };
export type Facet =
  | { id: string; label: string; type: "checks"; options: FacetOption[] }
  | { id: string; label: string; type: "colours"; options: (FacetOption & { swatch: string; light?: boolean })[] }
  | { id: string; label: string; type: "range"; min: number; max: number; step?: number; format?: (n: number) => string };

export type FilterValue = Record<string, string[] | [number, number]>;

export const emptyFilters = (facets: Facet[]): FilterValue =>
  Object.fromEntries(facets.map((f) => [f.id, f.type === "range" ? [f.min, f.max] : []]));

/** The active filters as removable chips, for showing above results. */
export function activeChips(facets: Facet[], v: FilterValue) {
  const chips: { key: string; label: string; clear: (v: FilterValue) => FilterValue }[] = [];
  for (const f of facets) {
    const cur = v[f.id];
    if (f.type === "range") {
      const [lo, hi] = cur as [number, number];
      if (lo !== f.min || hi !== f.max) {
        const fmt = f.format ?? String;
        chips.push({ key: f.id, label: `${fmt(lo)} – ${fmt(hi)}`, clear: (x) => ({ ...x, [f.id]: [f.min, f.max] }) });
      }
    } else {
      for (const val of cur as string[]) {
        const o = f.options.find((x) => x.value === val);
        chips.push({ key: `${f.id}:${val}`, label: o?.label ?? val, clear: (x) => ({ ...x, [f.id]: (x[f.id] as string[]).filter((y) => y !== val) }) });
      }
    }
  }
  return chips;
}

const SwatchOn = createContext(false);

function DrawnTick() {
  const on = useContext(SwatchOn);
  return (
    <svg viewBox="0 0 16 16">
      <motion.path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        initial={false} animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={on ? springSnappy : { duration: 0.1 }} />
    </svg>
  );
}

export interface CategoryFiltersIcons {
  /** Phone button that opens the drawer. */
  filters: ReactNode;
  /** Removes an active-filter chip. */
  remove: ReactNode;
  /** Tick on a selected colour swatch; draws in; stroke should be currentColor. */
  check: ReactNode;
}
export const categoryFiltersIcons: CategoryFiltersIcons = {
  filters: <SlidersHorizontal />,
  remove: <X />,
  check: <DrawnTick />,
};

/**
 * Faceted filters: a sidebar on wide screens, a drawer on phones, and the
 * active filters as chips above the results.
 */
export function CategoryFilters({ facets, value: valueProp, defaultValue, onChange: onChangeProp, resultCount, children, className, labels, icons }: {
  facets: Facet[];
  /** Active filters; leave out to let the component keep them. */
  value?: FilterValue;
  /** Starting filters when uncontrolled. Defaults to none. */
  defaultValue?: FilterValue;
  onChange?: (v: FilterValue) => void;
  resultCount: number;
  /** The results grid. */
  children: ReactNode;
  className?: string;
  /** Override any UI text. Merged over `categoryFiltersLabels`. */
  labels?: Partial<CategoryFiltersLabels>;
  /** Replace any built-in icon. Merged over `categoryFiltersIcons`. */
  icons?: Partial<CategoryFiltersIcons>;
}) {
  const l = { ...categoryFiltersLabels, ...labels };
  const ic = useMemo(() => ({ ...categoryFiltersIcons, ...icons }), [icons]);
  const [value, onChange] = useControllable<FilterValue>(valueProp, defaultValue ?? emptyFilters(facets), onChangeProp);
  const [drawer, setDrawer] = useState(false);
  const chips = activeChips(facets, value);
  const clearAll = () => onChange(emptyFilters(facets));

  return (
    <div className={cn("grid w-full gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10", className)}>
      <aside className="hidden lg:block" aria-label={l.filters}>
        <FilterPanel facets={facets} value={value} onChange={onChange} labels={l} icons={ic} />
      </aside>

      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted" aria-live="polite">
            {l.results(resultCount, <span className="font-medium text-ink tabular">{resultCount}</span>)}
          </p>
          <Button variant="outline" size="sm" leading={ic.filters} onClick={() => setDrawer(true)} className="lg:hidden">
            {chips.length ? l.filtersWithCount(chips.length) : l.filters}
          </Button>
        </div>

        <AnimatePresence initial={false}>
          {chips.length > 0 && (
            <motion.div key="chips" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} className="flex flex-wrap items-center gap-2" aria-label={l.activeFilters}>
              <AnimatePresence initial={false} mode="popLayout">
                {chips.map((c) => (
                  <motion.button
                    key={c.key}
                    type="button"
                    layout="position"
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.12 } }}
                    transition={springFirm}
                    onClick={() => onChange(c.clear(value))}
                    aria-label={l.removeFilter(c.label)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full bg-btn-secondary pl-3 pr-2 text-[13px] font-medium text-btn-secondary-ink transition-colors hover:bg-btn-secondary-hover"
                  >
                    {c.label} <span className="inline-flex opacity-70 [&>svg]:size-3.5" aria-hidden>{ic.remove}</span>
                  </motion.button>
                ))}
                <motion.button key="__clear" layout="position" transition={springFirm} type="button" onClick={clearAll} className="h-8 px-2 text-[13px] font-medium text-accent hover:underline">
                  {l.clearAll}
                </motion.button>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {children}
      </div>

      <Drawer open={drawer} onOpenChange={setDrawer} side="bottom" title={l.filters}
        footer={
          <div className="flex w-full gap-2">
            <Button variant="ghost" onClick={clearAll} disabled={!chips.length}>{l.clearAll}</Button>
            <Button className="flex-1" onClick={() => setDrawer(false)}>{l.showResults(resultCount)}</Button>
          </div>
        }>
        <FilterPanel facets={facets} value={value} onChange={onChange} labels={l} icons={ic} />
      </Drawer>
    </div>
  );
}

/** The facet groups themselves; used in the sidebar and in the phone drawer. */
export function FilterPanel({ facets, value, onChange, labels, icons }: { facets: Facet[]; value: FilterValue; onChange: (v: FilterValue) => void; labels?: Partial<CategoryFiltersLabels>; /** Replace any built-in icon. Merged over `categoryFiltersIcons`. */ icons?: Partial<CategoryFiltersIcons> }) {
  const l = { ...categoryFiltersLabels, ...labels };
  const ic = { ...categoryFiltersIcons, ...icons };
  const toggle = (id: string, val: string, on: boolean) => {
    const cur = value[id] as string[];
    onChange({ ...value, [id]: on ? [...cur, val] : cur.filter((x) => x !== val) });
  };
  return (
    <div className="flex flex-col gap-7">
      {facets.map((f) => (
        <fieldset key={f.id} className="flex flex-col gap-3">
          <legend className="mb-3 text-sm font-semibold text-ink">{f.label}</legend>
          {f.type === "checks" && f.options.map((o) => (
            <div key={o.value} className="flex items-center justify-between gap-3">
              <Checkbox checked={(value[f.id] as string[]).includes(o.value)} onCheckedChange={(on) => toggle(f.id, o.value, on)} label={o.label} />
              <span className={cn("text-[13px] tabular", o.count ? "text-muted" : "text-faint")}>{o.count}</span>
            </div>
          ))}
          {f.type === "colours" && (
            <div className="flex flex-wrap gap-2.5">
              {f.options.map((o) => {
                const on = (value[f.id] as string[]).includes(o.value);
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    aria-label={l.colourLabel(o.label, o.count)}
                    title={l.colourTitle(o.label, o.count)}
                    onClick={() => toggle(f.id, o.value, !on)}
                    className="relative grid size-9 place-items-center rounded-full outline-offset-4"
                  >
                    <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-0 rounded-full border-2 border-ink" />
                    <span className="grid size-7 place-items-center rounded-full ring-1 ring-ink/10 ring-inset" style={{ background: o.swatch }}>
                      <span aria-hidden className={cn("grid [&>svg]:size-3.5", o.light ? "text-black/80" : "text-white")}>
                        <SwatchOn.Provider value={on}>{ic.check}</SwatchOn.Provider>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {f.type === "range" && (
            <Slider
              label={undefined}
              value={value[f.id] as [number, number]}
              onChange={(v) => onChange({ ...value, [f.id]: [v[0], v[1]] })}
              min={f.min}
              max={f.max}
              step={f.step ?? 1}
              format={f.format}
              className="px-0.5"
            />
          )}
          {f.type === "range" && (
            <p className="flex justify-between text-[13px] text-muted tabular">
              <span>{(f.format ?? String)((value[f.id] as number[])[0])}</span>
              <span>{(f.format ?? String)((value[f.id] as number[])[1])}</span>
            </p>
          )}
        </fieldset>
      ))}
    </div>
  );
}
