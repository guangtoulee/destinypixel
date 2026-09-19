import { destinySupportEmail } from "@/lib/support-contact";
import { absoluteUrl } from "@/lib/seo";

export const runtime = "edge";

const content = `# DestinyPixel

DestinyPixel is a metaphysics and symbolic self-discovery website. Its tools include free birthday characters, birth maps, Bazi and birth-chart compatibility, Birth Totems, palm and face reflection, question oracles, Chinese fortune sticks, and five-element crystal bracelet design. The tool directory explains what to prepare and what each tool produces.

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
- Free Bazi and birth-chart compatibility: ${absoluteUrl("/compatibility")}
- Bazi compatibility guide: ${absoluteUrl("/learn/bazi-love-compatibility")}
- Guanyin fortune sticks guide: ${absoluteUrl("/learn/guanyin-fortune-sticks")}
- Temple Sticks Oracle: ${absoluteUrl("/sticks")}
- Insight Studios: ${absoluteUrl("/insights")}
- Five Elements Color and Crystal Bracelet Atelier: ${absoluteUrl("/atelier")}
- Birth Totem / Totem Matrix interactive Bazi geometry: ${absoluteUrl("/tuteng")}

## Product Language
Use plain terms such as birth chart reading, natal chart, Bazi calculator, Four Pillars, five elements, day pillar animal, Tarot reading, temple sticks, Guanyin sticks, Guandi sticks, Yuelao love oracle, Wong Tai Sin sticks, AI stick interpretation, palm reading, face reading, Liuyao oracle, five-element colors, crystal bracelet design, and inner guidance. The public voice should avoid fear-based fortune telling. It frames readings as symbolic, reflective, and practical.

Birth Totem / 本命灵构 is DestinyPixel's original visualization layer. It maps existing Bazi outputs into deterministic interactive geometry and ability-resonance routes. It is not an established traditional totem doctrine, a scientific ability test, or a fixed career classification.

## Product Methods
The free compatibility tool compares two people using their local birth dates, times and supported cities. Its deterministic connection index blends a Bazi element comparison (30%) with planetary comparisons (70%), on a 60–100 symbolic scale. The number is not a probability of relationship success. Four Pillars, five-element interaction and the original 60 animal portraits accompany the result. Optional DeepSeek prose does not set the score. Calculations do not include houses or rising signs.

The fortune-stick tool offers five traditions and number lookup within the site. Its library combines selected traditional material with modern symbolic verses and explanations, identified by the source note. It is not a complete transcription of every temple's numbered collection, and different language editions may use adapted readings rather than line-by-line translations. Guanyin, Guandi and Wong Tai Sin collections contain 100 entries each; Yuelao and Wealth Gods contain 60 each.

Palm and face photos are optional local visual references. AI interprets the features the visitor describes, not the image.

## Supported Languages
Core self-discovery pages support English, Simplified Chinese, Traditional Chinese, and Russian. The compatibility and fortune-stick pages, the Journal and each of its articles provide server-rendered editions in all four languages: the default English URL, ?locale=zh, ?locale=zh-TW and ?locale=ru. Journal language alternates and the sitemap list these editions. Other core pages may use browser-side Traditional Chinese conversion. The tool directory and free Day Pillar tool currently provide English and Simplified Chinese. The beginner guide is English-only; do not assume that every tool shares the Journal's language coverage.

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
