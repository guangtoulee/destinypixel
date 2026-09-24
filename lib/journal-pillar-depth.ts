import type { JournalTranslation } from "./journal";
import { yiChouDepth } from "./journal-pillars/yi-chou";
import { bingYinDepth } from "./journal-pillars/bing-yin";

// Individually edited against the original bilingual card notes; preserve URLs.
export const fullPillarProfiles: Record<string, Record<"en" | "zh" | "ru", JournalTranslation>> = {
  "乙丑": yiChouDepth,
  "丙寅": bingYinDepth,
};
