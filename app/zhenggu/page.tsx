import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "正骨三维解剖科普 | DestinyPixel",
  description:
    "骨骼、肌肉、肌腱、韧带与典型正骨部位的中文三维交互科普体验。",
};

export default function ZhengguPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#080b0c",
        overflow: "hidden",
      }}
    >
      <iframe
        title="正骨三维解剖科普"
        src="/zhenggu-assets/index.html"
        style={{
          display: "block",
          width: "100%",
          minHeight: "100vh",
          border: 0,
          background: "#080b0c",
        }}
      />
    </main>
  );
}
