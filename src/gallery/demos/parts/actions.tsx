import { useState } from "react";
import { Archive, ArrowRight, Bell, BellOff, Bold, Bookmark, BookmarkCheck, Copy, Download, Heart, Italic, LayoutGrid, List, Pencil, Plus, Rows3, Send, Share2, Trash2, Underline } from "lucide-react";
import { Stage, Variant, Btn, IBtn } from "../../ui";
import { Button } from "../../../kiln/components/buttons/Button";
import { Dialog } from "../../../kiln/components/overlays/Dialog";
import { ButtonGroup } from "../../../kiln/components/buttons/ButtonGroup";
import { SplitButton } from "../../../kiln/components/buttons/SplitButton";
import { SegmentedControl } from "../../../kiln/components/buttons/SegmentedControl";
import { ToggleButton } from "../../../kiln/components/buttons/ToggleButton";
import { CopyButton } from "../../../kiln/components/buttons/CopyButton";
import { Link } from "../../../kiln/components/buttons/Link";
import { HoldButton } from "../../../kiln/components/buttons/HoldButton";

export function ButtonDemo() {
  const [loading, setLoading] = useState(false);
  const send = () => { setLoading(true); window.setTimeout(() => setLoading(false), 1800); };
  return (
    <Stage align="start" className="flex-col gap-8">
      <Variant label="Variants">
        <Btn>Engage hyperdrive</Btn>
        <Btn variant="secondary">Save the timeline</Btn>
        <Btn variant="outline">Preview hologram</Btn>
        <Btn variant="ghost">Not today, Vader</Btn>
        <Btn variant="danger" leading={<Trash2 />}>Cross the streams</Btn>
      </Variant>
      <Variant label="Sizes and icons">
        <Btn size="sm" leading={<Plus />}>New Autobot</Btn>
        <Btn size="md" trailing={<ArrowRight />}>Follow the white rabbit</Btn>
        <Btn size="lg" leading={<Download />}>Download the Death Star plans</Btn>
      </Variant>
      <Variant label="Shapes: theme, pill or square, per button">
        <Btn trailing={<ArrowRight />}>Punch it, Chewie</Btn>
        <Btn shape="pill" variant="secondary">Beam me up</Btn>
        <Btn shape="square" variant="outline">Open the pod bay doors</Btn>
      </Variant>
      <Variant label="As a link: pass href and it renders an anchor that looks the same">
        <Button href="https://en.wikipedia.org/wiki/Star_Wars_opening_crawl" external trailing={<ArrowRight />}>Read the opening crawl</Button>
        <Button href="https://en.wikipedia.org/wiki/Back_to_the_Future" external variant="outline">Check the flux capacitor</Button>
      </Variant>
      <Variant label="Loading and disabled">
        <Button loading={loading} onClick={send} leading={<Send />}>Send to Hill Valley</Button>
        <Button disabled>You shall not pass</Button>
      </Variant>
    </Stage>
  );
}

export function IconButtonDemo() {
  return (
    <Stage>
      <IBtn aria-label="Edit" icon={<Pencil />} />
      <IBtn aria-label="Share" icon={<Share2 />} variant="soft" />
      <IBtn aria-label="Archive" icon={<Archive />} variant="outline" />
      <IBtn aria-label="Add" icon={<Plus />} variant="solid" size="lg" />
      <IBtn aria-label="Copy" icon={<Copy />} variant="soft" shape="square" size="sm" />
    </Stage>
  );
}

export function GroupDemo() {
  const [last, setLast] = useState("Nothing yet. The council is waiting.");
  return (
    <Stage className="flex-col">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <ButtonGroup label="Text formatting">
          <Button variant="secondary" size="sm" aria-label="Bold" onClick={() => setLast("Bold")}><Bold className="size-4" /></Button>
          <Button variant="secondary" size="sm" aria-label="Italic" onClick={() => setLast("Italic")}><Italic className="size-4" /></Button>
          <Button variant="secondary" size="sm" aria-label="Underline" onClick={() => setLast("Underline")}><Underline className="size-4" /></Button>
        </ButtonGroup>
        <SplitButton
          label="Take the red pill"
          onClick={() => setLast("Red pill. Welcome to the real world.")}
          actions={[
            { label: "Take the red pill", description: "Stay in Wonderland and see how deep it goes", onSelect: () => setLast("Red pill. Welcome to the real world.") },
            { label: "Take the blue pill", description: "Wake up in bed and believe what you want", onSelect: () => setLast("Blue pill. The story ends.") },
            { label: "Ask the Oracle first", description: "She'll tell you what you need to hear", onSelect: () => setLast("The Oracle offers you a cookie.") },
          ]}
        />
      </div>
      <p className="text-[13px] text-muted">Last choice: {last}</p>
    </Stage>
  );
}

export function SegmentedDemo() {
  const [view, setView] = useState<"grid" | "list" | "rows">("grid");
  const [year, setYear] = useState<"1885" | "1955" | "1985" | "2015">("1985");
  return (
    <Stage className="flex-col gap-6">
      <SegmentedControl label="Layout" value={view} onChange={setView} options={[
        { value: "grid", label: "Grid", icon: <LayoutGrid /> },
        { value: "list", label: "List", icon: <List /> },
        { value: "rows", label: "Rows", icon: <Rows3 /> },
      ]} />
      <SegmentedControl label="Destination year" size="sm" value={year} onChange={setYear} options={[
        { value: "1885", label: "1885" }, { value: "1955", label: "1955" }, { value: "1985", label: "1985" }, { value: "2015", label: "2015" },
      ]} />
      <SegmentedControl label="Speed, large" size="lg" options={[
        { value: "light", label: "Light speed" }, { value: "ridiculous", label: "Ridiculous speed" }, { value: "ludicrous", label: "Ludicrous speed" },
      ]} />
    </Stage>
  );
}

export function ToggleDemo() {
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(true);
  const [muted, setMuted] = useState(false);
  return (
    <Stage>
      <ToggleButton pressed={saved} onPressedChange={setSaved} icon={<Bookmark />} pressedIcon={<BookmarkCheck />} pressedChildren="In the archives">Add to Jedi archives</ToggleButton>
      <ToggleButton pressed={liked} onPressedChange={setLiked} icon={<Heart />} pressedIcon={<Heart fill="currentColor" />} pressedChildren="I know">I love you</ToggleButton>
      <ToggleButton pressed={muted} onPressedChange={setMuted} icon={<Bell />} pressedIcon={<BellOff />} aria-label="Mute the Ecto-1 siren" />
      <ToggleButton size="sm" icon={<Heart />} pressedIcon={<Heart fill="currentColor" />} aria-label="Like, small" />
      <ToggleButton size="lg" icon={<Heart />} pressedIcon={<Heart fill="currentColor" />} aria-label="Like, large" />
    </Stage>
  );
}

export function CopyDemo() {
  return (
    <Stage className="flex-col">
      <div className="flex w-full max-w-md items-center gap-2 rounded-control bg-surface py-1 pl-3 pr-1">
        <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink">ssh neo@nebuchadnezzar.zion</code>
        <CopyButton value="ssh neo@nebuchadnezzar.zion" />
      </div>
      <CopyButton value="https://fellowship.example/invite/9-walkers" showLabel label="Copy Fellowship invite" copiedLabel="Invite copied" />
    </Stage>
  );
}

const DOCS = {
  safety: {
    title: "Park safety briefing",
    body: ["Stay inside the vehicle. Keep your hands and feet inside the vehicle at all times.", "If the goat is gone, so is the tour. Do not feed the Dilophosaurus, however friendly it looks.", "“Life, uh, finds a way.” So does the Velociraptor; stay behind the fence."],
  },
  terms: {
    title: "InGen terms of service",
    body: ["By boarding the monorail you agree that InGen is not liable for escaped animals, power cuts, or Dennis Nedry.", "Spared no expense is a description, not a warranty."],
  },
} as const;

export function LinkDemo() {
  const [doc, setDoc] = useState<keyof typeof DOCS | null>(null);
  const open = (k: keyof typeof DOCS) => (e: React.MouseEvent) => { e.preventDefault(); setDoc(k); };
  const cur = doc ? DOCS[doc] : null;
  return (
    <Stage className="flex-col">
      <Dialog
        open={!!doc}
        onOpenChange={(o) => !o && setDoc(null)}
        title={cur?.title ?? ""}
        footer={<Button onClick={() => setDoc(null)}>Understood</Button>}
      >
        <div className="space-y-3 text-sm text-ink">{cur?.body.map((t) => <p key={t}>{t}</p>)}</div>
      </Dialog>
      <p className="max-w-md text-center text-sm text-ink">
        Read the <Link href="#" onClick={open("safety")}>park safety briefing</Link> before the tour, or open the <Link href="https://motion.dev" external>Motion docs</Link> in a new tab.
      </p>
      <Link href="#" tone="ink" onClick={open("terms")}>InGen terms of service</Link>
    </Stage>
  );
}

export function HoldDemo() {
  const [count, setCount] = useState(0);
  return (
    <Stage className="flex-col">
      <div className="flex flex-wrap justify-center gap-3">
        <HoldButton onConfirm={() => setCount((c) => c + 1)} doneLabel="Ring destroyed">Hold to cast it into the fire</HoldButton>
        <HoldButton tone="primary" duration={0.8} onConfirm={() => setCount((c) => c + 1)} doneLabel="88 mph reached">Hold to hit 88 mph</HoldButton>
      </div>
      <p className="text-[13px] text-muted">Let go early and it rewinds. Confirmed {count} {count === 1 ? "time" : "times"}.</p>
    </Stage>
  );
}
