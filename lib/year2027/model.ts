import { Temporal } from "@js-temporal/polyfill";
import { Solar } from "lunar-javascript";
import { stemElements, stemPolarity, type ElementName, type HeavenlyStem } from "@/lib/core/mappings";
import { calculateBaziEngine, baziCalculationConvention } from "@/lib/engines/bazi";
import { planetaryPositionsAt } from "@/lib/engines/astrology";
import { BirthTimeValidationError, resolveBirthInstant, type BirthInput } from "@/lib/engines/time";

export type Year2027Input = BirthInput & { unknownTime?: boolean };
export type TenGodReading = { name: string; nameEn: string; themeZh: string; themeEn: string; questionZh: string; questionEn: string };
export type Year2027Segment = {
  startUtc: string;
  endUtc: string;
  yearPillar: string;
  monthPillar: string;
  jie?: string;
  jieEn?: string;
  tenGod?: TenGodReading;
  yearTenGod?: TenGodReading;
};
export type Year2027Transit = {
  body: "Jupiter" | "Saturn";
  bodyCn: string;
  longitude: number;
  sign: string;
  signCn: string;
  aspect: "conjunction" | "sextile" | "square" | "trine" | "opposition";
  angle: number;
  orb: number;
  orbRange?: [number, number];
  themeZh: string;
  themeEn: string;
};
export type Year2027Month = {
  month: number;
  startUtc: string;
  endUtc: string;
  snapshotUtc: string;
  baziSegments: Year2027Segment[];
  transits: Year2027Transit[];
  reflection: { zh: string; en: string };
};
export type Year2027Result = {
  year: 2027;
  timeKnown: boolean;
  birth: {
    pillars: { year?: string; month?: string; day?: string; hour?: string };
    dayMaster?: HeavenlyStem;
    sun?: { sign: string; signCn: string; longitude?: number; longitudeRange: [number, number] };
    solarTime?: { date: string; time: string; totalCorrectionMinutes: number };
    utc?: string;
    utcWindow?: [string, string];
    sampleCount?: number;
  };
  months: Year2027Month[];
  method: typeof year2027Method;
  limitations: string[];
};

export const year2027Method = {
  version: "2027-free-v1",
  calendarTimeZone: "UTC",
  termDisplayTimeZone: "Asia/Hong_Kong",
  solarTermPrecision: "minute",
  liChunUtc: "2027-02-04T01:46:18.000Z",
  liChunPublishedMinute: "2027-02-04 09:46 UTC+08:00",
  liChunAlgorithmNote: "lunar-javascript returns 09:46:18 UTC+08; HKO publishes 09:46 to the minute. Library seconds are algorithm output, not published observational precision.",
  bazi: baziCalculationConvention,
  astrology: "Astronomy Engine 2.1.19; geocentric apparent tropical ecliptic longitudes of date; Jupiter and Saturn to natal Sun only.",
  aspects: [0, 60, 90, 120, 180],
  orbDegrees: 3,
  snapshot: "Each Gregorian month's 15th at 12:00 UTC; isolated samples, not a search for transit windows or exact aspects.",
  unknownTime: "Birthplace civil-day UTC interval, including historical IANA/DST rules. Thirty-minute samples and both boundaries; no hour pillar, Moon, angles, houses, or precise natal longitude. Unstable day master or Sun sign is omitted. Unknown-time transit matches require all sampled Sun positions to match within the stated orb.",
  interpretation: "Original symbolic reading rules. BaZi and Western astrology are interpreted independently; reflection prompts are a modern editorial synthesis, not mutual validation or scientific prediction.",
  sources: [
    { label: "Hong Kong Observatory · February 2027", url: "https://www.hko.gov.hk/tc/gts/astron2027/files/2027cal02.pdf" },
    { label: "Hong Kong Observatory · 24 solar terms", url: "https://www.hko.gov.hk/tc/gts/time/24solarterms.htm" },
    { label: "lunar-javascript · exact GanZhi boundaries", url: "https://6tail.cn/calendar/lunar.ganzhi.html" },
    { label: "Astronomy Engine · MIT license and documentation", url: "https://github.com/cosinekitty/astronomy" },
    { label: "IANA Time Zone Database", url: "https://www.iana.org/time-zones" },
  ],
} as const;

const jieNames = [
  ["小寒", "Minor Cold"], ["立春", "Beginning of Spring"], ["惊蛰", "Awakening of Insects"],
  ["清明", "Clear and Bright"], ["立夏", "Beginning of Summer"], ["芒种", "Grain in Ear"],
  ["小暑", "Minor Heat"], ["立秋", "Beginning of Autumn"], ["白露", "White Dew"],
  ["寒露", "Cold Dew"], ["立冬", "Beginning of Winter"], ["大雪", "Major Snow"],
] as const;

type EphemerisSolar = {
  getYear(): number; getMonth(): number; getDay(): number;
  getHour(): number; getMinute(): number; getSecond(): number;
};

function termUtc(solar: EphemerisSolar): number {
  return Date.UTC(solar.getYear(), solar.getMonth() - 1, solar.getDay(), solar.getHour(), solar.getMinute(), solar.getSecond()) - 8 * 3600_000;
}

/** Solar terms are global instants. Longitude and civil time zones never shift them. */
export function year2027SolarTerms() {
  const lunar = Solar.fromYmdHms(2027, 6, 15, 12, 0, 0).getLunar() as ReturnType<ReturnType<typeof Solar.fromYmdHms>["getLunar"]> & { getJieQiTable(): Record<string, EphemerisSolar> };
  const table = lunar.getJieQiTable();
  return jieNames.map(([name, nameEn]) => ({ name, nameEn, utc: new Date(termUtc(table[name])).toISOString() }));
}

/** Fixed UTC+08 library ephemeris clock, shared with the existing BaZi engine. */
export function year2027PillarsAt(utc: string | number | Date) {
  const instant = new Date(utc);
  if (!Number.isFinite(+instant)) throw new Error("INVALID_INSTANT");
  const clock = new Date(+instant + 8 * 3600_000);
  const lunar = Solar.fromYmdHms(clock.getUTCFullYear(), clock.getUTCMonth() + 1, clock.getUTCDate(), clock.getUTCHours(), clock.getUTCMinutes(), clock.getUTCSeconds()).getLunar();
  return { yearPillar: lunar.getYearInGanZhiExact(), monthPillar: lunar.getMonthInGanZhiExact() };
}

const tenGodCopy: Record<string, Omit<TenGodReading, "name">> = {
  比肩: { nameEn: "Peer", themeZh: "自主与平等协作", themeEn: "Autonomy and equal collaboration", questionZh: "哪件事需要自己作主，哪件事适合与同伴分工？", questionEn: "Where do you need autonomy, and where would a peer partnership help?" },
  劫财: { nameEn: "Companion", themeZh: "共享资源与界限", themeEn: "Shared resources and boundaries", questionZh: "共享时间、精力或资源之前，哪些界限值得先讲清？", questionEn: "Which boundaries should be clear before sharing time, energy, or resources?" },
  食神: { nameEn: "Expression", themeZh: "持续创作与生活节奏", themeEn: "Steady expression and everyday rhythm", questionZh: "什么小而持续的练习，能让想法自然变成作品？", questionEn: "What small, repeatable practice could turn an idea into something tangible?" },
  伤官: { nameEn: "Challenging expression", themeZh: "表达判断与检验惯例", themeEn: "Voice and questioning conventions", questionZh: "如何表达不同意见，同时保留证据与沟通空间？", questionEn: "How can you express a different view while making room for evidence and dialogue?" },
  偏财: { nameEn: "Flexible resources", themeZh: "选择机会与资源预算", themeEn: "Options and resource budgeting", questionZh: "面对新选项，怎样先设时间与资源预算再尝试？", questionEn: "Before exploring an option, what time and resource budget can you set?" },
  正财: { nameEn: "Steady resources", themeZh: "日常管理与可持续投入", themeEn: "Stewardship and sustainable effort", questionZh: "哪项日常管理可以更清楚、更可持续？", questionEn: "Which everyday commitment would benefit from clearer, more sustainable management?" },
  七杀: { nameEn: "Challenge", themeZh: "压力下的选择与支援", themeEn: "Choices and support under pressure", questionZh: "面对要求时，哪一步可以拆小，哪些支援可以主动寻求？", questionEn: "Which demanding task can you break down, and what support can you seek?" },
  正官: { nameEn: "Responsibility", themeZh: "责任与清楚的约定", themeEn: "Responsibility and clear agreements", questionZh: "哪些责任需要明确范围、期限与共同约定？", questionEn: "Which responsibility needs a clearer scope, deadline, or agreement?" },
  偏印: { nameEn: "Exploratory learning", themeZh: "换角度学习与整合", themeEn: "Learning from another angle", questionZh: "换一种资料或视角后，原来的理解会如何改变？", questionEn: "How might another source or perspective change your understanding?" },
  正印: { nameEn: "Supportive learning", themeZh: "学习、支持与整理", themeEn: "Learning, support, and integration", questionZh: "哪些知识需要整理，哪种支持值得主动接受？", questionEn: "What knowledge needs organizing, and what support could you accept?" },
};

const produces: Record<ElementName, ElementName> = { Wood: "Fire", Fire: "Earth", Earth: "Metal", Metal: "Water", Water: "Wood" };
const controls: Record<ElementName, ElementName> = { Wood: "Earth", Fire: "Metal", Earth: "Water", Metal: "Wood", Water: "Fire" };

/** Traditional relation of a displayed stem to the natal day stem; not an outcome forecast. */
export function year2027TenGod(dayMaster: HeavenlyStem, target: HeavenlyStem): TenGodReading {
  const a = stemElements[dayMaster], b = stemElements[target];
  const same = stemPolarity[dayMaster] === stemPolarity[target];
  const name = a === b ? (same ? "比肩" : "劫财")
    : produces[a] === b ? (same ? "食神" : "伤官")
      : controls[a] === b ? (same ? "偏财" : "正财")
        : controls[b] === a ? (same ? "七杀" : "正官")
          : (same ? "偏印" : "正印");
  return { name, ...tenGodCopy[name] };
}

const seasonalQuestions = [
  ["回看正在延续的安排，选一件值得带入新年的事。", "Review what is already in motion and choose one commitment to carry forward."],
  ["把一次新的尝试拆成可以回看的小步骤。", "Break a new experiment into small steps you can review."],
  ["观察精力如何分配，给重要的事留出实际空间。", "Notice where your energy goes and make practical space for a priority."],
  ["整理反馈，把一项模糊的期待变成清楚的约定。", "Review feedback and turn a vague expectation into a clear agreement."],
  ["在增加投入前，先确认自己可以持续的节奏。", "Before adding commitments, identify a pace you can sustain."],
  ["选择一件可以完成并展示的小成果。", "Choose one modest piece of work you can finish and share."],
  ["做一次中途盘点，允许计划根据实际情况调整。", "Take stock halfway through and let your plans respond to reality."],
  ["想清楚哪些合作需要更明确的分工。", "Identify which collaboration needs clearer roles."],
  ["回到学习与练习，检验一条自己常用的假设。", "Return to learning and practice; examine an assumption you often rely on."],
  ["梳理资源与时间，减少一项不必要的消耗。", "Review time and resources and reduce one avoidable drain."],
  ["为需要支持的事找到一个具体的求助方式。", "Find a concrete way to ask for support with something that needs it."],
  ["记录这一年的变化，为下一阶段保留可用的经验。", "Record what changed this year and carry useful lessons into the next stage."],
] as const;

export function year2027Calendar(): Year2027Month[] {
  const terms = year2027SolarTerms();
  return Array.from({ length: 12 }, (_, index) => {
    const start = Date.UTC(2027, index, 1), end = Date.UTC(2027, index + 1, 1);
    const inside = terms.filter(term => +new Date(term.utc) > start && +new Date(term.utc) < end);
    const boundaries = [start, ...inside.map(term => +new Date(term.utc)), end];
    const baziSegments = boundaries.slice(0, -1).map((from, i): Year2027Segment => ({
      startUtc: new Date(from).toISOString(), endUtc: new Date(boundaries[i + 1]).toISOString(),
      ...year2027PillarsAt(from),
      ...(i > 0 ? { jie: inside[i - 1].name, jieEn: inside[i - 1].nameEn } : {}),
    }));
    return {
      month: index + 1, startUtc: new Date(start).toISOString(), endUtc: new Date(end).toISOString(),
      snapshotUtc: new Date(Date.UTC(2027, index, 15, 12)).toISOString(),
      baziSegments, transits: [], reflection: { zh: seasonalQuestions[index][0], en: seasonalQuestions[index][1] },
    };
  });
}

function validateLocation(input: Year2027Input) {
  if (!Number.isFinite(input.city.latitude) || Math.abs(input.city.latitude) > 89.9 || !Number.isFinite(input.city.longitude) || Math.abs(input.city.longitude) > 180) {
    throw new BirthTimeValidationError("invalid-location", input.locale);
  }
  // A numeric offset cannot represent a birthplace's historical DST rules.
  if (typeof input.city.timezone !== "string" || input.city.timezone.length > 80 ||
    (input.city.timezone !== "UTC" && !/^[A-Za-z_]+(?:\/[A-Za-z0-9_+\-]+){1,2}$/.test(input.city.timezone))) {
    throw new BirthTimeValidationError("invalid-timezone", input.locale);
  }
}

function unknownBirth(input: Year2027Input): Year2027Result["birth"] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birthDate)) throw new BirthTimeValidationError("invalid-date-time", input.locale);
  let date: Temporal.PlainDate;
  try { date = Temporal.PlainDate.from(input.birthDate, { overflow: "reject" }); }
  catch { throw new BirthTimeValidationError("invalid-date-time", input.locale); }
  if (date.year < 1800 || date.year > 2100) throw new BirthTimeValidationError("unsupported-year", input.locale);
  let start: Temporal.ZonedDateTime, end: Temporal.ZonedDateTime;
  try {
    start = date.toZonedDateTime(input.city.timezone);
    end = date.add({ days: 1 }).toZonedDateTime(input.city.timezone);
  } catch { throw new BirthTimeValidationError("invalid-timezone", input.locale); }
  // A skipped civil date is not silently replaced with the following day.
  if (!start.toPlainDate().equals(date) || end.epochMilliseconds <= start.epochMilliseconds) throw new BirthTimeValidationError("invalid-date-time", input.locale);
  const first = start.epochMilliseconds, last = end.epochMilliseconds - 1;
  const b = (2 * Math.PI * (date.dayOfYear - 81)) / 364;
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  const samples: { pillars: ReturnType<typeof year2027PillarsAt>; day: string; sun: ReturnType<typeof planetaryPositionsAt>[number] }[] = [];
  for (let ms = first; ; ms = Math.min(ms + 30 * 60_000, last)) {
    // Same approximate apparent solar clock as calculateTrueSolarTime, directly
    // from an actual instant so a repeated DST hour is sampled twice correctly.
    const clock = new Date(ms + (input.city.longitude * 4 + eot) * 60_000);
    const ec = Solar.fromYmdHms(clock.getUTCFullYear(), clock.getUTCMonth() + 1, clock.getUTCDate(), clock.getUTCHours(), clock.getUTCMinutes(), clock.getUTCSeconds()).getLunar().getEightChar();
    ec.setSect(2);
    samples.push({ pillars: year2027PillarsAt(ms), day: ec.getDay(), sun: planetaryPositionsAt(new Date(ms), ["Sun"])[0] });
    if (ms === last) break;
  }
  const stable = (get: (s: typeof samples[number]) => string) => samples.every(s => get(s) === get(samples[0])) ? get(samples[0]) : undefined;
  const day = stable(s => s.day);
  const sign = stable(s => s.sun.sign);
  const sun = sign ? {
    sign, signCn: samples[0].sun.signCn,
    longitudeRange: [Math.min(...samples.map(s => s.sun.longitude)), Math.max(...samples.map(s => s.sun.longitude))] as [number, number],
  } : undefined;
  return {
    pillars: { year: stable(s => s.pillars.yearPillar), month: stable(s => s.pillars.monthPillar), ...(day ? { day } : {}) },
    ...(day ? { dayMaster: day[0] as HeavenlyStem } : {}), ...(sun ? { sun } : {}),
    utcWindow: [start.toInstant().toString(), end.toInstant().toString()], sampleCount: samples.length,
  };
}

const aspects = [
  ["conjunction", 0], ["sextile", 60], ["square", 90], ["trine", 120], ["opposition", 180],
] as const;
const separation = (a: number, b: number) => Math.abs((((a - b) % 360) + 540) % 360 - 180);

function transitReading(body: "Jupiter" | "Saturn", aspect: Year2027Transit["aspect"]) {
  const challenging = aspect === "square" || aspect === "opposition";
  return body === "Jupiter"
    ? { themeZh: challenging ? "扩展愿望与现实容量之间的调整" : "学习、探索与拓宽视角的象征", themeEn: challenging ? "Adjusting ambition to practical capacity" : "A symbol for learning, exploration, and perspective" }
    : { themeZh: challenging ? "审视责任、界限与可持续的节奏" : "结构、耐心与长期练习的象征", themeEn: challenging ? "Reviewing responsibilities, limits, and sustainable pace" : "A symbol for structure, patience, and sustained practice" };
}

/** Compare one real transit snapshot with the known Sun or its date-only range. */
export function year2027Snapshot(utc: string, sun: NonNullable<Year2027Result["birth"]["sun"]>): Year2027Transit[] {
  return planetaryPositionsAt(new Date(utc), ["Jupiter", "Saturn"]).flatMap(p => {
    const [low, high] = sun.longitudeRange;
    const natalSamples = [low, (low + high) / 2, high];
    const matches = aspects.map(([aspect, angle]) => {
      const orbs = natalSamples.map(natal => Math.abs(separation(p.longitude, natal) - angle));
      // Absolute aspect error is piecewise linear. Include exact target crossings
      // so the reported minimum is not mistaken for the midpoint sample's error.
      let minimum = Math.min(...orbs);
      for (const direction of [-1, 1]) for (const turns of [-360, 0, 360]) {
        const target = p.longitude + direction * angle + turns;
        if (target >= low && target <= high) minimum = 0;
      }
      return { aspect, angle, minimum, maximum: Math.max(...orbs) };
    }).filter(match => match.maximum <= year2027Method.orbDegrees).sort((a, b) => a.maximum - b.maximum);
    if (!matches.length) return [];
    const match = matches[0];
    const body = p.body as "Jupiter" | "Saturn";
    const round = (n: number) => Number(n.toFixed(3));
    return [{ body, bodyCn: p.bodyCn, longitude: p.longitude, sign: p.sign, signCn: p.signCn,
      aspect: match.aspect, angle: match.angle, orb: round(match.maximum),
      ...(sun.longitude === undefined ? { orbRange: [round(match.minimum), round(match.maximum)] as [number, number] } : {}),
      ...transitReading(body, match.aspect) }];
  });
}

export function calculateYear2027(input: Year2027Input): Year2027Result {
  validateLocation(input);
  let birth: Year2027Result["birth"];
  if (input.unknownTime) birth = unknownBirth(input);
  else {
    const instant = resolveBirthInstant(input);
    const bazi = calculateBaziEngine(input);
    const sun = planetaryPositionsAt(new Date(instant.epochMilliseconds), ["Sun"])[0];
    birth = {
      pillars: bazi.pillars, dayMaster: bazi.dayMaster,
      sun: { sign: sun.sign, signCn: sun.signCn, longitude: sun.longitude, longitudeRange: [sun.longitude, sun.longitude] },
      solarTime: { date: bazi.trueSolarTime.date, time: bazi.trueSolarTime.time, totalCorrectionMinutes: bazi.trueSolarTime.totalCorrectionMinutes },
      utc: instant.utcIso,
    };
  }
  const months = year2027Calendar().map(month => {
    const dayMaster = birth.dayMaster;
    const baziSegments = month.baziSegments.map(segment => ({ ...segment,
      ...(dayMaster ? { tenGod: year2027TenGod(dayMaster, segment.monthPillar[0] as HeavenlyStem), yearTenGod: year2027TenGod(dayMaster, segment.yearPillar[0] as HeavenlyStem) } : {}),
    }));
    const transits = birth.sun ? year2027Snapshot(month.snapshotUtc, birth.sun) : [];
    const lens = baziSegments[baziSegments.length - 1].tenGod;
    const reflection = {
      zh: `${lens?.questionZh ?? month.reflection.zh}${transits.length ? " 另以星盘快照为一条独立视角，检查这次尝试的范围与可持续节奏。" : " 用一个月的小实验记录实际反馈，再调整下一步。"}`,
      en: `${lens?.questionEn ?? month.reflection.en}${transits.length ? " Separately, use the sky snapshot to consider the scope and sustainable pace of your experiment." : " Record the real feedback from a small monthly experiment and adjust your next step."}`,
    };
    return { ...month, baziSegments, transits, reflection };
  });
  return {
    year: 2027, timeKnown: !input.unknownTime, birth, months, method: year2027Method,
    limitations: ["cultural-reflection-only", "independent-traditions-modern-synthesis", "snapshot-not-transit-window", "no-houses-ascendant-or-moon", ...(input.unknownTime ? ["unknown-time-sampled-civil-day", ...(!birth.dayMaster ? ["unstable-day-master-omitted"] : []), ...(!birth.sun ? ["unstable-sun-sign-omitted"] : [])] : [])],
  };
}
