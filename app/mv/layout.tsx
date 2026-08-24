import type { Metadata } from "next";
import Link from "next/link";
import "./mv.css";

export const metadata: Metadata = {
  title: "AI Singer Studio",
  description: "RTX 4090 安全中继驱动的 AI 歌手视频创作台",
  alternates: { canonical: "/mv" },
  robots: { index: false, follow: false },
};

export default function MvLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mvApp">
      <header className="topbar">
        <Link className="brand" href="/mv">
          <span className="brandMark">AS</span>
          <span>
            <strong>AI Singer Studio</strong>
            <small>RTX 4090 · LOCAL PRODUCTION</small>
          </span>
        </Link>
        <div className="systemPill">
          <span className="liveDot" /> SECURE GPU RELAY
        </div>
      </header>
      {children}
    </div>
  );
}
