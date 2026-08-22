"use client";

import { motion } from "framer-motion";
import { cities } from "@/lib/geo/cities";
import type {
  OracleRequest,
  OracleRequestState,
} from "../types";

type UltraBirthConsoleProps = {
  value: OracleRequest;
  state: OracleRequestState;
  error: string | null;
  onChange: (value: OracleRequest) => void;
  onSubmit: () => void;
  onCancel: () => void;
};

export function UltraBirthConsole({
  value,
  state,
  error,
  onChange,
  onSubmit,
  onCancel,
}: UltraBirthConsoleProps) {
  const calculating = state === "calculating";

  return (
    <motion.section
      className="xp-birth-console ultra-birth-console"
      initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -18, filter: "blur(8px)" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      aria-labelledby="ultra-origin-title"
      aria-busy={calculating}
    >
      <div className="xp-origin-heading ultra-origin-heading">
        <p><span /> ASTRO—BAZI ENGINE / 真时校准</p>
        <h1 id="ultra-origin-title">让真实时间读取你</h1>
        <small>LUNAR ENGINE × DEEPSEEK ORACLE × SPATIAL DESTINY</small>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!calculating) onSubmit();
        }}
      >
        <div className="xp-field-row">
          <label>
            <span>出生日期 / LOCAL DATE</span>
            <input
              required
              disabled={calculating}
              aria-label="出生日期"
              type="date"
              min="1900-01-01"
              value={value.birthDate}
              onChange={(event) => onChange({ ...value, birthDate: event.target.value })}
            />
          </label>
          <label>
            <span>出生时刻 / CIVIL TIME</span>
            <input
              required
              disabled={calculating}
              aria-label="出生时间"
              type="time"
              value={value.birthTime}
              onChange={(event) => onChange({ ...value, birthTime: event.target.value })}
            />
          </label>
        </div>

        <div className="ultra-calibration-row">
          <fieldset className="ultra-gender-field">
            <legend>排运性别 / DIRECTION</legend>
            <div>
              <label className={value.gender === "male" ? "active" : ""}>
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={value.gender === "male"}
                  disabled={calculating}
                  onChange={() => onChange({ ...value, gender: "male" })}
                />
                <span>男序</span>
              </label>
              <label className={value.gender === "female" ? "active" : ""}>
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={value.gender === "female"}
                  disabled={calculating}
                  onChange={() => onChange({ ...value, gender: "female" })}
                />
                <span>女序</span>
              </label>
            </div>
          </fieldset>

          <label className="ultra-city-field">
            <span>出生城市 / CALIBRATION CITY</span>
            <select
              required
              disabled={calculating}
              aria-label="出生城市"
              value={value.birthplace}
              onChange={(event) => onChange({ ...value, birthplace: event.target.value })}
            >
              {cities.map((city) => (
                <option key={city.id} value={city.id}>{city.label}</option>
              ))}
            </select>
            <i aria-hidden="true">⌖</i>
          </label>
        </div>

        <button
          className={`xp-generate-button ultra-generate-button${calculating ? " loading" : ""}`}
          type="submit"
          disabled={calculating}
        >
          <span>{calculating ? "正在折叠时间" : "唤醒命运中枢"}</span>
          <b aria-hidden="true">
            {calculating ? "ORACLE SYNTHESIS / LIVE" : "CALCULATE & ENTER"}
          </b>
          <i aria-hidden="true">{calculating ? "◌" : "↗"}</i>
        </button>
      </form>

      {calculating ? (
        <>
          <motion.div
            className="ultra-calculation-state"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            role="status"
            aria-live="polite"
          >
            <span><i />校准经度与真太阳时</span>
            <span><i />重建四柱与五行力场</span>
            <span><i />等待 DeepSeek 节点意识回传</span>
          </motion.div>
          <button className="ultra-cancel-button" type="button" onClick={onCancel}>
            中止本次观测 / ABORT
          </button>
        </>
      ) : null}

      {error ? (
        <motion.p
          className="ultra-error-signal"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
        >
          <i aria-hidden="true" /> {error}
        </motion.p>
      ) : null}

      <footer>
        <span>SERVER-SIDE CALCULATION</span>
        <span>CHART-ONLY AI CONTEXT</span>
        <span>ULTRA / 01</span>
      </footer>
    </motion.section>
  );
}
