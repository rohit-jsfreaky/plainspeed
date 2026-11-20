/**
 * The summary email to the client: the score, the three Core Web Vitals in words, the top findings, and that the
 * full report is attached. Short enough to read on a phone.
 */
import { Column, Email, Heading, Row, Section, Span, Text, token } from "@hyper-elements/react";
import { lint } from "@hyper-elements/lint";
import { template } from "@hyper-elements/react/template";
import { METRICS, RATING_LABEL, scoreRating, show } from "./_shared/metrics";
import { FONT_URLS, MONO, RATING_COLOR, example, fields, host, ratingOf, themeFor, type Report } from "./_shared/report";

const LABEL = { fontFamily: MONO, fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase", color: "#5B6577" } as const;

export default template({
  id: "plainspeed.Email",
  version: "1.0.0",
  label: "Performance summary email",
  guidance: "Send it with the PDF report attached.",
  root: "Email",
  fields,
  rules: { plugins: { lint: lint() }, require: { lint: ["lang", "contrast", "link-text"] }, root: { previewText: true } },
  example,
  render(v) {
    const r = v as unknown as Report;
    const main = r.runs[0];
    const subject = `Speed report for ${host(r.site).split("/")[0]}: ${r.runs.map((x) => `${x.performance} on ${x.label.toLowerCase()}`).join(", ")}`;
    const top = r.findings.slice(0, 3);

    return (
      <Email theme={themeFor(r)} lang="en" width={600} fonts={FONT_URLS} title={subject} previewText={r.summary.slice(0, 140)} style={{ gap: 0 }}>
        <Section style={{ padding: [28, 24, 14] }}>
          <Text style={LABEL}>{r.agency} · performance report</Text>
        </Section>
        <Column style={{ apply: ["card"] }}>
          <Column style={{ gap: 4 }}>
            <Heading level={1}>{host(r.site).split("/")[0]}</Heading>
            {host(r.site).includes("/") ? <Text style={{ fontFamily: MONO, fontSize: 14, color: token("colors.muted") }}>/{host(r.site).split("/").slice(1).join("/")}</Text> : null}
          </Column>
          <Row style={{ gap: 12 }}>
            {r.runs.map((run) => (
              <Column key={run.label} style={{ backgroundColor: token("colors.background"), padding: [14, 16], borderRadius: 10, gap: 0 }}>
                <Text style={LABEL}>{run.label}</Text>
                <Text style={{ fontFamily: token("fonts.heading"), fontWeight: 800, fontSize: 40, lineHeight: 1.1, color: RATING_COLOR[scoreRating(run.performance)] }}>{run.performance}</Text>
                <Text style={{ fontSize: 14, color: token("colors.muted") }}>out of 100</Text>
              </Column>
            ))}
          </Row>
          <Text>{r.summary}</Text>

          <Column style={{ gap: 0 }}>
            <Text style={{ ...LABEL, padding: [0, 0, 8] }}>Core Web Vitals · {main.label.toLowerCase()}</Text>
            {(["lcp", "cls", "tbt"] as const).map((id) => {
              const rating = ratingOf(main, id);
              return (
                <Row key={id} style={{ padding: [10, 0], border: { top: { width: 1, style: "solid", color: token("colors.border") } } }}>
                  <Column>
                    <Text style={{ fontWeight: 600 }}>{METRICS[id].name}</Text>
                    <Text style={{ fontSize: 14, color: token("colors.muted") }}>{METRICS[id].plain}</Text>
                  </Column>
                  <Column style={{ width: 150 }}>
                    <Text style={{ textAlign: "right", fontFamily: MONO }}>{show(id, main[id])}</Text>
                    <Text style={{ textAlign: "right", fontSize: 14, fontWeight: 600, color: RATING_COLOR[rating] }}>{RATING_LABEL[rating]}</Text>
                  </Column>
                </Row>
              );
            })}
          </Column>

          {top.length ? (
            <Column style={{ gap: 10 }}>
              <Heading level={2}>What to fix first</Heading>
              {top.map((f, i) => (
                <Text key={i}>
                  <Span style={{ fontWeight: 700 }}>
                    {i + 1}. {f.headline}.
                  </Span>{" "}
                  {f.why}
                </Text>
              ))}
            </Column>
          ) : null}
          <Text>
            The full report is attached: every measure against Google&apos;s targets, {r.findings.length} findings and {r.plan.length ? `a ${r.plan.length}-step plan` : "the details"}.
          </Text>
        </Column>
        <Section style={{ padding: [20, 24, 32] }}>
          <Text style={{ fontSize: 14, color: token("colors.muted") }}>Measured with Lighthouse on {main.fetchedAt ?? r.reportDate}. {r.agency}.</Text>
        </Section>
      </Email>
    );
  },
});
