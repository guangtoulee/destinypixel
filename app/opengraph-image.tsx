import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "DestinyPixel multidimensional birth map";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #fbf7ef 0%, #f2d8cf 38%, #dbecef 72%, #f7efe0 100%)",
          color: "#302727",
          fontFamily: "Georgia, Times New Roman, serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 18% 24%, rgba(205, 176, 116, 0.34), transparent 28%), radial-gradient(circle at 78% 32%, rgba(137, 186, 183, 0.34), transparent 32%), radial-gradient(circle at 54% 82%, rgba(211, 174, 198, 0.28), transparent 30%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(48,39,39,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(48,39,39,0.05) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "760px",
            paddingLeft: "82px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "34px",
              fontFamily: "Arial, sans-serif",
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "999px",
                background:
                  "radial-gradient(circle at 38% 38%, #fff8d8 0 22%, #ccb17c 24% 44%, #b9d7dc 46% 100%)",
              }}
            />
            DestinyPixel
          </div>
          <div
            style={{
              fontSize: "76px",
              lineHeight: 0.94,
              letterSpacing: 0,
              maxWidth: "680px",
            }}
          >
            Your birth moment, translated into an inner map.
          </div>
          <div
            style={{
              marginTop: "34px",
              fontFamily: "Arial, sans-serif",
              fontSize: "25px",
              lineHeight: 1.45,
              color: "#756a62",
              maxWidth: "650px",
            }}
          >
            Bazi archetypes · natal astrology · Tarot · palm and face readings
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            right: "76px",
            top: "86px",
            width: "300px",
            height: "420px",
            display: "flex",
            borderRadius: "34px",
            border: "16px solid rgba(255,255,255,0.72)",
            background:
              "linear-gradient(160deg, rgba(103,151,159,0.82), rgba(255,250,238,0.78) 42%, rgba(198,166,108,0.82))",
            boxShadow: "0 34px 80px rgba(86,72,56,0.22)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "28px",
              borderRadius: "26px",
              border: "2px solid rgba(255,255,255,0.72)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "34px",
              right: "34px",
              bottom: "50px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              fontFamily: "Arial, sans-serif",
            }}
          >
            <span style={{ fontSize: "18px", color: "#9b7846", fontWeight: 700 }}>
              60 ARCHETYPES
            </span>
            <strong style={{ fontSize: "36px", color: "#302727" }}>
              Inner Guidance
            </strong>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
