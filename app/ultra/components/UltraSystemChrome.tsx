"use client";

import type { ScenePhase } from "@/app/xingpan/types";
import type { DestinyChart } from "@/lib/destinyCalculator";
import type { OracleRequestState } from "../types";

const phaseLabels: Record<ScenePhase, string> = {
  void: "AWAITING ORIGIN",
  warp: "TIME WARP / CALIBRATED",
  core: "ULTRA CORE / CONSCIOUS",
};

export function UltraSystemChrome({
  phase,
  requestState,
  chart,
}: {
  phase: ScenePhase;
  requestState: OracleRequestState;
  chart: DestinyChart | null;
}) {
  const status = requestState === "calculating"
    ? "ORACLE ENGINE / THINKING"
    : requestState === "error"
      ? "SIGNAL INTERRUPTED"
      : phaseLabels[phase];
  const latitude = chart?.city.latitude ?? 31.2304;
  const longitude = chart?.city.longitude ?? 121.4737;

  return (
    <div className="xp-system-chrome ultra-system-chrome" aria-hidden="true">
      <div className="xp-brand-lockup">
        <i><b /></i>
        <span>DESTINYPIXEL<small>ULTRA 命运意识系统</small></span>
      </div>
      <div className="xp-phase-status">
        <i className={phase === "warp" || requestState === "calculating" ? "pulse" : ""} />
        <span>{status}</span>
      </div>
      <div className="xp-coordinate-readout">
        <span>{Math.abs(latitude).toFixed(4)}° {latitude >= 0 ? "N" : "S"}</span>
        <i />
        <span>{Math.abs(longitude).toFixed(4)}° {longitude >= 0 ? "E" : "W"}</span>
      </div>
      <span className="xp-corner xp-corner-nw" />
      <span className="xp-corner xp-corner-ne" />
      <span className="xp-corner xp-corner-sw" />
      <span className="xp-corner xp-corner-se" />
      <div className="xp-side-code">TRUE SOLAR TIME / LUNAR JS / DEEPSEEK ORACLE</div>
    </div>
  );
}
