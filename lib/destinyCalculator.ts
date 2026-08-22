import "server-only";

import { Solar } from "lunar-javascript";
import type {
  DestinyCycle,
  DestinyPalette,
  DestinyProfile,
  ElementalSignature,
} from "@/app/xingpan/types";
import {
  branchElements,
  branchHiddenStems,
  stemElements,
  stemPolarity,
  type EarthlyBranch,
  type ElementName,
  type HeavenlyStem,
} from "@/lib/core/mappings";
import { cities, type City } from "@/lib/geo/cities";

export type OracleGender = "male" | "female";

export type OracleBirthInput = {
  birthDate: string;
  birthTime: string;
  birthplace: string;
  gender: OracleGender;
};

export type DestinyCoordinate = [number, number, number];

export type DestinyPillar = {
  ganZhi: string;
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  stemElement: ElementName;
  branchElement: ElementName;
};

export type CalibratedTrueSolarTime = {
  date: string;
  time: string;
  isoLike: string;
  timezoneOffsetMinutes: number;
  standardMeridian: number;
  longitudeCorrectionMinutes: number;
  equationOfTimeMinutes: number;
  totalCorrectionMinutes: number;
  method: "iana-wall-time+longitude+equation-of-time-v2";
};

export type DestinyChart = {
  engine: "lunar-javascript+destinypixel-v3";
  convention: {
    yearMonth: "birth-instant-vs-beijing-jieqi";
    dayHour: "local-apparent-solar-time-sect-2";
    luck: "yun-sect-2-minute-resolution";
  };
  city: Pick<City, "id" | "label" | "latitude" | "longitude" | "timezone">;
  trueSolarTime: CalibratedTrueSolarTime;
  pillars: Record<"year" | "month" | "day" | "hour", DestinyPillar>;
  dayMaster: {
    stem: HeavenlyStem;
    element: ElementName;
    polarity: "Yang" | "Yin";
  };
  elements: {
    percentages: ElementalSignature;
    raw: Record<ElementName, number>;
    seasonalFactors: Record<ElementName, number>;
    monthBranch: EarthlyBranch;
    method: "seasonal-qi-plus-visible-and-hidden-stems-v2";
  };
  luck: {
    direction: "forward" | "reverse";
    startAge: number;
    startYear: number;
    startSolar: string;
    currentYear: number;
    currentYearPillar: string;
    activeCycleId: string;
    activeStemBranch: string;
  };
  coordinates: {
    timeline: Array<{
      cycleId: string;
      position: DestinyCoordinate;
      zodiacAngle: number;
    }>;
    annual: Array<{
      cycleId: string;
      year: number;
      age: number;
      stemBranch: string;
      position: DestinyCoordinate;
    }>;
  };
};

export type CalculatedDestiny = {
  profile: DestinyProfile;
  chart: DestinyChart;
  activeCycleId: string;
};

export class DestinyInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DestinyInputError";
  }
}

type LunarAnnualPeriod = {
  getYear(): number;
  getAge(): number;
  getGanZhi(): string;
};

type LunarDaYunPeriod = {
  getIndex(): number;
  getGanZhi(): string;
  getStartYear(): number;
  getEndYear(): number;
  getStartAge(): number;
  getEndAge(): number;
  getLiuNian(): LunarAnnualPeriod[];
};

type LunarSolarDate = {
  toYmdHms(): string;
};

type LunarYun = {
  isForward(): boolean;
  getStartSolar(): LunarSolarDate;
  getDaYun(count: number): LunarDaYunPeriod[];
};

type LunarEightChar = {
  setSect(sect: 1 | 2): void;
  getYear(): string;
  getMonth(): string;
  getDay(): string;
  getTime(): string;
  getYun(gender: 0 | 1, sect: 1 | 2): LunarYun;
};

type LunarChartDate = {
  getEightChar(): LunarEightChar;
};

type CalculatedLuckCycle = {
  kind: "prelude" | "dayun";
  index: number;
  pillar: string;
  startYear: number;
  endYear: number;
  startDate: string;
  endDate: string;
  startInstant: number;
  endInstant: number;
  startAge: number;
  endAge: number;
  annual: Array<{ year: number; age: number; pillar: string }>;
};

const elementKeys: Record<ElementName, keyof ElementalSignature> = {
  Wood: "wood",
  Fire: "fire",
  Earth: "earth",
  Metal: "metal",
  Water: "water",
};

const elements = ["Wood", "Fire", "Earth", "Metal", "Water"] as const;
const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
const pillarKeys = ["year", "month", "day", "hour"] as const;

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

const palettes: Record<ElementName, DestinyPalette> = {
  Wood: { void: "#02080b", blue: "#2f9f9b", gold: "#c9ad63", ember: "#ff713d" },
  Fire: { void: "#090306", blue: "#556eff", gold: "#e1ae62", ember: "#ff4f22" },
  Earth: { void: "#070604", blue: "#477cd8", gold: "#d6aa5d", ember: "#e86e2f" },
  Metal: { void: "#030611", blue: "#6d87ff", gold: "#e2c179", ember: "#ff6633" },
  Water: { void: "#020610", blue: "#3e75ff", gold: "#c7a35d", ember: "#ff5a2a" },
};

const zodiac = [
  ["♈", "ARIES"],
  ["♉", "TAURUS"],
  ["♊", "GEMINI"],
  ["♋", "CANCER"],
  ["♌", "LEO"],
  ["♍", "VIRGO"],
  ["♎", "LIBRA"],
  ["♏", "SCORPIO"],
  ["♐", "SAGITTARIUS"],
  ["♑", "CAPRICORN"],
  ["♒", "AQUARIUS"],
  ["♓", "PISCES"],
].map(([glyph, name]) => ({ glyph, name }));

const cycleTitles = [
  "原点醒来",
  "边界试验",
  "能力成形",
  "主轴确立",
  "关系扩容",
  "价值回流",
  "结构重写",
  "余辉工程",
  "无界视野",
  "静默星海",
];

const hiddenStemWeights: Record<number, number[]> = {
  1: [1],
  2: [0.7, 0.3],
  3: [0.6, 0.3, 0.1],
};

const seasonalQiProfiles = {
  spring: { Wood: 1.45, Fire: 1.12, Earth: 0.78, Metal: 0.62, Water: 0.95 },
  summer: { Wood: 0.95, Fire: 1.45, Earth: 1.12, Metal: 0.78, Water: 0.62 },
  earth: { Wood: 0.72, Fire: 0.94, Earth: 1.4, Metal: 1.08, Water: 0.8 },
  autumn: { Wood: 0.62, Fire: 0.78, Earth: 0.95, Metal: 1.45, Water: 1.12 },
  winter: { Wood: 1.12, Fire: 0.62, Earth: 0.78, Metal: 0.95, Water: 1.45 },
} satisfies Record<string, Record<ElementName, number>>;

const seasonByMonthBranch: Record<EarthlyBranch, keyof typeof seasonalQiProfiles> = {
  子: "winter",
  丑: "earth",
  寅: "spring",
  卯: "spring",
  辰: "earth",
  巳: "summer",
  午: "summer",
  未: "earth",
  申: "autumn",
  酉: "autumn",
  戌: "earth",
  亥: "winter",
};

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, precision = 4) {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededUnit(seed: number, salt: number) {
  const value = Math.sin(seed * 0.000001 + salt * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function resolveBirthCity(value: string) {
  const normalized = value.trim().toLowerCase();

  if (!normalized) return undefined;

  const findExact = (candidate: string) => cities.find((city) =>
    [city.id, city.label, ...city.aliases].some(
      (entry) => entry.toLowerCase() === candidate,
    ),
  );
  const direct = findExact(normalized);
  if (direct) return direct;

  const tokenMatch = normalized
    .split(/[·,，/|]/)
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => findExact(token))
    .find(Boolean);

  return tokenMatch;
}

function wallClockFormatter(timeZone: string) {
  const cached = formatterCache.get(timeZone);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    calendar: "iso8601",
    numberingSystem: "latn",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  formatterCache.set(timeZone, formatter);
  return formatter;
}

function wallClockMilliseconds(instant: Date, timeZone: string) {
  const parts = wallClockFormatter(timeZone).formatToParts(instant);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? Number.NaN);

  return Date.UTC(
    value("year"),
    value("month") - 1,
    value("day"),
    value("hour"),
    value("minute"),
    value("second"),
  );
}

function resolveWallClockInstant(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
) {
  const targetWall = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offsetMilliseconds = new Set<number>();

  for (let deltaHours = -36; deltaHours <= 36; deltaHours += 6) {
    const sample = new Date(targetWall + deltaHours * 3_600_000);
    offsetMilliseconds.add(wallClockMilliseconds(sample, timeZone) - sample.getTime());
  }

  const candidates = [...offsetMilliseconds]
    .map((offset) => targetWall - offset)
    .filter((candidate) => wallClockMilliseconds(new Date(candidate), timeZone) === targetWall)
    .sort((left, right) => left - right);

  if (candidates.length === 0) {
    throw new DestinyInputError(
      "该城市在这个时刻发生夏令时跳时，输入的当地时间并不存在。请校准一小时后重试。",
    );
  }

  if (candidates.length > 1) {
    throw new DestinyInputError(
      "该城市的夏令时让这个钟点重复出现两次，无法唯一确定出生瞬间。请使用明确记录了 UTC 偏移的时间重新校准。",
    );
  }

  const instant = candidates[0];

  return {
    instant,
    offsetMinutes: (targetWall - instant) / 60_000,
  };
}

function dayOfYear(year: number, month: number, day: number) {
  return Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) / 86_400_000);
}

function equationOfTimeMinutes(year: number, month: number, day: number) {
  const angle = (2 * Math.PI * (dayOfYear(year, month, day) - 81)) / 364;
  return 9.87 * Math.sin(2 * angle) - 7.53 * Math.cos(angle) - 1.5 * Math.sin(angle);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function calculateCalibratedTrueSolarTime(
  input: OracleBirthInput,
  city: City,
) {
  const [year, month, day] = input.birthDate.split("-").map(Number);
  const [hour, minute] = input.birthTime.split(":").map(Number);
  const resolution = resolveWallClockInstant(
    year,
    month,
    day,
    hour,
    minute,
    city.timezone,
  );
  const { offsetMinutes } = resolution;
  const standardMeridian = offsetMinutes / 4;
  const longitudeCorrectionMinutes = (city.longitude - standardMeridian) * 4;
  const eot = equationOfTimeMinutes(year, month, day);
  const totalCorrectionMinutes = longitudeCorrectionMinutes + eot;
  const civilWallClock = Date.UTC(year, month - 1, day, hour, minute, 0);
  const corrected = new Date(civilWallClock + totalCorrectionMinutes * 60_000);
  const date = `${corrected.getUTCFullYear()}-${pad(corrected.getUTCMonth() + 1)}-${pad(corrected.getUTCDate())}`;
  const time = `${pad(corrected.getUTCHours())}:${pad(corrected.getUTCMinutes())}`;

  return {
    value: {
      date,
      time,
      isoLike: `${date}T${time}:${pad(corrected.getUTCSeconds())}`,
      timezoneOffsetMinutes: round(offsetMinutes),
      standardMeridian: round(standardMeridian),
      longitudeCorrectionMinutes: round(longitudeCorrectionMinutes),
      equationOfTimeMinutes: round(eot),
      totalCorrectionMinutes: round(totalCorrectionMinutes),
      method: "iana-wall-time+longitude+equation-of-time-v2",
    } satisfies CalibratedTrueSolarTime,
    birthInstant: resolution.instant,
    parts: {
      year: corrected.getUTCFullYear(),
      month: corrected.getUTCMonth() + 1,
      day: corrected.getUTCDate(),
      hour: corrected.getUTCHours(),
      minute: corrected.getUTCMinutes(),
      second: corrected.getUTCSeconds(),
    },
  };
}

function fixedUtc8Parts(instant: number) {
  const date = new Date(instant + 8 * 3_600_000);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    second: date.getUTCSeconds(),
  };
}

function fixedUtc8Instant(date: string, time: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute, second = 0] = time.split(":").map(Number);
  return Date.UTC(year, month - 1, day, hour, minute, second) - 8 * 3_600_000;
}

function addCalendarYears(date: string, years: number) {
  const [year, month, day] = date.split("-").map(Number);
  const targetYear = year + years;
  const lastDay = new Date(Date.UTC(targetYear, month, 0)).getUTCDate();
  return `${targetYear}-${pad(month)}-${pad(Math.min(day, lastDay))}`;
}

function addCalendarDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1, day + days));
  return `${target.getUTCFullYear()}-${pad(target.getUTCMonth() + 1)}-${pad(target.getUTCDate())}`;
}

function shanghaiToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    calendar: "iso8601",
    numberingSystem: "latn",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function pillarDetails(ganZhi: string): DestinyPillar {
  const stem = ganZhi[0] as HeavenlyStem;
  const branch = ganZhi[1] as EarthlyBranch;

  return {
    ganZhi,
    stem,
    branch,
    stemElement: stemElements[stem],
    branchElement: branchElements[branch],
  };
}

function elementStrength(pillars: Record<"year" | "month" | "day" | "hour", string>) {
  const raw = Object.fromEntries(elements.map((element) => [element, 0])) as Record<
    ElementName,
    number
  >;

  Object.values(pillars).forEach((ganZhi) => {
    const stem = ganZhi[0] as HeavenlyStem;
    const branch = ganZhi[1] as EarthlyBranch;
    raw[stemElements[stem]] += 1;

    const hidden = branchHiddenStems[branch] as readonly HeavenlyStem[];
    const weights = hiddenStemWeights[hidden.length] ?? hidden.map(() => 1 / hidden.length);
    hidden.forEach((hiddenStem, index) => {
      raw[stemElements[hiddenStem]] += weights[index];
    });
  });

  const monthBranch = pillars.month[1] as EarthlyBranch;
  const seasonalFactors = seasonalQiProfiles[seasonByMonthBranch[monthBranch]];
  elements.forEach((element) => {
    raw[element] *= seasonalFactors[element];
  });

  const total = Object.values(raw).reduce((sum, value) => sum + value, 0);
  const percentages = Object.fromEntries(
    elements.map((element) => [elementKeys[element], Math.round((raw[element] / total) * 100)]),
  ) as ElementalSignature;
  const percentageTotal = Object.values(percentages).reduce((sum, value) => sum + value, 0);
  const strongest = elements.reduce((current, element) =>
    raw[element] > raw[current] ? element : current,
  );
  percentages[elementKeys[strongest]] += 100 - percentageTotal;

  elements.forEach((element) => {
    raw[element] = round(raw[element], 2);
  });

  return { raw, percentages, strongest, seasonalFactors, monthBranch };
}

function relationScore(dayElement: ElementName, target: ElementName) {
  if (dayElement === target) return 0.18;
  if (producingCycle[target] === dayElement) return 0.56;
  if (producingCycle[dayElement] === target) return 0.34;
  if (controllingCycle[dayElement] === target) return 0.16;
  if (controllingCycle[target] === dayElement) return -0.62;
  return 0;
}

function cycleMetrics(
  pillar: string,
  dayElement: ElementName,
  elementsPercent: ElementalSignature,
  seed: number,
  index: number,
) {
  const stem = pillar[0] as HeavenlyStem;
  const branch = pillar[1] as EarthlyBranch;
  const stemElement = stemElements[stem];
  const branchElement = branchElements[branch];
  const stemShare = elementsPercent[elementKeys[stemElement]] / 100;
  const branchShare = elementsPercent[elementKeys[branchElement]] / 100;
  const resonance = relationScore(dayElement, stemElement) * 0.62
    + relationScore(dayElement, branchElement) * 0.38;
  const pulse = seededUnit(seed, index + 31) * 0.16 - 0.08;
  const intensity = clamp(0.43 + (stemShare * 0.62 + branchShare * 0.38) * 0.54 + Math.abs(resonance) * 0.16 + pulse, 0.34, 0.96);
  const valence = clamp(resonance + seededUnit(seed, index + 73) * 0.2 - 0.1, -0.86, 0.86);
  const stemIndex = stems.indexOf(stem);
  const branchIndex = branches.indexOf(branch);
  const zodiacAngle = ((branchIndex * 30 + stemIndex * 3.6 + index * 13) % 360 + 360) % 360;

  return {
    intensity: round(intensity),
    valence: round(valence),
    zodiacAngle: round(zodiacAngle, 2),
    stemElement,
    branchElement,
  };
}

function exactEightChar(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second = 0,
) {
  const lunar = Solar.fromYmdHms(year, month, day, hour, minute, second)
    .getLunar() as unknown as LunarChartDate;
  const eightChar = lunar.getEightChar();
  eightChar.setSect(2);
  return eightChar;
}

function yearPillar(year: number) {
  return exactEightChar(year, 6, 15, 12, 0).getYear();
}

function positionForCycle(
  index: number,
  total: number,
  intensity: number,
  valence: number,
  zodiacAngle: number,
): DestinyCoordinate {
  const angle = (zodiacAngle * Math.PI) / 180;
  const progress = total <= 1 ? 0.5 : index / (total - 1);

  return [
    round(-3.25 + progress * 6.5),
    round(valence * 0.92 + Math.sin(angle) * 0.24),
    round((intensity - 0.58) * 1.05 + Math.cos(angle) * 0.2),
  ];
}

function annualCoordinates(
  cycle: CalculatedLuckCycle,
  _cycleIndex: number,
  _totalCycles: number,
  basePosition: DestinyCoordinate,
) {
  const yearCount = Math.max(1, cycle.annual.length);

  return cycle.annual.map((annual, yearIndex) => {
    const { year, age, pillar } = annual;
    const stem = pillar[0] as HeavenlyStem;
    const branch = pillar[1] as EarthlyBranch;
    const angle = (
      branches.indexOf(branch) * 30
      + stems.indexOf(stem) * 3.6
      + yearIndex * 7
    ) * Math.PI / 180;
    const localProgress = yearIndex / Math.max(1, yearCount - 1);
    const position: DestinyCoordinate = [
      round(clamp(basePosition[0] + (localProgress - 0.5) * 0.48, -3.25, 3.25)),
      round(basePosition[1] + Math.sin(angle) * 0.11),
      round(basePosition[2] + Math.cos(angle) * 0.09),
    ];

    return {
      year,
      age,
      stemBranch: pillar,
      position,
    };
  });
}

function fallbackCopy(
  index: number,
  intensity: number,
  valence: number,
  isCurrent: boolean,
) {
  const keywords = valence < -0.2
    ? ["边界", "减载", "重构"]
    : intensity > 0.72
      ? ["聚焦", "扩张", "兑现"]
      : ["校准", "试验", "沉淀"];
  const prefix = isCurrent ? "你正站在这个节点里。" : "这是一段结构重写期。";
  const body = valence < -0.2
    ? "外部阻力会迫使你删掉虚假的责任感。少证明，多选择；被你拒绝的消耗，才会变成真正的自由。"
    : intensity > 0.72
      ? "机会密度上升，但速度不是唯一答案。把力量放进少数长期决定，别让高效率替你回避真正想要的生活。"
      : "答案不会一次出现，它会在重复选择中显影。保留试错的空间，同时停止为已经失效的身份续费。";

  return {
    label: cycleTitles[index % cycleTitles.length],
    keywords,
    insight: `${prefix}${body}`,
  };
}

export function calculateDestiny(input: OracleBirthInput): CalculatedDestiny {
  const city = resolveBirthCity(input.birthplace);

  if (!city) {
    throw new DestinyInputError(
      `暂时无法校准“${input.birthplace}”。请选择系统支持的出生城市。`,
    );
  }

  const calibration = calculateCalibratedTrueSolarTime(input, city);

  if (calibration.birthInstant > Date.now()) {
    throw new DestinyInputError("出生时刻尚未发生，请检查城市、日期与当地时间。");
  }

  const jieQiParts = fixedUtc8Parts(calibration.birthInstant);
  const jieQiEightChar = exactEightChar(
    jieQiParts.year,
    jieQiParts.month,
    jieQiParts.day,
    jieQiParts.hour,
    jieQiParts.minute,
    jieQiParts.second,
  );
  const dayHourEightChar = exactEightChar(
    calibration.parts.year,
    calibration.parts.month,
    calibration.parts.day,
    calibration.parts.hour,
    calibration.parts.minute,
    calibration.parts.second,
  );
  const exactPillars = {
    year: jieQiEightChar.getYear(),
    month: jieQiEightChar.getMonth(),
    day: dayHourEightChar.getDay(),
    hour: dayHourEightChar.getTime(),
  };
  const dayMaster = exactPillars.day[0] as HeavenlyStem;
  const yun = jieQiEightChar.getYun(input.gender === "male" ? 1 : 0, 2);
  const luckStartSolar = yun.getStartSolar().toYmdHms();
  const [luckStartDate, luckStartTime] = luckStartSolar.split(" ");
  const luckStartInstant = fixedUtc8Instant(luckStartDate, luckStartTime);
  const rawPeriods = yun.getDaYun(15);
  const formalLuck: CalculatedLuckCycle[] = rawPeriods
    .filter((period) => period.getIndex() > 0)
    .map((period) => {
      const startDate = addCalendarYears(luckStartDate, (period.getIndex() - 1) * 10);
      const nextStartDate = addCalendarYears(luckStartDate, period.getIndex() * 10);
      return {
        kind: "dayun",
        index: period.getIndex(),
        pillar: period.getGanZhi(),
        startYear: period.getStartYear(),
        endYear: period.getEndYear(),
        startDate,
        endDate: addCalendarDays(nextStartDate, -1),
        startInstant: fixedUtc8Instant(startDate, luckStartTime),
        endInstant: fixedUtc8Instant(nextStartDate, luckStartTime) - 1,
        startAge: period.getStartAge(),
        endAge: period.getEndAge(),
        annual: period.getLiuNian().map((annual) => ({
          year: annual.getYear(),
          age: annual.getAge(),
          pillar: annual.getGanZhi(),
        })),
      };
    });
  const firstFormal = formalLuck[0];

  if (!firstFormal) {
    throw new Error("排盘引擎没有生成正式大运。");
  }

  const birthYear = Number(input.birthDate.slice(0, 4));
  const preludeEndParts = fixedUtc8Parts(luckStartInstant - 1);
  const preludeEndDate = `${preludeEndParts.year}-${pad(preludeEndParts.month)}-${pad(preludeEndParts.day)}`;
  const prelude: CalculatedLuckCycle | null = luckStartInstant > calibration.birthInstant
    ? {
        kind: "prelude",
        index: 0,
        pillar: exactPillars.month,
        startYear: birthYear,
        endYear: Number(preludeEndDate.slice(0, 4)),
        startDate: input.birthDate,
        endDate: preludeEndDate,
        startInstant: calibration.birthInstant,
        endInstant: luckStartInstant - 1,
        startAge: 1,
        endAge: Number(preludeEndDate.slice(0, 4)) - birthYear + 1,
        annual: Array.from(
          { length: Number(preludeEndDate.slice(0, 4)) - birthYear + 1 },
          (_, yearOffset) => {
            const year = birthYear + yearOffset;
            return { year, age: yearOffset + 1, pillar: yearPillar(year) };
          },
        ),
      }
    : null;
  const currentDate = shanghaiToday();
  const currentYear = Number(currentDate.slice(0, 4));
  const now = Date.now();
  const activeFormalIndex = formalLuck.findIndex(
    (cycle) => now >= cycle.startInstant && now <= cycle.endInstant,
  );
  const preludeIsActive = Boolean(
    prelude && now >= prelude.startInstant && now <= prelude.endInstant,
  );
  let visibleLuck: CalculatedLuckCycle[];

  if (preludeIsActive && prelude) {
    visibleLuck = [prelude, ...formalLuck.slice(0, 9)];
  } else if (activeFormalIndex >= 0) {
    const windowStart = activeFormalIndex < 10 ? 0 : activeFormalIndex - 9;
    visibleLuck = formalLuck.slice(windowStart, windowStart + 10);
  } else if (now > formalLuck[formalLuck.length - 1].endInstant) {
    throw new Error("当前年份超出大运计算范围。");
  } else {
    visibleLuck = formalLuck.slice(0, 10);
  }

  const strength = elementStrength(exactPillars);
  const seed = hashString(
    `${input.birthDate}|${input.birthTime}|${city.id}|${input.gender}`,
  );
  const dayElement = stemElements[dayMaster];
  const cycles = visibleLuck.map((luck, index) => {
    const id = luck.kind === "prelude"
      ? `prelude-${luck.startYear}-${luck.endYear}`
      : `cycle-${luck.index}-${luck.startYear}`;
    const metrics = cycleMetrics(
      luck.pillar,
      dayElement,
      strength.percentages,
      seed,
      index,
    );
    const position = positionForCycle(
      index,
      visibleLuck.length,
      metrics.intensity,
      metrics.valence,
      metrics.zodiacAngle,
    );
    const isCurrent = now >= luck.startInstant && now <= luck.endInstant;
    const copy = fallbackCopy(index, metrics.intensity, metrics.valence, isCurrent);

    return {
      id,
      age: luck.startAge,
      decade: `${luck.startAge.toString().padStart(2, "0")}—${luck.endAge.toString().padStart(2, "0")}`,
      label: luck.kind === "prelude" ? "起运前奏" : copy.label,
      stemBranch: luck.pillar,
      intensity: metrics.intensity,
      valence: metrics.valence,
      keywords: copy.keywords,
      insight: copy.insight,
      startYear: luck.startYear,
      endYear: luck.endYear,
      startDate: luck.startDate,
      endDate: luck.endDate,
      position,
      zodiacAngle: metrics.zodiacAngle,
      isCurrent,
      kind: luck.kind,
    } satisfies DestinyCycle;
  });
  const activeCycle = cycles.find((cycle) => cycle.isCurrent);

  if (!activeCycle) {
    throw new Error("排盘引擎没有生成覆盖当前年份的节点。");
  }

  const profile: DestinyProfile = {
    id: `DP-${seed.toString(16).toUpperCase().padStart(8, "0")}`,
    subject: "观测者 / ULTRA",
    birth: {
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      birthplace: city.label,
      gender: input.gender,
    },
    generatedAt: new Date().toISOString(),
    palette: palettes[strength.strongest],
    elements: strength.percentages,
    cycles,
    zodiac,
    jiazi: Array.from(
      { length: 60 },
      (_, index) => `${stems[index % stems.length]}${branches[index % branches.length]}`,
    ),
  };
  const pillars = Object.fromEntries(
    pillarKeys.map((key) => [key, pillarDetails(exactPillars[key])]),
  ) as DestinyChart["pillars"];
  const annual = cycles.flatMap((cycle, index) =>
    annualCoordinates(
      visibleLuck[index],
      index,
      cycles.length,
      cycle.position as DestinyCoordinate,
    ).map((coordinate) => ({
      cycleId: cycle.id,
      ...coordinate,
    })),
  );
  const chart: DestinyChart = {
    engine: "lunar-javascript+destinypixel-v3",
    convention: {
      yearMonth: "birth-instant-vs-beijing-jieqi",
      dayHour: "local-apparent-solar-time-sect-2",
      luck: "yun-sect-2-minute-resolution",
    },
    city: {
      id: city.id,
      label: city.label,
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone,
    },
    trueSolarTime: calibration.value,
    pillars,
    dayMaster: {
      stem: dayMaster,
      element: dayElement,
      polarity: stemPolarity[dayMaster],
    },
    elements: {
      percentages: strength.percentages,
      raw: strength.raw,
      seasonalFactors: strength.seasonalFactors,
      monthBranch: strength.monthBranch,
      method: "seasonal-qi-plus-visible-and-hidden-stems-v2",
    },
    luck: {
      direction: yun.isForward() ? "forward" : "reverse",
      startAge: firstFormal.startAge,
      startYear: firstFormal.startYear,
      startSolar: luckStartSolar,
      currentYear,
      currentYearPillar: yearPillar(currentYear),
      activeCycleId: activeCycle.id,
      activeStemBranch: activeCycle.kind === "prelude" ? "未起运" : activeCycle.stemBranch,
    },
    coordinates: {
      timeline: cycles.map((cycle) => ({
        cycleId: cycle.id,
        position: cycle.position as DestinyCoordinate,
        zodiacAngle: cycle.zodiacAngle ?? 0,
      })),
      annual,
    },
  };

  return { profile, chart, activeCycleId: activeCycle.id };
}

export const destinyCalculatorInternals = {
  calculateCalibratedTrueSolarTime,
  elementStrength,
  resolveBirthCity,
  resolveWallClockInstant,
};
