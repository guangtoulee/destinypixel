"use client";

import { motion } from "framer-motion";
import type { DestinyCycle, DestinyProfile } from "../../types";

type DestinyHudProps = {
  profile: DestinyProfile;
  cycle: DestinyCycle;
  onSelect: (cycle: DestinyCycle) => void;
  onReset: () => void;
};

const elementLabels = [
  ["wood", "木"],
  ["fire", "火"],
  ["earth", "土"],
  ["metal", "金"],
  ["water", "水"],
] as const;

export function DestinyHud({ profile, cycle, onSelect, onReset }: DestinyHudProps) {
  return (
    <motion.div
      className="xp-core-interface"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, delay: 0.15 }}
    >
      <motion.section
        className="xp-core-heading"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <p><span /> DESTINY CORE / 命运中枢</p>
        <h1>你的时间<br />正在发光</h1>
        <div className="xp-core-index">
          <span>MAP ID</span>
          <b>{profile.id}</b>
        </div>
      </motion.section>

      <motion.aside
        className="xp-insight-hud"
        key={cycle.id}
        initial={{ opacity: 0, x: 32, filter: "blur(8px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        aria-live="polite"
      >
        <header>
          <div>
            <small>ACTIVE NODE / {cycle.decade}</small>
            <h2>{cycle.label}</h2>
          </div>
          <b>{cycle.stemBranch}</b>
        </header>

        <div className="xp-hud-spectrum" aria-hidden="true">
          <i style={{ width: `${Math.round(cycle.intensity * 100)}%` }} />
        </div>

        <p>{cycle.insight}</p>
        <ul aria-label="阶段关键词">
          {cycle.keywords.map((keyword) => <li key={keyword}>{keyword}</li>)}
        </ul>
        <footer>
          <span>PSYCHOLOGICAL SIGNAL</span>
          <b>{Math.round(cycle.intensity * 100).toString().padStart(2, "0")}%</b>
        </footer>
      </motion.aside>

      <motion.div
        className="xp-element-signature"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.6 }}
      >
        <small>ELEMENTAL SIGNATURE</small>
        <div>
          {elementLabels.map(([key, label]) => (
            <span key={key} title={`${label} ${profile.elements[key]}%`}>
              <i style={{ height: `${profile.elements[key]}%` }} />
              <b>{label}</b>
            </span>
          ))}
        </div>
      </motion.div>

      <nav className="xp-cycle-rail" aria-label="十年大运节点">
        {profile.cycles.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={item.id === cycle.id ? "active" : ""}
            onClick={() => onSelect(item)}
            aria-label={`${item.decade} ${item.label}`}
            aria-current={item.id === cycle.id ? "step" : undefined}
          >
            <i />
            <span>{String(index + 1).padStart(2, "0")}</span>
          </button>
        ))}
      </nav>

      <button type="button" className="xp-reset-button" onClick={onReset} aria-label="重新校准">
        <span>重新校准</span>
        <i aria-hidden="true">↺</i>
      </button>
    </motion.div>
  );
}
