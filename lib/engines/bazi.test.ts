import assert from "node:assert/strict";
import test from "node:test";
import { calculateBaziEngine } from "@/lib/engines/bazi";
import { resolveCity } from "@/lib/geo/cities";
import type { BirthInput } from "@/lib/engines/time";

function input(date: string, time: string, city = "Shanghai", gender: "male" | "female" = "female"): BirthInput {
  const location = resolveCity(city);
  assert.ok(location);
  return { name: "Solar-term fixture", gender, locale: "en", birthDate: date, birthTime: time, city: location };
}
function pillars(date: string, time: string, city = "Shanghai") {
  return calculateBaziEngine(input(date, time, city)).pillars;
}

// Official library convention: Exact year changes at LiChun's instant, Exact
// month at a Jie instant; non-Exact variants use Lunar New Year / whole day.
// https://6tail.cn/calendar/lunar.ganzhi.html
// Independent reference: HKO 2024 Almanac, UTC+08:00:
// LiChun Feb4 16:27, JingZhe Mar5 10:23, ChunFen Mar20 11:06.
// https://www.hko.gov.hk/en/gts/astron2024/files/HKO_almanac_2024.pdf

test("year and month change at LiChun's instant, not midnight or Lunar New Year", () => {
  assert.equal(pillars("2024-02-04", "00:01").year, "癸卯");
  assert.equal(pillars("2024-02-04", "00:01").month, "乙丑");
  assert.equal(pillars("2024-02-04", "16:26").year, "癸卯");
  assert.equal(pillars("2024-02-04", "16:26").month, "乙丑");
  assert.equal(pillars("2024-02-04", "16:28").year, "甲辰");
  assert.equal(pillars("2024-02-04", "16:28").month, "丙寅");
  assert.equal(pillars("2024-02-06", "12:00").year, "甲辰");
  assert.equal(pillars("2024-02-10", "12:00").year, "甲辰");
});

test("an early Lunar New Year does not advance the Bazi year before LiChun", () => {
  // HKO: Lunar New Year was 2023-Jan-22, LiChun was Feb4.
  // https://www.hko.gov.hk/en/gts/time/calendar/pdf/files/2023e.pdf
  assert.equal(pillars("2023-01-22", "12:00").year, "壬寅");
  assert.equal(pillars("2023-02-01", "12:00").year, "壬寅");
  assert.equal(pillars("2023-02-05", "12:00").year, "癸卯");
});

test("monthly Jie boundaries use precise instants, while a middle Qi does not change the month", () => {
  assert.equal(pillars("2024-03-05", "00:01").month, "丙寅");
  assert.equal(pillars("2024-03-05", "10:21").month, "丙寅");
  assert.equal(pillars("2024-03-05", "10:24").month, "丁卯");
  assert.equal(pillars("2024-03-20", "11:05").month, "丁卯");
  assert.equal(pillars("2024-03-20", "11:07").month, "丁卯");
});

test("the same instant crosses the year/month boundary together worldwide", () => {
  for (const minute of ["26", "28"]) {
    const china = pillars("2024-02-04", `16:${minute}`);
    const london = pillars("2024-02-04", `08:${minute}`, "London");
    const newYork = pillars("2024-02-04", `03:${minute}`, "New York");
    assert.equal(china.year, london.year);
    assert.equal(china.month, london.month);
    assert.equal(china.year, newYork.year);
    assert.equal(china.month, newYork.month);
  }
});

test("day pillars retain the declared midnight convention for the local solar clock", () => {
  const earlier = pillars("2024-02-06", "22:30");
  const lateZi = pillars("2024-02-06", "23:30");
  const nextDay = pillars("2024-02-07", "00:30");
  assert.equal(earlier.day, "庚子");
  assert.equal(lateZi.day, earlier.day);
  assert.equal(nextDay.day, "辛丑");
  assert.equal(lateZi.hour[1], "子");
  assert.equal(nextDay.hour[1], "子");
});

test("luck direction and distance to Jie follow the actual instant, without a forced one-year floor", () => {
  // Male + Yang 甲 year => forward; 1 minute before JingZhe is almost zero
  // distance to the next Jie and must not be made one year by an arbitrary floor.
  const china = calculateBaziEngine(input("2024-03-05", "10:22", "Shanghai", "male"));
  const newYork = calculateBaziEngine(input("2024-03-04", "21:22", "New York", "male"));
  assert.equal(china.luck.direction, "forward");
  assert.ok(china.luck.startAge < 0.1);
  assert.equal(newYork.luck.startAge, china.luck.startAge);
});
