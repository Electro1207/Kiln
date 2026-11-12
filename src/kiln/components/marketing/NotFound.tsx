import { type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../../cn";

/** Text used by NotFound. Pass a partial via `labels` to translate or reword. */
export interface NotFoundLabels {
  /** aria-label of the suggestions nav. */
  popularPages: string;
}
export const notFoundLabels: NotFoundLabels = { popularPages: "Popular pages" };

export type NotFoundProps = {
  code?: string;
  title: ReactNode;
  body?: ReactNode;
  actions?: ReactNode;
  /** Places people usually look for instead. */
  suggestions?: { label: string; description?: string; href: string }[];
  /** Override any UI text. Merged over `notFoundLabels`. */
  labels?: Partial<NotFoundLabels>;
  className?: string;
};

/** A 404 block: the code set large, a plain sentence, a way back, and likely destinations. */
export function NotFound({ code = "404", title, body, actions, suggestions, labels, className }: NotFoundProps) {
  const l = { ...notFoundLabels, ...labels };
  return (
    <section className={cn("@container w-full", className)}>
      <div className="grid gap-10 @4xl:grid-cols-2 @4xl:items-center">
        <div>
          <p aria-hidden className="text-[5.5rem] font-semibold leading-none tracking-[-0.05em] text-ink @2xl:text-[8rem]">{code}</p>
          <h1 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-ink text-balance @2xl:text-3xl">{title}</h1>
          {body && <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink">{body}</p>}
          {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
        </div>
        {suggestions && suggestions.length > 0 && (
          <nav aria-label={l.popularPages}>
            <ul className="flex flex-col gap-2">
              {suggestions.map((s) => (
                <li key={s.href}>
                  <a href={s.href} className="group/s flex items-center gap-4 rounded-card bg-surface p-4 transition-colors duration-200 hover:bg-active">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-medium text-ink">{s.label}</span>
                      {s.description && <span className="mt-0.5 block text-sm text-muted">{s.description}</span>}
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-muted transition-transform duration-300 ease-out-soft group-hover/s:translate-x-1" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </section>
  );
}
