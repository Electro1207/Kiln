import { useRef, useState, type FormEvent } from "react";
import { AlignCenter, AlignLeft, AlignRight, Bell, Bold, Home, Inbox, Italic, Pin, Redo2, Save, Search, Share2, Underline, Undo2, User } from "lucide-react";
import { Stage, Variant } from "../../ui";
import { Button } from "../../../kiln/components/buttons/Button";
import { Checkbox } from "../../../kiln/components/choice-controls/Checkbox";
import { RadioGroup } from "../../../kiln/components/choice-controls/RadioGroup";
import { TextField } from "../../../kiln/components/text-input/TextField";
import { useToast } from "../../../kiln/components/notices/Toast";
import { ErrorSummary, type ErrorSummaryItem } from "../../../kiln/components/forms/ErrorSummary";
import { Fieldset } from "../../../kiln/components/forms/Fieldset";
import { MaskedInput } from "../../../kiln/components/text-input/MaskedInput";
import { TransferList } from "../../../kiln/components/pickers/TransferList";
import { Cascader, type CascaderOption } from "../../../kiln/components/pickers/Cascader";
import { TypeToConfirmDialog } from "../../../kiln/components/overlays/TypeToConfirmDialog";
import { Toolbar } from "../../../kiln/components/menus/Toolbar";
import { Menubar } from "../../../kiln/components/menus/Menubar";
import { BottomTabBar } from "../../../kiln/components/menus/BottomTabBar";
import { TableOfContents } from "../../../kiln/components/wayfinding/TableOfContents";
import { useMediaQuery } from "../../../kiln/components/shared/useOverlay";

/* ── ErrorSummary ─────────────────────────────────────────────────────────── */

export function ErrorSummaryDemo() {
  const { toast } = useToast();
  const [v, setV] = useState({ name: "", email: "", ship: "" });
  const [errors, setErrors] = useState<ErrorSummaryItem[]>([]);
  const [tries, setTries] = useState(0);
  const check = (x: typeof v) => {
    const out: ErrorSummaryItem[] = [];
    if (!x.name.trim()) out.push({ id: "es-name", message: "Enter your name, pilot" });
    if (!/^\S+@\S+\.\S+$/.test(x.email)) out.push({ id: "es-email", message: "Enter an email the Rebel Alliance can reach" });
    if (!x.ship.trim()) out.push({ id: "es-ship", message: "Name the ship you will fly" });
    return out;
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = check(v);
    setErrors(found);
    setTries((t) => t + 1);
    if (!found.length) toast({ title: "Welcome to Rogue Squadron", description: "May the Force be with you.", variant: "success" });
  };
  const err = (id: string) => errors.find((e) => e.id === id)?.message;
  const set = (k: keyof typeof v) => (value: string) => {
    const next = { ...v, [k]: value };
    setV(next);
    if (errors.length) setErrors(check(next));
  };
  return (
    <Stage align="start">
      <form noValidate onSubmit={submit} className="flex w-full max-w-md flex-col gap-4">
        <ErrorSummary errors={errors} focusKey={tries} />
        <TextField id="es-name" label="Pilot name" value={v.name} onValueChange={set("name")} error={err("es-name")} placeholder="Wedge Antilles" />
        <TextField id="es-email" label="Email" type="email" value={v.email} onValueChange={set("email")} error={err("es-email")} placeholder="wedge@rebellion.org" />
        <TextField id="es-ship" label="Ship" value={v.ship} onValueChange={set("ship")} error={err("es-ship")} placeholder="Snowspeeder" />
        <div className="flex flex-wrap gap-3">
          <Button type="submit">Join the squadron</Button>
          <Button type="button" variant="outline" onClick={() => { setV({ name: "Luke Skywalker", email: "luke@tatooine.net", ship: "X-wing" }); setErrors([]); }}>Fill it in</Button>
        </div>
      </form>
    </Stage>
  );
}

/* ── Fieldset ─────────────────────────────────────────────────────────────── */

export function FieldsetDemo() {
  const [crew, setCrew] = useState<string[]>([]);
  const [tried, setTried] = useState(false);
  const toggle = (id: string) => (on: boolean) => setCrew((c) => (on ? [...c, id] : c.filter((x) => x !== id)));
  const crewOptions = [["han", "Han Solo", "Pilot, smuggler"], ["chewie", "Chewbacca", "Co-pilot, mechanic"], ["leia", "Leia Organa", "Diplomat"]] as const;
  return (
    <Stage align="start" className="gap-8">
      <Fieldset legend="Who is on the Falcon?" description="Pick everyone who boards." error={tried && crew.length === 0 ? "Choose at least one crew member" : undefined} className="w-full max-w-xs">
        {crewOptions.map(([id, name, role]) => (
          <Checkbox key={id} label={name} description={role} checked={crew.includes(id)} onCheckedChange={toggle(id)} />
        ))}
        <div><Button size="sm" onClick={() => setTried(true)}>Make the jump</Button></div>
      </Fieldset>
      <Fieldset legend="Landing bay" description="Where do you set down?" bordered className="w-full max-w-xs">
        <RadioGroup label="Bay" hideLabel defaultValue="94" options={[{ value: "94", label: "Docking bay 94" }, { value: "86", label: "Docking bay 86" }, { value: "3733", label: "Cloud City platform" }]} />
      </Fieldset>
      <Fieldset legend="Hyperdrive" description="Locked while the part is on order." disabled bordered className="w-full max-w-xs">
        <Checkbox label="Motivator" defaultChecked />
        <Checkbox label="Compressor" />
      </Fieldset>
    </Stage>
  );
}

/* ── MaskedInput ──────────────────────────────────────────────────────────── */

const card = (raw: string) => (/^3[47]/.test(raw) ? "9999 999999 99999" : "9999 9999 9999 9999");

export function MaskedInputDemo() {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [plate, setPlate] = useState("");
  const [chit, setChit] = useState("");
  return (
    <Stage align="start" className="gap-6">
      <div className="flex w-full max-w-xs flex-col gap-1.5">
        <MaskedInput label="Comm link" mask="(999) 999-9999" value={phone} onValueChange={setPhone} onComplete={(r) => toast({ title: "Hailing frequency open", description: r })} hint="Type or paste any digits" />
        <span className="text-xs text-muted">Raw value: <span className="tabular text-ink">{phone || "none"}</span></span>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-1.5">
        <MaskedInput label="Registration" mask="AA-9999" uppercase value={plate} onValueChange={setPlate} hint="Two letters, four digits" />
        <span className="text-xs text-muted">Raw value: <span className="tabular text-ink">{plate || "none"}</span></span>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-1.5">
        <MaskedInput label="Credit chit" mask={card} placeholder="0000 0000 0000 0000" value={chit} onValueChange={setChit} hint="Starts with 34 or 37 and the pattern changes" />
        <Button size="sm" variant="outline" className="self-start" onClick={() => setChit("378282246310005")}>Fill with an Imperial chit</Button>
      </div>
      <Variant label="Sizes">
        <MaskedInput aria-label="Small" size="sm" mask="99:99" defaultValue="1985" containerClassName="w-24" />
        <MaskedInput aria-label="Medium" size="md" mask="99:99" defaultValue="1021" containerClassName="w-28" />
        <MaskedInput aria-label="Large" size="lg" mask="99:99" defaultValue="0088" containerClassName="w-32" />
      </Variant>
    </Stage>
  );
}

/* ── TransferList ─────────────────────────────────────────────────────────── */

const FELLOWSHIP = [
  { id: "frodo", label: "Frodo Baggins", description: "Ring-bearer" },
  { id: "sam", label: "Samwise Gamgee", description: "Gardener, ring-bearer's friend" },
  { id: "merry", label: "Meriadoc Brandybuck", description: "Hobbit" },
  { id: "pippin", label: "Peregrin Took", description: "Hobbit" },
  { id: "gandalf", label: "Gandalf the Grey", description: "Wizard" },
  { id: "aragorn", label: "Aragorn", description: "Ranger, heir of Isildur" },
  { id: "legolas", label: "Legolas", description: "Elf, archer" },
  { id: "gimli", label: "Gimli", description: "Dwarf, axe" },
  { id: "boromir", label: "Boromir", description: "Man of Gondor" },
  { id: "gollum", label: "Gollum", description: "Not invited", disabled: true },
];

export function TransferListDemo() {
  const { toast } = useToast();
  const [ids, setIds] = useState<string[]>(["frodo", "sam"]);
  return (
    <Stage align="start" className="flex-col items-stretch">
      <TransferList items={FELLOWSHIP} value={ids} onChange={setIds} titles={["Gathered at Rivendell", "The Fellowship"]} />
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={ids.length === 0} onClick={() => toast({ title: `${ids.length} set out from Rivendell`, description: "You shall not pass? They shall." })}>Set out</Button>
        <Button variant="outline" onClick={() => setIds([])}>Disband</Button>
        <span className="text-xs text-muted tabular">value: [{ids.join(", ")}]</span>
      </div>
    </Stage>
  );
}

/* ── Cascader ─────────────────────────────────────────────────────────────── */

const PLACES: CascaderOption[] = [
  { value: "outer", label: "Outer Rim", children: [
    { value: "tatooine", label: "Tatooine", children: [{ value: "eisley", label: "Mos Eisley" }, { value: "espa", label: "Mos Espa" }, { value: "jabba", label: "Jabba's Palace", disabled: true }] },
    { value: "hoth", label: "Hoth", children: [{ value: "echo", label: "Echo Base" }] },
  ] },
  { value: "core", label: "Core Worlds", children: [
    { value: "coruscant", label: "Coruscant", children: [{ value: "senate", label: "Galactic Senate" }, { value: "temple", label: "Jedi Temple" }] },
    { value: "alderaan", label: "Alderaan", children: [{ value: "aldera", label: "Aldera" }] },
  ] },
  { value: "me", label: "Middle-earth", children: [
    { value: "eriador", label: "Eriador", children: [{ value: "hobbiton", label: "Hobbiton" }, { value: "bree", label: "Bree" }, { value: "rivendell", label: "Rivendell" }] },
    { value: "gondor", label: "Gondor", children: [{ value: "minas", label: "Minas Tirith" }, { value: "osgiliath", label: "Osgiliath" }] },
  ] },
  { value: "hv", label: "Hill Valley", children: [{ value: "clock", label: "Clock tower" }, { value: "mall", label: "Twin Pines Mall" }] },
  { value: "lost", label: "Lost in space", disabled: true },
];

export function CascaderDemo() {
  const { toast } = useToast();
  const [path, setPath] = useState<string[] | null>(["outer", "tatooine", "eisley"]);
  return (
    <Stage align="start" className="gap-6">
      <div className="flex w-full max-w-xs flex-col gap-2">
        <Cascader label="Destination" options={PLACES} value={path} onChange={(p) => { setPath(p); toast({ title: "Course laid in", description: p.join(" › ") }); }} />
        <span className="text-xs text-muted tabular">value: {path ? `[${path.join(", ")}]` : "null"}</span>
        <Button size="sm" variant="outline" className="self-start" onClick={() => setPath(["hv", "clock"])}>Back to the clock tower</Button>
      </div>
      <Variant label="Sizes, nothing chosen">
        <Cascader aria-label="Small" size="sm" options={PLACES} className="w-44" placeholder="Small" />
        <Cascader aria-label="Medium" size="md" options={PLACES} className="w-48" placeholder="Medium" />
        <Cascader aria-label="Large" size="lg" options={PLACES} className="w-52" placeholder="Large" />
      </Variant>
      <Variant label="Disabled">
        <Cascader aria-label="Locked" disabled options={PLACES} defaultValue={["me", "eriador", "hobbiton"]} className="w-56" />
      </Variant>
    </Stage>
  );
}

/* ── TypeToConfirmDialog ──────────────────────────────────────────────────── */

export function TypeToConfirmDialogDemo() {
  const { toast } = useToast();
  const [star, setStar] = useState(false);
  const [park, setPark] = useState(false);
  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  return (
    <Stage>
      <Variant label="Danger, case sensitive">
        <Button variant="danger" onClick={() => setStar(true)}>Destroy the Death Star</Button>
      </Variant>
      <Variant label="Default tone, any case">
        <Button variant="outline" onClick={() => setPark(true)}>Open the park</Button>
      </Variant>
      <TypeToConfirmDialog
        open={star}
        onOpenChange={setStar}
        title="Destroy the Death Star?"
        description="Alderaan is already gone. This cannot be undone, and neither can what happens next."
        confirmText="Death Star"
        confirmLabel="Fire"
        onConfirm={async () => { await wait(900); toast({ title: "Direct hit", description: "It's not a moon.", variant: "success" }); }}
      />
      <TypeToConfirmDialog
        open={park}
        onOpenChange={setPark}
        tone="default"
        caseSensitive={false}
        title="Open Jurassic Park?"
        description="Ten thousand guests are booked for Saturday."
        confirmText="Jurassic Park"
        confirmLabel="Open"
        onConfirm={async () => { await wait(600); toast({ title: "The gates are open", description: "Life, uh, finds a way." }); }}
      />
    </Stage>
  );
}

/* ── Toolbar ──────────────────────────────────────────────────────────────── */

export function ToolbarDemo() {
  const { toast } = useToast();
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(true);
  const [under, setUnder] = useState(false);
  const [align, setAlign] = useState<"left" | "center" | "right">("left");
  const say = (title: string) => () => toast({ title, description: "Do. Or do not. There is no try." });
  return (
    <Stage align="start" className="flex-col items-stretch gap-6">
      <Toolbar
        label="Text formatting"
        items={[
          { type: "group", label: "Style", items: [
            { type: "toggle", id: "bold", label: "Bold", icon: <Bold />, pressed: bold, onPressedChange: setBold },
            { type: "toggle", id: "italic", label: "Italic", icon: <Italic />, pressed: italic, onPressedChange: setItalic },
            { type: "toggle", id: "under", label: "Underline", icon: <Underline />, pressed: under, onPressedChange: setUnder },
          ] },
          { type: "group", label: "Alignment", items: [
            { type: "toggle", id: "l", label: "Align left", icon: <AlignLeft />, pressed: align === "left", onPressedChange: () => setAlign("left") },
            { type: "toggle", id: "c", label: "Align centre", icon: <AlignCenter />, pressed: align === "center", onPressedChange: () => setAlign("center") },
            { type: "toggle", id: "r", label: "Align right", icon: <AlignRight />, pressed: align === "right", onPressedChange: () => setAlign("right") },
          ] },
          { type: "group", label: "History", items: [
            { id: "undo", label: "Undo", icon: <Undo2 />, onClick: say("Undone") },
            { id: "redo", label: "Redo", icon: <Redo2 />, onClick: say("Redone"), disabled: true },
          ] },
        ]}
      />
      <p
        className="rounded-card bg-surface p-4 text-base text-ink"
        style={{ fontWeight: bold ? 700 : 400, fontStyle: italic ? "italic" : "normal", textDecoration: under ? "underline" : "none", textAlign: align }}
      >
        I find your lack of faith disturbing.
      </p>
      <div className="flex flex-wrap items-start gap-6">
        <Variant label="Vertical">
          <Toolbar orientation="vertical" label="Tools" size="sm" items={[
            { id: "a", label: "Home", icon: <Home />, onClick: say("Home") },
            { id: "b", label: "Search", icon: <Search />, onClick: say("Search") },
            { type: "separator" },
            { id: "c", label: "Alerts", icon: <Bell />, onClick: say("Alerts") },
          ]} />
        </Variant>
        <Variant label="With labels">
          <Toolbar label="Actions" items={[
            { id: "x", label: "Save", icon: <Save />, showLabel: true, onClick: say("Saved") },
            { type: "toggle", id: "y", label: "Pin", icon: <Pin />, showLabel: true },
            { id: "z", label: "Share", icon: <Share2 />, showLabel: true, onClick: say("Shared") },
          ]} />
        </Variant>
      </div>
    </Stage>
  );
}

/* ── Menubar ──────────────────────────────────────────────────────────────── */

export function MenubarDemo() {
  const [last, setLast] = useState("Nothing yet");
  const [rulers, setRulers] = useState(true);
  const [grid, setGrid] = useState(false);
  const act = (s: string) => () => setLast(s);
  return (
    <Stage align="start" className="flex-col items-start gap-4">
      <Menubar
        menus={[
          { id: "file", label: "File", items: [
            { label: "New hologram", shortcut: "Ctrl N", onSelect: act("New hologram") },
            { label: "Open…", shortcut: "Ctrl O", onSelect: act("Open") },
            { type: "submenu", label: "Open recent", items: [
              { label: "Rebel base plans", onSelect: act("Opened Rebel base plans") },
              { label: "Thermal exhaust port", onSelect: act("Opened Thermal exhaust port") },
            ] },
            { type: "separator" },
            { label: "Self-destruct", danger: true, onSelect: act("Self-destruct in 5, 4, 3…") },
          ] },
          { id: "edit", label: "Edit", items: [
            { label: "Undo", shortcut: "Ctrl Z", onSelect: act("Undo") },
            { label: "Redo", shortcut: "Ctrl Y", disabled: true },
            { type: "separator" },
            { label: "Cut", onSelect: act("Cut") },
            { label: "Copy", onSelect: act("Copy") },
            { label: "Paste", onSelect: act("Paste") },
          ] },
          { id: "view", label: "View", items: [
            { type: "checkbox", label: "Show rulers", checked: rulers, onCheckedChange: setRulers },
            { type: "checkbox", label: "Show grid", checked: grid, onCheckedChange: setGrid },
          ] },
          { id: "help", label: "Help", items: [
            { label: "Don't panic", onSelect: act("Don't panic") },
            { label: "About the Matrix", onSelect: act("There is no spoon") },
          ] },
        ]}
      />
      <p className="text-sm text-ink">Last command: <span className="font-medium">{last}</span></p>
      <p className="text-xs text-muted">Rulers {rulers ? "on" : "off"}, grid {grid ? "on" : "off"}. Try Tab, then ← → ↓ Esc.</p>
    </Stage>
  );
}

/* ── BottomTabBar ─────────────────────────────────────────────────────────── */

const QUOTES: Record<string, [string, string]> = {
  home: ["Home", "There's no place like home."],
  search: ["Search", "Looking for Sarah Connor?"],
  inbox: ["Inbox", "Great Scott! Messages from 1955."],
  alerts: ["Alerts", "Danger, Will Robinson."],
  me: ["Profile", "I am Groot."],
};

function Phone({ children, caption }: { children: React.ReactNode; caption: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-[26rem] w-[17.5rem] flex-col overflow-hidden rounded-[2rem] border-[6px] border-line-strong bg-ground">{children}</div>
      <span className="text-xs text-muted">{caption}</span>
    </div>
  );
}

export function BottomTabBarDemo() {
  const [tab, setTab] = useState("home");
  const [unread, setUnread] = useState(3);
  const [alerts, setAlerts] = useState(true);
  const [t2, setT2] = useState("a");
  const q = QUOTES[tab] ?? QUOTES.home;
  return (
    <Stage className="items-start gap-8">
      <Phone caption="Five tabs, badges">
        <div className="flex flex-1 flex-col justify-center gap-2 p-6 text-center">
          <h3 className="text-lg font-semibold text-ink">{q[0]}</h3>
          <p className="text-sm text-muted">{q[1]}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button size="sm" variant="outline" disabled={unread === 0} onClick={() => setUnread(0)}>Read all mail</Button>
            <Button size="sm" variant="outline" onClick={() => { setUnread((n) => n + 1); setAlerts(true); }}>Incoming</Button>
          </div>
        </div>
        <BottomTabBar
          position="inline"
          value={tab}
          onChange={(id) => { setTab(id); if (id === "alerts") setAlerts(false); if (id === "inbox") setUnread(0); }}
          items={[
            { id: "home", label: "Home", icon: <Home /> },
            { id: "search", label: "Search", icon: <Search /> },
            { id: "inbox", label: "Inbox", icon: <Inbox />, badge: unread },
            { id: "alerts", label: "Alerts", icon: <Bell />, badge: alerts },
            { id: "me", label: "Me", icon: <User /> },
          ]}
        />
      </Phone>
      <Phone caption="Three tabs, icons only">
        <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted">Tab: <span className="ml-1 font-medium text-ink">{t2}</span></div>
        <BottomTabBar position="inline" showLabels={false} value={t2} onChange={setT2} items={[
          { id: "a", label: "Home", icon: <Home /> },
          { id: "b", label: "Search", icon: <Search />, badge: 120 },
          { id: "c", label: "Me", icon: <User /> },
        ]} />
      </Phone>
    </Stage>
  );
}

/* ── TableOfContents ──────────────────────────────────────────────────────── */

const SECTIONS: { title: string; subs?: string[]; body: string }[] = [
  { title: "Welcome to the park", body: "John Hammond spared no expense. The visitor centre opens at nine, the first paddock at ten, and the generators are, as everyone agreed, completely under control." },
  { title: "The paddocks", subs: ["Tyrannosaurus", "Velociraptor"], body: "Every fence is electrified and every gate is checked twice. The raptors are watched most closely, because they test a fence for weakness again and again, always at the same spot." },
  { title: "The control room", body: "Dennis Nedry has the keys to the kingdom and a flight to catch. One missing line of code, and the whole island goes quiet. Hold on to your butts." },
  { title: "Chaos theory", subs: ["Life finds a way"], body: "Ian Malcolm will tell you it was always going to end this way. You can plan for everything, he says, except the thing that lives, breeds and learns." },
  { title: "Getting off the island", body: "The helicopter leaves at dawn. Bring the children, the doctors and the amber-topped cane. Leave the gift shop." },
];

export function TableOfContentsDemo() {
  const article = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const wide = useMediaQuery("(min-width: 640px)");
  const [at, setAt] = useState("");
  return (
    <Stage align="start" className="flex-col items-stretch gap-3">
      <div ref={scroller} className="relative h-96 overflow-y-auto rounded-card border border-line bg-surface">
        <div className="grid gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_13rem]">
          <div ref={article} className="order-2 flex flex-col gap-5 sm:order-1">
            <h1 className="text-xl font-semibold text-ink">Jurassic Park field guide</h1>
            {SECTIONS.map((s) => (
              <section key={s.title} className="flex flex-col gap-3">
                <h2 className="scroll-mt-4 text-lg font-semibold text-ink">{s.title}</h2>
                <p className="text-base text-ink">{s.body}</p>
                {s.subs?.map((sub) => (
                  <div key={sub} className="flex flex-col gap-2">
                    <h3 className="scroll-mt-4 text-base font-semibold text-ink">{sub}</h3>
                    <p className="text-base text-ink">Clever girl. Nobody who has met one wants to meet another, and the park rules say so in four languages.</p>
                  </div>
                ))}
                <p className="text-base text-ink">The paperwork is in the visitor centre, next to the frozen embryos and a can of shaving cream.</p>
              </section>
            ))}
          </div>
          <div className="order-1 sm:order-2">
            <TableOfContents container={article} scroller={scroller} offset={24} sticky={wide} top={0} onChange={setAt} />
          </div>
        </div>
      </div>
      <p className="text-xs text-muted">Current heading id: <span className="tabular text-ink">{at || "first"}</span></p>
    </Stage>
  );
}
