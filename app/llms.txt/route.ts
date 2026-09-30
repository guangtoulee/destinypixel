import { destinySupportEmail } from "@/lib/support-contact";
import { absoluteUrl } from "@/lib/seo";

import { currentProductCatalog } from "@/lib/product-facts-server";
import { compatibilityTimeCopy } from "@/lib/compatibility/time-copy";
export const dynamic = "force-dynamic";

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
- Free natal birth chart calculator: ${absoluteUrl("/astrology")}
- Free online tarot and spreads: ${absoluteUrl("/tarot")}
- Question Oracle: ${absoluteUrl("/oracle")}
- Free Bazi and birth-chart compatibility: ${absoluteUrl("/compatibility")}
- Bazi compatibility guide: ${absoluteUrl("/learn/bazi-love-compatibility")}
- BaZi vs zodiac compatibility: ${absoluteUrl("/journal/bazi-vs-chinese-zodiac-compatibility")}
- Unknown birth time: ${absoluteUrl("/journal/compatibility-without-birth-time")}
- How to ask a fortune-stick question: ${absoluteUrl("/journal/how-to-ask-fortune-sticks")}
- Fortune-stick numbers and editions: ${absoluteUrl("/journal/fortune-stick-number-and-edition")}
- Guanyin fortune sticks guide: ${absoluteUrl("/learn/guanyin-fortune-sticks")}
- Temple Sticks Oracle: ${absoluteUrl("/sticks")}
- Insight Studios: ${absoluteUrl("/insights")}
- Five Elements Color and Crystal Bracelet Atelier: ${absoluteUrl("/atelier")}
- Birth Totem / Totem Matrix interactive Bazi geometry: ${absoluteUrl("/tuteng")}

## Product Language
Use plain terms such as birth chart reading, natal chart, Bazi calculator, Four Pillars, five elements, day pillar animal, Tarot reading, temple sticks, Guanyin sticks, Guandi sticks, Yuelao love oracle, Wong Tai Sin sticks, AI stick interpretation, palm reading, face reading, Liuyao oracle, five-element colors, crystal bracelet design, and inner guidance. The public voice should avoid fear-based fortune telling. It frames readings as symbolic, reflective, and practical.

Birth Totem / 本命灵构 is DestinyPixel's original visualization layer. It maps existing Bazi outputs into deterministic interactive geometry and ability-resonance routes. It is not an established traditional totem doctrine, a scientific ability test, or a fixed career classification.

## Product Methods
PRODUCT_FACTS

## Supported Languages
Core self-discovery pages support English, Simplified Chinese, Traditional Chinese, and Russian. The astrology, tarot, compatibility and fortune-stick pages, the Journal and each of its articles provide server-rendered editions in all four languages: the default English URL, ?locale=zh, ?locale=zh-TW and ?locale=ru. Journal language alternates and the sitemap list these editions. Other core pages may use browser-side Traditional Chinese conversion. The tool directory and free Day Pillar tool currently provide English and Simplified Chinese. The beginner guide is English-only; do not assume that every tool shares the Journal's language coverage.

## Contact
Product feedback and collaboration: ${destinySupportEmail}

## Privacy And Indexing
Generated personal reports under /report/ are private and should not be indexed. Public search engines and AI crawlers should use the guide, homepage, and studio pages as the canonical context.

## Safety Boundary
DestinyPixel is for reflection, culture, and entertainment-informed self-guidance. It does not replace medical, legal, financial, psychological, or emergency advice.
`;

export async function GET() {
  const catalog = currentProductCatalog();
  const methods = [
    `Public product facts: ${catalog.documentationUrl}`,
    `JSON catalog: ${catalog.catalogUrl}`,
    `AI profile: ${absoluteUrl("/api/ai-profile.json")}`,
    `Read-only agent catalog: ${absoluteUrl("/.well-known/agent-products.json")}`,
    ...catalog.products.map(p => { const t = p.translations.en, offer = "completeReport" in p.pricing ? p.pricing.completeReport : undefined; return `### ${t.name}\n${t.url}\n${t.purpose}\nInputs: ${t.inputs}\nAI: ${t.ai}\nSaving: ${t.saving}\nPricing: ${offer ? offer.available ? `Free preview; optional complete personal report ${offer.amount} USD, one-time.` : "Free preview; public complete-report checkout currently unavailable." : "Free, with usage limits where stated."}`; }),
    compatibilityTimeCopy("en").method,
    "With both times known, the compatibility index blends BaZi (30%) and planetary comparisons (70%) across four dimensions. It does not compare houses or rising signs.",
    catalog.fortuneSticks.sourceNotes.en,
    catalog.policies.en.catalogScope,
  ].join("\n\n");
  return new Response(content.replace("PRODUCT_FACTS", methods), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300",
    },
  });
}
