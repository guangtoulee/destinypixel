import DestinyWhiteExperience from "@/components/destiny-white-experience";
import { normalizeReportLocale } from "@/lib/report-i18n";

export const maxDuration = 60;

export default async function WhiteHome({
  searchParams,
}: {
  searchParams?: Promise<{ locale?: string }>;
}) {
  const params = await searchParams;
  const initialLocale = normalizeReportLocale(params?.locale ?? "en");

  return <DestinyWhiteExperience initialLocale={initialLocale} />;
}
