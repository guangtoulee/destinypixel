"use client";

import dynamic from "next/dynamic";

const CelestialLab = dynamic(
  () => import("./CelestialLab").then((module) => module.CelestialLab),
  {
    ssr: false,
    loading: () => (
      <main className="lab-loading" role="status" aria-live="polite">
        <div className="loading-orbit"><i /><i /><i /><b>戊</b></div>
        <span>DESTINY PIXEL / SPATIAL R&amp;D</span>
        <h1>天命合仪</h1>
        <p>INITIALIZING CELESTIAL ENGINE</p>
        <small>静态假数据 · 艺术映射 · 非预测或诊断</small>
      </main>
    ),
  },
);

export function ClientEntry() {
  return <CelestialLab />;
}
