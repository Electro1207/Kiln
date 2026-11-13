import { memo, useCallback, useDeferredValue, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../cn";
import { useControllable } from "../../controllable";
import { easeOut, fade, springSnappy } from "../../motion";
import { ScrollArea } from "../primitives/ScrollArea";
import { SearchField } from "../text-input/SearchField";

export type DocsNavItem = { id: string; label: string; href?: string; /** Extra words the filter matches. */ keywords?: string };
export type DocsNavGroup = {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  /** Shown on the right. Defaults to the number of items. */
  count?: number;
  /** Without items the group is a plain link row. */
  items?: DocsNavItem[];
};
export type DocsNavSection = { id: string; /** A small heading over the section's groups. */ label?: string; groups: DocsNavGroup[] };

/** Text used by DocsNav. Pass a partial via `labels` to translate or reword. */
export interface DocsNavLabels {
  /** Default filter placeholder and aria-label. */
  filter: string;
  /** Default text when the filter matches nothing. */
  empty: string;
  /** Default aria-label of the nav landmark. */
  sidebar: string;
  /** aria-label of a group's chevron when the group is open. */
  collapse: (group: string) => string;
  /** aria-label of a group's chevron when the group is closed. */
  expand: (group: string) => string;
}
export const docsNavLabels: DocsNavLabels = {
  filter: "Filter",
  empty: "Nothing called that.",
  sidebar: "Sidebar",
  collapse: (g) => `Collapse ${g}`,
  expand: (g) => `Expand ${g}`,
};

export type DocsNavProps = {
  sections: DocsNavSection[];
  /** The active item or group id. Its group opens, and its row is kept in view. Leave out to let the nav track the last row picked. */
  value?: string;
  /** Where the uncontrolled active id starts. Default none. */
  defaultValue?: string;
  /** Called on a plain click. Modified clicks (new tab) follow the href as usual. */
  onSelect?: (id: string, groupId: string) => void;
  /** Shows a filter field. The shortcut key focuses it from anywhere on the page. */
  searchable?: boolean;
  shortcut?: string;
  placeholder?: string;
  emptyText?: ReactNode;
  header?: ReactNode;
  /** Pinned under the list: a theme switch, settings, the account. */
  footer?: ReactNode;
  /** Row height in px. 32 by default; 36 or 40 for touch-first layouts. */
  rowHeight?: number;
  /**
   * What a click on a group header with items does. "link" (default) follows the group's href and
   * the chevron toggles; "toggle" makes the whole header a button that only opens or closes the
   * group, never navigates. Either way groups never close on their own.
   */
  groupClick?: "link" | "toggle";
  /** Remembers the open groups in localStorage under this key. */
  storageKey?: string;
  /** Override any UI text. Merged over `docsNavLabels`. */
  labels?: Partial<DocsNavLabels>;
  /** Replace any built-in icon. Merged over `docsNavIcons`. Pass a stable object, as the rows are memoised. */
  icons?: Partial<DocsNavIcons>;
  className?: string;
  "aria-label"?: string;
};

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Highlights the first match of `q` inside `text`. */
function Hit({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const i = norm(text).indexOf(q);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-transparent font-semibold text-ink">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

/**
 * A documentation-style sidebar: labelled sections of collapsible groups, a filter field with a
 * keyboard shortcut, counts, and a pinned footer. The active row's fill fades in place; opening a
 * group shows its rows at once and fades them in, so nothing slides or folds under the pointer.
 */
/** Icons used by DocsNav. Pass a partial via `icons` to swap any of them. */
export interface DocsNavIcons {
  /** Chevron on a group; it turns when the group is open. */
  expand: ReactNode;
}
export const docsNavIcons: DocsNavIcons = { expand: <ChevronRight /> };

export function DocsNav({
  sections, value: valueProp, defaultValue, onSelect, searchable = true, shortcut = "/", placeholder, emptyText,
  header, footer, rowHeight = 32, groupClick = "link", storageKey, labels, icons, className, "aria-label": ariaLabelProp,
}: DocsNavProps) {
  const l = useMemo(() => ({ ...docsNavLabels, ...labels }), [labels]);
  const ic = useMemo(() => ({ ...docsNavIcons, ...icons }), [icons]);
  const ariaLabel = ariaLabelProp ?? l.sidebar;
  const [value, setValue] = useControllable<string | undefined>(valueProp, defaultValue);
  const groups = useMemo(() => sections.flatMap((s) => s.groups), [sections]);
  const activeGroup = useMemo(
    () => groups.find((g) => g.id === value || g.items?.some((i) => i.id === value))?.id,
    [groups, value],
  );
  const [open, setOpen] = useState<Set<string>>(() => {
    const n = new Set<string>();
    try {
      const raw = storageKey ? localStorage.getItem(storageKey) : null;
      if (raw) for (const id of JSON.parse(raw) as string[]) n.add(id);
    } catch { /* storage unavailable */ }
    if (activeGroup) n.add(activeGroup);
    return n;
  });
  /* Landing in a group (a link, the palette, the overview) opens it. Nothing ever closes a group
     except its own header, so what you opened stays open. */
  const [seenGroup, setSeenGroup] = useState(activeGroup);
  if (activeGroup !== seenGroup) {
    setSeenGroup(activeGroup);
    if (activeGroup) setOpen((o) => (o.has(activeGroup) ? o : new Set(o).add(activeGroup)));
  }
  useEffect(() => {
    if (!storageKey) return;
    try { localStorage.setItem(storageKey, JSON.stringify([...open])); } catch { /* storage unavailable */ }
  }, [open, storageKey]);

  const [query, setQuery] = useState("");
  /* The field stays in step with the keys; the (large) filtered list may trail by a frame. */
  const q = norm(useDeferredValue(query).trim());
  const filtered = useMemo(() => {
    if (!q) return null;
    return sections
      .map((s) => ({
        ...s,
        groups: s.groups.flatMap((g) => {
          const own = norm(g.label).includes(q);
          const items = g.items?.filter((i) => own || norm(i.label).includes(q) || (i.keywords && norm(i.keywords).includes(q)));
          return own || items?.length ? [{ ...g, items }] : [];
        }),
      }))
      .filter((s) => s.groups.length);
  }, [sections, q]);
  const shown = filtered ?? sections;

  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!searchable || !shortcut) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== shortcut || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (!input.current || input.current.offsetParent === null) return;
      e.preventDefault();
      input.current.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchable, shortcut]);

  /* Keep the active row in view, without animating: the list must never drift on its own. */
  const viewport = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const vp = viewport.current;
    if (!vp || !value || q) return;
    const row = vp.querySelector<HTMLElement>(`[data-nav-id="${CSS.escape(value)}"]`);
    if (!row) return;
    const r = row.getBoundingClientRect();
    const v = vp.getBoundingClientRect();
    const pad = 32;
    if (r.top < v.top + pad) vp.scrollTop -= v.top + pad - r.top;
    else if (r.bottom > v.bottom - pad) vp.scrollTop += r.bottom - (v.bottom - pad);
  }, [value, q, open]);

  const onSelectRef = useRef(onSelect);
  useLayoutEffect(() => {
    onSelectRef.current = onSelect;
  });
  const select = useCallback((e: MouseEvent, id: string, groupId: string) => {
    const f = onSelectRef.current;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    setValue(id);
    if (!f) return;
    e.preventDefault();
    f(id, groupId);
  }, [setValue]);

  const toggle = useCallback((id: string) =>
    setOpen((o) => {
      const n = new Set(o);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    }), []);
  const reveal = useCallback((id: string) => setOpen((o) => (o.has(id) ? o : new Set(o).add(id))), []);

  const first = filtered?.[0]?.groups[0];
  const firstHit = first ? (first.items?.[0] ? { id: first.items[0].id, g: first.id } : { id: first.id, g: first.id }) : undefined;

  return (
    <div className={cn("flex h-full min-h-0 w-full flex-col", className)}>
      {header}
      {searchable && (
        <div className="shrink-0 px-3 pb-2 pt-1">
          <SearchField
            ref={input}
            value={query}
            onValueChange={setQuery}
            shortcut={shortcut}
            placeholder={placeholder ?? l.filter}
            aria-label={placeholder ?? l.filter}
            className="h-9 bg-surface"
            onKeyDown={(e) => {
              if (e.key === "Enter" && firstHit) {
                const a = viewport.current?.querySelector<HTMLAnchorElement>(`[data-nav-id="${CSS.escape(firstHit.id)}"]`);
                setValue(firstHit.id);
                if (onSelect) onSelect(firstHit.id, firstHit.g);
                else a?.click();
                setQuery("");
                input.current?.blur();
              } else if (e.key === "ArrowDown") {
                e.preventDefault();
                viewport.current?.querySelector<HTMLElement>("a[data-nav-id], button[data-nav-toggle]")?.focus();
              } else if (e.key === "Escape" && !query) input.current?.blur();
            }}
          />
        </div>
      )}
      <ScrollArea ref={viewport} className="min-h-0 flex-1" viewportClassName="px-3 pb-6 pt-1">
        <nav aria-label={ariaLabel} className="text-[14px]">
          {shown.length === 0 && <p className="px-3 py-6 text-[13px] text-muted">{emptyText ?? l.empty}</p>}
          {shown.map((s, si) => (
            <div key={s.id} className={cn(si > 0 && "mt-5")}>
              {s.label && <p className="flex h-7 items-center px-3 text-[12px] font-medium text-muted">{s.label}</p>}
              <ul className="space-y-px">
                {s.groups.map((g) => (
                  <GroupBlock
                    key={g.id}
                    g={g}
                    on={g.id === value}
                    holds={g.id === activeGroup}
                    activeItem={g.id === activeGroup ? value : undefined}
                    isOpen={!!g.items && (q ? true : open.has(g.id))}
                    toggleMode={groupClick === "toggle"}
                    q={q}
                    rowHeight={rowHeight}
                    onToggle={toggle}
                    onReveal={reveal}
                    onPick={select}
                    l={l}
                    ic={ic}
                  />
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>
      {footer && <div className="mx-3 shrink-0 border-t border-line pb-3 pt-3">{footer}</div>}
    </div>
  );
}

type GroupBlockProps = {
  g: DocsNavGroup;
  on: boolean;
  holds: boolean;
  /** The active item id, only for the group that holds it, so other groups never re-render on a spy change. */
  activeItem?: string;
  isOpen: boolean;
  toggleMode: boolean;
  q: string;
  rowHeight: number;
  onToggle: (id: string) => void;
  onReveal: (id: string) => void;
  onPick: (e: MouseEvent, id: string, groupId: string) => void;
  l: DocsNavLabels;
  ic: DocsNavIcons;
};

const GroupBlock = memo(function GroupBlock({ g, on, holds, activeItem, isOpen, toggleMode, q, rowHeight, onToggle, onReveal, onPick, l, ic }: GroupBlockProps) {
  const leaf = !g.items;
  const uid = useId();
  const count = q ? g.items?.length : (g.count ?? g.items?.length);
  return (
    <li>
      {/* The row is one stable hover target; the chevron and the link share it with no gap. */}
      <div className="group/row relative flex items-center rounded-control transition-colors duration-200 hover:bg-raised" style={{ height: rowHeight }}>
        <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-0 bg-active" style={{ borderRadius: 8 }} />
        {!leaf && (
          <button
            type="button"
            data-nav-toggle
            data-nav-id={toggleMode ? g.id : undefined}
            aria-expanded={isOpen}
            aria-controls={`${uid}-${g.id}`}
            aria-label={toggleMode ? undefined : (isOpen ? l.collapse(g.label) : l.expand(g.label))}
            onClick={() => { if (!q) onToggle(g.id); }}
            className={cn(
              "relative z-[1] flex h-full shrink-0 items-center rounded-control text-faint outline-offset-[-2px] transition-colors hover:text-ink",
              toggleMode ? "min-w-0 flex-1 gap-0 pr-3 text-left" : "w-7 justify-center rounded-r-none",
              toggleMode && (on || holds ? "font-medium text-ink" : "text-muted group-hover/row:text-ink"),
            )}
          >
            <motion.span initial={false} animate={{ rotate: isOpen ? 90 : 0 }} transition={springSnappy} className={cn("inline-flex items-center justify-center text-faint [&>svg]:size-3.5", toggleMode && "w-7 shrink-0")}>
              {ic.expand}
            </motion.span>
            {toggleMode && (
              <>
                {g.icon && <span className="mr-2.5 inline-flex shrink-0 [&>svg]:size-4">{g.icon}</span>}
                <span className="min-w-0 flex-1 truncate pl-0.5"><Hit text={g.label} q={q} /></span>
                {count != null && <span className="text-xs font-normal text-faint tabular">{count}</span>}
              </>
            )}
          </button>
        )}
        {(leaf || !toggleMode) && (
          <a
            href={g.href ?? `#${g.id}`}
            data-nav-id={g.id}
            aria-current={on ? "page" : undefined}
            onClick={(e) => {
              if (!leaf) onReveal(g.id);
              onPick(e, g.id, g.id);
            }}
            className={cn(
              "relative z-[1] flex h-full min-w-0 flex-1 items-center gap-2.5 pr-3 transition-colors duration-200",
              leaf ? "pl-3" : "pl-0.5",
              on || holds ? "font-medium text-ink" : "text-muted group-hover/row:text-ink",
            )}
          >
            {g.icon && <span className="inline-flex shrink-0 [&>svg]:size-4">{g.icon}</span>}
            <span className="min-w-0 flex-1 truncate"><Hit text={g.label} q={q} /></span>
            {count != null && <span className="text-xs font-normal text-faint tabular">{count}</span>}
          </a>
        )}
      </div>
      {g.items && g.items.length > 0 && (
        <Collapse id={`${uid}-${g.id}`} open={isOpen} instant={!!q}>
          <ul className="relative ml-[13px] border-l border-line py-0.5 pl-2">
            {g.items.map((it, i) => (
              <ItemRow key={it.id} it={it} groupId={g.id} here={it.id === activeItem} index={q ? -1 : i} q={q} rowHeight={rowHeight} onPick={onPick} />
            ))}
          </ul>
        </Collapse>
      )}
    </li>
  );
});

/**
 * Folds a group's rows with the grid-rows trick (0fr to 1fr) plus a fade. The rows mount on open
 * and unmount once the fold has finished, so closed groups cost nothing.
 */
function Collapse({ id, open, instant, children }: { id: string; open: boolean; instant: boolean; children: ReactNode }) {
  const [mounted, setMounted] = useState(open);
  const [expanded, setExpanded] = useState(open);
  if (open && !mounted) setMounted(true);
  if (open && instant && !expanded) setExpanded(true);
  if (!open && expanded) setExpanded(false);
  if (!open && instant && mounted) setMounted(false);
  useEffect(() => {
    if (!open || instant) return;
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setExpanded(true)));
    return () => cancelAnimationFrame(r);
  }, [open, instant]);
  if (!mounted) return null;
  return (
    <div
      id={id}
      inert={!open}
      onTransitionEnd={(e) => { if (e.target === e.currentTarget && !open) setMounted(false); }}
      className={cn(
        "grid motion-reduce:transition-none",
        instant ? "transition-none" : "transition-[grid-template-rows,opacity] duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        expanded && open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

type ItemRowProps = { it: DocsNavItem; groupId: string; here: boolean; index: number; q: string; rowHeight: number; onPick: GroupBlockProps["onPick"] };

const ItemRow = memo(function ItemRow({ it, groupId, here, index, q, rowHeight, onPick }: ItemRowProps) {
  return (
    <motion.li
      className="relative"
      initial={index < 0 ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.22, ease: easeOut, delay: Math.min(Math.max(index, 0), 10) * 0.016 }}
    >
      <motion.span aria-hidden initial={false} animate={{ opacity: here ? 1 : 0 }} transition={fade} className="pointer-events-none absolute -left-[9px] top-1.5 bottom-1.5 w-px bg-ink" />
      <a
        href={it.href ?? `#${it.id}`}
        data-nav-id={it.id}
        aria-current={here ? "page" : undefined}
        onClick={(e) => onPick(e, it.id, groupId)}
        className={cn(
          "relative flex items-center rounded-control px-2.5 text-[13px] transition-colors duration-200",
          here ? "text-ink" : "text-muted hover:bg-raised hover:text-ink",
        )}
        style={{ height: rowHeight }}
      >
        <motion.span aria-hidden initial={false} animate={{ opacity: here ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-0 bg-active" style={{ borderRadius: 8 }} />
        <span className="relative z-[1] truncate"><Hit text={it.label} q={q} /></span>
      </a>
    </motion.li>
  );
});
