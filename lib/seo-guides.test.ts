import assert from "node:assert/strict";
import test from "node:test";
import {
  getSeoGuide,
  seoGuideCtas,
  seoGuideFaqAnswerText,
  seoGuideFaqSchema,
  seoGuidePath,
} from "@/lib/seo-guides";

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
  const hrefs = [
    seoGuidePath(guide),
    guide.cta.href,
    ...ctas.map((cta) => cta.href),
    ...guide.related.map((item) => item.href),
    ...guide.faqs.flatMap((faq) => (faq.link ? [faq.link.href] : [])),
  ];
  assert.ok(hrefs.every((href) => !href.toLowerCase().includes("ultra")));
  const schema = seoGuideFaqSchema(guide);
  assert.equal(schema.mainEntity.length, 6);
  assert.match(seoGuideFaqAnswerText(guide.faqs[3]!), /prepare-birth-date-time-place/);
});
