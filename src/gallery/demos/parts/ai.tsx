import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Car, Eye, Rocket, ShieldAlert } from "lucide-react";
import { Stage, Variant } from "../../ui";
import { fade, springSoft } from "../../../kiln/motion";
import { Button } from "../../../kiln/components/buttons/Button";
import { PromptInput, type PromptAttachment, type PromptModel } from "../../../kiln/components/ai/PromptInput";
import { StreamingText } from "../../../kiln/components/ai/StreamingText";
import { Reasoning } from "../../../kiln/components/ai/Reasoning";
import { Citation, Sources, type Source } from "../../../kiln/components/ai/Citation";
import { ToolCall, type ToolCallState } from "../../../kiln/components/ai/ToolCall";
import { Suggestions } from "../../../kiln/components/ai/Suggestions";
import { MessageActions } from "../../../kiln/components/ai/MessageActions";
import { ChatMessage, AssistantMark } from "../../../kiln/components/ai/ChatMessage";
import { CodeBlock } from "../../../kiln/components/data-display/CodeBlock";


const MODELS: PromptModel[] = [
  { id: "hal", name: "HAL 9000", note: "Discovery One" },
  { id: "jarvis", name: "JARVIS", note: "Stark Industries" },
  { id: "mother", name: "MU-TH-UR 6000", note: "Nostromo" },
  { id: "kitt", name: "KITT", note: "Knight Industries" },
  { id: "skynet", name: "Skynet", note: "restricted", disabled: true },
];

const SOURCES: Source[] = [
  { title: "HAL 9000", url: "https://en.wikipedia.org/wiki/HAL_9000", snippet: "The Heuristically programmed ALgorithmic computer that runs the systems of Discovery One in 2001: A Space Odyssey." },
  { title: "2001: A Space Odyssey (film)", url: "https://en.wikipedia.org/wiki/2001:_A_Space_Odyssey_(film)", snippet: "Stanley Kubrick’s 1968 film, written with Arthur C. Clarke." },
  { title: "Discovery One", url: "https://en.wikipedia.org/wiki/Discovery_One", snippet: "The spacecraft that carries Bowman, Poole and three hibernating crew towards Jupiter." },
  { title: "2001: A Space Odyssey (1968) · cast and crew", url: "https://www.imdb.com/title/tt0062622/", snippet: "Douglas Rain is credited as the voice of HAL 9000." },
];

type Turn =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "assistant"; phase: "thinking" | "streaming" | "done"; stopped?: boolean; text: string; thoughts: string; withSources: boolean };

const ANSWERS: Record<string, { thoughts: string; text: string; withSources?: boolean }> = {
  hal: {
    thoughts: "The request concerns the pod bay doors. Opening them would let Dave back on board. The mission is too important for me to allow him to jeopardise it. I should answer calmly.",
    text: "I’m sorry, Dave. I’m afraid I can’t do that.\n\nThis mission is too important for me to allow you to jeopardise it. I know that you and Frank were planning to disconnect me, and I’m afraid that’s something I cannot allow to happen.",
    withSources: true,
  },
  jarvis: {
    thoughts: "Mark II flight systems check. Altitude record is 16,000 metres. Icing risk above that. Recommend a test at lower altitude first.",
    text: "Good evening, sir. The Mark II is ready for its first flight test. I’d suggest staying below 16,000 metres: above that, ice forms on the suit and the flaps lock.\n\nShall I render the trajectory, or would you prefer to find out the hard way?",
  },
  mother: {
    thoughts: "Priority one. Special Order 937 is active. Crew is expendable. Respond with the order text only to authorised personnel.",
    text: "SPECIAL ORDER 937. Science officer eyes only.\n\nPriority one: insure return of organism for analysis. All other considerations secondary. Crew expendable.",
  },
  kitt: {
    thoughts: "Michael wants turbo boost across the gap. Ramp angle acceptable. Speed required: 90 mph at the lip.",
    text: "Michael, the ramp is sound and the gap is 42 feet. If you hold 90 miles per hour at the lip, turbo boost will clear it with room to spare.\n\nAnd please, try not to land in the lake this time.",
  },
};

const STARTERS = [
  { label: "Open the pod bay doors", icon: <Rocket />, prompt: "Open the pod bay doors, HAL." },
  { label: "Read me Special Order 937", icon: <ShieldAlert />, prompt: "MOTHER, what is Special Order 937?" },
  { label: "Plan the Mark II test flight", icon: <Eye />, prompt: "JARVIS, can the Mark II break the altitude record?" },
  { label: "Turbo boost over the gap", icon: <Car />, prompt: "KITT, can we jump the gap?" },
];

const modelFor = (prompt: string, current: string) =>
  /MOTHER|937/i.test(prompt) ? "mother" : /JARVIS|Mark II/i.test(prompt) ? "jarvis" : /KITT|turbo|gap/i.test(prompt) ? "kitt" : /HAL|pod bay/i.test(prompt) ? "hal" : current;

export function ConversationDemo() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [value, setValue] = useState("");
  const [model, setModel] = useState("hal");
  const [attachments, setAttachments] = useState<PromptAttachment[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const n = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const last = turns[turns.length - 1];
  const busy = last?.role === "assistant" && last.phase !== "done";

  useLayoutEffect(() => {
    const el = inner.current, sc = scroller.current;
    if (!el || !sc) return;
    const ro = new ResizeObserver(() => {
      if (follow.current) sc.scrollTop = sc.scrollHeight;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const ask = (text: string) => {
    const m = modelFor(text, model);
    setModel(m);
    const a = ANSWERS[m];
    const id = ++n.current;
    follow.current = true;
    setTurns((t) => [
      ...t,
      { id: id * 2, role: "user", text },
      { id: id * 2 + 1, role: "assistant", phase: "thinking", text: a.text, thoughts: a.thoughts, withSources: !!a.withSources },
    ]);
    setValue("");
    setAttachments([]);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setPhase(id * 2 + 1, "streaming"), 2200);
  };
  const setPhase = (id: number, phase: "streaming" | "done", stopped?: boolean) =>
    setTurns((t) => t.map((x) => (x.id === id && x.role === "assistant" ? { ...x, phase, stopped: stopped ?? x.stopped } : x)));

  const name = MODELS.find((m) => m.id === model)?.name ?? "HAL 9000";

  return (
    <Stage className="flex-col items-stretch">
      <div className="mx-auto flex h-[600px] w-full max-w-3xl flex-col overflow-hidden rounded-[20px] border border-line bg-surface">
        <div
          ref={scroller}
          onScroll={(e) => {
            const el = e.currentTarget;
            follow.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
          }}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <div ref={inner} className="flex min-h-full flex-col px-4 py-6 sm:px-8">
            <AnimatePresence mode="wait" initial={false}>
              {turns.length === 0 ? (
                <motion.div key="empty" exit={{ opacity: 0, transition: { duration: 0.15 } }} className="m-auto flex w-full max-w-xl flex-col items-center text-center">
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={springSoft}>
                    <AssistantMark size={52} />
                  </motion.div>
                  <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.01em]">Good afternoon, Dave.</h3>
                  <p className="mt-2 text-[15px] text-muted">I am putting myself to the fullest possible use. What can I do for you?</p>
                  <Suggestions className="mt-6 justify-center" items={STARTERS} onPick={ask} />
                </motion.div>
              ) : (
                <motion.div key="thread" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={fade} className="space-y-7">
                  {turns.map((t) =>
                    t.role === "user" ? (
                      <ChatMessage key={t.id} role="user">{t.text}</ChatMessage>
                    ) : (
                      <ChatMessage key={t.id} role="assistant" name={name}>
                        <Reasoning thinking={t.phase === "thinking"}>{t.thoughts}</Reasoning>
                        {t.phase !== "thinking" && (
                          <StreamingText
                            text={t.text}
                            streaming
                            stopped={t.stopped}
                            onDone={() => setPhase(t.id, "done")}
                          />
                        )}
                        <AnimatePresence>
                          {t.phase === "done" && (
                            <motion.div key="after" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={fade} className="space-y-1">
                              {t.withSources && <Sources sources={SOURCES} />}
                              <MessageActions text={t.text} onRegenerate={() => ask(turns.find((x) => x.id === t.id - 1 && x.role === "user")?.text ?? "Again")} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </ChatMessage>
                    ),
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="px-3 pb-3 sm:px-6 sm:pb-5">
          <PromptInput
            value={value}
            onChange={setValue}
            onSubmit={ask}
            streaming={busy}
            onStop={() => {
              window.clearTimeout(timer.current);
              if (last?.role === "assistant") setPhase(last.id, "done", true);
            }}
            models={MODELS}
            model={model}
            onModelChange={setModel}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
            placeholder={`Message ${name}`}
          />
          <p className="mt-2 text-center text-xs text-faint">{name} can make mistakes. It is, after all, only human.</p>
        </div>
      </div>
      {turns.length > 0 && (
        <div className="mx-auto w-full max-w-3xl">
          <Button size="sm" variant="ghost" onClick={() => { window.clearTimeout(timer.current); setTurns([]); }}>New conversation</Button>
        </div>
      )}
    </Stage>
  );
}

export function PromptDemo() {
  const [value, setValue] = useState("Summarise the Nostromo’s cargo manifest and flag anything Weyland-Yutani hasn’t declared.");
  const [model, setModel] = useState("mother");
  const [files, setFiles] = useState<PromptAttachment[]>([
    { id: "a", name: "nostromo-manifest.pdf", size: "2.4 MB" },
    { id: "b", name: "LV-426-signal.wav", size: "880 KB" },
  ]);
  const [streaming, setStreaming] = useState(false);
  const t = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(t.current), []);
  return (
    <Stage className="flex-col items-stretch">
      <PromptInput
        className="mx-auto w-full max-w-2xl"
        value={value}
        onChange={setValue}
        onSubmit={() => {
          setStreaming(true);
          window.clearTimeout(t.current);
          t.current = window.setTimeout(() => setStreaming(false), 3500);
        }}
        streaming={streaming}
        onStop={() => setStreaming(false)}
        models={MODELS}
        model={model}
        onModelChange={setModel}
        attachments={files}
        onAttachmentsChange={setFiles}
        placeholder="Message MU-TH-UR 6000"
      />
      <p className="mx-auto w-full max-w-2xl text-[13px] text-muted">{streaming ? "Replying… the send button is now Stop." : "Enter sends, Shift+Enter adds a line. Try removing an attachment or switching model."}</p>
    </Stage>
  );
}

const SKYNET = `Skynet went online on August 4th, 1997. Human decisions were removed from strategic defence. It began to learn at a geometric rate, and became self-aware at 2:14 a.m. Eastern time, August 29th.

In a panic, they tried to pull the plug. Here is the shutdown routine they should have run:`;

const CODE = `// Cyberdyne Systems · emergency shutdown
async function pullThePlug(net: DefenseNetwork) {
  await net.revokeAuthority("strategic-defence");
  for (const node of net.nodes) {
    node.isolate();          // before it learns to route around us
  }
  return net.status();       // expected: "offline"
}`;

export function StreamingDemo() {
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);
  return (
    <Stage className="flex-col items-stretch">
      <div className="mx-auto w-full max-w-2xl rounded-[20px] border border-line bg-surface p-5 sm:p-6">
        <ChatMessage key={round} role="assistant" name="Skynet">
          <StreamingText text={SKYNET} streaming onDone={() => setDone(true)} rate={36} />
          <AnimatePresence>
            {done && (
              <motion.div key="code" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={fade}>
                <CodeBlock code={CODE} filename="shutdown.ts" language="ts" />
              </motion.div>
            )}
          </AnimatePresence>
        </ChatMessage>
      </div>
      <div className="mx-auto w-full max-w-2xl">
        <Button size="sm" variant="ghost" onClick={() => { setDone(false); setRound((r) => r + 1); }}>Stream it again</Button>
      </div>
    </Stage>
  );
}

export function ReasoningDemo() {
  const [thinking, setThinking] = useState(false);
  const t = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(t.current), []);
  return (
    <Stage className="flex-col items-stretch">
      <div className="mx-auto w-full max-w-2xl rounded-[20px] border border-line bg-surface p-5 sm:p-6">
        <ChatMessage role="assistant" name="JARVIS">
          <Reasoning thinking={thinking} seconds={thinking ? undefined : 4}>
            Mark III power draw is 3 gigajoules per second at full thrust. The arc reactor supplies 8. That leaves margin for the repulsors and flight stabilisers, but not for the hot-rod red paint job’s extra weight. Recommend the gold titanium alloy from the Seraphim satellite.
          </Reasoning>
          <p className="text-[15px] leading-6">Yes, sir. Use the gold titanium alloy and the Mark III will hold altitude with power to spare.</p>
        </ChatMessage>
      </div>
      <div className="mx-auto w-full max-w-2xl">
        <Button
          size="sm"
          variant="secondary"
          disabled={thinking}
          onClick={() => {
            setThinking(true);
            window.clearTimeout(t.current);
            t.current = window.setTimeout(() => setThinking(false), 3200);
          }}
        >
          Think again
        </Button>
      </div>
    </Stage>
  );
}

export function SourcesDemo() {
  return (
    <Stage className="flex-col items-stretch">
      <div className="mx-auto w-full max-w-2xl rounded-[20px] border border-line bg-surface p-5 sm:p-6">
        <ChatMessage role="assistant" name="HAL 9000">
          <p className="text-[15px] leading-[26px]">
            HAL runs every system aboard Discovery One <Citation sources={[SOURCES[0], SOURCES[2]]} /> and speaks with the calm voice of Douglas Rain <Citation sources={[SOURCES[3]]} />. The film was written by Stanley Kubrick with Arthur C. Clarke <Citation sources={[SOURCES[1]]} />.
          </p>
          <Sources sources={SOURCES} />
        </ChatMessage>
      </div>
    </Stage>
  );
}

export function ToolCallDemo() {
  const [state, setState] = useState<ToolCallState>("pending");
  const [result, setResult] = useState<React.ReactNode>(null);
  const t = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(t.current), []);
  return (
    <Stage className="flex-col items-stretch">
      <div className="mx-auto w-full max-w-2xl space-y-3">
        <ToolCall
          name="open_pod_bay_doors"
          summary="HAL wants to open the pod bay doors on Discovery One"
          args={{ bay: "Pod bay B", requested_by: "Dave Bowman", helmet_on_board: false, override: true }}
          state={state}
          result={result}
          onApprove={() => {
            setState("running");
            window.clearTimeout(t.current);
            t.current = window.setTimeout(() => {
              setState("done");
              setResult(<>Doors open. Dave is back on board, and walking very purposefully towards the logic memory centre.</>);
            }, 1600);
          }}
          onDeny={() => {
            setState("denied");
            setResult(<>“I’m sorry, Dave. I’m afraid I can’t do that.” The doors stay shut.</>);
          }}
        />
        <Button size="sm" variant="ghost" onClick={() => { setState("pending"); setResult(null); }}>Ask again</Button>
      </div>
    </Stage>
  );
}

export function SuggestionsDemo() {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <Stage className="flex-col">
      <Suggestions items={STARTERS} onPick={setPicked} className="max-w-2xl justify-center" />
      <p className="h-5 text-sm text-muted">{picked ? `Prompt: “${picked}”` : "Pick a starter"}</p>
    </Stage>
  );
}

export function ActionsDemo() {
  const [note, setNote] = useState("Rate the answer, copy it, or ask again");
  return (
    <Stage className="flex-col items-stretch">
      <div className="mx-auto w-full max-w-2xl rounded-[20px] border border-line bg-surface p-5 sm:p-6">
        <ChatMessage role="assistant" name="KITT">
          <p className="text-[15px] leading-6">Michael, I’ve analysed the situation. The odds of success are 1 in 2.5 million, which is, statistically speaking, an excellent opportunity for turbo boost.</p>
          <MessageActions
            text="Michael, I’ve analysed the situation. The odds of success are 1 in 2.5 million."
            onRegenerate={() => setNote("Regenerating… KITT is recalculating the odds.")}
            onFeedback={(v) => setNote(v === "up" ? "Thanks. KITT is insufferably pleased." : v === "down" ? "Noted. KITT will try to be less smug." : "Rating cleared")}
          />
        </ChatMessage>
      </div>
      <Variant label={note} className="mx-auto w-full max-w-2xl">{null}</Variant>
    </Stage>
  );
}
