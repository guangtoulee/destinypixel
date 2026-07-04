import type { Metadata } from "next";
import DestinyWhiteExperience from "@/components/destiny-white-experience";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { makePageMetadata, routeSeo } from "@/lib/seo";

export const maxDuration = 60;

export const metadata: Metadata = makePageMetadata({
  ...routeSeo.home,
  path: "/white",
  title: "DestinyPixel White | Luminous Birth Map Interface",
  noindex: true,
});

export default async function WhiteHome({
  searchParams,
}: {
  searchParams?: Promise<{ locale?: string }>;
}) {
  const params = await searchParams;
  const initialLocale = normalizeReportLocale(params?.locale ?? "en");

  return <DestinyWhiteExperience initialLocale={initialLocale} />;
}
