import type { MetadataRoute } from "next";
import { defaultSeoDescription } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DestinyPixel",
    short_name: "DestinyPixel",
    description: defaultSeoDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#fbf7ef",
    theme_color: "#c7ae80",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
