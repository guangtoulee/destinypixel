"use client";

import { motion } from "framer-motion";
import type { BirthInput } from "../../types";

type BirthConsoleProps = {
  value: BirthInput;
  onChange: (value: BirthInput) => void;
  onSubmit: () => void;
};

export function BirthConsole({ value, onChange, onSubmit }: BirthConsoleProps) {
  return (
    <motion.section
      className="xp-birth-console"
      initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      aria-labelledby="xp-origin-title"
    >
      <div className="xp-origin-heading">
        <p><span /> ORIGIN COORDINATES / 原点坐标</p>
        <h1 id="xp-origin-title">让宇宙读取你的时间</h1>
        <small>BAZI × NATAL CHART × PARTICLE DESTINY</small>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="xp-field-row">
          <label>
            <span>出生日期 / DATE</span>
            <input
              required
              aria-label="出生日期"
              type="date"
              value={value.birthDate}
              onChange={(event) => onChange({ ...value, birthDate: event.target.value })}
            />
          </label>
          <label>
            <span>出生时刻 / TIME</span>
            <input
              required
              aria-label="出生时间"
              type="time"
              value={value.birthTime}
              onChange={(event) => onChange({ ...value, birthTime: event.target.value })}
            />
          </label>
        </div>

        <label className="xp-place-field">
          <span>出生地点 / PLACE OF ORIGIN</span>
          <input
            required
            aria-label="出生地点"
            type="text"
            autoComplete="address-level2"
            placeholder="城市 · 区域"
            value={value.birthplace}
            onChange={(event) => onChange({ ...value, birthplace: event.target.value })}
          />
          <i aria-hidden="true">⌖</i>
        </label>

        <button className="xp-generate-button" type="submit">
          <span>生成数字图腾</span>
          <b aria-hidden="true">BEGIN OBSERVATION</b>
          <i aria-hidden="true">↗</i>
        </button>
      </form>

      <footer>
        <span>LOCAL VISUAL SYNTHESIS</span>
        <span>DATA ENCRYPTION / ON</span>
        <span>V.03—BETA</span>
      </footer>
    </motion.section>
  );
}
