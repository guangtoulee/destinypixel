import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1"],
  serverExternalPackages: ["pdf-parse", "word-extractor"],
  images: {
    qualities: [75, 95],
  },
  async rewrites() {
    return [
      {
        source: "/jiankangbao",
        destination:
          "https://zhuangli-jiankangbao.anyulee.chatgpt.site/jiankangbao/",
      },
      {
        source: "/jiankangbao/:path*",
        destination:
          "https://zhuangli-jiankangbao.anyulee.chatgpt.site/jiankangbao/:path*",
      },
    ];
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
