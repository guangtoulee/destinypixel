export type SeoGuideLink = { label: string; href: string; note?: string };

export type SeoGuideFaq = {
  question: string;
  answer: string;
  link?: SeoGuideLink;
};

export type SeoGuide = {
  section: "learn" | "insights";
  slug: string;
  title: string;
  description: string;
  h1: string;
  paragraphs: string[];
  faqs: SeoGuideFaq[];
  /** Render each FAQ as an H2 + answer (AEO), instead of a single FAQ list. */
  faqAsH2?: boolean;
  cta: SeoGuideLink;
  ctas?: SeoGuideLink[];
  disclaimer?: string;
  related: SeoGuideLink[];
};

export const seoGuides: SeoGuide[] = [
  {
    section: "learn",
    slug: "what-is-bazi-birth-chart",
    title: "What Is a BaZi Birth Chart? Four Pillars Explained",
    description:
      "BaZi (Four Pillars of Destiny) is a Chinese birth chart from year, month, day and hour. Learn what each pillar means—and try a free Day Pillar card or deeper tools.",
    h1: "What is a BaZi birth chart?",
    paragraphs: [
      "A BaZi birth chart—also called the Four Pillars of Destiny—is a classical Chinese way of reading time of birth. It is often labeled “Chinese astrology,” but it does not work like a Western sun-sign horoscope. BaZi builds four pillars from the calendar: year, month, day, and hour. Each pillar pairs a Heavenly Stem and an Earthly Branch.",
      "The day pillar’s stem is your Day Master—the reference point for strength, useful elements, and how other pillars relate to you. A full reading usually needs birth date and birth time; without the hour, the day pillar still helps, but the hour pillar and some timing calls stay incomplete.",
      "BaZi is better at patterns over years—work seasons, relationship themes, pressure cycles—than at naming a single “lucky number.” It cannot replace medical, legal, or financial advice, and it should not be sold as a fixed fate stamp.",
    ],
    faqAsH2: true,
    faqs: [
      {
        question: "What is BaZi / Four Pillars of Destiny?",
        answer:
          "A BaZi birth chart—also called the Four Pillars of Destiny—is a classical Chinese way of reading time of birth. BaZi builds four pillars from the calendar: year, month, day, and hour.",
      },
      {
        question: "What is the day pillar?",
        answer:
          "The day pillar’s stem is your Day Master—the reference point for strength, useful elements, and how other pillars relate to you.",
      },
      {
        question: "Do I need birth time?",
        answer:
          "Strongly preferred for a full chart. Without the hour, the day pillar still helps, but the hour pillar and some timing calls stay incomplete.",
      },
      {
        question: "What is true solar time?",
        answer:
          "True solar time is a birth-place clock correction, not the civil time on a birth record.",
        link: {
          label: "Prepare birth date, time and place",
          href: "/journal/prepare-birth-date-time-place",
        },
      },
      {
        question: "BaZi vs Western natal chart?",
        answer:
          "BaZi uses Chinese calendar pillars; Western charts use planets and houses. It does not work like a Western sun-sign horoscope.",
      },
      {
        question: "How do I try DestinyPixel free?",
        answer:
          "Start with a free Day Pillar card. Open Birth Totem for a visual chart, or love compatibility when two people both have birth times.",
      },
    ],
    cta: { label: "Free Day Pillar card", href: "/day-pillar" },
    ctas: [
      { label: "Free Day Pillar card", href: "/day-pillar" },
      { label: "Birth Totem", href: "/tuteng" },
      {
        label: "Love compatibility",
        href: "/compatibility",
        note: "Both people need birth times.",
      },
    ],
    disclaimer:
      "It cannot replace medical, legal, or financial advice, and it should not be sold as a fixed fate stamp.",
    related: [
      {
        label: "BaZi love compatibility",
        href: "/learn/bazi-love-compatibility",
      },
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
    title: "I Ching vs Tarot: Which to Use for One Question? | DestinyPixel",
    description:
      "Tarot names feelings and motives; I Ching / liuyao frames tendency, obstacle, and timing. Pick one sincere question—then try DestinyPixel’s Question Oracle.",
    h1: "I Ching vs Tarot: Which to Use for One Question?",
    paragraphs: [
      "For one clear question, people often reach for tarot or the I Ching. Destiny Pixel’s oracle lane sits closer to the I Ching / liuyao tradition: hexagrams, changing lines, and how a situation is structured in time—not a deck of picture archetypes.",
      "Tarot shines when you need language for feelings, motives, and the story you are telling yourself. I Ching / liuyao shines when you care about tendency, obstacle, and rough timing (“push now / wait”). Both work best as one sincere question; neither should be treated as a courtroom verdict or a medical order.",
      "If you already know the emotion and need a decision frame, start with I Ching. If you need to name what you feel before you choose, start with tarot. Asking the same question twice in one hour usually adds noise, not clarity.",
    ],
    faqAsH2: true,
    faqs: [
      {
        question: "What’s the difference between I Ching and tarot for one question?",
        answer:
          "Tarot names feelings, motives, and the story you are telling yourself. I Ching / liuyao frames tendency, obstacle, and rough timing.",
      },
      {
        question: "What is liuyao?",
        answer: "A six-line I Ching method used for concrete situations.",
      },
      {
        question: "When should I start with tarot vs I Ching?",
        answer:
          "Start with tarot if you need to name what you feel before you choose. Start with I Ching if you already know the emotion and need a decision frame.",
      },
      {
        question: "Can I ask yes/no?",
        answer: "Better to ask “what supports / blocks this path?”",
      },
      {
        question: "Should I ask the same question twice?",
        answer: "Wait; change the angle only if the situation changed.",
      },
      {
        question:
          "How does DestinyPixel’s Question Oracle fit (Tarot + hexagram-inspired / liuyao-adjacent)?",
        answer:
          "DestinyPixel’s Question Oracle is Tarot plus a hexagram-inspired, liuyao-adjacent time reading. Ask one sincere question; the page casts six lines from the question time and pairs them with a three-card Tarot mirror.",
      },
    ],
    cta: { label: "Ask one question in the Oracle", href: "/oracle" },
    ctas: [
      { label: "Ask one question in the Oracle", href: "/oracle" },
      {
        label: "Temple sticks",
        href: "/sticks",
        note: "A different ritual lane.",
      },
      { label: "Insight studios", href: "/insights" },
    ],
    disclaimer:
      "Neither I Ching nor tarot should be treated as a courtroom verdict or a medical order. They are symbolic and reflective, not medical, legal, or financial advice, and they do not guarantee an outcome.",
    related: [
      {
        label: "What is a BaZi birth chart",
        href: "/learn/what-is-bazi-birth-chart",
      },
      {
        label: "Guanyin fortune sticks",
        href: "/learn/guanyin-fortune-sticks",
      },
      {
        label: "Chinese vs Western palmistry",
        href: "/learn/chinese-palm-reading-vs-western",
      },
    ],
  },
  {
    section: "learn",
    slug: "guanyin-fortune-sticks",
    title: "Guanyin Fortune Sticks Online: How to Draw & Read | DestinyPixel",
    description:
      "What Guanyin fortune sticks are, which questions they suit, and how to draw or look up a stick online—then open DestinyPixel’s temple sticks tool.",
    h1: "Guanyin fortune sticks online: how to draw and read one",
    paragraphs: [
      "Guanyin fortune sticks (Kau Cim–style) are a traditional 100-stick temple oracle. Online you can draw one stick or look up a number you already received—best with one concrete question.",
    ],
    faqAsH2: true,
    faqs: [
      {
        question: "What are Guanyin fortune sticks?",
        answer:
          "A Kau Cim–style temple draw of one numbered stick from a 100-stick Guanyin set, then a verse and a plain-language note. DestinyPixel lets you draw or look up that number online.",
      },
      {
        question:
          "What questions suit Guanyin (vs Guandi / Yuelao / Wealth / Wong Tai Sin)?",
        answer:
          "Guanyin suits protection, family, recovery, travel, and emotionally tangled questions. Use Guandi for career, Yuelao for love, Wealth for money, and Wong Tai Sin for timing—match the tradition to the question.",
      },
      {
        question: "How do you draw one stick online?",
        answer:
          "Choose Guanyin, hold one concrete question, then draw a single stick. Do not redraw the same question immediately; sit with the first result.",
      },
      {
        question: "How should you read the result?",
        answer:
          "Read the number, verse, and plain note as a symbolic mirror for that question—not a verdict. Optional AI interpretation is extra reflection, not a promise.",
      },
      {
        question: "Already drew a stick at a temple—can I look up the number?",
        answer:
          "Yes: choose Guanyin (or the matching tradition), enter the number, and compare the verse. Temple editions can differ in wording; treat this as a lookup, not every shrine’s booklet.",
      },
      {
        question: "Is an online stick “the same” as a temple draw?",
        answer:
          "The process is parallel: one tradition, one question, one stick (or a known number). An online draw copies that sequence; it does not claim the setting or result is identical.",
      },
    ],
    cta: {
      label: "Draw Guanyin sticks",
      href: "/sticks?locale=en&type=guanyin",
    },
    ctas: [
      {
        label: "Draw Guanyin sticks",
        href: "/sticks?locale=en&type=guanyin",
      },
      { label: "Browse all tools", href: "/tools" },
      {
        label: "One-question oracle",
        href: "/oracle",
        note: "A different tool for one situation, not temple sticks.",
      },
    ],
    disclaimer:
      "Temple sticks here are symbolic and reflective. They are not medical, legal, or financial advice, and they do not guarantee an outcome.",
    related: [
      { label: "I Ching vs Tarot", href: "/insights/i-ching-vs-tarot" },
      { label: "Temple sticks beginner steps", href: "/learn#sticks" },
    ],
  },
  {
    section: "learn",
    slug: "bazi-love-compatibility",
    title: "BaZi Love Compatibility: How Four Pillars Compare Two People | DestinyPixel",
    description:
      "What BaZi love compatibility means, why birth times matter, and how DestinyPixel mixes BaZi with birth-chart dimensions—then try the free compare tool.",
    h1: "BaZi love compatibility: how two Four Pillars charts compare",
    paragraphs: [
      "BaZi love compatibility compares two people’s Four Pillars—year, month, day, hour—and their elements as symbolic relating themes, not a breakup verdict. DestinyPixel’s free tool also folds tropical birth-chart dimensions into that comparison.",
    ],
    faqAsH2: true,
    faqs: [
      {
        question: "What is BaZi love compatibility?",
        answer:
          "It compares two Four Pillars charts—and the five-element relationships between them—as symbolic themes for relating. It is not a fate stamp or a reason to stay or leave.",
      },
      {
        question:
          "What does DestinyPixel compare (personality / communication / affection / everyday rhythm)?",
        answer:
          "The free tool scores personality, communication, affection, and everyday rhythm. Each dimension mixes BaZi with tropical chart placements.",
      },
      {
        question: "Why do both people need known birth times?",
        answer:
          "This edition needs a known local birth time and a supported city for each person; it will not invent a missing hour. Guessing can move the Moon and the hour pillar.",
        link: {
          label: "Prepare birth date, time and place",
          href: "/journal/prepare-birth-date-time-place",
        },
      },
      {
        question: "How should you read a 60–100 score?",
        answer:
          "The 60–100 figure is DestinyPixel’s deliberately positive editorial index, not validated relationship statistics. A lower score is not an instruction to separate.",
      },
      {
        question: "BaZi vs Western synastry—how this page’s tool mixes them",
        answer:
          "Western synastry compares tropical charts; BaZi compares Four Pillars. This tool weights BaZi at 30% and tropical placements at 70% on each dimension.",
      },
      {
        question: "What the tool does not do",
        answer:
          "This edition does not compare rising signs or houses, and it does not time marriage. Optional AI notes are fair-use reflection; birth details are used for calculation and not saved as a report.",
      },
    ],
    cta: { label: "Compare two charts free", href: "/compatibility" },
    ctas: [
      { label: "Compare two charts free", href: "/compatibility" },
      { label: "Learn BaZi basics", href: "/learn/what-is-bazi-birth-chart" },
      {
        label: "Free Day Pillar card",
        href: "/day-pillar",
        note: "One person, date only; compare still needs two birth times.",
      },
    ],
    disclaimer:
      "These scores are symbolic and reflective. They are not medical, legal, or financial advice, and they do not guarantee an outcome.",
    related: [
      {
        label: "What is a BaZi birth chart",
        href: "/learn/what-is-bazi-birth-chart",
      },
      {
        label: "Prepare birth date, time and place",
        href: "/journal/prepare-birth-date-time-place",
      },
      { label: "Tool directory", href: "/tools" },
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

export function seoGuideCtas(guide: SeoGuide) {
  return guide.ctas ?? [guide.cta];
}

export function seoGuideFaqAnswerText(faq: SeoGuideFaq) {
  return faq.link ? `${faq.answer} ${faq.link.href}` : faq.answer;
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
        text: seoGuideFaqAnswerText(faq),
      },
    })),
  };
}
