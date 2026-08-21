"use client";

import dynamic from "next/dynamic";

const XingpanExperience = dynamic(() => import("./components/XingpanExperience"), {
  ssr: false,
  loading: () => (
    <main className="xp-static-loader" aria-label="命运可视化正在加载">
      <div><i /><i /><i /></div>
      <span>LOADING DESTINY FIELD</span>
    </main>
  ),
});

export function ClientEntry() {
  return <XingpanExperience />;
}
