"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import styles from "./account-shell.module.css";

type Offer = { available: boolean; mode: string; price: string | null; currency: string };
type OwnReport = { id: string; title: string };
const copy = {
  en: {
    title: "PayPal sandbox test · no real charge", intro: "Choose one of your reports and use a PayPal sandbox buyer account. This test does not change your free administrator access or add live revenue.",
    report: "Your report", amount: "Test amount", start: "Open sandbox checkout", busy: "Opening sandbox…", empty: "Create a report while logged in to test checkout.", create: "Create a report", error: "Sandbox checkout could not be opened. Check that sandbox is configured, then try again.", done: "This sandbox payment is already confirmed. Review it in your purchases.",
  },
  zh: {
    title: "PayPal 沙盒测试（不扣真钱）", intro: "选择本人账号中的一份报告，并使用 PayPal 沙盒买家账号付款。测试不影响管理员免费阅读，也不计入正式收入。",
    report: "选择你的报告", amount: "测试金额", start: "打开沙盒结账", busy: "正在打开沙盒…", empty: "请先在登录状态下创建一份报告，再测试结账。", create: "创建报告", error: "暂时无法打开沙盒结账，请确认沙盒已配置后重试。", done: "这笔沙盒付款已确认，可在购买记录中查看。",
  },
};

export default function AdminSandboxCheckout({ locale, isAdmin, offer, reports }: {
  locale: "en" | "zh"; isAdmin: boolean; offer: Offer; reports: OwnReport[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const text = copy[locale];
  const enabled = isAdmin && offer.available && offer.mode === "sandbox";
  const reportId = reports.some(report => report.id === selectedId) ? selectedId : reports[0]?.id ?? "";
  const home = locale === "zh" ? "/?locale=zh#report" : "/#report";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || busy || !reports.some(report => report.id === reportId)) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/checkout/paypal", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reportId, sandboxTest: true, locale }) });
      const result = await response.json();
      if (response.status === 409 && result.alreadyUnlocked === true) { setMessage(text.done); return; }
      if (!response.ok) throw new Error("sandbox_unavailable");
      if (typeof result.resumeOrderId === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(result.resumeOrderId)) {
        router.push(`/checkout/paypal/return?order=${encodeURIComponent(result.resumeOrderId)}${locale === "zh" ? "&locale=zh" : ""}`);
        return;
      }
      if (typeof result.approvalUrl !== "string") throw new Error("invalid_sandbox_url");
      const destination = new URL(result.approvalUrl);
      if (destination.protocol !== "https:" || !["sandbox.paypal.com", "www.sandbox.paypal.com"].includes(destination.hostname)) throw new Error("invalid_sandbox_url");
      window.location.assign(destination.href);
    } catch {
      setMessage(text.error);
    } finally {
      setBusy(false);
    }
  }

  if (!enabled) return null;
  return <section className={styles.panel} aria-labelledby="admin-sandbox-title">
    <h2 id="admin-sandbox-title">{text.title}</h2><p>{text.intro}</p>
    {reports.length ? <form className={styles.form} onSubmit={submit}>
      <label>{text.report}<select name="sandbox-report" value={reportId} onChange={event => setSelectedId(event.target.value)} disabled={busy} required>{reports.map(report => <option key={report.id} value={report.id}>{report.title} · {report.id.slice(0, 8)}</option>)}</select></label>
      <p className={styles.smallNote}>{text.amount}: {offer.price} {offer.currency}</p>
      <button className={styles.primaryButton} type="submit" disabled={busy}>{busy ? <Loader2 size={16} className={styles.spin} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}{busy ? text.busy : text.start}</button>
    </form> : <><p>{text.empty}</p><Link className={styles.textLink} href={home}>{text.create}<ArrowRight size={15} aria-hidden="true" /></Link></>}
    {message && <p className={styles.message} role="status">{message}</p>}
  </section>;
}
