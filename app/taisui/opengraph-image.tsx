import { ImageResponse } from "next/og";

export const alt = "Tai Sui Peace · A little light, a wish for yourself · DestinyPixel";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", background: "#16382e", color: "#f2e7cd", padding: "64px 80px", alignItems: "center", justifyContent: "space-between" }}>
    <div style={{ display: "flex", flexDirection: "column", width: 720 }}><div style={{ display: "flex", fontSize: 22, color: "#d6bd83", letterSpacing: 5 }}>DESTINYPIXEL · TAI SUI PEACE</div><div style={{ display: "flex", fontSize: 77, marginTop: 48, lineHeight: 1.15 }}>A little light.</div><div style={{ display: "flex", fontSize: 65, marginTop: 8, lineHeight: 1.15 }}>A wish for peace.</div><div style={{ display: "flex", fontSize: 24, marginTop: 40, color: "#cbd2be" }}>A free moment, just for you.</div></div>
    <svg width="240" height="380" viewBox="0 0 240 380"><circle cx="120" cy="178" r="114" fill="none" stroke="#cdb47a" opacity=".3" /><path d="M104 53c0-19 32-19 32 0" fill="none" stroke="#e2c78c" strokeWidth="4" /><path d="M72 89h96l12 200H60z" fill="#e6c988" fillOpacity=".13" stroke="#d1b273" strokeWidth="2" /><path d="M47 89c28-7 49-22 58-40h30c9 18 30 33 58 40z" fill="#d5b678" /><path d="M120 145c-4 22-24 39-24 59a24 24 0 0 0 48 0c0-20-14-37-24-59z" fill="#ffe0a0" /><path d="M105 242h30v22h-30z" fill="#e0c183" /><path d="M53 289h134l-9 16H62zM73 305h94v16H73zM83 321h74l13 20H70zM57 341h126v12H57z" fill="#d5b678" /></svg>
  </div>, size);
}
