import { type ReactNode } from "react";
import { cn } from "../../cn";
import { hueFor, initials } from "../data-display/Avatar";

export type TeamLink = { label: string; href: string; icon: ReactNode };
export type TeamMember = { name: string; role: string; bio?: string; links?: TeamLink[] };

export type TeamGridProps = {
  title: ReactNode;
  description?: ReactNode;
  people: TeamMember[];
  className?: string;
};

/**
 * People with their roles. Each portrait is a tinted tile with initials, so the
 * grid needs no photographs. Links rise into view on hover or focus, and are
 * always shown on touch screens.
 */
export function TeamGrid({ title, description, people, className }: TeamGridProps) {
  return (
    <section className={cn("@container w-full", className)}>
      <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink text-balance @2xl:text-[1.75rem]">{title}</h2>
      {description && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink">{description}</p>}
      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 @2xl:grid-cols-3 @4xl:grid-cols-4">
        {people.map((p) => {
          const hue = hueFor(p.name);
          return (
            <li key={p.name} className="group/person min-w-0">
              <div
                className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-card"
                style={{ backgroundColor: `light-dark(hsl(${hue} 50% 90%), hsl(${hue} 25% 22%))` }}
              >
                <span
                  aria-hidden
                  className="text-4xl font-semibold tracking-[-0.03em] @2xl:text-5xl"
                  style={{ color: `light-dark(hsl(${hue} 40% 32%), hsl(${hue} 55% 80%))` }}
                >
                  {initials(p.name)}
                </span>
                {p.links && p.links.length > 0 && (
                  <ul
                    className={cn(
                      "absolute inset-x-3 bottom-3 flex justify-center gap-1.5",
                      "transition-[opacity,transform] duration-300 ease-out-soft",
                      "[@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0",
                      "[@media(hover:hover)]:group-hover/person:translate-y-0 [@media(hover:hover)]:group-hover/person:opacity-100",
                      "[@media(hover:hover)]:group-focus-within/person:translate-y-0 [@media(hover:hover)]:group-focus-within/person:opacity-100",
                    )}
                  >
                    {p.links.map((l) => (
                      <li key={l.label}>
                        <a
                          href={l.href}
                          aria-label={`${l.label}: ${p.name}`}
                          className="grid size-9 place-items-center rounded-full bg-surface text-ink transition-colors duration-200 hover:bg-raised [&>svg]:size-4"
                        >
                          {l.icon}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <p className="mt-3 truncate text-[15px] font-medium text-ink">{p.name}</p>
              <p className="truncate text-sm text-muted">{p.role}</p>
              {p.bio && <p className="mt-2 hidden text-sm leading-relaxed text-ink @2xl:block">{p.bio}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
