/**
 * What every Plainspeed template shares: the report's fields, the look, and the score dial.
 * A report is one site at one moment: one or two Lighthouse runs (mobile and desktop, or before and after), the
 * findings in plain words, a plan, and a summary written for the person who pays for the site.
 */
import { Circle, Path, Svg, defineTheme, prop } from "@hyper-elements/react";
import { formatDate } from "@hyper-elements/react/template";
import type { MetricId, Rating } from "./metrics";
import { rate, scoreRating } from "./metrics";
import sample from "./example";


export const fields = {
  site: prop.text({ label: "Site", required: true, maxLength: 200, pattern: "^https?://" }),
  client: prop.text({ label: "Prepared for", maxLength: 80 }),
  agency: prop.text({ label: "Prepared by", required: true, maxLength: 80 }),
  reportDate: prop.date({ label: "Report date", required: true }),
  accent: prop.color({ label: "Brand colour", default: "#2453FF" }),
  summary: prop.text({ label: "Summary", required: true, maxLength: 700, guidance: "Three or four sentences for the person who pays for the site. No jargon." }),
  runs: prop.list(
    prop.object(
      {
        label: prop.text({ label: "Label", required: true, maxLength: 24 }),
        formFactor: prop.choice(["mobile", "desktop"], { label: "Device", required: true }),
        fetchedAt: prop.text({ label: "Tested on", maxLength: 10 }),
        lighthouse: prop.text({ label: "Lighthouse version", maxLength: 16 }),
        performance: prop.number({ label: "Performance", required: true, min: 0, max: 100, integer: true }),
        accessibility: prop.number({ label: "Accessibility", min: 0, max: 100, integer: true }),
        bestPractices: prop.number({ label: "Best practices", min: 0, max: 100, integer: true }),
        seo: prop.number({ label: "SEO", min: 0, max: 100, integer: true }),
        lcp: prop.number({ label: "LCP (ms)", required: true, min: 0 }),
        cls: prop.number({ label: "CLS", required: true, min: 0 }),
        tbt: prop.number({ label: "TBT (ms)", required: true, min: 0 }),
        fcp: prop.number({ label: "FCP (ms)", required: true, min: 0 }),
        si: prop.number({ label: "Speed Index (ms)", required: true, min: 0 }),
      },
      { label: "Run" },
    ),
    { label: "Lighthouse runs", required: true, min: 1, max: 2, guidance: "Mobile and desktop, or before and after." },
  ),
  findings: prop.list(
    prop.object(
      {
        headline: prop.text({ label: "Finding", required: true, maxLength: 90 }),
        why: prop.text({ label: "Why it matters", maxLength: 320 }),
        detail: prop.text({ label: "Lighthouse says", maxLength: 120 }),
        impact: prop.choice(["high", "medium", "low"], { label: "Impact", required: true }),
        who: prop.choice(["developer", "hosting", "content", "design"], { label: "Who fixes it", required: true }),
      },
      { label: "Finding" },
    ),
    { label: "Findings", max: 10 },
  ),
  plan: prop.list(
    prop.object(
      {
        task: prop.text({ label: "Task", required: true, maxLength: 140 }),
        owner: prop.text({ label: "Owner", maxLength: 40 }),
        effort: prop.choice(["hours", "days", "weeks"], { label: "Effort", required: true }),
      },
      { label: "Task" },
    ),
    { label: "Plan", max: 10 },
  ),
};

export type RunV = {
  label: string;
  formFactor: "mobile" | "desktop";
  fetchedAt?: string;
  lighthouse?: string;
  performance: number;
  accessibility?: number;
  bestPractices?: number;
  seo?: number;
} & Record<MetricId, number>;
export type Finding = { headline: string; why?: string; detail?: string; impact: "high" | "medium" | "low"; who: "developer" | "hosting" | "content" | "design" };
export type Task = { task: string; owner?: string; effort: "hours" | "days" | "weeks" };
export type Report = { site: string; client?: string; agency: string; reportDate: string; accent: string; summary: string; runs: RunV[]; findings: Finding[]; plan: Task[] };

/** The sample: two real Lighthouse 13.6.0 runs of a Wikipedia article (19 Nov 2026), written up by a made-up studio. */
export const example = sample as unknown as Report;

/* ---------- look ---------- */

export const INK = "#0B1220";
export const INK2 = "#334155";
export const MUTED = "#5B6577";
export const LINE = "#E2E6EE";
export const WASH = "#F5F7FA";
export const PAPER = "#FFFFFF";
export const RATING_COLOR: Record<Rating, string> = { good: "#0B7A44", improve: "#A15C00", poor: "#C4261D" };
export const RATING_WASH: Record<Rating, string> = { good: "#E8F5EE", improve: "#FBF1E2", poor: "#FCEBEA" };
export const IMPACT_COLOR = { high: "#C4261D", medium: "#A15C00", low: "#5B6577" } as const;

export const DISPLAY = "'Bricolage Grotesque', 'Helvetica Neue', Arial, sans-serif";
export const BODY = "'Public Sans', 'Helvetica Neue', Arial, sans-serif";
export const MONO = "'DM Mono', Menlo, Consolas, monospace";

export const FONT_FILES = [
  { family: "Bricolage Grotesque", src: "../fonts/Bricolage-600.woff", weight: 600 },
  { family: "Bricolage Grotesque", src: "../fonts/Bricolage-800.woff", weight: 800 },
  { family: "Public Sans", src: "../fonts/PublicSans-400.woff", weight: 400 },
  { family: "Public Sans", src: "../fonts/PublicSans-500.woff", weight: 500 },
  { family: "Public Sans", src: "../fonts/PublicSans-600.woff", weight: 600 },
  { family: "Public Sans", src: "../fonts/PublicSans-700.woff", weight: 700 },
  { family: "DM Mono", src: "../fonts/DMMono-400.woff", weight: 400 },
  { family: "DM Mono", src: "../fonts/DMMono-500.woff", weight: 500 },
];
const CDN = "https://cdn.jsdelivr.net/npm/@fontsource";
export const FONT_URLS = [
  { family: "Bricolage Grotesque", src: `${CDN}/bricolage-grotesque@5.3.0/files/bricolage-grotesque-latin-800-normal.woff2`, weight: 800 },
  { family: "Public Sans", src: `${CDN}/public-sans@5.3.0/files/public-sans-latin-400-normal.woff2`, weight: 400 },
  { family: "Public Sans", src: `${CDN}/public-sans@5.3.0/files/public-sans-latin-600-normal.woff2`, weight: 600 },
  { family: "Public Sans", src: `${CDN}/public-sans@5.3.0/files/public-sans-latin-700-normal.woff2`, weight: 700 },
  { family: "DM Mono", src: `${CDN}/dm-mono@5.3.0/files/dm-mono-latin-400-normal.woff2`, weight: 400 },
];

export const themeFor = (r: Pick<Report, "accent">) =>
  defineTheme({
    colors: { background: WASH, foreground: INK, primary: r.accent, primaryForeground: PAPER, muted: MUTED, border: LINE, paper: PAPER },
    fonts: { body: BODY, heading: DISPLAY },
    fontSizes: { body: 16 },
    lineHeights: { body: 1.6 },
    elements: {
      Heading: { fontWeight: 800, letterSpacing: -0.6, lineHeight: 1.1, by: { level: { 1: { fontSize: 32, mobile: { fontSize: 26 } }, 2: { fontSize: 20 } } } },
      Button: { fontWeight: 700, fontSize: 15, padding: [13, 22], borderRadius: 8 },
    },
    styles: {
      label: { fontFamily: MONO, fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase", color: MUTED },
      card: { backgroundColor: PAPER, padding: 32, gap: 20, border: `1px solid ${LINE}`, borderRadius: 14 },
    },
  });

/* ---------- helpers ---------- */

export const host = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
export const longDate = (iso: string) => formatDate(iso, "en-GB", { day: "numeric", month: "long", year: "numeric" });
export const ratingOf = (run: RunV, id: MetricId): Rating => rate(id, run[id], run.formFactor);
export const coreRatings = (run: RunV) => (["lcp", "cls", "tbt"] as const).map((id) => ratingOf(run, id));

/** The performance score as a ring, drawn as one Svg (vector in the PDF, pixels in the card). */
export function Dial({ score, size, stroke = 10, track = "#E8ECF3" }: { score: number; size: number; stroke?: number; track?: string }) {
  const r = (size - stroke) / 2;
  const c = size / 2;
  const angle = (Math.max(0, Math.min(100, score)) / 100) * 2 * Math.PI;
  const x = c + r * Math.sin(angle);
  const y = c - r * Math.cos(angle);
  const large = angle > Math.PI ? 1 : 0;
  const color = RATING_COLOR[scoreRating(score)];
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} title={`Score ${score} of 100`}>
      <Circle cx={c} cy={c} r={r} style={{ fill: "transparent", stroke: track, strokeWidth: stroke }} />
      {score >= 100 ? (
        <Circle cx={c} cy={c} r={r} style={{ fill: "transparent", stroke: color, strokeWidth: stroke }} />
      ) : score > 0 ? (
        <Path d={`M ${c} ${c - r} A ${r} ${r} 0 ${large} 1 ${x.toFixed(2)} ${y.toFixed(2)}`} style={{ fill: "transparent", stroke: color, strokeWidth: stroke }} />
      ) : null}
    </Svg>
  );
}
