import type { Metadata } from "next";
import { Dashboard } from "@/components/Dashboard";

export const metadata: Metadata = { title: "New report · Plainspeed" };

export default function ReportPage() {
  return <Dashboard />;
}
