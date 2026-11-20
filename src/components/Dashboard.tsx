"use client";

import { renderLocal } from "@/lib/render-local";
import NextLink from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Download01, FileCheck02, Image01, Mail01, Plus, RefreshCw01, Trash01, Upload01, XClose } from "@untitledui/icons";
import { METRICS, METRIC_ORDER, RATING_LABEL, rate, scoreRating, show } from "../../templates/_shared/metrics.ts";
import { WHO_LABEL, type Who } from "../../templates/_shared/plain.ts";
import { readRun, type Run } from "@/lib/lighthouse";
import { draftSummary, findingsFrom, reportFor, tasksFrom, type FindingDraft, type Meta, type TaskDraft } from "@/lib/draft";
import { Mark } from "./Mark";

const STEPS = ["Runs", "Findings", "Plan", "Send"] as const;
const STORE = "plainspeed:v1";
const SAMPLE = [
  { url: "/samples/wikipedia-mobile.json", label: "Mobile" },
  { url: "/samples/wikipedia-desktop.json", label: "Desktop" },
];

type Stored = { runs: Run[]; findings: FindingDraft[]; plan: TaskDraft[]; meta: Meta; step: number };

export function Dashboard() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [findings, setFindings] = useState<FindingDraft[]>([]);
  const [plan, setPlan] = useState<TaskDraft[]>([]);
  const [meta, setMeta] = useState<Meta>({ client: "", agency: "", reportDate: "", accent: "#2453FF", summary: "" });
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Restore the last report, then keep saving it.
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const s = JSON.parse(localStorage.getItem(STORE) ?? "null") as Stored | null;
        if (s?.runs?.length) {
          setRuns(s.runs);
          setFindings(s.findings);
          setPlan(s.plan);
          setMeta(s.meta);
          setStep(s.step);
        }
      } catch {}
      setLoaded(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORE, JSON.stringify({ runs, findings, plan, meta, step } satisfies Stored));
    } catch {}
  }, [loaded, runs, findings, plan, meta, step]);

  function setAll(next: Run[]) {
    setRuns(next);
    const f = findingsFrom(next);
    setFindings(f);
    setPlan(tasksFrom(f));
    setMeta((m) => ({ ...m, reportDate: m.reportDate || new Date().toISOString().slice(0, 10), summary: draftSummary(next, f) }));
  }

  async function addFiles(files: Array<{ name: string; text: string; label?: string }>) {
    setError(null);
    try {
      const parsed = files.map((f) => readRun(f.text, f.label));
      const next = [...runs, ...parsed].slice(-2);
      if (next.length === 2 && host(next[0].url) !== host(next[1].url)) {
        setError(`The two runs are of different pages (${host(next[0].url)} and ${host(next[1].url)}). A report compares one page.`);
        return;
      }
      if (next.length === 2 && next[0].label === next[1].label) next[1] = { ...next[1], label: `${next[1].label} 2` };
      setAll(next);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function loadSample() {
    const texts = await Promise.all(SAMPLE.map(async (s) => ({ name: s.url, text: await fetch(s.url).then((r) => r.text()), label: s.label })));
    setRuns([]);
    setError(null);
    const parsed = texts.map((t) => readRun(t.text, t.label));
    setAll(parsed);
    setMeta((m) => ({ ...m, agency: m.agency || "Tidewater Studio" }));
  }

  const site = runs[0]?.url ?? "";
  const included = findings.filter((f) => f.include).length;
  const ready = runs.length > 0 && meta.agency.trim() !== "" && meta.summary.trim() !== "" && /^\d{4}-\d{2}-\d{2}$/.test(meta.reportDate);

  return (
    <div className="min-h-dvh bg-wash flex flex-col">
      <header className="h-16 shrink-0 bg-paper border-b border-line">
        <div className="h-full max-w-[1240px] mx-auto px-6 flex items-center gap-6">
          <NextLink href="/" className="flex items-center gap-2 font-display font-extrabold text-[20px] tracking-tight">
            <Mark /> Plainspeed
          </NextLink>
          {runs.length ? <span className="font-mono text-[12.5px] text-muted truncate max-w-[300px]">{host(site)}</span> : null}
          <ol className="ml-auto flex items-center gap-1" aria-label="Steps">
            {STEPS.map((s, i) => {
              const reachable = i === 0 || runs.length > 0;
              return (
                <li key={s} className="flex items-center">
                  <button
                    disabled={!reachable}
                    onClick={() => setStep(i)}
                    className={`flex items-center gap-2 rounded-full pl-1.5 pr-3.5 py-1.5 text-[13.5px] font-semibold transition-colors ${step === i ? "bg-ink text-white" : reachable ? "text-ink-2 hover:bg-wash" : "text-faint"}`}
                  >
                    <span className={`grid place-items-center size-6 rounded-full text-[12px] font-mono ${step === i ? "bg-white/15" : i < step ? "bg-blue text-white" : "bg-wash border border-line"}`}>
                      {i < step ? <Check size={13} /> : i + 1}
                    </span>
                    {s}
                  </button>
                  {i < STEPS.length - 1 ? <span className="w-5 h-px bg-line-strong mx-0.5" /> : null}
                </li>
              );
            })}
          </ol>
        </div>
      </header>

      <main className="flex-1 max-w-[1240px] w-full mx-auto px-6 py-8">
        {step === 0 ? (
          <RunsStep runs={runs} error={error} onFiles={addFiles} onSample={loadSample} onClear={() => (setRuns([]), setFindings([]), setPlan([]))} onRemove={(i) => setAll(runs.filter((_, j) => j !== i))} onLabel={(i, label) => setRuns(runs.map((r, j) => (j === i ? { ...r, label } : r)))} />
        ) : step === 1 ? (
          <FindingsStep findings={findings} setFindings={setFindings} />
        ) : step === 2 ? (
          <PlanStep plan={plan} setPlan={setPlan} meta={meta} setMeta={setMeta} onDraft={() => setMeta({ ...meta, summary: draftSummary(runs, findings) })} onSuggest={() => setPlan(tasksFrom(findings))} />
        ) : (
          <SendStep ready={ready} report={runs.length ? reportFor(site, meta, runs, findings, plan) : null} />
        )}
      </main>

      {runs.length ? (
        <footer className="sticky bottom-0 bg-paper/90 backdrop-blur border-t border-line">
          <div className="max-w-[1240px] mx-auto px-6 h-16 flex items-center gap-4">
            <button className="btn btn-line" disabled={step === 0} onClick={() => setStep(step - 1)}>
              <ArrowLeft size={16} /> Back
            </button>
            <p className="text-[13px] text-muted">
              {step === 0 && `${runs.length} ${runs.length === 1 ? "run" : "runs"} · ${findings.length} findings found`}
              {step === 1 && `${included} of ${findings.length} findings go in the report`}
              {step === 2 && `${plan.length} tasks · ${meta.agency ? `prepared by ${meta.agency}` : "add who it's from"}`}
              {step === 3 && (ready ? "Ready to send" : "Fill in “Prepared by”, the date and the summary in step 3")}
            </p>
            <div className="flex-1" />
            {step < 3 ? (
              <button className="btn btn-blue" onClick={() => setStep(step + 1)}>
                {STEPS[step + 1]} <ArrowRight size={16} />
              </button>
            ) : null}
          </div>
        </footer>
      ) : null}
    </div>
  );
}

/* ---------- step 1: runs ---------- */

function RunsStep(p: {
  runs: Run[];
  error: string | null;
  onFiles: (f: Array<{ name: string; text: string }>) => void;
  onSample: () => void;
  onClear: () => void;
  onRemove: (i: number) => void;
  onLabel: (i: number, label: string) => void;
}) {
  const file = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const take = async (list: FileList | null) => list && p.onFiles(await Promise.all([...list].slice(0, 2).map(async (f) => ({ name: f.name, text: await f.text() }))));

  return (
    <div className="space-y-6">
      <StepHead n={1} title={p.runs.length ? "Your Lighthouse runs" : "Start with a Lighthouse report"}>
        {p.runs.length
          ? "Add a second run to compare mobile with desktop, or before with after. Rename them as they should read in the report."
          : "Drop one or two Lighthouse JSON files. In Chrome: DevTools → Lighthouse → Analyze → ⋮ → Save as JSON. Or run npx lighthouse <url> --output=json."}
      </StepHead>

      <div className={`grid gap-5 ${p.runs.length ? "md:grid-cols-[1fr_1fr_280px]" : "md:grid-cols-[1fr_320px]"}`}>
        {p.runs.map((run, i) => (
          <RunCard key={run.id} run={run} onRemove={() => p.onRemove(i)} onLabel={(l) => p.onLabel(i, l)} />
        ))}
        {p.runs.length < 2 ? (
          <div
            onDragOver={(e) => (e.preventDefault(), setOver(true))}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => (e.preventDefault(), setOver(false), void take(e.dataTransfer.files))}
            onClick={() => file.current?.click()}
            className={`grid-dots cursor-pointer rounded-2xl border-2 border-dashed bg-paper grid place-items-center text-center p-10 min-h-[340px] transition-colors ${over ? "border-blue bg-blue-soft" : "border-line-strong hover:border-blue"}`}
          >
            <div className="space-y-3 bg-paper/90 rounded-xl p-4">
              <Upload01 size={26} className="mx-auto text-blue" />
              <p className="font-display font-extrabold text-[22px] tracking-tight">{p.runs.length ? "Add a second run" : "Drop Lighthouse JSON here"}</p>
              <p className="text-[13.5px] text-muted">or click to choose {p.runs.length ? "a file" : "one or two files"}</p>
            </div>
          </div>
        ) : null}
        <input ref={file} type="file" accept=".json,application/json" multiple className="hidden" onChange={(e) => void take(e.target.files)} />
        {!p.runs.length ? (
          <aside className="rounded-2xl border border-line bg-paper p-6 space-y-4 self-start">
            <p className="eyebrow">No report handy?</p>
            <p className="text-[14px] text-ink-2 leading-relaxed">Try two real Lighthouse 13 runs of a Wikipedia article, mobile and desktop, measured for this sample.</p>
            <button className="btn btn-ink w-full justify-center" onClick={p.onSample}>
              Load the sample runs
            </button>
            <p className="text-[12.5px] text-muted leading-relaxed">The file is read in your browser. Nothing is uploaded until you render a document.</p>
          </aside>
        ) : null}
      </div>
      {p.error ? (
        <p className="flex gap-2 text-[13.5px] text-poor">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {p.error}
        </p>
      ) : null}
      {p.runs.length ? (
        <button className="text-[13px] text-muted hover:text-ink inline-flex items-center gap-1.5" onClick={p.onClear}>
          <RefreshCw01 size={14} /> Start over with other runs
        </button>
      ) : null}
    </div>
  );
}

function RunCard({ run, onRemove, onLabel }: { run: Run; onRemove: () => void; onLabel: (l: string) => void }) {
  const rating = scoreRating(run.scores.performance);
  return (
    <section className="rounded-2xl border border-line bg-paper p-6 space-y-5">
      <div className="flex items-start gap-3">
        <input className="input !text-[15px] !font-semibold !py-1.5 max-w-[180px]" value={run.label} onChange={(e) => onLabel(e.target.value)} aria-label="Run label" />
        <span className="eyebrow mt-2.5">{run.formFactor}</span>
        <button onClick={onRemove} className="ml-auto text-faint hover:text-ink mt-1.5" aria-label="Remove run">
          <XClose size={18} />
        </button>
      </div>
      <div className="flex items-center gap-5">
        <Ring score={run.scores.performance} size={104} />
        <div>
          <p className={`font-display font-extrabold text-[44px] leading-none r-${rating}`}>{run.scores.performance}</p>
          <p className="text-[13px] text-muted mt-1">performance · {RATING_LABEL[rating].toLowerCase()}</p>
        </div>
      </div>
      <dl className="divide-y divide-line border-y border-line">
        {METRIC_ORDER.map((id) => {
          const r = rate(id, run.metrics[id], run.formFactor);
          return (
            <div key={id} className="flex items-center gap-3 py-2 text-[13.5px]">
              <dt className="flex-1">
                <span className="font-semibold">{METRICS[id].short}</span> <span className="text-muted">· {METRICS[id].plain}</span>
              </dt>
              <dd className="font-mono">{show(id, run.metrics[id])}</dd>
              <dd className={`w-[130px] text-right text-[12.5px] font-semibold r-${r}`}>{RATING_LABEL[r]}</dd>
            </div>
          );
        })}
      </dl>
      <p className="text-[12px] text-muted font-mono truncate" title={run.url}>
        {run.url} · {run.fetchedAt} · Lighthouse {run.lighthouse}
      </p>
    </section>
  );
}

/* ---------- step 2: findings ---------- */

function FindingsStep({ findings, setFindings }: { findings: FindingDraft[]; setFindings: (f: FindingDraft[]) => void }) {
  const update = (i: number, patch: Partial<FindingDraft>) => setFindings(findings.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= findings.length) return;
    const next = [...findings];
    [next[i], next[j]] = [next[j], next[i]];
    setFindings(next);
  };
  const included = findings.filter((f) => f.include).length;
  return (
    <div className="space-y-6 max-w-[920px]">
      <StepHead n={2} title="What goes in the report">
        Lighthouse found {findings.length} things. They&apos;re ranked by what fixing them saves, and already said in plain words. Pick the ones worth the
        client&apos;s attention (up to 10), and edit anything that should read differently.
      </StepHead>
      <ol className="space-y-3">
        {findings.map((f, i) => (
          <li key={f.key} className={`rounded-2xl border bg-paper transition-colors ${f.include ? "border-line-strong shadow-[0_1px_2px_rgb(11_18_32/0.05)]" : "border-line opacity-70"}`}>
            <div className="flex items-start gap-4 p-5">
              <button
                onClick={() => update(i, { include: !f.include })}
                disabled={!f.include && included >= 10}
                className={`mt-1 size-6 shrink-0 rounded-md border-2 grid place-items-center ${f.include ? "bg-blue border-blue text-white" : "border-line-strong"}`}
                aria-label={f.include ? "Leave out" : "Include"}
              >
                {f.include ? <Check size={14} /> : null}
              </button>
              <div className="flex-1 min-w-0 space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={f.impact} onChange={(v) => update(i, { impact: v as FindingDraft["impact"] })} options={[["high", "High impact"], ["medium", "Medium impact"], ["low", "Low impact"]]} tone={f.impact} />
                  <Select value={f.who} onChange={(v) => update(i, { who: v as Who })} options={(Object.keys(WHO_LABEL) as Who[]).map((w) => [w, WHO_LABEL[w]])} />
                  <span className="eyebrow">{f.category}</span>
                </div>
                <input className="input !text-[16px] !font-semibold" value={f.headline} maxLength={90} onChange={(e) => update(i, { headline: e.target.value })} aria-label="Finding" />
                {f.include ? (
                  <>
                    <textarea className="input !text-[14px] leading-relaxed" rows={2} maxLength={320} value={f.why} placeholder="Why it matters, in a sentence the client understands" onChange={(e) => update(i, { why: e.target.value })} />
                    <p className="font-mono text-[12px] text-muted">Lighthouse: {f.detail}</p>
                  </>
                ) : null}
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => move(i, -1)} className="text-faint hover:text-ink disabled:opacity-30" disabled={i === 0} aria-label="Move up">
                  <ArrowUp size={16} />
                </button>
                <button onClick={() => move(i, 1)} className="text-faint hover:text-ink disabled:opacity-30" disabled={i === findings.length - 1} aria-label="Move down">
                  <ArrowDown size={16} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ol>
      {findings.length === 0 ? <p className="text-muted">Lighthouse found nothing below 90. Say so in the summary: that&apos;s good news.</p> : null}
    </div>
  );
}

/* ---------- step 3: plan + details ---------- */

function PlanStep(p: { plan: TaskDraft[]; setPlan: (t: TaskDraft[]) => void; meta: Meta; setMeta: (m: Meta) => void; onDraft: () => void; onSuggest: () => void }) {
  const { plan, setPlan, meta, setMeta } = p;
  const update = (i: number, patch: Partial<TaskDraft>) => setPlan(plan.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  return (
    <div className="grid md:grid-cols-[1fr_380px] gap-8 items-start">
      <div className="space-y-6">
        <StepHead n={3} title="The summary and the plan">
          The summary is what the client reads first. It was drafted from the numbers; make it sound like you.
        </StepHead>
        <section className="rounded-2xl border border-line bg-paper p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="summary" className="font-semibold">
              Summary
            </label>
            <button className="text-[13px] font-semibold text-blue hover:text-blue-ink inline-flex items-center gap-1.5" onClick={p.onDraft}>
              <RefreshCw01 size={14} /> Draft again from the numbers
            </button>
          </div>
          <textarea id="summary" className="input !text-[15px] leading-relaxed" rows={5} maxLength={700} value={meta.summary} onChange={(e) => setMeta({ ...meta, summary: e.target.value })} />
          <p className="text-[12px] text-faint text-right">{meta.summary.length}/700</p>
        </section>

        <section className="rounded-2xl border border-line bg-paper">
          <div className="flex items-center justify-between p-5 pb-3">
            <h3 className="font-semibold">Plan</h3>
            <button className="text-[13px] font-semibold text-blue hover:text-blue-ink inline-flex items-center gap-1.5" onClick={p.onSuggest}>
              <RefreshCw01 size={14} /> Suggest from the findings
            </button>
          </div>
          <ol className="divide-y divide-line border-t border-line">
            {plan.map((t, i) => (
              <li key={i} className="flex items-center gap-3 px-5 py-3">
                <span className="font-mono text-[12px] text-faint w-5">{i + 1}</span>
                <input className="input flex-1" value={t.task} maxLength={140} onChange={(e) => update(i, { task: e.target.value })} aria-label={`Task ${i + 1}`} />
                <input className="input !w-32" value={t.owner} maxLength={40} placeholder="Owner" onChange={(e) => update(i, { owner: e.target.value })} aria-label="Owner" />
                <Select value={t.effort} onChange={(v) => update(i, { effort: v as TaskDraft["effort"] })} options={[["hours", "Hours"], ["days", "Days"], ["weeks", "Weeks"]]} />
                <button onClick={() => setPlan(plan.filter((_, j) => j !== i))} className="text-faint hover:text-ink" aria-label={`Remove task ${i + 1}`}>
                  <Trash01 size={16} />
                </button>
              </li>
            ))}
          </ol>
          {plan.length < 10 ? (
            <button className="m-5 mt-3 text-[13px] font-semibold inline-flex items-center gap-1.5 text-ink-2 hover:text-ink" onClick={() => setPlan([...plan, { task: "", owner: "", effort: "days" }])}>
              <Plus size={15} /> Add a task
            </button>
          ) : null}
        </section>
      </div>

      <aside className="rounded-2xl border border-line bg-paper p-5 space-y-4 md:sticky md:top-6">
        <h3 className="font-semibold">Report details</h3>
        <Field label="Prepared by" value={meta.agency} onChange={(v) => setMeta({ ...meta, agency: v })} placeholder="Your studio or name" />
        <Field label="Prepared for" value={meta.client} onChange={(v) => setMeta({ ...meta, client: v })} placeholder="The client (optional)" />
        <Field label="Report date" type="date" value={meta.reportDate} onChange={(v) => setMeta({ ...meta, reportDate: v })} />
        <div className="space-y-1.5">
          <span className="text-[13px] font-semibold text-ink-2">Brand colour</span>
          <div className="flex gap-2">
            {["#2453FF", "#0B1220", "#0F766E", "#7C3AED", "#C2410C"].map((c) => (
              <button key={c} onClick={() => setMeta({ ...meta, accent: c })} className={`size-7 rounded-full ring-offset-2 ${meta.accent === c ? "ring-2 ring-ink" : ""}`} style={{ background: c }} aria-label={c} />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ---------- step 4: send ---------- */

type Out = "report" | "email" | "card";

function SendStep({ ready, report }: { ready: boolean; report: ReturnType<typeof reportFor> | null }) {
  const [out, setOut] = useState<Out>("report");
  const [view, setView] = useState<{ url?: string; html?: string; issues?: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  const key = useMemo(() => JSON.stringify(report), [report]);

  useEffect(() => {
    if (!ready || !report) return;
    let alive = true;
    const t = setTimeout(async () => {
      setBusy(true);
      const res = await renderLocal({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ output: out, report }) });
      const type = res.headers.get("Content-Type") ?? "";
      const next = type.includes("json")
        ? await res.json().then((j) => (res.ok ? { html: j.html as string } : { issues: (j.diagnostics ?? [{ message: j.error }]).map((d: { message: string; path?: string }) => `${d.path ? `${d.path.replace(/^values\./, "")}: ` : ""}${d.message}`) }))
        : { url: URL.createObjectURL(await res.blob()) };
      if (!alive) return;
      setView((prev) => {
        if (prev?.url) URL.revokeObjectURL(prev.url);
        return next;
      });
      setBusy(false);
    }, 200);
    return () => {
      alive = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [out, key, ready]);

  async function download(which: Out) {
    if (!report) return;
    const res = await renderLocal({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ output: which, report }) });
    if (!res.ok) return;
    const slug = host(report.site).replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 60);
    const a = document.createElement("a");
    if (which === "email") a.href = URL.createObjectURL(new Blob([(await res.json()).html], { type: "text/html" }));
    else a.href = URL.createObjectURL(await res.blob());
    a.download = `${slug}-${which === "report" ? "performance-report.pdf" : which === "card" ? "results-card.png" : "summary-email.html"}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  const items: Array<[Out, string, string, ReactNode]> = [
    ["report", "Client report", "A4 PDF: scores, Core Web Vitals, findings, plan, appendix", <FileCheck02 key="i" size={18} />],
    ["email", "Summary email", "Score, vitals in words and the top three fixes", <Mail01 key="i" size={18} />],
    ["card", "Results card", "1200 × 630 PNG for a case study or post", <Image01 key="i" size={18} />],
  ];

  return (
    <div className="grid md:grid-cols-[320px_1fr] gap-6 items-start">
      <div className="space-y-4">
        <StepHead n={4} title="Send it" />
        {items.map(([id, name, desc, icon]) => (
          <div key={id} className={`rounded-2xl border bg-paper p-4 flex gap-3 items-start transition-colors ${out === id ? "border-ink" : "border-line hover:border-line-strong"}`}>
            <button className="flex gap-3 items-start text-left flex-1 min-w-0" onClick={() => id !== out && (setOut(id), setView(null))}>
              <span className="text-blue mt-0.5">{icon}</span>
              <span>
                <span className="block font-semibold text-[14.5px]">{name}</span>
                <span className="block text-[12.5px] text-muted leading-snug mt-0.5">{desc}</span>
              </span>
            </button>
            <button className="text-muted hover:text-ink disabled:opacity-30" disabled={!ready} onClick={() => void download(id)} aria-label={`Download ${name}`} title="Download">
              <Download01 size={18} />
            </button>
          </div>
        ))}
      </div>
      <section className="rounded-2xl border border-line bg-paper overflow-hidden min-h-[640px] h-[calc(100dvh-220px)] flex flex-col">
        {!ready ? (
          <div className="m-auto text-center space-y-2 p-8 max-w-sm">
            <p className="font-display font-extrabold text-[22px]">Almost there</p>
            <p className="text-[14px] text-muted">Add who it&apos;s prepared by, the date and a summary in step 3.</p>
          </div>
        ) : view?.issues ? (
          <div className="m-6 rounded-xl bg-poor-soft p-4 space-y-1">
            <p className="font-semibold text-poor text-[14px]">The template refused this report</p>
            {view.issues.map((m) => (
              <p key={m} className="text-[13px] text-ink-2">
                {m}
              </p>
            ))}
          </div>
        ) : view?.url && out === "report" ? (
          <iframe title="Report" src={view.url} className="flex-1 w-full" />
        ) : view?.url ? (
          <div className="flex-1 grid place-items-center bg-wash p-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={view.url} alt="The results card" className="max-w-full rounded-xl border border-line shadow-[0_20px_40px_-20px_rgb(11_18_32/0.35)]" />
          </div>
        ) : view?.html ? (
          <iframe title="Email" srcDoc={view.html} className="flex-1 w-full bg-wash" />
        ) : (
          <p className="m-auto text-[14px] text-muted">{busy ? "Rendering with Hyper Elements…" : ""}</p>
        )}
      </section>
    </div>
  );
}

/* ---------- pieces ---------- */

function StepHead({ n, title, children }: { n: number; title: string; children?: ReactNode }) {
  return (
    <div className="max-w-[720px]">
      <p className="eyebrow">Step {n} of 4</p>
      <h1 className="mt-1 font-display font-extrabold text-[30px] leading-tight tracking-tight">{title}</h1>
      {children ? <p className="mt-2 text-[15px] text-ink-2 leading-relaxed">{children}</p> : null}
    </div>
  );
}

function Ring({ score, size }: { score: number; size: number }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const rating = scoreRating(score);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`Score ${score}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E8ECF3" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={`var(--${rating})`}
        strokeWidth={stroke}
        strokeDasharray={`${(score / 100) * c} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

function Select({ value, onChange, options, tone }: { value: string; onChange: (v: string) => void; options: Array<[string, string]>; tone?: string }) {
  const toneClass = tone === "high" ? "rb-poor" : tone === "medium" ? "rb-improve" : tone === "low" ? "bg-wash text-ink-2" : "bg-wash text-ink-2";
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`rounded-full px-3 py-1 text-[12.5px] font-semibold outline-none border border-transparent focus:border-blue cursor-pointer ${toneClass}`}>
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[13px] font-semibold text-ink-2">{label}</span>
      <input type={type} className="input" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

const host = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
