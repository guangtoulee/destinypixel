"use client";

import dynamic from "next/dynamic";

const UltraExperience = dynamic(() => import("./components/UltraExperience"), {
  ssr: false,
  loading: () => (
    <main className="xp-static-loader" aria-label="Ultra 命运意识正在加载">
      <div><i /><i /><i /></div>
      <span>LOADING ULTRA DESTINY FIELD</span>
    </main>
  ),
});

export function ClientEntry() {
  return <UltraExperience />;
}
