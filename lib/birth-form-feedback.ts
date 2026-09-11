import { birthTimeErrorMessage } from "@/lib/engines/time";
import type { ReportLocale } from "@/lib/report-i18n";

const messages = {
  "missing-birth-data": {
    en: "Enter your birth date, local time and a supported birthplace before continuing.",
    zh: "请先填写出生日期、当地时间，并选择支持的出生城市。",
    "zh-TW": "請先填寫出生日期、當地時間，並選擇支援的出生城市。",
    ru: "Укажите дату, местное время и город рождения из списка.",
  },
  "report-storage-unavailable": {
    en: "Your report could not be saved securely right now. Please try again later.",
    zh: "暂时无法安全保存报告，请稍后再试。",
    "zh-TW": "暫時無法安全儲存報告，請稍後再試。",
    ru: "Сейчас не удалось безопасно сохранить отчёт. Повторите попытку позже.",
  },
  "rate-limited": {
    en: "Too many requests in a short time. Please wait a few minutes before trying again.",
    zh: "短时间内请求较多，请稍等几分钟后再试。",
    "zh-TW": "短時間內請求較多，請稍等幾分鐘後再試。",
    ru: "Слишком много запросов за короткое время. Подождите несколько минут и попробуйте снова.",
  },
};

/** Only known error codes become visible text; arbitrary URL input is ignored. */
export function birthFormFeedback(code: string | undefined, locale: ReportLocale): string | undefined {
  return birthTimeErrorMessage(code, locale) ?? (code && Object.hasOwn(messages, code) ? messages[code as keyof typeof messages][locale] : undefined);
}
