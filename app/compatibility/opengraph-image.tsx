import { ImageResponse } from "next/og";
export const alt = "DestinyPixel — Free love compatibility with Bazi and birth charts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(<div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "linear-gradient(120deg,#fff1ed,#f9dce5)", color: "#75454f", padding: "70px" }}><div style={{ display: "flex", fontSize: 25, letterSpacing: 3 }}>DESTINYPIXEL / COMPATIBILITY</div><div style={{ display: "flex", fontSize: 82, maxWidth: 930, marginTop: 65, lineHeight: 1.1 }}>Two hearts. Your kind of love.</div><div style={{ display: "flex", fontSize: 30, color: "#b65c72", marginTop: 45 }}>60 animal portraits · Five elements · Love compatibility</div></div>, size);
}
