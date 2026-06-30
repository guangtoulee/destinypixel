import SymbolicInsightExperience from "@/components/symbolic-insight-experience";
import { normalizeReportLocale } from "@/lib/report-i18n";

export const maxDuration = 60;

export default async function FacePage({
  searchParams,
}: {
  searchParams?: Promise<{ locale?: string }>;
}) {
  const params = await searchParams;

  return (
    <SymbolicInsightExperience
      initialMode="face"
      initialLocale={normalizeReportLocale(params?.locale ?? "en")}
    />
  );
}
