import type { Metadata } from "next";
import SymbolicInsightExperience from "@/components/symbolic-insight-experience";
import { normalizeInsightMode } from "@/lib/ai/insights";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { makePageMetadata, routeSeo } from "@/lib/seo";

export const maxDuration = 60;

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  return makePageMetadata({ ...routeSeo.insights, locale: params?.locale });
}

export default async function InsightsPage({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string; locale?: string }>;
}) {
  const params = await searchParams;

  return (
    <SymbolicInsightExperience
      initialMode={normalizeInsightMode(params?.mode)}
      initialLocale={normalizeReportLocale(params?.locale ?? "en")}
    />
  );
}
