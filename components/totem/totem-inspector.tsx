"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { getPillarImagePath } from "@/lib/archetype-assets";
import type { ReportLocale } from "@/lib/report-i18n";
import {
  elementNames,
  explainTotemPart,
  functionNames,
  getTotemCopy,
  pillarNames,
  resonanceNames,
} from "@/lib/totem/copy";
import type { TotemPart } from "@/lib/totem/types";
import styles from "./totem.module.css";

type TotemInspectorProps = {
  part: TotemPart | null;
  locale: ReportLocale;
  dayPillar: string;
  mobile: boolean;
  onClose: () => void;
};

export default function TotemInspector({
  part,
  locale,
  dayPillar,
  mobile,
  onClose,
}: TotemInspectorProps) {
  const copy = getTotemCopy(locale);
  const key = locale === "ru" ? "ru" : locale === "en" ? "en" : "zh";
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (part && mobile) headingRef.current?.focus();
  }, [mobile, part]);

  if (!part) {
    return (
      <aside id="totem-inspector" className={styles.inspector} aria-live="polite">
        <div className={styles.inspectorEmptyMark} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <p className={styles.kicker}>STRUCTURE INDEX</p>
        <h2>{copy.inspector.emptyTitle}</h2>
        <p>{copy.inspector.emptyLead}</p>
      </aside>
    );
  }

  const explanation = explainTotemPart(part, locale);
  const showArchetype = part.pillar === "day" && part.kind !== "element-flow";

  return (
    <aside
      id="totem-inspector"
      className={styles.inspector}
      role={mobile ? "dialog" : "complementary"}
      aria-labelledby="totem-inspector-title"
      aria-live="polite"
      data-open="true"
    >
      <div className={styles.inspectorTopline}>
        <span className={styles.stateBadge} data-state={part.state}>
          <i />
          {copy.states[part.state]}
        </span>
        <button type="button" onClick={onClose} aria-label={copy.inspector.close}>
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      {showArchetype && (
        <div className={styles.archetypeWhisper} aria-hidden="true">
          <Image
            src={getPillarImagePath(dayPillar)}
            alt=""
            width={896}
            height={1200}
            sizes="180px"
          />
          <span />
        </div>
      )}

      <p className={styles.kicker}>{part.id}</p>
      <h2 id="totem-inspector-title" ref={headingRef} tabIndex={-1}>
        {explanation.title}
      </h2>

      <div className={styles.partTags}>
        {part.pillar && <span>{pillarNames[key][part.pillar]}</span>}
        {part.element && <span>{elementNames[key][part.element]}</span>}
        {part.stem && <span>{part.stem}</span>}
        {part.branch && <span>{part.branch}</span>}
        {(part.tenGods?.length || part.tenGod) && (
          <span>{part.tenGods?.join(" · ") ?? part.tenGod}</span>
        )}
        {part.functionModule && <span>{functionNames[key][part.functionModule]}</span>}
        {part.resonance && <span>{resonanceNames[key][part.resonance]}</span>}
      </div>

      <dl className={styles.explanationList}>
        <div>
          <dt>{copy.inspector.source}</dt>
          <dd>{explanation.source}</dd>
        </div>
        <div>
          <dt>{copy.inspector.shape}</dt>
          <dd>{explanation.shape}</dd>
        </div>
        <div>
          <dt>{copy.inspector.fluent}</dt>
          <dd>{explanation.fluent}</dd>
        </div>
        <div>
          <dt>{copy.inspector.imbalance}</dt>
          <dd>{explanation.imbalance}</dd>
        </div>
        <div>
          <dt>{copy.inspector.practice}</dt>
          <dd>{explanation.practice}</dd>
        </div>
      </dl>
    </aside>
  );
}
