import { Solar } from "lunar-javascript";
import { hexagramSymbol, kingWenFromBits } from "@/lib/hexagram-learning/identity";

/** Coins are recorded in toss order; lines are always recorded from bottom to top. */
export type CoinValue = 2 | 3;
export type CoinToss = readonly [CoinValue, CoinValue, CoinValue];
export type LineValue = 6 | 7 | 8 | 9;
export type BinaryBit = 0 | 1;
export type TrigramKey = "qian" | "dui" | "li" | "zhen" | "xun" | "kan" | "gen" | "kun";

export const MAX_COUNT = 1_000_000_000;
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;
export const BEIJING_TIME_ZONE = "Asia/Shanghai";

export type CastErrorCode =
  | "invalid-line-count"
  | "invalid-line-value"
  | "invalid-coins"
  | "invalid-numbers"
  | "invalid-lunar-date"
  | "invalid-year-branch"
  | "invalid-hour-branch"
  | "invalid-datetime"
  | "unsupported-year"
  | "crypto-unavailable";

export class CastInputError extends RangeError {
  constructor(public readonly code: CastErrorCode, message: string) {
    super(message);
    this.name = "CastInputError";
  }
}

export type CastLine = {
  /** 1 = the bottom line; 6 = the top line. */
  index: number;
  value: LineValue;
  yang: boolean;
  moving: boolean;
  changedYang: boolean;
  /** 2 = inscribed face; 3 = reverse face. No ordering is assigned a meaning. */
  coins?: CoinToss;
};

export type TrigramResult = {
  key: TrigramKey;
  /** Earlier Heaven counting: Qian 1, Dui 2, Li 3, Zhen 4, Xun 5, Kan 6, Gen 7, Kun 8. */
  number: number;
  bitsBottomUp: BinaryBit[];
};

export type HexagramResult = {
  number: number;
  id: string;
  symbol: string;
  bitsBottomUp: BinaryBit[];
  lines: { index: number; yang: boolean }[];
  lowerTrigram: TrigramResult;
  upperTrigram: TrigramResult;
};

export type MeihuaCalculation = {
  upperSum: number;
  lowerSum: number;
  movingSum: number;
  upperRemainder: number;
  lowerRemainder: number;
  movingRemainder: number;
};

export type LunarTimeInput = {
  yearBranch: number;
  lunarMonth: number;
  lunarDay: number;
  hourBranch: number;
  isLeapMonth?: boolean;
};

export type BeijingCalendar = LunarTimeInput & {
  solarDateTime: string;
  timeZone: typeof BEIJING_TIME_ZONE;
  lunarYear: number;
  isLeapMonth: boolean;
  yearBranchName: string;
  hourBranchName: string;
};

export type CastResult = {
  method: "coins" | "manual" | "numbers" | "time";
  lines: CastLine[];
  movingLines: number[];
  base: HexagramResult;
  changed: HexagramResult;
  calculation?: MeihuaCalculation;
  calendar?: BeijingCalendar;
};

const trigrams: readonly { key: TrigramKey; bits: readonly BinaryBit[] }[] = [
  { key: "qian", bits: [1, 1, 1] },
  { key: "dui", bits: [1, 1, 0] },
  { key: "li", bits: [1, 0, 1] },
  { key: "zhen", bits: [1, 0, 0] },
  { key: "xun", bits: [0, 1, 1] },
  { key: "kan", bits: [0, 1, 0] },
  { key: "gen", bits: [0, 0, 1] },
  { key: "kun", bits: [0, 0, 0] },
];
const branchNames = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

function isIntegerInRange(value: number, minimum: number, maximum: number) {
  return Number.isSafeInteger(value) && value >= minimum && value <= maximum;
}

/** Traditional positive remainder: exact multiples map to the divisor, never to zero. */
export function positiveRemainder(value: number, divisor: 6 | 8) {
  if (!isIntegerInRange(value, 1, Number.MAX_SAFE_INTEGER) || (divisor !== 6 && divisor !== 8)) {
    throw new CastInputError("invalid-numbers", "Remainders require a positive safe integer and divisor 6 or 8.");
  }
  return value % divisor || divisor;
}

function trigramFromBits(bits: readonly BinaryBit[]): TrigramResult {
  const index = trigrams.findIndex((trigram) => trigram.bits.join("") === bits.join(""));
  if (index < 0) throw new CastInputError("invalid-line-value", "A trigram needs three binary lines.");
  return { key: trigrams[index].key, number: index + 1, bitsBottomUp: [...bits] };
}

function hexagramFromBits(bits: BinaryBit[]): HexagramResult {
  const number = kingWenFromBits(bits);
  if (number === undefined) throw new CastInputError("invalid-line-value", "A hexagram needs six binary lines.");
  return {
    number,
    id: `hexagram-${String(number).padStart(2, "0")}`,
    symbol: hexagramSymbol(number),
    bitsBottomUp: [...bits],
    lines: bits.map((bit, index) => ({ index: index + 1, yang: bit === 1 })),
    lowerTrigram: trigramFromBits(bits.slice(0, 3)),
    upperTrigram: trigramFromBits(bits.slice(3, 6)),
  };
}

function buildCast(values: readonly LineValue[], method: CastResult["method"], tosses?: readonly CoinToss[]): CastResult {
  const lines: CastLine[] = values.map((value, index) => {
    const yang = value === 7 || value === 9;
    const moving = value === 6 || value === 9;
    return {
      index: index + 1,
      value,
      yang,
      moving,
      changedYang: moving ? !yang : yang,
      ...(tosses ? { coins: [...tosses[index]] as [CoinValue, CoinValue, CoinValue] } : {}),
    };
  });
  return {
    method,
    lines,
    movingLines: lines.filter((line) => line.moving).map((line) => line.index),
    base: hexagramFromBits(lines.map((line) => line.yang ? 1 : 0)),
    changed: hexagramFromBits(lines.map((line) => line.changedYang ? 1 : 0)),
  };
}

export function coinTossToLineValue(coins: readonly number[]): LineValue {
  if (!Array.isArray(coins) || coins.length !== 3 || Array.from(coins).some((coin) => coin !== 2 && coin !== 3)) {
    throw new CastInputError("invalid-coins", "Each toss must contain exactly three coin faces, each 2 or 3.");
  }
  return (coins[0] + coins[1] + coins[2]) as LineValue;
}

/** Independent, unbiased browser cryptographic bits; this does not confer predictive accuracy. */
export function tossThreeCoins(): CoinToss {
  if (!globalThis.crypto?.getRandomValues) {
    throw new CastInputError("crypto-unavailable", "Secure random coin tossing is unavailable in this environment.");
  }
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(3));
  return Array.from(bytes, (byte) => (byte & 1) === 0 ? 2 : 3) as [CoinValue, CoinValue, CoinValue];
}

export function castCoinTosses(tosses: readonly CoinToss[]): CastResult {
  if (!Array.isArray(tosses) || tosses.length !== 6) {
    throw new CastInputError("invalid-line-count", "Six tosses are required, from the bottom line upward.");
  }
  const values = Array.from(tosses, (coins) => coinTossToLineValue(coins));
  return buildCast(values, "coins", tosses);
}

export function castAllCoins(): CastResult {
  return castCoinTosses(Array.from({ length: 6 }, () => tossThreeCoins()));
}

export function castManualLines(values: readonly number[]): CastResult {
  if (!Array.isArray(values) || values.length !== 6) {
    throw new CastInputError("invalid-line-count", "Exactly six values are required, from the bottom line upward.");
  }
  const copy = Array.from(values);
  if (copy.some((value) => value !== 6 && value !== 7 && value !== 8 && value !== 9)) {
    throw new CastInputError("invalid-line-value", "Line values must be 6, 7, 8 or 9.");
  }
  return buildCast(copy as LineValue[], "manual");
}

function castMeihua(upperSum: number, lowerSum: number, movingSum: number, method: "numbers" | "time"): CastResult {
  const upperRemainder = positiveRemainder(upperSum, 8);
  const lowerRemainder = positiveRemainder(lowerSum, 8);
  const movingRemainder = positiveRemainder(movingSum, 6);
  const bits = [...trigrams[lowerRemainder - 1].bits, ...trigrams[upperRemainder - 1].bits];
  const values: LineValue[] = bits.map((bit, index) => {
    if (index + 1 === movingRemainder) return bit === 1 ? 9 : 6;
    return bit === 1 ? 7 : 8;
  });
  return {
    ...buildCast(values, method),
    calculation: { upperSum, lowerSum, movingSum, upperRemainder, lowerRemainder, movingRemainder },
  };
}

/** Plum Blossom counting method: upper R8(A), lower R8(B), moving R6(A + B + hour branch). */
export function castNumbers({ upperNumber, lowerNumber, hourBranch }: {
  upperNumber: number;
  lowerNumber: number;
  hourBranch: number;
}): CastResult {
  if (!isIntegerInRange(upperNumber, 1, MAX_COUNT) || !isIntegerInRange(lowerNumber, 1, MAX_COUNT)) {
    throw new CastInputError("invalid-numbers", `Both counts must be integers from 1 to ${MAX_COUNT}.`);
  }
  if (!isIntegerInRange(hourBranch, 1, 12)) {
    throw new CastInputError("invalid-hour-branch", "Hour branch must be an integer from Zi 1 through Hai 12.");
  }
  return castMeihua(upperNumber, lowerNumber, upperNumber + lowerNumber + hourBranch, "numbers");
}

/** A historical arithmetic input; month length is checked when a concrete solar date is supplied. */
export function castLunarTime({ yearBranch, lunarMonth, lunarDay, hourBranch, isLeapMonth = false }: LunarTimeInput): CastResult {
  if (!isIntegerInRange(yearBranch, 1, 12)) {
    throw new CastInputError("invalid-year-branch", "Year branch must be an integer from Zi 1 through Hai 12.");
  }
  if (!isIntegerInRange(lunarMonth, 1, 12) || !isIntegerInRange(lunarDay, 1, 30) || typeof isLeapMonth !== "boolean") {
    throw new CastInputError("invalid-lunar-date", "Lunar month must be 1–12 and day 1–30; leap status must be boolean.");
  }
  if (!isIntegerInRange(hourBranch, 1, 12)) {
    throw new CastInputError("invalid-hour-branch", "Hour branch must be an integer from Zi 1 through Hai 12.");
  }
  const upperSum = yearBranch + lunarMonth + lunarDay;
  const lowerSum = upperSum + hourBranch;
  return castMeihua(upperSum, lowerSum, lowerSum, "time");
}

/**
 * Civil date/time in fixed Beijing UTC+08, irrespective of browser timezone.
 * Lunar New Year changes the year branch; midnight changes the lunar day.
 * 23:00–23:59 is Zi hour of the current day, and leap months retain their month number.
 * This is Plum Blossom arithmetic, not a complete Na Jia six-line chart.
 */
export function castBeijingTime(dateTime: string): CastResult & { calendar: BeijingCalendar } {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(dateTime);
  if (!match) throw new CastInputError("invalid-datetime", "Use a Beijing civil date and time in YYYY-MM-DDTHH:mm format.");
  const [year, month, day, hour, minute, second] = match.slice(1).map((part) => part === undefined ? 0 : Number(part));
  if (!isIntegerInRange(year, MIN_YEAR, MAX_YEAR)) {
    throw new CastInputError("unsupported-year", `Solar year must be ${MIN_YEAR}–${MAX_YEAR}.`);
  }
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (!isIntegerInRange(month, 1, 12) || !isIntegerInRange(day, 1, 31) || !isIntegerInRange(hour, 0, 23)
    || !isIntegerInRange(minute, 0, 59) || !isIntegerInRange(second, 0, 59)
    || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new CastInputError("invalid-datetime", "The civil date or time does not exist.");
  }

  const lunar = Solar.fromYmdHms(year, month, day, hour, minute, second).getLunar();
  const yearBranch = lunar.getYearZhiIndex() + 1;
  // Explicit civil-clock calculation makes late Zi and the midnight boundary auditable.
  const hourBranch = Math.floor((hour + 1) / 2) % 12 + 1;
  const calendar: BeijingCalendar = {
    solarDateTime: `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6] ?? "00"}`,
    timeZone: BEIJING_TIME_ZONE,
    lunarYear: lunar.getYear(),
    lunarMonth: Math.abs(lunar.getMonth()),
    lunarDay: lunar.getDay(),
    isLeapMonth: lunar.getMonth() < 0,
    yearBranch,
    yearBranchName: branchNames[yearBranch - 1],
    hourBranch,
    hourBranchName: branchNames[hourBranch - 1],
  };
  return { ...castLunarTime(calendar), calendar };
}
