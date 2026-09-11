import { Temporal } from "@js-temporal/polyfill";
import type { City } from "@/lib/geo/cities";
import type { ReportLocale } from "@/lib/report-i18n";

export type BirthInput = {
  name: string;
  gender: "male" | "female";
  locale: ReportLocale;
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
  /** Civil birth time resolved against the birthplace's date-specific IANA rules. */
  utcIso?: string;
  timezoneOffsetMinutes?: number;
};

export type BirthTimeErrorCode = "invalid-date-time" | "unsupported-year" | "invalid-timezone" | "invalid-location" | "ambiguous-local-time" | "nonexistent-local-time";

const errorMessages: Record<ReportLocale, Record<BirthTimeErrorCode, string>> = {
  en: {
    "unsupported-year": "This calculation supports birth dates from 1800 through 2100. Please check the year.",
    "invalid-date-time": "Enter a valid Gregorian birth date and a local time in 24-hour HH:MM format.",
    "invalid-timezone": "The birthplace time zone is unavailable. Please choose a supported city.",
    "invalid-location": "The birthplace coordinates are invalid. Please choose a supported city.",
    "ambiguous-local-time": "This local time occurred twice during a clock change. The form cannot yet select which occurrence; verify the original record before continuing.",
    "nonexistent-local-time": "This local time did not occur because the clocks moved forward. Please check the original birth date, time and city.",
  },
  zh: {
    "unsupported-year": "当前计算支持 1800 至 2100 年的出生日期，请核对年份。",
    "invalid-date-time": "请填写有效的公历出生日期和 HH:MM 格式的当地二十四小时制时间。",
    "invalid-timezone": "无法识别出生地时区，请从列表中选择支持的城市。",
    "invalid-location": "出生地坐标无效，请从列表中选择支持的城市。",
    "ambiguous-local-time": "这段当地时间因调钟出现过两次，当前表单暂不能选择其中一次。请先核实原始记录。",
    "nonexistent-local-time": "这段当地时间因时钟拨快而不存在，请核对原始出生日期、时间和城市。",
  },
  "zh-TW": {
    "unsupported-year": "目前計算支援 1800 至 2100 年的出生日期，請核對年份。",
    "invalid-date-time": "請填寫有效的公曆出生日期和 HH:MM 格式的當地二十四小時制時間。",
    "invalid-timezone": "無法識別出生地時區，請從列表中選擇支援的城市。",
    "invalid-location": "出生地座標無效，請從列表中選擇支援的城市。",
    "ambiguous-local-time": "這段當地時間因調鐘出現過兩次，目前表單暫不能選擇其中一次。請先核實原始紀錄。",
    "nonexistent-local-time": "這段當地時間因時鐘撥快而不存在，請核對原始出生日期、時間和城市。",
  },
  ru: {
    "unsupported-year": "Расчёт поддерживает даты рождения с 1800 по 2100 год. Проверьте год.",
    "invalid-date-time": "Укажите действительную дату рождения по григорианскому календарю и местное время в формате ЧЧ:ММ.",
    "invalid-timezone": "Часовой пояс места рождения не распознан. Выберите город из списка.",
    "invalid-location": "Координаты места рождения неверны. Выберите город из списка.",
    "ambiguous-local-time": "При переводе часов это местное время наступило дважды. Форма пока не позволяет выбрать нужный случай; проверьте исходную запись.",
    "nonexistent-local-time": "Это местное время не существовало из-за перевода часов вперёд. Проверьте дату, время и город рождения.",
  },
};

export function birthTimeErrorMessage(code: string | undefined, locale: ReportLocale): string | undefined {
  return code && Object.hasOwn(errorMessages.en, code)
    ? errorMessages[locale][code as BirthTimeErrorCode]
    : undefined;
}

export class BirthTimeValidationError extends Error {
  constructor(public readonly code: BirthTimeErrorCode, locale: ReportLocale = "en") {
    super(errorMessages[locale]?.[code] ?? errorMessages.en[code]);
    this.name = "BirthTimeValidationError";
  }
}

/** Never silently resolve a skipped/repeated civil clock time or infer a zone from longitude. */
export function resolveBirthInstant(input: BirthInput) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate) || !/^\d{2}:\d{2}$/.test(input.birthTime)) {
    throw new BirthTimeValidationError("invalid-date-time", input.locale);
  }
  const [year, month, day] = input.birthDate.split("-").map(Number);
  const [hour, minute] = input.birthTime.split(":").map(Number);
  let local: Temporal.PlainDateTime;
  try {
    if (year < 1) throw new RangeError("Year must be positive");
    local = Temporal.PlainDateTime.from({ year, month, day, hour, minute }, { overflow: "reject" });
  } catch {
    throw new BirthTimeValidationError("invalid-date-time", input.locale);
  }
  // Bound supported inputs before expensive ephemeris work and avoid claiming
  // ancient/far-future accuracy. Keep the form's date boundaries in agreement.
  if (year < 1800 || year > 2100) throw new BirthTimeValidationError("unsupported-year", input.locale);

  let zoned: Temporal.ZonedDateTime;
  try {
    zoned = local.toZonedDateTime(input.city.timezone, { disambiguation: "reject" });
  } catch {
    // The library rejects both invalid zone names and clock transitions. Distinguish them
    // without accepting either of the guessed instants as the person's birth time.
    let earlier: Temporal.ZonedDateTime;
    let later: Temporal.ZonedDateTime;
    try {
      earlier = local.toZonedDateTime(input.city.timezone, { disambiguation: "earlier" });
      later = local.toZonedDateTime(input.city.timezone, { disambiguation: "later" });
    } catch {
      throw new BirthTimeValidationError("invalid-timezone", input.locale);
    }
    const repeated = earlier.toPlainDateTime().equals(local) && later.toPlainDateTime().equals(local);
    throw new BirthTimeValidationError(repeated ? "ambiguous-local-time" : "nonexistent-local-time", input.locale);
  }
  return {
    utcIso: zoned.toInstant().toString({ smallestUnit: "second" }),
    epochMilliseconds: zoned.epochMilliseconds,
    timezoneOffsetMinutes: zoned.offsetNanoseconds / 60_000_000_000,
  };
}

function equationOfTimeMinutes(year: number, month: number, day: number) {
  // Preserve the existing approximate EoT convention and Bazi calibration. This is
  // not the astronomical UTC instant; only the solar clock used by the Bazi model.
  const n = Temporal.PlainDate.from({ year, month, day }).dayOfYear;
  const b = (2 * Math.PI * (n - 81)) / 364;

  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function calculateTrueSolarTime(input: BirthInput): TrueSolarTime {
  const instant = resolveBirthInstant(input);
  if (!Number.isFinite(input.city.longitude) || Math.abs(input.city.longitude) > 180 ||
      !Number.isFinite(input.city.latitude) || Math.abs(input.city.latitude) > 90) {
    throw new BirthTimeValidationError("invalid-location", input.locale);
  }
  const [year, month, day] = input.birthDate.split("-").map(Number);
  // Civil -> local mean solar clock includes the actual offset on this date,
  // including daylight saving and historical non-hour offsets.
  const longitudeCorrectionMinutes =
    input.city.longitude * 4 - instant.timezoneOffsetMinutes;
  const eot = equationOfTimeMinutes(year, month, day);
  const totalCorrectionMinutes = longitudeCorrectionMinutes + eot;
  const corrected = new Date(instant.epochMilliseconds + (input.city.longitude * 4 + eot) * 60_000);
  const correctedYear = corrected.getUTCFullYear();
  const correctedMonth = corrected.getUTCMonth() + 1;
  const correctedDay = corrected.getUTCDate();
  const correctedHour = corrected.getUTCHours();
  const correctedMinute = corrected.getUTCMinutes();
  const date = `${String(correctedYear).padStart(4, "0")}-${pad(correctedMonth)}-${pad(correctedDay)}`;
  const time = `${pad(correctedHour)}:${pad(correctedMinute)}`;

  return {
    date,
    time,
    isoLike: `${date}T${time}:00`,
    longitudeCorrectionMinutes,
    equationOfTimeMinutes: eot,
    totalCorrectionMinutes,
    utcIso: instant.utcIso,
    timezoneOffsetMinutes: instant.timezoneOffsetMinutes,
  };
}

export function trueSolarTimeToParts(trueSolarTime: TrueSolarTime) {
  const [year, month, day] = trueSolarTime.date.split("-").map(Number);
  const [hour, minute] = trueSolarTime.time.split(":").map(Number);

  return { year, month, day, hour, minute };
}
