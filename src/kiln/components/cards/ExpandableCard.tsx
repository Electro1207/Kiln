import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "../../cn";
import { fade, springSoft } from "../../motion";

export type ExpandableItem = {
  id: string;
  title: string;
  meta: string;
  image: string;
  alt: string;
  /** Shown only in the opened view. */
  detail: ReactNode;
};

/** Icons used by ExpandableCards. Pass a partial via `icons` to replace any. */
export interface ExpandableCardsIcons {
  /** Close button of the opened card. */
  close: ReactNode;
}
export const expandableCardsIcons: ExpandableCardsIcons = { close: <X /> };

/** Text used by ExpandableCards. Pass a partial via `labels` to translate or reword. */
export interface ExpandableCardsLabels {
  /** aria-label of the close button in the opened view. */
  close: string;
}
export const expandableCardsLabels: ExpandableCardsLabels = { close: "Close" };

/**
 * Cards that grow into a full detail view. The picture, title and frame are
 * shared elements, so the card itself becomes the dialog.
 */
export function ExpandableCards({ items, className, labels, icons }: {
  items: ExpandableItem[];
  className?: string;
  /** Override any UI text. Merged over `expandableCardsLabels`. */
  labels?: Partial<ExpandableCardsLabels>;
  /** Replace any built-in icon. Merged over `expandableCardsIcons`. */
  icons?: Partial<ExpandableCardsIcons>;
}) {
  const l = { ...expandableCardsLabels, ...labels };
  const ic = useMemo(() => ({ ...expandableCardsIcons, ...icons }), [icons]);
  const uid = useId();
  const [openId, setOpenId] = useState<string | null>(null);
  /** The card flying home after a close; it stays above its neighbours until it lands. */
  const [returning, setReturning] = useState<string | null>(null);
  const open = items.find((i) => i.id === openId) ?? null;
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setReturning(openId);
      setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeBtn.current?.focus({ preventScroll: true }), 60);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [openId]);

  const close = () => {
    const id = openId;
    setReturning(id);
    setOpenId(null);
    if (id) requestAnimationFrame(() => triggers.current.get(id)?.focus({ preventScroll: true }));
  };

  return (
    <LayoutGroup id={uid}>
      <ul className={cn("grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {items.map((item) => (
          <li key={item.id} className={cn("relative min-w-0", (openId === item.id || returning === item.id) && "z-[1]")}>
            <motion.button
              ref={(el) => {
                if (el) triggers.current.set(item.id, el);
              }}
              type="button"
              layoutId={`card-${item.id}`}
              onClick={() => setOpenId(item.id)}
              onLayoutAnimationComplete={() => setReturning((r) => (r === item.id ? null : r))}
              whileTap={{ scale: 0.98 }}
              transition={springSoft}
              style={{ borderRadius: 14 }}
              className="block w-full overflow-hidden border border-line bg-surface text-left"
              aria-haspopup="dialog"
            >
              <motion.div layoutId={`img-${item.id}`} transition={springSoft} className="aspect-[16/10] overflow-hidden bg-raised">
                <img decoding="async" src={item.image} alt={item.alt} width={640} height={400} className="size-full object-cover" loading="lazy" />
              </motion.div>
              <div className="p-4">
                <motion.span layoutId={`meta-${item.id}`} layout="position" transition={springSoft} className="block text-xs text-muted">
                  {item.meta}
                </motion.span>
                <motion.span layoutId={`title-${item.id}`} layout="position" transition={springSoft} className="mt-0.5 block font-semibold text-ink">
                  {item.title}
                </motion.span>
              </div>
            </motion.button>
          </li>
        ))}
      </ul>

      {createPortal(
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                key="scrim"
                className="fixed inset-0 z-[60] bg-scrim"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={fade}
                onClick={close}
              />
              <div key="frame" className="pointer-events-none fixed inset-0 z-[61] grid place-items-center overflow-y-auto p-4">
                <motion.div
                  layoutId={`card-${open.id}`}
                  transition={springSoft}
                  style={{ borderRadius: 22 }}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={`${uid}-${open.id}-t`}
                  className="pointer-events-auto relative w-full max-w-xl overflow-hidden bg-surface shadow-float"
                >
                  <motion.div layoutId={`img-${open.id}`} transition={springSoft} className="aspect-[16/10] overflow-hidden bg-raised">
                    <img decoding="async" src={open.image} alt={open.alt} width={1120} height={700} className="size-full object-cover" />
                  </motion.div>
                  <motion.button
                    ref={closeBtn}
                    layout="position"
                    type="button"
                    onClick={close}
                    aria-label={l.close}
                    className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-surface text-ink [&>svg]:size-4"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1, transition: { delay: 0.15, ...springSoft } }}
                    exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.12 } }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {ic.close}
                  </motion.button>
                  <div className="p-6">
                    <motion.span layoutId={`meta-${open.id}`} layout="position" transition={springSoft} className="block text-xs text-muted">
                      {open.meta}
                    </motion.span>
                    <motion.span
                      id={`${uid}-${open.id}-t`}
                      layoutId={`title-${open.id}`}
                      layout="position"
                      transition={springSoft}
                      className="mt-0.5 block font-semibold text-ink"
                    >
                      {open.title}
                    </motion.span>
                    <motion.div
                      layout="position"
                      className="mt-4 text-sm text-ink"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.12, ...springSoft } }}
                      exit={{ opacity: 0, y: 6, transition: { duration: 0.1 } }}
                    >
                      {open.detail}
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </LayoutGroup>
  );
}
