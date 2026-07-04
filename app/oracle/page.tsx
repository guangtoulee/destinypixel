import type { Metadata } from "next";
import SymbolicInsightExperience from "@/components/symbolic-insight-experience";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { makePageMetadata, routeSeo } from "@/lib/seo";

export const maxDuration = 60;

export const metadata: Metadata = makePageMetadata(routeSeo.oracle);

export default async function OraclePage({
  searchParams,
}: {
  searchParams?: Promise<{ locale?: string }>;
}) {
  const params = await searchParams;

  return (
    <SymbolicInsightExperience
      initialMode="oracle"
      initialLocale={normalizeReportLocale(params?.locale ?? "en")}
    />
  );
}
