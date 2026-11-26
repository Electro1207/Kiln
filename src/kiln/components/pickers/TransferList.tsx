import { forwardRef, useEffect, useId, useMemo, useRef, useState, type HTMLAttributes, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react";
import { cn } from "../../cn";
import { fade } from "../../motion";
import { useControllable } from "../../controllable";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";
import { announce } from "../accessibility/announce";
import { IconButton } from "../buttons/IconButton";
import { TextField } from "../text-input/TextField";

export type TransferItem = { id: string; label: string; description?: string; disabled?: boolean };

/** Text used by TransferList. Pass a partial via `labels` to translate or reword. */
export interface TransferListLabels {
  /** Title of the left list. */
  available: string;
  /** Title of the right list. */
  chosen: string;
  /** aria-label of a list's filter field. */
  filter: (title: string) => string;
  /** "2 of 7 selected" under a list's title. */
  count: (selected: number, total: number) => string;
  /** Shown in a list with nothing in it. */
  empty: string;
  /** Shown when the filter matches nothing. */
  noMatch: string;
  /** aria-labels of the four move buttons. */
  moveSelectedRight: string;
  moveAllRight: string;
  moveSelectedLeft: string;
  moveAllLeft: string;
  /** Spoken after a move: "3 items moved to Crew". */
  moved: (count: number, to: string) => string;
}
export const transferListLabels: TransferListLabels = {
  available: "Available",
  chosen: "Chosen",
  filter: (t) => `Filter ${t.toLowerCase()}`,
  count: (s, t) => (s ? `${s} of ${t} selected` : `${t} ${t === 1 ? "item" : "items"}`),
  empty: "Nothing here",
  noMatch: "No matches",
  moveSelectedRight: "Move selected to the chosen list",
  moveAllRight: "Move all to the chosen list",
  moveSelectedLeft: "Move selected back to the available list",
  moveAllLeft: "Move all back to the available list",
  moved: (n, to) => `${n} ${n === 1 ? "item" : "items"} moved to ${to}`,
};

/** Icons used by TransferList. Pass a partial via `icons` to replace them. */
export interface TransferListIcons {
  moveRight: ReactNode;
  moveAllRight: ReactNode;
  moveLeft: ReactNode;
  moveAllLeft: ReactNode;
  /** In the filter fields. */
  search: ReactNode;
}
export const transferListIcons: TransferListIcons = {
  moveRight: <ChevronRight />,
  moveAllRight: <ChevronsRight />,
  moveLeft: <ChevronLeft />,
  moveAllLeft: <ChevronsLeft />,
  search: <Search />,
};

export type TransferListProps = Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> & {
  /** Everything that can be chosen. */
  items: TransferItem[];
  /** Controlled: the ids in the chosen (right) list, in order. Leave out to let it keep its own. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (ids: string[]) => void;
  /** Titles of the two lists. Defaults to the `labels` text. */
  titles?: [string, string];
  /** Show a filter field above each list. Default true. */
  filterable?: boolean;
  /** Height of each list in px. Default 240. */
  height?: number;
  /** Override any UI text. Merged over `transferListLabels`. */
  labels?: Partial<TransferListLabels>;
  /** Replace any built-in icon. Merged over `transferListIcons`. */
  icons?: Partial<TransferListIcons>;
  /** Turn accessibility features on for this component only. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

type Side = "available" | "chosen";

/** Two lists and the buttons between them: pick several, move them across. Both lists are listboxes. */
export const TransferList = forwardRef<HTMLDivElement, TransferListProps>(function TransferList(
  { items, value, defaultValue = [], onChange, titles, filterable = true, height = 240, labels, icons, accessibilityFeatures, className, style, ...rest },
  ref,
) {
  const l = { ...transferListLabels, ...labels };
  const ic = { ...transferListIcons, ...icons };
  const { rootProps } = useA11yProps(accessibilityFeatures);
  const [chosen, setChosen] = useControllable<string[]>(value, defaultValue, onChange);
  const t: Record<Side, string> = { available: titles?.[0] ?? l.available, chosen: titles?.[1] ?? l.chosen };

  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const chosenSet = useMemo(() => new Set(chosen), [chosen]);
  const lists: Record<Side, TransferItem[]> = useMemo(
    () => ({
      available: items.filter((i) => !chosenSet.has(i.id)),
      chosen: chosen.flatMap((id) => (byId.get(id) ? [byId.get(id)!] : [])),
    }),
    [items, chosen, chosenSet, byId],
  );

  const [filters, setFilters] = useState<Record<Side, string>>({ available: "", chosen: "" });
  const [selected, setSelected] = useState<Record<Side, Set<string>>>({ available: new Set(), chosen: new Set() });
  const [active, setActive] = useState<Record<Side, string | null>>({ available: null, chosen: null });
  const anchors = useRef<Record<Side, string | null>>({ available: null, chosen: null });

  const visible = (side: Side) => {
    const q = filters[side].trim().toLowerCase();
    return q ? lists[side].filter((i) => i.label.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)) : lists[side];
  };
  const picked = (side: Side) => visible(side).filter((i) => selected[side].has(i.id) && !i.disabled).map((i) => i.id);

  const move = (from: Side, ids: string[]) => {
    if (!ids.length) return;
    const set = new Set(ids);
    setChosen(from === "available" ? [...chosen, ...ids] : chosen.filter((id) => !set.has(id)));
    setSelected((s) => ({ ...s, [from]: new Set([...s[from]].filter((id) => !set.has(id))) }));
    announce(l.moved(ids.length, from === "available" ? t.chosen : t.available));
  };
  const moveAll = (from: Side) => move(from, visible(from).filter((i) => !i.disabled).map((i) => i.id));

  const id = useId();
  const ctl = (side: Side) => ({
    side,
    title: t[side],
    rows: visible(side),
    total: lists[side].length,
    selected: selected[side],
    active: active[side],
    filter: filters[side],
    filterable,
    height,
    labels: l,
    icon: ic.search,
    domId: `${id}-${side}`,
    setFilter: (v: string) => setFilters((f) => ({ ...f, [side]: v })),
    setSelected: (s: Set<string>) => setSelected((x) => ({ ...x, [side]: s })),
    setActive: (v: string | null) => setActive((x) => ({ ...x, [side]: v })),
    getAnchor: () => anchors.current[side],
    setAnchor: (v: string | null) => { anchors.current[side] = v; },
    send: (ids: string[]) => move(side, ids),
  });

  const left = ctl("available");
  const right = ctl("chosen");

  return (
    <div
      ref={ref}
      {...rest}
      {...rootProps}
      style={{ ...rootProps.style, ...style }}
      className={cn("grid w-full items-stretch gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]", className)}
    >
      <Panel {...left} />
      <div role="group" className="flex items-center justify-center gap-2 sm:flex-col" aria-label={`${t.available} / ${t.chosen}`}>
        <IconButton variant="outline" size="sm" icon={<span className="grid max-sm:rotate-90">{ic.moveRight}</span>} aria-label={l.moveSelectedRight} disabled={!picked("available").length} onClick={() => move("available", picked("available"))} />
        <IconButton variant="outline" size="sm" icon={<span className="grid max-sm:rotate-90">{ic.moveAllRight}</span>} aria-label={l.moveAllRight} disabled={!visible("available").some((i) => !i.disabled)} onClick={() => moveAll("available")} />
        <IconButton variant="outline" size="sm" icon={<span className="grid max-sm:rotate-90">{ic.moveLeft}</span>} aria-label={l.moveSelectedLeft} disabled={!picked("chosen").length} onClick={() => move("chosen", picked("chosen"))} />
        <IconButton variant="outline" size="sm" icon={<span className="grid max-sm:rotate-90">{ic.moveAllLeft}</span>} aria-label={l.moveAllLeft} disabled={!visible("chosen").some((i) => !i.disabled)} onClick={() => moveAll("chosen")} />
      </div>
      <Panel {...right} />
    </div>
  );
});

type PanelProps = {
  side: Side;
  title: string;
  rows: TransferItem[];
  total: number;
  selected: Set<string>;
  active: string | null;
  filter: string;
  filterable: boolean;
  height: number;
  labels: TransferListLabels;
  icon: ReactNode;
  domId: string;
  setFilter: (v: string) => void;
  setSelected: (s: Set<string>) => void;
  setActive: (id: string | null) => void;
  getAnchor: () => string | null;
  setAnchor: (id: string | null) => void;
  send: (ids: string[]) => void;
};

function Panel({ title, rows, total, selected, active, filter, filterable, height, labels: l, icon, domId, setFilter, setSelected, setActive, getAnchor, setAnchor, send }: PanelProps) {
  const list = useRef<HTMLDivElement>(null);
  const enabled = rows.filter((r) => !r.disabled);
  const indexOf = (id: string | null) => rows.findIndex((r) => r.id === id);
  const current = active && rows.some((r) => r.id === active) ? active : null;

  const range = (a: string | null, b: string) => {
    const i = indexOf(a ?? b), j = indexOf(b);
    return new Set(rows.slice(Math.min(i, j), Math.max(i, j) + 1).filter((r) => !r.disabled).map((r) => r.id));
  };

  const pick = (rowId: string, e: { shiftKey: boolean; ctrlKey: boolean; metaKey: boolean }) => {
    if (e.shiftKey) setSelected(range(getAnchor(), rowId));
    else if (e.ctrlKey || e.metaKey) {
      const next = new Set(selected);
      if (next.has(rowId)) next.delete(rowId); else next.add(rowId);
      setSelected(next);
      setAnchor(rowId);
    } else {
      setSelected(new Set([rowId]));
      setAnchor(rowId);
    }
    setActive(rowId);
  };

  const step = (from: number, dir: 1 | -1) => {
    for (let i = from + dir; i >= 0 && i < rows.length; i += dir) if (!rows[i].disabled) return rows[i].id;
    return null;
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const at = indexOf(current);
    let to: string | null | undefined;
    if (e.key === "ArrowDown") to = step(at, 1) ?? current;
    else if (e.key === "ArrowUp") to = step(at < 0 ? rows.length : at, -1) ?? current;
    else if (e.key === "Home") to = enabled[0]?.id;
    else if (e.key === "End") to = enabled[enabled.length - 1]?.id;
    if (to !== undefined) {
      e.preventDefault();
      if (!to) return;
      setActive(to);
      if (e.ctrlKey || e.metaKey) return;
      if (e.shiftKey) setSelected(range(getAnchor() ?? current, to));
      else { setSelected(new Set([to])); setAnchor(to); }
      return;
    }
    if (e.key === " " && current) {
      e.preventDefault();
      const next = new Set(selected);
      if (next.has(current)) next.delete(current); else next.add(current);
      setSelected(next);
      setAnchor(current);
    } else if ((e.key === "a" || e.key === "A") && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setSelected(new Set(enabled.map((r) => r.id)));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const ids = enabled.filter((r) => selected.has(r.id)).map((r) => r.id);
      send(ids.length ? ids : current ? [current] : []);
    }
  };

  useEffect(() => {
    const box = list.current;
    const el = current ? (document.getElementById(`${domId}-opt-${current}`) as HTMLElement | null) : null;
    if (!box || !el) return;
    if (el.offsetTop < box.scrollTop) box.scrollTop = el.offsetTop - 4;
    else if (el.offsetTop + el.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = el.offsetTop + el.offsetHeight - box.clientHeight + 4;
  }, [current, domId]);

  const count = rows.filter((r) => selected.has(r.id)).length;
  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-card border border-line bg-surface">
      <div className="flex items-baseline justify-between gap-3 px-3 pb-2 pt-3">
        <span id={`${domId}-title`} className="text-sm font-medium text-ink">{title}</span>
        <span className="text-xs text-muted tabular" aria-live="polite">{l.count(count, total)}</span>
      </div>
      {filterable && (
        <div className="px-3 pb-2">
          <TextField size="sm" aria-label={l.filter(title)} placeholder={l.filter(title)} leading={icon} clearable value={filter} onValueChange={setFilter} onClear={() => setFilter("")} autoComplete="off" />
        </div>
      )}
      <div
        ref={list}
        role="listbox"
        aria-multiselectable="true"
        aria-labelledby={`${domId}-title`}
        aria-activedescendant={current ? `${domId}-opt-${current}` : undefined}
        tabIndex={0}
        onKeyDown={onKey}
        onFocus={() => { if (!current && enabled[0]) setActive(enabled[0].id); }}
        style={{ height }}
        className={cn("group/list min-h-0 flex-1 overflow-y-auto border-t border-line p-1 outline-none", rows.length === 0 && "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent")}
      >
        {rows.length === 0 && <p className="grid h-full place-items-center px-4 text-center text-sm text-muted">{filter ? l.noMatch : l.empty}</p>}
        {rows.map((r) => {
          const on = selected.has(r.id);
          return (
            <motion.div
              key={r.id}
              id={`${domId}-opt-${r.id}`}
              role="option"
              aria-selected={on}
              aria-disabled={r.disabled || undefined}
              data-active={r.id === current}
              initial={{ opacity: 0 }}
              animate={{ opacity: r.disabled ? 0.45 : 1 }}
              transition={fade}
              onClick={(e: MouseEvent) => !r.disabled && pick(r.id, e)}
              onDoubleClick={() => !r.disabled && send([r.id])}
              className={cn(
                "relative flex cursor-default select-none flex-col rounded-[6px] px-2.5 py-1.5 text-sm text-ink transition-colors duration-200",
                "group/row",
                !on && !r.disabled && "hover:bg-raised",
              )}
            >
              <motion.span aria-hidden className="pointer-events-none absolute inset-0 bg-accent-soft" style={{ borderRadius: 6 }} initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} />
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[6px] opacity-0 ring-2 ring-inset ring-accent transition-opacity duration-150 group-data-[active=true]/row:group-focus-visible/list:opacity-100" />
              <span className="relative z-[1] truncate">{r.label}</span>
              {r.description && <span className="relative z-[1] truncate text-xs text-muted">{r.description}</span>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
