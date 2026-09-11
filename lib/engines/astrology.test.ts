import assert from "node:assert/strict";
import test from "node:test";
import { calculateAstrologyEngine } from "@/lib/engines/astrology";
import { BirthTimeValidationError, calculateTrueSolarTime, type BirthInput } from "@/lib/engines/time";
import { resolveCity } from "@/lib/geo/cities";

function birth(city: string, date: string, time: string): BirthInput {
  const location = resolveCity(city);
  assert.ok(location);
  return { name: "Ephemeris fixture", gender: "female", locale: "en", birthDate: date, birthTime: time, city: location };
}
function chart(input: BirthInput) {
  return calculateAstrologyEngine(input, calculateTrueSolarTime(input));
}
function separation(a: number, b: number) {
  const diff = Math.abs(a - b) % 360;
  return Math.min(diff, 360 - diff);
}

test("geocentric tropical longitudes match independently retrieved JPL Horizons values", () => {
  // Retrieved 2026-09-11 from NASA/JPL Horizons, not generated with the library
  // under test. Observer-centered apparent ecliptic-of-date (quantity 31).
  // API: https://ssd-api.jpl.nasa.gov/doc/horizons.html
  // Origin: CENTER='500@399', EPHEM_TYPE='OBSERVER', TLIST='2024-03-20 03:06',
  // TLIST_TYPE='CAL', TIME_TYPE='UT', CAL_TYPE='GREGORIAN', QUANTITIES='31'.
  // COMMAND IDs: 10,301,199,299,499,599,699,799,899,999 respectively.
  // Horizons includes gravitational deflection and uses IAU76/80 ecliptic of
  // date; allow one arcminute for this library's documented accuracy target.
  const expected: Record<string, number> = {
    Sun: 359.9997093,
    Moon: 123.8151802,
    Mercury: 17.4409072,
    Venus: 340.1712838,
    Mars: 327.7733973,
    Jupiter: 44.8856241,
    Saturn: 342.2254263,
    Uranus: 50.2537683,
    Neptune: 357.4602809,
    Pluto: 301.6606576,
  };
  const result = chart(birth("London", "2024-03-20", "03:06"));
  assert.equal(result.ephemerisMode, "astronomy-engine-geocentric");
  assert.equal(result.placements.length, 10);
  for (const placement of result.placements) {
    assert.ok(separation(placement.longitude, expected[placement.body]) < 1 / 60, `${placement.body}: ${placement.longitude} vs JPL ${expected[placement.body]}`);
    assert.ok(placement.longitude >= 0 && placement.longitude < 360);
    assert.ok(placement.degreeInSign >= 0 && placement.degreeInSign < 30);
  }
  assert.equal("houses" in result, false);
  assert.equal("ascendant" in result, false);
});

test("the independently published March equinox falls on the Pisces/Aries boundary", () => {
  // USNO: March 19 2024 23:06 Eastern daylight = March 20 03:06 UTC.
  // https://aa.usno.navy.mil/calculated/seasons?dst=true&submit=Get+Data&tz=5&tz_label=true&tz_sign=-1&year=2024
  const before = chart(birth("London", "2024-03-20", "03:01"));
  const after = chart(birth("London", "2024-03-20", "03:11"));
  assert.equal(before.sunSign, "Pisces");
  assert.equal(after.sunSign, "Aries");
  assert.ok(separation(before.placements[0].longitude, 0) < 0.02);
  assert.ok(separation(after.placements[0].longitude, 0) < 0.02);
});

test("the same instant entered in summer-time cities produces the same sky", () => {
  const newYork = chart(birth("New York", "2024-07-15", "12:00"));
  const london = chart(birth("London", "2024-07-15", "17:00"));
  const shanghai = chart(birth("Shanghai", "2024-07-16", "00:00"));
  assert.deepEqual(newYork.placements, london.placements);
  assert.deepEqual(newYork.placements, shanghai.placements);
  assert.deepEqual(newYork.majorAspects, london.majorAspects);
  assert.notEqual(newYork.trueSolarTime.time, shanghai.trueSolarTime.time);
});

test("planetary UTC is derived from civil input, never from a solar-clock label or stale stored UTC", () => {
  const input = birth("New York", "2024-07-01", "00:10");
  const solar = calculateTrueSolarTime(input);
  const misleadingSolar = { ...solar, date: "1990-01-01", time: "00:00", isoLike: "1990-01-01T00:00:00", utcIso: "1990-01-01T00:00:00Z" };
  assert.deepEqual(calculateAstrologyEngine(input, misleadingSolar).placements, calculateAstrologyEngine(input, solar).placements);
  const ambiguous = birth("New York", "2024-11-03", "01:30");
  assert.throws(() => calculateAstrologyEngine(ambiguous, solar), (error: unknown) => error instanceof BirthTimeValidationError && error.code === "ambiguous-local-time");
});

test("inner planets remain near the Sun as seen from Earth", () => {
  for (let month = 1; month <= 12; month++) {
    const result = chart(birth("London", `2024-${String(month).padStart(2, "0")}-15`, "12:00"));
    const sun = result.placements.find((value) => value.body === "Sun")!;
    const mercury = result.placements.find((value) => value.body === "Mercury")!;
    const venus = result.placements.find((value) => value.body === "Venus")!;
    assert.ok(separation(sun.longitude, mercury.longitude) < 30);
    assert.ok(separation(sun.longitude, venus.longitude) < 49);
  }
});
