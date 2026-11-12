import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { fade } from "../../motion";
import { Avatar } from "../data-display/Avatar";

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readMinutes: number;
  author: string;
  href: string;
  cover?: string;
  coverAlt?: string;
  /** A drawn cover instead of a photograph. */
  art?: ReactNode;
};

/** Text used by BlogList. Pass a partial via `labels` to translate or reword. */
export interface BlogListLabels {
  /** "5 min read" text. */
  minRead: (minutes: number) => string;
}
export const blogListLabels: BlogListLabels = { minRead: (m) => `${m} min read` };

export type BlogListProps = {
  title: ReactNode; description?: ReactNode; posts: BlogPost[];
  /** Override any UI text. Merged over `blogListLabels`. */
  labels?: Partial<BlogListLabels>;
  className?: string;
};

function Cover({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-card bg-raised">
      <motion.img decoding="async"
        src={src}
        alt={alt}
        loading="lazy"
        width={800}
        height={500}
        onLoad={() => setLoaded(true)}
        initial={false}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={fade}
        className="size-full object-cover transition-transform duration-500 ease-out-soft group-hover/post:scale-[1.03]"
      />
    </div>
  );
}

/** A grid of articles: cover, category, title, a line of summary and the author. */
export function BlogList({ title, description, posts, labels, className }: BlogListProps) {
  const l = { ...blogListLabels, ...labels };
  return (
    <section className={cn("@container w-full", className)}>
      <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink text-balance @2xl:text-[1.75rem]">{title}</h2>
      {description && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink">{description}</p>}
      <div className="mt-8 grid gap-x-6 gap-y-10 @2xl:grid-cols-2 @4xl:grid-cols-3">
        {posts.map((p) => (
          <article key={p.id} className="group/post relative flex flex-col">
            {p.cover ? (
              <Cover src={p.cover} alt={p.coverAlt ?? ""} />
            ) : p.art ? (
              <div aria-hidden className="aspect-[16/10] overflow-hidden rounded-card">
                <div className="size-full transition-transform duration-500 ease-out-soft group-hover/post:scale-[1.03]">{p.art}</div>
              </div>
            ) : null}
            <p className={cn("flex items-center gap-2 text-[13px] text-muted", !!(p.cover || p.art) && "mt-4")}>
              <span className="text-accent">{p.category}</span>
              <span aria-hidden>·</span>
              <time className="tabular">{p.date}</time>
              <span aria-hidden>·</span>
              <span className="tabular">{l.minRead(p.readMinutes)}</span>
            </p>
            <h3 className="mt-2 text-lg font-semibold leading-snug tracking-[-0.01em] text-ink">
              <a href={p.href} className="after:absolute after:inset-0 after:rounded-card group-hover/post:underline group-hover/post:underline-offset-4">
                {p.title}
              </a>
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink">{p.excerpt}</p>
            <p className="mt-4 flex items-center gap-2.5 text-sm text-ink">
              <Avatar name={p.author} size="sm" />
              {p.author}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
