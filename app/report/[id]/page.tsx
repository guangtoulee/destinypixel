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
import {
  normalizeAIReportContent,
  type Gender,
  type NatalBookSections,
} from "@/lib/ai/report";
import type { ReportGenerationContext } from "@/lib/ai/streaming";
import { getPillarImagePath } from "@/lib/archetype-assets";
import {
  branchTotems,
  pillarOrder,
  pillarRoleLabels,
} from "@/lib/bazi-totems";
import { getReportRecord } from "@/lib/db/repository";
import { elementLabelsCn } from "@/lib/engines/bazi";
import { pillarsDB, type PillarProfile } from "@/lib/pillars";

export const maxDuration = 60;

function BaziChart({
  pillars,
}: {
  pillars: ReportGenerationContext["bazi"]["pillars"];
}) {
  return (
    <div className="pillar-chart">
      {pillarOrder.map((key) => {
        const pillar = pillars[key];
        const stem = pillar[0];
        const branch = pillar[1];
        const role = pillarRoleLabels[key];
        const totem = branchTotems[branch];

        return (
          <article className="pillar-chart-card" key={key}>
            <header>
              <span>{role.title}</span>
              <strong>{pillar}</strong>
            </header>
            <div className="pillar-symbol-row">
              <div>
                <span>Heavenly Stem</span>
                <b>{stem}</b>
              </div>
              <div>
                <span>Earthly Branch</span>
                <b>{branch}</b>
              </div>
            </div>
            <div className="pillar-totem">
              <span aria-hidden="true">{totem.emoji}</span>
              <div>
                <strong>{totem.animal}</strong>
                <small>{totem.elementField}</small>
              </div>
            </div>
            <em>{role.microBadge}</em>
          </article>
        );
      })}
    </div>
  );
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
  const legacyContent = normalizeAIReportContent(report.ai_content);
  const gender: Gender =
    report.birth_record.gender ??
    report.ai_content.meta?.gender ??
    "female";
  const headline = `${profile.name.en} × ${report.astro_data.sunSign} Sun`;
  const initialNatal: NatalBookSections = report.ai_content.natalBook ?? {
    dayMaster: legacyContent.character,
    outerPersona:
      legacyContent.wealth ||
      `${report.bazi_data.dayMaster} maps to ${report.bazi_data.mappedPlanet}. This section studies the visible style, first impression, and social persona created by the heavenly stems.`,
    deepSelf:
      legacyContent.character ||
      "The earthly branches reveal the hidden instinctual field beneath the polished surface of the chart.",
    lifeDimensions:
      legacyContent.transits ||
      "Career, love, growth, and health are now separated into concise, practical signals.",
  };
  const generationContext = {
    reportId: report.id,
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
      nameEn: profile.name.en,
      nameCn: profile.name.cn,
      essenceEn: profile.essence.en,
      careerStyleEn: profile.career.style.en,
      wealthEn: profile.career.wealth.en,
      loveModeEn: profile.love.mode.en,
      growthEn: profile.growth.en,
      healthEn: profile.health?.en,
    },
    bazi: {
      dayMaster: report.bazi_data.dayMaster,
      mappedPlanet: report.bazi_data.mappedPlanet,
      mappedPlanetCn: report.bazi_data.mappedPlanetCn,
      pillars: report.bazi_data.pillars,
      elementBalance: report.bazi_data.elementBalance,
      missingElements: report.bazi_data.missingElements,
      tenGods: report.bazi_data.tenGods,
    },
    astrology: {
      sunSign: report.astro_data.sunSign,
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
          Back
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
            alt={profile.name.cn}
            width={309}
            height={418}
            priority
          />
        </div>

        <div className="report-summary">
          <p className="eyebrow">
            <Sparkles size={13} aria-hidden="true" />
            Natal shell ready · AI streams after first paint
          </p>
          <h1>{headline}</h1>
          <p className="report-lede">
            Your report now loads like a premium product: the Bazi and
            Astrology engines finish first, then the Natal Book streams into
            modular panels. Annual Transits are generated only when you ask for
            them.
          </p>

          <div className="report-identity-grid">
            <div>
              <span>Day Pillar Archetype</span>
              <strong>
                {dayPillar} · {profile.name.en}
              </strong>
              <p>{profile.name.cn}</p>
            </div>
            <div>
              <span>Solar Signature</span>
              <strong>
                {sun?.sign ?? report.astro_data.sunSign}
                {sun ? ` · ${sun.degreeInSign}°` : ""}
              </strong>
              <p>{sun?.signCn ?? report.astro_data.sunSignCn}</p>
            </div>
            <div>
              <span>Stem Planet Mapping</span>
              <strong>
                {report.bazi_data.dayMaster} = {report.bazi_data.mappedPlanet}
              </strong>
              <p>
                {report.bazi_data.mappedPlanetCn}
                {mappedPlanet ? ` in ${mappedPlanet.sign}` : ""}
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
              True solar {report.bazi_data.trueSolarTime.time}
            </span>
            <span>
              <UserRound size={14} aria-hidden="true" />
              {gender === "male" ? "Male" : "Female"}
            </span>
          </div>
        </div>
      </section>

      <section className="report-body page-container">
        <aside className="report-side-panel">
          <div className="report-side-panel__heading">
            <span>Bazi Chart</span>
            <h2>Four Pillars & Totems</h2>
            <p>
              Heavenly stems describe the visible drive. Earthly branches reveal
              the animal field beneath it.
            </p>
          </div>

          <BaziChart pillars={report.bazi_data.pillars} />

          <div className="element-bars">
            {elements.map(([element, value]) => (
              <div key={element}>
                <span>{elementLabelsCn[element as keyof typeof elementLabelsCn]}</span>
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
