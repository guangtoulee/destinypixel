import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Crown,
  MapPin,
  Orbit,
  Sparkles,
  Star,
} from "lucide-react";
import { normalizeAIReportContent } from "@/lib/ai/report";
import { getPillarImagePath } from "@/lib/archetype-assets";
import { getReportRecord } from "@/lib/db/repository";
import { elementLabelsCn } from "@/lib/engines/bazi";
import { pillarsDB, type PillarProfile } from "@/lib/pillars";

export const maxDuration = 60;

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
  const aiContent = normalizeAIReportContent(report.ai_content);
  const isDeepSeekReady = report.ai_content.meta?.provider === "deepseek";
  const headline = `${profile.name.cn} × 太阳${report.astro_data.sunSignCn}`;

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
            {isDeepSeekReady ? "DeepSeek Insight Ready" : "AI Insight Pending"}
          </p>
          <h1>{headline}</h1>
          <p className="report-lede">
            {isDeepSeekReady
              ? "DeepSeek 已基于真太阳时、八字四柱、十神结构、星体落座与主要相位生成本次融合解读。"
              : aiContent.character}
          </p>

          <div className="report-identity-grid">
            <div>
              <span>日柱动物原型</span>
              <strong>
                {dayPillar} · {profile.name.cn}
              </strong>
              <p>{profile.name.en}</p>
            </div>
            <div>
              <span>太阳星座</span>
              <strong>
                {sun?.signCn ?? report.astro_data.sunSignCn}
                {sun ? ` · ${sun.degreeInSign}°` : ""}
              </strong>
              <p>{sun?.sign ?? report.astro_data.sunSign}</p>
            </div>
            <div>
              <span>天干映射星体</span>
              <strong>
                {report.bazi_data.dayMaster} = {report.bazi_data.mappedPlanetCn}
              </strong>
              <p>
                {report.bazi_data.mappedPlanet}
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
          </div>
        </div>
      </section>

      <section className="report-body page-container">
        <aside className="report-side-panel">
          <h2>Raw Engine Output</h2>
          <div className="pillar-table">
            <div>
              <span>Year</span>
              <strong>{report.bazi_data.pillars.year}</strong>
            </div>
            <div>
              <span>Month</span>
              <strong>{report.bazi_data.pillars.month}</strong>
            </div>
            <div>
              <span>Day</span>
              <strong>{report.bazi_data.pillars.day}</strong>
            </div>
            <div>
              <span>Hour</span>
              <strong>{report.bazi_data.pillars.hour}</strong>
            </div>
          </div>

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

        <div className="report-modules">
          <article>
            <span>
              <Star size={15} fill="currentColor" aria-hidden="true" />
              天生性格
            </span>
            <p>{aiContent.character}</p>
          </article>
          <article>
            <span>
              <Sparkles size={15} aria-hidden="true" />
              财富模式
            </span>
            <p>{aiContent.wealth}</p>
          </article>
          <article>
            <span>
              <Orbit size={15} aria-hidden="true" />
              流年大运
            </span>
            <p>{aiContent.transits}</p>
          </article>

          <div className="vip-panel">
            <div>
              <span>
                <Crown size={17} aria-hidden="true" />
              </span>
              <div>
                <h2>VIP 深度咨询</h2>
                <p>
                  继续接入人工咨询、真实行运星历与年度追踪后，可把本报告延展为长期个人决策地图。
                </p>
              </div>
            </div>
            <a href="#vip">
              预约解读
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
