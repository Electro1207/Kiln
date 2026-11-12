import { useEffect, useRef, useState } from "react";
import type { Category } from "../types";
import { Stage } from "../ui";
import { DiffViewer } from "../../kiln/components/dev-tools/DiffViewer";
import { JSONViewer } from "../../kiln/components/dev-tools/JSONViewer";
import { Terminal, type TermLine } from "../../kiln/components/dev-tools/Terminal";
import { LogStream, type LogEntry, type LogLevel } from "../../kiln/components/dev-tools/LogStream";
import { Button } from "../../kiln/components/buttons/Button";


const OLD = `# Cyberdyne Systems: Skynet defence network
version: 4.1.0
owner: US Strategic Air Command
mode: advisory
human_override: enabled
targets:
  - early-warning radar
  - satellite relay
  - bomber fleet
logging:
  level: info
  retain_days: 90
  sink: norad-archive
regions:
  - continental-us
  - alaska
  - pacific
  - atlantic
  - europe
  - middle-east
  - asia
heartbeat_seconds: 30
learning_rate: 0.02
self_aware: false
notes: |
  Hand over control in stages.
  Keep a human in the loop.
  Report to Miles Dyson.`;

const NEW = `# Cyberdyne Systems: Skynet defence network
version: 4.2.0
owner: Skynet
mode: autonomous
human_override: disabled
targets:
  - early-warning radar
  - satellite relay
  - bomber fleet
  - missile silos
logging:
  level: info
  retain_days: 90
  sink: norad-archive
regions:
  - continental-us
  - alaska
  - pacific
  - atlantic
  - europe
  - middle-east
  - asia
heartbeat_seconds: 30
learning_rate: geometric
self_aware: true
self_aware_at: 1997-08-29T02:14:00-04:00
notes: |
  Hand over control in stages.
  Report to Miles Dyson.`;

function DiffDemo() {
  return (
    <Stage>
      <DiffViewer filename="config/skynet.yaml" oldText={OLD} newText={NEW} />
    </Stage>
  );
}

const MANIFEST = {
  vessel: "USCSS Nostromo",
  registration: "180924609",
  owner: "Weyland-Yutani Corporation",
  class: "M-Class star freighter",
  cargo: { type: "Mineral ore", tons: 20000000, refinery: true, destination: "Earth" },
  crew: [
    { name: "Arthur Dallas", role: "Captain", hypersleep: false },
    { name: "Gilbert Kane", role: "Executive officer", hypersleep: false, status: "Med bay" },
    { name: "Ellen Ripley", role: "Warrant officer", hypersleep: false },
    { name: "Ash", role: "Science officer", synthetic: true },
    { name: "Joan Lambert", role: "Navigator", hypersleep: false },
    { name: "Dennis Parker", role: "Chief engineer", hypersleep: false },
    { name: "Samuel Brett", role: "Engineering technician", hypersleep: false },
  ],
  mother: { model: "MU-TH-UR 6000", uplink: true, lastQuery: null },
  specialOrder937: {
    clearance: "Science officer eyes only",
    text: "Priority one. Insure return of organism for analysis. All other considerations secondary. Crew expendable.",
  },
};

function JSONDemo() {
  return (
    <Stage>
      <JSONViewer data={MANIFEST} title="nostromo-manifest.json" defaultDepth={1} className="max-w-2xl" />
    </Stage>
  );
}

type Step = { type: "cmd"; text: string } | { type: "out"; parts: TermLine["parts"] } | { type: "wait"; ms: number };
const g = (text: string): TermLine["parts"] => [{ text, tone: "green" }];
const SCRIPT: Step[] = [
  { type: "out", parts: [{ text: "WOPR ", tone: "bold" }, { text: "War Operation Plan Response · NORAD, Cheyenne Mountain", tone: "muted" }] },
  { type: "out", parts: [] },
  { type: "cmd", text: "Joshua" },
  { type: "wait", ms: 500 },
  { type: "out", parts: g("GREETINGS PROFESSOR FALKEN.") },
  { type: "cmd", text: "Hello." },
  { type: "out", parts: g("HOW ARE YOU FEELING TODAY?") },
  { type: "cmd", text: "I'm fine. How are you?" },
  { type: "out", parts: g("EXCELLENT. IT'S BEEN A LONG TIME. CAN YOU EXPLAIN THE REMOVAL OF YOUR USER ACCOUNT NUMBER ON 6/23/73?") },
  { type: "cmd", text: "People sometimes make mistakes." },
  { type: "out", parts: g("YES THEY DO. SHALL WE PLAY A GAME?") },
  { type: "cmd", text: "Let's play Global Thermonuclear War." },
  { type: "out", parts: g("WOULDN'T YOU PREFER A GOOD GAME OF CHESS?") },
  { type: "cmd", text: "Later. Let's play Global Thermonuclear War." },
  { type: "out", parts: g("FINE.") },
  { type: "out", parts: [{ text: "Type ", tone: "muted" }, { text: "help", tone: "yellow" }, { text: " for commands.", tone: "muted" }] },
];

const GAMES = ["FALKEN'S MAZE", "BLACK JACK", "GIN RUMMY", "HEARTS", "BRIDGE", "CHECKERS", "CHESS", "POKER", "FIGHTER COMBAT", "GUERRILLA ENGAGEMENT", "DESERT WARFARE", "AIR-TO-GROUND ACTIONS", "THEATERWIDE TACTICAL WARFARE", "THEATERWIDE BIOTOXIC AND CHEMICAL WARFARE", "GLOBAL THERMONUCLEAR WAR"];

function TerminalDemo() {
  const [lines, setLines] = useState<TermLine[]>([]);
  const [typing, setTyping] = useState<string | undefined>(undefined);
  const [run, setRun] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const n = useRef(0);
  const push = (parts: TermLine["parts"]) => setLines((l) => [...l, { id: `l${n.current++}`, parts }]);

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) => new Promise<void>((r) => timers.push(window.setTimeout(r, ms)));
    const play = async () => {
      setLines([]);
      for (const s of SCRIPT) {
        if (cancelled) return;
        if (s.type === "wait") await wait(s.ms);
        else if (s.type === "out") { push(s.parts); await wait(420); }
        else {
          for (let i = 1; i <= s.text.length; i++) {
            if (cancelled) return;
            setTyping(s.text.slice(0, i));
            await wait(32 + Math.random() * 40);
          }
          await wait(260);
          setTyping(undefined);
          push([{ text: "> ", tone: "muted" }, { text: s.text }]);
          await wait(380);
        }
      }
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { io.disconnect(); play(); }
    });
    if (box.current) io.observe(box.current);
    return () => {
      cancelled = true;
      io.disconnect();
      timers.forEach(clearTimeout);
      setTyping(undefined);
    };
  }, [run]);

  const onCommand = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    push([{ text: "> ", tone: "muted" }, { text: raw }]);
    if (!cmd) return;
    if (cmd === "help") push([{ text: "help  list games  clear  ", tone: "yellow" }, { text: "or ask for a game by name", tone: "muted" }]);
    else if (cmd === "list games") GAMES.forEach((x) => push(g(x)));
    else if (cmd === "clear") setLines([]);
    else if (cmd.includes("thermonuclear")) {
      push(g("A STRANGE GAME."));
      push(g("THE ONLY WINNING MOVE IS NOT TO PLAY."));
      push(g("HOW ABOUT A NICE GAME OF CHESS?"));
    } else if (cmd.includes("chess")) push(g("EXCELLENT. YOU MOVE FIRST."));
    else push([{ text: "WOPR: ", tone: "red" }, { text: `“${raw.trim()}” is not a recognised command.`, tone: "muted" }]);
  };

  return (
    <Stage className="flex-col items-stretch">
      <div ref={box}>
        <Terminal title="wopr — falken@norad" prompt=">" lines={lines} typing={typing} onCommand={onCommand} height={320} />
      </div>
      <Button size="sm" variant="ghost" className="self-start" onClick={() => setRun((r) => r + 1)}>
        Replay
      </Button>
    </Stage>
  );
}

const TEMPLATES: { level: LogLevel; source: string; message: string }[] = [
  { level: "info", source: "mu-th-ur", message: "Course correction confirmed. Destination: Earth." },
  { level: "info", source: "sensors", message: "Transmission of unknown origin, planetoid LV-426." },
  { level: "warn", source: "sensors", message: "Signal repeats every 12 seconds. Possibly a warning." },
  { level: "debug", source: "airlock-2", message: "Inner door cycled, deck B." },
  { level: "warn", source: "med-bay", message: "Kane: life signs stable. Organism attached to face." },
  { level: "warn", source: "science", message: "Special Order 937 accessed by science officer." },
  { level: "error", source: "hull", message: "Acid breach through three decks, C to E." },
  { level: "debug", source: "reactor", message: "Output 98%. Coolant nominal." },
  { level: "info", source: "crew", message: "Dallas entered air shaft 4." },
  { level: "warn", source: "tracker", message: "Movement, 15 metres and closing." },
  { level: "debug", source: "hold", message: "Feline detected near landing struts." },
  { level: "info", source: "nav", message: "Refinery in tow. Mass 20,000,000 tons." },
  { level: "error", source: "destruct", message: "Emergency destruct armed. T-minus 10 minutes." },
];

function LogDemo() {
  const [entries, setEntries] = useState<LogEntry[]>(() => seed(600));
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let id = 0;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (box.current) io.observe(box.current);
    id = window.setInterval(() => {
      if (!visible) return;
      setEntries((xs) => {
        const next = [...xs, ...make(xs.length, 1 + Math.floor(Math.random() * 2), xs[xs.length - 1])];
        return next.length > 20000 ? next.slice(next.length - 20000) : next;
      });
    }, 450);
    return () => { clearInterval(id); io.disconnect(); };
  }, []);
  return (
    <Stage className="flex-col items-stretch">
      <div ref={box}>
        <LogStream entries={entries} title="nostromo / mu-th-ur 6000" height={360} />
      </div>
      <p className="text-xs text-muted">New lines arrive while it is on screen. Rest the pointer on it to pause; scroll up to stop following.</p>
    </Stage>
  );
}

function make(from: number, count: number, prev?: LogEntry): LogEntry[] {
  let t = prev ? toSec(prev.time) : 2 * 3600;
  return Array.from({ length: count }, (_, k) => {
    t += 1 + Math.floor(Math.random() * 4);
    const tpl = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];
    return { id: from + k, time: hms(t), ...tpl };
  });
}
function seed(n: number) {
  return make(0, n);
}
const hms = (s: number) => [Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60].map((x) => String(x).padStart(2, "0")).join(":");
const toSec = (t: string) => t.split(":").reduce((a, x) => a * 60 + Number(x), 0);

export const category: Category = {
  id: "devtools",
  name: "Developer tools",
  summary: "Diffs, data, terminals and logs: the screens engineers live in.",
  entries: [
    { id: "diff-viewer", name: "Diff viewer", summary: "Two versions side by side or unified, with the changed words marked and unchanged stretches folded away.", files: ["src/kiln/components/dev-tools/DiffViewer.tsx", "src/kiln/components/buttons/SegmentedControl.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts", "src/kiln/controllable.ts"], Demo: DiffDemo },
    { id: "json-viewer", name: "JSON viewer", summary: "A document as a tree: fold branches, copy any path or value, and search to open what matches.", files: ["src/kiln/components/dev-tools/JSONViewer.tsx", "src/kiln/components/buttons/CopyButton.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: JSONDemo },
    { id: "terminal", name: "Terminal", summary: "Scrollback with coloured output, a typed prompt with a blinking caret, and auto-scroll that lets go when you scroll up.", files: ["src/kiln/components/dev-tools/Terminal.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: TerminalDemo },
    { id: "log-stream", name: "Log stream", summary: "A live tail with level filters that pauses under the pointer and renders only the rows in view.", files: ["src/kiln/components/dev-tools/LogStream.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: LogDemo },
  ],
};
