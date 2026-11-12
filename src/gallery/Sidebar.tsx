import { memo, useMemo, type ReactNode } from "react";
import { motion } from "motion/react";
import { Info, LayoutGrid, Palette } from "lucide-react";
import { categories, sections } from "./registry";
import { href, type Route } from "./useRoute";
import { Mark } from "./Mark";
import { DocsNav, type DocsNavSection } from "../kiln/components/menus/DocsNav";
import { ThemeSwitcher } from "../kiln/components/primitives/ThemeToggle";
import { cn } from "../kiln/cn";
import { fade } from "../kiln/motion";

type Props = {
  route: Route;
  activeEntry?: string;
  onNavigate: (r: Route) => void;
  /** The phone drawer brings its own title row. */
  brand?: boolean;
};

const total = categories.reduce((n, c) => n + c.entries.length, 0);

export const Sidebar = memo(function Sidebar({ route, activeEntry, onNavigate, brand = true }: Props) {
  const nav = useMemo<DocsNavSection[]>(
    () => [
      { id: "start", groups: [{ id: "overview", label: "Overview", href: "#/", icon: <LayoutGrid /> }] },
      ...sections.map((s) => ({
        id: s.id,
        label: s.name,
        groups: s.groups.map((g) => ({
          id: g.id,
          label: g.name,
          href: href({ page: "category", category: g.id }),
          items: g.entries.map((e) => ({ id: e.id, label: e.name, keywords: e.summary, href: href({ page: "category", category: g.id, entry: e.id }) })),
        })),
      })),
    ],
    [],
  );

  const value =
    route.page === "overview" ? "overview" : route.page === "category" ? (activeEntry ?? route.category) : route.page;
  return (
    <DocsNav
      aria-label="Components"
      sections={nav}
      value={value}
      groupClick="toggle"
      storageKey="kiln-nav-open"
      placeholder="Filter components"
      emptyText={<>No component by that name. Try the search, <span className="text-ink">Ctrl K</span>.</>}
      onSelect={(id, group) => {
        if (id === "overview") onNavigate({ page: "overview" });
        else if (id === group) onNavigate({ page: "category", category: group });
        else onNavigate({ page: "category", category: group, entry: id });
      }}
      header={
        brand ? (
          <a href="#/" onClick={(e) => { e.preventDefault(); onNavigate({ page: "overview" }); }} className="flex h-12 shrink-0 items-center gap-2.5 px-5">
            <Mark />
            <span className="text-[15px] font-semibold tracking-[-0.01em]">Kiln</span>
            <span className="text-[13px] text-muted tabular">{total} components</span>
          </a>
        ) : undefined
      }
      footer={
        <div className="space-y-2">
          <div>
            <FooterLink on={route.page === "about"} href="#/about" icon={<Info />} onClick={() => onNavigate({ page: "about" })}>About Kiln</FooterLink>
            <FooterLink on={route.page === "studio"} href="#/studio" icon={<Palette />} onClick={() => onNavigate({ page: "studio" })}>Theme studio</FooterLink>
          </div>
          <ThemeSwitcher className="w-full [&>button]:flex-1 [&>button]:px-0" />
        </div>
      }
    />
  );
});

function FooterLink({ on, href, icon, onClick, children }: { on: boolean; href: string; icon: ReactNode; onClick: () => void; children: ReactNode }) {
  return (
    <a
      href={href}
      onClick={(e) => { e.preventDefault(); onClick(); }}
      aria-current={on ? "page" : undefined}
      className={cn(
        "relative flex h-9 items-center gap-2.5 rounded-control px-3 text-[14px] transition-colors duration-200",
        on ? "font-medium text-ink" : "text-muted hover:bg-raised hover:text-ink",
      )}
    >
      <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="pointer-events-none absolute inset-0 bg-active" style={{ borderRadius: 8 }} />
      <span className="relative z-[1] inline-flex [&>svg]:size-4">{icon}</span>
      <span className="relative z-[1] flex-1">{children}</span>
    </a>
  );
}
