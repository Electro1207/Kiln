import { memo, useEffect, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy } from "lucide-react";
import type { Category, Entry } from "./types";
import { cn } from "../kiln/cn";
import { ToastProvider } from "../kiln/components/notices/Toast";
import { easeOut, springSnappy, fade } from "../kiln/motion";
import { KILN_PACKAGE, KILN_SITE } from "./site";

/* Source of every library file, loaded only when someone opens the Code tab. */
const sources = import.meta.glob<string>("../kiln/**/*.{ts,tsx,css}", { query: "?raw", import: "default" });
const loadSource = (path: string) => sources[path.replace(/^src\//, "../")]?.() ?? Promise.resolve("// Source not found");

type Props = { category: Category; root: RefObject<HTMLDivElement | null>; onActive: (id: string | undefined) => void };

/* Memoised: scroll-spy updates the sidebar on every section crossed, and without this the
   whole page of demos re-rendered each time (a 17-19ms frame on heavy pages). */
export const CategoryPage = memo(function CategoryPage({ category, root, onActive }: Props) {
  /* Scroll-spy. The active entry is the last one whose top has passed a line 30% down the sheet.
     Near the bottom the line slides down to the sheet's foot, so the last entries, which can never
     reach 30%, still take their turn, and at the very bottom the last entry always wins.
     Tops are measured once and again only when something resizes, so a scroll frame reads nothing. */
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let tops: number[] = [];
    let frame = 0;
    const nodes = () => category.entries.map((e) => document.getElementById(e.id));
    const measure = () => {
      // offsetTop, not getBoundingClientRect: the page may still be mid-entrance (translated).
      tops = nodes().map((n) => {
        let y = 0;
        for (let p: HTMLElement | null = n; p && p !== el; p = p.offsetParent as HTMLElement | null) y += p.offsetTop;
        return n ? y : Infinity;
      });
    };
    const pick = () => {
      frame = 0;
      const { scrollTop, clientHeight, scrollHeight } = el;
      const room = scrollHeight - clientHeight;
      if (room <= 0) return onActive(category.entries[0]?.id);
      // Over the last screen of travel the line moves from 30% down to the bottom edge.
      const tail = Math.min(room, clientHeight);
      const t = Math.max(0, (scrollTop - (room - tail)) / tail);
      const line = scrollTop + clientHeight * (0.3 + 0.7 * t) - (t >= 0.999 ? 48 : 0);
      let i = 0;
      for (let k = 0; k < tops.length; k++) if (tops[k] <= line) i = k;
      onActive(category.entries[i]?.id);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(pick); };
    measure();
    pick();
    const ro = new ResizeObserver(() => { measure(); onScroll(); });
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
      onActive(undefined);
    };
  }, [category, root, onActive]);

  return (
    <div>
      <header className="max-w-2xl space-y-2 pb-12">
        <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em]">{category.name}</h1>
        <p className="text-[15px]">{category.summary}</p>
      </header>
      <div className="space-y-20">
        {category.entries.map((e) => <EntryBlock key={e.id} entry={e} />)}
      </div>
    </div>
  );
});

function EntryBlock({ entry }: { entry: Entry }) {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  return (
    <section id={entry.id} aria-labelledby={`${entry.id}-title`} className="scroll-mt-6">
      {/* Only the small heading block rises in: fading a whole demo section would ask the browser to
          raster a large new layer on the frame it enters, which cost a frame while scrolling. */}
      <motion.div
        className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -8% 0px" }}
        transition={{ duration: 0.5, ease: easeOut }}
      >
        <div className="max-w-xl">
          <h2 id={`${entry.id}-title`} className="text-[17px] font-semibold tracking-[-0.01em]">{entry.name}</h2>
          <p className="mt-1 text-muted">{entry.summary}</p>
        </div>
        <div role="tablist" aria-label={`${entry.name} view`} className="inline-flex shrink-0 self-start rounded-full bg-raised p-1 sm:self-auto">
          {(["preview", "code"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn("relative h-7 rounded-full px-3.5 text-[13px] font-medium capitalize transition-colors", tab === t ? "text-ink" : "text-muted hover:text-ink")}
            >
              <motion.span aria-hidden initial={false} animate={{ opacity: tab === t ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-0 bg-elevated" style={{ borderRadius: 999 }} />
              <span className="relative z-[1]">{t}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait" initial={false}>
        {tab === "preview" ? (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.995 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.995 }} transition={{ duration: 0.18, ease: easeOut }}>
            <ToastProvider><entry.Demo /></ToastProvider>
          </motion.div>
        ) : (
          <motion.div key="code" initial={{ opacity: 0, scale: 0.995 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.995 }} transition={{ duration: 0.18, ease: easeOut }}>
            <InstallRow entry={entry} />
            <SourceView files={entry.files} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-3 flex flex-wrap gap-2">
        {entry.files.map((f) => <CopyPath key={f} path={f} />)}
      </div>
    </section>
  );
}

function CopyPath({ path }: { path: string }) {
  const [done, setDone] = useState(false);
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        navigator.clipboard?.writeText(path).catch(() => {});
        setDone(true);
        window.setTimeout(() => setDone(false), 1400);
      }}
      className="inline-flex h-7 items-center gap-1.5 rounded-full bg-raised px-3 text-xs text-muted transition-colors hover:text-ink"
      aria-label={`Copy path ${path}`}
    >
      <span className="grid size-3.5 [&>*]:[grid-area:1/1]">
        <motion.span initial={false} animate={{ opacity: done ? 0 : 1, scale: done ? 0.8 : 1 }} transition={springSnappy} className="grid place-items-center">
          <Copy className="size-3.5" />
        </motion.span>
        <motion.span initial={false} animate={{ opacity: done ? 1 : 0, scale: done ? 1 : 0.8 }} transition={springSnappy} className="grid place-items-center">
          <Check className="size-3.5 text-positive" />
        </motion.span>
      </span>
      {path}
    </motion.button>
  );
}

const exportedValues = (code: string) => [...code.matchAll(/^export (?:async )?(?:function|const|class) (\w+)/gm)].map((m) => m[1]);

function useImportLine(files: string[]) {
  const [line, setLine] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    const code = files.filter((f) => /\/(components\/[^/]+\/[A-Z]\w*|theme)\.tsx$/.test(f));
    const pick = code.length ? code : files.filter((f) => /\.tsx?$/.test(f)).slice(0, 1);
    Promise.all(pick.map(loadSource)).then((srcs) => {
      if (!live) return;
      const names = [...new Set(srcs.flatMap(exportedValues))].slice(0, 6);
      setLine(names.length ? `import { ${names.join(", ")} } from "${KILN_PACKAGE}";` : `import "${KILN_PACKAGE}/styles.css";`);
    });
    return () => { live = false; };
  }, [files]);
  return line ?? "…";
}

function CommandLine({ label, text, copyLabel }: { label: string; text: string; copyLabel: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <span className="w-20 shrink-0 text-xs text-muted">{label}</span>
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-pre py-1 font-mono text-[12.5px] text-ink">{text}</code>
      <button
        type="button"
        aria-label={copyLabel}
        onClick={() => {
          navigator.clipboard?.writeText(text).catch(() => {});
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        }}
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-control px-3 text-xs text-muted transition-colors hover:text-ink"
      >
        {copied ? <Check className="size-3.5 text-positive" /> : <Copy className="size-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function InstallRow({ entry }: { entry: Entry }) {
  const importLine = useImportLine(entry.files);
  return (
    <div className="mb-3 divide-y divide-line overflow-hidden rounded-card bg-raised" role="group" aria-label={`Install ${entry.name}`}>
      <CommandLine label="Install" text={`npx shadcn@latest add ${KILN_SITE}/r/${entry.id}.json`} copyLabel="Copy shadcn command" />
      <CommandLine label="or npm" text={`npm i ${KILN_PACKAGE}`} copyLabel="Copy npm command" />
      <CommandLine label="Import" text={importLine} copyLabel="Copy import line" />
    </div>
  );
}

function SourceView({ files }: { files: string[] }) {
  const [file, setFile] = useState(files[0]);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    let live = true;
    setCode(null);
    loadSource(file).then((c) => live && setCode(c));
    return () => { live = false; };
  }, [file]);
  return (
    <div className="overflow-hidden rounded-card bg-raised">
      <div className="flex items-center gap-1 overflow-x-auto px-2 pt-2">
        {files.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFile(f)}
            className={cn("h-8 shrink-0 rounded-control px-3 text-xs transition-colors", f === file ? "bg-surface text-ink" : "text-muted hover:text-ink")}
          >
            {f.split("/").pop()}
          </button>
        ))}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => {
            if (!code) return;
            navigator.clipboard?.writeText(code).catch(() => {});
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1400);
          }}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-control px-3 text-xs text-muted transition-colors hover:text-ink"
        >
          {copied ? <Check className="size-3.5 text-positive" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
      <pre className="max-h-[520px] overflow-auto p-4 font-mono text-[12.5px] leading-relaxed text-ink">
        <code>{code ?? "Loading…"}</code>
      </pre>
    </div>
  );
}
