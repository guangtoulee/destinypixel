import { resonanceKeys, type TotemCalibration, type TotemShareSnapshot } from "@/lib/totem/types";

const pillarPattern = /^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/;
const stems = "甲乙丙丁戊己庚辛壬癸";
const branches = "子丑寅卯辰巳午未申酉戌亥";

function validPillar(value: unknown): value is string {
  if (typeof value !== "string" || !pillarPattern.test(value)) return false;
  return stems.indexOf(value[0]) % 2 === branches.indexOf(value[1]) % 2;
}

function validCalibration(value: unknown): value is TotemCalibration {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  return (
    keys.length === resonanceKeys.length &&
    keys.every((key) => resonanceKeys.includes(key as (typeof resonanceKeys)[number])) &&
    resonanceKeys.every(
      (key) =>
        typeof record[key] === "number" &&
        Number.isFinite(record[key]) &&
        (record[key] as number) >= 0 &&
        (record[key] as number) <= 100,
    )
  );
}

export function isTotemShareSnapshot(value: unknown): value is TotemShareSnapshot {
  if (!value || typeof value !== "object") return false;
  const snapshot = value as Partial<TotemShareSnapshot>;
  const pillars = snapshot.pillars as Record<string, unknown> | undefined;
  const topLevelKeys = Object.keys(value);
  if (
    snapshot.version !== 1 ||
    topLevelKeys.length < 2 ||
    topLevelKeys.length > 3 ||
    !topLevelKeys.every((key) => ["version", "pillars", "calibration"].includes(key)) ||
    !pillars ||
    typeof pillars !== "object"
  ) {
    return false;
  }

  const keys = ["year", "month", "day", "hour"] as const;
  if (
    Object.keys(pillars).length !== keys.length ||
    !keys.every((key) => validPillar(pillars[key]))
  ) {
    return false;
  }

  return snapshot.calibration === undefined || validCalibration(snapshot.calibration);
}

export function encodeTotemSnapshot(snapshot: TotemShareSnapshot) {
  if (!isTotemShareSnapshot(snapshot)) throw new Error("Invalid totem share snapshot");
  // Rebuild a strict allow-listed payload so future callers cannot smuggle raw
  // birth fields into the URL through structural typing or an `any` value.
  const payload: TotemShareSnapshot = {
    version: 1,
    pillars: {
      year: snapshot.pillars.year,
      month: snapshot.pillars.month,
      day: snapshot.pillars.day,
      hour: snapshot.pillars.hour,
    },
    ...(snapshot.calibration ? { calibration: snapshot.calibration } : {}),
  };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodeTotemSnapshot(value: string | null) {
  if (!value || value.length > 2048 || !/^[a-zA-Z0-9_-]+$/.test(value)) return null;
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
    return isTotemShareSnapshot(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
