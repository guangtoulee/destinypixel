"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  BookOpenText,
  CalendarClock,
  ChevronDown,
  Loader2,
  Orbit,
  Sparkles,
} from "lucide-react";
import type { NatalBookSections } from "@/lib/ai/report";
import type { ReportGenerationContext } from "@/lib/ai/streaming";
import { reportCopy } from "@/lib/report-i18n";
import {
  getTransitMonthDisplay,
  getTransitOverviewDisplay,
  transitMonthSections,
  transitOverviewSection,
  type TransitMonthKey,
  type TransitSectionKey,
} from "@/lib/report-timing";

type StreamStatus = "idle" | "loading" | "ready" | "error";
type ActiveTab = "natal" | "transits";
type NatalKey = keyof NatalBookSections;
type TransitKey = TransitSectionKey;

type SectionConfig<Key extends string> = {
  key: Key;
  marker: string;
  title: string;
  kicker: string;
};

const natalSections: Array<SectionConfig<NatalKey>> = [
  {
    key: "dayMaster",
    marker: "DAY_MASTER",
    title: "Day Master",
    kicker: "命盘核心",
  },
  {
    key: "outerPersona",
    marker: "OUTER_PERSONA",
    title: "Outer Persona",
    kicker: "外在形象",
  },
  {
    key: "deepSelf",
    marker: "DEEP_SELF",
    title: "Deep Self",
    kicker: "深层自我",
  },
  {
    key: "career",
    marker: "CAREER",
    title: "Career",
    kicker: "事业",
  },
  {
    key: "love",
    marker: "LOVE",
    title: "Love",
    kicker: "感情",
  },
  {
    key: "growth",
    marker: "GROWTH",
    title: "Growth",
    kicker: "成长",
  },
  {
    key: "health",
    marker: "HEALTH",
    title: "Health",
    kicker: "健康",
  },
];

const transitSections: Array<SectionConfig<TransitKey>> = [
  {
    key: transitOverviewSection.key,
    marker: transitOverviewSection.marker,
    title: "Overview",
    kicker: "Annual Frame",
  },
  ...transitMonthSections.map((section) => ({
    key: section.key,
    marker: section.marker,
    title: section.enTitle,
    kicker: section.enKicker,
  })),
];

function parseMarkedSections<Key extends string>(
  raw: string,
  sections: Array<SectionConfig<Key>>,
) {
  const result = Object.fromEntries(
    sections.map((section) => [section.key, ""]),
  ) as Record<Key, string>;

  if (!raw.trim()) {
    return result;
  }

  const markerPattern = new RegExp(
    `\\[(${sections.map((section) => section.marker).join("|")})\\]`,
    "g",
  );
  const matches = Array.from(raw.matchAll(markerPattern));

  if (matches.length === 0) {
    result[sections[0].key] = raw.trim();
    return result;
  }

  matches.forEach((match, index) => {
    const marker = match[1];
    const config = sections.find((section) => section.marker === marker);

    if (!config || match.index === undefined) return;

    const next = matches[index + 1];
    const start = match.index + match[0].length;
    const end = next?.index ?? raw.length;
    result[config.key] = raw.slice(start, end).trim();
  });

  return result;
}

function StatusPill({
  status,
  idleLabel,
  labels,
}: {
  status: StreamStatus;
  idleLabel: string;
  labels: (typeof reportCopy)[keyof typeof reportCopy]["status"];
}) {
  const label =
    status === "loading"
      ? labels.loading
      : status === "ready"
        ? labels.ready
        : status === "error"
          ? labels.error
          : idleLabel;

  return (
    <span className="stream-status-pill" data-status={status}>
      {status === "loading" ? (
        <Loader2 size={13} className="loading-icon" aria-hidden="true" />
      ) : (
        <Sparkles size={13} aria-hidden="true" />
      )}
      {label}
    </span>
  );
}

function splitInsightText(content: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function InsightText({ content }: { content: string }) {
  const paragraphs = splitInsightText(content);

  if (paragraphs.length === 0) return null;

  return (
    <div className="insight-copy">
      {paragraphs.map((paragraph, index) => (
        <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>
      ))}
    </div>
  );
}

function formatMonthlyRange(
  key: TransitMonthKey,
  targetYear: number | undefined,
  range: string,
) {
  if (!targetYear) return range;
  if (key === "month11") return `${targetYear}/12/07-${targetYear + 1}/01/05`;
  if (key === "month12") return `${targetYear + 1} · ${range}`;

  return `${targetYear} · ${range}`;
}


function AccordionSection({
  title,
  kicker,
  content,
  isOpen,
  isLoading,
  loadingLabel,
  queuedLabel,
  onToggle,
}: {
  title: string;
  kicker: string;
  content: string;
  isOpen: boolean;
  isLoading?: boolean;
  loadingLabel: string;
  queuedLabel: string;
  onToggle: () => void;
}) {
  return (
    <article className="report-accordion-card" data-open={isOpen}>
      <button type="button" onClick={onToggle} aria-expanded={isOpen}>
        <span>
          <small>{kicker}</small>
          <strong>{title}</strong>
        </span>
        <ChevronDown size={18} aria-hidden="true" />
      </button>
      {isOpen ? (
        <div className="report-accordion-card__body">
          {content ? (
            <InsightText content={content} />
          ) : (
            <div className="insight-skeleton">
              <span>{isLoading ? loadingLabel : queuedLabel}</span>
              <i />
              <i />
              <i />
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}

export default function ReportExperience({
  context,
  initialNatal,
}: {
  context: ReportGenerationContext;
  initialNatal: NatalBookSections;
}) {
  const copy = reportCopy[context.locale];
  const luck = context.bazi.luck;
  const startAgeDisplay = luck
    ? context.locale === "zh"
      ? `${luck.startAge}岁`
      : context.locale === "ru"
        ? `${luck.startAge} лет`
        : `age ${luck.startAge}`
    : "";
  const [activeTab, setActiveTab] = useState<ActiveTab>("natal");
  const [natalRaw, setNatalRaw] = useState("");
  const [transitRaw, setTransitRaw] = useState("");
  const [natalStatus, setNatalStatus] = useState<StreamStatus>("idle");
  const [transitStatus, setTransitStatus] = useState<StreamStatus>("idle");
  const [openNatal, setOpenNatal] = useState<Record<NatalKey, boolean>>({
    dayMaster: true,
    outerPersona: false,
    deepSelf: false,
    career: false,
    love: false,
    growth: false,
    health: false,
  });
  const streamEndpoint = useCallback(
    async (
      endpoint: "/api/generate-natal" | "/api/generate-transit",
      setRaw: Dispatch<SetStateAction<string>>,
      setStatus: Dispatch<SetStateAction<StreamStatus>>,
    ) => {
      setStatus("loading");
      setRaw("");

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(context),
        });

        if (!response.ok || !response.body) {
          throw new Error(`Stream failed: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          setRaw((current) => current + decoder.decode(value, { stream: true }));
        }

        setStatus("ready");
      } catch {
        setStatus("error");
      }
    },
    [context],
  );

  useEffect(() => {
    void streamEndpoint("/api/generate-natal", setNatalRaw, setNatalStatus);
  }, [streamEndpoint]);

  const natalContent = useMemo(() => {
    const parsed = parseMarkedSections(natalRaw, natalSections);

    return {
      dayMaster: parsed.dayMaster || initialNatal.dayMaster,
      outerPersona: parsed.outerPersona || initialNatal.outerPersona,
      deepSelf: parsed.deepSelf || initialNatal.deepSelf,
      career: parsed.career || initialNatal.career,
      love: parsed.love || initialNatal.love,
      growth: parsed.growth || initialNatal.growth,
      health: parsed.health || initialNatal.health,
    };
  }, [initialNatal, natalRaw]);

  const transitContent = useMemo(
    () => parseMarkedSections(transitRaw, transitSections),
    [transitRaw],
  );
  const transitOverview = getTransitOverviewDisplay(context.locale);

  function activateTab(tab: ActiveTab) {
    setActiveTab(tab);

    if (tab === "transits" && transitStatus === "idle") {
      void streamEndpoint(
        "/api/generate-transit",
        setTransitRaw,
        setTransitStatus,
      );
    }
  }

  return (
    <section className="report-workspace">
      <div className="report-tabs" role="tablist" aria-label={copy.tabs.aria}>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "natal"}
          onClick={() => activateTab("natal")}
        >
          <BookOpenText size={16} aria-hidden="true" />
          {copy.tabs.natal}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "transits"}
          onClick={() => activateTab("transits")}
        >
          <CalendarClock size={16} aria-hidden="true" />
          {copy.tabs.transits}
        </button>
      </div>

      {activeTab === "natal" ? (
        <div className="report-tab-panel" role="tabpanel">
          <div className="report-panel-heading">
            <div>
              <span>{copy.natalPanel.eyebrow}</span>
              <h2>{copy.natalPanel.title}</h2>
            </div>
            <StatusPill
              status={natalStatus}
              idleLabel={copy.status.idleNatal}
              labels={copy.status}
            />
          </div>

          <div className="report-accordion">
            {natalSections.map((section) => (
              <AccordionSection
                key={section.key}
                title={copy.accordion[section.key].title}
                kicker={copy.accordion[section.key].kicker}
                content={natalContent[section.key]}
                isOpen={openNatal[section.key]}
                isLoading={natalStatus === "loading"}
                loadingLabel={copy.status.generating}
                queuedLabel={copy.status.queued}
                onToggle={() =>
                  setOpenNatal((current) => ({
                    ...current,
                    [section.key]: !current[section.key],
                  }))
                }
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="report-tab-panel" role="tabpanel">
          <div className="report-panel-heading">
            <div>
              <span>{copy.transitPanel.eyebrow}</span>
              <h2>{copy.transitPanel.title}</h2>
            </div>
            <StatusPill
              status={transitStatus}
              idleLabel={copy.status.idleTransit}
              labels={copy.status}
            />
          </div>

          {luck ? (
            <div className="transit-context-grid" aria-label={copy.transitPanel.title}>
              <div>
                <span>{copy.transitContext.targetYear}</span>
                <strong>
                  {luck.targetYear} · {luck.currentYearPillarDisplay}
                </strong>
              </div>
              <div>
                <span>{copy.transitContext.previousYear}</span>
                <strong>
                  {luck.previousYear} · {luck.previousYearPillarDisplay}
                </strong>
              </div>
              <div>
                <span>{copy.transitContext.tenYearLuck}</span>
                <strong>
                  {luck.activeTenYearLuck
                    ? `${luck.activeTenYearLuck.pillarDisplay} · ${luck.activeTenYearLuck.startYear}-${luck.activeTenYearLuck.endYear}`
                    : copy.status.queued}
                </strong>
              </div>
              <div>
                <span>{copy.transitContext.direction}</span>
                <strong>
                  {luck.directionLabel} · {copy.transitContext.starts} {startAgeDisplay}
                </strong>
              </div>
            </div>
          ) : null}

          <article className="transit-overview-card">
            <div className="transit-overview-card__head">
              <span>{transitOverview.kicker}</span>
              <strong>{transitOverview.title}</strong>
            </div>
            {transitContent.overview ? (
              <InsightText content={transitContent.overview} />
            ) : (
              <div className="insight-skeleton">
                <span>{copy.status.generating}</span>
                <i />
                <i />
                <i />
              </div>
            )}
          </article>

          <div className="monthly-timing-grid">
            {transitMonthSections.map((section, index) => {
              const content = transitContent[section.key as TransitMonthKey];
              const display = getTransitMonthDisplay(section, context.locale);

              return (
                <article className="season-card monthly-timing-card" key={section.key}>
                  <span className="monthly-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="monthly-card-head">
                    <span>{display.kicker}</span>
                    <strong>{display.title}</strong>
                    <em>{formatMonthlyRange(section.key, luck?.targetYear, display.range)}</em>
                  </div>
                  {content ? (
                    <InsightText content={content} />
                  ) : (
                    <div className="insight-skeleton">
                      <span>{copy.status.generating}</span>
                      <i />
                      <i />
                      <i />
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div className="vip-panel">
            <div>
              <span>
                <Orbit size={17} aria-hidden="true" />
              </span>
              <div>
                <h2>{copy.vip.title}</h2>
                <p>{copy.vip.description}</p>
              </div>
            </div>
            <a href="#vip">{copy.vip.action}</a>
          </div>
        </div>
      )}
    </section>
  );
}
