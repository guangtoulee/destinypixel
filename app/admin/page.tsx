import type { Metadata } from "next";
import AdminExperience from "@/components/admin-experience";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Administration | DestinyPixel" },
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin" },
};

export default async function AdminPage({ searchParams }: { searchParams?: Promise<{ locale?: string }> }) {
  const params = await searchParams;
  return <AdminExperience locale={params?.locale === "zh" ? "zh" : "en"} />;
}
