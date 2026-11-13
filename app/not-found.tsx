import Link from "next/link";
import { AmbientAstrolabe, AstrolabeEmblem } from "@/components/v2/site-chrome";

export default function NotFound() {
  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "clip",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        background:
          "radial-gradient(ellipse 65% 42% at 50% 18%, rgba(164, 134, 212, 0.16), transparent 65%), #fcfaf5",
        color: "#241d31",
        fontFamily: "var(--font-sans), sans-serif",
      }}
    >
      <AmbientAstrolabe tone="parchment" />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 580,
          width: "100%",
          padding: "40px 32px",
          borderRadius: 26,
          border: "1px solid rgba(181, 139, 71, 0.34)",
          background: "rgba(255, 253, 249, 0.9)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 24px 60px rgba(42, 29, 68, 0.1)",
          textAlign: "center",
        }}
      >
        <div style={{ display: "inline-flex", marginBottom: 16 }}>
          <AstrolabeEmblem />
        </div>
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: "#8a6222",
            textTransform: "uppercase",
          }}
        >
          404 · UNCHARTED FOLIO
        </p>
        <h1
          style={{
            margin: "0 0 12px",
            fontFamily: "Georgia, 'Noto Serif SC', serif",
            fontSize: "clamp(26px, 4vw, 34px)",
            fontWeight: 600,
            lineHeight: 1.25,
          }}
        >
          This page drifted beyond the star map
          <span style={{ display: "block", fontSize: "0.78em", marginTop: 6, color: "#574d68" }}>
            未找到该星历书页
          </span>
        </h1>
        <p style={{ margin: "0 0 26px", fontSize: 14.5, lineHeight: 1.75, color: "#5e546f" }}>
          Return to the DestinyPixel observatory or step directly into one of our core reading rooms.
          <br />
          你可以返回观星台首页，或直接前往下方的核心测算与问事空间。
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <Link
            href="/?locale=zh"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "11px 20px",
              borderRadius: 999,
              background: "linear-gradient(135deg, #4b3270, #6a4896)",
              color: "#fff",
              fontSize: 13.5,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            观星台首页 (中文) →
          </Link>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "11px 20px",
              borderRadius: 999,
              border: "1px solid rgba(114, 90, 148, 0.28)",
              background: "#fff",
              color: "#3b2c54",
              fontSize: 13.5,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Observatory Home (EN) →
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "8px 16px",
            marginTop: 22,
            paddingTop: 18,
            borderTop: "1px solid rgba(114, 90, 148, 0.14)",
            fontSize: 13,
          }}
        >
          <Link href="/discover?locale=zh" style={{ color: "#5d3e86", textDecoration: "none" }}>
            六十日柱
          </Link>
          <Link href="/tarot?locale=zh" style={{ color: "#5d3e86", textDecoration: "none" }}>
            山湖塔罗
          </Link>
          <Link href="/sticks?locale=zh" style={{ color: "#5d3e86", textDecoration: "none" }}>
            灵签问事
          </Link>
          <Link href="/iching?locale=zh" style={{ color: "#5d3e86", textDecoration: "none" }}>
            易经六爻
          </Link>
          <Link href="/astrology?locale=zh" style={{ color: "#5d3e86", textDecoration: "none" }}>
            本命星盘
          </Link>
        </div>
      </div>
    </main>
  );
}
