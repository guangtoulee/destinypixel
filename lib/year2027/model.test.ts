import assert from "node:assert/strict";
import test from "node:test";
import { planetaryPositionsAt } from "@/lib/engines/astrology";
import { BirthTimeValidationError } from "@/lib/engines/time";
import { resolveCity } from "@/lib/geo/cities";
import {
  calculateYear2027, year2027Calendar, year2027Method, year2027PillarsAt,
  year2027Snapshot, year2027SolarTerms, year2027TenGod, type Year2027Input,
} from "./model";

function birth(date = "1990-05-15", time = "12:00", city = "Shanghai"): Year2027Input {
  const location = resolveCity(city);
  assert.ok(location);
  return { name: "", gender: "female", locale: "en", birthDate: date, birthTime: time, city: location };
}

test("the calendar contains only January–December 2027, continuous end-exclusive segments and explicit UTC snapshots", () => {
  const months = year2027Calendar();
  assert.deepEqual(months.map(m => m.month), Array.from({ length: 12 }, (_, i) => i + 1));
  assert.equal(months[0].startUtc, "2027-01-01T00:00:00.000Z");
  assert.equal(months.at(-1)?.endUtc, "2028-01-01T00:00:00.000Z");
  for (const [index, month] of months.entries()) {
    assert.equal(month.snapshotUtc, `2027-${String(index + 1).padStart(2, "0")}-15T12:00:00.000Z`);
    assert.equal(month.baziSegments[0].startUtc, month.startUtc);
    assert.equal(month.baziSegments.at(-1)?.endUtc, month.endUtc);
    for (let i = 1; i < month.baziSegments.length; i++) assert.equal(month.baziSegments[i - 1].endUtc, month.baziSegments[i].startUtc);
    if (index) assert.equal(months[index - 1].endUtc, month.startUtc);
  }
});

test("HKO's published 2027 LiChun minute agrees with the library and does not coincide with Lunar New Year", () => {
  // Independent source: HKO 2027 February calendar publishes 4 February 09:46
  // Hong Kong time, and Lunar New Year on 6 February. It does not publish seconds.
  // https://www.hko.gov.hk/tc/gts/astron2027/files/2027cal02.pdf
  const liChun = year2027SolarTerms().find(term => term.name === "立春");
  assert.ok(liChun);
  assert.equal(liChun.utc.slice(0, 16), "2027-02-04T01:46");
  assert.equal(liChun.utc, year2027Method.liChunUtc);
  assert.deepEqual(year2027PillarsAt("2027-01-01T00:00:00Z"), { yearPillar: "丙午", monthPillar: "庚子" });
  assert.deepEqual(year2027PillarsAt("2027-02-04T01:45:00Z"), { yearPillar: "丙午", monthPillar: "辛丑" });
  assert.deepEqual(year2027PillarsAt("2027-02-04T01:47:00Z"), { yearPillar: "丁未", monthPillar: "壬寅" });
  assert.equal(year2027PillarsAt("2027-02-06T00:00:00Z").yearPillar, "丁未");
  const boundary = +new Date(liChun.utc);
  assert.equal(year2027PillarsAt(boundary - 1000).yearPillar, "丙午");
  assert.equal(year2027PillarsAt(boundary).yearPillar, "丁未");
});

test("only the twelve Jie change month pillars; Gregorian first days and intervening Qi do not", () => {
  assert.deepEqual(year2027SolarTerms().map(t => t.name), ["小寒", "立春", "惊蛰", "清明", "立夏", "芒种", "小暑", "立秋", "白露", "寒露", "立冬", "大雪"]);
  const months = year2027Calendar();
  assert.deepEqual(months.map(m => m.baziSegments[1].monthPillar[1]), ["丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子"]);
  assert.equal(year2027PillarsAt("2027-02-01T00:00:00Z").monthPillar, "辛丑");
  assert.equal(year2027PillarsAt("2027-02-19T00:00:00Z").monthPillar, "壬寅");
  assert.equal(year2027PillarsAt("2027-02-20T00:00:00Z").monthPillar, "壬寅");
});

test("known birth times reuse historical UTC resolution and produce independent personalized BaZi and solar snapshots", () => {
  const china = calculateYear2027(birth("2024-03-20", "11:06"));
  const london = calculateYear2027(birth("2024-03-20", "03:06", "London"));
  assert.equal(china.birth.utc, london.birth.utc);
  assert.deepEqual(china.birth.sun, london.birth.sun);
  assert.deepEqual(china.months.map(m => m.transits), london.months.map(m => m.transits));
  assert.equal(china.timeKnown, true);
  assert.ok(china.birth.dayMaster);
  assert.ok(china.birth.pillars.hour);
  assert.ok(china.months.every(m => m.baziSegments.every(s => s.tenGod && s.yearTenGod)));
  // Existing independent JPL fixture: Sun was 359.9997093 degrees at this UTC.
  assert.ok(Math.abs(china.birth.sun!.longitude! - 359.9997093) < 1 / 60);
  assert.equal("houses" in china.birth, false);
  assert.equal("ascendant" in china.birth, false);
  assert.equal("moon" in china.birth, false);
  assert.equal("score" in china, false);
});

test("unknown time samples the real civil day without exposing a fictitious birth instant or solar time", () => {
  const value = { ...birth(), birthTime: "", unknownTime: true };
  const result = calculateYear2027(value);
  assert.equal(result.timeKnown, false);
  assert.equal(result.birth.utc, undefined);
  assert.equal(result.birth.solarTime, undefined);
  assert.equal(result.birth.pillars.hour, undefined);
  assert.equal(result.birth.pillars.day, undefined);
  assert.equal(result.birth.dayMaster, undefined);
  assert.equal(result.birth.sun?.longitude, undefined);
  assert.equal(result.birth.sun?.sign, "Taurus");
  assert.ok(result.birth.sun!.longitudeRange[1] > result.birth.sun!.longitudeRange[0]);
  assert.equal(result.birth.sampleCount, 49);
  assert.ok(result.months.every(m => m.baziSegments.every(s => s.tenGod === undefined)));
  assert.ok(result.months.flatMap(m => m.transits).every(t => t.orbRange && t.orbRange[1] <= 3));
  assert.deepEqual(calculateYear2027({ ...value, birthTime: "12:00" }), result, "a supplied placeholder must be ignored in unknown-time mode");
});

test("unknown time suppresses a Sun sign on a zodiac crossing and year/month pillars on a LiChun day", () => {
  const equinox = calculateYear2027({ ...birth("2024-03-20", "", "London"), unknownTime: true });
  assert.equal(equinox.birth.sun, undefined);
  assert.ok(equinox.months.every(m => m.transits.length === 0));
  const liChun = calculateYear2027({ ...birth("2027-02-04", ""), unknownTime: true });
  assert.equal(liChun.birth.pillars.year, undefined);
  assert.equal(liChun.birth.pillars.month, undefined);
});

test("unknown-time civil windows honor 23/25-hour DST dates and custom IANA locations", () => {
  const spring = calculateYear2027({ ...birth("2024-03-10", "", "New York"), unknownTime: true });
  const autumn = calculateYear2027({ ...birth("2024-11-03", "", "New York"), unknownTime: true });
  const hours = (r: typeof spring) => (+new Date(r.birth.utcWindow![1]) - +new Date(r.birth.utcWindow![0])) / 3600_000;
  assert.equal(hours(spring), 23);
  assert.equal(hours(autumn), 25);
  assert.equal(spring.birth.sampleCount, 47);
  assert.equal(autumn.birth.sampleCount, 51);
  const custom = { ...birth(), city: { ...birth().city, id: "custom", longitude: 120.1, latitude: 30.2 }, unknownTime: true };
  assert.doesNotThrow(() => calculateYear2027(custom));
});

test("valid leap days work, invalid dates and skipped or repeated known clocks are rejected", () => {
  assert.doesNotThrow(() => calculateYear2027(birth("2000-02-29")));
  assert.doesNotThrow(() => calculateYear2027({ ...birth("2000-02-29", ""), unknownTime: true }));
  for (const unknownTime of [false, true]) {
    assert.throws(() => calculateYear2027({ ...birth("1900-02-29"), unknownTime }), BirthTimeValidationError);
    assert.throws(() => calculateYear2027({ ...birth("2024-02-30"), unknownTime }), BirthTimeValidationError);
  }
  for (const [date, time, code] of [["2024-03-10", "02:30", "nonexistent-local-time"], ["2024-11-03", "01:30", "ambiguous-local-time"]]) {
    assert.throws(() => calculateYear2027(birth(date, time, "New York")), (error: unknown) => error instanceof BirthTimeValidationError && error.code === code);
  }
  const skipped = { ...birth("2011-12-30"), unknownTime: true, city: { ...birth().city, id: "custom", timezone: "Pacific/Apia" } };
  assert.throws(() => calculateYear2027(skipped), BirthTimeValidationError);
  for (const unknownTime of [false, true]) {
    for (const timezone of ["+08:00", "Not_A_Zone/Example"]) {
      assert.throws(() => calculateYear2027({ ...birth(), unknownTime, city: { ...birth().city, id: "custom", timezone } }), (error: unknown) => error instanceof BirthTimeValidationError && error.code === "invalid-timezone");
    }
  }
});

test("transit snapshots use actual Jupiter/Saturn positions, all five major aspects and an inclusive 3° orb", () => {
  const utc = "2027-01-15T12:00:00.000Z";
  const jupiter = planetaryPositionsAt(new Date(utc), ["Jupiter"])[0];
  for (const angle of [0, 60, 90, 120, 180]) {
    const longitude = (jupiter.longitude + angle) % 360;
    const match = year2027Snapshot(utc, { sign: "test", signCn: "测试", longitude, longitudeRange: [longitude, longitude] }).find(t => t.body === "Jupiter");
    assert.equal(match?.angle, angle);
    assert.equal(match?.orb, 0);
    assert.equal(match?.longitude, jupiter.longitude);
  }
  const edge = (jupiter.longitude + 3) % 360;
  assert.ok(year2027Snapshot(utc, { sign: "test", signCn: "测试", longitude: edge, longitudeRange: [edge, edge] }).some(t => t.body === "Jupiter"));
  const outside = (jupiter.longitude + 3.01) % 360;
  assert.ok(!year2027Snapshot(utc, { sign: "test", signCn: "测试", longitude: outside, longitudeRange: [outside, outside] }).some(t => t.body === "Jupiter"));
  assert.ok(!year2027Snapshot(utc, { sign: "test", signCn: "测试", longitudeRange: [jupiter.longitude, jupiter.longitude + 3.1] }).some(t => t.body === "Jupiter"));
});

test("traditional stem relations provide ten distinct reflective readings without an annual fate score", () => {
  const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;
  assert.deepEqual(stems.map(s => year2027TenGod("甲", s).name), ["比肩", "劫财", "食神", "伤官", "偏财", "正财", "七杀", "正官", "偏印", "正印"]);
  assert.ok(stems.every(s => year2027TenGod("甲", s).questionEn.endsWith("?")));
});
