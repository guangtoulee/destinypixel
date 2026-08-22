"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { DestinyCycle, DestinyProfile } from "@/app/xingpan/types";
import type { DestinyChart } from "@/lib/destinyCalculator";
import type { OracleResponse } from "../types";

type UltraDestinyHudProps = {
  profile: DestinyProfile;
  chart: DestinyChart;
  cycle: DestinyCycle;
  overview: string;
  meta: OracleResponse["meta"];
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

const pillarLabels = [
  ["year", "年柱"],
  ["month", "月柱"],
  ["day", "日柱"],
  ["hour", "时柱"],
] as const;

export function UltraDestinyHud({
  profile,
  chart,
  cycle,
  overview,
  meta,
  onSelect,
  onReset,
}: UltraDestinyHudProps) {
  const rail = useRef<HTMLElement>(null);

  useEffect(() => {
    const selected = rail.current?.querySelector<HTMLButtonElement>('[aria-current="step"]');
    if (!rail.current || !selected) return;
    rail.current.scrollTo({
      left: selected.offsetLeft - rail.current.clientWidth / 2 + selected.clientWidth / 2,
      behavior: "auto",
    });
  }, [cycle.id]);

  return (
    <motion.div
      className="xp-core-interface ultra-core-interface"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, delay: 0.15 }}
    >
      <motion.section
        className="xp-core-heading ultra-core-heading"
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <p><span /> ULTRA CORE / 命运意识</p>
        <h1>你的时间<br />拥有了声音</h1>
        <div className="xp-core-index ultra-core-index">
          <span>MAP ID / {chart.trueSolarTime.time} TRUE SOLAR</span>
          <b>{profile.id}</b>
        </div>

        <div className="ultra-pillar-grid" aria-label="四柱八字">
          {pillarLabels.map(([key, label]) => (
            <span key={key}>
              <small>{label}</small>
              <b>{chart.pillars[key].ganZhi}</b>
            </span>
          ))}
        </div>

        <p className="ultra-overview">{overview}</p>
      </motion.section>

      <motion.aside
        className="xp-insight-hud ultra-insight-hud"
        key={cycle.id}
        initial={{ opacity: 0, x: 32, filter: "blur(8px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        aria-live="polite"
      >
        <header>
          <div>
            <small>
              {cycle.isCurrent ? "CURRENT NODE" : "LIFECYCLE NODE"} / {cycle.decade}
            </small>
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
          <span>
            {meta.oracleSource === "deepseek" ? "DEEPSEEK NODE SIGNAL" : "LOCAL RESERVE SIGNAL"}
          </span>
          <b>{Math.round(cycle.intensity * 100).toString().padStart(2, "0")}%</b>
        </footer>
      </motion.aside>

      <motion.div
        className="xp-element-signature ultra-element-signature"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.6 }}
      >
        <small>WEIGHTED ELEMENT FIELD / 日主 {chart.dayMaster.stem}</small>
        <div>
          {elementLabels.map(([key, label]) => (
            <span key={key} title={`${label} ${profile.elements[key]}%`}>
              <i style={{ height: `${profile.elements[key]}%` }} />
              <b>{label}</b>
            </span>
          ))}
        </div>
      </motion.div>

      <nav ref={rail} className="xp-cycle-rail ultra-cycle-rail" aria-label="十年大运节点">
        {profile.cycles.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={`${item.id === cycle.id ? "active" : ""}${item.isCurrent ? " current" : ""}`}
            onClick={() => onSelect(item)}
            aria-label={`${item.decade} ${item.label}${item.isCurrent ? "，当前大运" : ""}`}
            aria-current={item.id === cycle.id ? "step" : undefined}
          >
            <i />
            <span>{String(index + 1).padStart(2, "0")}</span>
          </button>
        ))}
      </nav>

      <div className="ultra-ai-provenance" aria-label="解析来源">
        <i className={meta.oracleSource === "deepseek" ? "online" : "reserve"} />
        <span>{meta.oracleSource === "deepseek" ? "AI SOUL / ONLINE" : "AI SOUL / RESERVE"}</span>
        <small>{meta.model}</small>
      </div>

      <button type="button" className="xp-reset-button" onClick={onReset} aria-label="重新校准">
        <span>重新校准</span>
        <i aria-hidden="true">↺</i>
      </button>
    </motion.div>
  );
}
