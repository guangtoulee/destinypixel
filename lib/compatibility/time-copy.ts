import type { ReportLocale } from "@/lib/report-i18n";
import { toTraditional } from "@/lib/journal-locales";
const en = {
  unknown: "I don’t know the birth time", known: "Recorded time", dateOnly: "Date-based comparison", full: "Both birth times supplied", omitted: "Not calculated", boundary: "Solar-term boundary · uncertain", datePortrait: "Civil-date portrait", skyTitle: "What the sky may look like across that day", sampled: "Hourly samples · possible signs", exact: "Supplied birth time", dimensions: ["Day-element connection", "Available element distribution"],
  note: "One or both times are unknown. This score averages two BaZi themes: day-element interaction and the relative counts of available pillars, on the same symbolic 60–100 scale. It does not use planetary aspects and cannot be compared directly with the full-chart score. It is not a relationship success rate.",
  basis: "Unknown-time portraits use the local civil date with a midnight boundary, not a guessed noon or corrected solar birth instant. The hour is omitted; year/month pillars that change during that civil day are also omitted from element counts. With a recorded time, the full chart uses solar-time correction and its day portrait may differ near midnight.",
  skyNote: "For an unknown time, these are possible signs sampled hourly across the actual local day, including clock changes and both day boundaries. They are approximate, not confirmed natal positions: a brief crossing between samples may be missed. No exact degrees, aspects, Ascendant or houses are inferred from them, and they do not enter the date-based score.",
  balanceNote: "Counts include only available stems and branch elements. An unknown hour or uncertain year/month contributes nothing. Different amounts of available information are normalized to percentages; these are not Day Master strength or useful-element assessments.",
  timeNote: "Know the time? Use the local birth record. Otherwise tick “I don’t know” for that person. A birth city is still required for historical time zones and the day window; never replace the missing time with noon.",
  intro: "Explore how you show care, communicate and make room for each other. Enter both birthdays and cities; birth times are optional. Start with a date-based BaZi comparison, or use two recorded times for BaZi and astrology together.",
  description: "Free BaZi compatibility with optional birth times. Compare day-pillar animals and five elements, or add known times for a combined birth-chart reading.",
  faq: "No. Select the unknown-time option separately for either person. The date-based result omits missing hour pillars and uncertain solar-term pillars; it uses BaZi-only scoring and shows sampled possible planetary signs separately. Both recorded times enable the full comparison. Birth cities are still required.",
  method: "When either time is unknown, the date-based mode averages day-element affinity and the normalized distribution of available pillar elements with equal weight. Missing pillars are excluded. Planetary possibilities are displayed separately, without aspect scoring; both times supplied enables the full method described below.",
};
const zh: typeof en = {
  unknown: "不知道出生时辰", known: "已填写出生时间", dateOnly: "日期版相处图谱", full: "双方已填写出生时间", omitted: "不计算", boundary: "节气交界 · 未确定", datePortrait: "按民用日期的意象", skyTitle: "这一天，星空有哪些可能？", sampled: "逐小时取样 · 可能星座", exact: "按填写的出生时间", dimensions: ["日干五行互动", "已知五行分布"],
  note: "一方或双方时辰未知，本次以日干五行互动、已知柱的五行相对分布两项等权平均，呈现 60–100 分的象征性指数。星盘相位不参与，分数不能与完整资料版直接比较，也不是感情成功率。",
  basis: "未知时辰者按出生地民用日期、午夜换日取得日柱意象，不补午时，也不推断真太阳出生时刻。时柱留空；当日跨节气的年柱或月柱也留空，不纳入五行统计。补齐准确时间后，完整盘会作太阳时校正，午夜附近的日柱意象可能不同。",
  skyNote: "未知时辰者按出生地当天实际时间范围逐小时取样，并检查两端，兼顾夏令时变化。这里显示近似的可能星座，不是已确认的本命位置；取样间短暂越界仍可能遗漏。不推断精确度数、相位、上升或宫位，也不参与日期版评分。",
  balanceNote: "仅统计可用天干与地支本气，缺失时柱或未确定的年、月柱均不计入。资料数量可能不同，因此按比例展示；这不是日主强弱或喜用神判断。",
  timeNote: "知道时辰就填写出生地记录中的当地时间；不知道时，勾选该人的“出生时辰未知”。出生城市仍用于历史时区与当天范围，请不要用中午代替未知时辰。",
  intro: "你们怎样表达关心，怎样沟通，又怎样给彼此空间？填写双方生日与城市，时辰可以选填。先看日期版八字比较；双方都有准确时间时，再结合完整八字与星盘阅读。",
  description: "免费八字情感匹配，出生时辰可选填。比较双方日柱动物、五行互动；补齐准确时间后，结合星盘了解性格、沟通与爱的表达。",
  faq: "不一定。双方可分别勾选“出生时辰未知”。日期版不计算缺失时柱，遇到当日节气交界会留空未确定的年、月柱；分数只基于八字可用信息，可能的行星星座另列。双方时间都已知时启用完整比较，出生城市仍需填写。",
  method: "一方时辰未知时，日期版以日干五行互动、已知柱的五行相对分布两项等权计算，缺失柱不参与。星空可能范围单独展示，不计算精确相位分数。双方时间均已填写时，才使用下面的完整资料版方法。",
};
const ru: typeof en = {
  unknown: "Время рождения неизвестно", known: "Время указано", dateOnly: "Сравнение по датам", full: "Указано время обоих", omitted: "Не рассчитан", boundary: "Граница солнечного сезона · не определён", datePortrait: "Образ календарного дня", skyTitle: "Возможные знаки в течение дня", sampled: "Почасовая выборка · возможные знаки", exact: "По указанному времени", dimensions: ["Связь элементов дня", "Доступное распределение элементов"],
  note: "Время одного или обоих неизвестно. Индекс 60–100 усредняет две темы Ба-цзы: связь элементов дня и относительные доли элементов доступных столпов. Аспекты планет не участвуют. Этот индекс нельзя напрямую сравнивать с полной картой; он не означает вероятность успеха отношений.",
  basis: "При неизвестном времени образ дня определяется местной календарной датой с границей в полночь, без подстановки полудня или солнечного времени рождения. Столп часа отсутствует. Если в этот день меняется столп года или месяца, он тоже исключается. При уточнении времени солнечная поправка может изменить столп дня около полуночи.",
  skyNote: "Для неизвестного времени показаны приблизительные знаки из почасовой выборки всего местного дня и его границ с учётом перевода часов. Короткий переход между выборками может быть пропущен. Это не подтверждённые натальные положения: точные градусы, аспекты, асцендент и дома не выводятся и в индекс по датам не входят.",
  balanceNote: "Учитываются только доступные стволы и основные элементы ветвей. Неизвестный час и неопределённые год или месяц исключены. Доли нормализованы при разном объёме данных; это не оценка силы карты или полезных элементов.",
  timeNote: "Введите местное время из записи о рождении или отметьте, что оно неизвестно. Город всё равно нужен для исторического часового пояса и границ дня. Не заменяйте неизвестное время полуднем.",
  intro: "Как вы проявляете заботу, общаетесь и даёте друг другу пространство? Укажите даты и города; время необязательно. Начните со сравнения Ба-цзы по датам, а с двумя известными временами добавьте астрологию.",
  description: "Бесплатная совместимость Ба-цзы без обязательного времени рождения: животные дня, пять элементов и сравнение натальных карт при известных временах.",
  faq: "Нет. Отметьте неизвестное время отдельно для каждого человека. В режиме по датам столп часа и неопределённые столпы на границе сезона исключаются. Индекс использует только доступные данные Ба-цзы, возможные знаки планет показаны отдельно. Города обязательны; с двумя временами доступен полный режим.",
  method: "Если хотя бы одно время неизвестно, режим по датам поровну учитывает связь элементов дня и нормализованные доли доступных столпов. Отсутствующие столпы исключены; возможные знаки показаны без оценки аспектов. Полный метод ниже применяется только с двумя указанными временами.",
};
export function compatibilityTimeCopy(locale: ReportLocale) {
  return locale === "zh-TW" ? JSON.parse(toTraditional(JSON.stringify(zh))) as typeof en : ({ en, zh, ru })[locale];
}
