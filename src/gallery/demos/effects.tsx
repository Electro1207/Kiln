import { useEffect, useRef, useState } from "react";
import {
  Bot, Gamepad2, Map, Music, Radio, Rocket, RotateCcw, Satellite, Settings, Star, Moon, Zap, Ticket,
  Coins, Snowflake, Mail, Plane,
} from "lucide-react";
import type { Category } from "../types";
import { Stage, Variant, Btn } from "../ui";
import { Button } from "../../kiln/components/buttons/Button";
import { TextAnimate } from "../../kiln/components/text-effects/TextAnimate";
import { Typewriter } from "../../kiln/components/text-effects/Typewriter";
import { WordRotate } from "../../kiln/components/text-effects/WordRotate";
import { ScrambleText } from "../../kiln/components/text-effects/ScrambleText";
import { Dock } from "../../kiln/components/effects/Dock";
import { TiltCard, TiltLayer } from "../../kiln/components/cards/TiltCard";
import { CompareSlider } from "../../kiln/components/media/CompareSlider";
import { AnimatedBeam } from "../../kiln/components/effects/AnimatedBeam";
import { OrbitingCircles } from "../../kiln/components/effects/OrbitingCircles";
import { AnimatedList } from "../../kiln/components/effects/AnimatedList";
import { BorderBeam } from "../../kiln/components/effects/BorderBeam";
import { ScrollProgress } from "../../kiln/components/wayfinding/ScrollProgress";
import { StickyScrollReveal } from "../../kiln/components/effects/StickyScrollReveal";
import { Magnetic } from "../../kiln/components/buttons/MagneticButton";
import { MultiStepLoader } from "../../kiln/components/status/MultiStepLoader";
import { PlaceholderInput } from "../../kiln/components/text-input/PlaceholderInput";


function TextAnimateDemo() {
  const [round, setRound] = useState(0);
  return (
    <Stage className="flex-col items-stretch">
      <div key={round} className="mx-auto w-full max-w-2xl space-y-6">
        <TextAnimate as="p" by="word" preset="fade-up" text="Roads? Where we’re going, we don’t need roads." className="text-[28px] font-semibold leading-tight tracking-[-0.01em]" />
        <TextAnimate as="p" by="char" preset="rise" text="I’ll be back." className="text-[28px] font-semibold leading-tight tracking-[-0.01em]" delay={0.3} />
        <TextAnimate as="p" by="word" preset="fade" text="There is no spoon. Then you’ll see that it is not the spoon that bends, it is only yourself." className="max-w-xl text-base text-muted" delay={0.6} />
      </div>
      <div className="mx-auto w-full max-w-2xl">
        <Button size="sm" variant="ghost" leading={<RotateCcw />} onClick={() => setRound((r) => r + 1)}>Play again</Button>
      </div>
    </Stage>
  );
}

function TypewriterDemo() {
  return (
    <Stage>
      <p className="w-full max-w-xl text-[26px] font-semibold leading-snug tracking-[-0.01em]">
        <Typewriter phrases={["Wake up, Neo…", "The Matrix has you…", "Follow the white rabbit.", "Knock, knock, Neo."]} />
      </p>
    </Stage>
  );
}

function WordRotateDemo() {
  return (
    <Stage>
      <p className="text-[28px] font-semibold leading-tight tracking-[-0.01em]">
        May the Force be with <WordRotate words={["you", "Luke", "the Rebellion", "Chewie", "us all"]} className="text-accent" />
      </p>
    </Stage>
  );
}

function ScrambleDemo() {
  return (
    <Stage>
      <Variant label="House face, decodes on view and on hover">
        <ScrambleText text="Follow the white rabbit" className="text-[26px] font-semibold tracking-[-0.01em]" />
      </Variant>
      <Variant label="Code-like text uses the mono face">
        <ScrambleText code text="NEB-1999-ZION-0451" className="text-lg" />
      </Variant>
    </Stage>
  );
}

const DOCK = [
  { id: "map", label: "Star map", icon: <Map />, running: true },
  { id: "comlink", label: "Comlink", icon: <Radio />, running: true },
  { id: "droids", label: "Droid control", icon: <Bot /> },
  { id: "cantina", label: "Cantina band", icon: <Music />, running: true },
  { id: "hyperdrive", label: "Hyperdrive", icon: <Rocket /> },
  { id: "holochess", label: "Holochess", icon: <Gamepad2 /> },
  { id: "settings", label: "Settings", icon: <Settings /> },
];

function DockDemo() {
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <Stage className="flex-col pt-24 sm:pt-24">
      <Dock items={DOCK.map((d) => ({ ...d, onSelect: () => setOpened(d.label) }))} />
      <span className="h-5 text-sm text-muted">{opened ? `Opened ${opened}` : "Run the pointer along the dock"}</span>
    </Stage>
  );
}

function TiltDemo() {
  return (
    <Stage className="py-12 sm:py-12">
      <TiltCard className="w-full max-w-sm" cardClassName="p-6">
        <TiltLayer depth={10}>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-[13px] font-medium text-muted">
              <Ticket className="size-4" /> Essex Theatre, Hill Valley
            </span>
            <span className="tabular text-[13px] text-muted">£3.50</span>
          </div>
        </TiltLayer>
        <TiltLayer depth={40}>
          <p className="mt-8 text-[28px] font-semibold leading-tight tracking-[-0.01em]">Back to the Future</p>
          <p className="mt-1 text-sm text-muted">Admit one</p>
        </TiltLayer>
        <TiltLayer depth={20}>
          <dl className="tabular mt-8 grid grid-cols-3 gap-3 text-sm">
            <div><dt className="text-xs text-muted">Date</dt><dd className="font-medium">3 Jul 1985</dd></div>
            <div><dt className="text-xs text-muted">Time</dt><dd className="font-medium">19:30</dd></div>
            <div><dt className="text-xs text-muted">Seat</dt><dd className="font-medium">F 12</dd></div>
          </dl>
        </TiltLayer>
      </TiltCard>
    </Stage>
  );
}

function CompareDemo() {
  const src = `${import.meta.env.BASE_URL}demo/medalta-potteries-kilns.jpg`;
  const img = (gray: boolean) => (
    <img decoding="async" src={src} alt="" draggable={false} className={`block aspect-[4/3] w-full object-cover ${gray ? "grayscale sepia-[.35] contrast-[1.05]" : ""}`} />
  );
  return (
    <Stage className="flex-col items-stretch">
      <CompareSlider
        className="mx-auto w-full max-w-xl"
        before={img(true)}
        after={img(false)}
        beforeLabel="1955"
        afterLabel="1985"
        label="Compare 1955 with 1985"
        initial={42}
      />
      <p className="mx-auto w-full max-w-xl text-[13px] text-muted">Drag the handle, or focus it and use the arrow keys.{" "}
        <a href="https://commons.wikimedia.org/w/index.php?curid=17302609" target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-2 hover:text-ink">“Medalta Potteries kilns”</a> by Grapher78,{" "}
        <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-2 hover:text-ink">CC BY 3.0</a>, via Wikimedia Commons. Modified: resized; greyscale with a sepia tint on the 1955 side.</p>
    </Stage>
  );
}

function MagneticDemo() {
  return (
    <Stage className="gap-10 py-12 sm:py-12">
      <Magnetic>
        <Btn size="lg" leading={<Zap />}>Engage hyperdrive</Btn>
      </Magnetic>
      <Magnetic strength={0.4}>
        <Btn size="lg" variant="secondary">Punch it, Chewie</Btn>
      </Magnetic>
    </Stage>
  );
}

function BeamDemo() {
  const box = useRef<HTMLDivElement>(null);
  const r2 = useRef<HTMLDivElement>(null);
  const c3 = useRef<HTMLDivElement>(null);
  const bb = useRef<HTMLDivElement>(null);
  const hub = useRef<HTMLDivElement>(null);
  const base = useRef<HTMLDivElement>(null);
  const node = "relative z-[1] grid size-12 place-items-center rounded-full border border-line bg-surface text-ink [&_svg]:size-5";
  const cap = "mt-2 text-center text-xs text-muted";
  return (
    <Stage>
      <div ref={box} className="relative flex w-full max-w-xl items-center justify-between py-6">
        <div className="flex flex-col gap-6">
          {[
            [r2, "R2-D2"],
            [c3, "C-3PO"],
            [bb, "BB-8"],
          ].map(([ref, label]) => (
            <div key={label as string} className="flex flex-col items-center">
              <div ref={ref as React.RefObject<HTMLDivElement>} className={node}><Bot /></div>
              <span className={cap}>{label as string}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center">
          <div ref={hub} className={`${node} size-16 [&_svg]:size-7`}><Rocket /></div>
          <span className={cap}>Millennium Falcon</span>
        </div>
        <div className="flex flex-col items-center">
          <div ref={base} className={node}><Satellite /></div>
          <span className={cap}>Yavin 4</span>
        </div>
        <AnimatedBeam container={box} from={r2} to={hub} curvature={40} />
        <AnimatedBeam container={box} from={c3} to={hub} delay={500} />
        <AnimatedBeam container={box} from={bb} to={hub} curvature={-40} delay={1000} />
        <AnimatedBeam container={box} from={hub} to={base} delay={1500} />
      </div>
    </Stage>
  );
}

function OrbitDemo() {
  const tile = "grid size-full place-items-center rounded-full border border-line bg-surface text-ink [&_svg]:size-4";
  return (
    <Stage>
      <div className="relative size-[300px] max-w-full">
        <OrbitingCircles radius={68} duration={18} itemSize={34}>
          <span className={tile}><Plane /></span>
          <span className={tile}><Rocket /></span>
          <span className={tile}><Satellite /></span>
        </OrbitingCircles>
        <OrbitingCircles radius={128} duration={34} reverse itemSize={40}>
          <span className={tile}><Moon /></span>
          <span className={tile}><Star /></span>
          <span className={tile}><Radio /></span>
          <span className={tile}><Bot /></span>
        </OrbitingCircles>
        <div className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-btn-secondary text-[11px] font-semibold tracking-wide text-btn-secondary-ink">
          DS-1
        </div>
      </div>
    </Stage>
  );
}

type Note = { title: string; body: string; time: string; icon: React.ReactNode };
const NOTES: Note[] = [
  { title: "Bounty paid", body: "Boba Fett · 5,000 credits", time: "Now", icon: <Coins /> },
  { title: "Han Solo frozen", body: "Carbonite, Cloud City, bay 3", time: "2 min", icon: <Snowflake /> },
  { title: "Message from Jabba", body: "“Bring me Solo and the Wookiee.”", time: "4 min", icon: <Mail /> },
  { title: "Docking bay 94 cleared", body: "Millennium Falcon, departs 14:00", time: "9 min", icon: <Rocket /> },
  { title: "Droids sold", body: "Jawa traders · 2 droids · 120 credits", time: "12 min", icon: <Bot /> },
];

function AnimatedListDemo() {
  return (
    <Stage align="start">
      <div className="mx-auto h-[330px] w-full max-w-sm overflow-hidden">
        <AnimatedList
          items={NOTES}
          render={(n) => (
            <div className="flex items-center gap-3 rounded-[14px] border border-line bg-surface p-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-raised text-ink [&_svg]:size-[18px]">{n.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-5">{n.title}</p>
                <p className="truncate text-[13px] leading-[18px] text-muted">{n.body}</p>
              </div>
              <span className="shrink-0 self-start text-xs text-faint">{n.time}</span>
            </div>
          )}
        />
      </div>
    </Stage>
  );
}

function BorderBeamDemo() {
  return (
    <Stage className="py-12 sm:py-12">
      <BorderBeam className="w-full max-w-sm p-6" radius={18}>
        <p className="text-[13px] font-medium text-muted">Tyrell Corporation</p>
        <p className="mt-1 text-xl font-semibold leading-snug">Voight-Kampff test</p>
        <dl className="tabular mt-5 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subject</dt><dd>Leon Kowalski</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Model</dt><dd>Nexus-6</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Scheduled</dt><dd>Nov 2019, 08:00</dd></div>
        </dl>
        <Btn className="mt-6 w-full">Begin the test</Btn>
      </BorderBeam>
    </Stage>
  );
}

const ROUTE = [
  ["Hobbiton", "Frodo leaves Bag End with Sam, carrying the Ring and very little else. Farmer Maggot’s mushrooms are a detour, not a plan."],
  ["Bree", "At the Prancing Pony they meet Strider, a Ranger of the North. The Black Riders arrive the same night."],
  ["Weathertop", "On the hill of Amon Sûl, the Witch-king wounds Frodo with a Morgul blade. Strider drives them off with fire."],
  ["Rivendell", "Elrond calls a council. Nine walkers set out: four hobbits, two men, an elf, a dwarf and a wizard."],
  ["Moria", "The mines are dark and full of goblins. On the bridge of Khazad-dûm, Gandalf faces the Balrog alone."],
  ["Lothlórien", "Galadriel gives each walker a gift. Frodo is given the light of Eärendil’s star, for dark places."],
  ["Amon Hen", "The Fellowship breaks. Boromir falls defending Merry and Pippin; Frodo and Sam cross the river towards Mordor."],
];

function ScrollProgressDemo() {
  const box = useRef<HTMLDivElement>(null);
  return (
    <Stage className="flex-col items-stretch">
      <div ref={box} className="relative mx-auto h-80 w-full max-w-xl overflow-y-auto overscroll-contain rounded-card border border-line bg-surface">
        <ScrollProgress container={box} className="sticky top-0 z-10" />
        <article className="px-6 pb-8 pt-5">
          <h3 className="text-lg font-semibold">The road from the Shire</h3>
          {ROUTE.map(([h, p]) => (
            <section key={h} className="mt-5">
              <h4 className="text-sm font-semibold">{h}</h4>
              <p className="mt-1 text-[15px] leading-6 text-muted">{p}</p>
            </section>
          ))}
        </article>
      </div>
    </Stage>
  );
}

const TEA = `${import.meta.env.BASE_URL}demo/teapot/`;
const STOPS = [
  {
    eyebrow: "Act one",
    title: "It is always six o’clock",
    body: "The Hatter stopped time in 1951 and never started it again. This teapot has been pouring ever since, and nobody has dared to ask for the bill.",
    image: { src: `${TEA}front.jpg`, alt: "Crimson stoneware teapot with green vine leaves and yellow grapes in relief" },
  },
  {
    eyebrow: "Act two",
    title: "A twig for a lid",
    body: "Take it off carefully. Alice found a dormouse in hers, and the knob is a twig for exactly that reason: it gives the dormouse something to hold.",
    image: { src: `${TEA}lid.jpg`, alt: "Close-up of the lid and its twig-shaped knob" },
  },
  {
    eyebrow: "Act three",
    title: "Moved on, one seat down",
    body: "The vines are moulded by hand, leaf by leaf. When the tea runs out, everyone shuffles one place to the left, and that is the whole rule.",
    image: { src: `${TEA}relief.jpg`, alt: "Close-up of the moulded vine leaves and grapes" },
  },
  {
    eyebrow: "Act four",
    title: "Off with its handle",
    body: "A branch of crabstock, glazed to match. The Queen of Hearts has tried to have it removed twice, and the teapot has outlasted her both times.",
    image: { src: `${TEA}handle.jpg`, alt: "Close-up of the crabstock handle, modelled as a branch" },
  },
];

function StickyDemo() {
  return (
    <Stage className="flex-col items-stretch">
      <StickyScrollReveal steps={STOPS} height={480} className="mx-auto w-full max-w-4xl" />
      <p className="mx-auto w-full max-w-4xl text-xs leading-5 text-muted">
        Photographs: <a href="https://www.metmuseum.org/art/collection/search/8346" target="_blank" rel="noreferrer" className="underline decoration-line-strong underline-offset-2 hover:text-ink">Teapot, British, ca. 1765</a>, The Metropolitan Museum of Art, CC0. Cropped and resized.
      </p>
    </Stage>
  );
}

const BOOT = ["Loading the construct", "Downloading kung fu", "Tracing the call", "Finding a hardline", "Exiting the Matrix"];

function MultiStepDemo() {
  const [current, setCurrent] = useState(1);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    if (current >= BOOT.length) {
      setRunning(false);
      return;
    }
    const t = window.setTimeout(() => setCurrent((c) => c + 1), 1100);
    return () => window.clearTimeout(t);
  }, [running, current]);
  return (
    <Stage>
      <div className="w-64 rounded-card bg-surface px-5 py-4">
        <MultiStepLoader steps={BOOT} current={current} />
      </div>
      <Variant label={current >= BOOT.length ? "I know kung fu." : running ? "Operator on the line" : "Ready"}>
        <Button
          variant="secondary"
          disabled={running}
          onClick={() => {
            setCurrent(0);
            setRunning(true);
          }}
        >
          {current >= BOOT.length ? "Run again" : "Jack in"}
        </Button>
      </Variant>
    </Stage>
  );
}

function PlaceholderDemo() {
  const [sent, setSent] = useState<string[]>([]);
  return (
    <Stage className="flex-col">
      <PlaceholderInput
        className="max-w-lg"
        label="Ask the Oracle"
        placeholders={["Where is the nearest hardline?", "How fast is 88 mph in parsecs?", "Who you gonna call?", "Is the Ark of the Covenant dishwasher safe?"]}
        onSubmit={(v) => setSent((s) => [v, ...s].slice(0, 3))}
      />
      <p className="h-5 max-w-lg truncate text-sm text-muted">{sent[0] ? `The Oracle received: “${sent[0]}”` : "Type a question and send it"}</p>
    </Stage>
  );
}

export const category: Category = {
  id: "effects",
  name: "Motion & effects",
  summary: "Animated pieces that catch the eye without shouting: text that arrives, pointers that pull, loops that hum along on the compositor.",
  entries: [
    { id: "text-animate", name: "Text animate", summary: "Headlines that arrive word by word or letter by letter as they come into view.", files: ["src/kiln/components/text-effects/TextAnimate.tsx", "src/kiln/components/shared/useLoop.ts", "src/kiln/cn.ts"], Demo: TextAnimateDemo },
    { id: "typewriter", name: "Typewriter", summary: "Phrases typed and deleted in turn, with a real caret that blinks only when idle.", files: ["src/kiln/components/text-effects/Typewriter.tsx", "src/kiln/components/shared/useLoop.ts", "src/kiln/cn.ts"], Demo: TypewriterDemo },
    { id: "word-rotate", name: "Word rotate", summary: "One word swapping in place; the cell is as wide as the longest, so nothing reflows.", files: ["src/kiln/components/text-effects/WordRotate.tsx", "src/kiln/components/shared/useLoop.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: WordRotateDemo },
    { id: "scramble-text", name: "Scramble text", summary: "A Matrix-style decode on view or hover, letter cells fixed so the line never shifts.", files: ["src/kiln/components/text-effects/ScrambleText.tsx", "src/kiln/components/shared/useLoop.ts", "src/kiln/cn.ts"], Demo: ScrambleDemo },
    { id: "dock", name: "Dock", summary: "macOS magnification by transform only: icons swell, neighbours part, the bar widens.", files: ["src/kiln/components/effects/Dock.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: DockDemo },
    { id: "tilt-card", name: "Tilt card", summary: "A card that leans towards the pointer in 3D, with layers floating above its surface.", files: ["src/kiln/components/cards/TiltCard.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: TiltDemo },
    { id: "compare-slider", name: "Compare slider", summary: "Before and after with a handle you drag or move with the arrow keys.", files: ["src/kiln/components/media/CompareSlider.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: CompareDemo },
    { id: "magnetic-button", name: "Magnetic button", summary: "A button that leans gently towards the pointer before you reach it.", files: ["src/kiln/components/buttons/MagneticButton.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: MagneticDemo },
    { id: "animated-beam", name: "Animated beam", summary: "Curved connectors with a light travelling along them, drawn as a moving dash.", files: ["src/kiln/components/effects/AnimatedBeam.tsx", "src/kiln/components/shared/useLoop.ts", "src/kiln/cn.ts"], Demo: BeamDemo },
    { id: "orbiting-circles", name: "Orbiting circles", summary: "Icons circling a centre on the compositor, upright the whole way round.", files: ["src/kiln/components/effects/OrbitingCircles.tsx", "src/kiln/components/shared/useLoop.ts", "src/kiln/cn.ts"], Demo: OrbitDemo },
    { id: "animated-list", name: "Animated list", summary: "Items landing one at a time at the top of a stack, like notifications.", files: ["src/kiln/components/effects/AnimatedList.tsx", "src/kiln/components/shared/useLoop.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: AnimatedListDemo },
    { id: "border-beam", name: "Border beam", summary: "A short bright segment running round a card’s border, following its radius exactly.", files: ["src/kiln/components/effects/BorderBeam.tsx", "src/kiln/components/shared/useLoop.ts", "src/kiln/cn.ts"], Demo: BorderBeamDemo },
    { id: "scroll-progress", name: "Scroll progress", summary: "A reading bar that fills as you scroll, smoothed so it never jumps.", files: ["src/kiln/components/wayfinding/ScrollProgress.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: ScrollProgressDemo },
    { id: "sticky-scroll-reveal", name: "Sticky scroll reveal", summary: "Words scroll past a picture that stays pinned and cross-fades with each step. Scroll-linked, so nothing re-renders per frame.", files: ["src/kiln/components/effects/StickyScrollReveal.tsx", "src/kiln/cn.ts"], Demo: StickyDemo },
    { id: "multi-step-loader", name: "Multi-step loader", summary: "A checklist that completes itself, with a line filling down as it goes.", files: ["src/kiln/components/status/MultiStepLoader.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: MultiStepDemo },
    { id: "placeholder-input", name: "Placeholder input", summary: "Example questions cycle while empty; sent text drifts up and dissolves.", files: ["src/kiln/components/text-input/PlaceholderInput.tsx", "src/kiln/components/shared/useLoop.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: PlaceholderDemo },
  ],
};
