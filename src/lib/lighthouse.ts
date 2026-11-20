// Reads a Lighthouse JSON report (DevTools "Save as JSON", `lighthouse --output=json`, or the lighthouseResult of a
// PageSpeed Insights API response) into what Plainspeed needs: scores, the five lab metrics, and the failing audits
// ranked by what fixing them would save.
import { PLAIN, type Who } from "../../templates/_shared/plain.ts";
import type { FormFactor, MetricId } from "../../templates/_shared/metrics.ts";

export type Run = {
  id: string;
  label: string;
  url: string;
  fetchedAt: string;
  formFactor: FormFactor;
  lighthouse: string;
  scores: { performance: number; accessibility?: number; bestPractices?: number; seo?: number };
  metrics: Record<MetricId, number>;
  issues: Issue[];
};
export type Issue = {
  id: string;
  title: string; // Lighthouse's
  headline: string; // plain
  why: string;
  who: Who;
  display?: string;
  savingsMs: number; // FCP/LCP/TBT time Lighthouse estimates
  savingsCls: number;
  category: "performance" | "accessibility" | "best-practices" | "seo";
  known: boolean; // has a plain-English entry
};

type Audit = { id: string; title: string; score: number | null; scoreDisplayMode?: string; displayValue?: string; metricSavings?: Record<string, number>; numericValue?: number };
type Report = {
  lighthouseVersion?: string;
  finalDisplayedUrl?: string;
  finalUrl?: string;
  requestedUrl?: string;
  fetchTime?: string;
  configSettings?: { formFactor?: string; emulatedFormFactor?: string };
  categories?: Record<string, { score: number | null; auditRefs: Array<{ id: string; group?: string }> }>;
  audits?: Record<string, Audit>;
};

export function readRun(text: string, label?: string): Run {
  let doc: Report & { lighthouseResult?: Report };
  try {
    doc = JSON.parse(text);
  } catch {
    throw new Error("This isn't JSON. Save the Lighthouse report as JSON (DevTools → Lighthouse → ⋮ → Save as JSON).");
  }
  const lh = doc.lighthouseResult ?? doc; // a PageSpeed Insights API response wraps the report
  if (!lh.audits || !lh.categories?.performance) throw new Error("This JSON isn't a Lighthouse report with a performance category.");
  const a = lh.audits;
  const num = (id: string) => (typeof a[id]?.numericValue === "number" ? a[id].numericValue! : NaN);
  const metrics = {
    lcp: num("largest-contentful-paint"),
    cls: num("cumulative-layout-shift"),
    tbt: num("total-blocking-time"),
    fcp: num("first-contentful-paint"),
    si: num("speed-index"),
  };
  if (Object.values(metrics).some((v) => Number.isNaN(v))) throw new Error("The report is missing lab metrics (was the page loaded successfully?).");
  const formFactor: FormFactor = (lh.configSettings?.formFactor ?? lh.configSettings?.emulatedFormFactor) === "desktop" ? "desktop" : "mobile";
  const pct = (k: string) => (typeof lh.categories?.[k]?.score === "number" ? Math.round(lh.categories[k].score! * 100) : undefined);

  const catOf = new Map<string, Issue["category"]>();
  // Lighthouse 13 hides older audits behind its newer insights, but some carry the real savings (layout-shifts has the
  // CLS figure, its insight doesn't): take hidden ones we can say plainly, then keep the bigger saving per headline.
  for (const [cat, c] of Object.entries(lh.categories ?? {}))
    for (const ref of c.auditRefs ?? [])
      if (!catOf.has(ref.id) && ref.group !== "metrics" && (ref.group !== "hidden" || PLAIN[ref.id])) catOf.set(ref.id, cat as Issue["category"]);

  const issues: Issue[] = [];
  for (const [id, cat] of catOf) {
    const audit = a[id];
    if (!audit || audit.score === null || audit.score >= 0.9) continue;
    if (audit.scoreDisplayMode && !["metricSavings", "numeric", "binary"].includes(audit.scoreDisplayMode)) continue;
    const s = audit.metricSavings ?? {};
    const plain = PLAIN[id];
    issues.push({
      id,
      title: audit.title,
      headline: plain?.headline ?? audit.title.replace(/`/g, ""),
      why: plain?.why ?? "",
      who: plain?.who ?? "developer",
      display: audit.displayValue?.replace(/ /g, " "),
      savingsMs: Math.max(s.LCP ?? 0, s.FCP ?? 0, s.TBT ?? 0, s.INP ?? 0),
      savingsCls: s.CLS ?? 0,
      category: cat,
      known: !!plain,
    });
  }
  // Same headline from an old audit and its newer insight: keep the one with the bigger saving.
  const byHeadline = new Map<string, Issue>();
  for (const i of issues) {
    const prev = byHeadline.get(i.headline);
    if (!prev || impact(i) > impact(prev)) byHeadline.set(i.headline, i);
  }
  const url = lh.finalDisplayedUrl ?? lh.finalUrl ?? lh.requestedUrl ?? "";
  return {
    id: `${url}|${lh.fetchTime}|${formFactor}`,
    label: label ?? (formFactor === "desktop" ? "Desktop" : "Mobile"),
    url,
    fetchedAt: (lh.fetchTime ?? "").slice(0, 10),
    formFactor,
    lighthouse: lh.lighthouseVersion ?? "",
    scores: { performance: pct("performance") ?? 0, accessibility: pct("accessibility"), bestPractices: pct("best-practices"), seo: pct("seo") },
    metrics,
    issues: [...byHeadline.values()].sort((x, y) => impact(y) - impact(x)),
  };
}

/** One number to rank by: time saved, layout shift weighted like Lighthouse (0.1 CLS ≈ a noticeable delay), performance first. */
export const impact = (i: Pick<Issue, "savingsMs" | "savingsCls" | "category">) =>
  i.savingsMs + i.savingsCls * 5000 + (i.category === "performance" ? 50 : 0);

export const impactLevel = (i: Pick<Issue, "savingsMs" | "savingsCls" | "category">): "high" | "medium" | "low" =>
  i.savingsMs >= 300 || i.savingsCls >= 0.05 ? "high" : i.savingsMs >= 100 || i.savingsCls > 0 || i.category === "performance" ? "medium" : "low";
