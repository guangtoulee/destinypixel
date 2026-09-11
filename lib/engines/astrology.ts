import { Body, Ecliptic, GeoVector } from "astronomy-engine";
import { resolveBirthInstant, type BirthInput, type TrueSolarTime } from "@/lib/engines/time";

export type PlanetPlacement = {
  body: string;
  bodyCn: string;
  longitude: number;
  sign: string;
  signCn: string;
  degreeInSign: number;
};

export type AstroData = {
  engine: "astrology";
  ephemerisMode: "approximate-mvp" | "astronomy-engine-geocentric";
  trueSolarTime: TrueSolarTime;
  sunSign: string;
  sunSignCn: string;
  placements: PlanetPlacement[];
  majorAspects: Array<{
    bodies: [string, string];
    type: string;
    orb: number;
  }>;
};

const signs = [
  ["Aries", "白羊座"],
  ["Taurus", "金牛座"],
  ["Gemini", "双子座"],
  ["Cancer", "巨蟹座"],
  ["Leo", "狮子座"],
  ["Virgo", "处女座"],
  ["Libra", "天秤座"],
  ["Scorpio", "天蝎座"],
  ["Sagittarius", "射手座"],
  ["Capricorn", "摩羯座"],
  ["Aquarius", "水瓶座"],
  ["Pisces", "双鱼座"],
] as const;

const bodies = [
  [Body.Sun, "太阳"],
  [Body.Moon, "月亮"],
  [Body.Mercury, "水星"],
  [Body.Venus, "金星"],
  [Body.Mars, "火星"],
  [Body.Jupiter, "木星"],
  [Body.Saturn, "土星"],
  [Body.Uranus, "天王星"],
  [Body.Neptune, "海王星"],
  [Body.Pluto, "冥王星"],
] as const;

function normalizeDegrees(degrees: number) {
  return ((degrees % 360) + 360) % 360;
}

function placementFor(
  body: (typeof bodies)[number],
  utc: Date,
): PlanetPlacement {
  const [name, bodyCn] = body;
  // GeoVector is geocentric EQJ, including light travel time and aberration.
  // Ecliptic rotates to true ecliptic/equinox of date (tropical longitudes).
  // Do not use EclipticLongitude here: that library API is heliocentric.
  // https://github.com/cosinekitty/astronomy/tree/master/source/js#geovectorbody-date-aberration--vector
  const longitude = normalizeDegrees(Ecliptic(GeoVector(name, utc, true)).elon);
  const signIndex = Math.floor(longitude / 30);
  const [sign, signCn] = signs[signIndex];

  return {
    body: name,
    bodyCn,
    longitude: Number(longitude.toFixed(6)),
    sign,
    signCn,
    degreeInSign: Number((longitude % 30).toFixed(6)),
  };
}

function aspectBetween(a: PlanetPlacement, b: PlanetPlacement) {
  const diff = Math.abs(a.longitude - b.longitude);
  const angle = Math.min(diff, 360 - diff);
  const candidates = [
    ["conjunction", 0],
    ["sextile", 60],
    ["square", 90],
    ["trine", 120],
    ["opposition", 180],
  ] as const;
  const match = candidates
    .map(([type, degree]) => ({ type, orb: Math.abs(angle - degree) }))
    .sort((x, y) => x.orb - y.orb)[0];

  if (match.orb > 6) return null;

  return {
    bodies: [a.body, b.body] as [string, string],
    type: match.type,
    orb: Number(match.orb.toFixed(2)),
  };
}

export function calculateAstrologyEngine(
  input: BirthInput,
  trueSolarTime: TrueSolarTime,
): AstroData {
  // Planetary positions use the real UTC instant, never the Bazi solar clock.
  const instant = resolveBirthInstant(input);
  const placements = bodies.map((body) => placementFor(body, new Date(instant.epochMilliseconds)));
  const sun = placements.find((placement) => placement.body === "Sun")!;
  const majorAspects = placements
    .flatMap((placement, index) =>
      placements.slice(index + 1).map((other) => aspectBetween(placement, other)),
    )
    .filter((aspect): aspect is NonNullable<typeof aspect> => Boolean(aspect))
    .slice(0, 8);

  return {
    engine: "astrology",
    ephemerisMode: "astronomy-engine-geocentric",
    trueSolarTime,
    sunSign: sun.sign,
    sunSignCn: sun.signCn,
    placements,
    majorAspects,
  };
}
