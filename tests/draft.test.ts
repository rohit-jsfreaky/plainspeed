// The draft the dashboard starts from: built only from the measured numbers.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readRun } from "../src/lib/lighthouse.ts";
import { draftSummary, findingsFrom, reportFor, tasksFrom } from "../src/lib/draft.ts";

const runs = ["mobile", "desktop"].map((d) => readRun(readFileSync(new URL(`../public/samples/wikipedia-${d}.json`, import.meta.url), "utf8")));

test("findings: one per headline, top six performance ones picked", () => {
  const f = findingsFrom(runs);
  assert.equal(f.filter((x) => x.include).length, 6);
  assert.equal(new Set(f.map((x) => x.headline)).size, f.length);
  assert.ok(f.filter((x) => x.include).every((x) => x.category === "performance"));
});

test("summary reads as a sentence and states the real numbers", () => {
  const s = draftSummary(runs, findingsFrom(runs));
  assert.match(s, /scores 95 on mobile and 91 on desktop/);
  assert.match(s, /CLS 0\.11\) needs improvement/);
  assert.doesNotMatch(s, /is needs/);
});

test("plan uses action wording", () => {
  const t = tasksFrom(findingsFrom(runs));
  assert.equal(t[0].task, "Reserve space for the elements that shift while the page loads");
});

test("report values keep only what's included", () => {
  const f = findingsFrom(runs);
  const r = reportFor(runs[0].url, { client: "", agency: "Studio", reportDate: "2026-11-19", accent: "#2453FF", summary: "x" }, runs, f, tasksFrom(f));
  assert.equal(r.findings.length, 6);
  assert.equal(r.client, undefined);
  assert.equal(r.runs[1].formFactor, "desktop");
});
