"use client";

import { RotateCcw, Sparkles } from "lucide-react";
import type { ReportLocale } from "@/lib/report-i18n";
import { getTotemCopy, resonanceNames } from "@/lib/totem/copy";
import { resonanceKeys, type ResonanceKey, type TotemCalibration } from "@/lib/totem/types";
import styles from "./totem.module.css";

type TotemCalibrationProps = {
  locale: ReportLocale;
  values: TotemCalibration;
  applied: boolean;
  onChange: (key: ResonanceKey, value: number) => void;
  onApply: () => void;
  onReset: () => void;
};

export default function TotemCalibrationPanel({
  locale,
  values,
  applied,
  onChange,
  onApply,
  onReset,
}: TotemCalibrationProps) {
  const copy = getTotemCopy(locale);
  const language = locale === "ru" ? "ru" : locale === "en" ? "en" : "zh";

  function levelLabel(value: number) {
    if (value <= 25) return copy.calibration.low;
    if (value >= 75) return copy.calibration.high;
    return copy.calibration.middle;
  }

  return (
    <section className={styles.calibrationSection} aria-labelledby="calibration-title">
      <div className={styles.sectionHeading}>
        <div>
          <p className={styles.kicker}>{copy.calibration.eyebrow}</p>
          <h2 id="calibration-title">{copy.calibration.title}</h2>
        </div>
        <p>{copy.calibration.lead}</p>
      </div>

      <div className={styles.calibrationGrid}>
        {resonanceKeys.map((key) => (
          <label key={key} className={styles.calibrationItem}>
            <span>
              <strong>{resonanceNames[language][key]}</strong>
              <em>{levelLabel(values[key])}</em>
            </span>
            <input
              type="range"
              min="0"
              max="100"
              step="25"
              value={values[key]}
              onChange={(event) => onChange(key, Number(event.target.value))}
              aria-valuetext={levelLabel(values[key])}
            />
            <i aria-hidden="true">
              <span>{copy.calibration.low}</span>
              <span>{copy.calibration.middle}</span>
              <span>{copy.calibration.high}</span>
            </i>
          </label>
        ))}
      </div>

      <div className={styles.calibrationActions}>
        <button type="button" className={styles.primaryButton} onClick={onApply}>
          <Sparkles size={17} aria-hidden="true" />
          {copy.calibration.apply}
        </button>
        {applied && (
          <button type="button" className={styles.quietButton} onClick={onReset}>
            <RotateCcw size={16} aria-hidden="true" />
            {copy.calibration.reset}
          </button>
        )}
        {applied && <p role="status">{copy.calibration.applied}</p>}
      </div>
    </section>
  );
}
