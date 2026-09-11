import type { Metadata } from "next";
import DestinyExperience from "@/components/destiny-experience";
import { birthFormFeedback } from "@/lib/birth-form-feedback";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { makePageMetadata, routeSeo } from "@/lib/seo";

export const maxDuration = 60;

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  return makePageMetadata({ ...routeSeo.black, locale: params?.locale });
}

export default async function BlackHome({
  searchParams,
}: {
  searchParams?: Promise<{ locale?: string; error?: string }>;
}) {
  const params = await searchParams;
  const initialLocale = normalizeReportLocale(params?.locale ?? "en");

  return <DestinyExperience initialLocale={initialLocale} initialError={birthFormFeedback(params?.error, initialLocale)} />;
}
