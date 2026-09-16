import { ImageResponse } from "next/og";
export const alt = "DestinyPixel — Free love compatibility with Bazi and birth charts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(<div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: "linear-gradient(120deg,#fdf7ff,#eefbff)", color: "#272653", padding: "70px" }}><div style={{ display: "flex", fontSize: 25, letterSpacing: 3 }}>DESTINYPIXEL / COMPATIBILITY</div><div style={{ display: "flex", fontSize: 82, maxWidth: 930, marginTop: 65, lineHeight: 1.1 }}>What happens when your worlds meet?</div><div style={{ display: "flex", fontSize: 30, color: "#6951c9", marginTop: 45 }}>Bazi + birth charts · Free relationship insights</div></div>, size);
}
