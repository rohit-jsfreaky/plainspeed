/**
 * The client report: an A4 PDF. Page 1 says how the site does (scores, Core Web Vitals against Google's bands, the
 * summary); then what was found, in plain words; then the plan; then the technical appendix for whoever fixes it.
 */
import { Fragment } from "react";
import { Column, Document, Heading, PageBreak, PageFooter, PageNumber, Rect, Row, Span, Svg, Table, TableCell, TableRow, Text } from "@hyper-elements/react";
import { template } from "@hyper-elements/react/template";
import { METRICS, METRIC_ORDER, RATING_LABEL, scoreRating, show, type MetricId } from "./_shared/metrics";
import {
  BODY,
  DISPLAY,
  Dial,
  FONT_FILES,
  IMPACT_COLOR,
  INK,
  INK2,
  LINE,
  MONO,
  MUTED,
  RATING_COLOR,
  WASH,
  example,
  fields,
  host,
  longDate,
  ratingOf,
  type Finding,
  type Report,
  type RunV,
} from "./_shared/report";

const W = 698; // A4 at 96 px/in less 48 px margins
const FINDINGS_PER_PAGE = 7;
const label = { fontFamily: MONO, fontSize: 8.5, fontWeight: 400, letterSpacing: 0.6, textTransform: "uppercase", color: MUTED } as const;
const WHO = { developer: "Developer", hosting: "Hosting", content: "Content", design: "Design" } as const;
const EFFORT = { hours: "Hours", days: "Days", weeks: "Weeks" } as const;

/** Where a value sits on its metric's scale: good / needs improvement / poor zones, and a marker. */
function Band({ id, run, width }: { id: MetricId; run: RunV; width: number }) {
  const [good, poor] = METRICS[id].bands[run.formFactor];
  const max = poor * 1.5;
  const x = (v: number) => Math.round((Math.min(v, max) / max) * width);
  const v = run[id];
  return (
    <Svg width={width} height={14} title={`${show(id, v)} on a scale where ${show(id, good)} is good`}>
      <Rect y={5} width={x(good)} height={4} style={{ fill: "#B9DEC9" }} />
      <Rect x={x(good)} y={5} width={x(poor) - x(good)} height={4} style={{ fill: "#F1D7A8" }} />
      <Rect x={x(poor)} y={5} width={width - x(poor)} height={4} style={{ fill: "#F4C3BF" }} />
      <Rect x={Math.max(0, Math.min(width - 3, x(v) - 1.5))} y={0} width={3} height={14} rx={1.5} style={{ fill: INK }} />
    </Svg>
  );
}

export default template({
  id: "plainspeed.Report",
  version: "1.0.0",
  label: "Website performance report (PDF)",
  guidance: "For the client. Keep the summary free of jargon; the appendix is where the numbers live.",
  root: "Document",
  formats: { a4: { size: "A4", orientation: "portrait" } },
  fields,
  example,
  render(v) {
    const r = v as unknown as Report;
    const runs = r.runs;
    const findingPages = Array.from({ length: Math.ceil(r.findings.length / FINDINGS_PER_PAGE) }, (_, i) => r.findings.slice(i * FINDINGS_PER_PAGE, i * FINDINGS_PER_PAGE + FINDINGS_PER_PAGE));
    const metricW = runs.length === 2 ? 160 : 230;

    const finding = (f: Finding, n: number) => (
      <Row key={n} style={{ gap: 14, padding: [14, 0], border: { top: `0.75px solid ${LINE}` }, alignItems: "start" }}>
        <Column style={{ width: 26 }}>
          <Text style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 18, lineHeight: 1.1, color: MUTED }}>{String(n).padStart(2, "0")}</Text>
        </Column>
        <Column style={{ gap: 4 }}>
          <Row style={{ gap: 8, alignItems: "center" }}>
            <Text style={{ ...label, color: IMPACT_COLOR[f.impact] }}>{f.impact} impact</Text>
            <Text style={label}>· {WHO[f.who]}</Text>
          </Row>
          <Text style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 15, lineHeight: 1.25 }}>{f.headline}</Text>
          {f.why ? <Text style={{ fontSize: 10, lineHeight: 1.5, color: INK2 }}>{f.why}</Text> : null}
          {f.detail ? <Text style={{ fontFamily: MONO, fontSize: 8.5, color: MUTED }}>Lighthouse: {f.detail}</Text> : null}
        </Column>
      </Row>
    );

    return (
      <Document size="A4" margin={48} title={`Performance report · ${host(r.site)}`} fonts={FONT_FILES} style={{ fontFamily: BODY, fontSize: 10, color: INK, gap: 16 }}>
        {/* Page 1: how the site does */}
        <Row style={{ alignItems: "center" }}>
          <Column>
            <Text style={label}>Website performance report</Text>
          </Column>
          <Column>
            <Text style={{ ...label, textAlign: "right" }}>{longDate(r.reportDate)}</Text>
          </Column>
        </Row>
        <Column style={{ gap: 6 }}>
          <Heading level={1} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, lineHeight: 1.1, letterSpacing: -0.6 }}>
            {host(r.site)}
          </Heading>
          <Text style={{ fontSize: 10.5, color: MUTED }}>
            {r.client ? `Prepared for ${r.client} by ${r.agency}` : `Prepared by ${r.agency}`}
          </Text>
        </Column>

        <Row style={{ gap: 12 }}>
          {runs.map((run) => (
            <Row key={run.label} style={{ gap: 16, padding: [16, 18], backgroundColor: WASH, borderRadius: 10, alignItems: "center" }}>
              <Column style={{ width: 86 }}>
                <Dial score={run.performance} size={86} stroke={9} />
              </Column>
              <Column style={{ gap: 2 }}>
                <Text style={label}>{run.label} performance</Text>
                <Text style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 34, lineHeight: 1.05, color: RATING_COLOR[scoreRating(run.performance)] }}>{run.performance}</Text>
                <Text style={{ fontSize: 9, color: MUTED }}>out of 100 · {RATING_LABEL[scoreRating(run.performance)].toLowerCase()}</Text>
              </Column>
            </Row>
          ))}
        </Row>

        <Text style={{ fontSize: 12, lineHeight: 1.6 }}>{r.summary}</Text>

        <Column style={{ gap: 0 }}>
          <Row style={{ padding: [0, 0, 6], border: { bottom: `1px solid ${INK}` } }}>
            <Column>
              <Text style={label}>Measure</Text>
            </Column>
            {runs.map((run) => (
              <Column key={run.label} style={{ width: metricW }}>
                <Text style={label}>{run.label}</Text>
              </Column>
            ))}
          </Row>
          {METRIC_ORDER.map((id) => (
            <Row key={id} style={{ padding: [9, 0], border: { bottom: `0.75px solid ${LINE}` }, alignItems: "center" }}>
              <Column style={{ gap: 1 }}>
                <Text style={{ fontWeight: 600, fontSize: 10.5 }}>
                  {METRICS[id].name}
                  {METRICS[id].core ? <Span style={{ fontFamily: MONO, fontSize: 7.5, fontWeight: 400, color: MUTED }}> CORE</Span> : null}
                </Text>
                <Text style={{ fontSize: 9, color: MUTED }}>{METRICS[id].plain}</Text>
              </Column>
              {runs.map((run) => {
                const rating = ratingOf(run, id);
                return (
                  <Column key={run.label} style={{ width: metricW, gap: 3 }}>
                    <Row style={{ gap: 8, alignItems: "center" }}>
                      <Column style={{ width: 46 }}>
                        <Text style={{ fontFamily: MONO, fontSize: 11, fontWeight: 500 }}>{show(id, run[id])}</Text>
                      </Column>
                      <Column style={{ width: metricW - 54 }}>
                        <Text style={{ fontSize: 8.5, fontWeight: 600, color: RATING_COLOR[rating] }}>{RATING_LABEL[rating]}</Text>
                      </Column>
                    </Row>
                    <Band id={id} run={run} width={metricW - 24} />
                  </Column>
                );
              })}
            </Row>
          ))}
          <Text style={{ fontSize: 8, color: MUTED, padding: [8, 0, 0] }}>
            Bands from Google&apos;s Lighthouse documentation for {runs.map((x) => x.formFactor).filter((f, i, a) => a.indexOf(f) === i).join(" and ")}. Core: the lab
            measures behind Google&apos;s Core Web Vitals (Total Blocking Time stands in for Interaction to Next Paint, which needs real visitors).
          </Text>
        </Column>

        {/* Findings */}
        {findingPages.map((page, p) => (
          <Fragment key={`f${p}`}>
            <PageBreak />
            <Column style={{ gap: 4 }}>
              <Text style={label}>
                What we found{findingPages.length > 1 ? ` · ${p + 1} of ${findingPages.length}` : ""}
              </Text>
              <Heading level={2} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, letterSpacing: -0.4 }}>
                {p === 0 ? `${r.findings.length} things worth fixing, most important first` : "Continued"}
              </Heading>
            </Column>
            <Column style={{ gap: 0 }}>{page.map((f, i) => finding(f, p * FINDINGS_PER_PAGE + i + 1))}</Column>
          </Fragment>
        ))}

        {/* Plan + appendix */}
        <PageBreak />
        {r.plan.length ? (
          <Column style={{ gap: 10 }}>
            <Text style={label}>What we&apos;ll do</Text>
            <Table style={{ width: W, cellPadding: [8, 6], rowBorder: { width: 0.75, style: "solid", color: LINE } }}>
              <TableRow header>
                <TableCell style={{ ...label, width: 24 }}>#</TableCell>
                <TableCell style={label}>Task</TableCell>
                <TableCell style={{ ...label, width: 110 }}>Owner</TableCell>
                <TableCell style={{ ...label, width: 70 }}>Effort</TableCell>
              </TableRow>
              {r.plan.map((t, i) => (
                <TableRow key={i}>
                  <TableCell style={{ fontFamily: MONO, fontSize: 9, color: MUTED }}>{i + 1}</TableCell>
                  <TableCell style={{ fontSize: 10 }}>{t.task}</TableCell>
                  <TableCell style={{ fontSize: 10, color: INK2 }}>{t.owner ?? "—"}</TableCell>
                  <TableCell style={{ fontSize: 10 }}>{EFFORT[t.effort]}</TableCell>
                </TableRow>
              ))}
            </Table>
          </Column>
        ) : null}

        <Column style={{ gap: 10 }}>
          <Text style={label}>Appendix · how this was measured</Text>
          <Table style={{ width: W, cellPadding: [7, 6], rowBorder: { width: 0.75, style: "solid", color: LINE } }}>
            <TableRow header>
              <TableCell style={label}>Run</TableCell>
              <TableCell style={{ ...label, width: 80 }}>Device</TableCell>
              <TableCell style={{ ...label, width: 90 }}>Tested on</TableCell>
              <TableCell style={{ ...label, width: 70 }}>Access.</TableCell>
              <TableCell style={{ ...label, width: 70 }}>Best pr.</TableCell>
              <TableCell style={{ ...label, width: 60 }}>SEO</TableCell>
            </TableRow>
            {runs.map((run) => (
              <TableRow key={run.label}>
                <TableCell style={{ fontSize: 10 }}>{run.label}</TableCell>
                <TableCell style={{ fontSize: 10 }}>{run.formFactor === "mobile" ? "Mobile" : "Desktop"}</TableCell>
                <TableCell style={{ fontFamily: MONO, fontSize: 9 }}>{run.fetchedAt ?? "—"}</TableCell>
                <TableCell style={{ fontFamily: MONO, fontSize: 9 }}>{run.accessibility ?? "—"}</TableCell>
                <TableCell style={{ fontFamily: MONO, fontSize: 9 }}>{run.bestPractices ?? "—"}</TableCell>
                <TableCell style={{ fontFamily: MONO, fontSize: 9 }}>{run.seo ?? "—"}</TableCell>
              </TableRow>
            ))}
          </Table>
          <Text style={{ fontSize: 9, lineHeight: 1.55, color: INK2 }}>
            Page tested: {r.site}. Lab data from Lighthouse{runs[0].lighthouse ? ` ${runs[0].lighthouse}` : ""}, which loads the page once on an emulated
            device and network. Real visitors&apos; numbers vary with their phones and connections; lab runs are for finding causes and checking fixes.
            Score bands: 90 to 100 good, 50 to 89 needs improvement, under 50 poor.
          </Text>
        </Column>

        <PageFooter style={{ padding: [10, 0, 0], border: { top: `0.75px solid ${LINE}` } }}>
          <Row>
            <Column>
              <Text style={{ fontSize: 8, color: MUTED }}>
                {host(r.site)} · {r.agency}
              </Text>
            </Column>
            <Column>
              <Text style={{ fontSize: 8, color: MUTED, textAlign: "right" }}>
                Page <PageNumber /> of <PageNumber total />
              </Text>
            </Column>
          </Row>
        </PageFooter>
      </Document>
    );
  },
});
