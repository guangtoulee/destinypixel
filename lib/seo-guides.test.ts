import assert from "node:assert/strict";
import test from "node:test";
import sitemap from "@/app/sitemap";
import { absoluteUrl } from "@/lib/seo";
import {
  getSeoGuide,
  seoGuideCtas,
  seoGuideFaqAnswerText,
  seoGuideFaqSchema,
  seoGuidePath,
} from "@/lib/seo-guides";

function guideHrefs(guide: NonNullable<ReturnType<typeof getSeoGuide>>) {
  return [
    seoGuidePath(guide),
    guide.cta.href,
    ...seoGuideCtas(guide).map((cta) => cta.href),
    ...guide.related.map((item) => item.href),
    ...guide.faqs.flatMap((faq) => (faq.link ? [faq.link.href] : [])),
    ...guide.paragraphs,
    guide.disclaimer ?? "",
  ];
}

test("BaZi learn page keeps AEO structure, tool CTAs, and no Ultra links", () => {
  const guide = getSeoGuide("learn", "what-is-bazi-birth-chart");
  assert.ok(guide);
  assert.equal(guide.title, "What Is a BaZi Birth Chart? Four Pillars Explained");
  assert.equal(
    guide.description,
    "BaZi (Four Pillars of Destiny) is a Chinese birth chart from year, month, day and hour. Learn what each pillar means—and try a free Day Pillar card or deeper tools.",
  );
  assert.equal(guide.h1, "What is a BaZi birth chart?");
  assert.equal(guide.faqAsH2, true);
  assert.deepEqual(
    guide.faqs.map((faq) => faq.question),
    [
      "What is BaZi / Four Pillars of Destiny?",
      "What is the day pillar?",
      "Do I need birth time?",
      "What is true solar time?",
      "BaZi vs Western natal chart?",
      "How do I try DestinyPixel free?",
    ],
  );
  const ctas = seoGuideCtas(guide);
  assert.deepEqual(
    ctas.map((cta) => cta.href),
    ["/day-pillar", "/tuteng", "/compatibility"],
  );
  assert.equal(ctas[0]?.label, "Free Day Pillar card");
  assert.match(ctas[2]?.note ?? "", /birth times/i);
  assert.equal(guide.faqs[3]?.link?.href, "/journal/prepare-birth-date-time-place");
  assert.ok(guide.disclaimer);
  assert.ok(guideHrefs(guide).every((href) => !href.toLowerCase().includes("ultra")));
  const schema = seoGuideFaqSchema(guide);
  assert.equal(schema.mainEntity.length, 6);
  assert.match(seoGuideFaqAnswerText(guide.faqs[3]!), /prepare-birth-date-time-place/);
});

test("Guanyin fortune sticks learn page is structure/meta/CTAs only, with no Ultra links", () => {
  const guide = getSeoGuide("learn", "guanyin-fortune-sticks");
  assert.ok(guide);
  assert.equal(
    guide.title,
    "Guanyin Fortune Sticks Online: How to Draw & Read | DestinyPixel",
  );
  assert.equal(
    guide.description,
    "What Guanyin fortune sticks are, which questions they suit, and how to draw or look up a stick online—then open DestinyPixel’s temple sticks tool.",
  );
  assert.equal(guide.h1, "Guanyin fortune sticks online: how to draw and read one");
  assert.equal(guide.faqAsH2, true);
  assert.equal(guide.paragraphs.length, 1);
  assert.ok(guide.paragraphs[0]!.split(/\s+/).length <= 60);
  assert.deepEqual(
    guide.faqs.map((faq) => faq.question),
    [
      "What are Guanyin fortune sticks?",
      "What questions suit Guanyin (vs Guandi / Yuelao / Wealth / Wong Tai Sin)?",
      "How do you draw one stick online?",
      "How should you read the result?",
      "Already drew a stick at a temple—can I look up the number?",
      "Is an online stick “the same” as a temple draw?",
    ],
  );
  for (const faq of guide.faqs) {
    assert.ok(faq.answer.length > 0);
    assert.ok(faq.answer.split(/(?<=[.!?])\s+/).filter(Boolean).length <= 2);
  }
  const ctas = seoGuideCtas(guide);
  assert.equal(ctas[0]?.label, "Draw Guanyin sticks");
  assert.equal(ctas[0]?.href, "/sticks?locale=en&type=guanyin");
  assert.deepEqual(
    ctas.map((cta) => cta.href),
    ["/sticks?locale=en&type=guanyin", "/tools", "/oracle"],
  );
  assert.match(ctas[2]?.note ?? "", /different tool/i);
  assert.ok(guide.disclaimer);
  assert.match(guide.disclaimer, /symbolic|reflective/i);
  assert.match(guide.disclaimer, /not medical, legal, or financial/i);
  assert.match(guide.disclaimer, /do not guarantee/i);
  const blob = JSON.stringify(guide);
  assert.doesNotMatch(blob, /\/ultra/i);
  assert.doesNotMatch(blob, /\$|USD|price|pricing/i);
  assert.ok(guideHrefs(guide).every((href) => !href.toLowerCase().includes("ultra")));
  assert.equal(seoGuideFaqSchema(guide).mainEntity.length, 6);
  assert.ok(
    sitemap().some((entry) => entry.url === absoluteUrl("/learn/guanyin-fortune-sticks")),
  );
});

test("BaZi love compatibility learn page is structure/meta/CTAs only, with no Ultra links", () => {
  const guide = getSeoGuide("learn", "bazi-love-compatibility");
  assert.ok(guide);
  assert.equal(
    guide.title,
    "BaZi Love Compatibility: How Four Pillars Compare Two People | DestinyPixel",
  );
  assert.equal(
    guide.description,
    "What BaZi love compatibility means, why birth times matter, and how DestinyPixel mixes BaZi with birth-chart dimensions—then try the free compare tool.",
  );
  assert.equal(guide.h1, "BaZi love compatibility: how two Four Pillars charts compare");
  assert.equal(guide.faqAsH2, true);
  assert.equal(guide.paragraphs.length, 1);
  assert.ok(guide.paragraphs[0]!.split(/\s+/).length <= 60);
  assert.deepEqual(
    guide.faqs.map((faq) => faq.question),
    [
      "What is BaZi love compatibility?",
      "What does DestinyPixel compare (personality / communication / affection / everyday rhythm)?",
      "Why do both people need known birth times?",
      "How should you read a 60–100 score?",
      "BaZi vs Western synastry—how this page’s tool mixes them",
      "What the tool does not do",
    ],
  );
  for (const faq of guide.faqs) {
    assert.ok(faq.answer.length > 0);
    assert.ok(faq.answer.split(/(?<=[.!?])\s+/).filter(Boolean).length <= 2);
  }
  const ctas = seoGuideCtas(guide);
  assert.equal(ctas[0]?.label, "Compare two charts free");
  assert.equal(ctas[0]?.href, "/compatibility");
  assert.deepEqual(
    ctas.map((cta) => cta.href),
    ["/compatibility", "/learn/what-is-bazi-birth-chart", "/day-pillar"],
  );
  assert.match(ctas[2]?.note ?? "", /two birth times/i);
  assert.equal(guide.faqs[2]?.link?.href, "/journal/prepare-birth-date-time-place");
  assert.match(guide.faqs[3]!.answer, /editorial index/i);
  assert.match(guide.faqs[3]!.answer, /not validated/i);
  assert.match(guide.faqs[4]!.answer, /30%/);
  assert.match(guide.faqs[4]!.answer, /70%/);
  assert.match(guide.faqs[5]!.answer, /rising|houses|marriage/i);
  assert.ok(guide.disclaimer);
  assert.match(guide.disclaimer, /symbolic|reflective/i);
  assert.match(guide.disclaimer, /not medical, legal, or financial/i);
  assert.match(guide.disclaimer, /do not guarantee/i);
  assert.doesNotMatch(guide.disclaimer, /meant to be/i);
  const blob = JSON.stringify(guide);
  assert.doesNotMatch(blob, /\/ultra/i);
  assert.ok(guide.related.some((item) => item.href === "/learn/what-is-bazi-birth-chart"));
  assert.ok(guide.related.some((item) => item.href === "/journal/prepare-birth-date-time-place"));
  assert.ok(guide.related.some((item) => item.href === "/tools"));
  const baziBasics = getSeoGuide("learn", "what-is-bazi-birth-chart");
  assert.ok(baziBasics?.related.some((item) => item.href === "/learn/bazi-love-compatibility"));
  assert.ok(guideHrefs(guide).every((href) => !href.toLowerCase().includes("ultra")));
  assert.equal(seoGuideFaqSchema(guide).mainEntity.length, 6);
  assert.match(seoGuideFaqAnswerText(guide.faqs[2]!), /prepare-birth-date-time-place/);
  assert.ok(
    sitemap().some((entry) => entry.url === absoluteUrl("/learn/bazi-love-compatibility")),
  );
});

test("I Ching vs Tarot insights page keeps Codex body, AEO structure, CTAs, and no Ultra links", () => {
  const guide = getSeoGuide("insights", "i-ching-vs-tarot");
  assert.ok(guide);
  assert.equal(
    guide.title,
    "I Ching vs Tarot: Which to Use for One Question? | DestinyPixel",
  );
  assert.equal(
    guide.description,
    "Tarot names feelings and motives; I Ching / liuyao frames tendency, obstacle, and timing. Pick one sincere question—then try DestinyPixel’s Question Oracle.",
  );
  assert.equal(guide.h1, "I Ching vs Tarot: Which to Use for One Question?");
  assert.equal(guide.faqAsH2, true);
  assert.equal(guide.paragraphs.length, 3);
  assert.match(guide.paragraphs[0]!, /Destiny Pixel’s oracle lane sits closer to the I Ching/);
  assert.match(guide.paragraphs[1]!, /courtroom verdict or a medical order/);
  assert.match(guide.paragraphs[2]!, /Asking the same question twice in one hour/);
  assert.deepEqual(
    guide.faqs.map((faq) => faq.question),
    [
      "What’s the difference between I Ching and tarot for one question?",
      "What is liuyao?",
      "When should I start with tarot vs I Ching?",
      "Can I ask yes/no?",
      "Should I ask the same question twice?",
      "How does DestinyPixel’s Question Oracle fit (Tarot + hexagram-inspired / liuyao-adjacent)?",
    ],
  );
  assert.equal(guide.faqs[1]?.answer, "A six-line I Ching method used for concrete situations.");
  assert.equal(guide.faqs[3]?.answer, "Better to ask “what supports / blocks this path?”");
  assert.equal(guide.faqs[4]?.answer, "Wait; change the angle only if the situation changed.");
  for (const faq of guide.faqs) {
    assert.ok(faq.answer.length > 0);
    assert.ok(faq.answer.split(/(?<=[.!?])\s+/).filter(Boolean).length <= 2);
  }
  assert.match(guide.faqs[5]!.answer, /Tarot/i);
  assert.match(guide.faqs[5]!.answer, /hexagram-inspired/i);
  assert.match(guide.faqs[5]!.answer, /liuyao-adjacent/i);
  assert.match(guide.faqs[5]!.answer, /three-card Tarot mirror/i);
  const ctas = seoGuideCtas(guide);
  assert.equal(ctas[0]?.label, "Ask one question in the Oracle");
  assert.equal(ctas[0]?.href, "/oracle");
  assert.deepEqual(
    ctas.map((cta) => cta.href),
    ["/oracle", "/sticks", "/insights"],
  );
  assert.match(ctas[1]?.note ?? "", /different ritual lane/i);
  assert.ok(guide.disclaimer);
  assert.match(guide.disclaimer, /courtroom|medical/i);
  assert.match(guide.disclaimer, /symbolic|reflective/i);
  assert.match(guide.disclaimer, /not medical, legal, or financial/i);
  assert.match(guide.disclaimer, /do not guarantee/i);
  const blob = JSON.stringify(guide);
  assert.doesNotMatch(blob, /\/ultra/i);
  assert.doesNotMatch(blob, /accuracy|success rate|\d+%/i);
  assert.ok(guideHrefs(guide).every((href) => !href.toLowerCase().includes("ultra")));
  assert.equal(seoGuideFaqSchema(guide).mainEntity.length, 6);
  assert.ok(
    sitemap().some((entry) => entry.url === absoluteUrl("/insights/i-ching-vs-tarot")),
  );
});
