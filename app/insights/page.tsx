import SymbolicInsightExperience from "@/components/symbolic-insight-experience";
import { normalizeInsightMode } from "@/lib/ai/insights";
import { normalizeReportLocale } from "@/lib/report-i18n";

export const maxDuration = 60;

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
