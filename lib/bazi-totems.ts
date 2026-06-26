import { getPillarImagePath, stemSlugs, branchSlugs } from "@/lib/archetype-assets";
import type { BaziData } from "@/lib/engines/bazi";
import { elementLabels } from "@/lib/report-i18n";
import type { ReportLocale } from "@/lib/report-i18n";

export type PillarKey = keyof BaziData["pillars"];

type Localized = Record<ReportLocale, string>;

export const pillarOrder: PillarKey[] = ["year", "month", "day", "hour"];

export const stemDetails: Record<
  string,
  {
    pinyin: string;
    element: string;
    polarityElement: Localized;
  }
> = {
  甲: {
    pinyin: "Jia",
    element: "Wood",
    polarityElement: {
      en: "Yang Wood",
      zh: "阳木",
      ru: "Янское Дерево",
    },
  },
  乙: {
    pinyin: "Yi",
    element: "Wood",
    polarityElement: {
      en: "Yin Wood",
      zh: "阴木",
      ru: "Иньское Дерево",
    },
  },
  丙: {
    pinyin: "Bing",
    element: "Fire",
    polarityElement: {
      en: "Yang Fire",
      zh: "阳火",
      ru: "Янский Огонь",
    },
  },
  丁: {
    pinyin: "Ding",
    element: "Fire",
    polarityElement: {
      en: "Yin Fire",
      zh: "阴火",
      ru: "Иньский Огонь",
    },
  },
  戊: {
    pinyin: "Wu",
    element: "Earth",
    polarityElement: {
      en: "Yang Earth",
      zh: "阳土",
      ru: "Янская Земля",
    },
  },
  己: {
    pinyin: "Ji",
    element: "Earth",
    polarityElement: {
      en: "Yin Earth",
      zh: "阴土",
      ru: "Иньская Земля",
    },
  },
  庚: {
    pinyin: "Geng",
    element: "Metal",
    polarityElement: {
      en: "Yang Metal",
      zh: "阳金",
      ru: "Янский Металл",
    },
  },
  辛: {
    pinyin: "Xin",
    element: "Metal",
    polarityElement: {
      en: "Yin Metal",
      zh: "阴金",
      ru: "Иньский Металл",
    },
  },
  壬: {
    pinyin: "Ren",
    element: "Water",
    polarityElement: {
      en: "Yang Water",
      zh: "阳水",
      ru: "Янская Вода",
    },
  },
  癸: {
    pinyin: "Gui",
    element: "Water",
    polarityElement: {
      en: "Yin Water",
      zh: "阴水",
      ru: "Иньская Вода",
    },
  },
};

export const branchTotems: Record<
  string,
  {
    pinyin: string;
    animal: Localized;
    elementField: Localized;
  }
> = {
  子: {
    pinyin: "Zi",
    animal: { en: "Rat", zh: "鼠", ru: "Крыса" },
    elementField: {
      en: "Water instinct",
      zh: "水性本能",
      ru: "Водный инстинкт",
    },
  },
  丑: {
    pinyin: "Chou",
    animal: { en: "Ox", zh: "牛", ru: "Бык" },
    elementField: {
      en: "Earth endurance",
      zh: "土性耐力",
      ru: "Земная выносливость",
    },
  },
  寅: {
    pinyin: "Yin",
    animal: { en: "Tiger", zh: "虎", ru: "Тигр" },
    elementField: {
      en: "Wood courage",
      zh: "木性勇气",
      ru: "Деревянная смелость",
    },
  },
  卯: {
    pinyin: "Mao",
    animal: { en: "Rabbit", zh: "兔", ru: "Кролик" },
    elementField: {
      en: "Wood sensitivity",
      zh: "木性敏感",
      ru: "Деревянная чувствительность",
    },
  },
  辰: {
    pinyin: "Chen",
    animal: { en: "Dragon", zh: "龙", ru: "Дракон" },
    elementField: {
      en: "Earth reservoir",
      zh: "土性库藏",
      ru: "Земной резервуар",
    },
  },
  巳: {
    pinyin: "Si",
    animal: { en: "Snake", zh: "蛇", ru: "Змея" },
    elementField: {
      en: "Fire perception",
      zh: "火性感知",
      ru: "Огненное восприятие",
    },
  },
  午: {
    pinyin: "Wu",
    animal: { en: "Horse", zh: "马", ru: "Лошадь" },
    elementField: {
      en: "Fire momentum",
      zh: "火性动能",
      ru: "Огненный импульс",
    },
  },
  未: {
    pinyin: "Wei",
    animal: { en: "Goat", zh: "羊", ru: "Коза" },
    elementField: {
      en: "Earth cultivation",
      zh: "土性滋养",
      ru: "Земное взращивание",
    },
  },
  申: {
    pinyin: "Shen",
    animal: { en: "Monkey", zh: "猴", ru: "Обезьяна" },
    elementField: {
      en: "Metal strategy",
      zh: "金性策略",
      ru: "Металлическая стратегия",
    },
  },
  酉: {
    pinyin: "You",
    animal: { en: "Rooster", zh: "鸡", ru: "Петух" },
    elementField: {
      en: "Metal refinement",
      zh: "金性精修",
      ru: "Металлическая точность",
    },
  },
  戌: {
    pinyin: "Xu",
    animal: { en: "Dog", zh: "狗", ru: "Собака" },
    elementField: {
      en: "Earth loyalty",
      zh: "土性忠诚",
      ru: "Земная верность",
    },
  },
  亥: {
    pinyin: "Hai",
    animal: { en: "Pig", zh: "猪", ru: "Свинья" },
    elementField: {
      en: "Water depth",
      zh: "水性深度",
      ru: "Водная глубина",
    },
  },
};

export function getPillarDisplay(pillar: string, locale: ReportLocale) {
  const stem = pillar[0];
  const branch = pillar[1];
  const stemInfo = stemDetails[stem];
  const branchInfo = branchTotems[branch];
  const pillarPinyin = `${stemInfo.pinyin} ${branchInfo.pinyin}`;
  const totemName =
    locale === "zh"
      ? `${stemInfo.polarityElement.zh}${branchInfo.animal.zh}`
      : `${elementLabels[locale][stemInfo.element] ?? stemInfo.element} ${
          branchInfo.animal[locale]
        }`;

  return {
    imageSrc: getPillarImagePath(pillar),
    slug: `${stemSlugs[stem]}_${branchSlugs[branch]}`,
    pillarLabel: locale === "zh" ? pillar : pillarPinyin,
    stemLabel: locale === "zh" ? stem : stemInfo.pinyin,
    branchLabel: locale === "zh" ? branch : branchInfo.pinyin,
    stemMeaning: stemInfo.polarityElement[locale],
    branchMeaning: branchInfo.elementField[locale],
    totemName,
    animal: branchInfo.animal[locale],
    pinyin: pillarPinyin,
  };
}
