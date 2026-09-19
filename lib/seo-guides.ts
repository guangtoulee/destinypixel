export type SeoGuideLink = { label: string; href: string; note?: string };

export type SeoGuideFaq = {
  question: string;
  answer: string;
  link?: SeoGuideLink;
  /** Extra answer-first lines, each linking out (AEO stubs). */
  links?: SeoGuideLink[];
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
      "Try an online Guanyin-inspired fortune-stick draw. Learn how to ask a question, read the source label and distinguish traditional verses from modern reflections.",
    h1: "Guanyin fortune sticks online: how to draw and read one",
    paragraphs: [
      "Guanyin fortune sticks are a form of Chinese temple divination in which a numbered stick points to a verse. DestinyPixel offers a 100-number Guanyin-inspired draw: bring one concrete question, receive a result, and read its source note before interpreting it.",
      "The current collection mixes selected traditional entries with DestinyPixel’s original modern reflections. It is not a complete transcription of any temple’s 100-stick book, and a translated interface does not always contain a translation of the corresponding Chinese verse. A matching number alone does not establish that two texts belong to the same edition.",
    ],
    faqAsH2: true,
    faqs: [
      {
        question: "What are Guanyin fortune sticks?",
        answer:
          "In a Guanyin fortune-stick tradition, a numbered draw leads to a verse and interpretation; wording and numbering can vary by edition. DestinyPixel provides a 100-number online experience containing both selected traditional entries and original modern reflections, identified in the result’s source note.",
      },
      {
        question:
          "What questions suit Guanyin (vs Guandi / Yuelao / Wealth / Wong Tai Sin)?",
        answer:
          "On this site, Guanyin is the general reflection option for family, travel and uncertainty; Guandi emphasizes work, Yuelao relationships, Wealth money habits, and Wong Tai Sin timing. These are editorial starting points for choosing an experience, not fixed rules shared by every temple.",
      },
      {
        question: "How do you draw one stick online?",
        answer:
          "Choose Guanyin, hold one concrete question, then draw a single stick. Do not redraw the same question immediately; sit with the first result.",
      },
      {
        question: "How should you read the result?",
        answer:
          "Check whether the source note identifies a traditional entry or an original modern reflection, then read the text in relation to your question. Optional AI interpretation adds reflection; it does not authenticate a verse or guarantee an outcome.",
      },
      {
        question: "Already drew a stick at a temple—can I look up the number?",
        answer:
          "You can open this site’s entry for a number, but it may be an original modern reflection rather than your temple’s verse. For an offline draw, compare the actual poem and named edition; use the temple’s own booklet when they do not match.",
      },
      {
        question: "Is an online stick “the same” as a temple draw?",
        answer:
          "No: this is a digital symbolic experience inspired by the sequence of choosing a tradition, focusing on one question and drawing a numbered result. It does not reproduce a temple’s setting, confirmation ritual or complete authoritative text.",
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
      "BaZi love compatibility traditionally considers relationships between two birth charts. DestinyPixel offers a focused, free comparison: Day Pillar animal portraits, the relationship between the two day elements, the five-element distribution across the Four Pillars, and selected tropical astrology placements.",
      "The result is a conversation starter about personality, communication, affection and daily habits. It is not a complete traditional marriage assessment: the 60–100 connection index uses this site’s editorial weights, while the 60 animal portraits are original DestinyPixel interpretations rather than traditional compatibility classifications.",
    ],
    faqAsH2: true,
    faqs: [
      {
        question: "What is BaZi love compatibility?",
        answer:
          "BaZi compatibility explores relationships between two Four Pillars charts through traditional symbolism. This tool uses a limited subset—the day elements and visible five-element distribution—alongside its own animal portraits and selected astrology placements, rather than a complete traditional marriage assessment.",
      },
      {
        question:
          "What does DestinyPixel compare (personality / communication / affection / everyday rhythm)?",
        answer:
          "The free tool scores personality, communication, affection and everyday rhythm using day-element relationships, the visible five-element distribution and selected Sun, Moon, Mercury, Venus and Mars placements. It also compares two original animal portraits and, when available, adds a short AI reflection without letting AI set the scores.",
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
          "This tool gives BaZi signals 30% and selected tropical placements 70% of each dimension: day-element affinity informs the first three dimensions, and similarity in visible five-element distribution informs everyday rhythm. The animal stories and directional element explanation add context; they are not extra numeric scoring factors.",
      },
      {
        question: "What the tool does not do",
        answer:
          "This edition does not compare rising signs or houses, assess useful elements or Day Master strength, or predict marriage dates. Birth details are used for calculation without saving a report; AI receives calculated chart data rather than names, birth dates or cities, and its free reflection is subject to availability and rate limits.",
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
    title: "Chinese Palm Reading vs Western Palmistry (AI Guide) | DestinyPixel",
    description:
      "How Chinese hand reading differs from Western palmistry—and how to use DestinyPixel’s Palm Studio as a reflective AI guide, not a fate verdict.",
    h1: "Chinese Palm Reading vs Western Palmistry",
    paragraphs: [
      "Chinese palm reading and Western palmistry both look at the hand, yet they grew from different libraries. Western palmistry often emphasizes major lines and mounts as character and life-theme symbols. Chinese hand reading more often folds palm shape, color, and line changes into a broader “look at the person in time” habit—closer to physiognomy than to a single fate script.",
      "DestinyPixel’s Palm Studio generates reflective text from palm details you select and confirm. An optional photo stays in your browser as a reference for your own observations; the AI does not receive or inspect the image. Use clear lighting to help yourself describe the lines, and avoid treating a “broken life line” as evidence of illness or a predicted lifespan.",
      "Use palm reading as a mirror for habits and tendencies. Pair it with BaZi when you want calendar timing, or with I Ching when you have one decision on the table.",
    ],
    faqAsH2: true,
    faqs: [
      {
        question: "What’s the difference between Chinese palm reading and Western palmistry?",
        answer:
          "Western palmistry often emphasizes major lines and mounts as character and life-theme symbols. Chinese hand reading more often folds palm shape, color, and line changes into a broader “person in time” / physiognomy habit.",
      },
      {
        question: "What does an AI palm reading actually do (and not do)?",
        answer:
          "Palm Studio writes reflective text from the details you confirm; an optional photo stays local as a visual reference. The AI does not see the photo, detect lines or diagnose health; it interprets the observations you enter.",
      },
      {
        question: "Left or right hand—which to use?",
        answer: "Either can work; be consistent and note dominant hand.",
      },
      {
        question: "Do palm lines change?",
        answer: "Yes—lines and tone are not frozen.",
      },
      {
        question: "Is palm reading fortune-telling?",
        answer: "Treat it as pattern talk, not a sealed destiny.",
      },
      {
        question: "When to pair palm with BaZi or I Ching?",
        answer:
          "Pair with BaZi when you want calendar timing. Pair with I Ching when you have one decision on the table.",
        links: [
          {
            label: "What is a BaZi birth chart",
            href: "/learn/what-is-bazi-birth-chart",
          },
          { label: "I Ching vs Tarot", href: "/insights/i-ching-vs-tarot" },
          { label: "Question Oracle", href: "/oracle" },
        ],
      },
    ],
    cta: { label: "Open Palm Studio", href: "/palm" },
    ctas: [
      { label: "Open Palm Studio", href: "/palm" },
      { label: "Open Face studio", href: "/face" },
      { label: "Getting started", href: "/learn" },
    ],
    disclaimer:
      "Palm reading here is pattern talk, not a sealed destiny or a diagnosis. Hands change with labor, health, and age. These readings are symbolic and reflective, not medical, legal, or financial advice, and they do not guarantee an outcome.",
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

export function seoGuideFaqLinks(faq: SeoGuideFaq) {
  return [...(faq.link ? [faq.link] : []), ...(faq.links ?? [])];
}

export function seoGuideFaqAnswerText(faq: SeoGuideFaq) {
  const extras = seoGuideFaqLinks(faq);
  return extras.length
    ? [faq.answer, ...extras.map((item) => item.href)].join(" ")
    : faq.answer;
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
