/**
 * The results card: 1200 × 630, for a case study, a LinkedIn post or the top of a proposal. The score (or the two
 * scores side by side: mobile and desktop, before and after) and the three Core Web Vitals in words.
 */
import { Canvas, Column, Layer, Row, Text } from "@hyper-elements/react";
import { template } from "@hyper-elements/react/template";
import { METRICS, RATING_LABEL, scoreRating, show } from "./_shared/metrics";
import { BODY, DISPLAY, Dial, FONT_FILES, INK, LINE, MONO, MUTED, PAPER, RATING_COLOR, example, fields, host, longDate, ratingOf, type Report } from "./_shared/report";

const W = 1200;
const H = 630;
const PAD = 64;

export default template({
  id: "plainspeed.Card",
  version: "1.0.0",
  label: "Performance results card",
  guidance: "Post it with a case study. Two runs show side by side.",
  root: "Canvas",
  formats: { og: { width: W, height: H, scale: 1 } },
  fields,
  rules: { require: { core: ["image/overflow", "image/glyph", "image/fit"] } },
  example,
  render(v) {
    const r = v as unknown as Report;
    const main = r.runs[0];
    const dial = r.runs.length === 2 ? 190 : 230;
    const left = 560;
    const right = W - PAD * 2 - left - 48;

    return (
      <Canvas width={W} height={H} fonts={FONT_FILES} style={{ backgroundColor: PAPER, fontFamily: BODY, color: INK, padding: 0, gap: 0 }}>
        <Row style={{ height: 8, backgroundColor: r.accent }} />
        <Row style={{ padding: [48, PAD, 0], gap: 48, height: H - 8 - 72 }}>
          <Column style={{ width: left, gap: 22 }}>
            <Text style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 1.5, textTransform: "uppercase", color: MUTED }}>Lighthouse performance</Text>
            <Text fit={{ sizes: [46, 40, 34, 28, 24], maxLines: 2 }} style={{ width: left, fontFamily: DISPLAY, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1 }}>
              {host(r.site)}
            </Text>
            <Row style={{ gap: 36, alignItems: "center" }}>
              {r.runs.map((run) => (
                <Column key={run.label} style={{ width: dial, gap: 10, alignItems: "center" }}>
                  <Layer style={{ width: dial, height: dial, alignItems: "center", justifyItems: "center" }}>
                    <Dial score={run.performance} size={dial} stroke={14} />
                    <Text style={{ width: dial, textAlign: "center", fontFamily: DISPLAY, fontWeight: 800, fontSize: dial > 160 ? 64 : 54, lineHeight: 1, color: RATING_COLOR[scoreRating(run.performance)] }}>
                      {run.performance}
                    </Text>
                  </Layer>
                  <Text style={{ width: dial, textAlign: "center", fontSize: 20, fontWeight: 600, color: MUTED }}>{run.label}</Text>
                </Column>
              ))}
            </Row>
          </Column>
          <Column style={{ width: right, gap: 0, padding: [44, 0, 0] }}>
            <Text style={{ fontFamily: MONO, fontSize: 16, letterSpacing: 1.2, textTransform: "uppercase", color: MUTED, padding: [0, 0, 12] }}>
              Core Web Vitals · {main.label.toLowerCase()}
            </Text>
            {(["lcp", "cls", "tbt"] as const).map((id) => {
              const rating = ratingOf(main, id);
              return (
                <Row key={id} style={{ padding: [18, 0], border: { top: `1.5px solid ${LINE}` }, alignItems: "center" }}>
                  <Column style={{ width: right - 170 }}>
                    <Text style={{ fontSize: 22, fontWeight: 700 }}>{METRICS[id].short}</Text>
                    <Text style={{ fontSize: 17, color: MUTED }}>{METRICS[id].plain}</Text>
                  </Column>
                  <Column style={{ width: 170 }}>
                    <Text style={{ textAlign: "right", fontFamily: MONO, fontSize: 26 }}>{show(id, main[id])}</Text>
                    <Text style={{ textAlign: "right", fontSize: 17, fontWeight: 700, color: RATING_COLOR[rating] }}>{RATING_LABEL[rating]}</Text>
                  </Column>
                </Row>
              );
            })}
          </Column>
        </Row>
        <Row style={{ height: 72, padding: [0, PAD], alignItems: "center", backgroundColor: "#F5F7FA" }}>
          <Text style={{ width: 560, fontSize: 20, fontWeight: 700 }}>{r.agency}</Text>
          <Text style={{ width: W - PAD * 2 - 560, textAlign: "right", fontSize: 18, color: MUTED }}>{longDate(main.fetchedAt && /^\d{4}-\d{2}-\d{2}$/.test(main.fetchedAt) ? main.fetchedAt : r.reportDate)}</Text>
        </Row>
      </Canvas>
    );
  },
});
