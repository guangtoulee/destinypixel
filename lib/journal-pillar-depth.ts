import type { JournalTranslation } from "./journal";
import { yiChouDepth } from "./journal-pillars/yi-chou";
import { bingYinDepth } from "./journal-pillars/bing-yin";
import { dingMaoDepth } from "./journal-pillars/ding-mao";
import { wuChenDepth } from "./journal-pillars/wu-chen";
import { jiSiDepth } from "./journal-pillars/ji-si";
import { gengWuDepth } from "./journal-pillars/geng-wu";
import { xinWeiDepth } from "./journal-pillars/xin-wei";
import { renShenDepth } from "./journal-pillars/ren-shen";
import { guiYouDepth } from "./journal-pillars/gui-you";
import { jiaXuDepth } from "./journal-pillars/jia-xu";
import { yiHaiDepth } from "./journal-pillars/yi-hai";
import { bingZiDepth } from "./journal-pillars/bing-zi";
import { dingChouDepth } from "./journal-pillars/ding-chou";
import { wuYinDepth } from "./journal-pillars/wu-yin";
import { jiMaoDepth } from "./journal-pillars/ji-mao";
import { gengChenDepth } from "./journal-pillars/geng-chen";
import { xinSiDepth } from "./journal-pillars/xin-si";
import { renWuDepth } from "./journal-pillars/ren-wu";
import { guiWeiDepth } from "./journal-pillars/gui-wei";
import { jiaShenDepth } from "./journal-pillars/jia-shen";
import { yiYouDepth } from "./journal-pillars/yi-you";
import { bingXuDepth } from "./journal-pillars/bing-xu";
import { dingHaiDepth } from "./journal-pillars/ding-hai";
import { wuZiDepth } from "./journal-pillars/wu-zi";
import { jiChouDepth } from "./journal-pillars/ji-chou";
import { gengYinDepth } from "./journal-pillars/geng-yin";
import { xinMaoDepth } from "./journal-pillars/xin-mao";
import { renChenDepth } from "./journal-pillars/ren-chen";
import { guiSiDepth } from "./journal-pillars/gui-si";
import { jiaWuDepth } from "./journal-pillars/jia-wu";
import { yiWeiDepth } from "./journal-pillars/yi-wei";
import { bingShenDepth } from "./journal-pillars/bing-shen";
import { dingYouDepth } from "./journal-pillars/ding-you";
import { wuXuDepth } from "./journal-pillars/wu-xu";
import { jiHaiDepth } from "./journal-pillars/ji-hai";
import { gengZiDepth } from "./journal-pillars/geng-zi";
import { xinChouDepth } from "./journal-pillars/xin-chou";
import { renYinDepth } from "./journal-pillars/ren-yin";
import { guiMaoDepth } from "./journal-pillars/gui-mao";

import { jiaChenDepth } from "./journal-pillars/jia-chen";
import { yiSiDepth } from "./journal-pillars/yi-si";
import { bingWuDepth } from "./journal-pillars/bing-wu";
import { dingWeiDepth } from "./journal-pillars/ding-wei";

import { wuShenDepth } from "./journal-pillars/wu-shen";
import { jiYouDepth } from "./journal-pillars/ji-you";
import { gengXuDepth } from "./journal-pillars/geng-xu";
import { xinHaiDepth } from "./journal-pillars/xin-hai";

import { renZiDepth } from "./journal-pillars/ren-zi";
import { guiChouDepth } from "./journal-pillars/gui-chou";
import { jiaYinDepth } from "./journal-pillars/jia-yin";
import { yiMaoDepth } from "./journal-pillars/yi-mao";

import { bingChenDepth } from "./journal-pillars/bing-chen";
import { dingSiDepth } from "./journal-pillars/ding-si";
import { wuWuDepth } from "./journal-pillars/wu-wu";
import { jiWeiDepth } from "./journal-pillars/ji-wei";
import { gengShenDepth } from "./journal-pillars/geng-shen";
import { xinYouDepth } from "./journal-pillars/xin-you";
import { renXuDepth } from "./journal-pillars/ren-xu";
import { guiHaiDepth } from "./journal-pillars/gui-hai";

// Individually edited against the original bilingual card notes; preserve URLs.
export const fullPillarProfiles: Record<string, { updatedAt: string; translations: Record<"en" | "zh" | "ru", JournalTranslation> }> = {
  "乙丑": { updatedAt: "2026-09-24", translations: yiChouDepth },
  "丙寅": { updatedAt: "2026-09-24", translations: bingYinDepth },
  "丁卯": { updatedAt: "2026-09-29", translations: dingMaoDepth },
  "戊辰": { updatedAt: "2026-10-05", translations: wuChenDepth },
  "己巳": { updatedAt: "2026-10-05", translations: jiSiDepth },
  "庚午": { updatedAt: "2026-10-05", translations: gengWuDepth },
  "辛未": { updatedAt: "2026-10-05", translations: xinWeiDepth },
  "壬申": { updatedAt: "2026-10-05", translations: renShenDepth },
  "癸酉": { updatedAt: "2026-10-05", translations: guiYouDepth },
  "甲戌": { updatedAt: "2026-10-05", translations: jiaXuDepth },
  "乙亥": { updatedAt: "2026-10-05", translations: yiHaiDepth },
  "丙子": { updatedAt: "2026-10-05", translations: bingZiDepth },
  "丁丑": { updatedAt: "2026-10-05", translations: dingChouDepth },
  "戊寅": { updatedAt: "2026-10-05", translations: wuYinDepth },
  "己卯": { updatedAt: "2026-10-05", translations: jiMaoDepth },
  "庚辰": { updatedAt: "2026-10-05", translations: gengChenDepth },
  "辛巳": { updatedAt: "2026-10-05", translations: xinSiDepth },
  "壬午": { updatedAt: "2026-10-05", translations: renWuDepth },
  "癸未": { updatedAt: "2026-10-05", translations: guiWeiDepth },
  "甲申": { updatedAt: "2026-10-05", translations: jiaShenDepth },
  "乙酉": { updatedAt: "2026-10-05", translations: yiYouDepth },
  "丙戌": { updatedAt: "2026-10-05", translations: bingXuDepth },
  "丁亥": { updatedAt: "2026-10-05", translations: dingHaiDepth },
  "戊子": { updatedAt: "2026-10-05", translations: wuZiDepth },
  "己丑": { updatedAt: "2026-10-05", translations: jiChouDepth },
  "庚寅": { updatedAt: "2026-10-05", translations: gengYinDepth },
  "辛卯": { updatedAt: "2026-10-05", translations: xinMaoDepth },
  "壬辰": { updatedAt: "2026-10-05", translations: renChenDepth },
  "癸巳": { updatedAt: "2026-10-05", translations: guiSiDepth },
  "甲午": { updatedAt: "2026-10-05", translations: jiaWuDepth },
  "乙未": { updatedAt: "2026-10-05", translations: yiWeiDepth },
  "丙申": { updatedAt: "2026-10-05", translations: bingShenDepth },
  "丁酉": { updatedAt: "2026-10-05", translations: dingYouDepth },
  "戊戌": { updatedAt: "2026-10-05", translations: wuXuDepth },
  "己亥": { updatedAt: "2026-10-05", translations: jiHaiDepth },
  "庚子": { updatedAt: "2026-10-05", translations: gengZiDepth },
  "辛丑": { updatedAt: "2026-10-05", translations: xinChouDepth },
  "壬寅": { updatedAt: "2026-10-05", translations: renYinDepth },
  "癸卯": { updatedAt: "2026-10-05", translations: guiMaoDepth },
  "甲辰": { updatedAt: "2026-10-05", translations: jiaChenDepth },
  "乙巳": { updatedAt: "2026-10-05", translations: yiSiDepth },
  "丙午": { updatedAt: "2026-10-05", translations: bingWuDepth },
  "丁未": { updatedAt: "2026-10-05", translations: dingWeiDepth },
  "戊申": { updatedAt: "2026-10-05", translations: wuShenDepth },
  "己酉": { updatedAt: "2026-10-05", translations: jiYouDepth },
  "庚戌": { updatedAt: "2026-10-05", translations: gengXuDepth },
  "辛亥": { updatedAt: "2026-10-05", translations: xinHaiDepth },
  "壬子": { updatedAt: "2026-10-05", translations: renZiDepth },
  "癸丑": { updatedAt: "2026-10-05", translations: guiChouDepth },
  "甲寅": { updatedAt: "2026-10-05", translations: jiaYinDepth },
  "乙卯": { updatedAt: "2026-10-05", translations: yiMaoDepth },
  "丙辰": { updatedAt: "2026-10-05", translations: bingChenDepth },
  "丁巳": { updatedAt: "2026-10-05", translations: dingSiDepth },
  "戊午": { updatedAt: "2026-10-05", translations: wuWuDepth },
  "己未": { updatedAt: "2026-10-05", translations: jiWeiDepth },
  "庚申": { updatedAt: "2026-10-05", translations: gengShenDepth },
  "辛酉": { updatedAt: "2026-10-05", translations: xinYouDepth },
  "壬戌": { updatedAt: "2026-10-05", translations: renXuDepth },
  "癸亥": { updatedAt: "2026-10-05", translations: guiHaiDepth },
};
