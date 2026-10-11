import assert from "node:assert/strict";
import { mock, test } from "node:test";
import identities from "@/content/hexagrams/identities.verified.json";
import { castOracle } from "@/lib/oracle/cast";
import {
  BEIJING_TIME_ZONE,
  CastInputError,
  MAX_COUNT,
  MAX_YEAR,
  MIN_YEAR,
  castAllCoins,
  castBeijingTime,
  castCoinTosses,
  castLunarTime,
  castManualLines,
  castNumbers,
  coinTossToLineValue,
  positiveRemainder,
  tossThreeCoins,
  type CastErrorCode,
  type CoinToss,
  type CoinValue,
} from "./cast";

function expectError(code: CastErrorCode, action: () => unknown) {
  assert.throws(action, (error: unknown) => error instanceof CastInputError && error.code === code);
}

test("all eight equally likely three-coin combinations yield the exact 1:3:3:1 distribution", () => {
  const counts = new Map<number, number>([[6, 0], [7, 0], [8, 0], [9, 0]]);
  for (let combination = 0; combination < 8; combination += 1) {
    const coins = Array.from({ length: 3 }, (_, index) => 2 + ((combination >> index) & 1)) as CoinValue[];
    const value = coinTossToLineValue(coins);
    counts.set(value, counts.get(value)! + 1);
  }
  assert.deepEqual([...counts], [[6, 1], [7, 3], [8, 3], [9, 1]]);
});

test("crypto tosses request independent bytes and preserve all eighteen original coin faces", () => {
  let calls = 0;
  const randomMock = mock.method(globalThis.crypto, "getRandomValues", (bytes: Uint8Array) => {
    assert.equal(bytes.length, 3);
    bytes.set(calls % 2 === 0 ? [0, 255, 128] : [1, 254, 129]);
    calls += 1;
    return bytes;
  });
  try {
    assert.deepEqual(tossThreeCoins(), [2, 3, 2]);
    calls = 0;
    const result = castAllCoins();
    assert.equal(calls, 6);
    assert.equal(result.method, "coins");
    assert.deepEqual(result.lines.map((line) => line.coins), [
      [2, 3, 2], [3, 2, 3], [2, 3, 2], [3, 2, 3], [2, 3, 2], [3, 2, 3],
    ]);
    assert.deepEqual(result.lines.map((line) => line.value), [7, 8, 7, 8, 7, 8]);
    assert.deepEqual(result.movingLines, []);
    assert.equal(result.changed.number, result.base.number);
  } finally {
    randomMock.mock.restore();
  }
});

test("manual and coin inputs retain bottom-up line order and do not alias the caller's input", () => {
  const tosses: [CoinValue, CoinValue, CoinValue][] = [
    [2, 2, 2], [2, 2, 3], [2, 3, 3], [3, 3, 3], [3, 2, 2], [3, 3, 2],
  ];
  const result = castCoinTosses(tosses);
  assert.deepEqual(result.lines.map((line) => line.value), [6, 7, 8, 9, 7, 8]);
  assert.deepEqual(result.lines.map((line) => line.index), [1, 2, 3, 4, 5, 6]);
  assert.equal(result.base.number, 47);
  assert.equal(result.changed.number, 60);
  assert.deepEqual(result.movingLines, [1, 4]);
  assert.deepEqual(result.base.bitsBottomUp, [0, 1, 0, 1, 1, 0]);
  assert.deepEqual(result.changed.bitsBottomUp, [1, 1, 0, 0, 1, 0]);
  tosses[0][0] = 3;
  assert.deepEqual(result.lines[0].coins, [2, 2, 2]);
  const manual = [6, 7, 8, 9, 7, 8];
  assert.deepEqual(castManualLines(manual).base, result.base);
  manual[0] = 9;
  assert.equal(result.lines[0].value, 6);
});

test("all 64 stable hexagrams preserve the approved King Wen names, symbols, and upper/lower identities", () => {
  const seen = new Set<number>();
  for (const identity of identities.hexagrams) {
    const result = castManualLines(identity.linesBottomUp.map((bit) => bit === 1 ? 7 : 8));
    assert.equal(result.base.number, identity.kingWenNumber);
    assert.equal(result.base.id, identity.id);
    assert.equal(result.base.symbol, identity.unicode);
    assert.deepEqual(result.base.bitsBottomUp, identity.linesBottomUp);
    assert.equal(result.base.lowerTrigram.key, identity.lowerTrigram.id);
    assert.equal(result.base.upperTrigram.key, identity.upperTrigram.id);
    assert.deepEqual(result.base.lowerTrigram.bitsBottomUp, identity.lowerTrigram.linesBottomUp);
    assert.deepEqual(result.base.upperTrigram.bitsBottomUp, identity.upperTrigram.linesBottomUp);
    assert.deepEqual(result.base, result.changed);
    assert.deepEqual(result.movingLines, []);
    seen.add(result.base.number);
  }
  assert.equal(seen.size, 64);
});

test("all 4096 six-line value inputs map both hexagrams correctly; only 6 and 9 move", () => {
  const byBits = new Map(identities.hexagrams.map((identity) => [identity.linesBottomUp.join(""), identity]));
  for (let pattern = 0; pattern < 4 ** 6; pattern += 1) {
    const values = Array.from({ length: 6 }, (_, index) => 6 + ((pattern >> (index * 2)) & 3));
    const baseBits = values.map((value) => value % 2 === 1 ? 1 : 0);
    const changedBits = values.map((value) => value === 6 || value === 7 ? 1 : 0);
    const movingLines = values.flatMap((value, index) => value === 6 || value === 9 ? [index + 1] : []);
    const result = castManualLines(values);
    assert.equal(result.base.number, byBits.get(baseBits.join(""))!.kingWenNumber, `base pattern ${pattern}`);
    assert.equal(result.changed.number, byBits.get(changedBits.join(""))!.kingWenNumber, `changed pattern ${pattern}`);
    assert.deepEqual(result.base.bitsBottomUp, baseBits);
    assert.deepEqual(result.changed.bitsBottomUp, changedBits);
    assert.deepEqual(result.movingLines, movingLines);
    assert.deepEqual(result.lines.map((line) => Number(line.changedYang)), changedBits);
  }
});

test("positive remainders assign exact multiples to 8 or 6 rather than zero", () => {
  assert.equal(positiveRemainder(8, 8), 8);
  assert.equal(positiveRemainder(16, 8), 8);
  assert.equal(positiveRemainder(6, 6), 6);
  assert.equal(positiveRemainder(12, 6), 6);
  assert.equal(positiveRemainder(9, 8), 1);
  for (const value of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    expectError("invalid-numbers", () => positiveRemainder(value, 8));
  }
});

test("Plum Blossom counting regression: A1 + B5 + You10 produces Gou44, line 4, then Xun57", () => {
  const result = castNumbers({ upperNumber: 1, lowerNumber: 5, hourBranch: 10 });
  assert.equal(result.method, "numbers");
  assert.equal(result.base.number, 44);
  assert.equal(result.base.upperTrigram.key, "qian");
  assert.equal(result.base.lowerTrigram.key, "xun");
  assert.deepEqual(result.movingLines, [4]);
  assert.equal(result.changed.number, 57);
  assert.deepEqual(result.calculation, {
    upperSum: 1, lowerSum: 5, movingSum: 16, upperRemainder: 1, lowerRemainder: 5, movingRemainder: 4,
  });
  const exactMultiples = castNumbers({ upperNumber: 8, lowerNumber: 8, hourBranch: 2 });
  assert.equal(exactMultiples.base.number, 2);
  assert.deepEqual(exactMultiples.movingLines, [6]);
});

test("Plum Blossom observing-plum regression: Chen5 + month12 + day17 + Shen9 produces Ge49, line 1, then Xian31", () => {
  const result = castLunarTime({ yearBranch: 5, lunarMonth: 12, lunarDay: 17, hourBranch: 9 });
  assert.equal(result.method, "time");
  assert.equal(result.base.number, 49);
  assert.equal(result.base.upperTrigram.key, "dui");
  assert.equal(result.base.lowerTrigram.key, "li");
  assert.deepEqual(result.movingLines, [1]);
  assert.equal(result.changed.number, 31);
  assert.deepEqual(result.calculation, {
    upperSum: 34, lowerSum: 43, movingSum: 43, upperRemainder: 2, lowerRemainder: 3, movingRemainder: 1,
  });
});

test("Beijing time changes lunar year at Lunar New Year, retaining the current date at late Zi", () => {
  const lastEvening = castBeijingTime("2026-02-16T22:59");
  const lateZi = castBeijingTime("2026-02-16T23:00");
  const midnight = castBeijingTime("2026-02-17T00:00");
  assert.equal(lastEvening.calendar.timeZone, BEIJING_TIME_ZONE);
  assert.equal(lastEvening.calendar.lunarYear, 2025);
  assert.equal(lastEvening.calendar.yearBranch, 6);
  assert.equal(lastEvening.calendar.yearBranchName, "巳");
  assert.equal(lastEvening.calendar.lunarMonth, 12);
  assert.equal(lastEvening.calendar.lunarDay, 29);
  assert.equal(lastEvening.calendar.hourBranch, 12);
  assert.equal(lateZi.calendar.hourBranch, 1);
  assert.equal(lateZi.calendar.lunarDay, 29);
  assert.equal(lateZi.calendar.yearBranch, 6);
  assert.equal(midnight.calendar.lunarYear, 2026);
  assert.equal(midnight.calendar.yearBranch, 7);
  assert.equal(midnight.calendar.yearBranchName, "午");
  assert.equal(midnight.calendar.lunarMonth, 1);
  assert.equal(midnight.calendar.lunarDay, 1);
  assert.equal(midnight.calendar.hourBranch, 1);
  assert.deepEqual(midnight.calculation, {
    upperSum: 9, lowerSum: 10, movingSum: 10, upperRemainder: 1, lowerRemainder: 2, movingRemainder: 4,
  });
});

test("Zi ends at 01:00 and every subsequent civil hour branch follows a two-hour interval", () => {
  assert.equal(castBeijingTime("2026-02-17T00:59").calendar.hourBranch, 1);
  assert.equal(castBeijingTime("2026-02-17T01:00").calendar.hourBranch, 2);
  for (let branch = 2; branch <= 12; branch += 1) {
    const startHour = (branch - 1) * 2 - 1;
    for (const [hour, minute] of [[startHour, 0], [startHour + 1, 59]]) {
      const result = castBeijingTime(`2026-02-17T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
      assert.equal(result.calendar.hourBranch, branch);
    }
  }
});

test("leap lunar months retain the displayed month number and the same arithmetic", () => {
  const result = castBeijingTime("2023-03-22T12:00");
  assert.equal(result.calendar.lunarYear, 2023);
  assert.equal(result.calendar.lunarMonth, 2);
  assert.equal(result.calendar.lunarDay, 1);
  assert.equal(result.calendar.isLeapMonth, true);
  assert.equal(result.calendar.yearBranch, 4);
  const normal = castLunarTime({ yearBranch: 4, lunarMonth: 2, lunarDay: 1, hourBranch: 7 });
  assert.deepEqual(result.calculation, normal.calculation);
  assert.deepEqual(result.base, normal.base);
  assert.deepEqual(result.changed, normal.changed);
  assert.equal(castBeijingTime("2023-02-20T12:00").calendar.isLeapMonth, false);
});

test("civil conversion is independent of the process or browser timezone", () => {
  const originalTimeZone = process.env.TZ;
  try {
    process.env.TZ = "Pacific/Honolulu";
    const honolulu = castBeijingTime("2026-02-17T00:01");
    process.env.TZ = "Europe/London";
    assert.deepEqual(castBeijingTime("2026-02-17T00:01"), honolulu);
    process.env.TZ = "Asia/Shanghai";
    assert.deepEqual(castBeijingTime("2026-02-17T00:01:00"), honolulu);
  } finally {
    if (originalTimeZone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimeZone;
  }
});

test("manual entry rejects incomplete, sparse, non-integer, and out-of-range lines or coin faces", () => {
  for (const values of [[], [7, 7, 7], Array(7).fill(7)]) {
    expectError("invalid-line-count", () => castManualLines(values));
  }
  for (const invalid of [0, 5, 10, 7.5, NaN, Infinity]) {
    expectError("invalid-line-value", () => castManualLines([7, 7, invalid, 7, 7, 7]));
  }
  expectError("invalid-line-value", () => castManualLines(Array(6)));
  for (const values of [[], [2, 3], [2, 2, 2, 2], [1, 2, 3], [2, 2, 2.5], [2, 3, NaN], Array(3)]) {
    expectError("invalid-coins", () => coinTossToLineValue(values));
  }
  expectError("invalid-line-count", () => castCoinTosses(Array(5).fill([2, 2, 2]) as CoinToss[]));
  expectError("invalid-coins", () => castCoinTosses(Array(6) as CoinToss[]));
});

test("count and lunar arithmetic reject zero, unsafe values, fractions, and out-of-range branch/month/day", () => {
  for (const value of [0, -1, 1.5, NaN, Infinity, MAX_COUNT + 1, Number.MAX_SAFE_INTEGER]) {
    expectError("invalid-numbers", () => castNumbers({ upperNumber: value, lowerNumber: 1, hourBranch: 1 }));
    expectError("invalid-numbers", () => castNumbers({ upperNumber: 1, lowerNumber: value, hourBranch: 1 }));
  }
  assert.ok(castNumbers({ upperNumber: MAX_COUNT, lowerNumber: MAX_COUNT, hourBranch: 12 }).base.number);
  const validLunar = { yearBranch: 5, lunarMonth: 12, lunarDay: 17, hourBranch: 9 };
  for (const value of [0, 13, 1.5, NaN]) {
    expectError("invalid-year-branch", () => castLunarTime({ ...validLunar, yearBranch: value }));
    expectError("invalid-hour-branch", () => castLunarTime({ ...validLunar, hourBranch: value }));
    expectError("invalid-hour-branch", () => castNumbers({ upperNumber: 1, lowerNumber: 1, hourBranch: value }));
    expectError("invalid-lunar-date", () => castLunarTime({ ...validLunar, lunarMonth: value }));
  }
  for (const value of [0, 31, 17.5, NaN]) {
    expectError("invalid-lunar-date", () => castLunarTime({ ...validLunar, lunarDay: value }));
  }
});

test("civil conversion strictly validates supported years, date existence, and local-only time format", () => {
  assert.ok(castBeijingTime(`${MIN_YEAR}-01-01T00:00`).base.number);
  assert.ok(castBeijingTime(`${MAX_YEAR}-12-31T23:59`).base.number);
  for (const year of [MIN_YEAR - 1, MAX_YEAR + 1]) {
    expectError("unsupported-year", () => castBeijingTime(`${year}-01-01T00:00`));
  }
  for (const dateTime of [
    "2026-02-30T12:00", "2026-02-29T12:00", "1900-02-29T12:00", "2100-02-29T12:00",
    "2026-00-01T12:00", "2026-13-01T12:00", "2026-04-31T12:00", "2026-01-00T12:00",
    "2026-02-17T24:00", "2026-02-17T23:60", "2026-02-17T23:59:60",
    "2026-2-17T12:00", "2026-02-17 12:00", "2026-02-17T12:00Z", "2026-02-17T12:00+08:00", "",
  ]) {
    expectError("invalid-datetime", () => castBeijingTime(dateTime));
  }
  assert.equal(castBeijingTime("2000-02-29T12:34:56").calendar.solarDateTime, "2000-02-29T12:34:56");
});

test("the new independent workbench leaves the released report seed and Tarot sequence intact", () => {
  const result = castOracle({
    question: "How can I approach this?", questionTime: "2026-10-07T12:00:00Z", birthDate: "1990-01-15", domain: "work",
  });
  assert.equal(result.seed, 1596815601);
  assert.deepEqual(result.lines.map((line) => line.value), [7, 8, 7, 8, 6, 7]);
  assert.deepEqual(result.tarot.map((card) => card.id), ["tower", "four-of-cups", "star"]);
});
