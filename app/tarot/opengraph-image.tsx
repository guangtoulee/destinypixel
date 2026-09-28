import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
export const runtime = "nodejs";
export const alt =
  "DestinyPixel — Interactive tarot: shuffle, choose and reveal your own cards";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image() {
  const files = await Promise.all(
    ["star", "sun"].map(
      async (id) =>
        `data:image/jpeg;base64,${(await readFile(path.join(process.cwd(), "public/tarot/social", `${id}.jpg`))).toString("base64")}`,
    ),
  );
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "linear-gradient(120deg,#fbf4eb,#eee1f1)",
          color: "#705878",
          padding: "64px",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 650 }}>
          <div
            style={{
              display: "flex",
              fontSize: 19,
              letterSpacing: 3,
              color: "#a0876b",
            }}
          >
            DESTINYPIXEL / TAROT STUDIO
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              lineHeight: 1.1,
              marginTop: 42,
            }}
          >
            Your question. Your cards.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              marginTop: 35,
              color: "#99829f",
            }}
          >
            Shuffle · Choose · Arrange · Reveal
          </div>
          <div style={{ display: "flex", fontSize: 20, marginTop: 28 }}>
            78 cards. Your own way to read.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            position: "relative",
            width: 350,
            height: 410,
          }}
        >
          {files.map((src, i) => (
            <img
              key={i}
              src={src}
              width={205}
              height={352}
              style={{
                position: "absolute",
                left: i ? 135 : 0,
                top: i ? 45 : 5,
                borderRadius: 13,
                transform: `rotate(${i ? 12 : -12}deg)`,
              }}
            />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
