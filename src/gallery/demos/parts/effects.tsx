import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useTransform } from "motion/react";
import {
  Bot, Gamepad2, Map, Music, Radio, Rocket, RotateCcw, Satellite, Settings, Star, Moon, Zap, Ticket,
  Coins, Snowflake, Mail, Plane,
} from "lucide-react";
import { Stage, Variant, Btn } from "../../ui";
import { Button } from "../../../kiln/components/buttons/Button";
import { TextAnimate } from "../../../kiln/components/text-effects/TextAnimate";
import { Typewriter } from "../../../kiln/components/text-effects/Typewriter";
import { WordRotate } from "../../../kiln/components/text-effects/WordRotate";
import { ScrambleText } from "../../../kiln/components/text-effects/ScrambleText";
import { Reveal } from "../../../kiln/components/effects/Reveal";
import { Dock } from "../../../kiln/components/effects/Dock";
import { TiltCard, TiltLayer } from "../../../kiln/components/cards/TiltCard";
import { CompareSlider } from "../../../kiln/components/media/CompareSlider";
import { AnimatedBeam } from "../../../kiln/components/effects/AnimatedBeam";
import { OrbitingCircles } from "../../../kiln/components/effects/OrbitingCircles";
import { AnimatedList } from "../../../kiln/components/effects/AnimatedList";
import { BorderBeam } from "../../../kiln/components/effects/BorderBeam";
import { ScrollProgress } from "../../../kiln/components/wayfinding/ScrollProgress";
import { StickyScrollReveal } from "../../../kiln/components/effects/StickyScrollReveal";
import { Parallax } from "../../../kiln/components/effects/Parallax";
import { ScrollStory } from "../../../kiln/components/effects/ScrollStory";
import { ScrollTimeline } from "../../../kiln/components/effects/ScrollTimeline";
import { ScrollWords } from "../../../kiln/components/text-effects/ScrollWords";
import { cn } from "../../../kiln/cn";
import { FloatingCard } from "../../../kiln/components/cards/FloatingCard";
import { ParallaxSection } from "../../../kiln/components/effects/ParallaxSection";
import { CardJourney, useJourney, type JourneyStop } from "../../../kiln/components/effects/CardJourney";
import { DriftField } from "../../../kiln/components/effects/DriftField";
import { SecretHunt, Secret, useSecretHunt } from "../../../kiln/components/effects/SecretHunt";
import { Firefly } from "../../../kiln/components/effects/Firefly";
import { ScrollHint } from "../../../kiln/components/wayfinding/ScrollHint";
import { Switch } from "../../../kiln/components/choice-controls/Switch";
import { Slider } from "../../../kiln/components/choice-controls/Slider";
import { Badge } from "../../../kiln/components/status/Badge";
import { VideoPlayer } from "../../../kiln/components/media/VideoPlayer";
import { Magnetic } from "../../../kiln/components/buttons/MagneticButton";
import { MultiStepLoader } from "../../../kiln/components/status/MultiStepLoader";
import { PlaceholderInput } from "../../../kiln/components/text-input/PlaceholderInput";


export function TextAnimateDemo() {
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

export function RevealDemo() {
  const [round, setRound] = useState(0);
  const lines = [
    ["Ecto-1 is fuelled", "The siren works. The suspension, less so."],
    ["Proton packs charged", "Do not cross the streams. It would be bad."],
    ["Containment unit empty", "Slimer left a note about the minibar."],
  ];
  return (
    <Stage className="flex-col items-stretch">
      <div key={round} className="mx-auto flex w-full max-w-md flex-col gap-3">
        {lines.map(([title, body], i) => (
          <Reveal key={title} delay={i * 0.08} className="rounded-control bg-surface p-4">
            <p className="font-medium text-ink">{title}</p>
            <p className="text-sm text-muted">{body}</p>
          </Reveal>
        ))}
      </div>
      <div className="mx-auto w-full max-w-md">
        <Button size="sm" variant="ghost" leading={<RotateCcw />} onClick={() => setRound((r) => r + 1)}>Play again</Button>
      </div>
    </Stage>
  );
}

export function TypewriterDemo() {
  return (
    <Stage>
      <p className="w-full max-w-xl text-[26px] font-semibold leading-snug tracking-[-0.01em]">
        <Typewriter phrases={["Wake up, Neo…", "The Matrix has you…", "Follow the white rabbit.", "Knock, knock, Neo."]} />
      </p>
    </Stage>
  );
}

export function WordRotateDemo() {
  return (
    <Stage>
      <p className="text-[28px] font-semibold leading-tight tracking-[-0.01em]">
        May the Force be with <WordRotate words={["you", "Luke", "the Rebellion", "Chewie", "us all"]} className="text-accent" />
      </p>
    </Stage>
  );
}

export function ScrambleDemo() {
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

export function DockDemo() {
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <Stage className="flex-col pt-24 sm:pt-24">
      <Dock items={DOCK.map((d) => ({ ...d, onSelect: () => setOpened(d.label) }))} />
      <span className="h-5 text-sm text-muted">{opened ? `Opened ${opened}` : "Run the pointer along the dock"}</span>
    </Stage>
  );
}

export function TiltDemo() {
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

export function CompareDemo() {
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

export function MagneticDemo() {
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

export function BeamDemo() {
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

export function OrbitDemo() {
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

export function AnimatedListDemo() {
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

export function BorderBeamDemo() {
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

export function ScrollProgressDemo() {
  const box = useRef<HTMLDivElement>(null);
  return (
    <Stage className="flex-col items-stretch">
      <div ref={box} className="relative mx-auto h-80 w-full max-w-xl overflow-y-auto overscroll-contain rounded-card border border-line bg-surface">
        <ScrollProgress container={box} className="sticky top-0 z-10" />
        <div className="sticky top-3 z-10 float-right mr-3 rounded-full bg-surface p-1">
          <ScrollProgress container={box} variant="ring" size={48} labels={{ progress: "Reading progress, as a ring" }} />
        </div>
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

export function StickyDemo() {
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

export function MultiStepDemo() {
  const [current, setCurrent] = useState(1);
  const [running, setRunning] = useState(false);
  const active = running && current < BOOT.length;
  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(() => setCurrent((c) => c + 1), 1100);
    return () => window.clearTimeout(t);
  }, [active, current]);
  return (
    <Stage>
      <div className="w-64 rounded-card bg-surface px-5 py-4">
        <MultiStepLoader steps={BOOT} current={current} />
      </div>
      <Variant label={current >= BOOT.length ? "I know kung fu." : active ? "Operator on the line" : "Ready"}>
        <Button
          variant="secondary"
          disabled={active}
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

export function PlaceholderDemo() {
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

function useBox() {
  return useRef<HTMLDivElement>(null);
}

const BOX = "relative mx-auto w-full max-w-4xl overflow-y-auto overscroll-contain rounded-card border border-line bg-surface";

export function ParallaxDemo() {
  const box = useBox();
  const cards = [
    { t: "Flux capacitor", d: -140, r: -6, x: "left-[6%]", top: "top-[30%]" },
    { t: "88 mph", d: 60, r: 4, x: "left-[38%]", top: "top-[42%]" },
    { t: "1.21 gigawatts", d: 180, r: 8, x: "right-[8%]", top: "top-[26%]" },
  ];
  return (
    <Stage className="flex-col items-stretch">
      <div ref={box} className={cn(BOX, "h-96")}>
        <div className="grid h-72 place-items-center text-sm text-muted">Scroll down</div>
        <div className="relative h-[560px]">
          <Parallax container={box} distance={40} className="absolute inset-x-0 top-[12%] text-center">
            <p className="text-5xl font-semibold tracking-[-0.03em] text-ink sm:text-7xl">Hill Valley</p>
          </Parallax>
          {cards.map((c) => (
            <Parallax key={c.t} container={box} distance={c.d} rotate={c.r} className={cn("absolute", c.x, c.top)}>
              <div className="rounded-card border border-line bg-elevated px-5 py-4 text-sm font-medium text-ink">{c.t}</div>
            </Parallax>
          ))}
        </div>
        <div className="h-72" />
      </div>
    </Stage>
  );
}

const SPEECH =
  "May the Force be with you. I’ll be back. Roads? Where we’re going, we don’t need roads. Life, uh, finds a way. There is no spoon. Who you gonna call?";

export function ScrollWordsDemo() {
  const box = useBox();
  return (
    <Stage className="flex-col items-stretch">
      <div ref={box} className={cn(BOX, "h-80 max-w-2xl px-6")}>
        <div className="grid h-60 place-items-center text-sm text-muted">Scroll down</div>
        <ScrollWords container={box} text={SPEECH} className="text-2xl font-semibold leading-snug tracking-[-0.015em] text-ink" />
        <div className="h-72" />
      </div>
    </Stage>
  );
}

const QUEST = [
  { id: "shire", time: "Spring", title: "Leave the Shire", meta: "Four hobbits, one ring", body: "“It’s a dangerous business, Frodo, going out your door.”", tags: ["Second breakfast", "Elevenses", "Packing light"] },
  { id: "rivendell", time: "Autumn", title: "The council at Rivendell", meta: "Elves, dwarves, men and a wizard", body: "“I will take the Ring, though I do not know the way.”", tags: ["Diplomacy", "Map reading", "Volunteering", "Mithril"] },
  { id: "moria", time: "Winter", title: "Through the mines", meta: "Under the mountain", body: "“You shall not pass!”", tags: ["Riddles", "Torches", "Running", "Quiet steps"] },
  { id: "mountain", time: "March", title: "Up the mountain", meta: "Two hobbits, one ring", body: "“I can’t carry it for you, but I can carry you.”", tags: ["Endurance", "Friendship", "Eagles"], current: true },
];

export function ScrollTimelineDemo() {
  const box = useBox();
  return (
    <Stage className="flex-col items-stretch">
      <div ref={box} className={cn(BOX, "h-[480px] px-6 sm:px-10")}>
        <div className="grid h-56 place-items-center text-sm text-muted">Scroll down</div>
        <ScrollTimeline container={box} items={QUEST} labels={{ current: "Now" }} />
        <div className="h-80" />
      </div>
    </Stage>
  );
}

const CHAPTERS = [
  { id: "park", eyebrow: "01", title: "Open the gates", body: "“Welcome to Jurassic Park.” A park on an island, a very large skeleton in the lobby, and a jeep ride that keeps to the rails.", icon: <Map />, figure: "Isla Nublar" },
  { id: "power", eyebrow: "02", title: "Mind the fences", body: "“Hold on to your butts.” Ten thousand volts, and the fences are only as good as the power behind them.", icon: <Zap />, figure: "10,000 V" },
  { id: "storm", eyebrow: "03", title: "Wait out the storm", body: "“Clever girl.” The rain arrives on time and the tour stops exactly where it shouldn’t.", icon: <Snowflake />, figure: "Tour paused" },
  { id: "home", eyebrow: "04", title: "Fly home", body: "“Life, uh, finds a way.” A helicopter, a long look back over the trees, and a firm decision never to return.", icon: <Plane />, figure: "Wheels up" },
];

export function ScrollStoryDemo() {
  const box = useBox();
  const steps = CHAPTERS.map((c) => ({
    id: c.id,
    eyebrow: c.eyebrow,
    title: c.title,
    body: c.body,
    visual: (
      <div className="grid size-full min-h-48 place-items-center p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-accent [&>svg]:size-10">{c.icon}</span>
          <span className="text-3xl font-semibold tracking-[-0.02em] text-ink">{c.figure}</span>
        </div>
      </div>
    ),
  }));
  return (
    <Stage className="flex-col items-stretch">
      <div ref={box} className={cn(BOX, "h-[520px] px-6")}>
        <ScrollStory container={box} steps={steps} className="[--story-vh:520px]" />
      </div>
    </Stage>
  );
}

const DEMO_VIDEO = `${import.meta.env.BASE_URL}demo/video/`;

export function FloatingCardDemo() {
  return (
    <Stage className="py-14 sm:py-16">
      <FloatingCard className="w-full max-w-xl" cardClassName="p-2">
        <VideoPlayer
          title="Big Buck Bunny"
          poster={`${DEMO_VIDEO}bbb-poster.jpg`}
          renditions={[{ label: "480p", height: 480, src: `${DEMO_VIDEO}bbb-480.webm` }, { label: "360p", height: 360, src: `${DEMO_VIDEO}bbb-360.webm` }]}
          autoPlay
          loop
        />
        <div className="flex items-center justify-between px-3 pb-2 pt-3">
          <span className="text-sm font-medium">Out of the burrow</span>
          <span className="text-xs text-muted">Plays muted while on screen</span>
        </div>
      </FloatingCard>
    </Stage>
  );
}

const ACTS = [
  { title: "The Shire", line: "Second breakfast, then elevenses. Nobody is in a hurry.", tone: "bg-surface" },
  { title: "Rivendell", line: "The council argues, and the smallest one at the table says he will go.", tone: "bg-raised" },
  { title: "Mordor", line: "One does not simply walk in. They walk in anyway.", tone: "bg-active" },
];

export function ParallaxSectionDemo() {
  const box = useBox();
  return (
    <Stage className="flex-col items-stretch">
      <div ref={box} className={cn(BOX, "h-[420px] bg-ground")}>
        {ACTS.map((a) => (
          <ParallaxSection key={a.title} container={box}>
            <div className={cn("flex h-[420px] flex-col justify-center gap-3 px-10", a.tone)}>
              <p className="text-4xl font-semibold tracking-[-0.02em]">{a.title}</p>
              <p className="max-w-md text-muted">{a.line}</p>
            </div>
          </ParallaxSection>
        ))}
      </div>
    </Stage>
  );
}

const PARK: JourneyStop[] = [
  { id: "jp-gate", label: "The gate", summary: "Where the tour begins.", side: "center", aside: <JourneyWord>Welcome</JourneyWord>,
    content: <JourneyFace no="01" title="Welcome to Jurassic Park" line="Two great doors, a torch on each side, and a jeep on a rail." /> },
  { id: "jp-centre", label: "Visitor centre", summary: "Mr DNA explains it all.", side: "left", aside: <JourneyNote title="Visitor centre" line="“We spared no expense.”" />,
    content: <JourneyFace no="02" title="The visitor centre" line="Dinosaur DNA, amber and a mosquito, in a three-minute film." /> },
  { id: "jp-paddock", label: "T. rex paddock", summary: "Watch the water glass.", side: "right", aside: <JourneyNote title="Paddock 9" line="“Must go faster.”" />,
    content: <JourneyFace no="03" title="The T. rex paddock" line="A goat, a fence with 10,000 volts, and a ripple in a cup." /> },
  { id: "jp-control", label: "Control room", summary: "Hold on to your butts.", side: "center", aside: <JourneyWord>Restart</JourneyWord>,
    content: <JourneyFace no="04" title="The control room" line="“It’s a Unix system. I know this.”" /> },
];

function JourneyFace({ no, title, line }: { no: string; title: string; line: string }) {
  return (
    <div className="flex size-full flex-col justify-between p-6">
      <span className="text-sm text-faint tabular">{no} / 04</span>
      <div>
        <p className="text-2xl font-semibold tracking-[-0.02em] text-ink">{title}</p>
        <p className="mt-2 max-w-xs text-sm text-muted">{line}</p>
      </div>
    </div>
  );
}
function JourneyWord({ children }: { children: string }) {
  return <p className="select-none text-[clamp(56px,11vw,128px)] font-semibold leading-none tracking-[-0.04em] text-active">{children}</p>;
}
function JourneyNote({ title, line }: { title: string; line: string }) {
  return (
    <div className="max-w-[16rem]">
      <p className="text-xl font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm text-muted">{line}</p>
    </div>
  );
}
function JourneyDust() {
  const j = useJourney();
  const fallback = useMotionValue(0);
  const p = j?.progress ?? fallback;
  const near = useTransform(p, (v) => `${v * -60}%`);
  const far = useTransform(p, (v) => `${v * -25}%`);
  return (
    <>
      <motion.div style={{ y: far }} className="absolute inset-0">
        {[[12, 20], [78, 34], [30, 70], [88, 82], [55, 120], [18, 150]].map(([x, y], i) => (
          <span key={i} className="absolute size-2 rounded-full bg-line-strong" style={{ left: `${x}%`, top: `${y}%` }} />
        ))}
      </motion.div>
      <motion.div style={{ y: near }} className="absolute inset-0">
        {[[8, 60], [66, 18], [92, 110], [40, 140], [72, 190]].map(([x, y], i) => (
          <span key={i} className="absolute size-3 rounded-full bg-accent-soft" style={{ left: `${x}%`, top: `${y}%` }} />
        ))}
      </motion.div>
    </>
  );
}

export function CardJourneyDemo() {
  const box = useBox();
  const [at, setAt] = useState(0);
  return (
    <Stage className="flex-col items-stretch">
      <div ref={box} className={cn(BOX, "h-[480px] bg-ground")} style={{ ["--journey-vh" as string]: "4.8px" }}>
        <CardJourney
          stops={PARK}
          container={box}
          backdrop={<JourneyDust />}
          onStopChange={setAt}
          sizeClassName="w-[min(78%,360px)] h-[260px]"
          aria-label="A tour of the park"
        />
      </div>
      <p className="text-center text-sm text-muted">Scroll inside the box. Now at: <span className="text-ink">{PARK[at]?.label}</span></p>
    </Stage>
  );
}


const DRIFT_PAGES = ["Hill Valley, 1955", "The clock tower", "Lone Pine Mall", "Hill Valley, 2015", "Biff's Pleasure Paradise"];

function useDriftControls() {
  const [on, setOn] = useState(true);
  const [watts, setWatts] = useState([121]);
  return [
    { side: "left" as const, tilt: -4, content: <Switch label="Flux capacitor" checked={on} onCheckedChange={setOn} /> },
    { side: "left" as const, tilt: 3, content: <div className="w-40"><Slider label="Gigawatts" min={0} max={221} value={watts} onChange={setWatts} format={(n) => (n / 100).toFixed(2)} /></div> },
    { side: "right" as const, tilt: 4, content: <Badge tone={on ? "positive" : "neutral"} dot>{on ? "Fluxing" : "Idle"}</Badge> },
    { side: "right" as const, pin: true, content: <span className="text-sm font-medium tabular">{(watts[0] / 100).toFixed(2)} GW</span> },
  ];
}

export function DriftFieldDemo() {
  const box = useBox();
  const { scrollY } = useScroll({ container: box });
  const screens = useTransform(scrollY, (y) => y / 420);
  const items = useDriftControls();
  return (
    <Stage className="flex-col items-stretch">
      <div className="relative mx-auto w-full max-w-4xl">
        <div ref={box} className={cn(BOX, "h-[420px] bg-ground")}>
          {DRIFT_PAGES.map((t, i) => (
            <section key={t} className="mx-auto flex h-[420px] max-w-sm flex-col justify-center gap-2 px-6">
              <span className="text-sm text-faint tabular">{String(i + 1).padStart(2, "0")}</span>
              <p className="text-3xl font-semibold tracking-[-0.02em]">{t}</p>
            </section>
          ))}
        </div>
        <DriftField items={items} progress={screens} inset={{ left: "1rem", right: "1rem" }} className="rounded-card" aria-label="Time machine controls" />
      </div>
      <p className="text-center text-sm text-muted">Scroll inside the box: the controls drift up at two speeds and loop back in, and the reading pinned bottom right stays put. They all work.</p>
    </Stage>
  );
}

function HuntCount() {
  const { found, total, reset } = useSecretHunt();
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="tabular text-muted">{found.size} of {total} stones</span>
      {found.size > 0 && <Btn size="sm" variant="ghost" onClick={reset}>Put them back</Btn>}
    </div>
  );
}

export function SecretHuntDemo() {
  return (
    <Stage className="flex-col items-stretch">
      <SecretHunt total={3} labels={{ found: (n, t) => `Sankara stone ${n} of ${t}`, complete: () => "Fortune and glory, kid. All three stones." }}>
        <div className="relative mx-auto grid w-full max-w-2xl gap-4 sm:grid-cols-3">
          {[
            { title: "Pankot Palace", body: "Dinner is served: snake surprise, chilled monkey brains.", id: "palace" },
            { title: "The mine", body: "Mind the cart on the downhill stretch. And the water.", id: "mine" },
            { title: "The rope bridge", body: "Hold on to the rope. Prices of crocodiles are rising.", id: "bridge" },
          ].map((c) => (
            <div key={c.id} className="relative rounded-card bg-surface p-5 pb-10">
              <p className="font-semibold">{c.title}</p>
              <p className="mt-1 text-sm text-ink">{c.body}</p>
              <Secret id={c.id} label="A Sankara stone" className="absolute bottom-2 right-2" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center"><HuntCount /></div>
      </SecretHunt>
      <p className="text-center text-sm text-muted">Three stones are hidden in the cards. Each one lifts away when you take it, and the count stays until you put them back.</p>
    </Stage>
  );
}

export function FireflyDemo() {
  return (
    <Stage className="flex-col items-stretch">
      <div className="dark relative mx-auto h-[300px] w-full max-w-3xl overflow-hidden rounded-card bg-ground text-ink">
        <Firefly count={5} message="Shiny. Let's be bad guys." />
        <p className="pointer-events-none absolute bottom-5 left-6 text-sm text-muted">Serenity Valley, after dark</p>
      </div>
      <p className="text-center text-sm text-muted">Catch one: it flares and says something. Without a message they are only to look at.</p>
    </Stage>
  );
}

export function ScrollHintDemo() {
  const box = useBox();
  const [shown, setShown] = useState(true);
  return (
    <Stage className="flex-col items-stretch">
      <div ref={box} className={cn(BOX, "h-[320px] bg-ground")}>
        <section className="relative grid h-[320px] place-items-center">
          <p className="text-3xl font-semibold tracking-[-0.02em]">Welcome to Jurassic Park</p>
          <ScrollHint show={shown} className="absolute bottom-5 left-1/2 -translate-x-1/2" onClick={() => box.current?.scrollTo({ top: 320, behavior: "smooth" })} />
        </section>
        <section className="grid h-[320px] place-items-center bg-raised">
          <p className="text-xl font-medium">Hold on to your butts.</p>
        </section>
      </div>
      <Btn variant="secondary" size="sm" className="self-center" onClick={() => setShown((v) => !v)}>{shown ? "Hide the hint" : "Show the hint"}</Btn>
    </Stage>
  );
}
