import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1"],
  serverExternalPackages: ["pdf-parse", "word-extractor"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
