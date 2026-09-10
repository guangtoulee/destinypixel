import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1"],
  serverExternalPackages: ["pdf-parse", "word-extractor"],
  images: {
    qualities: [75, 95],
  },
  async headers() {
    const securityHeaders = [
      { key: "Cache-Control", value: "private, no-store, max-age=0" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "same-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(self)",
      },
    ];

    return [
      { source: "/xiaoshou/:path*", headers: securityHeaders },
      { source: "/api/xiaoshou/:path*", headers: securityHeaders },
    ];
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
