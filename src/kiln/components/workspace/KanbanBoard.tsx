import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { animate, motion, useMotionValue } from "motion/react";
import { ArrowDown, ArrowUp, ArrowUpToLine, MoreHorizontal, MoveRight } from "lucide-react";
import { cn } from "../../cn";
import { useControllable } from "../../controllable";
import { springFirm, springSoft } from "../../motion";
import { SwapText } from "../shared/Anchored";
import { DropdownMenu, type MenuEntry } from "../menus/DropdownMenu";

export type KanbanTone = "neutral" | "info" | "positive" | "warning" | "negative";
export type KanbanCard = { id: string; title: string; tag?: { label: string; tone?: KanbanTone }; assignee?: string; meta?: string };
export type KanbanColumn = { id: string; title: string; cards: KanbanCard[] };

export type KanbanBoardProps = {
  /** Controlled columns. Leave out to let the board keep its own. */
  columns?: KanbanColumn[];
  /** Where an uncontrolled board starts. Default empty. */
  defaultColumns?: KanbanColumn[];
  /** Called with the new columns after a card moves, controlled or not. */
  onChange?: (columns: KanbanColumn[]) => void;
  /** Replace the default card body. */
  renderCard?: (card: KanbanCard) => ReactNode;
  /** Override any UI text. Merged over `kanbanBoardLabels`. */
  labels?: Partial<KanbanBoardLabels>;
  /** Replace any built-in icon. Merged over `kanbanBoardIcons`. */
  icons?: Partial<KanbanBoardIcons>;
  className?: string;
};

/** Text used by KanbanBoard. Pass a partial via `labels` to translate or reword. */
export interface KanbanBoardLabels {
  /** Card menu entry: "Move to Done". */
  moveToColumn: (column: string) => string;
  /** Card menu entry. */
  moveToTop: string;
  /** Card menu entry. */
  moveUp: string;
  /** Card menu entry. */
  moveDown: string;
  /** Card menu button and menu label: "Move “Title”". */
  moveCard: (title: string) => string;
  /** Text of an empty column. */
  empty: string;
}
/** Icons used by KanbanBoard. Pass a partial via `icons` to swap any of them. */
export interface KanbanBoardIcons {
  /** The button that opens a card's move menu. */
  more: ReactNode;
  /** Menu item: move to another column. */
  moveToColumn: ReactNode;
  /** Menu item: move to the top of the column. */
  moveToTop: ReactNode;
  /** Menu item: move up one place. */
  moveUp: ReactNode;
  /** Menu item: move down one place. */
  moveDown: ReactNode;
}
export const kanbanBoardIcons: KanbanBoardIcons = {
  more: <MoreHorizontal />,
  moveToColumn: <MoveRight />,
  moveToTop: <ArrowUpToLine />,
  moveUp: <ArrowUp />,
  moveDown: <ArrowDown />,
};
export const kanbanBoardLabels: KanbanBoardLabels = {
  moveToColumn: (c) => `Move to ${c}`,
  moveToTop: "Move to top",
  moveUp: "Move up",
  moveDown: "Move down",
  moveCard: (t) => `Move “${t}”`,
  empty: "Nothing here yet",
};

type Drag = {
  card: KanbanCard;
  from: string;
  to: string;
  index: number;
  width: number;
  height: number;
  dx: number;
  dy: number;
  dropping: boolean;
};

const GAP = 8;

const toneClass: Record<KanbanTone, string> = {
  neutral: "bg-active text-ink",
  info: "bg-info-soft text-info",
  positive: "bg-positive-soft text-positive",
  warning: "bg-warning-soft text-warning",
  negative: "bg-negative-soft text-negative",
};

export function moveCard(columns: KanbanColumn[], cardId: string, toCol: string, toIndex: number): KanbanColumn[] {
  let card: KanbanCard | undefined;
  const without = columns.map((c) => {
    const i = c.cards.findIndex((k) => k.id === cardId);
    if (i < 0) return c;
    card = c.cards[i];
    return { ...c, cards: c.cards.filter((k) => k.id !== cardId) };
  });
  if (!card) return columns;
  return without.map((c) => {
    if (c.id !== toCol) return c;
    const cards = c.cards.slice();
    cards.splice(Math.max(0, Math.min(toIndex, cards.length)), 0, card!);
    return { ...c, cards };
  });
}

function DefaultCard({ card }: { card: KanbanCard }) {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="pr-7 text-sm leading-snug text-ink">{card.title}</p>
      {(card.tag || card.assignee || card.meta) && (
        <div className="flex items-center gap-2">
          {card.tag && (
            <span className={cn("rounded-full px-2 text-xs leading-5", toneClass[card.tag.tone ?? "neutral"])}>{card.tag.label}</span>
          )}
          {card.meta && <span className="text-xs text-muted tabular">{card.meta}</span>}
          {card.assignee && (
            <span
              title={card.assignee}
              className="ml-auto grid size-6 place-items-center rounded-full bg-accent-soft text-[11px] font-medium text-ink"
            >
              {card.assignee.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Columns of cards. Drag a card within or between columns (a long press
 * starts the drag on touch), or use its menu to move it from the keyboard.
 */
export function KanbanBoard({ columns: columnsProp, defaultColumns, onChange: onChangeProp, renderCard, labels, icons, className }: KanbanBoardProps) {
  const [columns, onChange] = useControllable<KanbanColumn[]>(columnsProp, defaultColumns ?? [], onChangeProp);
  const l = { ...kanbanBoardLabels, ...labels };
  const ic = { ...kanbanBoardIcons, ...icons };
  const boardRef = useRef<HTMLDivElement>(null);
  const listRefs = useRef(new Map<string, HTMLDivElement>());
  const cardRefs = useRef(new Map<string, HTMLDivElement>());
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [drag, setDragState] = useState<Drag | null>(null);
  const dragRef = useRef<Drag | null>(null);
  // Window handlers read the ref; rendering reads the state. Both change together.
  const setDrag = (d: Drag | null) => {
    dragRef.current = d;
    setDragState(d);
  };
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const pointer = useRef({ x: 0, y: 0 });
  const columnsRef = useRef(columns);
  useEffect(() => {
    columnsRef.current = columns;
  });

  const focusMenu = (cardId: string) =>
    requestAnimationFrame(() => boardRef.current?.querySelector<HTMLElement>(`[data-card-menu="${CSS.escape(cardId)}"]`)?.focus());

  const target = (px: number, py: number, d: Drag) => {
    let best: { id: string; dist: number } | null = null;
    for (const [id, el] of listRefs.current) {
      const r = el.getBoundingClientRect();
      const dist = px < r.left ? r.left - px : px > r.right ? px - r.right : 0;
      if (!best || dist < best.dist) best = { id, dist };
    }
    if (!best) return { to: d.to, index: d.index };
    const list = listRefs.current.get(best.id)!;
    const top = list.getBoundingClientRect().top;
    const cards = columnsRef.current.find((c) => c.id === best!.id)!.cards.filter((c) => c.id !== d.card.id);
    let index = 0;
    for (let i = 0; i < cards.length; i++) {
      const el = cardRefs.current.get(cards[i].id);
      if (!el) continue;
      // offsetTop ignores the gliding transforms; remove the placeholder's own space if it sits above.
      const shift = best.id === d.to && i >= d.index ? d.height + GAP : 0;
      const mid = top + el.offsetTop - shift + el.offsetHeight / 2;
      if (py > mid) index = i + 1;
    }
    return { to: best.id, index };
  };

  const update = () => {
    const d = dragRef.current;
    if (!d || d.dropping) return;
    x.set(pointer.current.x - d.dx);
    y.set(pointer.current.y - d.dy);
    const t = target(pointer.current.x, pointer.current.y, d);
    if (t.to !== d.to || t.index !== d.index) setDrag({ ...d, ...t });
  };

  useEffect(() => {
    if (!drag || drag.dropping) return;
    let raf = 0;
    const tick = () => {
      const board = boardRef.current;
      if (board) {
        const r = board.getBoundingClientRect();
        const edge = 56;
        const px = pointer.current.x;
        const v = px < r.left + edge ? -(r.left + edge - px) / 4 : px > r.right - edge ? (px - (r.right - edge)) / 4 : 0;
        if (v) {
          board.scrollLeft += v;
          update();
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!drag, drag?.dropping]);

  const startPress = (e: ReactPointerEvent<HTMLDivElement>, card: KanbanCard, col: string, index: number) => {
    if (e.button !== 0 || (e.target as Element).closest("button")) return;
    const el = e.currentTarget;
    const start = { x: e.clientX, y: e.clientY };
    const touch = e.pointerType === "touch";
    let armed = !touch;
    let started = false;
    const timer = touch ? window.setTimeout(() => { armed = true; begin(); }, 260) : 0;

    const begin = () => {
      if (started) return;
      started = true;
      const r = el.getBoundingClientRect();
      const d: Drag = { card, from: col, to: col, index, width: r.width, height: r.height, dx: start.x - r.left, dy: start.y - r.top, dropping: false };
      x.set(r.left);
      y.set(r.top);
      setDrag(d);
    };
    const move = (ev: PointerEvent) => {
      pointer.current = { x: ev.clientX, y: ev.clientY };
      const far = Math.hypot(ev.clientX - start.x, ev.clientY - start.y) > 5;
      if (!started) {
        if (touch && far && !armed) cleanup();
        else if (armed && far) begin();
        return;
      }
      update();
    };
    const blockScroll = (ev: TouchEvent) => started && ev.preventDefault();
    const up = () => {
      cleanup();
      const d = dragRef.current;
      if (!started || !d) return;
      const ph = placeholderRef.current?.getBoundingClientRect();
      const done = () => {
        onChange(moveCard(columnsRef.current, d.card.id, d.to, d.index));
        setDrag(null);
      };
      setDrag({ ...d, dropping: true });
      if (!ph) return done();
      animate(x, ph.left, springFirm);
      animate(y, ph.top, { ...springFirm, onComplete: done });
    };
    const cleanup = () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("touchmove", blockScroll);
    };
    pointer.current = start;
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("touchmove", blockScroll, { passive: false });
  };

  const menuFor = (card: KanbanCard, col: KanbanColumn, index: number): MenuEntry[] => [
    ...columns
      .filter((c) => c.id !== col.id)
      .map((c) => ({
        label: l.moveToColumn(c.title),
        icon: ic.moveToColumn,
        onSelect: () => {
          onChange(moveCard(columns, card.id, c.id, c.cards.length));
          focusMenu(card.id);
        },
      })),
    { type: "separator" },
    { label: l.moveToTop, icon: ic.moveToTop, disabled: index === 0, onSelect: () => { onChange(moveCard(columns, card.id, col.id, 0)); focusMenu(card.id); } },
    { label: l.moveUp, icon: ic.moveUp, disabled: index === 0, onSelect: () => { onChange(moveCard(columns, card.id, col.id, index - 1)); focusMenu(card.id); } },
    { label: l.moveDown, icon: ic.moveDown, disabled: index === col.cards.length - 1, onSelect: () => { onChange(moveCard(columns, card.id, col.id, index + 1)); focusMenu(card.id); } },
  ];

  return (
    <div ref={boardRef} className={cn("flex w-full gap-3 overflow-x-auto pb-2", drag && "select-none", className)}>
      {columns.map((col) => {
        const shown = col.cards.filter((c) => c.id !== drag?.card.id);
        const count = col.cards.length + (drag && drag.to === col.id && drag.from !== col.id ? 1 : 0) - (drag && drag.from === col.id && drag.to !== col.id ? 1 : 0);
        const items: Array<KanbanCard | "placeholder"> = shown.slice();
        if (drag && drag.to === col.id) items.splice(drag.index, 0, "placeholder");
        return (
          <section key={col.id} aria-label={col.title} className="flex min-w-[13.5rem] flex-1 basis-0 flex-col rounded-card bg-raised p-2">
            <header className="flex items-center gap-2 px-1.5 pb-2 pt-1">
              <h3 className="text-sm font-semibold text-ink">{col.title}</h3>
              <SwapText value={String(count)} className="text-sm text-muted tabular">{count}</SwapText>
            </header>
            <div
              ref={(el) => {
                if (el) listRefs.current.set(col.id, el);
                else listRefs.current.delete(col.id);
              }}
              className="relative flex min-h-24 flex-1 flex-col"
              style={{ gap: GAP }}
            >
              {items.map((it) =>
                it === "placeholder" ? (
                  <motion.div
                    key="placeholder"
                    ref={placeholderRef}
                    layout="position"
                    transition={springFirm}
                    aria-hidden
                    className="rounded-card bg-active"
                    style={{ height: drag!.height }}
                  />
                ) : (
                  <motion.div
                    key={it.id}
                    ref={(el) => {
                      if (el) cardRefs.current.set(it.id, el);
                      else cardRefs.current.delete(it.id);
                    }}
                    layout="position"
                    transition={springFirm}
                    onPointerDown={(e) => startPress(e, it, col.id, col.cards.indexOf(it))}
                    className="group relative cursor-grab rounded-card bg-elevated p-3 active:cursor-grabbing"
                    style={{ touchAction: "pan-x pan-y" }}
                  >
                    {renderCard ? renderCard(it) : <DefaultCard card={it} />}
                    <div className="absolute right-1.5 top-1.5">
                      <DropdownMenu
                        label={l.moveCard(it.title)}
                        placement="bottom-end"
                        items={menuFor(it, col, col.cards.indexOf(it))}
                        trigger={({ open, ...p }) => (
                          <button
                            {...p}
                            data-card-menu={it.id}
                            aria-label={l.moveCard(it.title)}
                            className={cn(
                              "grid size-7 place-items-center rounded-control text-muted transition-[opacity,background-color,color] duration-200 hover:bg-active hover:text-ink focus-visible:opacity-100",
                              open ? "bg-active text-ink opacity-100" : "opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100",
                              "[&>svg]:size-4",
                            )}
                          >
                            {ic.more}
                          </button>
                        )}
                      />
                    </div>
                  </motion.div>
                ),
              )}
              {items.length === 0 && (
                <p className="grid flex-1 place-items-center rounded-card px-3 py-6 text-center text-[13px] text-muted">{l.empty}</p>
              )}
            </div>
          </section>
        );
      })}

      {drag &&
        createPortal(
          <motion.div
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-[80] rounded-card bg-elevated p-3 shadow-float"
            style={{ x, y, width: drag.width, height: drag.height }}
            initial={{ scale: 1, rotate: 0 }}
            animate={drag.dropping ? { scale: 1, rotate: 0 } : { scale: 1.03, rotate: 1.5 }}
            transition={drag.dropping ? springFirm : springSoft}
          >
            {renderCard ? renderCard(drag.card) : <DefaultCard card={drag.card} />}
          </motion.div>,
          document.body,
        )}
    </div>
  );
}
