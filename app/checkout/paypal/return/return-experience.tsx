"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { trackToolEvent } from "@/lib/analytics";
import { ArrowRight, CheckCircle2, CircleAlert, Clock3, Loader2 } from "lucide-react";
import styles from "@/components/report-unlock.module.css";

type CaptureResult = { status: "completed" | "pending"; reportId: string };
type ConfirmationState = "loading" | "completed" | "pending" | "error" | "login" | "invalid";
const copy = {
  en: {
    loading: "Confirming your payment…", loadingBody: "We are checking the payment with PayPal. Please keep this page open.", completed: "Your full report is unlocked.", completedBody: "Your payment has been confirmed. You can now open the complete report.", pending: "Your payment is still being confirmed.", pendingBody: "Your report will unlock when confirmation completes. Check again shortly; you do not need to make another payment.", error: "We could not confirm the payment yet.", errorBody: "This does not mean the payment failed. Check again or review your account before starting another checkout.", login: "Log in to confirm this purchase.", loginBody: "Use the account that started this checkout, then return to this page to check the payment.", invalid: "This payment reference is not valid.", invalidBody: "Open your account to review your purchases. This page cannot confirm a payment without its original checkout reference.", report: "Open full report", account: "Your account", retry: "Check payment again", home: "Back home", note: "Access is granted only after payment verification.",
  },
  zh: {
    loading: "正在确认支付…", loadingBody: "正在向 PayPal 核实支付结果，请保持页面打开。", completed: "你的完整报告已解锁。", completedBody: "支付已经确认，现在可以打开完整报告。", pending: "支付仍在确认中。", pendingBody: "确认完成后会解锁报告，请稍后再次检查，无需重复付款。", error: "暂时还无法确认支付。", errorBody: "这并不代表付款失败。请再次检查或查看账号记录，确认状态后再决定是否重新结账。", login: "请登录以确认这笔购买。", loginBody: "请使用发起结账的账号登录，然后回到此页检查支付结果。", invalid: "这条支付记录链接无效。", invalidBody: "请进入账号查看购买记录。缺少原始结账编号时，这个页面无法确认付款。", report: "打开完整报告", account: "我的账号", retry: "再次检查支付", home: "返回首页", note: "支付核实成功后才会授予完整报告权限。",
  },
};
async function capture(orderId: string, signal?: AbortSignal): Promise<CaptureResult | "login"> {
  const response = await fetch("/api/checkout/paypal/capture", { method: "POST", cache: "no-store", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }), signal });
  if (response.status === 401) return "login";
  const body = await response.json();
  if (!response.ok || !["completed", "pending"].includes(body.status) || typeof body.reportId !== "string" || !/^[a-zA-Z0-9_-]{1,128}$/.test(body.reportId)) throw new Error("confirmation_unavailable");
  return body;
}
export default function PaypalReturnExperience({ orderId, locale }: { orderId: string; locale: "en" | "zh" }) {
  const text = copy[locale];
  const [state, setState] = useState<ConfirmationState>(orderId ? "loading" : "invalid");
  const [reportId, setReportId] = useState("");
  const confirmationTracked = useRef(false);
  const account = locale === "zh" ? "/account?locale=zh" : "/account";
  useEffect(() => {
    if (!orderId) return;
    const controller = new AbortController();
    void capture(orderId, controller.signal).then((result) => {
      if (controller.signal.aborted) return;
      if (result === "login") setState("login");
      else {
        setReportId(result.reportId); setState(result.status);
        if (result.status === "completed" && !confirmationTracked.current) { confirmationTracked.current = true; trackToolEvent("payment_confirmed", "report_checkout"); }
      }
    }).catch(() => { if (!controller.signal.aborted) setState("error"); });
    return () => controller.abort();
  }, [orderId]);
  async function retry() {
    if (!orderId || state === "loading") return;
    setState("loading");
    try {
      const result = await capture(orderId);
      if (result === "login") setState("login");
      else {
        setReportId(result.reportId); setState(result.status);
        if (result.status === "completed" && !confirmationTracked.current) { confirmationTracked.current = true; trackToolEvent("payment_confirmed", "report_checkout"); }
      }
    } catch { setState("error"); }
  }
  const Icon = state === "completed" ? CheckCircle2 : state === "pending" ? Clock3 : state === "loading" ? Loader2 : CircleAlert;
  return <main className={styles.privatePage} lang={locale === "zh" ? "zh-Hans" : "en"}><section className={styles.privateCard}><Icon size={30} className={state === "loading" ? styles.spin : ""} aria-hidden="true" /><div role={state === "error" ? "alert" : "status"}><h1>{text[state]}</h1><p>{text[`${state}Body`]}</p></div><div className={styles.actions}>{state === "completed" && reportId ? <Link className={styles.primary} href={`/report/${encodeURIComponent(reportId)}?locale=${locale}`}>{text.report}<ArrowRight size={15} aria-hidden="true" /></Link> : state === "pending" || state === "error" || state === "login" ? <button type="button" className={styles.primary} onClick={retry}>{text.retry}</button> : null}<Link className={state === "invalid" || state === "login" ? styles.primary : styles.textLink} href={account}>{text.account}<ArrowRight size={14} aria-hidden="true" /></Link></div><p className={styles.assurance}>{text.note}</p><Link className={styles.textLink} href={locale === "zh" ? "/?locale=zh" : "/"}>{text.home}</Link></section></main>;
}
