// The dashboard's draft: findings picked and edited, a plan, the report details. And the values the templates take.
import { METRICS, RATING_LABEL, rate, scoreRating, show } from "../../templates/_shared/metrics.ts";
import { FIX, WHO_LABEL, type Who } from "../../templates/_shared/plain.ts";
import { impact, impactLevel, type Issue, type Run } from "./lighthouse.ts";

export type FindingDraft = {
  key: string;
  include: boolean;
  headline: string;
  why: string;
  detail: string;
  impact: "high" | "medium" | "low";
  who: Who;
  category: Issue["category"];
};
export type TaskDraft = { task: string; owner: string; effort: "hours" | "days" | "weeks" };
export type Meta = { client: string; agency: string; reportDate: string; accent: string; summary: string };

/** Findings from every run, one per headline (the run where fixing it saves most), the top six performance ones picked. */
export function findingsFrom(runs: Run[]): FindingDraft[] {
  const best = new Map<string, Issue>();
  for (const run of runs) for (const i of run.issues) if (!best.has(i.headline) || impact(i) > impact(best.get(i.headline)!)) best.set(i.headline, i);
  const sorted = [...best.values()].sort((a, b) => impact(b) - impact(a));
  let picked = 0;
  return sorted.map((i) => {
    const include = i.category === "performance" && picked < 6 && (picked++, true);
    return {
      key: i.id,
      include,
      headline: i.headline,
      why: i.why,
      detail: (i.display ? `${i.title}: ${i.display}` : i.title).replace(/`/g, "").slice(0, 120),
      impact: impactLevel(i),
      who: i.who,
      category: i.category,
    };
  });
}

/** A plan to start from: one task per included finding, owned by whoever usually fixes it. */
export const tasksFrom = (findings: FindingDraft[]): TaskDraft[] =>
  findings
    .filter((f) => f.include)
    .slice(0, 8)
    .map((f) => ({
      task: (FIX[f.key] ?? `Fix: ${f.headline.charAt(0).toLowerCase()}${f.headline.slice(1)}`).slice(0, 140),
      owner: WHO_LABEL[f.who],
      effort: f.impact === "high" ? "days" : "hours",
    }));

const verdict = (r: ReturnType<typeof rate>) => (r === "improve" ? "needs improvement" : `is ${RATING_LABEL[r].toLowerCase()}`);

/** A first summary, written only from the numbers. The person edits it before it goes out. */
export function draftSummary(runs: Run[], findings: FindingDraft[]) {
  const first = runs[0];
  const scores = runs.map((r) => `${r.scores.performance} on ${r.label.toLowerCase()}`).join(" and ");
  const overall = scoreRating(first.scores.performance);
  const lead = overall === "good" ? "The page is fast" : overall === "improve" ? "The page is middling for speed" : "The page is slow";
  const weak = (["lcp", "cls", "tbt"] as const).filter((id) => rate(id, first.metrics[id], first.formFactor) !== "good");
  const vitals = weak.length
    ? `On ${first.label.toLowerCase()}, ${weak.map((id) => `${METRICS[id].plain} (${METRICS[id].short} ${show(id, first.metrics[id])}) ${verdict(rate(id, first.metrics[id], first.formFactor))}`).join(", and ")}.`
    : `All three Core Web Vitals measured in the lab are within Google's "good" range on ${first.label.toLowerCase()}.`;
  const top = findings.filter((f) => f.include).slice(0, 2).map((f) => f.headline.charAt(0).toLowerCase() + f.headline.slice(1));
  const next = top.length ? ` The changes worth making first: ${top.join(", and ")}.` : "";
  return `${lead}: it scores ${scores} out of 100. ${vitals}${next}`.slice(0, 700);
}

/** What the templates take. */
export function reportFor(site: string, meta: Meta, runs: Run[], findings: FindingDraft[], plan: TaskDraft[]) {
  return {
    site,
    client: meta.client.trim() || undefined,
    agency: meta.agency.trim(),
    reportDate: meta.reportDate,
    accent: meta.accent,
    summary: meta.summary.trim(),
    runs: runs.map((r) => ({
      label: r.label.trim() || (r.formFactor === "mobile" ? "Mobile" : "Desktop"),
      formFactor: r.formFactor,
      fetchedAt: r.fetchedAt || undefined,
      lighthouse: r.lighthouse || undefined,
      performance: r.scores.performance,
      accessibility: r.scores.accessibility,
      bestPractices: r.scores.bestPractices,
      seo: r.scores.seo,
      ...r.metrics,
    })),
    findings: findings
      .filter((f) => f.include)
      .slice(0, 10)
      .map(({ headline, why, detail, impact, who }) => ({ headline: headline.trim(), why: why.trim() || undefined, detail: detail.trim() || undefined, impact, who })),
    plan: plan.filter((t) => t.task.trim()).slice(0, 10).map((t) => ({ task: t.task.trim(), owner: t.owner.trim() || undefined, effort: t.effort })),
  };
}
