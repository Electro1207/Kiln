import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, RotateCcw, Search } from "lucide-react";
import type { Category } from "../types";
import { Stage, Variant, Btn } from "../ui";
import { easeOut } from "../../kiln/motion";
import { Button } from "../../kiln/components/buttons/Button";
import { Dialog } from "../../kiln/components/overlays/Dialog";
import { Alert } from "../../kiln/components/notices/Alert";
import { Banner } from "../../kiln/components/notices/Banner";
import { Badge } from "../../kiln/components/status/Badge";
import { StatusDot } from "../../kiln/components/status/StatusDot";
import { Progress } from "../../kiln/components/status/Progress";
import { ProgressRing } from "../../kiln/components/status/ProgressRing";
import { Spinner } from "../../kiln/components/status/Spinner";
import { Skeleton, SkeletonText } from "../../kiln/components/status/Skeleton";
import { EmptyState } from "../../kiln/components/status/EmptyState";
import { FieldMessage } from "../../kiln/components/notices/FieldMessage";
import { Meter } from "../../kiln/components/status/Meter";
import { NotificationBell } from "../../kiln/components/notices/NotificationBell";


const field =
  "h-10 w-full rounded-control border bg-surface px-3 text-sm text-ink outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:ring-2";

function AlertDemo() {
  const [round, setRound] = useState(0);
  return (
    <Stage className="flex-col items-stretch">
      <div key={round} className="mx-auto w-full max-w-xl">
        <Alert tone="info" title="Containment unit at 85%" dismissible spaceAfter={12}>
          Empty the traps before Friday. The Sedgewick Hotel booking will need two more.
        </Alert>
        <Alert tone="success" title="Invoice paid" dismissible spaceAfter={12}>
          $5,000 from the Sedgewick Hotel for one Class 5 full-roaming vapour. Slimer included.
        </Alert>
        <Alert
          tone="warning"
          title="Shields down to 30%"
          dismissible
          spaceAfter={12}
          action={
            <>
              <Btn size="sm" variant="secondary">Divert power</Btn>
              <Btn size="sm" variant="ghost">Ignore</Btn>
            </>
          }
        >
          Two TIE fighters on the port side. Chewie is not happy about it.
        </Alert>
        <Alert tone="error" title="Access denied" dismissible spaceAfter={12}>
          Ah ah ah, you didn’t say the magic word. Three attempts left before the system locks.
        </Alert>
      </div>
      <div className="mx-auto w-full max-w-xl">
        <Button variant="ghost" size="sm" leading={<RotateCcw />} onClick={() => setRound((r) => r + 1)}>
          Bring them back
        </Button>
      </div>
    </Stage>
  );
}

function BannerDemo() {
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [open, setOpen] = useState(true);
  const [tone, setTone] = useState<"inverse" | "brand" | "neutral">("inverse");
  return (
    <Stage className="flex-col items-stretch">
      <Dialog
        open={booking}
        onOpenChange={setBooking}
        title="Board the Nostromo"
        description="Departure 3 June 2122. Seven crew, one cat."
        footer={
          <>
            <Button variant="secondary" onClick={() => setBooking(false)}>Not today</Button>
            <Button onClick={() => { setBooked(true); setBooking(false); }}>Confirm my seat</Button>
          </>
        }
      >
        <p className="text-sm text-ink">In space no one can hear you scream, but the cabin is climate controlled.</p>
      </Dialog>
      <div className="overflow-hidden rounded-card border border-line bg-surface">
        <Banner
          open={open}
          tone={tone}
          onDismiss={() => setOpen(false)}
          action={
            <button type="button" onClick={() => setBooking(true)} className="font-semibold underline decoration-current/40 underline-offset-4 hover:decoration-current">
              {booked ? "Seat booked" : "Book a seat"}
            </button>
          }
        >
          The Nostromo leaves orbit on 3 June 2122. Seven crew, one cat.
        </Banner>
        <div className="flex h-12 items-center gap-6 px-4 text-sm">
          <span className="font-semibold">Weyland-Yutani</span>
          <span className="hidden text-muted sm:inline">Missions</span>
          <span className="hidden text-muted sm:inline">Crew</span>
          <span className="hidden text-muted sm:inline">Cargo</span>
        </div>
        <div className="space-y-2 px-4 pb-6 pt-2">
          <Skeleton shape="text" className="w-1/3" />
          <SkeletonText lines={2} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => setOpen((o) => !o)}>{open ? "Hide" : "Show"} announcement</Button>
        {(["inverse", "brand", "neutral"] as const).map((t) => (
          <Button key={t} size="sm" variant={tone === t ? "primary" : "ghost"} onClick={() => setTone(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>
    </Stage>
  );
}

function BadgeDemo() {
  const [live, setLive] = useState(true);
  return (
    <Stage>
      <Variant label="Soft">
        <Badge>Docked</Badge>
        <Badge tone="accent">In hyperspace</Badge>
        <Badge tone="positive" dot>Bounty paid</Badge>
        <Badge tone="warning" dot>Low fuel</Badge>
        <Badge tone="negative" dot>Carbonite</Badge>
        <Badge tone="info">New orders</Badge>
      </Variant>
      <Variant label="Solid and small">
        <Badge variant="solid" tone="accent">88 mph</Badge>
        <Badge variant="solid" tone="negative" size="sm">3 alerts</Badge>
        <Badge variant="solid" size="sm">Beta</Badge>
      </Variant>
      <Variant label="Sizes">
        <Badge size="sm" tone="accent">Small</Badge>
        <Badge tone="accent">Medium</Badge>
        <Badge size="lg" tone="accent">Large</Badge>
      </Variant>
      <Variant label="Presence">
        <StatusDot status={live ? "online" : "offline"} pulse={live} showLabel label={live ? "Nebuchadnezzar online" : "Nebuchadnezzar offline"} />
        <StatusDot status="busy" showLabel label="Agent Smith, busy" />
        <StatusDot status="away" showLabel label="Morpheus, away" />
        <Button size="sm" variant="ghost" onClick={() => setLive((l) => !l)}>{live ? "Unplug" : "Jack in"}</Button>
      </Variant>
    </Stage>
  );
}

function ProgressDemo() {
  const [done, setDone] = useState(3);
  const total = 8;
  const timer = useRef<number | undefined>(undefined);
  const run = () => {
    window.clearInterval(timer.current);
    setDone(0);
    timer.current = window.setInterval(() => {
      setDone((d) => {
        if (d + 1 >= total) window.clearInterval(timer.current);
        return Math.min(d + 1, total);
      });
    }, 520);
  };
  useEffect(() => () => window.clearInterval(timer.current), []);
  return (
    <Stage className="flex-col items-stretch">
      <div className="w-full max-w-md space-y-6 self-center">
        <Progress
          value={done}
          max={total}
          label={done === total ? "Death Star plans received" : "Downloading Death Star plans"}
          valueText={`${done} of ${total} files`}
          tone={done === total ? "positive" : "accent"}
        />
        <Progress label="Decoding the Matrix" valueText="Following the white rabbit" size="sm" />
        <Button size="sm" variant="secondary" onClick={run}>Download again</Button>
      </div>
    </Stage>
  );
}

function ProgressRingDemo() {
  const [v, setV] = useState(64);
  return (
    <Stage>
      <ProgressRing value={v} label="Flux capacitor charge" size={104} />
      <ProgressRing value={Math.min(v + 22, 100)} label="Fellowship on the road" size={72} stroke={6} tone="positive" />
      <ProgressRing value={v} size={48} stroke={5} showValue={false} label="Sync" tone="warning" />
      <Variant label="Charge">
        {[12, 64, 100].map((n) => (
          <Button key={n} size="sm" variant={v === n ? "primary" : "secondary"} onClick={() => setV(n)}>
            {n}%
          </Button>
        ))}
      </Variant>
    </Stage>
  );
}

function SpinnerDemo() {
  const [busy, setBusy] = useState(false);
  return (
    <Stage>
      <Variant label="Ring"><Spinner kind="ring" /><Spinner kind="ring" size={32} /></Variant>
      <Variant label="Dots"><Spinner kind="dots" /><Spinner kind="dots" size={32} /></Variant>
      <Variant label="Petals"><Spinner kind="bars" /><Spinner kind="bars" size={32} className="text-muted" /></Variant>
      <Variant label="Pulse"><Spinner kind="pulse" /><Spinner kind="pulse" size={32} /></Variant>
      <Variant label="In a button">
        <Button loading={busy} onClick={() => { setBusy(true); setTimeout(() => setBusy(false), 1800); }}>
          Engage warp
        </Button>
      </Variant>
    </Stage>
  );
}

function SkeletonDemo() {
  const [loaded, setLoaded] = useState(false);
  return (
    <Stage className="flex-col">
      <div className="grid w-full max-w-sm [&>*]:[grid-area:1/1]">
        <AnimatePresence initial={false}>
          <motion.div
            key={loaded ? "real" : "skeleton"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: easeOut }}
            className="min-h-[124px] rounded-card bg-surface p-4"
            aria-busy={!loaded}
          >
            {loaded ? (
              <div className="flex gap-4">
                <span className="grid size-16 shrink-0 place-items-center rounded-control bg-accent-soft text-lg font-semibold text-accent">SC</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-5">Sarah Connor</p>
                  <p className="mt-1 text-sm leading-5 text-muted">Waitress, Big Jeff’s. Wanted by a T-800 for reasons unknown.</p>
                  <p className="tabular mt-2 text-sm font-medium leading-5">Last seen 12 May 1984</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <Skeleton className="size-16 shrink-0" />
                <div className="flex-1 pt-1">
                  <Skeleton shape="text" className="w-2/5" />
                  <SkeletonText lines={2} className="mt-3" />
                  <Skeleton shape="text" className="mt-3 w-24" />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <Button size="sm" variant="secondary" onClick={() => setLoaded((l) => !l)}>{loaded ? "Show loading" : "Finish loading"}</Button>
    </Stage>
  );
}

function EmptyStateDemo() {
  const [kind, setKind] = useState<"droids" | "search">("droids");
  return (
    <Stage className="flex-col">
      <div className="w-full rounded-card bg-surface">
        {kind === "droids" ? (
          <EmptyState
            key="droids"
            title="These aren’t the droids you’re looking for"
            description="No droids are checked in at this docking bay. When R2 and 3PO arrive, they’ll show up here with their owners."
            action={<><Btn>Register a droid</Btn><Btn variant="ghost">Move along</Btn></>}
          />
        ) : (
          <EmptyState
            key="search"
            art={<span className="grid size-14 place-items-center rounded-full bg-raised"><Search className="size-6" /></span>}
            title="Nothing matches “Mos Eisley”"
            description="You will never find a more wretched hive of scum and villainy. Try a shorter search."
            action={<Button variant="secondary" onClick={() => setKind("droids")}>Clear search</Button>}
          />
        )}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant={kind === "droids" ? "primary" : "secondary"} onClick={() => setKind("droids")}>Nothing yet</Button>
        <Button size="sm" variant={kind === "search" ? "primary" : "secondary"} onClick={() => setKind("search")}>No results</Button>
      </div>
    </Stage>
  );
}

function FieldMessageDemo() {
  const [email, setEmail] = useState("neo@");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  const msg = email === "" ? null : valid ? "Welcome to the real world." : "There is no domain. Add the part after the @, like zion.net.";
  const bad = !valid && email !== "";
  return (
    <Stage>
      <div className="w-full max-w-sm">
        <label htmlFor="fm-email" className="text-sm font-medium">Email for the Nebuchadnezzar</label>
        <input
          id="fm-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={bad}
          aria-describedby="fm-email-msg"
          className={`${field} mt-2 ${bad ? "border-negative focus:ring-negative-soft" : "border-line-strong focus:border-accent focus:ring-accent-soft"}`}
        />
        <FieldMessage id="fm-email-msg" tone={valid ? "success" : "error"}>{msg}</FieldMessage>
      </div>
    </Stage>
  );
}

function MeterDemo() {
  const [members, setMembers] = useState(7);
  return (
    <Stage className="flex-col items-stretch">
      <div className="w-full max-w-md space-y-8 self-center">
        <Meter
          label="Containment grid"
          max={20}
          unit="TJ"
          segments={[
            { label: "Class 5 vapours", value: 9.4, tone: "accent" },
            { label: "Slimer", value: 3.1, tone: "info" },
            { label: "Stay Puft residue", value: 0.8, tone: "muted" },
          ]}
        />
        <div>
          <Meter label="Fellowship members" value={members} max={9} unit="walkers" decimals={0} warnAt={0.85} fullAt={1} />
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" variant="secondary" aria-label="One fewer member" onClick={() => setMembers((s) => Math.max(0, s - 1))}><Minus className="size-4" /></Button>
            <Button size="sm" variant="secondary" aria-label="One more member" onClick={() => setMembers((s) => Math.min(9, s + 1))}><Plus className="size-4" /></Button>
            <span className="text-[13px] text-muted">Amber at 8, red when all nine walk.</span>
          </div>
        </div>
      </div>
    </Stage>
  );
}

function BellDemo() {
  const [n, setN] = useState(3);
  return (
    <Stage>
      <div className="flex items-center gap-3 rounded-full bg-surface p-1.5 pr-4">
        <NotificationBell count={n} />
        <span className="tabular text-sm text-muted">{n === 0 ? "All quiet on Hoth" : `${n} transmissions`}</span>
      </div>
      <Variant label="Try it">
        <Button size="sm" variant="secondary" onClick={() => setN((x) => x + 1)}>Incoming transmission</Button>
        <Button size="sm" variant="secondary" onClick={() => setN((x) => x + 97)}>The Empire strikes back</Button>
        <Button size="sm" variant="ghost" onClick={() => setN(0)}>Mark all read</Button>
      </Variant>
    </Stage>
  );
}

export const category: Category = {
  id: "feedback",
  name: "Feedback",
  summary: "How the interface tells people what is happening: status, progress, waiting and nothing-yet.",
  entries: [
    { id: "alert", name: "Alert", summary: "A calm inline card; the tone lives in the icon. Dismissing it folds the space shut without a jump.", files: ["src/kiln/components/notices/Alert.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: AlertDemo },
    { id: "banner", name: "Banner", summary: "A full-width announcement for the top of an app that slides down into the space it opens.", files: ["src/kiln/components/notices/Banner.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: BannerDemo },
    { id: "badge", name: "Badge and status dot", summary: "Short statuses and counts, and a presence dot that breathes when something is live.", files: ["src/kiln/components/status/Badge.tsx", "src/kiln/components/status/StatusDot.tsx", "src/kiln/cn.ts", "src/kiln/components/shared/useLoop.ts", "src/kiln/controllable.ts"], Demo: BadgeDemo },
    { id: "progress", name: "Progress bar", summary: "Fills on a spring when the amount is known; runs a band when it isn’t.", files: ["src/kiln/components/status/Progress.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/shared/useLoop.ts"], Demo: ProgressDemo },
    { id: "progress-ring", name: "Progress ring", summary: "A circular gauge whose arc and number move on the same spring.", files: ["src/kiln/components/status/ProgressRing.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: ProgressRingDemo },
    { id: "spinner", name: "Spinner", summary: "Four ways to say “working”, all following the text colour.", files: ["src/kiln/components/status/Spinner.tsx", "src/kiln/components/shared/useLoop.ts", "src/kiln/cn.ts"], Demo: SpinnerDemo },
    { id: "skeleton", name: "Skeleton", summary: "Placeholders that hold the shape of content still loading, then cross-fade to it.", files: ["src/kiln/components/status/Skeleton.tsx", "src/kiln/cn.ts", "src/kiln/components/shared/useLoop.ts"], Demo: SkeletonDemo },
    { id: "empty-state", name: "Empty state", summary: "What a page shows when it has nothing yet, and the one thing to do next.", files: ["src/kiln/components/status/EmptyState.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/shared/useLoop.ts"], Demo: EmptyStateDemo },
    { id: "field-message", name: "Field message", summary: "The hint or error under a field; it slides in and the space opens smoothly.", files: ["src/kiln/components/notices/FieldMessage.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: FieldMessageDemo },
    { id: "meter", name: "Meter", summary: "How much of a limit is used, split by kind, turning amber then red as it fills.", files: ["src/kiln/components/status/Meter.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: MeterDemo },
    { id: "notification-bell", name: "Notification bell", summary: "An unread count that rolls and bumps; the bell rings once when it goes up.", files: ["src/kiln/components/notices/NotificationBell.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: BellDemo },
  ],
};
