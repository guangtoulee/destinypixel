import type { Metadata } from "next";
import SpiritualSticksExperience from "@/components/spiritual-sticks-experience";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { makePageMetadata, routeSeo } from "@/lib/seo";

export const maxDuration = 60;

export const metadata: Metadata = makePageMetadata(routeSeo.sticks);

const stickTypes = ["guanyin", "guandi", "yuelao", "wealth"] as const;
type StickType = (typeof stickTypes)[number];

function normalizeStickType(value?: string): StickType {
  if (stickTypes.includes(value as StickType)) return value as StickType;
  return "guanyin";
}

export default async function SticksPage({
  searchParams,
}: {
  searchParams?: Promise<{ locale?: string; type?: string }>;
}) {
  const params = await searchParams;

  return (
    <SpiritualSticksExperience
      initialLocale={normalizeReportLocale(params?.locale ?? "en")}
      initialType={normalizeStickType(params?.type)}
    />
  );
}
