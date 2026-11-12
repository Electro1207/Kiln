import { type ReactNode, useMemo } from "react";
import { motion } from "motion/react";
import { Check, Minus } from "lucide-react";
import { cn } from "../../cn";
import { fade } from "../../motion";

export type PrefChannel = { id: string; label: string; icon?: ReactNode };
export type PrefEvent = { id: string; label: string; description?: string };
export type PrefGroup = { label: string; events: PrefEvent[] };
/** value[eventId][channelId] = on */
export type PrefValue = Record<string, Record<string, boolean>>;

/** Icons used by NotificationPreferences. Pass a partial via `icons` to swap any of them. */
export interface NotificationPreferencesIcons {
  /** The tick in a switched-on box. */
  check: ReactNode;
  /** The dash in a box that is on for some rows only. */
  mixed: ReactNode;
}
export const notificationPreferencesIcons: NotificationPreferencesIcons = { check: <Check />, mixed: <Minus /> };

export type NotificationPreferencesProps = {
  channels: PrefChannel[];
  groups: PrefGroup[];
  value: PrefValue;
  onChange: (v: PrefValue) => void;
  /** Override any UI text. Merged over `notificationPreferencesLabels`. */
  labels?: Partial<NotificationPreferencesLabels>;
  /** Replace any built-in icon. Merged over `notificationPreferencesIcons`. */
  icons?: Partial<NotificationPreferencesIcons>;
  className?: string;
};

/** Text used by NotificationPreferences. Pass a partial via `labels` to translate or reword. */
export interface NotificationPreferencesLabels {
  /** Heading of the event column. */
  event: string;
  /** Heading of the per-row select-all column. */
  all: string;
  /** aria-label of a channel's select-all box. */
  allEventsBy: (channel: string) => string;
  /** aria-label of one event-by-channel box. */
  eventBy: (event: string, channel: string) => string;
  /** aria-label of an event's select-all box. */
  eventOnEveryChannel: (event: string) => string;
}
export const notificationPreferencesLabels: NotificationPreferencesLabels = {
  event: "Event",
  all: "All",
  allEventsBy: (c) => `All events by ${c}`,
  eventBy: (e, c) => `${e} by ${c}`,
  eventOnEveryChannel: (e) => `${e} on every channel`,
};

type Mark = boolean | "mixed";

/** A small box: filled with a tick when on, a dash when some of a row or column is on. */
function Box({ mark, label, onToggle, icons, size = "md" }: { icons: NotificationPreferencesIcons; mark: Mark; label: string; onToggle: () => void; size?: "md" | "sm" }) {
  const on = mark === true;
  const mixed = mark === "mixed";
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={mixed ? "mixed" : on}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        "relative grid shrink-0 place-items-center rounded-[5px] border outline-offset-2 [&>*]:[grid-area:1/1]",
        "transition-[background-color,border-color] duration-150",
        size === "md" ? "size-[18px]" : "size-4",
        "text-btn-primary-ink", on || mixed ? "border-transparent bg-btn-primary" : "border-line-strong bg-surface hover:border-faint",
      )}
    >
      <motion.span initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className={cn("grid [&>svg]:[stroke-width:3.25]", size === "md" ? "[&>svg]:size-3" : "[&>svg]:size-2.5")}>
        {icons.check}
      </motion.span>
      <motion.span initial={false} animate={{ opacity: mixed ? 1 : 0 }} transition={fade} className={cn("grid [&>svg]:[stroke-width:3.25]", size === "md" ? "[&>svg]:size-3" : "[&>svg]:size-2.5")}>
        {icons.mixed}
      </motion.span>
    </button>
  );
}

const markOf = (vals: boolean[]): Mark => (vals.every(Boolean) ? true : vals.some(Boolean) ? "mixed" : false);

/**
 * Which events reach which channels. Each row and each column has its own
 * select-all. On a narrow screen each event becomes a card with its channels
 * in a row.
 */
export function NotificationPreferences({ channels, groups, value, onChange, labels, icons, className }: NotificationPreferencesProps) {
  const l = { ...notificationPreferencesLabels, ...labels };
  const ic = useMemo(() => ({ ...notificationPreferencesIcons, ...icons }), [icons]);
  const events = groups.flatMap((g) => g.events);
  const get = (e: string, c: string) => !!value[e]?.[c];

  const setCells = (cells: Array<[string, string]>, on: boolean) => {
    const next: PrefValue = { ...value };
    for (const [e, c] of cells) next[e] = { ...next[e], [c]: on };
    onChange(next);
  };
  const toggleRow = (e: string) => {
    const on = markOf(channels.map((c) => get(e, c.id))) !== true;
    setCells(channels.map((c) => [e, c.id]), on);
  };
  const toggleCol = (c: string) => {
    const on = markOf(events.map((e) => get(e.id, c))) !== true;
    setCells(events.map((e) => [e.id, c]), on);
  };

  return (
    <div className={cn("@container w-full", className)}>
      <div className="hidden overflow-hidden rounded-card bg-surface @2xl:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="px-5 py-3 text-left font-medium text-muted">{l.event}</th>
              {channels.map((c) => (
                <th key={c.id} scope="col" className="w-28 px-3 py-3 font-medium text-ink">
                  <div className="flex flex-col items-center gap-2">
                    <span className="flex items-center gap-1.5 [&>svg]:size-4 [&>svg]:text-muted">
                      {c.icon}
                      {c.label}
                    </span>
                    <Box icons={ic} size="sm" mark={markOf(events.map((e) => get(e.id, c.id)))} label={l.allEventsBy(c.label)} onToggle={() => toggleCol(c.id)} />
                  </div>
                </th>
              ))}
              <th scope="col" className="w-20 px-3 py-3 text-center font-medium text-muted">{l.all}</th>
            </tr>
          </thead>
          {groups.map((g) => (
            <tbody key={g.label}>
              <tr>
                <th colSpan={channels.length + 2} scope="colgroup" className="bg-raised/60 px-5 py-2 text-left text-xs font-medium text-muted">
                  {g.label}
                </th>
              </tr>
              {g.events.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-b-0 transition-colors hover:bg-raised/40">
                  <th scope="row" className="px-5 py-3.5 text-left font-normal">
                    <span className="block text-ink">{e.label}</span>
                    {e.description && <span className="block text-[13px] text-muted">{e.description}</span>}
                  </th>
                  {channels.map((c) => (
                    <td key={c.id} className="px-3 py-3.5">
                      <div className="grid place-items-center">
                        <Box icons={ic} mark={get(e.id, c.id)} label={l.eventBy(e.label, c.label)} onToggle={() => setCells([[e.id, c.id]], !get(e.id, c.id))} />
                      </div>
                    </td>
                  ))}
                  <td className="px-3 py-3.5">
                    <div className="grid place-items-center">
                      <Box icons={ic} size="sm" mark={markOf(channels.map((c) => get(e.id, c.id)))} label={l.eventOnEveryChannel(e.label)} onToggle={() => toggleRow(e.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>

      <div className="flex flex-col gap-4 @2xl:hidden">
        {groups.map((g) => (
          <section key={g.label} className="flex flex-col gap-2">
            <h3 className="px-1 text-xs font-medium text-muted">{g.label}</h3>
            {g.events.map((e) => (
              <div key={e.id} className="rounded-card bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-sm text-ink">{e.label}</span>
                    {e.description && <span className="block text-[13px] text-muted">{e.description}</span>}
                  </span>
                  <Box icons={ic} size="sm" mark={markOf(channels.map((c) => get(e.id, c.id)))} label={l.eventOnEveryChannel(e.label)} onToggle={() => toggleRow(e.id)} />
                </div>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                  {channels.map((c) => (
                    <label key={c.id} className="flex items-center gap-2 text-[13px] text-ink">
                      <Box icons={ic} mark={get(e.id, c.id)} label={l.eventBy(e.label, c.label)} onToggle={() => setCells([[e.id, c.id]], !get(e.id, c.id))} />
                      {c.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
