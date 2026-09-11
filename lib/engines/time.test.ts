import assert from "node:assert/strict";
import test from "node:test";
import { resolveCity } from "@/lib/geo/cities";
import { assertBaziEngineCalibration, calculateBaziEngine, trueSolarTimeCalibrationFixture } from "@/lib/engines/bazi";
import { BirthTimeValidationError, calculateTrueSolarTime, resolveBirthInstant, type BirthInput, type BirthTimeErrorCode } from "@/lib/engines/time";

function input(city: string, birthDate: string, birthTime = "12:00"): BirthInput {
  const location = resolveCity(city);
  assert.ok(location);
  return { name: "Timezone fixture", gender: "female", locale: "en", city: location, birthDate, birthTime };
}

function rejects(value: BirthInput, code: BirthTimeErrorCode) {
  assert.throws(() => resolveBirthInstant(value), (error: unknown) => error instanceof BirthTimeValidationError && error.code === code);
}

test("civil birth time resolves to date-specific UTC in US and European time zones", () => {
  // NIST: US clocks advance at 02:00 on the second March Sunday and return
  // at 02:00 on the first November Sunday; Eastern standard/daylight = -5/-4.
  // https://www.nist.gov/pml/time-and-frequency-division/local-time-faqs
  const examples = [
    ["New York", "2024-01-15", "2024-01-15T17:00:00Z", -300],
    ["New York", "2024-07-15", "2024-07-15T16:00:00Z", -240],
    ["Los Angeles", "2024-07-15", "2024-07-15T19:00:00Z", -420],
    ["London", "2024-01-15", "2024-01-15T12:00:00Z", 0],
    ["London", "2024-07-15", "2024-07-15T11:00:00Z", 60],
    ["Paris", "2024-07-15", "2024-07-15T10:00:00Z", 120],
  ] as const;
  for (const [city, date, utcIso, offset] of examples) {
    const result = resolveBirthInstant(input(city, date));
    assert.equal(result.utcIso, utcIso, city);
    assert.equal(result.timezoneOffsetMinutes, offset, city);
  }
});

test("spring gaps and autumn repetitions are rejected, not silently shifted", () => {
  // https://aa.usno.navy.mil/calculated/daylightsaving?submit=Get+Data&year=2024
  rejects(input("New York", "2024-03-10", "02:30"), "nonexistent-local-time");
  rejects(input("New York", "2024-11-03", "01:30"), "ambiguous-local-time");
  // UK transitions occur on the last Sunday in March/October.
  // https://www.gov.uk/when-do-the-clocks-change
  rejects(input("London", "2024-03-31", "01:30"), "nonexistent-local-time");
  rejects(input("London", "2024-10-27", "01:30"), "ambiguous-local-time");
  assert.equal(resolveBirthInstant(input("New York", "2024-03-10", "01:59")).utcIso, "2024-03-10T06:59:00Z");
  assert.equal(resolveBirthInstant(input("New York", "2024-03-10", "03:00")).utcIso, "2024-03-10T07:00:00Z");
});

test("historical offsets are used even for cities without present-day daylight saving", () => {
  // IANA Asia rules: PRC observed summer time 1986–1991; Singapore moved
  // from UTC+07:30 to UTC+08:00 at the end of 1981.
  // https://data.iana.org/time-zones/tzdb/asia
  assert.equal(resolveBirthInstant(input("Shanghai", "1988-07-01")).utcIso, "1988-07-01T03:00:00Z");
  assert.equal(resolveBirthInstant(input("Shanghai", "1993-07-01")).utcIso, "1993-07-01T04:00:00Z");
  assert.equal(resolveBirthInstant(input("Singapore", "1981-01-15")).timezoneOffsetMinutes, 450);
  assert.equal(resolveBirthInstant(input("Singapore", "1982-01-15")).timezoneOffsetMinutes, 480);
});

test("invalid dates, times and time zones cannot roll into a different birth input", () => {
  for (const date of ["2024-02-30", "1900-02-29", "2024-13-01", "0000-01-01", "2024-1-1"]) rejects(input("London", date), "invalid-date-time");
  for (const time of ["24:00", "12:60", "9:00", "12:00:30", ""]) rejects(input("London", "2024-01-01", time), "invalid-date-time");
  assert.equal(resolveBirthInstant(input("London", "2000-02-29")).utcIso, "2000-02-29T12:00:00Z");
  const invalidZone = input("London", "2024-01-01");
  invalidZone.city = { ...invalidZone.city, timezone: "Unverified/City" };
  rejects(invalidZone, "invalid-timezone");
  assert.throws(() => calculateTrueSolarTime({ ...invalidZone, city: { ...invalidZone.city, timezone: "Europe/London", longitude: NaN } }), (error: unknown) => error instanceof BirthTimeValidationError && error.code === "invalid-location");
});

test("the supported 1800–2100 range is inclusive and enforced before ephemeris work", () => {
  rejects(input("London", "1799-12-31"), "unsupported-year");
  rejects(input("London", "2101-01-01"), "unsupported-year");
  assert.doesNotThrow(() => resolveBirthInstant(input("London", "1800-01-01")));
  assert.doesNotThrow(() => resolveBirthInstant(input("London", "2100-12-31")));
});

test("solar-clock adjustment removes the actual civil offset and retains UTC independently", () => {
  const birth = input("New York", "2024-07-01", "00:10");
  const result = calculateTrueSolarTime(birth);
  assert.equal(result.utcIso, "2024-07-01T04:10:00Z");
  assert.equal(result.date, "2024-06-30");
  assert.ok(Math.abs(result.longitudeCorrectionMinutes - (birth.city.longitude * 4 + 240)) < 1e-9);
  assert.equal(result.totalCorrectionMinutes, result.longitudeCorrectionMinutes + result.equationOfTimeMinutes);
});

test("existing non-DST Bazi calibration and pillars remain stable", () => {
  assert.doesNotThrow(assertBaziEngineCalibration);
  const result = calculateBaziEngine(trueSolarTimeCalibrationFixture.input);
  assert.equal(result.trueSolarTime.isoLike, "1982-03-21T01:00:00");
  assert.deepEqual(result.pillars, { year: "壬戌", month: "癸卯", day: "癸卯", hour: "癸丑" });
  assert.equal(result.trueSolarTime.utcIso, "1982-03-20T17:30:00Z");
});

test("server timezone cannot change a birth instant or solar clock", () => {
  const previous = process.env.TZ;
  const birth = input("New York", "2024-07-01");
  try {
    process.env.TZ = "Asia/Tokyo";
    const first = calculateTrueSolarTime(birth);
    process.env.TZ = "America/Los_Angeles";
    assert.deepEqual(calculateTrueSolarTime(birth), first);
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});
