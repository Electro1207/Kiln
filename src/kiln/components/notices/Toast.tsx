import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { animate, AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade, springFirm, springSoft } from "../../motion";
import { Portal } from "../shared/useOverlay";

export type ToastVariant = "neutral" | "success" | "error" | "warning" | "info" | "loading";

export type ToastInput = {
  title: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  /** A text action on the right, e.g. Undo. The toast closes after it runs. */
  action?: { label: string; onClick: () => void };
  /** ms before it leaves on its own. Default 5000; loading toasts stay until updated. */
  duration?: number;
};

type ToastRecord = ToastInput & { id: string; version: number };

type Content<T> = ToastInput | ((value: T) => ToastInput);

export type ToastApi = {
  toast: (t: ToastInput) => string;
  /** Change a toast in place: its height and contents morph, its timer restarts. */
  update: (id: string, t: Partial<ToastInput>) => void;
  dismiss: (id: string) => void;
  /** Shows a loading toast that turns into success or error when the promise settles. */
  promise: <T>(p: Promise<T>, msgs: { loading: ToastInput; success: Content<T>; error: Content<unknown> }) => Promise<T>;
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const MAX = 5;
const GAP = 8;
const PEEK = 10;
const SHOWN_COLLAPSED = 3;
const FALLBACK_H = 62;

let counter = 0;

/** Text used by ToastProvider. Pass a partial via `labels` to translate or reword. */
export interface ToastLabels {
  /** aria-label of the toast region. */
  region: string;
  /** aria-label of each toast's close button. */
  dismiss: string;
}
export const toastLabels: ToastLabels = { region: "Notifications", dismiss: "Dismiss notification" };

/** Icons used by ToastProvider. Pass a partial via `icons` to swap any of them. */
export interface ToastIcons {
  /** Success variant. */
  success: ReactNode;
  /** Error variant. */
  error: ReactNode;
  /** Warning variant. */
  warning: ReactNode;
  /** Info variant. */
  info: ReactNode;
  /** Loading variant; the wrapper spins it. */
  loading: ReactNode;
  /** Close button on each toast. */
  close: ReactNode;
}
export const toastIcons: ToastIcons = {
  success: <CircleCheck />,
  error: <CircleAlert />,
  warning: <TriangleAlert />,
  info: <Info />,
  loading: (
    <svg viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.75" />
      <path d="M14.25 8A6.25 6.25 0 0 0 8 1.75" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  ),
  close: <X />,
};

/**
 * Holds the toast stack, bottom-right (bottom-centre on phones). The newest is
 * in front and two older ones peek behind it. Hovering anywhere over the stack
 * fans it out; leaving folds it back. Timers pause while it is open or the tab
 * is hidden. Swipe a toast to the right to dismiss it.
 */
export function ToastProvider({ children, labels, icons }: {
  children: ReactNode;
  /** Override any UI text. Merged over `toastLabels`. */
  labels?: Partial<ToastLabels>;
  /** Replace any built-in icon. Merged over `toastIcons`. */
  icons?: Partial<ToastIcons>;
}) {
  const l = { ...toastLabels, ...labels };
  const ic = useMemo(() => ({ ...toastIcons, ...icons }), [icons]);
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const expanded = (hovered || focused) && toasts.length > 0;

  const dismiss = useCallback((id: string) => setToasts((ts) => ts.filter((t) => t.id !== id)), []);
  const toast = useCallback((t: ToastInput) => {
    const id = `toast-${++counter}`;
    setToasts((ts) => [{ ...t, id, version: 0 }, ...ts].slice(0, MAX));
    return id;
  }, []);
  const update = useCallback((id: string, patch: Partial<ToastInput>) => {
    setToasts((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch, version: t.version + 1 } : t)));
  }, []);
  const promise = useCallback(
    <T,>(p: Promise<T>, msgs: { loading: ToastInput; success: Content<T>; error: Content<unknown> }) => {
      const id = toast({ ...msgs.loading, variant: "loading", duration: Infinity });
      const resolve = <V,>(c: Content<V>, v: V) => (typeof c === "function" ? c(v) : c);
      p.then(
        (v) => update(id, { duration: 5000, ...resolve(msgs.success, v), variant: resolve(msgs.success, v).variant ?? "success" }),
        (e) => update(id, { duration: 7000, ...resolve(msgs.error, e), variant: resolve(msgs.error, e).variant ?? "error" }),
      );
      return p;
    },
    [toast, update],
  );
  const report = useCallback((id: string, h: number) => {
    setHeights((hs) => (hs[id] === h ? hs : { ...hs, [id]: h }));
  }, []);

  const value = useMemo(() => ({ toast, update, dismiss, promise }), [toast, update, dismiss, promise]);

  const sizes = toasts.map((t) => heights[t.id] ?? FALLBACK_H);
  const frontH = sizes[0] ?? 0;
  const offsets = sizes.map((_, i) => sizes.slice(0, i).reduce((a, h) => a + h + GAP, 0));
  const expandedH = sizes.reduce((a, h) => a + h, 0) + GAP * Math.max(sizes.length - 1, 0);
  const collapsedH = frontH + PEEK * Math.min(Math.max(toasts.length - 1, 0), SHOWN_COLLAPSED - 1);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Portal>
        <section
          aria-label={l.region}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center px-3 pb-3 sm:inset-x-auto sm:right-0 sm:px-5 sm:pb-5"
        >
          {/* The hover zone is the whole expanded stack, gaps included, so it never flickers. */}
          <ol
            className="relative w-full sm:w-[360px]"
            style={{
              height: toasts.length === 0 ? 0 : expanded ? expandedH : collapsedH,
              pointerEvents: toasts.length ? "auto" : "none",
            }}
            onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
            onPointerLeave={() => setHovered(false)}
            onFocus={() => setFocused(true)}
            onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setFocused(false)}
          >
            <AnimatePresence initial={false}>
              {toasts.map((t, i) => (
                <ToastItem
                  key={t.id}
                  toast={t}
                  index={i}
                  expanded={expanded}
                  frontH={frontH}
                  offset={offsets[i]}
                  onHeight={report}
                  onDismiss={dismiss}
                  dismissLabel={l.dismiss}
                  icons={ic}
                />
              ))}
            </AnimatePresence>
          </ol>
        </section>
      </Portal>
    </ToastContext.Provider>
  );
}

const glyphTone: Record<Exclude<ToastVariant, "neutral" | "loading">, string> = {
  success: "text-positive",
  error: "text-negative",
  warning: "text-warning",
  info: "text-info",
};

function Glyph({ variant, icons }: { variant: ToastVariant; icons: ToastIcons }) {
  if (variant === "neutral") return null;
  return (
    <span className="grid h-5 w-4 shrink-0 place-items-center [&>*]:[grid-area:1/1]">
      <AnimatePresence initial={false}>
        <motion.span
          key={variant}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={springSoft}
          className={cn("grid place-items-center [&>svg]:size-4 [&>svg]:[stroke-width:2.2]", variant !== "loading" && glyphTone[variant])}
        >
          {variant === "loading" ? <LoadingGlyph>{icons.loading}</LoadingGlyph> : icons[variant]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function LoadingGlyph({ children }: { children: ReactNode }) {
  return (
    <motion.span
      className="grid text-muted [&>svg]:size-4"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
      aria-hidden
    >
      {children}
    </motion.span>
  );
}

type ItemProps = {
  toast: ToastRecord;
  index: number;
  expanded: boolean;
  frontH: number;
  offset: number;
  onHeight: (id: string, h: number) => void;
  onDismiss: (id: string) => void;
  dismissLabel: string;
  icons: ToastIcons;
};

function ToastItem({ toast, index, expanded, frontH, offset, onHeight, onDismiss, dismissLabel, icons }: ItemProps) {
  const { id, title, description, variant = "neutral", action, version } = toast;
  const duration = toast.duration ?? (variant === "loading" ? Infinity : 5000);
  const contentRef = useRef<HTMLDivElement>(null);
  const [natural, setNatural] = useState<number | null>(null);
  const x = useMotionValue(0);
  const swipeOpacity = useTransform(x, [0, 260], [1, 0]);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.offsetHeight;
      setNatural(h);
      onHeight(id, h);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [id, onHeight]);

  const [hidden, setHidden] = useState(() => typeof document !== "undefined" && document.hidden);
  useEffect(() => {
    const on = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  // A fresh timer for every version of the toast; paused while the stack is open or the tab is hidden.
  const remaining = useRef(duration);
  const timerKey = useRef(version);
  const paused = expanded || hidden;
  useEffect(() => {
    if (timerKey.current !== version) {
      timerKey.current = version;
      remaining.current = duration;
    }
    if (paused || !Number.isFinite(remaining.current)) return;
    const start = Date.now();
    const t = window.setTimeout(() => onDismiss(id), Math.max(remaining.current, 0));
    return () => {
      window.clearTimeout(t);
      remaining.current -= Date.now() - start;
    };
  }, [paused, version, duration, id, onDismiss]);

  const front = index === 0;
  const shown = expanded || index < SHOWN_COLLAPSED;
  const y = expanded ? -offset : -index * PEEK;
  const scale = expanded ? 1 : 1 - index * 0.05;
  const opacity = !shown ? 0 : expanded ? 1 : [1, 0.9, 0.75][index];
  const height = !expanded && !front ? frontH : natural ?? undefined;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 80 || info.velocity.x > 450) {
      animate(x, 460, { ...springFirm, velocity: Math.max(info.velocity.x, 600) }).then(() => onDismiss(id));
    } else {
      animate(x, 0, springFirm);
    }
  };

  return (
    <motion.li
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity, y, scale, height }}
      exit={{ opacity: 0, y: front ? y + 12 : y, scale: scale - 0.03, transition: { duration: 0.22, ease: easeOut } }}
      transition={{ ...springSoft, opacity: { duration: 0.16, ease: easeOut } }}
      drag={front || expanded ? "x" : false}
      dragDirectionLock
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.04, right: 1 }}
      dragMomentum={false}
      onDragEnd={onDragEnd}
      style={{ x, zIndex: MAX - index, transformOrigin: "50% 0%", bottom: 0, borderRadius: 14 }}
      className={cn(
        "group absolute inset-x-0 touch-pan-y bg-surface text-ink shadow-float dark:ring-1 dark:ring-line dark:ring-inset",
        !shown && "pointer-events-none",
      )}
    >
      <motion.div style={{ opacity: swipeOpacity, borderRadius: 14 }} className="h-full overflow-hidden">
        <motion.div
          ref={contentRef}
          initial={false}
          animate={{ opacity: expanded || front ? 1 : 0 }}
          transition={expanded || front ? fade : { duration: 0.08, ease: easeOut }}
          className="flex items-start gap-3 px-4 py-3.5"
        >
          <Glyph variant={variant} icons={icons} />
          <div className="grid min-w-0 flex-1 [&>*]:[grid-area:1/1]">
            <AnimatePresence initial={false}>
              <motion.div
                key={version}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { ...fade, delay: 0.1 } }}
                exit={{ opacity: 0, transition: { duration: 0.09 } }}
              >
                <p className="text-sm font-semibold leading-5">{title}</p>
                {description && <p className="mt-0.5 text-[13px] leading-[18px] text-muted">{description}</p>}
              </motion.div>
            </AnimatePresence>
          </div>
          {action && (
            <button
              type="button"
              onClick={() => {
                action.onClick();
                onDismiss(id);
              }}
              className="-my-0.5 h-6 shrink-0 rounded-[6px] px-1.5 text-[13px] font-semibold leading-6 text-accent transition-colors hover:bg-raised"
            >
              {action.label}
            </button>
          )}
        </motion.div>
      </motion.div>
      <button
        type="button"
        aria-label={dismissLabel}
        onClick={() => onDismiss(id)}
        className={cn(
          "absolute -left-1.5 -top-1.5 grid size-5 place-items-center rounded-full border border-line bg-surface text-muted",
          "opacity-0 transition-[opacity,color] duration-150 hover:text-ink focus-visible:opacity-100 group-hover:opacity-100 pointer-coarse:hidden [&>svg]:size-3 [&>svg]:[stroke-width:2.5]",
          !(front || expanded) && "pointer-events-none",
        )}
      >
        {icons.close}
      </button>
    </motion.li>
  );
}
