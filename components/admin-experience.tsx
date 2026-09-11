"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, CircleAlert, FileText, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { accountStatus, formatAccountDate, formatAccountMoney } from "./account-experience";
import styles from "./account-shell.module.css";

type Locale = "en" | "zh";
type Overview = {
  counts: { members: number; reports: number; paidOrders: number; pendingOrders: number };
  revenue: { currency: string; amount: string }[];
  recentOrders: { id: string; status: string; amount: string; currency: string; createdAt: string; reportId: string; memberEmail: string; mode?: "sandbox" | "live" }[];
  readiness: { database: boolean; paypal: boolean; paypalMode: string; emailRecovery: boolean; paidReportsEnabled: boolean };
  articles: { title: string; url: string; date: string }[];
};
const copy = {
  en: {
    testReport: "Create a free test report", testNote: "Full reports saved to your administrator account are free to test. Testing does not create a payment or add revenue.",
    home: "Home", account: "Your account", admin: "Administration", language: "Admin language", eyebrow: "DESTINYPIXEL OPERATIONS", title: "A clear view of the essentials.", intro: "Membership, report purchases and service readiness from the server.", refresh: "Refresh", loading: "Loading the overview…", denied: "Administrator access required", deniedBody: "This account does not have access to the administration overview. Log in with an authorized account to continue.", login: "Go to account", error: "The overview is unavailable. Try again in a moment.", members: "Members", reports: "Reports", paidOrders: "Paid orders · live", pendingOrders: "Pending orders · live", revenue: "Live payment totals", noRevenue: "No payment totals to display.", revenueNote: "Amounts are shown separately for each currency. Sandbox orders are excluded from these totals.", recent: "Recent orders", noOrders: "No orders to display.", order: "Order / report", member: "Member", date: "Date", amount: "Amount", status: "Status", readiness: "Service readiness", database: "Persistent database", paypal: "PayPal payments", emailRecovery: "Password recovery email", paidReportsEnabled: "Paid report access", ready: "Configured", missing: "Not configured", enabled: "Enabled", disabled: "Disabled", mode: "PayPal mode", live: "Live", sandbox: "Sandbox", articles: "Published guides", noArticles: "No published guides to display.", articleOpen: "Read guide", unavailable: "Unavailable", noTraffic: "Visitor traffic is not included in these account and payment records.",
  },
  zh: {
    testReport: "创建免费测试报告", testNote: "管理员账号保存的报告可免费测试完整内容。测试不会创建付款，也不计入收入。",
    home: "首页", account: "我的账号", admin: "管理概览", language: "管理页面语言", eyebrow: "DESTINYPIXEL 运营概览", title: "看清运营中最重要的事。", intro: "从服务端读取会员、报告购买与服务准备状态。", refresh: "刷新", loading: "正在读取概览…", denied: "需要管理员权限", deniedBody: "当前账号无权查看管理概览，请使用已授权的管理员账号登录。", login: "前往账号页面", error: "概览暂时不可用，请稍后重试。", members: "会员数", reports: "报告数", paidOrders: "正式已付款订单", pendingOrders: "正式待处理订单", revenue: "正式支付金额汇总", noRevenue: "暂无可显示的支付汇总。", revenueNote: "不同币种分别列示，不合并相加；不计入沙盒测试订单。", recent: "近期订单", noOrders: "暂无订单。", order: "订单 / 报告", member: "会员", date: "日期", amount: "金额", status: "状态", readiness: "服务准备状态", database: "持久化数据库", paypal: "PayPal 支付", emailRecovery: "密码找回邮件", paidReportsEnabled: "付费报告权限", ready: "已配置", missing: "未配置", enabled: "已开启", disabled: "未开启", mode: "PayPal 模式", live: "正式环境", sandbox: "测试沙盒", articles: "已发布指南", noArticles: "暂无已发布指南。", articleOpen: "阅读指南", unavailable: "暂无数据", noTraffic: "这些账号和支付记录不包含网站访客流量。",
  },
};

function safeArticleUrl(value: string) {
  try {
    if (value.startsWith("/") && !value.startsWith("//") && !/[\\\u0000-\u0020]/.test(value)) return value;
    const url = new URL(value);
    return url.protocol === "https:" && ["www.destinypixel.com", "destinypixel.com"].includes(url.hostname) ? `${url.pathname}${url.search}${url.hash}` : null;
  } catch { return null; }
}

async function fetchOverview(signal?: AbortSignal): Promise<Overview | null> {
  const response = await fetch("/api/admin/overview", { cache: "no-store", credentials: "include", signal });
  if (response.status === 401 || response.status === 403) return null;
  if (!response.ok) throw new Error("admin_unavailable");
  const body = await response.json();
  if (!body.counts || !body.readiness || !Array.isArray(body.revenue) || !Array.isArray(body.recentOrders) || !Array.isArray(body.articles)) throw new Error("invalid_overview");
  return body;
}

export default function AdminExperience({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const [data, setData] = useState<Overview | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "denied" | "error">("loading");
  const [refreshing, setRefreshing] = useState(false);
  const home = locale === "zh" ? "/?locale=zh" : "/";
  const account = locale === "zh" ? "/account?locale=zh" : "/account";
  const loadOverview = useCallback(async () => {
    setRefreshing(true);
    try {
      const overview = await fetchOverview();
      setData(overview); setState(overview ? "ready" : "denied");
    } catch { setData(null); setState("error"); }
    finally { setRefreshing(false); }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void fetchOverview(controller.signal).then((overview) => {
      if (!controller.signal.aborted) { setData(overview); setState(overview ? "ready" : "denied"); }
    }).catch(() => { if (!controller.signal.aborted) { setData(null); setState("error"); } });
    return () => controller.abort();
  }, []);
  const counts = [{ key: "members" as const, label: text.members }, { key: "reports" as const, label: text.reports }, { key: "paidOrders" as const, label: text.paidOrders }, { key: "pendingOrders" as const, label: text.pendingOrders }];

  return <main className={styles.page} lang={locale === "zh" ? "zh-Hans" : "en"}>
    <header className={styles.header}><Link className={styles.brand} href={home}><span aria-hidden="true" />DestinyPixel</Link><nav aria-label={text.admin}><Link href={home}>{text.home}</Link><Link href={account}>{text.account}</Link><span>{text.admin}</span></nav><nav className={styles.languages} aria-label={text.language}><Link href="/admin" lang="en" aria-current={locale === "en" ? "page" : undefined}>EN</Link><Link href="/admin?locale=zh" lang="zh-Hans" aria-current={locale === "zh" ? "page" : undefined}>中文</Link></nav></header>
    <div className={styles.container}>
      <section className={`${styles.hero} ${styles.adminHero}`}><div><p className={styles.eyebrow}><ShieldCheck size={15} aria-hidden="true" />{text.eyebrow}</p><h1>{text.title}</h1><p>{text.intro}</p></div>{state === "ready" && <button className={styles.secondaryButton} onClick={() => void loadOverview()} disabled={refreshing}><RefreshCw size={15} className={refreshing ? styles.spin : ""} aria-hidden="true" />{text.refresh}</button>}</section>
      {state === "loading" ? <div className={styles.state} role="status"><Loader2 size={23} className={styles.spin} aria-hidden="true" /><p>{text.loading}</p></div> : state === "denied" ? <section className={styles.state}><ShieldCheck size={31} aria-hidden="true" /><h2>{text.denied}</h2><p>{text.deniedBody}</p><Link href={account} className={styles.primaryButton}>{text.login}<ArrowRight size={15} aria-hidden="true" /></Link></section> : state === "error" || !data ? <section className={styles.state} role="alert"><CircleAlert size={25} aria-hidden="true" /><p>{text.error}</p><button className={styles.secondaryButton} onClick={() => void loadOverview()} disabled={refreshing}>{text.refresh}</button></section> : <>
        <section className={styles.panel}><p>{text.testNote}</p><Link href={`${home}#report`} className={styles.textLink}>{text.testReport}<ArrowRight size={15} aria-hidden="true" /></Link></section>
        <div className={styles.metrics}>{counts.map(({ key, label }) => <article className={styles.metric} key={key}><span>{label}</span><strong>{typeof data.counts[key] === "number" && Number.isFinite(data.counts[key]) ? data.counts[key].toLocaleString(locale === "zh" ? "zh-CN" : "en-US") : text.unavailable}</strong></article>)}</div>
        <div className={styles.adminSplit}>
          <section className={styles.panel}><div className={styles.sectionHeading}><h2>{text.revenue}</h2></div>{data.revenue.length ? <div className={styles.revenueList}>{data.revenue.map((item) => <div key={item.currency}><span>{item.currency}</span><strong>{formatAccountMoney(item.amount, item.currency, locale)}</strong></div>)}</div> : <p className={styles.emptyCopy}>{text.noRevenue}</p>}<p className={styles.smallNote}>{text.revenueNote}</p></section>
          <section className={styles.panel}><div className={styles.sectionHeading}><h2>{text.readiness}</h2></div><dl className={styles.readiness}>{(["database", "paypal", "emailRecovery", "paidReportsEnabled"] as const).map((key) => <div key={key}><dt>{text[key]}</dt><dd data-ready={data.readiness[key]}>{data.readiness[key] ? <CheckCircle2 size={14} aria-hidden="true" /> : <CircleAlert size={14} aria-hidden="true" />}{key === "paidReportsEnabled" ? data.readiness[key] ? text.enabled : text.disabled : data.readiness[key] ? text.ready : text.missing}</dd></div>)}<div><dt>{text.mode}</dt><dd>{data.readiness.paypalMode === "live" ? text.live : data.readiness.paypalMode === "sandbox" ? text.sandbox : text.disabled}</dd></div></dl></section>
        </div>
        <section className={styles.section}><div className={styles.sectionHeading}><h2>{text.recent}</h2></div>{data.recentOrders.length ? <div className={styles.tableScroll} tabIndex={0} role="region" aria-label={text.recent}><table className={styles.table}><thead><tr><th>{text.order}</th><th>{text.member}</th><th>{text.date}</th><th>{text.amount}</th><th>{text.status}</th></tr></thead><tbody>{data.recentOrders.map((order) => <tr key={order.id}><td><code title={order.id}>{order.id.slice(0, 16)}</code><small title={order.reportId}>{order.reportId.slice(0, 16)}</small>{order.mode === "sandbox" && <small>{text.sandbox}</small>}</td><td>{order.memberEmail || "—"}</td><td>{formatAccountDate(order.createdAt, locale)}</td><td>{formatAccountMoney(order.amount, order.currency, locale)}</td><td><span className={styles.badge} data-status={order.status}>{accountStatus(order.status, locale)}</span></td></tr>)}</tbody></table></div> : <p className={styles.emptyCopy}>{text.noOrders}</p>}<p className={styles.smallNote}>{text.noTraffic}</p></section>
        <section className={styles.section}><div className={styles.sectionHeading}><h2>{text.articles}</h2><FileText size={18} aria-hidden="true" /></div>{data.articles.length ? <div className={styles.articleList}>{data.articles.map((article) => { const href = safeArticleUrl(article.url); return <article key={`${article.url}-${article.date}`}><div><h3>{article.title}</h3><p>{formatAccountDate(article.date, locale)}</p></div>{href && <Link href={href} className={styles.textLink}>{text.articleOpen}<ArrowRight size={14} aria-hidden="true" /></Link>}</article>; })}</div> : <p className={styles.emptyCopy}>{text.noArticles}</p>}</section>
      </>}
    </div>
    <footer className={styles.footer}><span>DestinyPixel</span><Link href={home}>{text.home}</Link><Link href={account}>{text.account}</Link></footer>
  </main>;
}
