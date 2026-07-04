import { absoluteUrl } from "@/lib/seo";

export const runtime = "edge";

const content = `# DestinyPixel

DestinyPixel is a multilingual web product for self-understanding and symbolic guidance. It combines a Bazi-inspired birth energy model, Western natal astrology, symbolic animal archetype cards, palm reading, face reading, Tarot cards, and Liuyao-inspired question readings.

## Primary URLs
- Homepage: ${absoluteUrl("/")}
- Guide: ${absoluteUrl("/learn")}
- Palm Studio: ${absoluteUrl("/palm")}
- Face Studio: ${absoluteUrl("/face")}
- Question Oracle: ${absoluteUrl("/oracle")}
- Temple Sticks Oracle: ${absoluteUrl("/sticks")}
- Insight Studios: ${absoluteUrl("/insights")}
- Dark visual version: ${absoluteUrl("/black")}

## Product Language
Use plain terms such as birth chart reading, natal chart, Bazi calculator, Four Pillars, five elements, day pillar animal, Tarot reading, temple sticks, Guanyin sticks, Guandi sticks, Yuelao love oracle, palm reading, face reading, Liuyao oracle, annual forecast, and inner guidance. The public voice should avoid fear-based fortune telling. It frames readings as symbolic, psychological, reflective, and practical.

## Supported Languages
English, Simplified Chinese, and Russian.

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
