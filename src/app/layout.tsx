import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const display = localFont({
  src: [
    { path: "../../fonts/Bricolage-600.woff", weight: "600" },
    { path: "../../fonts/Bricolage-800.woff", weight: "800" },
  ],
  variable: "--font-bricolage",
});
const body = localFont({
  src: [
    { path: "../../fonts/PublicSans-400.woff", weight: "400" },
    { path: "../../fonts/PublicSans-500.woff", weight: "500" },
    { path: "../../fonts/PublicSans-600.woff", weight: "600" },
    { path: "../../fonts/PublicSans-700.woff", weight: "700" },
  ],
  variable: "--font-public",
});
const mono = localFont({
  src: [
    { path: "../../fonts/DMMono-400.woff", weight: "400" },
    { path: "../../fonts/DMMono-500.woff", weight: "500" },
  ],
  variable: "--font-dmmono",
});

export const metadata: Metadata = {
  title: "Plainspeed · Lighthouse results, in words your client reads",
  description:
    "Drop a Lighthouse JSON report. Plainspeed turns it into a client-ready PDF, a summary email and a results card, with every finding in plain words. Built with Hyper Elements.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
