import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1"],
  serverExternalPackages: ["pdf-parse", "word-extractor"],
  images: {
    qualities: [75, 95],
  },
  async headers() {
    const noindex = [
      "/report/:path*",
      "/account/:path*",
      "/admin/:path*",
      "/checkout/:path*",
      "/english",
      "/english/:path*",
      "/danci",
      "/danci/:path*",
      "/xiaoshou",
      "/xiaoshou/:path*",
      "/prompt",
      "/prompt/:path*",
      "/juben",
      "/juben/:path*",
      "/daoyan",
      "/daoyan/:path*",
      "/black",
      "/black/:path*",
      "/zhenggu",
      "/zhenggu/:path*",
      "/mazu",
      "/mazu/:path*",
      "/meizhouma",
      "/meizhouma/:path*",
      "/mv",
      "/mv/:path*",
    ];
    return noindex.map((source) => ({
      source,
      headers: [
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "X-Robots-Tag", value: "noindex, nofollow" },
      ],
    }));
  },
  async redirects() {
    return [
      {
        source: "/candy",
        destination: "https://www.packom.store/whole",
        permanent: true,
      },
      {
        source: "/candy/:path*",
        destination: "https://www.packom.store/whole",
        permanent: true,
      },
      {
        source: "/jake",
        destination: "https://www.packom.store/jake",
        permanent: true,
      },
      {
        source: "/jake/:path*",
        destination: "https://www.packom.store/jake/:path*",
        permanent: true,
      },
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
