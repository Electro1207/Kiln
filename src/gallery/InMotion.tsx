import { useRef, type ReactNode } from "react";
import { motion } from "motion/react";
import { Camera, Compass, Map, MessageCircle, Music, Scroll, Settings, Sword } from "lucide-react";
import { TextAnimate } from "../kiln/components/text-effects/TextAnimate";
import { CompareSlider } from "../kiln/components/media/CompareSlider";
import { Dock } from "../kiln/components/effects/Dock";
import { AnimatedBeam } from "../kiln/components/effects/AnimatedBeam";
import { OrbitingCircles } from "../kiln/components/effects/OrbitingCircles";
import { AnimatedList } from "../kiln/components/effects/AnimatedList";
import { TiltCard, TiltLayer } from "../kiln/components/cards/TiltCard";
import { BorderBeam } from "../kiln/components/effects/BorderBeam";
import { Avatar } from "../kiln/components/data-display/Avatar";
import { Badge } from "../kiln/components/status/Badge";
import { Button } from "../kiln/components/buttons/Button";
import { Mark } from "./Mark";
import { cn } from "../kiln/cn";
import { springSoft } from "../kiln/motion";

function Tile({ i, className, children }: { i: number; className?: string; children: ReactNode }) {
  return (
    <motion.div
      className={cn("relative overflow-hidden rounded-[10px]", className)}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -6% 0px" }}
      transition={{ ...springSoft, delay: i * 0.06 }}
    >
      {children}
    </motion.div>
  );
}

function Caption({ title, line }: { title: string; line: string }) {
  return (
    <div className="pointer-events-none absolute bottom-5 left-5 right-5">
      <p className="text-lg font-medium leading-tight text-ink">{title}</p>
      <p className="text-[15px] text-muted">{line}</p>
    </div>
  );
}

/** One card, drawn in whichever mode its wrapper scopes it to. */
function ModeCard({ mode }: { mode: "light" | "dark" }) {
  return (
    <div className={cn(mode, "grid size-full place-items-center bg-ground p-6 text-ink")}>
      <div className="w-full max-w-[340px] space-y-4 rounded-[14px] border border-line bg-surface p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold">DeLorean DMC-12</p>
            <p className="text-[13px] text-muted">Hill Valley · 26 Oct 1985</p>
          </div>
          <Badge tone="warning" dot>88 mph</Badge>
        </div>
        <div className="flex items-baseline justify-between rounded-[10px] bg-raised px-4 py-3">
          <span className="text-[13px] text-muted">Flux capacitor</span>
          <span className="text-xl tabular">1.21 GW</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm">Engage</Button>
          <Button size="sm" variant="secondary">Set destination</Button>
        </div>
      </div>
    </div>
  );
}

const DOCK = [
  { id: "map", label: "Map of Middle-earth", icon: <Map /> },
  { id: "compass", label: "Compass", icon: <Compass /> },
  { id: "scroll", label: "Red Book of Westmarch", icon: <Scroll />, running: true },
  { id: "sword", label: "Sting", icon: <Sword /> },
  { id: "msg", label: "Palantír", icon: <MessageCircle />, running: true },
  { id: "music", label: "Songs of the Shire", icon: <Music /> },
  { id: "camera", label: "Snapshots", icon: <Camera /> },
  { id: "settings", label: "Settings", icon: <Settings /> },
];

const FEED = [
  { who: "Gandalf", text: "Fly, you fools!" },
  { who: "Samwise Gamgee", text: "I can’t carry it for you, but I can carry you." },
  { who: "Boromir", text: "One does not simply walk into Mordor." },
  { who: "Aragorn", text: "A day may come when the courage of men fails, but it is not this day." },
  { who: "Gimli", text: "And my axe!" },
  { who: "Galadriel", text: "Even the smallest person can change the course of the future." },
];

function Beams() {
  const box = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  const c = useRef<HTMLDivElement>(null);
  const hub = useRef<HTMLDivElement>(null);
  const out = useRef<HTMLDivElement>(null);
  const node = "relative z-[1] rounded-full bg-surface px-3 py-1.5 text-[13px] font-medium text-ink";
  return (
    <div ref={box} className="absolute inset-x-5 top-6 flex h-[60%] items-center justify-between">
      <div className="flex h-full flex-col justify-around">
        <div ref={a} className={node}>Rivendell</div>
        <div ref={b} className={node}>Moria</div>
        <div ref={c} className={node}>Lothlórien</div>
      </div>
      <div ref={hub} className="relative z-[1] grid size-14 place-items-center rounded-full bg-surface"><Mark className="size-8" /></div>
      <div ref={out} className={node}>Mount Doom</div>
      <AnimatedBeam container={box} from={a} to={hub} curvature={-40} />
      <AnimatedBeam container={box} from={b} to={hub} delay={600} />
      <AnimatedBeam container={box} from={c} to={hub} curvature={40} delay={1200} />
      <AnimatedBeam container={box} from={hub} to={out} delay={1800} />
    </div>
  );
}

export function InMotion() {
  return (
    <section aria-labelledby="motion-title" className="grid grid-cols-2 gap-2 [grid-auto-flow:row_dense] [grid-auto-rows:28vw] md:grid-cols-12 md:[grid-auto-rows:104px]">
      <Tile i={0} className="col-span-2 row-span-2 bg-raised p-6 md:col-span-6">
        <h2 id="motion-title" className="text-[9vw] font-medium leading-[1.02] tracking-[-0.03em] md:text-[clamp(36px,4vw,60px)]">
          <TextAnimate as="span" text="In motion" preset="rise" />
        </h2>
        <p className="mt-3 max-w-[44ch] text-base text-ink">The effects shelf. Every loop runs on the compositor, pauses off-screen and rests for reduced motion.</p>
      </Tile>

      <Tile i={1} className="col-span-2 row-span-4 bg-raised md:col-span-6">
        <CompareSlider before={<ModeCard mode="light" />} after={<ModeCard mode="dark" />} beforeLabel="Light" afterLabel="Dark" initial={50} label="Compare light and dark" className="size-full" />
      </Tile>

      <Tile i={2} className="col-span-2 row-span-2 bg-accent-soft md:col-span-6">
        <div className="absolute inset-x-0 top-6 flex justify-center">
          <Dock items={DOCK} size={44} />
        </div>
        <Caption title="Dock" line="Magnifies towards the pointer, on transforms alone." />
      </Tile>

      <Tile i={3} className="col-span-2 row-span-4 bg-warning-soft md:col-span-6">
        <Beams />
        <Caption title="Animated beam" line="Light travels each path as a moving dash." />
      </Tile>

      <Tile i={4} className="col-span-2 row-span-4 bg-raised md:col-span-3">
        <div className="absolute inset-x-0 top-0 grid h-[70%] place-items-center">
          <div className="relative grid size-16 place-items-center rounded-full bg-surface"><Mark className="size-9" /></div>
          <OrbitingCircles radius={70} duration={22} itemSize={32}>
            {["Frodo Baggins", "Samwise Gamgee", "Gandalf", "Legolas"].map((n) => <Avatar key={n} name={n} size="sm" />)}
          </OrbitingCircles>
          <OrbitingCircles radius={118} duration={34} reverse itemSize={32}>
            {["Aragorn", "Gimli", "Boromir", "Merry Brandybuck", "Pippin Took"].map((n) => <Avatar key={n} name={n} size="sm" />)}
          </OrbitingCircles>
        </div>
        <Caption title="Orbiting circles" line="Nine walkers, two rings." />
      </Tile>

      <Tile i={5} className="col-span-2 row-span-4 bg-positive-soft md:col-span-3">
        <div className="absolute inset-x-4 top-5">
          <AnimatedList
            items={FEED}
            visible={3}
            interval={2200}
            render={(m) => (
              <div className="flex items-start gap-3 rounded-[12px] bg-surface p-3">
                <Avatar name={m.who} size="sm" />
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-ink">{m.who}</p>
                  <p className="text-[13px] text-muted">{m.text}</p>
                </div>
              </div>
            )}
          />
        </div>
        <Caption title="Animated list" line="Messages land at the top of the stack." />
      </Tile>

      <Tile i={6} className="col-span-2 row-span-2 bg-raised md:col-span-6">
        <div className="absolute left-6 top-5 w-[min(320px,calc(100%-48px))]">
          <TiltCard max={10} cardClassName="overflow-hidden border-0">
            <div className="space-y-1 bg-btn-primary p-5 text-btn-primary-ink" style={{ transformStyle: "preserve-3d" }}>
              <TiltLayer depth={28}><p className="text-[13px] opacity-80">Admit one</p></TiltLayer>
              <TiltLayer depth={40}><p className="text-xl font-medium">Enchantment Under the Sea</p></TiltLayer>
              <TiltLayer depth={20}><p className="text-[13px] opacity-80">Hill Valley High · 12 Nov 1955</p></TiltLayer>
            </div>
          </TiltCard>
        </div>
        <Caption title="Tilt card" line="Leans towards the pointer; layers float above it." />
      </Tile>

      <Tile i={7} className="col-span-2 row-span-2 bg-raised md:col-span-6">
        <div className="absolute left-6 top-5 w-[min(340px,calc(100%-48px))]">
          <BorderBeam radius={14}>
            <div className="rounded-[14px] bg-surface p-5">
              <p className="font-medium text-ink">Nostromo, priority one</p>
              <p className="text-[13px] text-muted">Special Order 937. Crew expendable.</p>
            </div>
          </BorderBeam>
        </div>
        <Caption title="Border beam" line="A short light running round the card’s own edge." />
      </Tile>
    </section>
  );
}
