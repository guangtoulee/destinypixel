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

type StreamStatus = "idle" | "loading" | "ready" | "error";
type ActiveTab = "natal" | "transits";
type NatalKey = keyof NatalBookSections;
type TransitKey = "spring" | "summer" | "autumn" | "winter";

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
    key: "lifeDimensions",
    marker: "LIFE_DIMENSIONS",
    title: "Life Dimensions",
    kicker: "全景运势",
  },
];

const transitSections: Array<SectionConfig<TransitKey>> = [
  {
    key: "spring",
    marker: "SPRING",
    title: "Spring",
    kicker: "Initiation",
  },
  {
    key: "summer",
    marker: "SUMMER",
    title: "Summer",
    kicker: "Expression",
  },
  {
    key: "autumn",
    marker: "AUTUMN",
    title: "Autumn",
    kicker: "Refinement",
  },
  {
    key: "winter",
    marker: "WINTER",
    title: "Winter",
    kicker: "Integration",
  },
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
            <p>{content}</p>
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
  const [activeTab, setActiveTab] = useState<ActiveTab>("natal");
  const [natalRaw, setNatalRaw] = useState("");
  const [transitRaw, setTransitRaw] = useState("");
  const [natalStatus, setNatalStatus] = useState<StreamStatus>("idle");
  const [transitStatus, setTransitStatus] = useState<StreamStatus>("idle");
  const [openNatal, setOpenNatal] = useState<Record<NatalKey, boolean>>({
    dayMaster: true,
    outerPersona: false,
    deepSelf: false,
    lifeDimensions: false,
  });
  const [openTransit, setOpenTransit] = useState<Record<TransitKey, boolean>>({
    spring: true,
    summer: false,
    autumn: false,
    winter: false,
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
      lifeDimensions: parsed.lifeDimensions || initialNatal.lifeDimensions,
    };
  }, [initialNatal, natalRaw]);

  const transitContent = useMemo(
    () => parseMarkedSections(transitRaw, transitSections),
    [transitRaw],
  );

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

          <div className="season-grid">
            {transitSections.map((section) => {
              const content = transitContent[section.key];

              return (
                <article className="season-card" key={section.key}>
                  <div>
                    <span>{copy.seasons[section.key].kicker}</span>
                    <strong>{copy.seasons[section.key].title}</strong>
                  </div>
                  {content ? (
                    <p>{content}</p>
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
