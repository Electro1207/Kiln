import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ChevronRight, Search } from "lucide-react";
import { cn } from "../../cn";
import { useControllable } from "../../controllable";
import { fade, springSnappy } from "../../motion";

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

const pathKey = (parent: string, key: string | number) =>
  typeof key === "number" ? `${parent}[${key}]` : /^[A-Za-z_$][\w$]*$/.test(key) ? `${parent}.${key}` : `${parent}[${JSON.stringify(key)}]`;

/** Every path whose key or value matches, and every ancestor of one, so search can open them. */
function matches(value: Json, q: string, path = "$", out = new Set<string>()): boolean {
  let hit = false;
  if (value && typeof value === "object") {
    for (const [k, v] of Array.isArray(value) ? value.map((v, i) => [i, v] as const) : Object.entries(value)) {
      const p = pathKey(path, k);
      const self = String(k).toLowerCase().includes(q) || (v !== null && typeof v !== "object" && String(v).toLowerCase().includes(q));
      const child = matches(v as Json, q, p, out);
      if (self || child) { out.add(p); hit = true; }
    }
  }
  if (hit) out.add(path);
  return hit;
}

function Mark({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-[2px] bg-warning-soft text-ink">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

/** Text used by JSONViewer. Pass a partial via `labels` to translate or reword. */
export interface JSONViewerIcons {
  /** Chevron on a branch; turns a quarter when open. */
  expand: ReactNode;
  /** Search field. */
  search: ReactNode;
}
export const jsonViewerIcons: JSONViewerIcons = { expand: <ChevronRight />, search: <Search /> };

export interface JSONViewerLabels {
  /** Placeholder and aria-label of the search box. */
  search: string;
  /** aria-label of a collapsed branch toggle, given its path. */
  expand: (path: string) => string;
  /** aria-label of an expanded branch toggle, given its path. */
  collapse: (path: string) => string;
  /** Summary of a collapsed array, given the item count. */
  items: (count: number) => string;
  /** Summary of a collapsed object, given the key count. */
  keys: (count: number) => string;
  /** Empty state when search finds nothing, given the query. */
  noMatches: (query: string) => string;
  /** aria-label of the tree when there is no title. */
  tree: string;
  /** Copy-path button text. */
  path: string;
  /** Copy-value button text. */
  value: string;
  /** Text shown after copying. */
  copied: string;
  /** aria-label of a copy button, given the button text. */
  copy: (what: string) => string;
  /** aria-label of a copy button after copying, given the button text. */
  copiedWhat: (what: string) => string;
}
export const jsonViewerLabels: JSONViewerLabels = {
  search: "Search keys and values",
  expand: (p) => `Expand ${p}`,
  collapse: (p) => `Collapse ${p}`,
  items: (n) => `${n} ${n === 1 ? "item" : "items"}`,
  keys: (n) => `${n} ${n === 1 ? "key" : "keys"}`,
  noMatches: (q) => `Nothing matches “${q}”.`,
  tree: "JSON",
  path: "Path",
  value: "Value",
  copied: "Copied",
  copy: (what) => `Copy ${what.toLowerCase()}`,
  copiedWhat: (what) => `${what} copied`,
};

function Leaf({ value, q }: { value: Json; q: string }) {
  if (value === null) return <span className="text-faint">null</span>;
  if (typeof value === "string") return <span className="text-positive">"<Mark text={value} q={q} />"</span>;
  if (typeof value === "number") return <span className="tabular text-warning"><Mark text={String(value)} q={q} /></span>;
  return <span className="text-info">{String(value)}</span>;
}

/**
 * A JSON document as a tree. Branches fold and unfold; every row can copy its
 * path or its value; search marks matches and opens the branches that hold them.
 */
export function JSONViewer({
  data: input, title, defaultDepth = 1, expanded, defaultExpanded, onExpandedChange, query: queryProp, defaultQuery = "", onQueryChange, className, labels, icons,
}: {
  data: unknown;
  title?: string;
  /** How many levels start open when `defaultExpanded` is not given. */
  defaultDepth?: number;
  /** Controlled set of open branch paths, e.g. `$`, `$.crew`, `$.crew[0]`. Leave out to let the viewer keep its own. */
  expanded?: Set<string>;
  /** Where the uncontrolled open branches start. Default the first `defaultDepth` levels. */
  defaultExpanded?: Set<string>;
  /** Called with the new open branches, controlled or not. */
  onExpandedChange?: (expanded: Set<string>) => void;
  /** Controlled search text. Leave out to let the viewer keep its own. */
  query?: string;
  /** Where the uncontrolled search starts. Default empty. */
  defaultQuery?: string;
  /** Called with the new search text, controlled or not. */
  onQueryChange?: (query: string) => void;
  className?: string;
  /** Override any UI text. Merged over `jsonViewerLabels`. */
  labels?: Partial<JSONViewerLabels>;
  /** Replace any built-in icon. Merged over `jsonViewerIcons`. Keep it stable between renders. */
  icons?: Partial<JSONViewerIcons>;
}) {
  const l = useMemo(() => ({ ...jsonViewerLabels, ...labels }), [labels]);
  const ic = useMemo(() => ({ ...jsonViewerIcons, ...icons }), [icons]);
  const data = input as Json;
  const [startOpen] = useState<Set<string>>(() => {
    if (defaultExpanded) return defaultExpanded;
    const s = new Set<string>();
    const walk = (v: Json, p: string, d: number) => {
      if (v && typeof v === "object" && d < defaultDepth) {
        s.add(p);
        for (const [k, c] of Array.isArray(v) ? v.map((x, i) => [i, x] as const) : Object.entries(v)) walk(c as Json, pathKey(p, k), d + 1);
      }
    };
    walk(data, "$", 0);
    return s;
  });
  const [openSet, setOpenSet] = useControllable<Set<string>>(expanded, startOpen, onExpandedChange);
  const [query, setQuery] = useControllable(queryProp, defaultQuery, onQueryChange);
  /** The row showing its copy buttons: only one at a time, so a big tree mounts no buttons up front. */
  const [tools, setTools] = useState<{ path: string; top: number; height: number } | null>(null);
  const q = query.trim().toLowerCase();
  const hits = useMemo(() => {
    if (!q) return null;
    const s = new Set<string>();
    matches(data, q, "$", s);
    return s;
  }, [data, q]);

  const toggle = useCallback(
    (p: string) =>
      setOpenSet((s) => {
        const n = new Set(s);
        if (n.has(p)) n.delete(p);
        else n.add(p);
        return n;
      }),
    [setOpenSet],
  );

  // The rows depend only on the data, what is open and the search; hover never rebuilds them.
  const { rows, values } = useMemo(() => {
    const rows: ReactNode[] = [];
    const values = new Map<string, string>();
    const walk = (key: string | number | null, v: Json, p: string, depth: number, last: boolean) => {
      const branch = v !== null && typeof v === "object";
      const open = branch && (hits ? hits.has(p) : openSet.has(p));
      const entries = branch ? (Array.isArray(v) ? v.map((x, i) => [i, x] as const) : Object.entries(v)) : [];
      const brackets = Array.isArray(v) ? ["[", "]"] : ["{", "}"];
      const dim = hits && !hits.has(p) && p !== "$";
      values.set(p, branch ? JSON.stringify(v, null, 2) : String(v));
      rows.push(
        <div
          key={p}
          role="treeitem"
          tabIndex={0}
          data-path={p}
          aria-level={depth + 1}
          aria-expanded={branch ? open : undefined}
          className={cn("flex min-h-7 items-center gap-1 rounded-[6px] pr-[68px] outline-offset-[-2px] transition-[background-color,opacity] duration-200 hover:bg-raised", dim && "opacity-40")}
          style={{ paddingLeft: depth * 16 + 4 }}
        >
          {branch ? (
            <button type="button" onClick={() => toggle(p)} aria-label={open ? l.collapse(p) : l.expand(p)} className="grid size-5 shrink-0 place-items-center rounded-[4px] text-muted hover:text-ink">
              <motion.span className="grid [&>svg]:size-3.5" initial={false} animate={{ rotate: open ? 90 : 0 }} transition={springSnappy}>
                {ic.expand}
              </motion.span>
            </button>
          ) : (
            <span className="size-5 shrink-0" />
          )}
          <span className="min-w-0 flex-1 truncate">
            {key !== null && (
              <span className="text-ink">
                {typeof key === "number" ? <span className="text-faint">{key}</span> : <>"<Mark text={key} q={q} />"</>}
                <span className="text-faint">: </span>
              </span>
            )}
            {branch ? (
              <span className="text-muted">
                {brackets[0]}
                {!open && <span className="text-faint"> {Array.isArray(v) ? l.items(entries.length) : l.keys(entries.length)} </span>}
                {!open && brackets[1]}
              </span>
            ) : (
              <Leaf value={v} q={q} />
            )}
            {!branch && !last && <span className="text-faint">,</span>}
          </span>
        </div>,
      );
      if (open) {
        entries.forEach(([k, c], i) => walk(k as string | number, c as Json, pathKey(p, k), depth + 1, i === entries.length - 1));
        rows.push(
          <div key={p + "/end"} className="min-h-6 text-muted" style={{ paddingLeft: depth * 16 + 28 }}>
            {brackets[1]}
            {!last && <span className="text-faint">,</span>}
          </div>,
        );
      }
    };
    walk(null, data, "$", 0, true);
    return { rows, values };
  }, [data, openSet, hits, q, l, ic, toggle]);

  const pickRow = (target: EventTarget | null) => {
    const row = (target as HTMLElement | null)?.closest?.("[data-path]") as HTMLElement | null;
    if (!row) return;
    const p = row.dataset.path!;
    setTools((t) => (t?.path === p ? t : { path: p, top: row.offsetTop, height: row.offsetHeight }));
  };

  return (
    <div className={cn("flex w-full flex-col overflow-hidden rounded-card border border-line bg-surface", className)}>
      <div className="flex items-center gap-3 border-b border-line px-3 py-2">
        {title && <span className="truncate text-sm font-medium text-ink">{title}</span>}
        <label className="ml-auto flex h-8 w-full max-w-56 items-center gap-2 rounded-control border border-line-strong bg-surface px-2.5 text-sm transition-[border-color,box-shadow] duration-200 focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/20">
          <span className="inline-flex shrink-0 text-faint [&>svg]:size-3.5" aria-hidden>{ic.search}</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={l.search} aria-label={l.search} className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-faint" />
        </label>
      </div>
      <motion.div
        role="tree"
        aria-label={title ?? l.tree}
        onPointerOver={(e) => pickRow(e.target)}
        onFocus={(e) => pickRow(e.target)}
        onPointerLeave={() => setTools(null)}
        onKeyDown={(e) => {
          const row = (e.target as HTMLElement).closest?.("[data-path]");
          if (e.key === "Tab" && !e.shiftKey && row && e.target === row) {
            const btn = (e.currentTarget as HTMLElement).querySelector<HTMLButtonElement>("[data-tools] button");
            if (btn) { e.preventDefault(); btn.focus(); }
          }
        }}
        className="relative max-h-[420px] overflow-auto p-2 font-mono text-[12.5px] leading-6"
        initial={false}
        animate={{ opacity: 1 }}
        transition={fade}
      >
        {rows}
        {tools && (
          <div
            data-tools
            className="absolute right-3 flex items-center"
            style={{ top: 0, height: tools.height, transform: `translateY(${tools.top}px)` }}
          >
            <RowCopy what={l.path} text={tools.path} l={l} />
            <RowCopy what={l.value} text={values.get(tools.path) ?? ""} l={l} />
          </div>
        )}
        {hits && hits.size === 0 && <p className="px-2 py-6 text-center font-sans text-sm text-muted">{l.noMatches(query)}</p>}
      </motion.div>
    </div>
  );
}

/** A light copy control for the hover toolbar: plain DOM, CSS-only feedback, so hovering rows costs nothing. */
function RowCopy({ what, text, l }: { what: string; text: string; l: JSONViewerLabels }) {
  const [done, setDone] = useState(false);
  const t = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(t.current), []);
  const [shownFor, setShownFor] = useState(text);
  if (text !== shownFor) {
    setShownFor(text);
    setDone(false);
  }
  return (
    <button
      type="button"
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); } catch { /* still show feedback */ }
        setDone(true);
        window.clearTimeout(t.current);
        t.current = window.setTimeout(() => setDone(false), 1400);
      }}
      aria-label={done ? l.copiedWhat(what) : l.copy(what)}
      className="grid h-6 place-items-center rounded-[5px] bg-surface px-1.5 font-sans text-[11px] font-medium text-muted transition-colors duration-150 hover:bg-active hover:text-ink [&>*]:[grid-area:1/1]"
    >
      <span className={cn("transition-opacity duration-150", done ? "opacity-0" : "opacity-100")}>{what}</span>
      <span aria-hidden className={cn("text-positive transition-opacity duration-150", done ? "opacity-100" : "opacity-0")}>{l.copied}</span>
    </button>
  );
}
