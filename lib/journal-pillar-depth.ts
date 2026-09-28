import type { JournalTranslation } from "./journal";
import { yiChouDepth } from "./journal-pillars/yi-chou";
import { bingYinDepth } from "./journal-pillars/bing-yin";
import { yiHaiDepth } from "./journal-pillars/yi-hai";
import { jiaChenDepth } from "./journal-pillars/jia-chen";

// Individually edited against the original bilingual card notes; preserve URLs.
export const fullPillarProfiles: Record<string, Record<"en" | "zh" | "ru", JournalTranslation>> = {
  "乙丑": yiChouDepth,
  "丙寅": bingYinDepth,
  "乙亥": yiHaiDepth,
  "甲辰": jiaChenDepth,
};

// Jia Zi lives in lib/journal-jia-zi.ts and keeps its own updatedAt.
export const fullPortraitUpdatedAt: Record<string, string> = {
  "乙丑": "2026-09-24",
  "丙寅": "2026-09-24",
  "乙亥": "2026-09-28",
  "甲辰": "2026-09-28",
};
