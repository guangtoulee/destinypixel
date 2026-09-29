import type { JournalTranslation } from "./journal";
import { yiChouDepth } from "./journal-pillars/yi-chou";
import { bingYinDepth } from "./journal-pillars/bing-yin";
import { dingMaoDepth } from "./journal-pillars/ding-mao";

// Individually edited against the original bilingual card notes; preserve URLs.
export const fullPillarProfiles: Record<string, { updatedAt: string; translations: Record<"en" | "zh" | "ru", JournalTranslation> }> = {
  "乙丑": { updatedAt: "2026-09-24", translations: yiChouDepth },
  "丙寅": { updatedAt: "2026-09-24", translations: bingYinDepth },
  "丁卯": { updatedAt: "2026-09-29", translations: dingMaoDepth },
};
