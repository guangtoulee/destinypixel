import type { ReportLocale } from "./report-i18n";
import { toTraditional } from "./journal-locales";

export type HomeReportOffer = { available: boolean; amount: string | null; currency: string };
const copy = {
  en: { free: "Free tools and basic birth-map preview", paid: "Complete personal birth report", note: "Free tools and basic preview. Optional complete personal report: {price} USD, one-time payment.", unavailable: "Free tools and basic preview. Complete-report checkout is currently unavailable.", details: "Tools, prices and methods" },
  zh: { free: "免费工具与基础出生图谱", paid: "完整个人出生报告", note: "工具和基础预览免费；完整个人报告可选，{price} 美元，单次付款。", unavailable: "工具和基础预览免费；完整报告结算目前未开放。", details: "工具、价格与计算方法" },
  ru: { free: "Бесплатные инструменты и базовый предпросмотр", paid: "Полный личный отчёт о рождении", note: "Инструменты и базовый предпросмотр бесплатны. Полный личный отчёт — по желанию, {price} USD, разовая оплата.", unavailable: "Инструменты и базовый предпросмотр бесплатны. Оплата полного отчёта пока недоступна.", details: "Инструменты, цены и методы" },
};
export function homeOfferCopy(locale: ReportLocale) {
  return locale === "zh-TW" ? JSON.parse(toTraditional(JSON.stringify(copy.zh))) as typeof copy.en : copy[locale];
}
export function homeOffers(offer: HomeReportOffer, locale: ReportLocale, url: string) {
  const c = homeOfferCopy(locale);
  const offers = [{ "@type": "Offer", name: c.free, price: "0", priceCurrency: "USD", url }];
  if (offer.available && offer.amount) offers.push({ "@type": "Offer", name: c.paid, price: offer.amount, priceCurrency: offer.currency, url });
  return offers;
}
