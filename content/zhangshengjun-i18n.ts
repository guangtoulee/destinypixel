import zhHant from "./zh-hant.json";
import en from "./en.json";

export type SiteLocale = "zh-cn" | "zh-hant" | "en";

export const localeInfo: Record<
  SiteLocale,
  { href: string; htmlLang: string; shortLabel: string; label: string }
> = {
  "zh-cn": {
    href: "/",
    htmlLang: "zh-CN",
    shortLabel: "简",
    label: "简体中文",
  },
  "zh-hant": {
    href: "/zh-hant",
    htmlLang: "zh-Hant",
    shortLabel: "繁",
    label: "繁體中文",
  },
  en: {
    href: "/en",
    htmlLang: "en",
    shortLabel: "EN",
    label: "English",
  },
};

const dictionaries: Partial<Record<SiteLocale, Record<string, string>>> = {
  "zh-hant": zhHant,
  en,
};

export const siteLocales = Object.keys(localeInfo) as SiteLocale[];

export function translate(locale: SiteLocale, source: string) {
  return dictionaries[locale]?.[source] ?? source;
}

export function localizedLabel(locale: SiteLocale, verb: string, value: string) {
  const separator = locale === "en" ? " " : "";
  return `${translate(locale, verb)}${separator}${translate(locale, value)}`;
}
