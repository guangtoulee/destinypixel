import {
  Body,
  Ecliptic,
  GeoVector,
  MakeTime,
  RotateVector,
  Rotation_EQD_ECT,
  SiderealTime,
  Vector,
} from "astronomy-engine";
import {
  calculateAstrologyEngine,
  type PlanetPlacement,
} from "@/lib/engines/astrology";
import {
  calculateTrueSolarTime,
  resolveBirthInstant,
  type BirthInput,
} from "@/lib/engines/time";
import { cities, type City } from "@/lib/geo/cities";
import { normalizeReportLocale, type ReportLocale } from "@/lib/report-i18n";

export const signSymbols = [
  "♈",
  "♉",
  "♊",
  "♋",
  "♌",
  "♍",
  "♎",
  "♏",
  "♐",
  "♑",
  "♒",
  "♓",
].map((symbol) => `${symbol}\uFE0E`);
export const planetSymbols: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
};
export const normalizeAngle = (n: number) => ((n % 360) + 360) % 360;
const radians = Math.PI / 180;
export type NatalPlanet = PlanetPlacement & {
  house: number;
  retrograde: boolean;
  speed: number;
};
export type NatalAspect = {
  bodies: [string, string];
  type: "conjunction" | "sextile" | "square" | "trine" | "opposition";
  orb: number;
};
export type NatalChart = {
  placements: NatalPlanet[];
  ascendant: number;
  midheaven: number;
  houses: number[];
  aspects: NatalAspect[];
  elements: number[];
  utc: string;
  timezone: string;
  latitude: number;
  longitude: number;
  houseSystem: "whole-sign";
};

/** Intersect the ecliptic plane with the eastern horizon and upper meridian.
 * EQD and ECT share the true equinox of date. SiderealTime is GAST (hours).
 * Reference: astronomy-engine Rotation_EQD_ECT / SiderealTime documentation.
 */
export function chartAngles(date: Date, latitude: number, longitude: number) {
  const time = MakeTime(date),
    theta = (SiderealTime(time) * 15 + longitude) * radians,
    phi = latitude * radians;
  const rotate = Rotation_EQD_ECT(time);
  const zenith = RotateVector(
    rotate,
    new Vector(
      Math.cos(phi) * Math.cos(theta),
      Math.cos(phi) * Math.sin(theta),
      Math.sin(phi),
      time,
    ),
  );
  const east = RotateVector(
    rotate,
    new Vector(-Math.sin(theta), Math.cos(theta), 0, time),
  );
  const upper = RotateVector(
    rotate,
    new Vector(Math.cos(theta), Math.sin(theta), 0, time),
  );
  if (Math.hypot(zenith.x, zenith.y) < 1e-8)
    throw new Error("AMBIGUOUS_HORIZON");
  const intersection = (normal: Vector, side: Vector) => {
    let x = -normal.y,
      y = normal.x;
    if (x * side.x + y * side.y < 0) {
      x = -x;
      y = -y;
    }
    return normalizeAngle(Math.atan2(y, x) / radians);
  };
  return {
    ascendant: intersection(zenith, east),
    midheaven: intersection(east, upper),
  };
}
export function fullAspects(planets: PlanetPlacement[]): NatalAspect[] {
  const types = [
    ["conjunction", 0],
    ["sextile", 60],
    ["square", 90],
    ["trine", 120],
    ["opposition", 180],
  ] as const;
  return planets
    .flatMap((p, i) =>
      planets.slice(i + 1).flatMap((q) => {
        const a = Math.abs(p.longitude - q.longitude),
          separation = Math.min(a, 360 - a);
        const hit = types
          .map(([type, angle]) => ({ type, orb: Math.abs(separation - angle) }))
          .sort((a, b) => a.orb - b.orb)[0];
        return hit.orb <= 6
          ? [
              {
                bodies: [p.body, q.body] as [string, string],
                type: hit.type,
                orb: Number(hit.orb.toFixed(2)),
              },
            ]
          : [];
      }),
    )
    .sort((a, b) => a.orb - b.orb);
}
export function calculateNatalChart(input: BirthInput): NatalChart {
  const date = new Date(resolveBirthInstant(input).epochMilliseconds);
  const base = calculateAstrologyEngine(input, calculateTrueSolarTime(input));
  const angles = chartAngles(date, input.city.latitude, input.city.longitude);
  const first = Math.floor(angles.ascendant / 30) * 30;
  const placements = base.placements.map((p) => {
    const before = Ecliptic(
      GeoVector(p.body as Body, new Date(+date - 43200000), true),
    ).elon;
    const after = Ecliptic(
      GeoVector(p.body as Body, new Date(+date + 43200000), true),
    ).elon;
    const speed = normalizeAngle(after - before + 180) - 180;
    return {
      ...p,
      house: Math.floor(normalizeAngle(p.longitude - first) / 30) + 1,
      retrograde: speed < 0,
      speed: Number(speed.toFixed(4)),
    };
  });
  const elements = [0, 0, 0, 0];
  placements.forEach((p) => elements[Math.floor(p.longitude / 30) % 4]++);
  return {
    ...angles,
    placements,
    houses: Array.from({ length: 12 }, (_, i) =>
      normalizeAngle(first + i * 30),
    ),
    aspects: fullAspects(placements),
    elements,
    utc: date.toISOString(),
    timezone: input.city.timezone,
    latitude: input.city.latitude,
    longitude: input.city.longitude,
    houseSystem: "whole-sign",
  };
}
export function parseNatalInput(raw: Record<string, unknown>): {
  input: BirthInput;
  locale: ReportLocale;
  mode: "calculate" | "interpret";
} {
  if (
    typeof raw.birthDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(raw.birthDate) ||
    typeof raw.birthTime !== "string" ||
    !/^\d{2}:\d{2}$/.test(raw.birthTime)
  )
    throw new Error("INVALID_INPUT");
  let city: City | undefined = cities.find((c) => c.id === raw.cityId);
  if (raw.cityId === "custom") {
    if (
      typeof raw.latitude !== "number" ||
      !Number.isFinite(raw.latitude) ||
      Math.abs(raw.latitude) > 89.9 ||
      typeof raw.longitude !== "number" ||
      !Number.isFinite(raw.longitude) ||
      Math.abs(raw.longitude) > 180 ||
      typeof raw.timezone !== "string" ||
      raw.timezone.length > 80
    )
      throw new Error("INVALID_INPUT");
    // An IANA zone carries date-specific DST rules; a bare UTC offset does not.
    if (
      !/^[A-Za-z_]+(?:\/[A-Za-z0-9_+\-]+){1,2}$/.test(raw.timezone) &&
      raw.timezone !== "UTC"
    )
      throw new Error("INVALID_INPUT");
    city = {
      id: "custom",
      label: "Custom location",
      country: "",
      latitude: raw.latitude,
      longitude: raw.longitude,
      timezone: raw.timezone,
      aliases: [],
    };
  }
  if (
    !city ||
    (raw.mode !== undefined &&
      raw.mode !== "calculate" &&
      raw.mode !== "interpret")
  )
    throw new Error("INVALID_INPUT");
  const locale = normalizeReportLocale(
    typeof raw.locale === "string" ? raw.locale : "en",
  );
  return {
    input: {
      name: "",
      gender: "female",
      locale,
      birthDate: raw.birthDate,
      birthTime: raw.birthTime,
      city,
    },
    locale,
    mode: raw.mode === "interpret" ? "interpret" : "calculate",
  };
}
