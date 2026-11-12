import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Reorder, useDragControls } from "motion/react";
import { GripVertical } from "lucide-react";
import { cn } from "../../cn";
import { springFirm } from "../../motion";

export type SortableListProps<T> = {
  items: T[];
  onReorder: (items: T[]) => void;
  getKey: (item: T) => string;
  /** Text read out when an item moves, e.g. its title. */
  getLabel: (item: T) => string;
  renderItem: (item: T, index: number) => ReactNode;
  label: string;
  /** Override any UI text. Merged over `sortableListLabels`. */
  labels?: Partial<SortableListLabels>;
  className?: string;
};

/** Text used by SortableList. Pass a partial via `labels` to translate or reword. */
export interface SortableListLabels {
  /** Live announcement after a keyboard move: "Title, position 2 of 5". */
  moved: (label: string, position: number, count: number) => string;
  /** aria-label of a drag handle: "Move Title, position 2 of 5". */
  handle: (label: string, position: number, count: number) => string;
}
export const sortableListLabels: SortableListLabels = {
  moved: (label, pos, n) => `${label}, position ${pos} of ${n}`,
  handle: (label, pos, n) => `Move ${label}, position ${pos} of ${n}`,
};

/**
 * A list reordered by dragging its handles. Keyboard: focus a handle and use
 * the Up and Down arrows (Home and End jump to either end).
 */
export function SortableList<T>({ items, onReorder, getKey, getLabel, renderItem, label, labels, className }: SortableListProps<T>) {
  const l = { ...sortableListLabels, ...labels };
  const [said, setSaid] = useState("");
  const listRef = useRef<HTMLUListElement>(null);

  const moveTo = (from: number, to: number) => {
    if (to < 0 || to >= items.length || to === from) return;
    const next = items.slice();
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onReorder(next);
    setSaid(l.moved(getLabel(it), to + 1, items.length));
    const key = getKey(it);
    requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`[data-handle="${CSS.escape(key)}"]`)?.focus());
  };

  return (
    <>
      <Reorder.Group
        ref={listRef}
        axis="y"
        values={items}
        onReorder={onReorder}
        aria-label={label}
        className={cn("flex flex-col gap-2", className)}
      >
        {items.map((it, i) => (
          <Row
            key={getKey(it)}
            item={it}
            id={getKey(it)}
            label={getLabel(it)}
            index={i}
            count={items.length}
            handleLabel={l.handle}
            onMove={(to) => moveTo(i, to)}
          >
            {renderItem(it, i)}
          </Row>
        ))}
      </Reorder.Group>
      <span className="sr-only" aria-live="assertive">{said}</span>
    </>
  );
}

function Row<T>({ item, id, label, index, count, onMove, handleLabel, children }: {
  handleLabel: SortableListLabels["handle"]; item: T; id: string; label: string; index: number; count: number; onMove: (to: number) => void; children: ReactNode;
}) {
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);
  const onKey = (e: KeyboardEvent) => {
    const to = e.key === "ArrowUp" ? index - 1 : e.key === "ArrowDown" ? index + 1 : e.key === "Home" ? 0 : e.key === "End" ? count - 1 : null;
    if (to == null) return;
    e.preventDefault();
    onMove(to);
  };
  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => setDragging(true)}
      onDragEnd={() => setDragging(false)}
      transition={springFirm}
      layout="position"
      className={cn(
        "relative flex items-center gap-2 rounded-card bg-surface p-2 pr-4 transition-shadow duration-200",
        dragging ? "z-10 shadow-float" : "z-0",
      )}
      style={{ borderRadius: 12 }}
    >
      <button
        type="button"
        data-handle={id}
        aria-label={handleLabel(label, index + 1, count)}
        onPointerDown={(e) => {
          e.preventDefault();
          controls.start(e);
        }}
        onKeyDown={onKey}
        className={cn(
          "grid h-9 w-7 shrink-0 touch-none place-items-center rounded-control text-faint transition-colors hover:bg-raised hover:text-ink",
          dragging ? "cursor-grabbing text-ink" : "cursor-grab",
        )}
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </Reorder.Item>
  );
}
