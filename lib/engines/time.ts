import type { City } from "@/lib/geo/cities";

export type BirthInput = {
  name: string;
  birthDate: string;
  birthTime: string;
  city: City;
};

export type TrueSolarTime = {
  date: string;
  time: string;
  isoLike: string;
  longitudeCorrectionMinutes: number;
  equationOfTimeMinutes: number;
  totalCorrectionMinutes: number;
};

const STANDARD_MERIDIANS: Record<string, number> = {
  "Asia/Shanghai": 120,
  "Asia/Hong_Kong": 120,
  "Asia/Taipei": 120,
  "Asia/Singapore": 120,
  "America/New_York": -75,
  "America/Los_Angeles": -120,
  "Europe/London": 0,
  "Europe/Paris": 15,
};

function dayOfYear(year: number, month: number, day: number) {
  const start = Date.UTC(year, 0, 0);
  const current = Date.UTC(year, month - 1, day);
  return Math.floor((current - start) / 86_400_000);
}

function equationOfTimeMinutes(year: number, month: number, day: number) {
  const n = dayOfYear(year, month, day);
  const b = (2 * Math.PI * (n - 81)) / 364;

  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function calculateTrueSolarTime(input: BirthInput): TrueSolarTime {
  const [year, month, day] = input.birthDate.split("-").map(Number);
  const [hour, minute] = input.birthTime.split(":").map(Number);
  const standardMeridian =
    STANDARD_MERIDIANS[input.city.timezone] ??
    Math.round(input.city.longitude / 15) * 15;
  const longitudeCorrectionMinutes =
    (input.city.longitude - standardMeridian) * 4;
  const eot = equationOfTimeMinutes(year, month, day);
  const totalCorrectionMinutes = longitudeCorrectionMinutes + eot;
  const base = Date.UTC(year, month - 1, day, hour, minute, 0);
  const corrected = new Date(base + totalCorrectionMinutes * 60_000);
  const correctedYear = corrected.getUTCFullYear();
  const correctedMonth = corrected.getUTCMonth() + 1;
  const correctedDay = corrected.getUTCDate();
  const correctedHour = corrected.getUTCHours();
  const correctedMinute = corrected.getUTCMinutes();
  const date = `${correctedYear}-${pad(correctedMonth)}-${pad(correctedDay)}`;
  const time = `${pad(correctedHour)}:${pad(correctedMinute)}`;

  return {
    date,
    time,
    isoLike: `${date}T${time}:00`,
    longitudeCorrectionMinutes,
    equationOfTimeMinutes: eot,
    totalCorrectionMinutes,
  };
}

export function trueSolarTimeToParts(trueSolarTime: TrueSolarTime) {
  const [year, month, day] = trueSolarTime.date.split("-").map(Number);
  const [hour, minute] = trueSolarTime.time.split(":").map(Number);

  return { year, month, day, hour, minute };
}
