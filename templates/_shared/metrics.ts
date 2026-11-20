/**
 * The five lab metrics Lighthouse reports, Google's bands for each, and how to say them. No imports: the browser and
 * the templates both use it.
 *
 * Bands (good up to the first number, poor past the second), from the Lighthouse docs on developer.chrome.com
 * (read 19 Nov 2026): LCP mobile 2.5/4 s, desktop 1.2/2.4 s · FCP mobile 1.8/3 s, desktop 0.9/1.6 s · Speed Index
 * mobile 3.4/5.8 s, desktop 1.3/2.3 s · TBT mobile 200/600 ms, desktop 150/350 ms. CLS 0.1/0.25 on both (web.dev).
 * INP needs real users, so a lab report shows TBT, its closest lab stand-in.
 */
export type FormFactor = "mobile" | "desktop";
export type MetricId = "lcp" | "cls" | "tbt" | "fcp" | "si";
export type Rating = "good" | "improve" | "poor";

export const METRICS: Record<MetricId, { name: string; short: string; unit: "ms" | ""; bands: Record<FormFactor, [number, number]>; plain: string; core: boolean }> = {
  lcp: { name: "Largest Contentful Paint", short: "LCP", unit: "ms", bands: { mobile: [2500, 4000], desktop: [1200, 2400] }, plain: "when the main content appears", core: true },
  cls: { name: "Cumulative Layout Shift", short: "CLS", unit: "", bands: { mobile: [0.1, 0.25], desktop: [0.1, 0.25] }, plain: "how much the page jumps while it loads", core: true },
  tbt: { name: "Total Blocking Time", short: "TBT", unit: "ms", bands: { mobile: [200, 600], desktop: [150, 350] }, plain: "how long the page is too busy to respond", core: true },
  fcp: { name: "First Contentful Paint", short: "FCP", unit: "ms", bands: { mobile: [1800, 3000], desktop: [900, 1600] }, plain: "when anything first appears", core: false },
  si: { name: "Speed Index", short: "SI", unit: "ms", bands: { mobile: [3400, 5800], desktop: [1300, 2300] }, plain: "how quickly the page fills in", core: false },
};
export const METRIC_ORDER: MetricId[] = ["lcp", "cls", "tbt", "fcp", "si"];

export function rate(id: MetricId, value: number, ff: FormFactor): Rating {
  const [good, poor] = METRICS[id].bands[ff];
  return value <= good ? "good" : value <= poor ? "improve" : "poor";
}

export const RATING_LABEL: Record<Rating, string> = { good: "Good", improve: "Needs improvement", poor: "Poor" };

/** "1.3 s", "30 ms", "0.11". */
export function show(id: MetricId, value: number) {
  if (METRICS[id].unit === "") return value.toFixed(value < 0.1 ? 3 : 2).replace(/\.?0+$/, "") || "0";
  return value >= 1000 ? `${(value / 1000).toFixed(1)} s` : `${Math.round(value / 10) * 10} ms`;
}

/** Lighthouse's score colour bands: 90+ good, 50–89 needs improvement, under 50 poor. */
export const scoreRating = (score: number): Rating => (score >= 90 ? "good" : score >= 50 ? "improve" : "poor");
