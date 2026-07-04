import type { Metadata } from "next";
import DestinyExperience from "@/components/destiny-experience";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { makePageMetadata, routeSeo } from "@/lib/seo";

export const maxDuration = 60;

export const metadata: Metadata = makePageMetadata(routeSeo.black);

export default async function BlackHome({
  searchParams,
}: {
  searchParams?: Promise<{ locale?: string }>;
}) {
  const params = await searchParams;
  const initialLocale = normalizeReportLocale(params?.locale ?? "en");

  return <DestinyExperience initialLocale={initialLocale} />;
}
