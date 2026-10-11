"use client";

import { useSearchParams } from "next/navigation";
import { discoveryHref, discoveryLocales } from "@/lib/discovery";
import { isPublicDayPillarSlug } from "@/lib/day-pillar-share";
import type { ReportLocale } from "@/lib/report-i18n";

export default function DiscoveryLanguages({ locale }: { locale: ReportLocale }) {
  const slug = useSearchParams().get("pillar");
  const selected = slug && isPublicDayPillarSlug(slug) ? slug : undefined;
  return <nav aria-label="Language">{discoveryLocales.map(language =>
    <a key={language} href={`${discoveryHref(language)}${selected ? `${language === "en" ? "?" : "&"}pillar=${selected}` : ""}`} aria-current={language === locale ? "page" : undefined}>
      {({ en: "EN", zh: "简体", "zh-TW": "繁體", ru: "RU" })[language]}
    </a>
  )}</nav>;
}
