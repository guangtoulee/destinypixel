"use client";

import type { ScenePhase } from "../../types";

const phaseLabels: Record<ScenePhase, string> = {
  void: "AWAITING ORIGIN",
  warp: "TIME WARP / CALIBRATING",
  core: "DESTINY CORE / ONLINE",
};

export function SystemChrome({ phase }: { phase: ScenePhase }) {
  return (
    <div className="xp-system-chrome" aria-hidden="true">
      <div className="xp-brand-lockup">
        <i><b /></i>
        <span>DESTINYPIXEL<small>命运像素研究所</small></span>
      </div>
      <div className="xp-phase-status">
        <i className={phase === "warp" ? "pulse" : ""} />
        <span>{phaseLabels[phase]}</span>
      </div>
      <div className="xp-coordinate-readout">
        <span>31.2304° N</span>
        <i />
        <span>121.4737° E</span>
      </div>
      <span className="xp-corner xp-corner-nw" />
      <span className="xp-corner xp-corner-ne" />
      <span className="xp-corner xp-corner-sw" />
      <span className="xp-corner xp-corner-se" />
      <div className="xp-side-code">甲 · 丙 · 戊 · 庚 · 壬 / 10 HEAVENLY STEMS</div>
    </div>
  );
}
