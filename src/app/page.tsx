import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight, FileCheck02, Image01, Mail01 } from "@untitledui/icons";
import { Mark } from "@/components/Mark";

const WRAP = "mx-auto max-w-[1200px] px-6";

export default function Home() {
  return (
    <div className="bg-paper text-ink">
      <Nav />
      <Hero />
      <Translate />
      <Steps />
      <Outputs />
      <Bands />
      <Faq />
      <Close />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-30 bg-paper/85 backdrop-blur border-b border-line">
      <div className={`${WRAP} h-16 flex items-center gap-8`}>
        <Link href="/" className="flex items-center gap-2 font-display font-extrabold text-[20px] tracking-tight">
          <Mark /> Plainspeed
        </Link>
        <nav className="hidden md:flex gap-6 text-[14px] font-medium text-muted">
          <a href="#plain" className="hover:text-ink">Plain words</a>
          <a href="#how" className="hover:text-ink">How it works</a>
          <a href="#outputs" className="hover:text-ink">What you send</a>
          <a href="#bands" className="hover:text-ink">The numbers</a>
          <a href="#faq" className="hover:text-ink">FAQ</a>
        </nav>
        <div className="flex-1" />
        <Link href="/report" className="btn btn-ink">
          Make a report <ArrowRight size={16} />
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="absolute inset-0 grid-dots opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" aria-hidden="true" />
      <div className={`${WRAP} relative pt-20 md:pt-24 pb-0`}>
        <p className="eyebrow">For freelancers and agencies who run Lighthouse for clients</p>
        <h1 className="mt-5 font-display font-extrabold text-[54px] md:text-[92px] leading-[0.92] tracking-[-0.045em] max-w-[1000px]">
          Lighthouse, in words your client <span className="text-blue">reads.</span>
        </h1>
        <div className="mt-8 grid md:grid-cols-[1fr_auto] gap-8 items-end">
          <p className="text-[18px] md:text-[20px] leading-relaxed text-ink-2 max-w-[620px]">
            Drop a Lighthouse report. Plainspeed ranks what&apos;s worth fixing, says each finding in plain English, and writes the client report, the
            summary email and a results card.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/report" className="btn btn-blue !px-5 !py-3.5 !text-[15px]">
              Make a report <ArrowRight size={17} />
            </Link>
            <a href="/landing/report.pdf" className="btn btn-line !px-5 !py-3.5 !text-[15px]">
              Sample report (PDF)
            </a>
          </div>
        </div>
        <div className="mt-14 rounded-t-[22px] border border-b-0 border-line-strong bg-wash p-2.5 pb-0 shadow-[0_-20px_60px_-30px_rgb(11_18_32/0.4)]">
          <Image
            src="/landing/dashboard.png"
            alt="Plainspeed with two real Lighthouse runs of a Wikipedia article: scores 95 and 91, and each lab metric rated against Google's bands"
            width={1440}
            height={900}
            priority
            className="rounded-t-[14px] border border-b-0 border-line w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
}

const PAIRS = [
  ["Document request latency — Est savings of 520 ms", "The server is slow to start answering", "Nothing can appear until the page's first byte arrives. Faster hosting, caching or a CDN brings everything forward."],
  ["Avoid large layout shifts — 1 layout shift found", "Things move around while the page loads", "Content jumping makes people tap the wrong thing. Reserving space for images, ads and embeds stops it."],
  ["Render-blocking requests — Est savings of 110 ms", "Files hold up the first paint", "Some stylesheets or scripts must finish downloading before anything shows. Loading them later lets the page appear sooner."],
];

function Translate() {
  return (
    <section id="plain" className="border-b border-line">
      <div className={`${WRAP} py-24 md:py-32`}>
        <Head eyebrow="Plain words" title="Your client doesn't need a wall of data.">
          &ldquo;Most audit tools give you a wall of Lighthouse data but that is useless when you&apos;re trying to explain issues to a client.&rdquo; A web
          developer said it on{" "}
          <a className="underline underline-offset-2 hover:text-ink" href="https://www.reddit.com/r/webdev/comments/1s5v36q/">
            r/webdev
          </a>
          . Plainspeed says every common Lighthouse audit the way you&apos;d explain it on a call.
        </Head>
        <div className="mt-12 rounded-2xl border border-line overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_1.3fr] bg-wash border-b border-line">
            <p className="eyebrow p-4 pl-6">Lighthouse says</p>
            <p className="eyebrow p-4 pl-6 border-l border-line">Plainspeed says</p>
          </div>
          {PAIRS.map(([lh, head, why]) => (
            <div key={head} className="grid md:grid-cols-[1fr_1.3fr] border-b border-line last:border-0">
              <p className="p-6 font-mono text-[13.5px] text-muted leading-relaxed">{lh}</p>
              <div className="p-6 md:border-l border-line">
                <p className="font-display font-extrabold text-[22px] tracking-tight leading-tight">{head}</p>
                <p className="mt-2 text-[15px] text-ink-2 leading-relaxed">{why}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[13px] text-muted">Real findings from a Lighthouse 13 run of a Wikipedia article, the sample in the app.</p>
      </div>
    </section>
  );
}

function Steps() {
  const steps = [
    ["Runs", "Drop one or two Lighthouse JSON files: mobile and desktop, or before and after. Every metric is rated against Google's bands for that device."],
    ["Findings", "Failing audits ranked by what fixing them saves, already in plain words. Keep the ones worth the client's attention and edit any line."],
    ["Plan", "A summary drafted only from the numbers, and a plan with owners and effort. Make it sound like you."],
    ["Send", "Download the PDF report, the summary email and the results card. Same look, same numbers, every time."],
  ];
  return (
    <section id="how" className="border-b border-line bg-wash">
      <div className={`${WRAP} py-24 md:py-32`}>
        <Head eyebrow="How it works" title="Four steps, one screen each." />
        <ol className="mt-12 grid md:grid-cols-4 gap-4">
          {steps.map(([t, d], i) => (
            <li key={t} className="rounded-2xl bg-paper border border-line p-6">
              <span className="grid place-items-center size-9 rounded-full bg-ink text-white font-mono text-[14px]">{i + 1}</span>
              <h3 className="mt-5 font-display font-extrabold text-[24px] tracking-tight">{t}</h3>
              <p className="mt-2 text-[14.5px] text-ink-2 leading-relaxed">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 rounded-2xl border border-line bg-paper p-2.5">
          <Image src="/landing/findings.png" alt="Step 2: findings ranked by impact, each in plain words with who usually fixes it" width={1440} height={900} className="rounded-xl border border-line w-full h-auto" />
        </div>
      </div>
    </section>
  );
}

function Outputs() {
  return (
    <section id="outputs" className="border-b border-line">
      <div className={`${WRAP} py-24 md:py-32`}>
        <Head eyebrow="What you send" title="A report they'll actually read." />
        <div className="mt-12 grid md:grid-cols-12 gap-4">
          <Tile className="md:col-span-7 md:row-span-2" icon={<FileCheck02 size={17} />} name="The client report" note="A4 PDF · scores, Core Web Vitals, findings, plan, appendix">
            <div className="grid grid-cols-2 gap-3">
              <Image src="/landing/report-1.png" alt="Report page 1: scores and every metric against Google's bands" width={1241} height={1754} className="w-full h-auto border border-line rounded-md shadow-[0_10px_24px_-14px_rgb(11_18_32/0.35)]" />
              <Image src="/landing/report-2.png" alt="Report page 2: findings in plain words, most important first" width={1241} height={1754} className="w-full h-auto border border-line rounded-md shadow-[0_10px_24px_-14px_rgb(11_18_32/0.35)]" />
            </div>
          </Tile>
          <Tile className="md:col-span-5" icon={<Image01 size={17} />} name="The results card" note="1200 × 630 PNG · for a case study">
            <Image src="/landing/card.png" alt="Results card: scores 95 and 91 with the Core Web Vitals" width={1200} height={630} className="w-full h-auto rounded-lg border border-line" />
          </Tile>
          <Tile className="md:col-span-5" icon={<Mail01 size={17} />} name="The summary email" note="Score, vitals and top three fixes">
            <div className="h-[260px] overflow-hidden rounded-lg border border-line bg-wash">
              <Image src="/landing/email.png" alt="Summary email" width={705} height={1173} className="w-full h-auto" />
            </div>
          </Tile>
        </div>
      </div>
    </section>
  );
}

function Tile({ className = "", icon, name, note, children }: { className?: string; icon: ReactNode; name: string; note: string; children: ReactNode }) {
  return (
    <div className={`min-w-0 rounded-2xl border border-line bg-paper p-5 flex flex-col gap-4 ${className}`}>
      <div className="flex items-center gap-2.5">
        <span className="grid place-items-center size-8 rounded-lg bg-blue-soft text-blue">{icon}</span>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-[12.5px] text-muted">{note}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

const BANDS = [
  ["LCP", "Largest Contentful Paint", "when the main content appears", "2.5 s", "4 s", "1.2 s", "2.4 s"],
  ["CLS", "Cumulative Layout Shift", "how much the page jumps", "0.1", "0.25", "0.1", "0.25"],
  ["TBT", "Total Blocking Time", "how long it's too busy to respond", "200 ms", "600 ms", "150 ms", "350 ms"],
  ["FCP", "First Contentful Paint", "when anything first appears", "1.8 s", "3 s", "0.9 s", "1.6 s"],
  ["SI", "Speed Index", "how quickly it fills in", "3.4 s", "5.8 s", "1.3 s", "2.3 s"],
];

function Bands() {
  return (
    <section id="bands" className="border-b border-line bg-wash">
      <div className={`${WRAP} py-24 md:py-32`}>
        <Head eyebrow="The numbers" title="Rated against Google's own bands.">
          Each metric is judged by the thresholds in Google&apos;s Lighthouse documentation, for the device it was measured on. Google says good Core Web
          Vitals align with what its &ldquo;core ranking systems seek to reward&rdquo; (
          <a className="underline underline-offset-2 hover:text-ink" href="https://developers.google.com/search/docs/appearance/core-web-vitals">
            Search Central
          </a>
          ).
        </Head>
        <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-paper">
          <table className="w-full min-w-[760px] text-[14px]">
            <thead>
              <tr className="border-b border-line text-left">
                <th className="eyebrow p-4 pl-6 font-normal">Measure</th>
                <th className="eyebrow p-4 font-normal">Mobile: good up to</th>
                <th className="eyebrow p-4 font-normal">poor past</th>
                <th className="eyebrow p-4 font-normal">Desktop: good up to</th>
                <th className="eyebrow p-4 font-normal">poor past</th>
              </tr>
            </thead>
            <tbody>
              {BANDS.map(([s, name, plain, mg, mp, dg, dp]) => (
                <tr key={s} className="border-b border-line last:border-0">
                  <td className="p-4 pl-6">
                    <span className="font-semibold">{name}</span> <span className="font-mono text-[12px] text-muted">{s}</span>
                    <span className="block text-[13px] text-muted">{plain}</span>
                  </td>
                  <td className="p-4 font-mono r-good">{mg}</td>
                  <td className="p-4 font-mono r-poor">{mp}</td>
                  <td className="p-4 font-mono r-good">{dg}</td>
                  <td className="p-4 font-mono r-poor">{dp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[13px] text-muted">
          Sources:{" "}
          <a className="underline underline-offset-2" href="https://developer.chrome.com/docs/lighthouse/performance/lighthouse-largest-contentful-paint">
            Lighthouse docs
          </a>{" "}
          for LCP, TBT, FCP and Speed Index;{" "}
          <a className="underline underline-offset-2" href="https://web.dev/articles/cls">
            web.dev
          </a>{" "}
          for CLS. Lab tests can&apos;t measure Interaction to Next Paint, so the report shows Total Blocking Time, its lab stand-in.
        </p>
      </div>
    </section>
  );
}

const FAQ = [
  ["Where do I get a Lighthouse JSON file?", "In Chrome, open DevTools, go to the Lighthouse tab, run a report, then use the ⋮ menu and choose Save as JSON. From a terminal: npx lighthouse https://your-site --output=json --output-path=report.json. A PageSpeed Insights API response works too."],
  ["Why not just call PageSpeed Insights?", "Its free, keyless quota runs out (we got “Quota exceeded” while building this). A file you already have needs no key, works offline, and lets you choose exactly which run goes in front of the client."],
  ["Is anything uploaded?", "The JSON is read in your browser. When you render a document, the report's values (scores, metrics, the findings you kept, your text) go to the app's own render route. Nothing is stored on a server."],
  ["Can I compare before and after?", "Yes. Drop two runs of the same page and rename them “Before” and “After”. The report and the card show them side by side. Runs of different pages are refused, so a comparison can't mislead."],
  ["Who writes the plain English?", "Plainspeed has a written explanation for about fifty common Lighthouse audits, including Lighthouse 13's new insights. Anything it doesn't know keeps Lighthouse's own title. You can edit every word before it goes out."],
  ["Lab numbers vs real visitors?", "Lighthouse is a lab test: one load on an emulated device and network. It's for finding causes and checking fixes. Real visitors' numbers (field data) vary, and the report's appendix says so."],
  ["Can I put my studio's name on it?", "Yes. “Prepared by” and the brand colour go on the PDF, the email and the card."],
] as const;

function Faq() {
  return (
    <section id="faq" className="border-b border-line">
      <div className={`${WRAP} py-24 md:py-32 grid md:grid-cols-[380px_1fr] gap-12`}>
        <div className="md:sticky md:top-28 self-start">
          <Head eyebrow="FAQ" title="Questions developers ask first." />
        </div>
        <div className="divide-y divide-line border-y border-line">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display font-extrabold text-[19px] tracking-tight">
                {q}
                <span className="grid place-items-center size-8 shrink-0 rounded-full bg-wash text-ink transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-6 pr-12 text-[15.5px] text-ink-2 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Close() {
  return (
    <>
      <section className={`${WRAP} py-24`}>
        <div className="rounded-[28px] bg-ink text-white p-10 md:p-16 grid md:grid-cols-[1fr_auto] gap-8 items-center relative overflow-hidden">
          <svg className="absolute -right-16 -bottom-28 opacity-90" width="420" height="300" viewBox="0 0 420 300" aria-hidden="true">
            <path d="M40 280a170 170 0 1 1 340 0" fill="none" stroke="var(--blue)" strokeWidth="34" strokeLinecap="round" />
            <path d="M210 280l90-118" stroke="#fff" strokeWidth="24" strokeLinecap="round" />
          </svg>
          <div className="relative">
            <h2 className="font-display font-extrabold text-[40px] md:text-[56px] leading-[0.98] tracking-[-0.035em] max-w-[620px]">Send the report, not the raw data.</h2>
            <p className="mt-4 text-white/70 text-[17px] max-w-[520px]">Try it on two real Lighthouse runs, or drop your own.</p>
          </div>
          <Link href="/report" className="relative btn bg-white text-ink hover:bg-white/90 !px-6 !py-3.5 !text-[15px]">
            Make a report <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <footer className={`${WRAP} pb-12 flex flex-col md:flex-row gap-3 justify-between text-[13px] text-muted`}>
        <span className="flex items-center gap-2 font-display font-extrabold text-[17px] text-ink">
          <Mark size={20} /> Plainspeed
        </span>
        <p>
          Built with{" "}
          <a className="underline underline-offset-2 hover:text-ink inline-flex items-center gap-0.5" href="https://github.com/hyper-elements/hyper-elements">
            Hyper Elements <ArrowUpRight size={12} />
          </a>
          . Tidewater Studio in the sample is made up; the Lighthouse runs are real.
        </p>
      </footer>
    </>
  );
}

function Head({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="max-w-[760px]">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 font-display font-extrabold text-[38px] md:text-[56px] leading-[0.98] tracking-[-0.035em]">{title}</h2>
      {children ? <p className="mt-5 text-[17px] leading-relaxed text-ink-2">{children}</p> : null}
    </div>
  );
}
