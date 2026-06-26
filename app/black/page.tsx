import DestinyExperience from "@/components/destiny-experience";
import { normalizeReportLocale } from "@/lib/report-i18n";

export const maxDuration = 60;

export default async function BlackHome({
  searchParams,
}: {
  searchParams?: Promise<{ locale?: string }>;
}) {
  const params = await searchParams;
  const initialLocale = normalizeReportLocale(params?.locale ?? "en");

  return <DestinyExperience initialLocale={initialLocale} />;
}
