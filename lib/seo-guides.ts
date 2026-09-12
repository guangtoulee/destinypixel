export type SeoGuideFaq = { question: string; answer: string };

export type SeoGuide = {
  section: "learn" | "insights";
  slug: string;
  title: string;
  description: string;
  h1: string;
  paragraphs: string[];
  faqs: SeoGuideFaq[];
  cta: { label: string; href: string };
  related: { label: string; href: string }[];
};

export const seoGuides: SeoGuide[] = [
  {
    section: "learn",
    slug: "what-is-bazi-birth-chart",
    title: "What Is a BaZi Birth Chart? Four Pillars Explained",
    description:
      "A BaZi birth chart (Four Pillars of Destiny) maps year, month, day, and hour. Learn what a Day Master is—and what BaZi cannot promise.",
    h1: "What Is a BaZi Birth Chart?",
    paragraphs: [
      "A BaZi birth chart—also called the Four Pillars of Destiny—is a classical Chinese way of reading time of birth. It is often labeled “Chinese astrology,” but it does not work like a Western sun-sign horoscope. BaZi builds four pillars from the calendar: year, month, day, and hour. Each pillar pairs a Heavenly Stem and an Earthly Branch.",
      "The day pillar’s stem is your Day Master—the reference point for strength, useful elements, and how other pillars relate to you. A full reading usually needs birth date and birth time; without the hour, the day pillar still helps, but the hour pillar and some timing calls stay incomplete.",
      "BaZi is better at patterns over years—work seasons, relationship themes, pressure cycles—than at naming a single “lucky number.” It cannot replace medical, legal, or financial advice, and it should not be sold as a fixed fate stamp.",
    ],
    faqs: [
      {
        question: "Is BaZi Chinese astrology?",
        answer:
          "Closest English label, yes—but the method is Four Pillars, not sun-sign traits alone.",
      },
      {
        question: "Do I need birth time?",
        answer: "Strongly preferred for a full chart.",
      },
      {
        question: "BaZi vs Western natal chart?",
        answer:
          "BaZi uses Chinese calendar pillars; Western charts use planets and houses.",
      },
    ],
    cta: { label: "Try a BaZi / day-pillar reading", href: "/day-pillar" },
    related: [
      { label: "I Ching vs Tarot", href: "/insights/i-ching-vs-tarot" },
      {
        label: "Chinese vs Western palmistry",
        href: "/learn/chinese-palm-reading-vs-western",
      },
    ],
  },
  {
    section: "insights",
    slug: "i-ching-vs-tarot",
    title: "I Ching vs Tarot: Which to Use for One Question?",
    description:
      "I Ching (and liuyao) vs tarot for one clear question—timing and structure versus imagery. When to use each, and what neither can promise. Explore Destiny Pixel oracle.",
    h1: "I Ching vs Tarot: Which to Use for One Question?",
    paragraphs: [
      "For one clear question, people often reach for tarot or the I Ching. Destiny Pixel’s oracle lane sits closer to the I Ching / liuyao tradition: hexagrams, changing lines, and how a situation is structured in time—not a deck of picture archetypes.",
      "Tarot shines when you need language for feelings, motives, and the story you are telling yourself. I Ching / liuyao shines when you care about tendency, obstacle, and rough timing (“push now / wait”). Both work best as one sincere question; neither should be treated as a courtroom verdict or a medical order.",
      "If you already know the emotion and need a decision frame, start with I Ching. If you need to name what you feel before you choose, start with tarot. Asking the same question twice in one hour usually adds noise, not clarity.",
    ],
    faqs: [
      {
        question: "What is liuyao?",
        answer: "A six-line I Ching method used for concrete situations.",
      },
      {
        question: "Can I ask yes/no?",
        answer: "Better to ask “what supports / blocks this path?”",
      },
      {
        question: "Same question twice?",
        answer: "Wait; change the angle only if the situation changed.",
      },
    ],
    cta: { label: "Ask one question in the oracle studio", href: "/oracle" },
    related: [
      {
        label: "What is a BaZi birth chart",
        href: "/learn/what-is-bazi-birth-chart",
      },
      {
        label: "Chinese vs Western palmistry",
        href: "/learn/chinese-palm-reading-vs-western",
      },
    ],
  },
  {
    section: "learn",
    slug: "chinese-palm-reading-vs-western",
    title: "Chinese Palm Reading vs Western Palmistry (AI Guide)",
    description:
      "Chinese palm reading and Western palmistry both study the hand—but not the same way. What AI palm scans can help with, and what they should never claim.",
    h1: "Chinese Palm Reading vs Western Palmistry",
    paragraphs: [
      "Chinese palm reading and Western palmistry both look at the hand, yet they grew from different libraries. Western palmistry often emphasizes major lines and mounts as character and life-theme symbols. Chinese hand reading more often folds palm shape, color, and line changes into a broader “look at the person in time” habit—closer to physiognomy than to a single fate script.",
      "An AI palm scan is useful for describing visible structure and comparing trends under decent light. It is not a license to scare anyone with “broken life line” myths. Hands change with labor, health, and age; which hand you upload matters less than honest lighting and a clear question.",
      "Use palm reading as a mirror for habits and tendencies. Pair it with BaZi when you want calendar timing, or with I Ching when you have one decision on the table.",
    ],
    faqs: [
      {
        question: "Left or right hand?",
        answer: "Either can work; be consistent and note dominant hand.",
      },
      {
        question: "Does the palm change?",
        answer: "Yes—lines and tone are not frozen.",
      },
      {
        question: "Is it fortune-telling?",
        answer: "Treat it as pattern talk, not a sealed destiny.",
      },
    ],
    cta: { label: "Try Chinese palm reading in the palm studio", href: "/palm" },
    related: [
      {
        label: "What is a BaZi birth chart",
        href: "/learn/what-is-bazi-birth-chart",
      },
      { label: "I Ching vs Tarot", href: "/insights/i-ching-vs-tarot" },
    ],
  },
];

export function getSeoGuide(section: SeoGuide["section"], slug: string) {
  return seoGuides.find((guide) => guide.section === section && guide.slug === slug);
}

export function seoGuidesFor(section: SeoGuide["section"]) {
  return seoGuides.filter((guide) => guide.section === section);
}

export function seoGuidePath(guide: SeoGuide) {
  return `/${guide.section}/${guide.slug}`;
}

export function seoGuideFaqSchema(guide: SeoGuide) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
