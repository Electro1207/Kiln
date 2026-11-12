import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { staggerChild, staggerParent } from "../../motion";

export type GridListAction = { label: string; icon: ReactNode; href?: string; onSelect?: () => void };

export type PersonCard = {
  id: string;
  name: string;
  role: string;
  /** A picture or an <Avatar>. */
  avatar: ReactNode;
  badge?: ReactNode;
  /** Shown as a split footer, two at most. */
  actions?: GridListAction[];
};

/**
 * People as cards in a responsive grid, each with a split footer of actions
 * (email, call). Cards rise in once as the grid comes into view.
 */
export function PeopleGrid({ people, className }: { people: PersonCard[]; className?: string }) {
  return (
    <div className={cn("@container w-full", className)}>
    <motion.ul
      className="grid w-full grid-cols-1 gap-4 @lg:grid-cols-2 @3xl:grid-cols-3"
      variants={staggerParent}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {people.map((p) => (
        <motion.li key={p.id} variants={staggerChild} className="flex flex-col overflow-hidden rounded-card border border-line bg-surface">
          <div className="flex flex-1 flex-col items-center gap-1 px-5 pb-5 pt-7 text-center">
            <div className="mb-3">{p.avatar}</div>
            <h3 className="text-[15px] font-semibold text-ink">{p.name}</h3>
            <p className="text-[13px] text-muted">{p.role}</p>
            {p.badge && <div className="mt-2">{p.badge}</div>}
          </div>
          {p.actions && p.actions.length > 0 && (
            <div className="grid border-t border-line" style={{ gridTemplateColumns: `repeat(${p.actions.length}, minmax(0, 1fr))` }}>
              {p.actions.map((a, i) => {
                const cls = cn(
                  "flex h-11 items-center justify-center gap-2 text-sm font-medium text-ink transition-colors duration-200 hover:bg-raised [&>svg]:size-4 [&>svg]:text-muted",
                  i > 0 && "border-l border-line",
                );
                return a.href ? (
                  <a key={a.label} href={a.href} className={cls} aria-label={`${a.label} ${p.name}`}>
                    {a.icon}
                    {a.label}
                  </a>
                ) : (
                  <button key={a.label} type="button" onClick={a.onSelect} className={cls} aria-label={`${a.label} ${p.name}`}>
                    {a.icon}
                    {a.label}
                  </button>
                );
              })}
            </div>
          )}
        </motion.li>
      ))}
    </motion.ul>
    </div>
  );
}

export type ProjectTile = {
  id: string;
  name: string;
  meta: ReactNode;
  /** Two letters for the tile. */
  initials: string;
  /** A hue (0–360) for the tile: identity, not data. */
  hue: number;
  menu?: ReactNode;
  href?: string;
};

/** Projects as compact tiles: a coloured initials block, the name and a line of meta. */
export function ProjectGrid({ projects, className }: { projects: ProjectTile[]; className?: string }) {
  return (
    <div className={cn("@container w-full", className)}>
    <motion.ul
      className="grid w-full grid-cols-1 gap-3 @lg:grid-cols-2 @4xl:grid-cols-4"
      variants={staggerParent}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {projects.map((p) => (
        <motion.li key={p.id} variants={staggerChild} className="flex min-w-0 overflow-hidden rounded-card border border-line bg-surface">
          <span
            aria-hidden
            className="grid w-14 shrink-0 place-items-center text-sm font-semibold"
            style={{
              backgroundColor: `light-dark(hsl(${p.hue} 55% 90%), hsl(${p.hue} 30% 22%))`,
              color: `light-dark(hsl(${p.hue} 45% 28%), hsl(${p.hue} 55% 82%))`,
            }}
          >
            {p.initials}
          </span>
          <div className="flex min-w-0 flex-1 items-center gap-2 py-3 pl-4 pr-2">
            <div className="min-w-0 flex-1">
              {p.href ? (
                <a href={p.href} className="block truncate text-sm font-medium text-ink hover:underline">
                  {p.name}
                </a>
              ) : (
                <p className="truncate text-sm font-medium text-ink">{p.name}</p>
              )}
              <p className="truncate text-[13px] text-muted">{p.meta}</p>
            </div>
            {p.menu}
          </div>
        </motion.li>
      ))}
    </motion.ul>
    </div>
  );
}
