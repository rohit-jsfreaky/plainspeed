// Renders a report with the same Hyper Elements templates the CLI uses (templates/*.tsx).
// POST { output: "report" | "email" | "card", report } -> a PDF, a PNG, or { html, text }.
// A report a template refuses comes back as 422 with the template's own diagnostics.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createElement } from "react";
import { ElementsError, render } from "@hyper-elements/react";
import { renderImage } from "@hyper-elements/react/image";
import { renderPdf } from "@hyper-elements/react/pdf";
import Card from "@templates/card";
import EmailTemplate from "@templates/email";
import Report from "@templates/report";

type Diagnostic = { severity: string; code: string; message: string; path?: string };

const FONT_FILES: Array<[string, string, number]> = [
  ["Bricolage Grotesque", "Bricolage-600.woff", 600],
  ["Bricolage Grotesque", "Bricolage-800.woff", 800],
  ["Public Sans", "PublicSans-400.woff", 400],
  ["Public Sans", "PublicSans-500.woff", 500],
  ["Public Sans", "PublicSans-600.woff", 600],
  ["Public Sans", "PublicSans-700.woff", 700],
  ["DM Mono", "DMMono-400.woff", 400],
  ["DM Mono", "DMMono-500.woff", 500],
];
let fonts: Promise<Array<{ family: string; src: Buffer; weight: number }>> | undefined;
const loadFonts = () =>
  (fonts ??= Promise.all(FONT_FILES.map(async ([family, file, weight]) => ({ family, weight, src: await readFile(join(process.cwd(), "fonts", file)) }))));

const brief = (list: readonly unknown[] = []): Diagnostic[] =>
  (list as Diagnostic[]).filter((d) => d.severity === "error" || d.severity === "warning").map(({ severity, code, message, path }) => ({ severity, code, message, path }));

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { output?: string; report?: Record<string, unknown> } | null;
  if (!body?.report || !["report", "email", "card"].includes(body.output ?? "")) {
    return Response.json({ error: 'Send { output: "report" | "email" | "card", report }' }, { status: 400 });
  }
  const { output, report } = body;
  try {
    if (output === "report") {
      const { pdf } = await renderPdf(createElement(Report as never, { ...report, format: "a4" }), { fonts: await loadFonts() });
      return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf" } });
    }
    if (output === "card") {
      const { image } = await renderImage(createElement(Card as never, { ...report, format: "og" }), { fonts: await loadFonts() });
      return new Response(new Uint8Array(image), { headers: { "Content-Type": "image/png" } });
    }
    const { html, text, diagnostics } = await render(createElement(EmailTemplate as never, report));
    return Response.json({ html, text, diagnostics: brief(diagnostics) });
  } catch (e) {
    if (e instanceof ElementsError) return Response.json({ diagnostics: brief(e.diagnostics) }, { status: 422 });
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
