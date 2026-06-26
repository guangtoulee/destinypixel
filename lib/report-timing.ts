import type { ReportLocale } from "@/lib/report-i18n";

export type TransitMonthKey =
  | "month01"
  | "month02"
  | "month03"
  | "month04"
  | "month05"
  | "month06"
  | "month07"
  | "month08"
  | "month09"
  | "month10"
  | "month11"
  | "month12";

export type TransitSectionKey = "overview" | TransitMonthKey;

export type TransitMonthSection = {
  key: TransitMonthKey;
  marker: `MONTH_${string}`;
  solarTermZh: string;
  branchMonthZh: string;
  dateRange: string;
  enTitle: string;
  enKicker: string;
  ruTitle: string;
  ruKicker: string;
};

export const transitOverviewSection = {
  key: "overview",
  marker: "OVERVIEW",
} as const;

export const transitMonthSections: TransitMonthSection[] = [
  {
    key: "month01",
    marker: "MONTH_01",
    solarTermZh: "立春",
    branchMonthZh: "寅月",
    dateRange: "02/04-03/05",
    enTitle: "Feb 4 - Mar 5",
    enKicker: "Initiation Window",
    ruTitle: "4 фев. - 5 мар.",
    ruKicker: "Окно запуска",
  },
  {
    key: "month02",
    marker: "MONTH_02",
    solarTermZh: "惊蛰",
    branchMonthZh: "卯月",
    dateRange: "03/05-04/04",
    enTitle: "Mar 5 - Apr 4",
    enKicker: "Growth Window",
    ruTitle: "5 мар. - 4 апр.",
    ruKicker: "Окно роста",
  },
  {
    key: "month03",
    marker: "MONTH_03",
    solarTermZh: "清明",
    branchMonthZh: "辰月",
    dateRange: "04/04-05/05",
    enTitle: "Apr 4 - May 5",
    enKicker: "Grounding Window",
    ruTitle: "4 апр. - 5 мая",
    ruKicker: "Окно опоры",
  },
  {
    key: "month04",
    marker: "MONTH_04",
    solarTermZh: "立夏",
    branchMonthZh: "巳月",
    dateRange: "05/05-06/05",
    enTitle: "May 5 - Jun 5",
    enKicker: "Visibility Window",
    ruTitle: "5 мая - 5 июн.",
    ruKicker: "Окно проявления",
  },
  {
    key: "month05",
    marker: "MONTH_05",
    solarTermZh: "芒种",
    branchMonthZh: "午月",
    dateRange: "06/05-07/07",
    enTitle: "Jun 5 - Jul 7",
    enKicker: "Peak Fire Window",
    ruTitle: "5 июн. - 7 июл.",
    ruKicker: "Окно пика",
  },
  {
    key: "month06",
    marker: "MONTH_06",
    solarTermZh: "小暑",
    branchMonthZh: "未月",
    dateRange: "07/07-08/07",
    enTitle: "Jul 7 - Aug 7",
    enKicker: "Integration Window",
    ruTitle: "7 июл. - 7 авг.",
    ruKicker: "Окно сборки",
  },
  {
    key: "month07",
    marker: "MONTH_07",
    solarTermZh: "立秋",
    branchMonthZh: "申月",
    dateRange: "08/07-09/07",
    enTitle: "Aug 7 - Sep 7",
    enKicker: "Editing Window",
    ruTitle: "7 авг. - 7 сент.",
    ruKicker: "Окно отбора",
  },
  {
    key: "month08",
    marker: "MONTH_08",
    solarTermZh: "白露",
    branchMonthZh: "酉月",
    dateRange: "09/07-10/08",
    enTitle: "Sep 7 - Oct 8",
    enKicker: "Refinement Window",
    ruTitle: "7 сент. - 8 окт.",
    ruKicker: "Окно уточнения",
  },
  {
    key: "month09",
    marker: "MONTH_09",
    solarTermZh: "寒露",
    branchMonthZh: "戌月",
    dateRange: "10/08-11/07",
    enTitle: "Oct 8 - Nov 7",
    enKicker: "Boundary Window",
    ruTitle: "8 окт. - 7 нояб.",
    ruKicker: "Окно границ",
  },
  {
    key: "month10",
    marker: "MONTH_10",
    solarTermZh: "立冬",
    branchMonthZh: "亥月",
    dateRange: "11/07-12/07",
    enTitle: "Nov 7 - Dec 7",
    enKicker: "Deepening Window",
    ruTitle: "7 нояб. - 7 дек.",
    ruKicker: "Окно глубины",
  },
  {
    key: "month11",
    marker: "MONTH_11",
    solarTermZh: "大雪",
    branchMonthZh: "子月",
    dateRange: "12/07-01/05",
    enTitle: "Dec 7 - Jan 5",
    enKicker: "Restoration Window",
    ruTitle: "7 дек. - 5 янв.",
    ruKicker: "Окно восстановления",
  },
  {
    key: "month12",
    marker: "MONTH_12",
    solarTermZh: "小寒",
    branchMonthZh: "丑月",
    dateRange: "01/05-02/04",
    enTitle: "Jan 5 - Feb 4",
    enKicker: "Closure Window",
    ruTitle: "5 янв. - 4 фев.",
    ruKicker: "Окно завершения",
  },
];

export function getTransitMonthDisplay(
  section: TransitMonthSection,
  locale: ReportLocale,
) {
  if (locale === "zh") {
    return {
      title: `${section.branchMonthZh} · ${section.solarTermZh}`,
      kicker: "节气月令",
      range: section.dateRange,
    };
  }

  if (locale === "ru") {
    return {
      title: section.ruTitle,
      kicker: section.ruKicker,
      range: "григорианский период",
    };
  }

  return {
    title: section.enTitle,
    kicker: section.enKicker,
    range: "Gregorian timing",
  };
}

export function getTransitOverviewDisplay(locale: ReportLocale) {
  if (locale === "zh") {
    return {
      title: "年度总览",
      kicker: "十年大运 × 当年流年",
    };
  }

  if (locale === "ru") {
    return {
      title: "Годовой обзор",
      kicker: "Десятилетний цикл и годовое поле",
    };
  }

  return {
    title: "Annual Overview",
    kicker: "Decade cycle x annual field",
  };
}

export const transitPromptMarkers = [
  transitOverviewSection.marker,
  ...transitMonthSections.map((section) => section.marker),
];
