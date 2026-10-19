import { ImageResponse } from "next/og";

export const alt = "DestinyPixel · 2027 Year Ahead · Bazi & Astrology";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", position: "relative", display: "flex", overflow: "hidden", background: "linear-gradient(130deg, #102e29, #213f36 65%, #405044)", color: "#f4eddb", fontFamily: "Georgia, serif" }}>
    <div style={{ position: "absolute", top: -180, right: -155, width: 750, height: 750, borderRadius: "50%", border: "1px solid #b99a69", display: "flex", opacity: .5 }} />
    <div style={{ position: "absolute", top: -100, right: -75, width: 590, height: 590, borderRadius: "50%", border: "1px solid #b99a69", display: "flex", opacity: .45 }} />
    <div style={{ position: "absolute", top: -20, right: 5, width: 430, height: 430, borderRadius: "50%", border: "1px solid #b99a69", display: "flex", opacity: .4 }} />
    <div style={{ position: "absolute", top: 260, right: 30, width: 30, height: 30, borderRadius: "50%", background: "#d9bc7e", display: "flex" }} />
    <div style={{ position: "absolute", top: 100, right: 425, width: 10, height: 10, borderRadius: "50%", background: "#e1c79c", display: "flex" }} />
    <div style={{ position: "absolute", bottom: 45, right: 200, width: 7, height: 7, borderRadius: "50%", background: "#d9bc7e", display: "flex" }} />
    <div style={{ display: "flex", flexDirection: "column", padding: "58px 76px", width: "100%" }}>
      <div style={{ fontSize: 24, fontFamily: "Arial, sans-serif", letterSpacing: 2, color: "#ddc8a2" }}>DestinyPixel</div>
      <div style={{ fontSize: 168, lineHeight: 1.08, letterSpacing: -6, marginTop: 40 }}>2027</div>
      <div style={{ fontSize: 51, lineHeight: 1.2, marginTop: 4 }}>Your year, with perspective.</div>
      <div style={{ fontSize: 22, fontFamily: "Arial, sans-serif", letterSpacing: 2, color: "#d2c8b9", marginTop: 34 }}>BAZI · ASTROLOGY · PERSONAL REFLECTION</div>
      <div style={{ fontSize: 18, fontFamily: "Arial, sans-serif", color: "#b2c0ae", marginTop: 23 }}>JANUARY—DECEMBER · FREE · NO ACCOUNT</div>
    </div>
  </div>, size);
}
