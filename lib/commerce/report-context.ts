import "server-only";

import type { ReportRecord } from "@/lib/db/repository";
import type { ReportGenerationContext } from "@/lib/ai/streaming";
import { calculateBaziEngine, type BaziData } from "@/lib/engines/bazi";
import { getPillarDisplay, pillarOrder } from "@/lib/bazi-totems";
import { pillarsDB, type PillarProfile } from "@/lib/pillars";
import { contentLocale, normalizeReportLocale, planetLabels, reportCopy, zodiacLabels, type ReportLocale } from "@/lib/report-i18n";

export function calculateReportBazi(report: ReportRecord) {
  return calculateBaziEngine({
    name: report.birth_record.name,
    gender: report.birth_record.gender ?? "female",
    locale: normalizeReportLocale(report.birth_record.locale ?? "en"),
    birthDate: report.birth_record.birth_date,
    birthTime: report.birth_record.birth_time,
    city: {
      id: report.birth_record.id,
      label: report.birth_record.birth_place,
      country: "",
      latitude: report.birth_record.latitude,
      longitude: report.birth_record.longitude,
      timezone: report.birth_record.timezone || "Asia/Shanghai",
      aliases: [],
    },
  });
}

function buildLuckDisplay(
  luck: BaziData["luck"] | undefined,
  locale: ReportLocale,
): ReportGenerationContext["bazi"]["luck"] | undefined {
  if (!luck) {
    return undefined;
  }

  const directionLabel =
    contentLocale(locale) === "zh"
      ? luck.direction === "forward"
        ? "顺行"
        : "逆行"
      : locale === "ru"
        ? luck.direction === "forward"
          ? "прямое движение"
          : "обратное движение"
        : luck.direction === "forward"
          ? "Forward"
          : "Reverse";
  const withDisplay = (cycle: (typeof luck.tenYearLuck)[number]) => ({
    ...cycle,
    pillarDisplay: getPillarDisplay(cycle.pillar, locale).pillarLabel,
  });

  return {
    ...luck,
    currentYearPillarDisplay: getPillarDisplay(
      luck.currentYearPillar,
      locale,
    ).pillarLabel,
    previousYearPillarDisplay: getPillarDisplay(
      luck.previousYearPillar,
      locale,
    ).pillarLabel,
    directionLabel,
    tenYearLuck: luck.tenYearLuck.map(withDisplay),
    activeTenYearLuck: luck.activeTenYearLuck
      ? withDisplay(luck.activeTenYearLuck)
      : undefined,
  };
}

/** Build model context only from the server-owned report, after access is checked. */
export function buildReportGenerationContext(report: ReportRecord, requestedLocale: string = "en"): ReportGenerationContext {
  const locale = normalizeReportLocale(requestedLocale);
  const baziData = calculateReportBazi(report);
  const dayPillar = baziData.pillars.day;
  const profile = (pillarsDB as Record<string, PillarProfile>)[dayPillar];
  const dayDisplay = getPillarDisplay(dayPillar, locale);
  const copyLocale = contentLocale(locale);
  const copy = reportCopy[copyLocale];
  const sunSign = zodiacLabels[copyLocale][report.astro_data.sunSign] ?? report.astro_data.sunSign;
  const mappedPlanetName = planetLabels[copyLocale][baziData.mappedPlanet] ?? baziData.mappedPlanet;
  const profileName = copyLocale === "zh" ? profile.name.cn : locale === "ru" ? dayDisplay.totemName : profile.name.en;
  const pillarDisplays = Object.fromEntries(pillarOrder.map((key) => [key, {
    ...getPillarDisplay(baziData.pillars[key], locale),
    roleTitle: copy.pillarRoles[key].title,
    roleMicroBadge: copy.pillarRoles[key].microBadge,
  }])) as unknown as ReportGenerationContext["bazi"]["pillarsDisplay"];
  return {
    reportId: report.id,
    locale,
    gender: report.birth_record.gender ?? report.ai_content.meta?.gender ?? "female",
    birth: {
      name: report.birth_record.name,
      birthDate: report.birth_record.birth_date,
      birthTime: report.birth_record.birth_time,
      birthPlace: report.birth_record.birth_place,
      trueSolarTime: baziData.trueSolarTime.time,
    },
    profile: {
      pillar: dayPillar, pillarDisplay: dayDisplay.pillarLabel,
      nameEn: profile.name.en, nameCn: profile.name.cn, displayName: profileName,
      essenceEn: profile.essence.en, careerStyleEn: profile.career.style.en,
      wealthEn: profile.career.wealth.en, loveModeEn: profile.love.mode.en,
      growthEn: profile.growth.en, healthEn: profile.health?.en,
    },
    bazi: {
      dayMaster: baziData.dayMaster, dayMasterDisplay: dayDisplay.stemLabel,
      mappedPlanet: baziData.mappedPlanet, mappedPlanetCn: baziData.mappedPlanetCn,
      mappedPlanetDisplay: mappedPlanetName, pillars: baziData.pillars, pillarsDisplay: pillarDisplays,
      elementBalance: baziData.elementBalance, missingElements: baziData.missingElements,
      tenGods: baziData.tenGods, luck: buildLuckDisplay(baziData.luck, locale),
    },
    astrology: { sunSign, sunSignCn: report.astro_data.sunSignCn, placements: report.astro_data.placements, majorAspects: report.astro_data.majorAspects },
  };
}
