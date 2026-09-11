"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, Loader2, LockKeyhole, ShieldCheck, Save } from "lucide-react";
import { contentLocale, type ReportLocale } from "@/lib/report-i18n";
import { trackToolEvent } from "@/lib/analytics";
import styles from "./report-unlock.module.css";

type Offer = { available: boolean; price: string | null; currency: string; mode: string };
const copy = {
  en: { kicker: "THE FULL REPORT", title: "Go beyond the first impression.", intro: "Keep your basic chart for free. Unlock the complete interpretation of this report when you want to explore it further.", chapters: "Seven natal chapters: your core pattern, outer persona, deeper self, career, love, growth and recovery rhythm.", timing: "Annual overview and twelve monthly timing sections.", export: "Full-report reading with PNG and PDF export.", once: "One payment for this report. No subscription.", action: "Unlock with PayPal", login: "Log in to continue", price: "for this report", unavailable: "Full-report purchases are not available yet. Your basic chart and bracelet workshop remain available.", busy: "Opening PayPal…", error: "Checkout could not be opened. Please try again.", sandbox: "Test mode: this checkout uses PayPal Sandbox.", assurance: "Your report unlocks after the payment is confirmed.", account: "Your account", save: "Save to account", saved: "Saved to your account", saving: "Saving…", saveError: "The report could not be saved. Please try again.", saveIntro: "Keep this basic report in your account." },
  zh: { kicker: "完整报告", title: "从初步印象，走向完整解读。", intro: "基础图谱保持免费。想进一步了解时，可以单独解锁这份报告的完整内容。", chapters: "七个本命篇章：命盘核心、外在形象、深层自我、事业、感情、成长与恢复节律。", timing: "年度概览与十二个月度时运篇章。", export: "完整报告阅读，以及 PNG 长图和 PDF 导出。", once: "只为这份报告付费一次，不含自动续订。", action: "通过 PayPal 解锁", login: "登录后继续", price: "每份报告", unavailable: "完整报告购买暂未开放。你仍可查看基础图谱、使用灵石手串工坊。", busy: "正在打开 PayPal…", error: "暂时无法打开结账，请稍后重试。", sandbox: "测试模式：本次结账使用 PayPal 沙盒。", assurance: "支付确认后才会解锁报告。", account: "我的账号", save: "保存到账号", saved: "已保存到你的账号", saving: "正在保存…", saveError: "暂时无法保存报告，请稍后重试。", saveIntro: "把这份基础报告保存在你的账号中。" },
  ru: { kicker: "ПОЛНЫЙ ОТЧЕТ", title: "От первого впечатления к полной картине.", intro: "Базовая карта остается бесплатной. Полное толкование этого отчета можно открыть отдельно.", chapters: "Семь глав: основа личности, внешний образ, глубинное Я, карьера, любовь, рост и ритм восстановления.", timing: "Годовой обзор и двенадцать ежемесячных разделов.", export: "Чтение полного отчета и экспорт в PNG и PDF.", once: "Один платеж за этот отчет. Без подписки.", action: "Открыть через PayPal", login: "Войти и продолжить", price: "за этот отчет", unavailable: "Покупка полных отчетов пока недоступна. Базовая карта и мастерская браслетов остаются доступны.", busy: "Открываем PayPal…", error: "Не удалось открыть оплату. Попробуйте позже.", sandbox: "Тестовый режим PayPal Sandbox.", assurance: "Отчет откроется после подтверждения платежа.", account: "Аккаунт", save: "Сохранить в аккаунт", saved: "Сохранено в аккаунте", saving: "Сохранение…", saveError: "Не удалось сохранить отчет. Попробуйте позже.", saveIntro: "Сохраните базовый отчет в своем аккаунте." },
};

export default function ReportUnlock({ reportId, locale, isMember, claimable, offer }: { reportId: string; locale: ReportLocale; isMember: boolean; claimable: boolean; offer: Offer }) {
  const text = copy[contentLocale(locale)];
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(isMember && !claimable);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const reportPath = `/report/${encodeURIComponent(reportId)}?locale=${locale}`;
  const accountPath = `/account?${contentLocale(locale) === "zh" ? "locale=zh&" : ""}returnTo=${encodeURIComponent(reportPath)}`;
  let price = "";
  if (offer.price && /^\d+(\.\d+)?$/.test(offer.price)) {
    try { price = new Intl.NumberFormat(locale === "zh" || locale === "zh-TW" ? "zh-CN" : locale === "ru" ? "ru-RU" : "en-US", { style: "currency", currency: offer.currency }).format(Number(offer.price)); } catch { price = `${offer.price} ${offer.currency}`; }
  }
  async function saveReport() {
    if (saving || saved) return;
    if (!isMember) { router.push(accountPath); return; }
    setSaving(true); setSaveError("");
    try {
      const response = await fetch("/api/reports/claim", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reportId }) });
      if (response.status === 401) { router.push(accountPath); return; }
      const body = await response.json();
      if (!response.ok || body.saved !== true) throw new Error(text.saveError);
      setSaved(true);
    } catch { setSaveError(text.saveError); }
    finally { setSaving(false); }
  }
  async function openCheckout() {
    if (busy || !offer.available) return;
    setBusy(true); setError("");
    trackToolEvent("checkout_start", "report_checkout");
    try {
      const response = await fetch("/api/checkout/paypal", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reportId, locale: contentLocale(locale) === "zh" ? "zh" : "en" }) });
      const body = await response.json();
      if (response.status === 401) { router.push(accountPath); return; }
      if (response.status === 409 && body.alreadyUnlocked === true) { router.refresh(); return; }
      if (response.ok && typeof body.resumeOrderId === "string") {
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.resumeOrderId)) throw new Error(text.error);
        router.push(`/checkout/paypal/return?order=${encodeURIComponent(body.resumeOrderId)}${contentLocale(locale) === "zh" ? "&locale=zh" : ""}`);
        return;
      }
      if (!response.ok || typeof body.approvalUrl !== "string") throw new Error(typeof body.error === "string" ? body.error : text.error);
      const destination = new URL(body.approvalUrl);
      if (destination.protocol !== "https:" || !["www.paypal.com", "paypal.com", "www.sandbox.paypal.com", "sandbox.paypal.com"].includes(destination.hostname)) throw new Error(text.error);
      window.location.assign(destination.href);
    } catch (reason) { setError(reason instanceof Error ? reason.message : text.error); setBusy(false); }
  }
  return <><div className={styles.saveBar} data-export-hide><div><p>{saved ? text.saved : text.saveIntro}</p>{saveError && <p className={styles.error} role="alert">{saveError}</p>}</div>{saved ? <Link className={styles.textLink} href={accountPath}><Check size={15} aria-hidden="true" />{text.account}</Link> : <button type="button" className={styles.saveButton} onClick={saveReport} disabled={saving}>{saving ? <Loader2 size={15} className={styles.spin} aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}{saving ? text.saving : text.save}</button>}</div><section className={styles.unlock} aria-labelledby="full-report-title" data-export-hide>
    <p className={styles.eyebrow}><LockKeyhole size={14} aria-hidden="true" />{text.kicker}</p><h2 id="full-report-title">{text.title}</h2><p className={styles.lead}>{text.intro}</p>
    <ul className={styles.benefits}>{[text.chapters, text.timing, text.export].map((item) => <li key={item}><Check size={16} aria-hidden="true" /><span>{item}</span></li>)}</ul>
    {offer.available && price ? <div className={styles.offer}><strong>{price}</strong><span>{text.price}</span></div> : null}
    <p className={styles.note}>{text.once}</p>
    {!offer.available && <p className={styles.notice}>{text.unavailable}</p>}
    {offer.available && offer.mode === "sandbox" && <p className={styles.notice}>{text.sandbox}</p>}
    <div className={styles.actions}>{!isMember ? <Link className={styles.primary} href={accountPath}>{text.login}<ArrowRight size={16} aria-hidden="true" /></Link> : <button type="button" className={styles.primary} onClick={openCheckout} disabled={!offer.available || busy}>{busy ? <Loader2 className={styles.spin} size={16} aria-hidden="true" /> : <LockKeyhole size={16} aria-hidden="true" />}{busy ? text.busy : text.action}</button>}<Link className={styles.textLink} href={accountPath}>{text.account}<ArrowRight size={14} aria-hidden="true" /></Link></div>
    <p className={styles.policies}><Link href={contentLocale(locale) === "zh" ? "/privacy?locale=zh" : "/privacy"}>{contentLocale(locale) === "zh" ? "隐私说明" : locale === "ru" ? "Конфиденциальность (EN)" : "Privacy notice"}</Link><span aria-hidden="true">·</span><Link href={contentLocale(locale) === "zh" ? "/service?locale=zh" : "/service"}>{contentLocale(locale) === "zh" ? "服务说明" : locale === "ru" ? "Условия сервиса (EN)" : "Service terms"}</Link></p>
    {error && <p className={styles.error} role="alert">{error}</p>}<p className={styles.assurance}><ShieldCheck size={14} aria-hidden="true" />{text.assurance}</p>
  </section></>;
}
