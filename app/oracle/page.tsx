import type { Metadata } from "next";
import SymbolicInsightExperience from "@/components/symbolic-insight-experience";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { makePageMetadata, routeSeo } from "@/lib/seo";

export const maxDuration = 60;

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  return makePageMetadata({ ...routeSeo.oracle, locale: params?.locale });
}

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
