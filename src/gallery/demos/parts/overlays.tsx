import { useRef, useState } from "react";
import { Bold, Italic, Link2, List, Strikethrough, Underline, Copy, Check, MapPin, CalendarDays, Minus, Plus } from "lucide-react";
import { motion } from "motion/react";
import { Stage, Variant, Btn } from "../../ui";
import { Button } from "../../../kiln/components/buttons/Button";
import { Dialog } from "../../../kiln/components/overlays/Dialog";
import { AlertDialog } from "../../../kiln/components/overlays/AlertDialog";
import { Drawer, type DrawerSide } from "../../../kiln/components/overlays/Drawer";
import { Popover } from "../../../kiln/components/overlays/Popover";
import { Tooltip } from "../../../kiln/components/overlays/Tooltip";
import { HoverCard } from "../../../kiln/components/overlays/HoverCard";
import { ToastProvider, useToast } from "../../../kiln/components/notices/Toast";
import { Lightbox, type LightboxImage } from "../../../kiln/components/overlays/Lightbox";


const field =
  "h-10 w-full rounded-control border border-line-strong bg-surface px-3 text-sm text-ink outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent-soft";

export function DialogDemo() {
  const [rename, setRename] = useState(false);
  const [terms, setTerms] = useState(false);
  const [name, setName] = useState("Millennium Falcon");
  const [draft, setDraft] = useState(name);
  return (
    <Stage>
      <Variant label={`Ship: ${name}`}>
        <Button variant="secondary" onClick={() => { setDraft(name); setRename(true); }}>
          Rename ship
        </Button>
        <Button variant="ghost" onClick={() => setTerms(true)}>
          Read the park rules
        </Button>
      </Variant>
      <Dialog
        open={rename}
        onOpenChange={setRename}
        title="Rename ship"
        description="The new name shows on the docking manifest at Mos Eisley."
        footer={
          <>
            <Button variant="secondary" onClick={() => setRename(false)}>Cancel</Button>
            <Button
              disabled={!draft.trim()}
              onClick={() => { setName(draft.trim()); setRename(false); }}
            >
              Save name
            </Button>
          </>
        }
      >
        <label className="block text-sm font-medium" htmlFor="rename-input">Name</label>
        <input
          id="rename-input"
          data-autofocus
          className={`${field} mt-2`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && draft.trim()) { setName(draft.trim()); setRename(false); } }}
        />
      </Dialog>
      <Dialog
        open={terms}
        onOpenChange={setTerms}
        size="lg"
        title="Jurassic Park visitor rules"
        description="Isla Nublar, effective opening day"
        footer={<Button onClick={() => setTerms(false)}>Hold on to your butts</Button>}
      >
        <div className="space-y-4 text-sm leading-relaxed text-ink">
          {TERMS.map(([h, p]) => (
            <section key={h}>
              <h3 className="font-semibold">{h}</h3>
              <p className="mt-1 text-muted">{p}</p>
            </section>
          ))}
        </div>
      </Dialog>
    </Stage>
  );
}

const TERMS: Array<[string, string]> = [
  ["Tour vehicles", "Stay inside the Ford Explorer at all times. The cars run on the electric track; do not attempt to drive them yourself."],
  ["Tickets", "A day pass is $39.50 and includes the Visitor Centre, the hatchery and the tour. Children under 12 ride free with an adult."],
  ["The paddocks", "The fences carry 10,000 volts. Do not touch them, lean on them or test whether the power is on."],
  ["Feeding", "Guests may not feed the animals. The goat is part of the tour and is not available for adoption."],
  ["Weather", "Tropical storms can close the park at short notice. Your ticket is refunded in full, and a boat leaves for the mainland at 19:00."],
  ["The Raptor pen", "Viewing is from the platform only. Staff will tell you when it is clever to leave."],
  ["Spared no expense", "Lost property, first aid and the gift shop are in the Visitor Centre, next to the banner that says When Dinosaurs Ruled the Earth."],
];

export function AlertDialogDemo() {
  const [open, setOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  return (
    <Stage>
      {deleted ? (
        <Variant label="Deleted">
          <span className="text-sm text-muted">The Death Star plans and their 6 attachments were deleted.</span>
          <Button variant="ghost" size="sm" onClick={() => setDeleted(false)}>Undo</Button>
        </Variant>
      ) : (
        <Button variant="outline" onClick={() => setOpen(true)} className="text-negative">
          Delete the plans
        </Button>
      )}
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        tone="danger"
        title="Delete the Death Star plans?"
        description="All 6 schematics, including the thermal exhaust port, will be gone for everyone in the Rebellion. This can’t be undone."
        confirmLabel="Delete plans"
        onConfirm={() => new Promise<void>((r) => setTimeout(() => { setDeleted(true); r(); }, 1200))}
      />
    </Stage>
  );
}

const CART = [
  { name: "Flux capacitor", price: 88, qty: 1 },
  { name: "Mattel hoverboard", price: 45, qty: 2 },
  { name: "Self-lacing trainers", price: 21.5, qty: 2 },
];

export function DrawerDemo() {
  const [side, setSide] = useState<DrawerSide | null>(null);
  const [qty, setQty] = useState(CART.map((c) => c.qty));
  const subtotal = CART.reduce((a, c, i) => a + c.price * qty[i], 0);
  const delivery = subtotal >= 150 ? 0 : 6;
  return (
    <Stage>
      <Button variant="secondary" onClick={() => setSide("left")}>Menu from the left</Button>
      <Button variant="secondary" onClick={() => setSide("right")}>Basket from the right</Button>
      <Button variant="secondary" onClick={() => setSide("bottom")}>Share sheet from the bottom</Button>

      <Drawer open={side === "left"} onOpenChange={() => setSide(null)} side="left" title="Ghostbusters HQ" width={300}>
        <nav aria-label="Ghostbusters HQ">
          <ul className="space-y-0.5">
            {["Call log", "Containment unit", "Ecto-1", "Proton packs", "Invoices", "Who you gonna call"].map((l, i) => (
              <li key={l}>
                <button
                  type="button"
                  onClick={() => setSide(null)}
                  aria-current={i === 1 ? "page" : undefined}
                  className={`flex h-10 w-full items-center rounded-control px-3 text-left text-sm transition-colors ${i === 1 ? "bg-raised font-medium text-ink" : "text-muted hover:bg-raised hover:text-ink"}`}
                >
                  {l}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </Drawer>

      <Drawer
        open={side === "right"}
        onOpenChange={() => setSide(null)}
        side="right"
        title="Basket"
        width={400}
        footer={
          <div className="w-full space-y-3">
            <dl className="space-y-1.5 text-sm tabular">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>£{subtotal.toFixed(2)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{delivery === 0 ? "Free" : `£${delivery.toFixed(2)}`}</dd></div>
              <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>£{(subtotal + delivery).toFixed(2)}</dd></div>
            </dl>
            <Button className="w-full" size="lg" onClick={() => setSide(null)}>Check out</Button>
          </div>
        }
      >
        <ul className="space-y-4">
          {CART.map((c, i) => (
            <li key={c.name} className="flex items-center gap-3">
              <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-control bg-raised text-[13px] font-semibold text-muted">{c.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.name}</p>
                <p className="tabular text-sm text-muted">£{c.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-raised p-1">
                <QtyButton label={`One fewer ${c.name}`} onClick={() => setQty((q) => q.map((v, j) => (j === i ? Math.max(1, v - 1) : v)))}><Minus className="size-3.5" /></QtyButton>
                <span className="tabular w-5 text-center text-sm">{qty[i]}</span>
                <QtyButton label={`One more ${c.name}`} onClick={() => setQty((q) => q.map((v, j) => (j === i ? v + 1 : v)))}><Plus className="size-3.5" /></QtyButton>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[13px] text-muted">
          {delivery === 0 ? "Free delivery to 1985. Roads not required." : `Add £${(150 - subtotal).toFixed(2)} more for free delivery.`}
        </p>
      </Drawer>

      <Drawer open={side === "bottom"} onOpenChange={() => setSide(null)} side="bottom" title="Share “Hill Valley clock tower”">
        <div className="mx-auto max-w-lg space-y-3 pb-3">
          <ShareRow />
          <p className="text-[13px] text-muted">Anyone with the link can see when lightning strikes: 22:04, Saturday 12 November 1955.</p>
        </div>
      </Drawer>
    </Stage>
  );
}

function QtyButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button type="button" aria-label={label} whileTap={{ scale: 0.85 }} onClick={onClick} className="grid size-7 place-items-center rounded-full bg-surface text-ink transition-colors hover:bg-active">
      {children}
    </motion.button>
  );
}

function ShareRow() {
  const [copied, setCopied] = useState(false);
  const url = "hillvalley.town/clock-tower";
  return (
    <div className="flex items-center gap-2">
      <input readOnly value={url} aria-label="Share link" className={`${field} min-w-0 flex-1`} onFocus={(e) => e.target.select()} />
      <Button
        variant="secondary"
        leading={copied ? <Check /> : <Copy />}
        onClick={() => {
          navigator.clipboard?.writeText(`https://${url}`).catch(() => {});
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
      >
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

export function PopoverDemo() {
  const [sent, setSent] = useState<string | null>(null);
  return (
    <Stage>
      <Popover label="Join the Fellowship" side="bottom" align="start" trigger={<Button variant="secondary">Invite</Button>} className="w-80">
        {(close) => (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = new FormData(e.currentTarget).get("email") as string;
              setSent(v);
              close();
            }}
          >
            <p className="text-sm font-semibold">Invite to the Fellowship</p>
            <p className="mt-1 text-[13px] text-muted">They can see the map of Middle-earth and carry the ring, briefly.</p>
            <input name="email" type="email" required placeholder="samwise@bagend.shire" aria-label="Email address" data-autofocus className={`${field} mt-3`} />
            <div className="mt-3 flex justify-end gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={close}>Cancel</Button>
              <Button type="submit" size="sm">Send invite</Button>
            </div>
          </form>
        )}
      </Popover>
      <Popover label="Next jump" side="top" trigger={<Button variant="ghost" leading={<CalendarDays />}>Next jump</Button>}>
        <dl className="grid grid-cols-[auto_auto] gap-x-6 gap-y-1.5 text-sm tabular">
          <dt className="text-muted">Destination</dt><dd>5 Nov 1955, 06:00</dd>
          <dt className="text-muted">Speed</dt><dd>88 mph</dd>
          <dt className="text-muted">Power</dt><dd>1.21 gigawatts</dd>
          <dt className="text-muted">Plutonium</dt><dd>1 of 12 pellets left</dd>
        </dl>
      </Popover>
      {sent && <span className="w-full text-center text-sm text-muted">Invite sent to {sent}</span>}
    </Stage>
  );
}

const TOOLS = [
  { icon: Bold, label: "Bold", keys: "Ctrl B" },
  { icon: Italic, label: "Italic", keys: "Ctrl I" },
  { icon: Underline, label: "Underline", keys: "Ctrl U" },
  { icon: Strikethrough, label: "Strikethrough", keys: "Ctrl Shift X" },
  { icon: Link2, label: "Add link", keys: "Ctrl K" },
  { icon: List, label: "Bulleted list", keys: "Ctrl Shift 8" },
];

export function TooltipDemo() {
  const [on, setOn] = useState<Record<string, boolean>>({ Bold: true });
  return (
    <Stage>
      <Variant label="Sweep across the toolbar: after the first, the rest open at once">
        <div role="toolbar" aria-label="Formatting" className="flex items-center gap-0.5 rounded-card bg-surface p-1">
          {TOOLS.map(({ icon: Icon, label, keys }) => (
            <Tooltip
              key={label}
              content={
                <span className="flex items-center gap-2">
                  {label}
                  <span className="text-faint">{keys}</span>
                </span>
              }
            >
              <motion.button
                type="button"
                aria-label={label}
                aria-pressed={!!on[label]}
                whileTap={{ scale: 0.88 }}
                onClick={() => setOn((s) => ({ ...s, [label]: !s[label] }))}
                className={`grid size-9 place-items-center rounded-control transition-colors ${on[label] ? "bg-accent-soft text-accent" : "text-muted hover:bg-raised hover:text-ink"}`}
              >
                <Icon className="size-4" />
              </motion.button>
            </Tooltip>
          ))}
        </div>
      </Variant>
      <Variant label="Any side">
        {(["left", "top", "bottom", "right"] as const).map((s) => (
          <Tooltip key={s} side={s} content={`Opens on the ${s}`}>
            <Btn variant="outline" size="sm">{s[0].toUpperCase() + s.slice(1)}</Btn>
          </Tooltip>
        ))}
      </Variant>
    </Stage>
  );
}

export function HoverCardDemo() {
  return (
    <Stage>
      <p className="max-w-md text-sm leading-relaxed text-ink">
        The cargo manifest for the Nostromo was signed off by{" "}
        <HoverCard content={<Profile />}>
          <a href="https://en.wikipedia.org/wiki/Ellen_Ripley" target="_blank" rel="noreferrer" className="font-medium text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent">
            Ellen Ripley
          </a>
        </HoverCard>{" "}
        before the crew woke for the distress signal.
      </p>
    </Stage>
  );
}

function Profile() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-accent-soft text-[15px] font-semibold text-accent">ER</span>
        <div>
          <p className="text-sm font-semibold">Ellen Ripley</p>
          <p className="text-[13px] text-muted">Warrant officer, Nostromo</p>
        </div>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-ink">Third in command. Follows quarantine procedure to the letter, whatever Ash says.</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
        <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />Weyland-Yutani, Earth</span>
        <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" />Aboard since 2122</span>
      </div>
    </div>
  );
}

const SIGNALS = [
  { title: "Message from Princess Leia", description: "Help me, Obi-Wan Kenobi. You’re my only hope." },
  { title: "R2-D2 is beeping", description: "Something about a secret mission." },
  { title: "C-3PO has concerns", description: "The odds are 3,720 to 1." },
  { title: "Han shot first", description: "Greedo has left the cantina." },
  { title: "Chewbacca", description: "Rrrrooaarrgh." },
];

function ToastButtons() {
  const { toast, promise } = useToast();
  const n = useRef(0);
  return (
    <>
      <Button variant="secondary" onClick={() => toast({ variant: "success", title: "Hyperdrive repaired", description: "The Falcon made the Kessel Run in 12 parsecs." })}>
        Success
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            variant: "error",
            title: "Proton pack overloaded",
            description: "Don’t cross the streams. Pack 2 needs a reset.",
            action: { label: "Retry", onClick: () => {} },
            duration: 8000,
          })
        }
      >
        Error
      </Button>
      <Button variant="secondary" onClick={() => toast({ variant: "warning", title: "Motion tracker: 15 metres", description: "Signal is inside the room." })}>
        Warning
      </Button>
      <Button variant="secondary" onClick={() => toast({ title: "Ecto-1 dispatched", action: { label: "Undo", onClick: () => {} } })}>
        With action
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          promise(new Promise<string>((res) => setTimeout(() => res("1.21 gigawatts"), 1800)), {
            loading: { title: "Charging the flux capacitor", description: "Waiting for the lightning at 22:04" },
            success: (v) => ({ title: "Charged", description: `${v}, right on time. Next stop 1985.` }),
            error: { title: "No lightning" },
          })
        }
      >
        Promise
      </Button>
      <Button
        variant="ghost"
        onClick={() => {
          const s = SIGNALS[n.current++ % SIGNALS.length];
          toast({ variant: "info", ...s });
        }}
      >
        Incoming transmission
      </Button>
    </>
  );
}

export function ToastDemo() {
  return (
    <ToastProvider>
      <Stage>
        <Variant label="Send a few, hover the stack to fan it out, swipe one right to dismiss">
          <ToastButtons />
        </Variant>
      </Stage>
    </ToastProvider>
  );
}

const PICTURES: LightboxImage[] = [
  { src: `${import.meta.env.BASE_URL}demo/medalta-potteries-kilns.jpg`, thumb: `${import.meta.env.BASE_URL}demo/thumbs/medalta-potteries-kilns.jpg`, width: 1920, height: 1440, alt: "Beehive kilns at Medalta Potteries", caption: "Beehive kilns at Medalta Potteries, Medicine Hat. Photo: Grapher78, CC BY 3.0" },
  { src: `${import.meta.env.BASE_URL}demo/vase-mougin-luneville.jpg`, thumb: `${import.meta.env.BASE_URL}demo/thumbs/vase-mougin-luneville.jpg`, width: 1200, height: 1286, alt: "Blue spiral vase from Lunéville", caption: "Spiral-carved vase, Mougin, Lunéville. Photo: Chaanara, CC BY 3.0" },
  { src: `${import.meta.env.BASE_URL}demo/pottery-kiln-archmus-eretria-19558.jpg`, thumb: `${import.meta.env.BASE_URL}demo/thumbs/pottery-kiln-archmus-eretria-19558.jpg`, width: 1920, height: 1541, alt: "Ancient pottery kiln at the Eretria museum", caption: "Pottery kiln, Archaeological Museum of Eretria. Photo: Jebulon, CC0" },
  { src: `${import.meta.env.BASE_URL}demo/vase.jpg`, thumb: `${import.meta.env.BASE_URL}demo/thumbs/vase.jpg`, width: 1920, height: 2560, alt: "Detail of a Wedgwood jasperware vase", caption: "Jasperware relief, Josiah Wedgwood & Sons. Photo: John Worthwood, CC BY 4.0" },
  { src: `${import.meta.env.BASE_URL}demo/pottery-kiln-found-at-jinsha.jpg`, thumb: `${import.meta.env.BASE_URL}demo/thumbs/pottery-kiln-found-at-jinsha.jpg`, width: 1920, height: 1280, alt: "Excavated pottery kiln at Jinsha", caption: "Excavated kiln at the Jinsha site, Chengdu. Photo: Gary Todd, CC0" },
];

const PHOTO_CREDITS = [
  { title: "Medalta Potteries kilns", by: "Grapher78", licence: "CC BY 3.0", lic: "https://creativecommons.org/licenses/by/3.0/", page: "https://commons.wikimedia.org/w/index.php?curid=17302609" },
  { title: "Vase-Mougin-Lunéville", by: "Chaanara", licence: "CC BY 3.0", lic: "https://creativecommons.org/licenses/by/3.0/", page: "https://commons.wikimedia.org/w/index.php?curid=38527160" },
  { title: "Pottery kiln archmus Eretria 19558", by: "Jebulon", licence: "CC0", lic: "https://creativecommons.org/publicdomain/zero/1.0/", page: "https://commons.wikimedia.org/w/index.php?curid=50619857" },
  { title: "Vase", by: "John Worthwood; Josiah Wedgwood & Sons Ltd", licence: "CC BY 4.0", lic: "https://creativecommons.org/licenses/by/4.0/", page: "https://commons.wikimedia.org/w/index.php?curid=65676750" },
  { title: "Pottery kiln found at Jinsha", by: "Gary Todd", licence: "CC0", lic: "https://creativecommons.org/publicdomain/zero/1.0/", page: "https://commons.wikimedia.org/w/index.php?curid=106134506" },
];

const link = "underline decoration-line-strong underline-offset-2 hover:text-ink";

export function LightboxDemo() {
  return (
    <Stage className="flex-col items-stretch">
      <Lightbox images={PICTURES} rowHeight={150} />
      <p className="text-[13px] leading-5 text-muted">
        {PHOTO_CREDITS.map((c, i) => (
          <span key={c.page}>
            <a href={c.page} target="_blank" rel="noreferrer" className={link}>“{c.title}”</a> by {c.by},{" "}
            <a href={c.lic} target="_blank" rel="noreferrer" className={link}>{c.licence}</a>
            {i < PHOTO_CREDITS.length - 1 ? "; " : ". "}
          </span>
        ))}
        All via Wikimedia Commons. Modified: resized, with 640px thumbnails for the row.
      </p>
    </Stage>
  );
}
