import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import {
  ArrowLeft,
  CalendarDays,
  Languages,
  MapPin,
  Orbit,
  Sparkles,
  UserRound,
} from "lucide-react";
import PillarImageLightbox from "@/components/pillar-image-lightbox";
import ReportExperience from "@/components/report-experience";
import {
  createInitialAIReportContent,
  type Gender,
  type NatalBookSections,
} from "@/lib/ai/report";
import type { ReportGenerationContext } from "@/lib/ai/streaming";
import { getPillarImagePath } from "@/lib/archetype-assets";
import { getPillarDisplay, pillarOrder } from "@/lib/bazi-totems";
import { getReportRecord, type ReportRecord } from "@/lib/db/repository";
import { pillarsDB, type PillarProfile } from "@/lib/pillars";
import { calculateBaziEngine, type BaziData } from "@/lib/engines/bazi";
import { calculateAstrologyEngine } from "@/lib/engines/astrology";
import {
  decodeReportDraft,
  getReportDraftCookieName,
  type DraftReportInput,
} from "@/lib/report-draft";
import {
  contentLocale,
  elementLabels,
  normalizeReportLocale,
  planetLabels,
  reportCopy,
  reportLanguageOptions,
  zodiacLabels,
  type ReportLocale,
} from "@/lib/report-i18n";

export const maxDuration = 60;

export const metadata: Metadata = {
  title: "Private DestinyPixel Report",
  description: "A private generated DestinyPixel report.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

function createDraftReportRecord(
  id: string,
  input: DraftReportInput,
): ReportRecord {
  const bazi = calculateBaziEngine(input);
  const astro = calculateAstrologyEngine(input, bazi.trueSolarTime);
  const profile = (pillarsDB as Record<string, PillarProfile>)[
    bazi.pillars.day
  ];
  const now = new Date().toISOString();
  const birthRecordId = `draft-${id}`;
  const aiContent = createInitialAIReportContent({
    bazi,
    astro,
    profile,
    gender: input.gender,
    locale: input.locale,
  });

  return {
    id,
    user_id: "draft-user",
    birth_record_id: birthRecordId,
    status: "ai_pending",
    created_at: now,
    bazi_data: bazi,
    astro_data: astro,
    ai_content: aiContent,
    user: {
      id: "draft-user",
      name: input.name,
      email: null,
    },
    birth_record: {
      id: birthRecordId,
      name: input.name,
      gender: input.gender,
      locale: input.locale,
      birth_date: input.birthDate,
      birth_time: input.birthTime,
      birth_place: input.city.label,
      latitude: input.city.latitude,
      longitude: input.city.longitude,
      timezone: input.city.timezone,
      true_solar_time: bazi.trueSolarTime.isoLike,
    },
  };
}

function BaziChart({
  pillars,
  locale,
}: {
  pillars: ReportGenerationContext["bazi"]["pillars"];
  locale: ReportLocale;
}) {
  const copy = reportCopy[contentLocale(locale)];

  return (
    <div className="pillar-chart">
      {pillarOrder.map((key) => {
        const pillar = pillars[key];
        const role = copy.pillarRoles[key];
        const display = getPillarDisplay(pillar, locale);

        return (
          <article className="pillar-chart-card" key={key}>
            <div className="pillar-card-main">
              <PillarImageLightbox
                src={display.imageSrc}
                alt={display.totemName}
              />
              <header>
                <span>{role.title}</span>
                <strong>{display.pillarLabel}</strong>
                <p>{display.totemName}</p>
              </header>
            </div>
            <div className="pillar-symbol-row">
              <div>
                <span>{copy.bazi.heavenlyStem}</span>
                <b>{display.stemLabel}</b>
                <small>{display.stemMeaning}</small>
              </div>
              <div>
                <span>{copy.bazi.earthlyBranch}</span>
                <b>{display.branchLabel}</b>
                <small>{display.branchMeaning}</small>
              </div>
            </div>
            <div className="pillar-totem">
              <div>
                <strong>{copy.bazi.elementalSignature}</strong>
                <small>{display.stemMeaning} · {display.branchMeaning}</small>
              </div>
            </div>
            <em>{role.microBadge}</em>
          </article>
        );
      })}
    </div>
  );
}

function ReportLanguageLinks({
  reportId,
  locale,
  draft,
}: {
  reportId: string;
  locale: ReportLocale;
  draft?: string;
}) {
  return (
    <div className="language-switch report-language-switch" aria-label="Language selector">
      <Languages size={15} aria-hidden="true" />
      {reportLanguageOptions.map((option) => (
        <Link
          key={option.value}
          href={`/report/${reportId}?locale=${option.value}${
            draft ? `&draft=${encodeURIComponent(draft)}` : ""
          }`}
          data-active={locale === option.value}
        >
          {option.value === "zh"
            ? locale === "zh"
              ? "中文"
              : "ZH"
            : option.value === "ru"
              ? "RU"
              : "EN"}
        </Link>
      ))}
    </div>
  );
}

function buildLuckDisplay(
  luck: BaziData["luck"] | undefined,
  locale: ReportLocale,
): ReportGenerationContext["bazi"]["luck"] | undefined {
  if (!luck) {
    return undefined;
  }

  const directionLabel =
    locale === "zh"
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

function buildInitialNatalShell({
  locale,
  profile,
  bazi,
  dayDisplay,
  sunSign,
  mappedPlanetName,
}: {
  locale: ReportLocale;
  profile: PillarProfile;
  bazi: BaziData;
  dayDisplay: ReturnType<typeof getPillarDisplay>;
  sunSign: string;
  mappedPlanetName: string;
}): NatalBookSections {
  const pillarNames = pillarOrder
    .map((key) => getPillarDisplay(bazi.pillars[key], locale).pillarLabel)
    .join(locale === "zh" ? "、" : ", ");
  const branchNames = pillarOrder
    .map((key) => getPillarDisplay(bazi.pillars[key], locale).branchLabel)
    .join(locale === "zh" ? "、" : ", ");

  if (locale === "zh") {
    return {
      dayMaster: `${profile.name.cn} 是这份内在地图的核心动物画像。它先判断你的底层反应方式：你如何吸收环境、如何保护自己、压力大时会变得更清醒还是更逃避。太阳节律落在 ${sunSign}，完整指引会继续流式生成。`,
      outerPersona: `外在层从四重出生坐标展开：${pillarNames}。对应行星为 ${mappedPlanetName}，它描述别人第一眼感受到的气场、压力感和行动速度，也会指出你容易被误读的地方。`,
      deepSelf: `深层自我来自动物场域：${branchNames}。这些图腾描述本能、记忆、依恋模式和压力反应，不会把你包装成完美人格。`,
      career: `事业模块会基于 ${mappedPlanetName}、五行分布和现实行为，判断职业发力点、赚钱方式和容易消耗的坑。`,
      love: "感情模块会单独分析吸引模式、亲密边界、投射风险与关系里的重复课题。",
      growth: `成长模块会围绕 ${dayDisplay.stemMeaning} 的优势与短板，给出可执行的训练方向。`,
      health: "健康模块只提供作息、恢复力与身心节律建议，不替代医学诊断。",
    };
  }

  if (locale === "ru") {
    return {
      dayMaster: `${dayDisplay.totemName} является главным животным портретом этой внутренней карты. Система определяет ключевую координату как ${dayDisplay.pillarLabel}, верхний сигнал как ${dayDisplay.stemMeaning}, а солнечный ритм находится в знаке ${sunSign}. Полная книга ориентира загружается потоково после открытия страницы.`,
      outerPersona: `Внешний слой начинается с четырех координат рождения: ${pillarNames}. Резонансная планета — ${mappedPlanetName}; она описывает первое впечатление, социальную маску и стиль видимости.`,
      deepSelf: `Глубинный слой раскрывается через животное поле: ${branchNames}. Эти тотемы показывают инстинкты, память, привязанность и внутренний психологический двигатель.`,
      career: `Карьера будет разобрана отдельно через ${mappedPlanetName}, структуру энергии и стиль практической реализации.`,
      love:
        "Любовь будет отдельным модулем: притяжение, границы и повторяющиеся сценарии близости.",
      growth: `Рост будет строиться вокруг дара и слепых зон качества ${dayDisplay.stemMeaning}.`,
      health:
        "Здоровье будет описано как ритм восстановления и забота о теле, без медицинских диагнозов.",
    };
  }

  return {
    dayMaster: `${profile.name.en} is the core animal portrait behind this inner map. It starts with a direct verdict on how you absorb pressure, protect yourself, and respond when life becomes noisy. The sky layer places the Sun in ${sunSign}; the full guidance book streams after first paint.`,
    outerPersona: `Your social layer begins with four birth coordinates: ${pillarNames}. The resonant planet is ${mappedPlanetName}. This module reads first impression, public pressure, and where people may misread you.`,
    deepSelf: `Your deeper layer begins with the animal fields: ${branchNames}. These totems describe instinct, memory, attachment, and pressure responses without turning you into a perfect personality type.`,
    career: `Career will be read through ${mappedPlanetName}, five-element distribution, and practical behavior: leverage, money pattern, and energy leaks.`,
    love:
      "Love will be its own module: attraction pattern, emotional boundary, projection risk, and repeated intimacy script.",
    growth: `Growth will focus on the gift and weak spot of ${dayDisplay.stemMeaning}.`,
    health:
      "Health will stay in the lane of rhythm, recovery, and body awareness, without medical diagnosis.",
  };
}

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ locale?: string; draft?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const storedReport = await getReportRecord(id);
  const cookieStore = await cookies();
  const draft =
    query?.draft ?? cookieStore.get(getReportDraftCookieName(id))?.value;
  const draftInput = decodeReportDraft(draft);
  const report =
    storedReport ?? (draftInput ? createDraftReportRecord(id, draftInput) : null);

  if (!report) notFound();

  const recalculatedBazi = calculateBaziEngine({
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
      aliases: [report.birth_record.birth_place],
    },
  });
  const baziData = recalculatedBazi;
  const dayPillar = baziData.pillars.day;
  const profile = (pillarsDB as Record<string, PillarProfile>)[dayPillar];
  const sun = report.astro_data.placements.find(
    (placement) => placement.body === "Sun",
  );
  const mappedPlanet = report.astro_data.placements.find(
    (placement) => placement.body === baziData.mappedPlanet,
  );
  const elements = Object.entries(baziData.elementBalance);
  const locale = normalizeReportLocale(
    query?.locale ?? report.birth_record.locale ?? report.ai_content.meta?.locale ?? "en",
  );
  const copyLocale = contentLocale(locale);
  const copy = reportCopy[copyLocale];
  const gender: Gender =
    report.birth_record.gender ??
    report.ai_content.meta?.gender ??
    "female";
  const dayDisplay = getPillarDisplay(dayPillar, locale);
  const sunSign =
    zodiacLabels[copyLocale][report.astro_data.sunSign] ?? report.astro_data.sunSign;
  const solarSecondary =
    copyLocale === "zh" || locale === "en" ? report.astro_data.sunSign : sunSign;
  const mappedPlanetName =
    planetLabels[copyLocale][baziData.mappedPlanet] ?? baziData.mappedPlanet;
  const profileName =
    copyLocale === "zh"
      ? profile.name.cn
      : locale === "ru"
        ? dayDisplay.totemName
        : profile.name.en;
  const headline =
    copyLocale === "zh"
      ? `${profileName} × ${sunSign}`
      : `${profileName} × ${sunSign}`;
  const pillarDisplays = Object.fromEntries(
    pillarOrder.map((key) => [
      key,
      {
        ...getPillarDisplay(baziData.pillars[key], locale),
        roleTitle: copy.pillarRoles[key].title,
        roleMicroBadge: copy.pillarRoles[key].microBadge,
      },
    ]),
  ) as unknown as ReportGenerationContext["bazi"]["pillarsDisplay"];
  const initialNatal: NatalBookSections = buildInitialNatalShell({
    locale,
    profile,
    bazi: baziData,
    dayDisplay,
    sunSign,
    mappedPlanetName,
  });
  const generationContext = {
    reportId: report.id,
    locale,
    gender,
    birth: {
      name: report.birth_record.name,
      birthDate: report.birth_record.birth_date,
      birthTime: report.birth_record.birth_time,
      birthPlace: report.birth_record.birth_place,
      trueSolarTime: baziData.trueSolarTime.time,
    },
    profile: {
      pillar: dayPillar,
      pillarDisplay: dayDisplay.pillarLabel,
      nameEn: profile.name.en,
      nameCn: profile.name.cn,
      displayName: profileName,
      essenceEn: profile.essence.en,
      careerStyleEn: profile.career.style.en,
      wealthEn: profile.career.wealth.en,
      loveModeEn: profile.love.mode.en,
      growthEn: profile.growth.en,
      healthEn: profile.health?.en,
    },
    bazi: {
      dayMaster: baziData.dayMaster,
      dayMasterDisplay: dayDisplay.stemLabel,
      mappedPlanet: baziData.mappedPlanet,
      mappedPlanetCn: baziData.mappedPlanetCn,
      mappedPlanetDisplay: mappedPlanetName,
      pillars: baziData.pillars,
      pillarsDisplay: pillarDisplays,
      elementBalance: baziData.elementBalance,
      missingElements: baziData.missingElements,
      tenGods: baziData.tenGods,
      luck: buildLuckDisplay(baziData.luck, locale),
    },
    astrology: {
      sunSign,
      sunSignCn: report.astro_data.sunSignCn,
      placements: report.astro_data.placements,
      majorAspects: report.astro_data.majorAspects,
    },
  } satisfies ReportGenerationContext;

  return (
    <main
      className="report-shell"
      data-report-export
      data-report-title={headline}
    >
      <div className="report-backdrop" aria-hidden="true">
        <Image src="/destinypixel-deep-space.png" alt="" fill priority />
        <span />
      </div>

      <header className="report-header page-container">
        <Link href={`/?locale=${locale}`} className="report-back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          {copy.back}
        </Link>
        <div className="report-header-actions">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              <span className="brand-mark__core" />
              <span className="brand-mark__orbit" />
            </span>
            <span>DestinyPixel</span>
          </div>
          <ReportLanguageLinks
            reportId={report.id}
            locale={locale}
            draft={draft}
          />
        </div>
      </header>

      <section className="report-hero page-container">
        <div className="report-card-visual">
          <Image
            src={getPillarImagePath(dayPillar)}
            alt={profileName}
            width={896}
            height={1200}
            priority
          />
        </div>

        <div className="report-summary">
          <p className="eyebrow">
            <Sparkles size={13} aria-hidden="true" />
            {copy.heroEyebrow}
          </p>
          <h1>{headline}</h1>
          <p className="report-lede">{copy.heroLede}</p>

          <div className="report-identity-grid">
            <div>
              <span>{copy.identity.dayPillar}</span>
              <strong>
                {dayDisplay.pillarLabel} · {profileName}
              </strong>
              <p>{dayDisplay.totemName}</p>
            </div>
            <div>
              <span>{copy.identity.solar}</span>
              <strong>
                {sunSign}
                {sun ? ` · ${sun.degreeInSign}°` : ""}
              </strong>
              <p>{solarSecondary}</p>
            </div>
            <div>
              <span>{copy.identity.mapping}</span>
              <strong>
                {dayDisplay.stemLabel} = {mappedPlanetName}
              </strong>
              <p>
                {dayDisplay.stemMeaning}
                {mappedPlanet
                  ? ` · ${zodiacLabels[copyLocale][mappedPlanet.sign] ?? mappedPlanet.sign}`
                  : ""}
              </p>
            </div>
          </div>

          <div className="report-meta-row">
            <span>
              <CalendarDays size={14} aria-hidden="true" />
              {report.birth_record.birth_date} {report.birth_record.birth_time}
            </span>
            <span>
              <MapPin size={14} aria-hidden="true" />
              {report.birth_record.birth_place}
            </span>
            <span>
              <Orbit size={14} aria-hidden="true" />
              {copy.meta.trueSolar} {baziData.trueSolarTime.time}
            </span>
            <span>
              <UserRound size={14} aria-hidden="true" />
              {gender === "male" ? copy.meta.male : copy.meta.female}
            </span>
          </div>
        </div>
      </section>

      <section className="report-body page-container">
        <aside className="report-side-panel">
          <div className="report-side-panel__heading">
            <span>{copy.bazi.eyebrow}</span>
            <h2>{copy.bazi.title}</h2>
            <p>{copy.bazi.description}</p>
          </div>

          <BaziChart pillars={baziData.pillars} locale={locale} />

          <div className="element-bars">
            <h3>{copy.bazi.elementBalance}</h3>
            {elements.map(([element, value]) => (
              <div key={element}>
                <span>{elementLabels[copyLocale][element] ?? element}</span>
                <i>
                  <b style={{ width: `${Math.max(8, Number(value) * 12)}%` }} />
                </i>
                <em>{value}</em>
              </div>
            ))}
          </div>
        </aside>

        <ReportExperience
          context={generationContext}
          initialNatal={initialNatal}
        />
      </section>
    </main>
  );
}
