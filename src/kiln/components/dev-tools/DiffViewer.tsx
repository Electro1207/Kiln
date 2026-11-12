import { Fragment, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "../../cn";
import { fade } from "../../motion";
import { SegmentedControl } from "../buttons/SegmentedControl";

type Op = { type: "same" | "del" | "add"; text: string; a?: number; b?: number };
type Row =
  | { kind: "line"; left?: Op; right?: Op; pairWords?: { left: Seg[]; right: Seg[] } }
  | { kind: "fold"; id: number; count: number; rows: Row[] };
type Seg = { text: string; changed: boolean };

/** Longest-common-subsequence diff of two token arrays. Fine for files of a few hundred lines. */
function lcs<T>(a: T[], b: T[]): Array<{ type: "same" | "del" | "add"; v: T }> {
  const n = a.length, m = b.length;
  const dp: Uint16Array[] = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out: Array<{ type: "same" | "del" | "add"; v: T }> = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) { out.push({ type: "same", v: a[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) out.push({ type: "del", v: a[i++] });
    else out.push({ type: "add", v: b[j++] });
  }
  while (i < n) out.push({ type: "del", v: a[i++] });
  while (j < m) out.push({ type: "add", v: b[j++] });
  return out;
}

function wordDiff(a: string, b: string) {
  const ta = a.split(/(\s+|[^\w\s])/).filter(Boolean), tb = b.split(/(\s+|[^\w\s])/).filter(Boolean);
  const d = lcs(ta, tb);
  const left: Seg[] = [], right: Seg[] = [];
  for (const x of d) {
    if (x.type !== "add") left.push({ text: x.v, changed: x.type === "del" });
    if (x.type !== "del") right.push({ text: x.v, changed: x.type === "add" });
  }
  return { left, right };
}

function build(oldText: string, newText: string, context: number) {
  const ops: Op[] = [];
  let a = 1, b = 1;
  for (const x of lcs(oldText.split("\n"), newText.split("\n"))) {
    if (x.type === "same") ops.push({ type: "same", text: x.v, a: a++, b: b++ });
    else if (x.type === "del") ops.push({ type: "del", text: x.v, a: a++ });
    else ops.push({ type: "add", text: x.v, b: b++ });
  }
  const rows: Row[] = [];
  for (let i = 0; i < ops.length; ) {
    if (ops[i].type === "same") { rows.push({ kind: "line", left: ops[i], right: ops[i] }); i++; continue; }
    const dels: Op[] = [], adds: Op[] = [];
    while (i < ops.length && ops[i].type === "del") dels.push(ops[i++]);
    while (i < ops.length && ops[i].type === "add") adds.push(ops[i++]);
    for (let k = 0; k < Math.max(dels.length, adds.length); k++) {
      const l = dels[k], r = adds[k];
      rows.push({ kind: "line", left: l, right: r, pairWords: l && r ? wordDiff(l.text, r.text) : undefined });
    }
  }
  const out: Row[] = [];
  let run: Row[] = [];
  let fid = 0;
  const flush = (atStart: boolean, atEnd: boolean) => {
    const keepHead = atStart ? 0 : context, keepTail = atEnd ? 0 : context;
    if (run.length >= keepHead + keepTail + 4) {
      out.push(...run.slice(0, keepHead));
      const hidden = run.slice(keepHead, run.length - keepTail);
      out.push({ kind: "fold", id: fid++, count: hidden.length, rows: hidden });
      out.push(...run.slice(run.length - keepTail));
    } else out.push(...run);
    run = [];
  };
  rows.forEach((r) => {
    const same = r.kind === "line" && r.left?.type === "same";
    if (same) run.push(r);
    else { flush(out.length === 0, false); out.push(r); }
  });
  flush(out.length === 0, true);
  const added = ops.filter((o) => o.type === "add").length, removed = ops.filter((o) => o.type === "del").length;
  return { rows: out, added, removed };
}

const words = (segs: Seg[] | undefined, text: string, tone: "add" | "del"): ReactNode =>
  segs
    ? segs.map((s, i) =>
        s.changed && s.text.trim() ? (
          <mark key={i} className={cn("rounded-[3px] text-ink", tone === "add" ? "bg-positive/25" : "bg-negative/25")}>
            {s.text}
          </mark>
        ) : (
          <Fragment key={i}>{s.text}</Fragment>
        ),
      )
    : text;

/** Text used by DiffViewer. Pass a partial via `labels` to translate or reword. */
export interface DiffViewerLabels {
  /** aria-label of the view switch. */
  diffView: string;
  split: string;
  unified: string;
  /** Fold button, given the number of hidden lines. */
  showUnchanged: (count: number) => string;
}
export const diffViewerLabels: DiffViewerLabels = {
  diffView: "Diff view",
  split: "Split",
  unified: "Unified",
  showUnchanged: (n) => `Show ${n} unchanged ${n === 1 ? "line" : "lines"}`,
};

export type DiffViewerProps = {
  oldText: string;
  newText: string;
  filename: string;
  /** Unchanged lines kept around each change before the rest folds away. */
  context?: number;
  defaultView?: "split" | "unified";
  className?: string;
  /** Override any UI text. Merged over `diffViewerLabels`. */
  labels?: Partial<DiffViewerLabels>;
};

/**
 * Two versions of a file, side by side or unified. Changed lines are paired and
 * the words that changed are marked; long unchanged stretches fold away and open
 * in place.
 */
export function DiffViewer({ oldText, newText, filename, context = 3, defaultView = "split", className, labels }: DiffViewerProps) {
  const l = { ...diffViewerLabels, ...labels };
  // Until someone picks a view, narrow containers (phones) get unified: split needs two readable columns.
  const [chosen, setChosen] = useState<"split" | "unified" | null>(null);
  const [narrow, setNarrow] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < 640));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const view = chosen ?? (narrow ? "unified" : defaultView);
  const setView = setChosen;
  const [open, setOpen] = useState<Set<number>>(new Set());
  const { rows, added, removed } = useMemo(() => build(oldText, newText, context), [oldText, newText, context]);

  const expand = (rs: Row[]): Row[] => rs.flatMap((r) => (r.kind === "fold" && open.has(r.id) ? r.rows : [r]));
  const shown = expand(rows);

  const num = "tabular w-10 shrink-0 select-none pr-2 text-right text-faint";
  const code = "min-w-0 flex-1 whitespace-pre-wrap break-all pl-2 pr-3";

  return (
    <div ref={root} className={cn("w-full overflow-hidden rounded-card border border-line bg-surface", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3 text-sm">
          <span className="truncate font-medium text-ink">{filename}</span>
          <span className="tabular shrink-0 text-xs">
            <span className="text-positive">+{added}</span> <span className="text-negative">−{removed}</span>
          </span>
        </div>
        <SegmentedControl<"split" | "unified">
          size="sm"
          label={l.diffView}
          value={view}
          onChange={setView}
          options={[{ value: "split", label: l.split }, { value: "unified", label: l.unified }]}
        />
      </div>
      <motion.div key={view} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={fade} className="overflow-x-auto font-mono text-[12.5px] leading-[22px]">
        <div className={cn(view === "split" ? "min-w-[640px]" : "min-w-[420px]")}>
          {shown.map((r, i) => {
            if (r.kind === "fold") {
              return (
                <button
                  key={`f${r.id}`}
                  type="button"
                  onClick={() => setOpen((o) => new Set(o).add(r.id))}
                  className="flex h-8 w-full items-center gap-2 bg-raised px-4 font-sans text-xs text-muted transition-colors duration-200 hover:bg-active hover:text-ink"
                >
                  <ChevronsUpDown className="size-3.5" aria-hidden />
                  {l.showUnchanged(r.count)}
                </button>
              );
            }
            const { left, right, pairWords } = r;
            if (view === "split") {
              return (
                <div key={i} className="grid grid-cols-2">
                  <div className={cn("flex", left?.type === "del" && "bg-negative-soft", !left && "bg-raised/60")}>
                    <span className={num}>{left?.a ?? ""}</span>
                    <span className={cn(code, left?.type === "del" ? "text-ink" : "text-muted")}>{left ? words(pairWords?.left, left.text, "del") : ""}</span>
                  </div>
                  <div className={cn("flex border-l border-line", right?.type === "add" && "bg-positive-soft", !right && "bg-raised/60")}>
                    <span className={num}>{right?.b ?? ""}</span>
                    <span className={cn(code, right?.type === "add" ? "text-ink" : "text-muted")}>{right ? words(pairWords?.right, right.text, "add") : ""}</span>
                  </div>
                </div>
              );
            }
            if (left?.type === "same") {
              return (
                <div key={i} className="flex">
                  <span className={num}>{left.a}</span>
                  <span className={num}>{left.b}</span>
                  <span className="w-4 shrink-0 text-center text-faint"> </span>
                  <span className={cn(code, "text-muted")}>{left.text}</span>
                </div>
              );
            }
            return (
              <Fragment key={i}>
                {left && (
                  <div className="flex bg-negative-soft">
                    <span className={num}>{left.a}</span>
                    <span className={num} />
                    <span className="w-4 shrink-0 text-center text-negative">−</span>
                    <span className={cn(code, "text-ink")}>{words(pairWords?.left, left.text, "del")}</span>
                  </div>
                )}
                {right && (
                  <div className="flex bg-positive-soft">
                    <span className={num} />
                    <span className={num}>{right.b}</span>
                    <span className="w-4 shrink-0 text-center text-positive">+</span>
                    <span className={cn(code, "text-ink")}>{words(pairWords?.right, right.text, "add")}</span>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
