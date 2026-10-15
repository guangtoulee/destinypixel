import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1"],
  serverExternalPackages: ["pdf-parse", "word-extractor"],
  images: {
    localPatterns: [
      { pathname: "/**", search: "" },
      { pathname: "/archetypes/*.jpg", search: "?v=20260914-new" },
    ],
    qualities: [75, 95],
  },
  async headers() {
    const noindex = [
      "/blender/:path*",
      "/ocean/:path*",
      "/report/:path*",
      "/account/:path*",
      "/admin/:path*",
      "/checkout/:path*",
      "/image",
      "/image/:path*",
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
      "/zhenggu",
      "/zhenggu/:path*",
      "/mazu",
      "/mazu/:path*",
      "/meizhouma",
      "/meizhouma/:path*",
      "/mv",
      "/mv/:path*",
      "/zhongyi2",
      "/zhongyi2/:path*",
    ];
    return noindex.map((source) => ({
      source,
      headers: [
        { key: "Referrer-Policy", value: ["/blender/:path*", "/ocean/:path*"].includes(source) ? "same-origin" : "no-referrer" },
        { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ...(["/blender/:path*", "/ocean/:path*"].includes(source) ? [
          { key: "Cache-Control", value: "private, no-store" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
        ] : []),
      ],
    }));
  },
  async redirects() {
    return [
      { source: "/black", destination: "/", permanent: true },
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
      { source: "/zhongyi2", destination: "/zhongyi2/index.html" },
    ];
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
