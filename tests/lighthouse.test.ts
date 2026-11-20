// Run: npm test. Reads the two real Lighthouse 13 runs in public/samples.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readRun } from "../src/lib/lighthouse.ts";
import { rate, show } from "../templates/_shared/metrics.ts";

const mobile = readRun(readFileSync(new URL("../public/samples/wikipedia-mobile.json", import.meta.url), "utf8"));
const desktop = readRun(readFileSync(new URL("../public/samples/wikipedia-desktop.json", import.meta.url), "utf8"));

test("reads a real Lighthouse 13 report", () => {
  assert.equal(mobile.formFactor, "mobile");
  assert.equal(desktop.formFactor, "desktop");
  assert.equal(mobile.url, "https://en.wikipedia.org/wiki/Web_performance");
  assert.equal(mobile.scores.performance, 95);
  assert.equal(show("cls", mobile.metrics.cls), "0.11");
  assert.equal(rate("cls", mobile.metrics.cls, "mobile"), "improve");
  assert.equal(rate("lcp", mobile.metrics.lcp, "mobile"), "good");
});

test("ranks issues by what fixing them saves, and says them plainly", () => {
  assert.ok(mobile.issues.length > 5);
  const top = mobile.issues[0];
  assert.ok(top.savingsMs > 0 || top.savingsCls > 0);
  assert.ok(mobile.issues.some((i) => i.headline === "The server is slow to start answering"));
  // the old audit and its newer insight collapse into one finding
  assert.equal(mobile.issues.filter((i) => i.headline === "The server is slow to start answering").length, 1);
});

test("refuses what isn't a Lighthouse report", () => {
  assert.throws(() => readRun("{}"), /isn't a Lighthouse report/);
  assert.throws(() => readRun("nope"), /isn't JSON/);
});

test("formats metrics", () => {
  assert.equal(show("lcp", 1346), "1.3 s");
  assert.equal(show("tbt", 34.5), "30 ms");
  assert.equal(show("cls", 0.072), "0.072");
  assert.equal(show("cls", 0), "0");
});
