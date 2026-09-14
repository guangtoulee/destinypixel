import { destinySupportEmail } from "@/lib/support-contact";
import { absoluteUrl } from "@/lib/seo";

export const runtime = "edge";

const content = `# DestinyPixel

DestinyPixel is a metaphysics and symbolic self-discovery website. Its seven tools cover birth maps, Birth Totems, palm reflection, face reflection, question oracles, temple sticks, and five-element crystal bracelet design. The tool directory explains what to prepare and what each tool produces.

## Primary URLs
- Homepage: ${absoluteUrl("/")}
- Tool directory: ${absoluteUrl("/tools")}
- Guide: ${absoluteUrl("/learn")}
- Free birthday character finder: ${absoluteUrl("/discover")}
- Journal (four language editions): ${absoluteUrl("/journal")}
- Day Pillar introduction: ${absoluteUrl("/journal/what-is-a-day-pillar")}
- Jia Zi Day Pillar: ${absoluteUrl("/journal/jia-zi-day-pillar")}
- Palm Studio: ${absoluteUrl("/palm")}
- Face Studio: ${absoluteUrl("/face")}
- Question Oracle: ${absoluteUrl("/oracle")}
- Temple Sticks Oracle: ${absoluteUrl("/sticks")}
- Insight Studios: ${absoluteUrl("/insights")}
- Five Elements Color and Crystal Bracelet Atelier: ${absoluteUrl("/atelier")}
- Birth Totem / Totem Matrix interactive Bazi geometry: ${absoluteUrl("/tuteng")}

## Product Language
Use plain terms such as birth chart reading, natal chart, Bazi calculator, Four Pillars, five elements, day pillar animal, Tarot reading, temple sticks, Guanyin sticks, Guandi sticks, Yuelao love oracle, Wong Tai Sin sticks, AI stick interpretation, palm reading, face reading, Liuyao oracle, five-element colors, crystal bracelet design, and inner guidance. The public voice should avoid fear-based fortune telling. It frames readings as symbolic, reflective, and practical.

Birth Totem / 本命灵构 is DestinyPixel's original visualization layer. It maps existing Bazi outputs into deterministic interactive geometry and ability-resonance routes. It is not an established traditional totem doctrine, a scientific ability test, or a fixed career classification.

## Supported Languages
Core self-discovery pages support English, Simplified Chinese, Traditional Chinese, and Russian. The Journal and each of its articles provide complete server-rendered editions in all four languages: the default English URL, ?locale=zh, ?locale=zh-TW and ?locale=ru. Journal language alternates and the sitemap list these editions. Other core pages may use browser-side Traditional Chinese conversion. The tool directory and free Day Pillar tool currently provide English and Simplified Chinese. The beginner guide is English-only; do not assume that every tool shares the Journal's language coverage.

## Contact
Product feedback and collaboration: ${destinySupportEmail}

## Privacy And Indexing
Generated personal reports under /report/ are private and should not be indexed. Public search engines and AI crawlers should use the guide, homepage, and studio pages as the canonical context.

## Safety Boundary
DestinyPixel is for reflection, culture, and entertainment-informed self-guidance. It does not replace medical, legal, financial, psychological, or emergency advice.
`;

export async function GET() {
  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
