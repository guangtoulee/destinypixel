import type { BirthInput, TrueSolarTime } from "@/lib/engines/time";

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
  ephemerisMode: "approximate-mvp";
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
  ["Sun", "太阳", 365.256, 280.46],
  ["Moon", "月亮", 27.3217, 218.32],
  ["Mercury", "水星", 87.969, 252.25],
  ["Venus", "金星", 224.701, 181.98],
  ["Mars", "火星", 686.98, 355.43],
  ["Jupiter", "木星", 4332.59, 34.35],
  ["Saturn", "土星", 10759.22, 50.08],
  ["Uranus", "天王星", 30685.4, 314.05],
  ["Neptune", "海王星", 60190.03, 304.35],
  ["Pluto", "冥王星", 90560, 238.93],
] as const;

function normalizeDegrees(degrees: number) {
  return ((degrees % 360) + 360) % 360;
}

function daysSinceJ2000(input: BirthInput) {
  const [year, month, day] = input.birthDate.split("-").map(Number);
  const [hour, minute] = input.birthTime.split(":").map(Number);
  const utc = Date.UTC(year, month - 1, day, hour, minute);
  const j2000 = Date.UTC(2000, 0, 1, 12, 0);

  return (utc - j2000) / 86_400_000;
}

function placementFor(
  body: (typeof bodies)[number],
  days: number,
): PlanetPlacement {
  const [name, bodyCn, period, offset] = body;
  const longitude = normalizeDegrees(offset + (days * 360) / period);
  const signIndex = Math.floor(longitude / 30);
  const [sign, signCn] = signs[signIndex];

  return {
    body: name,
    bodyCn,
    longitude: Number(longitude.toFixed(2)),
    sign,
    signCn,
    degreeInSign: Number((longitude % 30).toFixed(2)),
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
  const days = daysSinceJ2000(input);
  const placements = bodies.map((body) => placementFor(body, days));
  const sun = placements.find((placement) => placement.body === "Sun")!;
  const majorAspects = placements
    .flatMap((placement, index) =>
      placements.slice(index + 1).map((other) => aspectBetween(placement, other)),
    )
    .filter((aspect): aspect is NonNullable<typeof aspect> => Boolean(aspect))
    .slice(0, 8);

  return {
    engine: "astrology",
    ephemerisMode: "approximate-mvp",
    trueSolarTime,
    sunSign: sun.sign,
    sunSignCn: sun.signCn,
    placements,
    majorAspects,
  };
}
