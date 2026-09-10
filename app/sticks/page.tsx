import type { Metadata } from "next";
import SpiritualSticksExperience from "@/components/spiritual-sticks-experience";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { makePageMetadata, routeSeo } from "@/lib/seo";
import { stickTypeOrder, type StickType } from "@/lib/sticks/catalog";

export const maxDuration = 60;

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  return makePageMetadata({ ...routeSeo.sticks, locale: params?.locale });
}

function normalizeStickType(value?: string): StickType {
  if (stickTypeOrder.includes(value as StickType)) return value as StickType;
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
