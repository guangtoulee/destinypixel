import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1"],
  serverExternalPackages: ["@napi-rs/canvas", "pdf-parse", "word-extractor"],
  outputFileTracingIncludes: {
    "/api/juben/extract": ["./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
