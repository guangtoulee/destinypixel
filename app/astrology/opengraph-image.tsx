import { ImageResponse } from "next/og";
export const alt =
  "DestinyPixel — Your personal sky: natal chart, rising sign, houses and aspects";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "linear-gradient(125deg,#fbf4e9,#ede7f6)",
          color: "#625171",
          padding: "62px",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: 630 }}>
          <div
            style={{
              display: "flex",
              fontSize: 19,
              letterSpacing: 3,
              color: "#a58a65",
            }}
          >
            DESTINYPIXEL / BIRTH CHART
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 67,
              lineHeight: 1.12,
              marginTop: 43,
            }}
          >
            Your whole sky. A new perspective.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              marginTop: 35,
              color: "#928099",
            }}
          >
            Sun · Moon · Rising · Houses · Aspects
          </div>
          <div style={{ display: "flex", fontSize: 20, marginTop: 28 }}>
            Free interactive natal chart
          </div>
        </div>
        <svg width="390" height="390" viewBox="0 0 400 400">
          <circle
            cx="200"
            cy="200"
            r="184"
            fill="#faf6f4"
            stroke="#b9a17e"
            strokeWidth="2"
          />
          <circle cx="200" cy="200" r="175" fill="none" stroke="#dacdbd" />
          <circle cx="200" cy="200" r="136" fill="none" stroke="#baa9c9" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * Math.PI) / 6;
            return (
              <line
                key={i}
                x1={200 + 138 * Math.cos(a)}
                y1={200 + 138 * Math.sin(a)}
                x2={200 + 173 * Math.cos(a)}
                y2={200 + 173 * Math.sin(a)}
                stroke="#b59dbe"
              />
            );
          })}
          <path
            d="M105 195L270 125L170 305L115 115L290 230Z"
            fill="none"
            stroke="#b298bd"
            strokeWidth="2"
          />
          <circle cx="200" cy="200" r="25" fill="#f4ebde" stroke="#bca078" />
          {[
            [105, 195],
            [270, 125],
            [170, 305],
            [115, 115],
            [290, 230],
          ].map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="11"
              fill="#c8b7d5"
              stroke="#fff8ed"
              strokeWidth="3"
            />
          ))}
        </svg>
      </div>
    ),
    size,
  );
}
