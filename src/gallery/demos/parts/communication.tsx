import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { Stage, Variant, Btn } from "../../ui";
import { easeOut, fade, springFirm } from "../../../kiln/motion";
import { Button } from "../../../kiln/components/buttons/Button";
import { Dialog } from "../../../kiln/components/overlays/Dialog";
import { Avatar } from "../../../kiln/components/data-display/Avatar";
import { NotificationCenter, type Notice } from "../../../kiln/components/notices/NotificationCenter";
import { ChatThread, type ChatMessage } from "../../../kiln/components/communication/ChatThread";
import { CommentThread, type Comment } from "../../../kiln/components/communication/CommentThread";
import { ProductTour, type TourStep } from "../../../kiln/components/guidance/ProductTour";
import { CookieConsent, type ConsentCategory, type ConsentChoice } from "../../../kiln/components/notices/CookieConsent";
import { UndoBar, type UndoItem } from "../../../kiln/components/notices/UndoBar";
import { Meter } from "../../../kiln/components/status/Meter";


const NOTICES: Notice[] = [
  { id: "n1", actor: "Leia Organa", text: "mentioned you in Rebel briefing: bring the plans to Yavin 4.", time: "2 min", unread: true, mention: true },
  { id: "n2", actor: "Han Solo", text: "replied to “I love you”: I know.", time: "14 min", unread: true },
  { id: "n3", actor: "Lando Calrissian", text: "changed the terms of the Cloud City deal. Again.", time: "3 h", unread: true },
  { id: "n4", actor: "Obi-Wan Kenobi", text: "shared “The Force: a beginner’s guide” with you.", time: "5 h", unread: false },
  { id: "n5", actor: "Yoda", text: "commented on your training plan: Do or do not. There is no try.", time: "Yesterday", unread: false, mention: true },
  { id: "n6", actor: "Darth Vader", text: "asked for access to the Death Star plans.", time: "Yesterday", unread: false },
];

const INCOMING: Array<Omit<Notice, "id" | "time" | "unread">> = [
  { actor: "Chewbacca", text: "reacted to your hyperdrive repair with a roar." },
  { actor: "R2-D2", text: "mentioned you: beep boop, urgent message from General Kenobi.", mention: true },
  { actor: "C-3PO", text: "calculated the odds of your asteroid plan: 3,720 to 1." },
];

export function NotificationCenterDemo() {
  const [items, setItems] = useState(NOTICES);
  const k = useRef(0);
  return (
    <Stage>
      <div className="flex h-14 w-full max-w-lg items-center gap-3 rounded-card bg-surface pl-4 pr-2">
        <span className="text-sm font-semibold">Rebel Alliance</span>
        <span className="hidden text-sm text-muted sm:inline">Missions</span>
        <span className="hidden text-sm text-muted sm:inline">Fleet</span>
        <span className="ml-auto" />
        <NotificationCenter items={items} onItemsChange={setItems} />
        <Avatar name="Luke Skywalker" size="sm" />
      </div>
      <Variant label="Try it">
        <Button
          size="sm"
          variant="secondary"
          leading={<Plus />}
          onClick={() => {
            const n = INCOMING[k.current++ % INCOMING.length];
            setItems((xs) => [{ ...n, id: `in-${k.current}`, time: "Just now", unread: true }, ...xs]);
          }}
        >
          New notice
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setItems(NOTICES)}>Reset</Button>
      </Variant>
    </Stage>
  );
}

const ME = "Marty McFly";
const DOC = "Emmett Brown";

const CHAT: ChatMessage[] = [
  { id: "c1", author: DOC, at: 60, text: "Marty! Meet me at Twin Pines Mall tonight at 1:15." },
  { id: "c2", author: DOC, at: 61, text: "I’ve made a major breakthrough. I’ll need your assistance." },
  { id: "c3", author: ME, at: 63, text: "Doc, it’s one in the morning. Where are you?" },
  { id: "c4", author: ME, at: 63, text: "And where have you been all week?" },
  { id: "c5", author: DOC, at: 64, text: "Working. Bring the video camera." },
  { id: "c6", author: ME, at: 75, text: "OK I’m here. Why is Einstein in a DeLorean?" },
  { id: "c7", author: DOC, at: 76, text: "If my calculations are correct, when this baby hits 88 miles per hour, you’re gonna see some serious stuff." },
  { id: "c8", author: DOC, at: 76, text: "1.21 gigawatts, Marty." },
];

const DOC_LINES = [
  "Great Scott!",
  "Roads? Where we’re going, we don’t need roads.",
  "Your future is whatever you make it. So make it a good one.",
  "This is heavy.",
  "Marty, you’ve got to come back with me!",
];

export function ChatDemo() {
  const [messages, setMessages] = useState(CHAT);
  const [typing, setTyping] = useState<string | null>(null);
  const t = useRef(0);
  const n = useRef(0);
  const docSays = (delay: number) => {
    window.clearTimeout(t.current);
    setTyping(DOC);
    t.current = window.setTimeout(() => {
      setTyping(null);
      setMessages((ms) => [...ms, { id: `doc-${++n.current}`, author: DOC, at: (ms[ms.length - 1]?.at ?? 80) + 1, text: DOC_LINES[n.current % DOC_LINES.length] }]);
    }, delay);
  };
  return (
    <Stage className="flex-col items-stretch">
      <ChatThread
        className="mx-auto w-full max-w-md"
        messages={messages}
        me={ME}
        typing={typing}
        height={380}
        placeholder="Message Doc"
        onSend={(text) => {
          setMessages((ms) => [...ms, { id: `me-${++n.current}`, author: ME, at: (ms[ms.length - 1]?.at ?? 80) + 1, text }]);
          docSays(1600);
        }}
      />
      <div className="mx-auto flex w-full max-w-md flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => docSays(900)}>Doc replies</Button>
        <Button size="sm" variant="ghost" onClick={() => { window.clearTimeout(t.current); setTyping(null); setMessages(CHAT); }}>Reset</Button>
      </div>
    </Stage>
  );
}

const COMMENTS: Comment[] = [
  {
    id: "g1",
    author: "Gandalf",
    time: "3 h",
    text: "The Ring must be taken deep into Mordor and cast back into the fiery chasm from whence it came. Who will take it?",
    reactions: { agree: 4 },
    replies: [
      { id: "f1", author: "Frodo Baggins", time: "2 h", text: "I will take it. Though I do not know the way.", reactions: { love: 6 }, mine: ["love"] },
      { id: "s1", author: "Samwise Gamgee", time: "2 h", text: "Mr. Frodo’s not going anywhere without me.", reactions: { love: 5, funny: 2 } },
    ],
  },
  {
    id: "b1",
    author: "Boromir",
    time: "2 h",
    text: "One does not simply walk into Mordor.",
    reactions: { funny: 12, agree: 3 },
    replies: [{ id: "l1", author: "Legolas", time: "1 h", text: "Have you heard nothing Lord Elrond has said?", reactions: { agree: 4 } }],
  },
  { id: "gi1", author: "Gimli", time: "1 h", text: "And my axe!", reactions: { love: 7 } },
];

export function CommentDemo() {
  const [comments, setComments] = useState(COMMENTS);
  return (
    <Stage className="flex-col items-stretch">
      <div className="mx-auto w-full max-w-xl rounded-card border border-line bg-surface px-4 py-2 sm:px-5">
        <CommentThread comments={comments} onChange={setComments} me="Samwise Gamgee" />
      </div>
      <div className="mx-auto w-full max-w-xl">
        <Button size="sm" variant="ghost" leading={<RotateCcw />} onClick={() => setComments(COMMENTS)}>Reset the council</Button>
      </div>
    </Stage>
  );
}

const STEPS: TourStep[] = [
  { target: '[data-tour="search"]', title: "Find any sighting", body: "Search by address, apparition class or the name of whoever called." },
  { target: '[data-tour="call"]', title: "Log a new call", body: "Every call becomes a job for the Ecto-1. Average response time is 4 minutes.", side: "bottom" },
  { target: '[data-tour="grid"]', title: "Watch the containment grid", body: "When it passes 90%, Egon wants to know. Shutting it off is never the answer.", side: "top" },
  { target: '[data-tour="crew"]', title: "Your crew", body: "Peter, Ray, Egon and Winston. Whatever happens, don’t cross the streams.", side: "left" },
];

export function TourDemo() {
  const [open, setOpen] = useState(false);
  const [finished, setFinished] = useState(false);
  return (
    <Stage className="flex-col items-stretch">
      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-card border border-line bg-surface">
        <div className="flex h-14 items-center gap-3 border-b border-line px-3 sm:px-4">
          <span className="hidden text-sm font-semibold sm:inline">Ghostbusters</span>
          <label data-tour="search" className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-control bg-raised px-3 text-sm text-faint sm:max-w-64">
            <Search className="size-4 shrink-0" />
            <input placeholder="Search sightings" aria-label="Search sightings" className="min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-faint" />
          </label>
          <span className="ml-auto" />
          <Btn data-tour="call" size="sm" leading={<Plus />}>New call</Btn>
          <span data-tour="crew" className="flex -space-x-2">
            {["Peter Venkman", "Ray Stantz", "Egon Spengler"].map((n) => (
              <Avatar key={n} name={n} size="sm" className="rounded-full ring-2 ring-surface" />
            ))}
          </span>
        </div>
        <div className="grid gap-4 p-4 sm:grid-cols-[1fr_260px]">
          <ul className="space-y-2 text-sm">
            {[
              ["Sedgewick Hotel, 12th floor", "Class 5 full-roaming vapour"],
              ["New York Public Library", "Free-floating, full torso apparition"],
              ["55 Central Park West", "Gatekeeper, possible Keymaster"],
            ].map(([a, b]) => (
              <li key={a} className="rounded-control bg-raised px-3 py-2.5">
                <p className="font-medium">{a}</p>
                <p className="text-[13px] text-muted">{b}</p>
              </li>
            ))}
          </ul>
          <div data-tour="grid" className="self-start rounded-control bg-raised p-3">
            <Meter label="Containment" value={82} max={100} unit="PKE" decimals={0} />
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-2xl items-center gap-3">
        <Button onClick={() => { setFinished(false); setOpen(true); }}>Start the tour</Button>
        <AnimatePresence>
          {finished && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} className="text-sm text-muted">
              Tour finished. Who you gonna call?
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <ProductTour steps={STEPS} open={open} onOpenChange={setOpen} onFinish={() => setFinished(true)} />
    </Stage>
  );
}

const CONSENT: ConsentCategory[] = [
  { id: "essential", label: "Essential", description: "Keeps you signed in to Bag End. Always on.", required: true },
  { id: "analytics", label: "Analytics", description: "Counts how many hobbits visit, anonymously." },
  { id: "marketing", label: "Offers", description: "Tells you when the Green Dragon has a new ale." },
];

export function CookieDemo() {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<ConsentChoice | null>(null);
  const [policy, setPolicy] = useState(false);
  return (
    <Stage>
      <Dialog
        open={policy}
        onOpenChange={setPolicy}
        title="Cookie policy"
        footer={<Button onClick={() => setPolicy(false)}>Understood</Button>}
      >
        <div className="space-y-3 text-sm text-ink">
          <p>Essential cookies keep you signed in to Bag End. Analytics count visits without naming anyone. Offers tell you when the Green Dragon has a new ale.</p>
          <p>“It’s a dangerous business, Frodo, going out your door.” You can change your mind at any time.</p>
        </div>
      </Dialog>
      <Variant label={saved ? `Saved: ${CONSENT.filter((c) => saved[c.id]).map((c) => c.label).join(", ")}` : "Opens in the bottom-left corner of the window"}>
        <Button variant="secondary" onClick={() => setOpen(true)}>Show the consent card</Button>
      </Variant>
      <CookieConsent
        open={open}
        categories={CONSENT}
        title="Cookies, and second breakfast"
        policy={<button type="button" onClick={() => setPolicy(true)} className="text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent">Policy</button>}
        onDecide={(c) => { setSaved(c); setOpen(false); }}
      >
        We use cookies to remember you’re from the Shire and to see which pages are worth a second visit. Elevenses are optional.
      </CookieConsent>
    </Stage>
  );
}

const CREW = [
  { id: "dallas", name: "Dallas", role: "Captain" },
  { id: "kane", name: "Kane", role: "Executive officer" },
  { id: "ripley", name: "Ellen Ripley", role: "Warrant officer" },
  { id: "ash", name: "Ash", role: "Science officer" },
  { id: "lambert", name: "Lambert", role: "Navigator" },
  { id: "parker", name: "Parker", role: "Chief engineer" },
  { id: "jones", name: "Jones", role: "Ship’s cat" },
];

export function UndoDemo() {
  const [present, setPresent] = useState(() => new Set(CREW.map((c) => c.id)));
  const [pending, setPending] = useState<UndoItem | null>(null);
  const [gone, setGone] = useState<string[]>([]);
  const remove = (id: string) => {
    const who = CREW.find((c) => c.id === id)!;
    setPresent((s) => { const n = new Set(s); n.delete(id); return n; });
    setPending({ id, message: <>Removed <strong className="font-semibold">{who.name}</strong> from the Nostromo crew</> });
  };
  return (
    <Stage className="flex-col items-stretch">
      <div className="mx-auto w-full max-w-md">
        <ul className="rounded-card border border-line bg-surface px-1.5 py-1.5">
          <AnimatePresence initial={false}>
            {CREW.filter((c) => present.has(c.id)).map((c) => (
              <motion.li
                key={c.id}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1, transition: { height: springFirm, opacity: { ...fade, delay: 0.08 } } }}
                exit={{ height: 0, opacity: 0, transition: { height: { ...springFirm, delay: 0.06 }, opacity: { duration: 0.12, ease: easeOut } } }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 rounded-control px-2.5 py-2 transition-colors hover:bg-raised">
                  <Avatar name={c.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-5">{c.name}</p>
                    <p className="text-xs leading-4 text-muted">{c.role}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${c.name}`}
                    onClick={() => remove(c.id)}
                    className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-active hover:text-negative"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
          {present.size === 0 && <li className="px-2.5 py-6 text-center text-sm text-muted">In space, no one can hear you scream. The crew list is empty.</li>}
        </ul>
        <UndoBar
          item={pending}
          onUndo={(id) => {
            setPresent((s) => new Set(s).add(id));
            setPending((p) => (p?.id === id ? null : p));
          }}
          onCommit={(id) => {
            setGone((g) => [...g, id]);
            setPending((p) => (p?.id === id ? null : p));
          }}
        />
        <div className="mt-3 flex items-center gap-3">
          <Button size="sm" variant="ghost" leading={<RotateCcw />} onClick={() => { setPresent(new Set(CREW.map((c) => c.id))); setPending(null); setGone([]); }}>
            Reset crew
          </Button>
          {gone.length > 0 && <span className="text-[13px] text-muted">{gone.length} left behind for good</span>}
        </div>
      </div>
    </Stage>
  );
}
