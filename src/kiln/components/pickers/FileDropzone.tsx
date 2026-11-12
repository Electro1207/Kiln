import { useEffect, useId, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, FileImage, FileText, FileArchive, File as FileIcon, UploadCloud, X, RotateCw } from "lucide-react";
import { cn } from "../../cn";
import { fade, spring, springFirm, springSnappy, springSoft } from "../../motion";

/** Icons used by FileDropzone. Pass a partial via `icons` to replace them. */
export interface FileDropzoneIcons {
  /** Cloud in the drop area. */
  upload: ReactNode;
  /** Image file in the list. */
  image: ReactNode;
  /** Archive file in the list. */
  archive: ReactNode;
  /** Text, PDF or document file in the list. */
  document: ReactNode;
  /** Any other file in the list. */
  file: ReactNode;
  /** Tick on a finished upload. */
  done: ReactNode;
  /** Retry button on a failed upload. */
  retry: ReactNode;
  /** Remove button. */
  remove: ReactNode;
}
export const fileDropzoneIcons: FileDropzoneIcons = {
  upload: <UploadCloud />,
  image: <FileImage />,
  archive: <FileArchive />,
  document: <FileText />,
  file: <FileIcon />,
  done: <Check />,
  retry: <RotateCw />,
  remove: <X />,
};

/** Text used by FileDropzone. Pass a partial via `labels` to translate or reword. */
export interface FileDropzoneLabels {
  /** Default prompt when the `label` prop is not given. If it ends with `browse`, that word becomes the button. */
  prompt: string;
  /** The trailing word of the prompt that turns into the file-picker button. */
  browse: string;
  /** Prompt while a drag is over the zone. */
  release: string;
  /** Error for a failed upload. */
  uploadFailed: string;
  /** Error for a rejected file type. */
  notAccepted: string;
  /** Error for a file over `maxSize`. */
  tooLarge: (size: string) => string;
  /** Hint part: "up to 5 MB". */
  upTo: (size: string) => string;
  /** aria-label of a file's progress bar. */
  uploading: (name: string) => string;
  /** aria-label of the done tick. */
  uploaded: string;
  /** aria-label of the retry button. */
  retry: (name: string) => string;
  /** aria-label of the remove button. */
  remove: (name: string) => string;
}
export const fileDropzoneLabels: FileDropzoneLabels = {
  prompt: "Drop files here or browse",
  browse: "browse",
  release: "Release to upload",
  uploadFailed: "Upload failed",
  notAccepted: "This type isn’t accepted",
  tooLarge: (s) => `Larger than ${s}`,
  upTo: (s) => `up to ${s}`,
  uploading: (n) => `Uploading ${n}`,
  uploaded: "Uploaded",
  retry: (n) => `Retry ${n}`,
  remove: (n) => `Remove ${n}`,
};

export type UploadFn = (file: File, onProgress: (fraction: number) => void, signal: AbortSignal) => Promise<void>;

export type FileDropzoneProps = {
  /** Uploads one file. Defaults to a simulated upload so the component works on its own. */
  upload?: UploadFn;
  /** Same format as <input accept>. */
  accept?: string;
  /** Largest file in bytes. */
  maxSize?: number;
  multiple?: boolean;
  label?: string;
  onComplete?: (file: File) => void;
  /** Override any UI text. Merged over `fileDropzoneLabels`. */
  labels?: Partial<FileDropzoneLabels>;
  /** Replace any built-in icon. Merged over `fileDropzoneIcons`. */
  icons?: Partial<FileDropzoneIcons>;
  className?: string;
};

type Item = { id: string; file: File; progress: number; state: "uploading" | "done" | "error"; error?: string };

export const formatBytes = (n: number) =>
  n < 1024 ? `${n} B` : n < 1024 ** 2 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1024 ** 2).toFixed(1)} MB`;

const simulated: UploadFn = (file, onProgress, signal) =>
  new Promise((resolve, reject) => {
    let p = 0;
    const speed = Math.max(0.02, Math.min(0.12, 400_000 / Math.max(file.size, 1)));
    const t = window.setInterval(() => {
      p = Math.min(1, p + speed * (0.6 + Math.random()));
      onProgress(p);
      if (p >= 1) { window.clearInterval(t); resolve(); }
    }, 120);
    signal.addEventListener("abort", () => { window.clearInterval(t); reject(new DOMException("Aborted", "AbortError")); });
  });

function iconFor(file: File): "image" | "archive" | "document" | "file" {
  if (file.type.startsWith("image/")) return "image";
  if (/zip|tar|gzip|rar|7z/.test(file.type) || /\.(zip|tar|gz|rar|7z)$/i.test(file.name)) return "archive";
  if (file.type.startsWith("text/") || /pdf|document|sheet/.test(file.type)) return "document";
  return "file";
}

function matchesAccept(file: File, accept?: string) {
  if (!accept) return true;
  return accept.split(",").map((s) => s.trim().toLowerCase()).some((rule) => {
    if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule);
    if (rule.endsWith("/*")) return file.type.toLowerCase().startsWith(rule.slice(0, -1));
    return file.type.toLowerCase() === rule;
  });
}

/** A drop area and file picker with type and size checks, and a list of the chosen files. */
export function FileDropzone({
  upload = simulated,
  accept,
  maxSize,
  multiple = true,
  label,
  onComplete,
  labels,
  icons,
  className,
}: FileDropzoneProps) {
  const l = { ...fileDropzoneLabels, ...labels };
  const ic = useMemo(() => ({ ...fileDropzoneIcons, ...icons }), [icons]);
  const prompt = label ?? l.prompt;
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const controllers = useRef(new Map<string, AbortController>());
  const depth = useRef(0);

  useEffect(() => {
    const map = controllers.current;
    return () => map.forEach((c) => c.abort());
  }, []);

  const patch = (itemId: string, p: Partial<Item>) =>
    setItems((list) => list.map((it) => (it.id === itemId ? { ...it, ...p } : it)));

  const start = (item: Item) => {
    const ctrl = new AbortController();
    controllers.current.set(item.id, ctrl);
    upload(item.file, (f) => patch(item.id, { progress: f }), ctrl.signal)
      .then(() => {
        patch(item.id, { progress: 1, state: "done" });
        onComplete?.(item.file);
      })
      .catch((e: unknown) => {
        if ((e as DOMException)?.name !== "AbortError") patch(item.id, { state: "error", error: l.uploadFailed });
      })
      .finally(() => controllers.current.delete(item.id));
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const files = Array.from(list).slice(0, multiple ? undefined : 1);
    const next: Item[] = files.map((file) => {
      const itemId = `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 7)}`;
      if (!matchesAccept(file, accept)) return { id: itemId, file, progress: 0, state: "error", error: l.notAccepted };
      if (maxSize && file.size > maxSize) return { id: itemId, file, progress: 0, state: "error", error: l.tooLarge(formatBytes(maxSize)) };
      return { id: itemId, file, progress: 0, state: "uploading" };
    });
    setItems((cur) => (multiple ? [...next, ...cur] : next));
    next.filter((n) => n.state === "uploading").forEach(start);
  };

  const remove = (itemId: string) => {
    controllers.current.get(itemId)?.abort();
    setItems((list) => list.filter((i) => i.id !== itemId));
  };

  const retry = (item: Item) => {
    const fresh = { ...item, progress: 0, state: "uploading" as const, error: undefined };
    patch(item.id, fresh);
    start(fresh);
  };

  const onDrag = (e: DragEvent, kind: "enter" | "leave" | "over" | "drop") => {
    e.preventDefault();
    if (kind === "enter") { depth.current++; setOver(true); }
    if (kind === "leave") { depth.current--; if (depth.current <= 0) setOver(false); }
    if (kind === "drop") { depth.current = 0; setOver(false); addFiles(e.dataTransfer.files); }
  };

  const hint = [accept?.split(",").map((a) => a.trim().replace("/*", "").replace(/^\./, "").toUpperCase()).join(", "), maxSize && l.upTo(formatBytes(maxSize))]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-3", className)}>
      <div
        onDragEnter={(e) => onDrag(e, "enter")}
        onDragLeave={(e) => onDrag(e, "leave")}
        onDragOver={(e) => onDrag(e, "over")}
        onDrop={(e) => onDrag(e, "drop")}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2 rounded-card border-[1.5px] border-dashed px-6 py-9 text-center",
          "transition-[background-color,border-color] duration-200 ease-out-soft",
          over ? "border-accent bg-accent-soft" : "border-line-strong bg-surface hover:border-faint",
        )}
      >
        <motion.span
          animate={over ? { y: -4 } : { y: 0 }}
          transition={springSoft}
          className={cn("grid size-11 place-items-center rounded-full transition-colors duration-200", over ? "bg-btn-primary text-btn-primary-ink" : "bg-raised text-muted", "[&>svg]:size-5")}
        >
          {ic.upload}
        </motion.span>
        <p className="text-sm text-ink">
          {over ? l.release : (
            <>
              {prompt.endsWith(l.browse) ? prompt.slice(0, -l.browse.length) : prompt}
              {prompt.endsWith(l.browse) && (
                <button type="button" onClick={() => inputRef.current?.click()} className="font-medium text-accent underline-offset-4 hover:underline">
                  {l.browse}
                </button>
              )}
            </>
          )}
        </p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <ul className="flex flex-col gap-2" aria-live="polite">
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((it) => {
            return (
              <motion.li
                key={it.id}
                layout="position"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.16 } }}
                transition={spring}
                className="flex items-center gap-3 rounded-card bg-surface p-3"
              >
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-control", it.state === "error" ? "bg-negative-soft text-negative" : "bg-raised text-muted", "[&>svg]:size-4")}>
                  {ic[iconFor(it.file)]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm text-ink">{it.file.name}</span>
                    <span className="shrink-0 text-xs text-muted tabular">
                      {it.state === "uploading" ? `${Math.round(it.progress * 100)}%` : formatBytes(it.file.size)}
                    </span>
                  </div>
                  {it.state === "error" ? (
                    <p className="mt-1 text-xs text-negative">{it.error}</p>
                  ) : (
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-active" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(it.progress * 100)} aria-label={l.uploading(it.file.name)}>
                      <motion.div
                        className={cn("h-full origin-left rounded-full transition-colors duration-300", it.state === "done" ? "bg-positive" : "bg-btn-primary")}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: it.progress }}
                        transition={springFirm}
                      />
                    </div>
                  )}
                </div>
                <span className="grid size-7 shrink-0 [&>*]:[grid-area:1/1]">
                <AnimatePresence initial={false}>
                  {it.state === "done" ? (
                    <motion.span key="ok" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ opacity: fade, scale: springSnappy }} className="grid size-7 place-items-center rounded-full bg-positive-soft text-positive [&>svg]:size-3.5 [&>svg]:[stroke-width:3]" aria-label={l.uploaded}>
                      {ic.done}
                    </motion.span>
                  ) : it.state === "error" && matchesAccept(it.file, accept) && !(maxSize && it.file.size > maxSize) ? (
                    <motion.button key="retry" type="button" aria-label={l.retry(it.file.name)} onClick={() => retry(it)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} className="grid size-7 place-items-center rounded-full text-muted transition-colors hover:bg-active hover:text-ink [&>svg]:size-3.5">
                      {ic.retry}
                    </motion.button>
                  ) : null}
                </AnimatePresence>
                </span>
                <button
                  type="button"
                  aria-label={l.remove(it.file.name)}
                  onClick={() => remove(it.id)}
                  className="grid size-7 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-active hover:text-ink [&>svg]:size-3.5"
                >
                  {ic.remove}
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
