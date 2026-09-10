export function SpatialLoadingIntro({ variant }: { variant: "xingpan" | "ultra" }) {
  const ultra = variant === "ultra";

  return (
    <main className="xp-static-loader" lang="zh-CN" style={{ padding: "32px 24px", letterSpacing: "normal", textAlign: "center" }}>
      <span style={{ fontSize: 11, letterSpacing: ".16em" }}>DESTINYPIXEL / 3D EXPERIENCE</span>
      <h1 style={{ margin: 0, color: "#e9edf7", fontSize: "clamp(24px, 5vw, 36px)", lineHeight: 1.3 }}>
        {ultra ? "Ultra 命运意识：四柱八字与人生时间线" : "命运中枢：八字与星盘的三维图谱"}
      </h1>
      <p style={{ maxWidth: 520, margin: 0, fontSize: 15, lineHeight: 1.8 }}>
        {ultra
          ? "输入出生时间和地点，以真太阳时与四柱八字为起点，探索大运节点和 AI 象征解读。"
          : "通过出生信息进入粒子星环与生命周期的交互体验，探索八字、动物原型与星盘的视觉表达。"}
      </p>
      <p role="status" style={{ margin: 0, fontSize: 12 }}>正在加载三维交互画面…</p>
      <nav aria-label="其他探索方式" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 20, fontSize: 14, color: "#e9edf7" }}>
        <a href="/tuteng?locale=zh" style={{ textDecoration: "underline" }}>先体验本命灵构</a>
        <a href="/tools?locale=zh" style={{ textDecoration: "underline" }}>查看全部工具</a>
      </nav>
    </main>
  );
}
