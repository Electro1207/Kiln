import { memo, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Lightbulb, Menu, Palette, Search } from "lucide-react";
import { categories } from "./registry";
import { useRoute, type Route } from "./useRoute";
import { usePageMeta } from "./seo";
import { StudioProvider } from "./studio/store";
import { ThemeStudio } from "./studio/ThemeStudio";
import { About } from "./About";
import { Legal } from "./Legal";
import { WhatsNew } from "./WhatsNew";
import { Overview } from "./Overview";
import { CategoryPage } from "./CategoryPage";
import { Sidebar } from "./Sidebar";
import { Mark } from "./Mark";
import { GitHubMark } from "./GitHubMark";
import { KILN_LINKS, KILN_REPO } from "./site";
import { ThemeToggle } from "../kiln/components/primitives/ThemeToggle";
import { IconButton } from "../kiln/components/buttons/IconButton";
import { Tooltip } from "../kiln/components/overlays/Tooltip";
import { Drawer } from "../kiln/components/overlays/Drawer";
import { Kbd } from "../kiln/components/data-display/Kbd";
import { CommandPalette, useCommandShortcut, type CommandItem } from "../kiln/components/menus/CommandPalette";
import { useThemeActions } from "../kiln/theme";
import { easeOut } from "../kiln/motion";

const CREDITS = [
  { text: "“Medalta Potteries kilns” by Grapher78, CC BY 3.0", page: "https://commons.wikimedia.org/w/index.php?curid=17302609" },
  { text: "“Pottery kiln, Eretria” by Jebulon, CC0", page: "https://commons.wikimedia.org/w/index.php?curid=50619857" },
  { text: "“Pottery kiln found at Jinsha” by Gary Todd, CC0", page: "https://commons.wikimedia.org/w/index.php?curid=106134506" },
  { text: "“Vase” by John Worthwood, Josiah Wedgwood & Sons, CC BY 4.0", page: "https://commons.wikimedia.org/w/index.php?curid=65676750" },
  { text: "“Vase, Mougin, Lunéville” by Chaanara, CC BY 3.0", page: "https://commons.wikimedia.org/w/index.php?curid=38527160" },
  { text: "“Big Buck Bunny” by the Blender Foundation, CC BY 3.0 (modified: trimmed to 40 s, resized to 360p, 480p and 720p, re-encoded; captions and preview frames added)", page: "https://commons.wikimedia.org/wiki/File:Big_Buck_Bunny_4K.webm" },
  { text: "“Teapot”, British, ca. 1765, The Metropolitan Museum of Art (Open Access), CC0 (cropped and resized)", page: "https://www.metmuseum.org/art/collection/search/8346" },
];

/* The active entry lives outside React state. Setting state in Shell on every scroll-spy change
   re-rendered AnimatePresence, whose new presence context re-rendered every motion component on
   the page (15-20 ms a change). Only the sidebar subscribes. */
let spyEntry: string | undefined;
const spyListeners = new Set<() => void>();
const setSpyEntry = (id: string | undefined) => {
  if (id === spyEntry) return;
  spyEntry = id;
  spyListeners.forEach((l) => l());
};
const subscribeSpy = (l: () => void) => { spyListeners.add(l); return () => void spyListeners.delete(l); };

const NavWithSpy = memo(function NavWithSpy({ route, onNavigate, brand }: { route: Route; onNavigate: (r: Route) => void; brand?: boolean }) {
  const activeEntry = useSyncExternalStore(subscribeSpy, () => spyEntry);
  return <Sidebar route={route} activeEntry={activeEntry} onNavigate={onNavigate} brand={brand} />;
});

export default function App() {
  return (
    <StudioProvider>
      <Shell />
    </StudioProvider>
  );
}

function Shell() {
  const { route, go } = useRoute();
  usePageMeta(route);
  const { toggle } = useThemeActions();
  const sheet = useRef<HTMLDivElement>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  /* While the sheet glides to a chosen entry, scroll-spy would mark every section it passes and the
     sidebar pill would hop through them. Point straight at the target and hold the spy until the scroll ends. */
  const spyHeldUntil = useRef(0);
  const onSpy = useCallback((id: string | undefined) => {
    if ((window as any).__nospy || performance.now() < spyHeldUntil.current) return;
    setSpyEntry(id);
  }, []);
  useEffect(() => {
    if (route.page !== "category" || !route.entry) return;
    setSpyEntry(route.entry);
    spyHeldUntil.current = performance.now() + 1500;
    const el = sheet.current;
    const release = () => { spyHeldUntil.current = 0; };
    el?.addEventListener("scrollend", release, { once: true });
    return () => el?.removeEventListener("scrollend", release);
  }, [route]);
  const openPalette = useCallback(() => setPaletteOpen(true), []);
  useCommandShortcut(openPalette);

  const pageKey = route.page === "category" ? route.category : route.page;
  const category = route.page === "category" ? categories.find((c) => c.id === route.category) : undefined;

  const lastPage = useRef(pageKey);
  useEffect(() => {
    const el = sheet.current;
    if (!el) return;
    const entry = route.page === "category" ? route.entry : undefined;
    const changedPage = lastPage.current !== pageKey;
    lastPage.current = pageKey;
    if (!entry) return; // a plain page change scrolls to the top in onExitComplete
    /* The new page mounts after the old one has left, so wait for the target to exist. */
    let frame = 0;
    const started = performance.now();
    // Off-screen sections have estimated heights (content-visibility), so after the first jump
    // the real heights render and the target can move: re-aim until it stays put.
    let lastTop = -1;
    const seek = () => {
      const target = document.getElementById(entry);
      if (target) {
        const top = target.offsetTop - 24;
        if (top !== lastTop) {
          el.scrollTo({ top, behavior: changedPage || lastTop >= 0 ? "instant" : "smooth" });
          lastTop = top;
          if (performance.now() - started < 1500) frame = requestAnimationFrame(seek);
        }
      } else if (performance.now() - started < 1500) {
        frame = requestAnimationFrame(seek);
      }
    };
    seek();
    return () => cancelAnimationFrame(frame);
  }, [route, pageKey]);

  const [drawerRoute, setDrawerRoute] = useState(route);
  if (route !== drawerRoute) {
    setDrawerRoute(route);
    setDrawer(false);
  }
  /* Tapping the entry you are already on does not change the route, so close the drawer here too. */
  const goClose = useCallback((r: Route) => { setDrawer(false); go(r); }, [go]);

  const items = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [
      { id: "go-overview", label: "Overview", group: "Pages", onSelect: () => go({ page: "overview" }) },
      { id: "go-studio", label: "Theme studio", group: "Pages", keywords: "colours colors palette tokens", onSelect: () => go({ page: "studio" }) },
      { id: "go-about", label: "About Kiln", group: "Pages", keywords: "why who contact request", onSelect: () => go({ page: "about" }) },
      { id: "request-feature", label: "Request a feature", group: "Pages", keywords: "github issue idea", onSelect: () => window.open(KILN_LINKS.feature, "_blank", "noreferrer") },
      { id: "open-github", label: "Kiln on GitHub", group: "Pages", keywords: "source repo code", onSelect: () => window.open(KILN_REPO, "_blank", "noreferrer") },
      { id: "toggle-theme", label: "Switch light / dark", group: "Pages", keywords: "theme mode", onSelect: () => toggle() },
    ];
    for (const c of categories)
      for (const e of c.entries)
        list.push({ id: `${c.id}:${e.id}`, label: e.name, group: c.name, keywords: e.summary, onSelect: () => go({ page: "category", category: c.id, entry: e.id }) });
    return list;
  }, [go, toggle]);

  const nav = <NavWithSpy route={route} onNavigate={go} />;

  return (
    <div className="flex h-dvh bg-ground text-ink">
      <aside className="hidden w-[260px] shrink-0 lg:flex">{nav}</aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 px-3 lg:h-12 lg:px-2 lg:pr-3">
          <IconButton aria-label="Open navigation" icon={<Menu />} size="sm" onClick={() => setDrawer(true)} className="size-9 text-ink lg:hidden" />
          <a href="/" className="flex items-center gap-2 font-semibold lg:hidden">
            <Mark /> Kiln
          </a>
          <div className="flex flex-1 justify-center">
            <motion.button
              type="button"
              onClick={openPalette}
              whileTap={{ scale: 0.985 }}
              className="hidden h-8 w-full max-w-[520px] items-center gap-2.5 rounded-full bg-surface pl-3.5 pr-1.5 text-[13px] text-muted ring-1 ring-line ring-inset transition-colors hover:text-ink sm:flex"
            >
              <Search className="size-4" />
              <span className="flex-1 text-left">Search components</span>
              <Kbd>Ctrl K</Kbd>
            </motion.button>
          </div>
          <IconButton aria-label="Search components" icon={<Search />} size="sm" onClick={openPalette} className="size-9 text-ink sm:hidden" />
          <Tooltip content="Theme studio" side="bottom">
            <IconButton aria-label="Theme studio" icon={<Palette />} size="sm" onClick={() => go({ page: "studio" })} className="size-9 text-ink lg:hidden" />
          </Tooltip>
          <a
            href={KILN_LINKS.feature}
            target="_blank"
            rel="noreferrer"
            className="hidden h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-ink transition-colors hover:bg-raised md:inline-flex"
          >
            <Lightbulb className="size-4" />
            Request a feature
          </a>
          <Tooltip content="Kiln on GitHub" side="bottom">
            <a
              href={KILN_REPO}
              target="_blank"
              rel="noreferrer"
              aria-label="Kiln on GitHub"
              className="grid size-9 place-items-center rounded-full text-ink transition-colors hover:bg-raised"
            >
              <GitHubMark className="size-[18px]" />
            </a>
          </Tooltip>
          <ThemeToggle />
        </header>

        <div
          ref={sheet}
          className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain border-line bg-surface lg:mb-2 lg:mr-2 lg:rounded-[16px] lg:border"
          style={{ scrollbarGutter: "stable" }}
        >
          <AnimatePresence mode="wait" initial={false} onExitComplete={() => sheet.current?.scrollTo({ top: 0 })}>
            <motion.main
              key={pageKey}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.42, ease: easeOut } }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.16, ease: easeOut } }}
              className={route.page === "overview" ? "w-full px-2 pb-6 pt-2" : "mx-auto w-full max-w-[1120px] px-4 pb-24 pt-8 sm:px-8 lg:pt-10"}
            >
              {route.page === "overview" && <Overview onNavigate={go} />}
              {route.page === "studio" && <ThemeStudio />}
              {route.page === "about" && <About />}
              {route.page === "privacy" && <Legal doc="privacy" />}
              {route.page === "terms" && <Legal doc="terms" />}
              {route.page === "whats-new" && <WhatsNew />}
              {route.page === "category" &&
                (category ? (
                  <CategoryPage category={category} root={sheet} onActive={onSpy} />
                ) : (
                  <div className="py-24 text-center">
                    <h1 className="text-[22px] font-semibold">No such page</h1>
                    <p className="mt-2 text-muted">That group doesn’t exist. <a className="text-accent underline-offset-4 hover:underline" href="/">Back to the overview</a></p>
                  </div>
                ))}
            </motion.main>
          </AnimatePresence>
          <footer className="mx-auto w-full max-w-[1120px] px-4 pb-10 text-[13px] leading-relaxed text-muted sm:px-8">
          <nav aria-label="Project links" className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium text-ink">
            <a href={KILN_REPO} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-accent"><GitHubMark className="size-4" />GitHub</a>
            <a href={KILN_LINKS.feature} target="_blank" rel="noreferrer" className="hover:text-accent">Request a feature</a>
            <a href={KILN_LINKS.bug} target="_blank" rel="noreferrer" className="hover:text-accent">Report a bug</a>
            <a href={KILN_LINKS.discussions} target="_blank" rel="noreferrer" className="hover:text-accent">Questions and ideas</a>
            <a href="/about" onClick={(e) => { e.preventDefault(); go({ page: "about" }); }} className="hover:text-accent">About Kiln</a>
            <a href="/privacy" onClick={(e) => { e.preventDefault(); go({ page: "privacy" }); }} className="hover:text-accent">Privacy</a>
            <a href="/terms" onClick={(e) => { e.preventDefault(); go({ page: "terms" }); }} className="hover:text-accent">Terms</a>
          </nav>
          <p className="max-w-[75ch]">
            Kiln, an open-source component library. Photographs and video from Wikimedia Commons:{" "}
            {CREDITS.map((c, i) => (
              <span key={c.page}>
                <a href={c.page} target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-2 hover:text-ink">{c.text}</a>
                {i < CREDITS.length - 1 ? "; " : "."}
              </span>
            ))}{" "}
            Some are shown in greyscale or resized. Sample photographs in the demos are CC0. Product art is drawn in code. Full list in CREDITS.md.
          </p>
          <p className="mt-2 max-w-[75ch]">
            Code under the MIT licence. Film, show, game and book names in the demos, and the names of the tools Kiln works with, belong to their owners; Kiln is an independent project and is not affiliated with or endorsed by them.
          </p>
          </footer>
        </div>
      </div>

      <Drawer
        open={drawer}
        onOpenChange={setDrawer}
        side="left"
        width={300}
        title={<span className="flex items-center gap-2"><Mark /> Kiln</span>}
        bodyClassName="flex flex-col p-0! overflow-hidden!"
      >
        <NavWithSpy route={route} onNavigate={goClose} brand={false} />
      </Drawer>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} items={items} placeholder="Search components and pages…" />
    </div>
  );
}
