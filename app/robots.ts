import type { MetadataRoute } from "next";
import { absoluteUrl, siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/report/",
          "/work/",
          "/account",
          "/admin",
          "/checkout/",
          // Side/test apps — not main DestinyPixel product
          "/candy",
          "/candy/",
          "/jake",
          "/jake/",
          "/english",
          "/english/",
          "/danci",
          "/danci/",
          "/xiaoshou",
          "/xiaoshou/",
          "/prompt",
          "/prompt/",
          "/juben",
          "/juben/",
          "/daoyan",
          "/daoyan/",
          "/black",
          "/black/",
          "/zhenggu",
          "/zhenggu/",
          "/mazu",
          "/mazu/",
          "/meizhouma",
          "/meizhouma/",
          "/mv",
          "/mv/",
          "/jiankangbao",
          "/jiankangbao/",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteUrl,
  };
}
