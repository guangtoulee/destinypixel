import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Orbit,
  Sparkles,
  UserRound,
} from "lucide-react";
import ReportExperience from "@/components/report-experience";
import { type Gender, type NatalBookSections } from "@/lib/ai/report";
import type { ReportGenerationContext } from "@/lib/ai/streaming";
import { getPillarImagePath } from "@/lib/archetype-assets";
import { getPillarDisplay, pillarOrder } from "@/lib/bazi-totems";
import { getReportRecord } from "@/lib/db/repository";
import { pillarsDB, type PillarProfile } from "@/lib/pillars";
import type { BaziData } from "@/lib/engines/bazi";
import {
  elementLabels,
  normalizeReportLocale,
  planetLabels,
  reportCopy,
  zodiacLabels,
  type ReportLocale,
} from "@/lib/report-i18n";

export const maxDuration = 60;

function BaziChart({
  pillars,
  locale,
}: {
  pillars: ReportGenerationContext["bazi"]["pillars"];
  locale: ReportLocale;
}) {
  const copy = reportCopy[locale];

  return (
    <div className="pillar-chart">
      {pillarOrder.map((key) => {
        const pillar = pillars[key];
        const role = copy.pillarRoles[key];
        const display = getPillarDisplay(pillar, locale);

        return (
          <article className="pillar-chart-card" key={key}>
            <div className="pillar-card-main">
              <div className="pillar-card-media">
                <Image
                  src={display.imageSrc}
                  alt={display.totemName}
                  width={72}
                  height={96}
                />
              </div>
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
      dayMaster: `${profile.name.cn} 是本命盘的日柱原型。系统识别日柱为 ${bazi.pillars.day}，日主为 ${bazi.dayMaster}，太阳落在 ${sunSign}。完整命之书会在页面打开后继续流式生成。`,
      outerPersona: `外在层从四柱天干展开：${pillarNames}。日主映射星体为 ${mappedPlanetName}，它会描述你的外在气场、社会面具和第一印象。`,
      deepSelf: `深层自我来自地支场域：${branchNames}。这些动物图腾描述本能、记忆、依恋模式与潜意识驱动力。`,
      lifeDimensions:
        "事业、感情、成长与健康会被拆成四个更清晰的判断，不再把所有内容塞进一篇冗长报告。",
    };
  }

  if (locale === "ru") {
    return {
      dayMaster: `${dayDisplay.totemName} является ядром дневного столпа. Система определяет дневной столп как ${dayDisplay.pillarLabel}, дневной мастер как ${dayDisplay.stemMeaning}, а Солнце находится в знаке ${sunSign}. Полная книга рождения загружается потоково после открытия страницы.`,
      outerPersona: `Внешний слой начинается с небесных стволов четырех столпов: ${pillarNames}. Планета дневного мастера — ${mappedPlanetName}; она описывает первое впечатление, социальную маску и стиль видимости.`,
      deepSelf: `Глубинный слой раскрывается через земные ветви: ${branchNames}. Эти тотемы показывают инстинкты, память, привязанность и внутренний психологический двигатель.`,
      lifeDimensions:
        "Карьера, любовь, рост и здоровье разбиты на отдельные практические блоки, чтобы отчет оставался ясным и пригодным для решения реальных задач.",
    };
  }

  return {
    dayMaster: `${profile.name.en} is the visible Day Pillar archetype behind this report. The Bazi engine identifies ${dayDisplay.pillarLabel} as the Day Pillar and ${dayDisplay.stemMeaning} as the Day Master, while the Western layer places the Sun in ${sunSign}. The full Natal Book streams after first paint.`,
    outerPersona: `Your social layer begins with the four heavenly stems: ${pillarNames}. The mapped Day Master planet is ${mappedPlanetName}. This module refines first impression, ambition style, and public rhythm.`,
    deepSelf: `Your subterranean layer begins with the earthly branches: ${branchNames}. These totems describe instinct, memory, attachment patterns, and the pressure points beneath performance.`,
    lifeDimensions:
      "Career, love, growth, and health are separated into concise signals, replacing the old one-piece long essay with modular commercial insight.",
  };
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReportRecord(id);

  if (!report) notFound();

  const dayPillar = report.bazi_data.pillars.day;
  const profile = (pillarsDB as Record<string, PillarProfile>)[dayPillar];
  const sun = report.astro_data.placements.find(
    (placement) => placement.body === "Sun",
  );
  const mappedPlanet = report.astro_data.placements.find(
    (placement) => placement.body === report.bazi_data.mappedPlanet,
  );
  const elements = Object.entries(report.bazi_data.elementBalance);
  const locale = normalizeReportLocale(
    report.birth_record.locale ?? report.ai_content.meta?.locale ?? "en",
  );
  const copy = reportCopy[locale];
  const gender: Gender =
    report.birth_record.gender ??
    report.ai_content.meta?.gender ??
    "female";
  const dayDisplay = getPillarDisplay(dayPillar, locale);
  const sunSign =
    zodiacLabels[locale][report.astro_data.sunSign] ?? report.astro_data.sunSign;
  const solarSecondary =
    locale === "zh" || locale === "en" ? report.astro_data.sunSign : sunSign;
  const mappedPlanetName =
    planetLabels[locale][report.bazi_data.mappedPlanet] ??
    report.bazi_data.mappedPlanet;
  const profileName =
    locale === "zh"
      ? profile.name.cn
      : locale === "ru"
        ? dayDisplay.totemName
        : profile.name.en;
  const headline =
    locale === "zh"
      ? `${profileName} × ${sunSign}`
      : `${profileName} × ${sunSign}`;
  const pillarDisplays = Object.fromEntries(
    pillarOrder.map((key) => [
      key,
      {
        ...getPillarDisplay(report.bazi_data.pillars[key], locale),
        roleTitle: copy.pillarRoles[key].title,
        roleMicroBadge: copy.pillarRoles[key].microBadge,
      },
    ]),
  ) as unknown as ReportGenerationContext["bazi"]["pillarsDisplay"];
  const initialNatal: NatalBookSections = buildInitialNatalShell({
    locale,
    profile,
    bazi: report.bazi_data,
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
      trueSolarTime: report.bazi_data.trueSolarTime.time,
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
      dayMaster: report.bazi_data.dayMaster,
      dayMasterDisplay: dayDisplay.stemLabel,
      mappedPlanet: report.bazi_data.mappedPlanet,
      mappedPlanetCn: report.bazi_data.mappedPlanetCn,
      mappedPlanetDisplay: mappedPlanetName,
      pillars: report.bazi_data.pillars,
      pillarsDisplay: pillarDisplays,
      elementBalance: report.bazi_data.elementBalance,
      missingElements: report.bazi_data.missingElements,
      tenGods: report.bazi_data.tenGods,
    },
    astrology: {
      sunSign,
      sunSignCn: report.astro_data.sunSignCn,
      placements: report.astro_data.placements,
      majorAspects: report.astro_data.majorAspects,
    },
  } satisfies ReportGenerationContext;

  return (
    <main className="report-shell">
      <div className="report-backdrop" aria-hidden="true">
        <Image src="/destinypixel-deep-space.png" alt="" fill priority />
        <span />
      </div>

      <header className="report-header page-container">
        <Link href="/" className="report-back-link">
          <ArrowLeft size={15} aria-hidden="true" />
          {copy.back}
        </Link>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <span className="brand-mark__core" />
            <span className="brand-mark__orbit" />
          </span>
          <span>DestinyPixel</span>
        </div>
      </header>

      <section className="report-hero page-container">
        <div className="report-card-visual">
          <Image
            src={getPillarImagePath(dayPillar)}
            alt={profileName}
            width={309}
            height={418}
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
                  ? ` · ${zodiacLabels[locale][mappedPlanet.sign] ?? mappedPlanet.sign}`
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
              {copy.meta.trueSolar} {report.bazi_data.trueSolarTime.time}
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

          <BaziChart pillars={report.bazi_data.pillars} locale={locale} />

          <div className="element-bars">
            <h3>{copy.bazi.elementBalance}</h3>
            {elements.map(([element, value]) => (
              <div key={element}>
                <span>{elementLabels[locale][element] ?? element}</span>
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
