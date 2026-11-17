import type { Metadata } from "next";
import { Overview } from "@/components/admin/overview";

export const metadata: Metadata = { title: "General" };

export default function OverviewPage() {
  return <Overview />;
}
