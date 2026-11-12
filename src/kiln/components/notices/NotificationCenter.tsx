import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AtSign, BellOff, Inbox } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade, springFirm, springSoft } from "../../motion";
import { Avatar } from "../data-display/Avatar";
import { NotificationBell } from "./NotificationBell";
import { Popover } from "../overlays/Popover";

export type Notice = {
  id: string;
  /** Who did it. */
  actor: string;
  /** What happened, after the actor's name: "replied to your plan". */
  text: string;
  /** Shown under the text: "4 min", "Yesterday". */
  time: string;
  unread: boolean;
  /** Counts under Mentions. */
  mention?: boolean;
};

/** Text used by NotificationCenter. Pass a partial via `labels` to translate or reword. */
export interface NotificationCenterLabels {
  /** Popover label, bell label and inbox heading. */
  notifications: string;
  /** aria-label of the bell when there are unread notices. */
  bellUnread: (count: number) => string;
  /** "Mark all read" button. */
  markAllRead: string;
  /** aria-label of the tab list. */
  filters: string;
  /** All tab. */
  all: string;
  /** Unread tab. */
  unread: string;
  /** Mentions tab. */
  mentions: string;
  /** aria-label of the mention icon on a row. */
  mention: string;
  /** Screen-reader text on an unread row. */
  rowUnread: string;
  /** Screen-reader text on a read row. */
  rowRead: string;
  /** Empty-state title under Mentions. */
  emptyMentions: string;
  /** Empty-state title under Unread. */
  emptyUnread: string;
  /** Empty-state title under All. */
  emptyAll: string;
  /** Empty-state text under Unread. */
  emptyUnreadBody: string;
  /** Empty-state text under All and Mentions. */
  emptyBody: string;
}
export const notificationCenterLabels: NotificationCenterLabels = {
  notifications: "Notifications",
  bellUnread: (n) => `Notifications, ${n} unread`,
  markAllRead: "Mark all read",
  filters: "Notification filters",
  all: "All",
  unread: "Unread",
  mentions: "Mentions",
  mention: "Mention",
  rowUnread: "Unread",
  rowRead: "Read",
  emptyMentions: "No one has mentioned you",
  emptyUnread: "You’re all caught up",
  emptyAll: "Nothing here yet",
  emptyUnreadBody: "New notices land here until you open them.",
  emptyBody: "When someone needs you, it shows up here.",
};

export type NotificationCenterProps = {
  items: Notice[];
  onItemsChange: (items: Notice[]) => void;
  /** Called when a notice is opened (it is marked read first). */
  onOpen?: (n: Notice) => void;
  side?: "bottom" | "top";
  align?: "start" | "center" | "end";
  /** Override any UI text. Merged over `notificationCenterLabels`. */
  labels?: Partial<NotificationCenterLabels>;
};

type TabId = "all" | "unread" | "mentions";

/**
 * A bell that opens an inbox: All, Unread and Mentions. Opening a notice marks
 * it read, so its dot and weight fade; under Unread it then folds away.
 */
export function NotificationCenter({ items, onItemsChange, onOpen, side = "bottom", align = "end", labels }: NotificationCenterProps) {
  const l = { ...notificationCenterLabels, ...labels };
  const unread = items.filter((n) => n.unread).length;
  return (
    <Popover
      bare
      label={l.notifications}
      side={side}
      align={align}
      trigger={<NotificationBell count={unread} labels={{ notifications: l.notifications, unread: l.bellUnread }} />}
    >
      <Inboxes items={items} onItemsChange={onItemsChange} onOpen={onOpen} l={l} />
    </Popover>
  );
}

function Inboxes({ items, onItemsChange, onOpen, l }: Pick<NotificationCenterProps, "items" | "onItemsChange" | "onOpen"> & { l: NotificationCenterLabels }) {
  const [tab, setTab] = useState<TabId>("all");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const unread = items.filter((n) => n.unread).length;
  const tabs: Array<{ id: TabId; label: string; count?: number }> = [
    { id: "all", label: l.all },
    { id: "unread", label: l.unread, count: unread },
    { id: "mentions", label: l.mentions },
  ];
  const shown = items.filter((n) => (tab === "unread" ? n.unread : tab === "mentions" ? n.mention : true));

  const markRead = (id: string) => onItemsChange(items.map((n) => (n.id === id ? { ...n, unread: false } : n)));

  return (
    <div className="flex w-[380px] max-w-[calc(100vw-16px)] flex-col">
      <div className="flex items-center justify-between px-4 pb-1 pt-3.5">
        <h2 className="text-[15px] font-semibold leading-6">{l.notifications}</h2>
        <button
          type="button"
          disabled={unread === 0}
          onClick={() => onItemsChange(items.map((n) => ({ ...n, unread: false })))}
          className="h-7 rounded-[6px] px-2 text-[13px] font-medium text-accent transition-[color,background-color,opacity] hover:bg-raised disabled:pointer-events-none disabled:opacity-40"
        >
          {l.markAllRead}
        </button>
      </div>

      <div role="tablist" aria-label={l.filters} className="relative flex gap-1 border-b border-line px-2.5">
        {tabs.map((t) => {
          const selected = tab === t.id;
          return (
            <button
              key={t.id}
              ref={(el) => { tabRefs.current[t.id] = el; }}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(t.id)}
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                const i = tabs.findIndex((x) => x.id === tab);
                const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
                setTab(next.id);
                (e.currentTarget.parentElement?.children[tabs.indexOf(next)] as HTMLElement | undefined)?.focus();
              }}
              className={cn(
                "relative h-10 px-1.5 text-[13px] font-medium outline-offset-[-2px] transition-colors duration-200",
                selected ? "text-ink" : "text-muted hover:text-ink",
              )}
            >
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-ink"
                initial={false}
                animate={{ opacity: selected ? 1 : 0 }}
                transition={fade}
              />
              <span className="relative z-[1] inline-flex items-center gap-1.5">
                {t.label}
                {t.count !== undefined && (
                  <span
                    className={cn(
                      "tabular inline-grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[11px] leading-none transition-[opacity,background-color,color] duration-300",
                      t.count === 0 && "opacity-0",
                      selected ? "bg-btn-primary text-btn-primary-ink" : "bg-raised text-muted",
                    )}
                  >
                    {t.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" aria-label={tabs.find((t) => t.id === tab)?.label} className="h-[min(360px,60vh)] overflow-y-auto overscroll-contain">
        <motion.ul key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={fade} className="py-1">
          <AnimatePresence initial={false}>
            {shown.map((n) => (
              <motion.li
                key={n.id}
                exit={{ height: 0, opacity: 0, transition: { height: { ...springFirm, delay: 0.08 }, opacity: { duration: 0.14, ease: easeOut } } }}
                className="overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (n.unread) markRead(n.id);
                    onOpen?.(n);
                  }}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-raised"
                >
                  <Avatar name={n.actor} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-[13.5px] leading-5 transition-colors duration-300", n.unread ? "text-ink" : "text-muted")}>
                      <span className={cn("font-semibold transition-colors duration-300", n.unread ? "text-ink" : "text-ink/80")}>{n.actor}</span> {n.text}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-xs leading-4 text-faint">
                      {n.mention && <AtSign className="size-3" aria-label={l.mention} />}
                      {n.time}
                    </span>
                  </span>
                  <span className="grid h-5 w-2 shrink-0 place-items-center" aria-hidden>
                    <motion.span
                      className="size-2 rounded-full bg-accent"
                      initial={false}
                      animate={{ opacity: n.unread ? 1 : 0 }}
                      transition={fade}
                    />
                  </span>
                  <span className="sr-only">{n.unread ? l.rowUnread : l.rowRead}</span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
        <AnimatePresence>
          {shown.length === 0 && (
            <motion.div
              key={`empty-${tab}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0, transition: { ...springSoft, delay: 0.18 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="flex flex-col items-center px-8 pb-10 pt-12 text-center"
            >
              <span className="mb-3 grid size-11 place-items-center rounded-full bg-raised text-muted">
                {tab === "mentions" ? <AtSign className="size-5" /> : tab === "unread" ? <Inbox className="size-5" /> : <BellOff className="size-5" />}
              </span>
              <p className="text-sm font-semibold">{tab === "mentions" ? l.emptyMentions : tab === "unread" ? l.emptyUnread : l.emptyAll}</p>
              <p className="mt-1 text-[13px] text-muted">
                {tab === "unread" ? l.emptyUnreadBody : l.emptyBody}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
