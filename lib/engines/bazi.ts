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
  luck: BaziLuckData;
};

const elements = ["Wood", "Fire", "Earth", "Metal", "Water"] as const;
const pillarKeys = ["year", "month", "day", "hour"] as const;
const heavenlyStemCycle = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const earthlyBranchCycle = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;

type PillarKey = (typeof pillarKeys)[number];
type LuckDirection = "forward" | "reverse";
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

export type TenYearLuckCycle = {
  index: number;
  pillar: string;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
};

export type BaziLuckData = {
  targetYear: number;
  previousYear: number;
  currentYearPillar: string;
  previousYearPillar: string;
  direction: LuckDirection;
  startAge: number;
  startYear: number;
  calculationNote: string;
  tenYearLuck: TenYearLuckCycle[];
  activeTenYearLuck?: TenYearLuckCycle;
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

type SolarDate = {
  getYear(): number;
  getMonth(): number;
  getDay(): number;
  getHour(): number;
  getMinute(): number;
  getSecond(): number;
  toYmdHms(): string;
};

type JieQiDate = {
  getName(): string;
  getSolar(): SolarDate;
};

type LunarDate = ReturnType<ReturnType<typeof Solar.fromYmdHms>["getLunar"]> & {
  getNextJieQi(wholeDay: boolean): JieQiDate;
  getPrevJieQi(wholeDay: boolean): JieQiDate;
};

function solarToUtcMs(solar: SolarDate) {
  return Date.UTC(
    solar.getYear(),
    solar.getMonth() - 1,
    solar.getDay(),
    solar.getHour(),
    solar.getMinute(),
    solar.getSecond(),
  );
}

function movePillar(pillar: string, offset: number) {
  const stemIndex = heavenlyStemCycle.indexOf(pillar[0] as HeavenlyStem);
  const branchIndex = earthlyBranchCycle.indexOf(pillar[1] as EarthlyBranch);
  const normalizedStem =
    (stemIndex + offset + heavenlyStemCycle.length * 6) %
    heavenlyStemCycle.length;
  const normalizedBranch =
    (branchIndex + offset + earthlyBranchCycle.length * 5) %
    earthlyBranchCycle.length;

  return `${heavenlyStemCycle[normalizedStem]}${earthlyBranchCycle[normalizedBranch]}`;
}

function getYearPillar(year: number) {
  return Solar.fromYmdHms(year, 6, 15, 12, 0, 0).getLunar().getYearInGanZhi();
}

function roundToOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function calculateLuckData(
  input: BirthInput,
  lunar: LunarDate,
  pillars: BaziData["pillars"],
  trueSolarTime: ReturnType<typeof calculateTrueSolarTime>,
): BaziLuckData {
  const yearStem = pillars.year[0] as HeavenlyStem;
  const isYangYear = stemPolarity[yearStem] === "Yang";
  const direction: LuckDirection =
    (input.gender === "male" && isYangYear) ||
    (input.gender === "female" && !isYangYear)
      ? "forward"
      : "reverse";
  const referenceJieQi =
    direction === "forward" ? lunar.getNextJieQi(false) : lunar.getPrevJieQi(false);
  const referenceSolar = referenceJieQi.getSolar();
  const trueSolarParts = trueSolarTimeToParts(trueSolarTime);
  const birthSolar = Solar.fromYmdHms(
    trueSolarParts.year,
    trueSolarParts.month,
    trueSolarParts.day,
    trueSolarParts.hour,
    trueSolarParts.minute,
    0,
  ) as unknown as SolarDate;
  const deltaDays =
    Math.abs(solarToUtcMs(referenceSolar) - solarToUtcMs(birthSolar)) /
    86_400_000;
  const startAge = Math.max(1, roundToOneDecimal(deltaDays / 3));
  const birthYear = Number(input.birthDate.slice(0, 4));
  const startYear = Math.round(birthYear + startAge);
  const step = direction === "forward" ? 1 : -1;
  const targetYear = new Date().getFullYear();
  const previousYear = targetYear - 1;
  const tenYearLuck = Array.from({ length: 10 }, (_, index) => {
    const cycleStartAge = roundToOneDecimal(startAge + index * 10);
    const cycleStartYear = Math.round(birthYear + cycleStartAge);

    return {
      index: index + 1,
      pillar: movePillar(pillars.month, step * (index + 1)),
      startAge: cycleStartAge,
      endAge: roundToOneDecimal(cycleStartAge + 9.9),
      startYear: cycleStartYear,
      endYear: cycleStartYear + 9,
    };
  });

  return {
    targetYear,
    previousYear,
    currentYearPillar: getYearPillar(targetYear),
    previousYearPillar: getYearPillar(previousYear),
    direction,
    startAge,
    startYear,
    calculationNote: `${direction} luck cycle from ${referenceJieQi.getName()} at ${referenceSolar.toYmdHms()}; one day is treated as roughly four months.`,
    tenYearLuck,
    activeTenYearLuck: tenYearLuck.find(
      (cycle) => targetYear >= cycle.startYear && targetYear <= cycle.endYear,
    ),
  };
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
  const luck = calculateLuckData(input, lunar as LunarDate, pillars, trueSolarTime);

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
    luck,
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
