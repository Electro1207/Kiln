import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { cn } from "../../cn";
import { fade, springSoft } from "../../motion";

export type DockItem = {
  id: string;
  label: string;
  icon: ReactNode;
  onSelect?: () => void;
  /** Shows the small running dot under the icon. */
  running?: boolean;
};

/** Text used by Dock. Pass a partial via `labels` to translate or reword. */
export interface DockLabels {
  /** aria-label of the toolbar. */
  dock: string;
}
export const dockLabels: DockLabels = { dock: "Dock" };

export type DockProps = {
  items: DockItem[];
  /** Icon tile size at rest, px. */
  size?: number;
  /** Scale of the icon right under the pointer. */
  magnify?: number;
  /** How far the swell reaches either side of the pointer, px. */
  reach?: number;
  className?: string;
  /** Override any UI text. Merged over `dockLabels`. */
  labels?: Partial<DockLabels>;
};

const GAP = 8;
const PAD = 8;
const CAP = 18;

type Layout = { s: number[]; dx: number[]; grow: number };

/**
 * A macOS-style dock. Icons swell as the pointer nears and their neighbours
 * slide apart to make room; the bar widens to fit. Everything moves by
 * transform only, and labels appear above the icon under the pointer or focus.
 */
export function Dock({ items, size: wanted = 44, magnify = 1.6, reach = 140, className, labels }: DockProps) {
  const l = { ...dockLabels, ...labels };
  const n = items.length;
  // Shrink the tiles to fit narrow containers (a phone), never grow them.
  const root = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(wanted);
  useLayoutEffect(() => {
    const parent = root.current?.parentElement;
    if (!parent) return;
    const fit = () => {
      const cs = getComputedStyle(parent);
      const avail = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      setSize(Math.max(28, Math.min(wanted, Math.floor((avail - PAD * 2 - GAP * (n - 1)) / n))));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(parent);
    return () => ro.disconnect();
  }, [wanted, n]);
  const mx = useMotionValue(-1e4);
  const presence = useSpring(0, springSoft);
  const [hovered, setHovered] = useState<number | null>(null);
  const centre = (i: number) => PAD + i * (size + GAP) + size / 2;
  const baseInner = n * size + GAP * (n - 1);

  const layout = useTransform<number, Layout>([mx, presence], ([m, p]) => {
    const s = items.map((_, i) => {
      const d = Math.min(Math.abs(m - centre(i)) / reach, 1);
      const swell = 1 - d * d * (3 - 2 * d);
      return 1 + (magnify - 1) * swell * p;
    });
    const widths = s.map((k) => k * size);
    const inner = widths.reduce((a, w) => a + w, 0) + GAP * (n - 1);
    const grow = (inner - baseInner) / 2;
    let x = PAD - grow;
    const dx = widths.map((w, i) => {
      const c = x + w / 2;
      x += w + GAP;
      return c - centre(i);
    });
    return { s, dx, grow };
  });

  const nearest = (m: number) => {
    let best = 0;
    for (let i = 1; i < n; i++) if (Math.abs(m - centre(i)) < Math.abs(m - centre(best))) best = i;
    return best;
  };

  const width = baseInner + PAD * 2;
  const height = size + PAD * 2;

  return (
    <div
      ref={root}
      role="toolbar"
      aria-label={l.dock}
      className={cn("relative", className)}
      style={{ width, height }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const m = e.clientX - e.currentTarget.getBoundingClientRect().left;
        mx.set(m);
        presence.set(1);
        setHovered(nearest(m));
      }}
      onPointerLeave={() => {
        presence.set(0);
        setHovered(null);
      }}
    >
      <DockBackground layout={layout} width={width} />
      {items.map((item, i) => (
        <DockIcon
          key={item.id}
          item={item}
          index={i}
          size={size}
          left={PAD + i * (size + GAP)}
          layout={layout}
          showLabel={hovered === i}
          onFocusItem={() => {
            mx.set(centre(i));
            presence.set(1);
            setHovered(i);
          }}
          onBlurItem={() => {
            presence.set(0);
            setHovered(null);
          }}
        />
      ))}
    </div>
  );
}

/** Two rounded caps that slide out and a plain middle that stretches, so the corners never distort. */
function DockBackground({ layout, width }: { layout: MotionValue<Layout>; width: number }) {
  const left = useTransform(layout, (l) => -l.grow);
  const right = useTransform(layout, (l) => l.grow);
  const mid = useTransform(layout, (l) => (width - CAP * 2 + l.grow * 2) / (width - CAP * 2));
  return (
    <div aria-hidden className="absolute inset-0">
      <motion.div className="absolute inset-y-0 left-0 rounded-l-[18px] bg-elevated" style={{ width: CAP + 1, x: left }} />
      <motion.div className="absolute inset-y-0 bg-elevated" style={{ left: CAP, right: CAP, scaleX: mid }} />
      <motion.div className="absolute inset-y-0 right-0 rounded-r-[18px] bg-elevated" style={{ width: CAP + 1, x: right }} />
    </div>
  );
}

type IconProps = {
  item: DockItem;
  index: number;
  size: number;
  left: number;
  layout: MotionValue<Layout>;
  showLabel: boolean;
  onFocusItem: () => void;
  onBlurItem: () => void;
};

function DockIcon({ item, index, size, left, layout, showLabel, onFocusItem, onBlurItem }: IconProps) {
  const x = useTransform(layout, (l) => l.dx[index]);
  const scale = useTransform(layout, (l) => l.s[index]);
  const lift = useTransform(scale, (k) => -(k - 1) * size);
  return (
    <motion.div className="absolute" style={{ left, bottom: PAD, width: size, height: size, x }}>
      <motion.span
        role="tooltip"
        id={`dock-${item.id}`}
        initial={false}
        animate={{ opacity: showLabel ? 1 : 0 }}
        transition={fade}
        style={{ y: lift }}
        className="pointer-events-none absolute bottom-full left-1/2 mb-2.5 -translate-x-1/2 whitespace-nowrap rounded-[7px] bg-ink px-2 py-1 text-xs font-medium text-surface dark:bg-elevated dark:text-ink dark:ring-1 dark:ring-line-strong/60"
      >
        {item.label}
      </motion.span>
      <motion.button
        type="button"
        aria-label={item.label}
        aria-describedby={showLabel ? `dock-${item.id}` : undefined}
        onClick={item.onSelect}
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && onFocusItem()}
        onBlur={onBlurItem}
        style={{ scale, transformOrigin: "50% 100%", borderRadius: 12 }}
        className="grid size-full place-items-center bg-raised text-ink outline-offset-2 [&_svg]:size-[50%]"
      >
        {item.icon}
      </motion.button>
      {item.running && <span aria-hidden className="absolute -bottom-[5px] left-1/2 size-1 -translate-x-1/2 rounded-full bg-muted" />}
    </motion.div>
  );
}
