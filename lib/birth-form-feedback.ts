import { birthTimeErrorMessage } from "@/lib/engines/time";
import type { ReportLocale } from "@/lib/report-i18n";

const messages = {
  "missing-birth-name": { en: "Enter your name before continuing.", zh: "请先填写姓名。", "zh-TW": "請先填寫姓名。", ru: "Введите имя, чтобы продолжить." },
  "missing-birth-date": { en: "Enter a valid birth date between 1800 and today.", zh: "请填写有效出生日期（1800年至今天）。", "zh-TW": "請填寫有效出生日期（1800年至今天）。", ru: "Укажите дату рождения: от 1800 года до сегодняшнего дня." },
  "missing-birth-time": { en: "Enter your local birth time. If you do not know it, use the free birthday card instead of guessing.", zh: "请填写当地出生时间；如果不清楚，请先使用免费生日卡，不要猜测时辰。", "zh-TW": "請填寫當地出生時間；如果不清楚，請先使用免費生日卡，不要猜測時辰。", ru: "Укажите местное время рождения. Если оно неизвестно, воспользуйтесь бесплатной карточкой, не угадывая время." },
  "unsupported-birth-city": { en: "Enter your birthplace and choose a matching supported suggestion. Do not substitute another birthplace.", zh: "请填写出生城市并选择匹配的支持城市；未支持的出生地请勿用其他城市代替。", "zh-TW": "請填寫出生城市並選擇符合的支援城市；尚未支援的出生地請勿用其他城市代替。", ru: "Укажите место рождения и выберите подходящий город из подсказок. Не заменяйте его другим городом." },
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
