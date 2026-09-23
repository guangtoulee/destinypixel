import assert from "node:assert/strict";
import test from "node:test";
import sitemap from "@/app/sitemap";
import { absoluteUrl } from "@/lib/seo";
import {
  getSeoGuide,
  seoGuideCtas,
  seoGuideFaqAnswerText,
  seoGuideFaqLinks,
  seoGuideFaqSchema,
  seoGuidePath,
} from "@/lib/seo-guides";

function guideHrefs(guide: NonNullable<ReturnType<typeof getSeoGuide>>) {
  return [
    seoGuidePath(guide),
    guide.cta.href,
    ...seoGuideCtas(guide).map((cta) => cta.href),
    ...guide.related.map((item) => item.href),
    ...guide.faqs.flatMap((faq) => seoGuideFaqLinks(faq).map((item) => item.href)),
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

test("Guanyin guide distinguishes the mixed source collection from a temple lookup", () => {
  const guide = getSeoGuide("learn", "guanyin-fortune-sticks");
  assert.ok(guide);
  assert.equal(
    guide.title,
    "Guanyin Fortune Sticks Online: How to Draw & Read | DestinyPixel",
  );
  assert.equal(
    guide.description,
    "Try an online Guanyin-inspired fortune-stick draw. Learn how to ask a question, read the source label and distinguish traditional verses from modern reflections.",
  );
  assert.equal(guide.h1, "Guanyin fortune sticks online: how to draw and read one");
  assert.equal(guide.faqAsH2, true);
  assert.match(guide.paragraphs.join(" "), /not a complete transcription/i);
  assert.match(guide.paragraphs.join(" "), /does not always contain a translation/i);
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
  assert.match(guide.faqs[4]!.answer, /original modern reflection/i);
  assert.match(guide.faqs[4]!.answer, /actual poem and named edition/i);
  const blob = JSON.stringify(guide);
  assert.doesNotMatch(blob, /\/ultra/i);
  assert.doesNotMatch(blob, /\$|USD|price|pricing/i);
  assert.ok(guideHrefs(guide).every((href) => !href.toLowerCase().includes("ultra")));
  assert.equal(seoGuideFaqSchema(guide).mainEntity.length, 6);
  assert.ok(
    sitemap().some((entry) => entry.url === absoluteUrl("/learn/guanyin-fortune-sticks")),
  );
});

test("BaZi compatibility guide states the implemented scope and editorial scoring", () => {
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
  assert.match(guide.paragraphs.join(" "), /not a complete traditional marriage assessment/i);
  assert.match(guide.paragraphs.join(" "), /original DestinyPixel interpretations/i);
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
  assert.match(guide.faqs[4]!.answer, /not extra numeric scoring factors/i);
  assert.match(guide.faqs[1]!.answer, /without letting AI set the scores/i);
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
  assert.match(guide.paragraphs[0]!, /combines three Tarot cards with a six-line, hexagram-inspired reading/);
  assert.doesNotMatch(guide.paragraphs[0]!, /not a deck of picture archetypes/);
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

test("Chinese vs Western palmistry learn page keeps Codex body, AEO structure, CTAs, and no Ultra links", () => {
  const guide = getSeoGuide("learn", "chinese-palm-reading-vs-western");
  assert.ok(guide);
  assert.equal(
    guide.title,
    "Chinese Palm Reading vs Western Palmistry (AI Guide) | DestinyPixel",
  );
  assert.equal(
    guide.description,
    "How Chinese hand reading differs from Western palmistry—and how to use DestinyPixel’s Palm Studio as a reflective AI guide, not a fate verdict.",
  );
  assert.equal(guide.h1, "Chinese Palm Reading vs Western Palmistry");
  assert.equal(guide.faqAsH2, true);
  assert.equal(guide.paragraphs.length, 3);
  assert.match(guide.paragraphs[0]!, /Western palmistry often emphasizes major lines and mounts/);
  assert.match(guide.paragraphs[0]!, /closer to physiognomy than to a single fate script/);
  assert.match(guide.paragraphs[1]!, /broken life line/);
  assert.match(guide.paragraphs[1]!, /AI does not receive or inspect the image/);
  assert.doesNotMatch(guide.paragraphs[1]!, /AI palm scan|hand you upload/i);
  assert.match(guide.paragraphs[2]!, /Pair it with BaZi when you want calendar timing/);
  assert.deepEqual(
    guide.faqs.map((faq) => faq.question),
    [
      "What’s the difference between Chinese palm reading and Western palmistry?",
      "What does an AI palm reading actually do (and not do)?",
      "Left or right hand—which to use?",
      "Do palm lines change?",
      "Is palm reading fortune-telling?",
      "When to pair palm with BaZi or I Ching?",
    ],
  );
  assert.equal(guide.faqs[2]?.answer, "Either can work; be consistent and note dominant hand.");
  assert.equal(guide.faqs[3]?.answer, "Yes—lines and tone are not frozen.");
  assert.equal(guide.faqs[4]?.answer, "Treat it as pattern talk, not a sealed destiny.");
  for (const faq of guide.faqs) {
    assert.ok(faq.answer.length > 0);
    assert.ok(faq.answer.split(/(?<=[.!?])\s+/).filter(Boolean).length <= 2);
  }
  assert.match(guide.faqs[1]!.answer, /reflective text from the details you confirm/i);
  assert.match(guide.faqs[1]!.answer, /does not see the photo, detect lines or diagnose/i);
  assert.deepEqual(
    seoGuideFaqLinks(guide.faqs[5]!).map((item) => item.href),
    [
      "/learn/what-is-bazi-birth-chart",
      "/insights/i-ching-vs-tarot",
      "/oracle",
    ],
  );
  const ctas = seoGuideCtas(guide);
  assert.equal(ctas[0]?.label, "Open Palm Studio");
  assert.equal(ctas[0]?.href, "/palm");
  assert.deepEqual(
    ctas.map((cta) => cta.href),
    ["/palm", "/face", "/learn"],
  );
  assert.equal(ctas[1]?.label, "Open Face studio");
  assert.ok(guide.disclaimer);
  assert.match(guide.disclaimer, /not a sealed destiny/i);
  assert.match(guide.disclaimer, /diagnos/i);
  assert.match(guide.disclaimer, /Hands change/i);
  assert.match(guide.disclaimer, /symbolic|reflective/i);
  assert.match(guide.disclaimer, /not medical, legal, or financial/i);
  assert.match(guide.disclaimer, /do not guarantee/i);
  const blob = JSON.stringify(guide);
  assert.doesNotMatch(blob, /\/ultra/i);
  assert.doesNotMatch(blob, /accuracy|success rate|\d+%/i);
  assert.ok(guide.related.some((item) => item.href === "/learn/what-is-bazi-birth-chart"));
  assert.ok(guide.related.some((item) => item.href === "/insights/i-ching-vs-tarot"));
  const baziBasics = getSeoGuide("learn", "what-is-bazi-birth-chart");
  assert.ok(baziBasics?.related.some((item) => item.href === "/learn/chinese-palm-reading-vs-western"));
  const iChing = getSeoGuide("insights", "i-ching-vs-tarot");
  assert.ok(iChing?.related.some((item) => item.href === "/learn/chinese-palm-reading-vs-western"));
  assert.ok(guideHrefs(guide).every((href) => !href.toLowerCase().includes("ultra")));
  assert.equal(seoGuideFaqSchema(guide).mainEntity.length, 6);
  assert.match(seoGuideFaqAnswerText(guide.faqs[5]!), /what-is-bazi-birth-chart/);
  assert.match(seoGuideFaqAnswerText(guide.faqs[5]!), /i-ching-vs-tarot/);
  assert.match(seoGuideFaqAnswerText(guide.faqs[5]!), /\/oracle/);
  assert.ok(
    sitemap().some((entry) => entry.url === absoluteUrl("/learn/chinese-palm-reading-vs-western")),
  );
});
