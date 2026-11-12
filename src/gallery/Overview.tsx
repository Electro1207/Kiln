import { useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Palette } from "lucide-react";
import { categories } from "./registry";
import { href, type Route } from "./useRoute";
import { useStudio } from "./studio/store";
import { liveCss, PRESETS, type StudioTheme } from "./studio/tokens";
import { Button } from "../kiln/components/buttons/Button";
import { Switch } from "../kiln/components/choice-controls/Switch";
import { Slider } from "../kiln/components/choice-controls/Slider";
import { SegmentedControl } from "../kiln/components/buttons/SegmentedControl";
import { Kbd } from "../kiln/components/data-display/Kbd";
import { Badge } from "../kiln/components/status/Badge";
import { NumberTicker } from "../kiln/components/data-display/NumberTicker";
import { Avatar } from "../kiln/components/data-display/Avatar";
import { Rating } from "../kiln/components/choice-controls/Rating";
import { ThemeToggle } from "../kiln/components/primitives/ThemeToggle";
import { TextAnimate } from "../kiln/components/text-effects/TextAnimate";
import { WordRotate } from "../kiln/components/text-effects/WordRotate";
import { InMotion } from "./InMotion";
import { Orbit } from "./overview/Orbit";
import { ParallaxImg } from "./overview/Parallax";
import { cn } from "../kiln/cn";
import { easeOut, fade, springSoft } from "../kiln/motion";

/* Every tile is a live component. Picking a glaze re-themes the whole site, opening from the swatch pressed. */

const BASE = import.meta.env.BASE_URL;

/** Entrance for a tile: rises a little and fades in once, staggered by its place on the board. */
function Tile({ i = 0, className, children, as = "div", still }: { i?: number; className?: string; children?: ReactNode; as?: "div" | "section"; still?: boolean }) {
  const C = as === "section" ? motion.section : motion.div;
  return (
    <C
      className={cn("relative overflow-hidden rounded-[10px]", className)}
      initial={still ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -6% 0px" }}
      transition={{ ...springSoft, delay: i * 0.07 }}
    >
      {children}
    </C>
  );
}

/** Re-fire the site in another glaze: the new colours open as a circle from the swatch. */
function useRefire() {
  const { setTheme } = useStudio();
  return (theme: StudioTheme, from: HTMLElement) => {
    const apply = () => {
      // Write the colours synchronously so the transition's new snapshot already has them.
      let tag = document.getElementById("kiln-studio") as HTMLStyleElement | null;
      if (!tag) {
        tag = document.createElement("style");
        tag.id = "kiln-studio";
        document.head.appendChild(tag);
      }
      tag.textContent = liveCss(theme);
      flushSync(() => setTheme(theme));
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return apply();
    const r = from.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const root = document.documentElement;
    root.style.setProperty("--k-reveal-x", `${x}px`);
    root.style.setProperty("--k-reveal-y", `${y}px`);
    root.style.setProperty("--k-reveal-r", `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
    doc.startViewTransition(apply);
  };
}

export function Overview({ onNavigate }: { onNavigate: (r: Route) => void }) {
  const total = categories.reduce((n, c) => n + c.entries.length, 0);
  const first = categories.find((c) => c.id !== "foundations") ?? categories[0];
  return (
    <div className="space-y-2">
      <Hero total={total} onBrowse={() => first && onNavigate({ page: "category", category: first.id })} onStudio={() => onNavigate({ page: "studio" })} />
      <Orbit total={total} />
      <Shelf total={total} />
      <CloseUps />
      <InMotion />
      <Stages />
      <Close total={total} onBrowse={() => first && onNavigate({ page: "category", category: first.id })} />
      <Mark />
    </div>
  );
}

function Hero({ total, onBrowse, onStudio }: { total: number; onBrowse: () => void; onStudio: () => void }) {
  return (
    <section aria-labelledby="kiln-title" className="grid grid-cols-1 gap-2 md:h-[calc(100dvh-80px)] md:min-h-[600px] md:max-h-[860px] md:grid-cols-12 md:grid-rows-2">
      <Tile still className="order-1 md:order-none flex min-h-[30svh] flex-col justify-between bg-raised p-6 md:col-span-7">
        <p className="max-w-[26ch] text-base text-ink">A component library for React. Light and dark, animated with Motion, made to be copied.</p>
        <h1 id="kiln-title" className="text-[22vw] font-medium leading-[0.82] tracking-[-0.05em] md:text-[clamp(96px,12.5vw,190px)]">
          Kiln<span className="sr-only">, a React component library</span>
        </h1>
      </Tile>

      <Tile i={1} className="order-3 aspect-[4/3] bg-ink md:order-none md:col-span-5 md:aspect-auto">
        <motion.div
          className="absolute inset-0"
          initial={{ clipPath: "inset(0 0 0 100%)" }}
          animate={{ clipPath: "inset(0 0 0 0%)" }}
          transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1], delay: 0.2 }}
        >
          <motion.img decoding="async"
            src={`${BASE}demo/medalta-potteries-kilns.jpg`}
            alt="Beehive kilns at the Medalta Potteries in Medicine Hat, Alberta"
            width={1920}
            height={1440}
            className="size-full object-cover grayscale"
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4, ease: easeOut, delay: 0.2 }}
          />
        </motion.div>
        <p className="absolute bottom-4 left-5 rounded-full bg-black/55 px-3 py-1 text-[13px] text-white">Medalta Potteries kilns, Alberta</p>
      </Tile>

      <Tile i={2} className="order-5 min-h-[340px] bg-accent-soft md:order-none md:col-span-5">
        <Workbench />
      </Tile>

      <Tile i={3} className="dark order-2 flex min-h-[200px] flex-col justify-between gap-6 bg-ground p-6 text-ink md:order-none md:col-span-4 md:min-h-[240px]">
        <p className="text-2xl leading-snug tracking-[-0.01em]">
          {total} components for every part of a{" "}
          <WordRotate words={["website.", "dashboard.", "shop.", "landing page.", "settings screen.", "chat app."]} className="text-accent" />
          <span className="block">In light and dark.</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={onBrowse} trailing={<ArrowRight />} className="bg-ink text-ground hover:bg-ink/90">Browse the shelf</Button>
          <Button onClick={onStudio} variant="ghost" leading={<Palette />}>Theme studio</Button>
        </div>
      </Tile>
      <Tile i={4} className="order-4 flex min-h-[200px] flex-col justify-between gap-6 bg-btn-primary p-6 text-btn-primary-ink md:order-none md:col-span-3 md:min-h-[240px]">
        <p className="text-2xl leading-snug tracking-[-0.01em]">Pick a glaze. The whole site re-fires.</p>
        <GlazePicker />
      </Tile>
    </section>
  );
}

function GlazePicker() {
  const { theme } = useStudio();
  const refire = useRefire();
  const current = PRESETS.find((p) => JSON.stringify(p.theme) === JSON.stringify(theme))?.id;
  return (
    <div role="radiogroup" aria-label="Glaze" className="flex flex-wrap gap-1.5">
      {PRESETS.map((p) => {
        const on = current === p.id;
        return (
          <motion.button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={p.name}
            title={p.name}
            whileTap={{ scale: 0.92 }}
            transition={springSoft}
            onClick={(e) => !on && refire(p.theme, e.currentTarget)}
            className="relative grid size-9 place-items-center rounded-full"
          >
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full border-2 border-current"
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={fade}
            />
            <span className="size-6 rounded-full ring-2 ring-white/70" style={{ background: p.theme.light.accent }} />
          </motion.button>
        );
      })}
    </div>
  );
}

function Workbench() {
  const [hyper, setHyper] = useState(true);
  const [shields, setShields] = useState([64]);
  const [speed, setSpeed] = useState<"light" | "ludicrous">("light");
  return (
    <div data-ui className="absolute inset-x-6 top-6 space-y-5 rounded-[14px] bg-surface p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[15px] font-semibold">Millennium Falcon</p>
          <p className="text-[13px] text-muted">YT-1300f · Docking bay 94</p>
        </div>
        <Badge tone={hyper ? "positive" : "warning"} dot>{hyper ? "Ready to jump" : "Hyperdrive off"}</Badge>
      </div>
      <Switch checked={hyper} onCheckedChange={setHyper} label="Hyperdrive" description="Chewie says it’ll hold this time." labelFirst />
      <Slider label="Deflector shields" value={shields} onChange={setShields} format={(n) => `${n}%`} />
      <SegmentedControl
        label="Speed"
        options={[{ value: "light", label: "Lightspeed" }, { value: "ludicrous", label: "Ludicrous" }]}
        value={speed}
        onChange={setSpeed}
        fullWidth
      />
    </div>
  );
}

function Shelf({ total }: { total: number }) {
  const [open, setOpen] = useState<string | null>(categories[3]?.id ?? categories[0]?.id ?? null);
  return (
    <section aria-labelledby="shelf-title" className="dark rounded-[10px] bg-ground px-2 py-6 text-ink sm:px-3 sm:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 px-3 sm:px-4">
        <h2 id="shelf-title" className="text-[clamp(28px,3.2vw,40px)] font-medium leading-tight tracking-[-0.02em]"><TextAnimate as="span" text="The whole shelf" preset="rise" /></h2>
        <p className="text-base text-muted tabular">{categories.length} groups · {total} pieces</p>
      </div>
      <ul data-ui className="space-y-1">
        {categories.map((c, i) => {
          const isOpen = open === c.id;
          return (
            <motion.li
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...springSoft, delay: Math.min(i, 10) * 0.03 }}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : c.id)}
                className={cn(
                  "grid w-full grid-cols-[1fr_auto] items-center gap-4 rounded-[8px] px-4 text-left transition-colors duration-300 sm:grid-cols-12",
                  isOpen ? "bg-btn-primary text-btn-primary-ink" : "bg-raised hover:bg-active",
                  "h-16 sm:h-[72px]",
                )}
              >
                <span className="truncate text-xl tracking-[-0.01em] sm:col-span-5 sm:text-2xl">{c.name}</span>
                <span className={cn("hidden text-base tabular sm:col-span-2 sm:block", isOpen ? "opacity-80" : "text-muted")}>{c.entries.length} pieces</span>
                <span className={cn("hidden truncate text-base sm:col-span-4 sm:block", isOpen ? "opacity-80" : "text-muted")}>
                  {c.entries.slice(0, 3).map((e) => e.name).join(", ")}
                </span>
                <span className="justify-self-end sm:col-span-1" aria-hidden>
                  <motion.span
                    className={cn("grid size-9 place-items-center rounded-full", isOpen ? "bg-white/15" : "bg-active")}
                    initial={false}
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={springSoft}
                  >
                    <ArrowRight className="size-4" />
                  </motion.span>
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1, transition: { height: springSoft, opacity: { duration: 0.25, delay: 0.08 } } }}
                    exit={{ height: 0, opacity: 0, transition: { height: { ...springSoft, visualDuration: 0.35 }, opacity: { duration: 0.12 } } }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1 grid gap-4 rounded-[8px] bg-btn-primary px-4 py-5 text-btn-primary-ink sm:grid-cols-12">
                      <p className="text-[17px] leading-relaxed sm:col-span-5">{c.summary}</p>
                      <p className="text-[15px] leading-7 opacity-90 sm:col-span-6 sm:col-start-6">
                        {c.entries.map((e, j) => (
                          <span key={e.id}>
                            <a href={href({ page: "category", category: c.id, entry: e.id })} className="underline decoration-white/40 underline-offset-4 hover:decoration-white">
                              {e.name}
                            </a>
                            {j < c.entries.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </p>
                      <a href={href({ page: "category", category: c.id })} className="group inline-flex items-center gap-1.5 text-[15px] font-medium sm:col-span-12">
                        Open {c.name}
                        <ArrowUpRight className="size-4 transition-transform duration-300 ease-out-soft group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}

function Caption({ title, line, light }: { title: string; line: string; light?: boolean }) {
  return (
    <div className={cn("absolute bottom-5 left-5 right-5", light ? "text-btn-primary-ink" : "text-ink")}>
      <p className="text-lg font-medium leading-tight">{title}</p>
      <p className={cn("text-[15px]", light ? "opacity-80" : "text-muted")}>{line}</p>
    </div>
  );
}

function CloseUps() {
  const [on, setOn] = useState(true);
  const [credits, setCredits] = useState(1977);
  const [stars, setStars] = useState(4);
  const [shields, setShields] = useState([88]);
  return (
    <section aria-labelledby="close-title" className="grid grid-cols-2 gap-2 [grid-auto-rows:28vw] md:grid-cols-12 md:[grid-auto-rows:104px]">
      <Tile i={0} className="col-span-2 row-span-2 bg-raised p-6 md:col-span-6 md:row-span-2">
        <h2 id="close-title" className="max-w-[12ch] text-[9vw] font-medium leading-[1.02] tracking-[-0.03em] md:text-[clamp(36px,4vw,60px)]"><TextAnimate as="span" text="Every piece, up close" preset="rise" /></h2>
      </Tile>

      <Tile i={1} className="dark col-span-1 row-span-2 bg-ground md:col-span-3 md:row-span-4">
        <div data-ui className="absolute left-5 top-6 flex gap-2 [zoom:1.6] md:[zoom:2.4]">
          <Kbd listen="Meta">⌘</Kbd>
          <Kbd listen="k">K</Kbd>
        </div>
        <Caption title="Key caps" line="They press when you do. Try ⌘K." />
      </Tile>

      <Tile i={2} className="col-span-1 row-span-2 bg-warning-soft md:col-span-3 md:row-span-4">
        <div data-ui className="absolute left-5 top-6 [zoom:2] md:[zoom:3]">
          <Switch checked={on} onCheckedChange={setOn} />
        </div>
        <Caption title="Switch" line="A pill that stretches as you press." />
      </Tile>

      <Tile i={3} className="col-span-2 row-span-2 bg-raised md:col-span-6 md:row-span-2">
        <div data-ui className="absolute right-6 top-5 text-[clamp(56px,7vw,96px)] font-medium leading-none tracking-[-0.04em] text-ink">
          <NumberTicker value={credits} />
        </div>
        <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-lg font-medium leading-tight">Number ticker</p>
            <p className="text-[15px] text-muted">Digits roll like a departure board.</p>
          </div>
          <div className="flex gap-1.5">
            {[1955, 1977, 1985, 2015].map((y) => (
              <Button key={y} size="sm" variant={y === credits ? "primary" : "secondary"} onClick={() => setCredits(y)}>{y}</Button>
            ))}
          </div>
        </div>
      </Tile>

      <Tile i={4} className="col-span-2 row-span-3 bg-accent-soft md:col-span-6 md:row-span-4">
        <div data-ui className="absolute left-6 right-6 top-6 sm:[zoom:1.8]">
          <Slider label="Shields" value={shields} onChange={setShields} format={(n) => `${n}%`} />
        </div>
        <Caption title="Slider" line="Click to glide, drag to follow, arrows to step." />
      </Tile>

      <Tile i={5} className="col-span-1 row-span-2 bg-positive-soft md:col-span-3 md:row-span-2">
        <div data-ui className="absolute left-5 top-6 [zoom:1.1] md:[zoom:1.6]">
          <Badge tone="positive" dot>Ring destroyed</Badge>
        </div>
        <Caption title="Badge" line="Status in a word." />
      </Tile>

      <Tile i={6} className="col-span-1 row-span-2 bg-raised md:col-span-3 md:row-span-2">
        <div data-ui className="absolute left-5 top-6 flex -space-x-2 [zoom:1.1] md:[zoom:1.6]">
          {["Frodo Baggins", "Samwise Gamgee", "Gandalf", "Legolas"].map((n) => <Avatar key={n} name={n} />)}
        </div>
        <Caption title="Avatars" line="Each person keeps their colour." />
      </Tile>

      <Tile i={7} className="col-span-1 row-span-2 bg-raised md:col-span-3 md:row-span-2">
        <div data-ui className="absolute left-4 top-5 [zoom:0.8] md:[zoom:1.3]">
          <Rating value={stars} onChange={setStars} label="Rate the Kessel Run" />
        </div>
        <Caption title="Rating" line="A small reward on the pick." />
      </Tile>

      <Tile i={8} className="dark col-span-1 row-span-2 bg-ground md:col-span-3 md:row-span-2">
        <div data-ui className="absolute left-4 top-4 [zoom:1.6] md:[zoom:2.2]">
          <ThemeToggle />
        </div>
        <Caption title="Theme toggle" line="The new mode opens as a circle." />
      </Tile>

      <Tile i={9} className="col-span-2 row-span-2 bg-ink md:col-span-8 md:row-span-3">
        <ParallaxImg src={`${BASE}demo/pottery-kiln-archmus-eretria-19558.jpg`} alt="A reconstructed ancient Greek pottery kiln in the Archaeological Museum of Eretria" width={1920} height={1541} className="grayscale" />
        <p className="absolute bottom-4 left-5 rounded-full bg-black/55 px-3 py-1 text-[13px] text-white">Pottery kiln, Eretria</p>
      </Tile>
      <Tile i={10} className="col-span-2 row-span-2 bg-ink md:col-span-4 md:row-span-3">
        <ParallaxImg depth={0.12} src={`${BASE}demo/vase-mougin-luneville.jpg`} alt="A blue glazed vase with a spiral pattern, Mougin, Lunéville" width={1200} height={1286} />
        <p className="absolute bottom-4 left-5 rounded-full bg-black/55 px-3 py-1 text-[13px] text-white">Glazed vase, Mougin</p>
      </Tile>
    </section>
  );
}

const STAGES = [
  { weight: 3, time: "Thirty seconds", clause: <>First, install Motion and Tailwind: <code className="font-mono text-[15px]">npm i motion lucide-react</code></>, cls: "bg-raised" },
  { weight: 1, time: "Five seconds", clause: <>Then copy <code className="font-mono text-[15px]">src/kiln</code> into the new project.</>, cls: "bg-accent-soft" },
  { weight: 1.2, time: "Ten seconds", clause: <>Next, import <code className="font-mono text-[15px]">kiln.css</code> after Tailwind.</>, cls: "bg-warning-soft" },
  { weight: 7, time: "The rest of the week", clause: <>Finally, build the thing you meant to build.</>, cls: "bg-btn-primary text-btn-primary-ink" },
];

function Stages() {
  return (
    <section aria-labelledby="stages-title" className="rounded-[10px] bg-surface px-1 py-16 sm:px-2 md:py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={springSoft}
        id="stages-title" className="mb-16 max-w-[14ch] text-[11vw] font-medium leading-[0.98] tracking-[-0.035em] md:text-[clamp(48px,6.4vw,104px)]">Copy a folder, keep the look</motion.h2>
      <div data-ui className="flex flex-col gap-1.5 md:h-[22vh] md:min-h-[150px] md:flex-row">
        {STAGES.map((s, i) => (
          <motion.div
            key={s.time}
            className={cn("relative min-h-[72px] origin-left overflow-hidden rounded-[10px] p-5 md:min-h-0", s.cls)}
            style={{ flexGrow: s.weight, flexBasis: "12%" }}
            initial={{ opacity: 0, scaleX: 0.92 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ ...springSoft, delay: i * 0.09 }}
          >
            <p className="text-[22px] leading-tight tracking-[-0.01em] md:text-[clamp(20px,2vw,30px)]">{s.time}</p>
            <p className="mt-2 max-w-[30ch] text-base md:hidden">{s.clause}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 hidden gap-1.5 md:flex">
        {STAGES.map((s, i) => (
          <motion.p
            key={s.time}
            className="max-w-[24ch] pr-4 text-[17px] leading-relaxed"
            style={{ flexGrow: s.weight, flexBasis: "12%" }}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...springSoft, delay: 0.2 + i * 0.08 }}
          >
            {s.clause}
          </motion.p>
        ))}
      </div>
    </section>
  );
}

function Close({ total, onBrowse }: { total: number; onBrowse: () => void }) {
  return (
    <section aria-labelledby="close-cta" className="grid grid-cols-2 gap-2 md:h-[360px] md:grid-cols-12">
      <Tile i={0} className="order-2 h-[120px] md:order-none md:col-span-2 md:h-auto">
        <motion.img decoding="async"
          src={`${BASE}demo/pottery-kiln-found-at-jinsha.jpg`}
          alt="The remains of an ancient pottery kiln found at Jinsha, Chengdu"
          width={1920}
          height={1280}
          loading="lazy"
          className="size-full object-cover grayscale"
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </Tile>
      <Tile i={1} className="order-1 col-span-2 flex min-h-[300px] flex-col justify-center gap-5 bg-btn-primary p-8 text-btn-primary-ink md:order-none md:col-span-8 md:p-10">
        <h2 id="close-cta" className="max-w-[18ch] text-[28px] font-medium leading-tight tracking-[-0.02em] md:text-[40px]">Fire up the whole library</h2>
        <p className="max-w-[52ch] text-[17px] leading-relaxed opacity-90">
          {total} pieces, each in its own file, each tested frame by frame in both themes. Take one, take the shelf.
        </p>
        <div>
          <Button size="lg" onClick={onBrowse} trailing={<ArrowRight />} className="bg-ground text-ink hover:bg-raised">Start browsing</Button>
        </div>
      </Tile>
      <Tile i={2} className="order-3 h-[120px] bg-ink md:order-none md:col-span-2 md:h-auto">
        <ParallaxImg depth={0.1} src={`${BASE}demo/vase.jpg`} alt="A white jasperware vase by Wedgwood" width={1920} height={2560} className="grayscale" />
      </Tile>
    </section>
  );
}

const BLOCKS: { ch: string; h: string; cls: string }[] = [
  { ch: "K", h: "100%", cls: "dark bg-ground text-ink" },
  { ch: "I", h: "72%", cls: "bg-btn-primary text-btn-primary-ink" },
  { ch: "L", h: "86%", cls: "bg-warning-soft text-ink" },
  { ch: "N", h: "62%", cls: "bg-accent-soft text-ink" },
];

function Mark() {
  return (
    <section aria-label="Kiln" className="rounded-[10px] bg-raised p-2">
      <div aria-hidden className="flex h-[22svh] items-end gap-1 md:h-[34svh]">
        {BLOCKS.map((b, i) => (
          <motion.div
            key={b.ch}
            className={cn("flex flex-1 origin-bottom items-end overflow-hidden rounded-[8px] px-[2vw]", b.cls)}
            style={{ height: b.h }}
            initial={{ scaleY: 0.4, opacity: 0 }}
            whileInView={{ scaleY: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ ...springSoft, delay: i * 0.08 }}
          >
            <span className="pb-[1.5vw] text-[clamp(72px,15vw,230px)] font-medium leading-[0.78] tracking-[-0.05em]">{b.ch}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
