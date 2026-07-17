import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1"],
  serverExternalPackages: ["pdf-parse"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
