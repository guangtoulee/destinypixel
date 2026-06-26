import { Solar } from "lunar-javascript";
import {
  branchHiddenStems,
  branchElements,
  type EarthlyBranch,
  elementLabelsCn,
  heavenlyStemPlanetMap,
  heavenlyStemPlanetMapCn,
  stemPolarity,
  stemElements,
  type ElementName,
  type HeavenlyStem,
} from "@/lib/core/mappings";
import { resolveCity } from "@/lib/geo/cities";
import {
  type BirthInput,
  calculateTrueSolarTime,
  trueSolarTimeToParts,
} from "@/lib/engines/time";

export type BaziData = {
  engine: "bazi";
  trueSolarTime: ReturnType<typeof calculateTrueSolarTime>;
  pillars: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  dayMaster: HeavenlyStem;
  mappedPlanet: string;
  mappedPlanetCn: string;
  elementBalance: Record<ElementName, number>;
  missingElements: ElementName[];
  tenGods: {
    stems: Record<PillarKey, PillarTenGod>;
    hiddenStems: Record<PillarKey, HiddenStemTenGod[]>;
  };
};

const elements = ["Wood", "Fire", "Earth", "Metal", "Water"] as const;
const pillarKeys = ["year", "month", "day", "hour"] as const;

type PillarKey = (typeof pillarKeys)[number];
type TenGodName =
  | "比肩"
  | "劫财"
  | "食神"
  | "伤官"
  | "偏财"
  | "正财"
  | "七杀"
  | "正官"
  | "偏印"
  | "正印";

type PillarTenGod = {
  stem: HeavenlyStem;
  tenGod: TenGodName | "日主";
};

type HiddenStemTenGod = {
  branch: EarthlyBranch;
  stem: HeavenlyStem;
  tenGod: TenGodName;
};

const producingCycle: Record<ElementName, ElementName> = {
  Wood: "Fire",
  Fire: "Earth",
  Earth: "Metal",
  Metal: "Water",
  Water: "Wood",
};

const controllingCycle: Record<ElementName, ElementName> = {
  Wood: "Earth",
  Earth: "Water",
  Water: "Fire",
  Fire: "Metal",
  Metal: "Wood",
};

function emptyBalance(): Record<ElementName, number> {
  return {
    Wood: 0,
    Fire: 0,
    Earth: 0,
    Metal: 0,
    Water: 0,
  };
}

function addPillarToBalance(balance: Record<ElementName, number>, pillar: string) {
  const stem = pillar[0] as keyof typeof stemElements;
  const branch = pillar[1] as keyof typeof branchElements;
  const stemElement = stemElements[stem];
  const branchElement = branchElements[branch];

  if (stemElement) balance[stemElement] += 1;
  if (branchElement) balance[branchElement] += 1;
}

function getTenGod(dayMaster: HeavenlyStem, targetStem: HeavenlyStem): TenGodName {
  const dayElement = stemElements[dayMaster];
  const targetElement = stemElements[targetStem];
  const samePolarity = stemPolarity[dayMaster] === stemPolarity[targetStem];

  if (targetElement === dayElement) return samePolarity ? "比肩" : "劫财";
  if (producingCycle[dayElement] === targetElement) {
    return samePolarity ? "食神" : "伤官";
  }
  if (controllingCycle[dayElement] === targetElement) {
    return samePolarity ? "偏财" : "正财";
  }
  if (controllingCycle[targetElement] === dayElement) {
    return samePolarity ? "七杀" : "正官";
  }

  return samePolarity ? "偏印" : "正印";
}

function calculateTenGods(
  pillars: BaziData["pillars"],
  dayMaster: HeavenlyStem,
): BaziData["tenGods"] {
  const stems = Object.fromEntries(
    pillarKeys.map((key) => {
      const stem = pillars[key][0] as HeavenlyStem;

      return [
        key,
        {
          stem,
          tenGod: key === "day" ? "日主" : getTenGod(dayMaster, stem),
        },
      ];
    }),
  ) as BaziData["tenGods"]["stems"];

  const hiddenStems = Object.fromEntries(
    pillarKeys.map((key) => {
      const branch = pillars[key][1] as EarthlyBranch;

      return [
        key,
        branchHiddenStems[branch].map((stem) => ({
          branch,
          stem,
          tenGod: getTenGod(dayMaster, stem),
        })),
      ];
    }),
  ) as BaziData["tenGods"]["hiddenStems"];

  return { stems, hiddenStems };
}

export function calculateBaziEngine(input: BirthInput): BaziData {
  const trueSolarTime = calculateTrueSolarTime(input);
  const { year, month, day, hour, minute } =
    trueSolarTimeToParts(trueSolarTime);
  const lunar = Solar.fromYmdHms(year, month, day, hour, minute, 0).getLunar();
  const pillars = {
    year: lunar.getYearInGanZhi(),
    month: lunar.getMonthInGanZhi(),
    day: lunar.getDayInGanZhi(),
    hour: lunar.getTimeInGanZhi(),
  };
  const balance = emptyBalance();

  Object.values(pillars).forEach((pillar) => addPillarToBalance(balance, pillar));

  const dayMaster = pillars.day[0] as HeavenlyStem;
  const tenGods = calculateTenGods(pillars, dayMaster);

  return {
    engine: "bazi",
    trueSolarTime,
    pillars,
    dayMaster,
    mappedPlanet: heavenlyStemPlanetMap[dayMaster],
    mappedPlanetCn: heavenlyStemPlanetMapCn[dayMaster],
    elementBalance: balance,
    missingElements: elements.filter((element) => balance[element] === 0),
    tenGods,
  };
}

export const trueSolarTimeCalibrationFixture = {
  name: "True solar time boundary guard",
  input: {
    name: "Calibration",
    gender: "female",
    locale: "en",
    birthDate: "1982-03-21",
    birthTime: "01:30",
    city: resolveCity("Shijiazhuang")!,
  } satisfies BirthInput,
  expectedHourPillar: "癸丑",
};

export function assertBaziEngineCalibration() {
  const result = calculateBaziEngine(trueSolarTimeCalibrationFixture.input);

  if (result.pillars.hour !== trueSolarTimeCalibrationFixture.expectedHourPillar) {
    throw new Error(
      `True solar time calibration failed: expected ${trueSolarTimeCalibrationFixture.expectedHourPillar}, received ${result.pillars.hour}`,
    );
  }

  return result;
}

export { elementLabelsCn };
