import type { Metadata } from "next";
import AtelierExperience from "@/components/atelier-experience";
import { energyElements, type EnergyElement } from "@/lib/energy-style";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { makePageMetadata, routeSeo } from "@/lib/seo";

export const metadata: Metadata = makePageMetadata(routeSeo.atelier);

function normalizeFocus(value?: string): EnergyElement {
  const normalized = energyElements.find(
    (element) => element.toLowerCase() === value?.toLowerCase(),
  );

  return normalized ?? "Water";
}

export default async function AtelierPage({
  searchParams,
}: {
  searchParams?: Promise<{ locale?: string; focus?: string }>;
}) {
  const params = await searchParams;

  return (
    <AtelierExperience
      initialLocale={normalizeReportLocale(params?.locale ?? "en")}
      initialFocus={normalizeFocus(params?.focus)}
    />
  );
}
