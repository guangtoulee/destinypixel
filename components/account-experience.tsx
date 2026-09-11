"use client";

import Link from "next/link";
import { trackToolEvent } from "@/lib/analytics";
import { destinySupportHref } from "@/lib/support-contact";
import AdminSandboxCheckout from "./admin-sandbox-checkout";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowRight, BookOpen, Check, ChevronLeft, CreditCard, KeyRound, Loader2, LogOut, Mail, Sparkles, UserRound } from "lucide-react";
import styles from "./account-shell.module.css";

type Locale = "en" | "zh";
type AccountReport = { id: string; title: string; locale: string; createdAt: string; access: "basic" | "full"; status: string };
type AccountOrder = { id: string; reportId: string; status: string; amount: string; currency: string; createdAt: string; mode?: "sandbox" | "live" };
type AccountData = {
  member: { id: string; email: string; name: string | null; plan: string; isAdmin: boolean } | null;
  reports: AccountReport[];
  orders: AccountOrder[];
  checkout: { available: boolean; price: string | null; currency: "USD"; mode: "disabled" | "sandbox" | "live" };
  passwordResetAvailable: boolean;
};
type AuthMode = "login" | "register" | "recovery" | "reset";
const emptyData: AccountData = { member: null, reports: [], orders: [], checkout: { available: false, price: null, currency: "USD", mode: "disabled" }, passwordResetAvailable: false };

const copy = {
  en: {
    admin: "Administration", adminTesting: "Administrator · free report testing", adminTestingDetail: "Full reports created or saved to this account are available without payment. Start a report while logged in, or save an existing guest report to this account first.",
    home: "Home", tools: "Explore", account: "Your account", localeLabel: "Account language", signIn: "Log in", register: "Create account", logout: "Log out",
    eyebrow: "YOUR DESTINYPIXEL", title: "Keep your inner maps close.", intro: "Return to your reports, see what you have unlocked and keep your purchases in one place.",
    guestTitle: "A home for your reports", guestIntro: "Start with a free basic report. Create an account to keep your reports and purchase a full interpretation when you choose.",
    email: "Email", password: "Password", name: "Name (optional)", confirm: "Confirm password", passwordHint: "Use at least 8 characters.", forgot: "Forgot your password?", backLogin: "Back to login", busy: "Please wait…", recovery: "Reset your password", recoveryIntro: "Enter your account email. If an account matches and email delivery is available, a reset link will arrive shortly.", sendReset: "Send reset link", resetTitle: "Choose a new password", resetIntro: "After resetting, log in again with your new password.", resetAction: "Save new password", resetSent: "If this email belongs to an account and delivery is available, a reset link will arrive shortly.", resetDone: "Your password has been reset. Log in with your new password.", mismatch: "The passwords do not match.", authError: "Could not complete this request. Please try again.", invalidReset: "This reset link has expired or has already been used. Request a new link.", resetUnavailable: "Email recovery is not available right now. Contact support for help.",
    loading: "Loading your account…", loadError: "Your account could not be loaded. Please try again.", retry: "Try again", reports: "Your reports", reportsIntro: "Open a basic report to explore it or unlock its full interpretation.", noReports: "Your first map starts here.", noReportsBody: "Create a basic birth report and return here to find the reports linked to your account.", createReport: "Create a free basic report", open: "View report", basic: "Basic", full: "Full report", orders: "Purchases", noOrders: "No purchases yet.", noOrdersBody: "Full reports are a one-time purchase for each report. You can choose to unlock one from its report page.", date: "Date", purchase: "Purchase", amount: "Amount", status: "Status", orderId: "Order", accessTitle: "Free to begin. Go deeper when ready.", basicDetail: "Basic birth maps remain free.", fullDetail: "Unlock the full interpretation and timing for one report with a single payment.", perReport: "per report · one-time payment", noSubscription: "No subscription.", checkoutOff: "Purchases are not available yet. You can continue exploring basic reports.", sandbox: "Test checkout is enabled. These are sandbox purchases.", viewReportHint: "Choose a report to see its full-report offer.", signedIn: "Signed in as", contact: "Contact support", returnReport: "Return to your report", security: "Your purchases are confirmed by the payment service. Returning from checkout does not by itself unlock a report.",
  },
  zh: {
    admin: "管理后台", adminTesting: "管理员 · 免费测试报告", adminTestingDetail: "此账号创建或保存的报告可免费阅读完整内容。请登录后创建报告；已有游客报告请先保存到此账号。",
    home: "首页", tools: "探索工具", account: "我的账号", localeLabel: "账号页面语言", signIn: "登录", register: "注册账号", logout: "退出登录",
    eyebrow: "我的 DESTINYPIXEL", title: "把你的内在图谱，留在身边。", intro: "随时回来阅读报告，查看已解锁的内容与购买记录。",
    guestTitle: "为你的报告安一个家", guestIntro: "从免费基础报告开始。注册账号保存报告，在需要时选择购买完整解读。",
    email: "邮箱", password: "密码", name: "姓名（选填）", confirm: "确认密码", passwordHint: "请使用至少 8 位密码。", forgot: "忘记密码？", backLogin: "返回登录", busy: "请稍候…", recovery: "找回密码", recoveryIntro: "填写账号邮箱。如果账号存在且邮件服务可用，你会收到重置链接。", sendReset: "发送重置邮件", resetTitle: "设置新密码", resetIntro: "重置后，请使用新密码重新登录。", resetAction: "保存新密码", resetSent: "如果该邮箱关联了账号且邮件服务可用，重置链接将很快送达。", resetDone: "密码已重置，请使用新密码登录。", mismatch: "两次密码不一致。", authError: "本次操作未能完成，请稍后重试。", invalidReset: "重置链接已过期或已使用，请重新获取链接。", resetUnavailable: "邮件找回暂不可用，请联系支持。",
    loading: "正在读取账号…", loadError: "暂时无法读取账号，请重试。", retry: "重新加载", reports: "我的报告", reportsIntro: "打开基础报告继续探索，也可以在报告页面解锁完整解读。", noReports: "从你的第一份图谱开始。", noReportsBody: "创建一份基础出生报告，之后可以在这里找到与你账号关联的报告。", createReport: "创建免费基础报告", open: "查看报告", basic: "基础版", full: "完整版", orders: "购买记录", noOrders: "还没有购买记录。", noOrdersBody: "每份完整报告单独一次付费，可在对应报告页面选择解锁。", date: "日期", purchase: "购买项目", amount: "金额", status: "状态", orderId: "订单", accessTitle: "免费开始，按需深入。", basicDetail: "基础出生图谱保持免费。", fullDetail: "每份报告只需一次付费，即可解锁该报告的完整解读与时运内容。", perReport: "每份报告 · 一次付费", noSubscription: "不含自动续订。", checkoutOff: "购买暂未开放，你仍然可以探索基础报告。", sandbox: "当前启用了测试结账，订单属于沙盒测试。", viewReportHint: "选择一份报告，查看它的完整解读方案。", signedIn: "当前登录", contact: "联系支持", returnReport: "返回你的报告", security: "购买状态以支付服务确认结果为准，仅从结账页返回不会自动解锁报告。",
  },
};

function reportHref(report: AccountReport) {
  const locale = ["en", "zh", "zh-TW", "ru"].includes(report.locale) ? report.locale : "en";
  return `/report/${encodeURIComponent(report.id)}?locale=${locale}`;
}

export function formatAccountMoney(amount: string | null | undefined, currency: string, locale: Locale) {
  if (!amount || !/^\d+(\.\d+)?$/.test(amount)) return "—";
  try { return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", { style: "currency", currency }).format(Number(amount)); } catch { return `${amount} ${currency}`; }
}
export function formatAccountDate(value: string, locale: Locale) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(date);
}
export function accountStatus(value: string, locale: Locale) {
  const labels: Record<string, [string, string]> = { paid: ["Paid", "已付款"], completed: ["Completed", "已完成"], pending: ["Pending", "待确认"], created: ["Created", "已创建"], approved: ["Approved", "已批准"], failed: ["Failed", "未成功"], cancelled: ["Cancelled", "已取消"], canceled: ["Cancelled", "已取消"], refunded: ["Refunded", "已退款"], partially_refunded: ["Partially refunded", "部分退款"], capture_pending: ["Payment processing", "支付处理中"], ai_ready: ["Ready", "可阅读"], ai_pending: ["Preparing", "待生成"], ai_unavailable: ["Generation unavailable", "生成暂不可用"] };
  return labels[value]?.[locale === "zh" ? 1 : 0] ?? value;
}

async function fetchAccount(signal?: AbortSignal): Promise<AccountData> {
  const response = await fetch("/api/account", { cache: "no-store", credentials: "include", signal });
  const body = await response.json();
  if (!response.ok && response.status !== 401) throw new Error("account_unavailable");
  return { ...emptyData, ...body, member: response.status === 401 ? null : body.member ?? null, reports: Array.isArray(body.reports) ? body.reports : [], orders: Array.isArray(body.orders) ? body.orders : [], checkout: { ...emptyData.checkout, ...body.checkout } };
}

function localizedAuthError(code: string | undefined, locale: Locale) {
  const errors: Record<string, [string, string]> = {
    LOGIN_INVALID: ["The email or password is incorrect.", "邮箱或密码不正确。"],
    EMAIL_EXISTS: ["This email already has an account. Log in or reset your password.", "该邮箱已有账号，请登录或找回密码。"],
    INVALID_EMAIL: ["Enter a valid email address.", "请输入有效的邮箱地址。"],
    PASSWORD_TOO_SHORT: ["Use a password with at least 8 characters.", "密码至少需要 8 位。"],
    PASSWORD_TOO_LONG: ["Use a password of no more than 128 characters.", "密码最多 128 位。"],
    PASSWORD_MISMATCH: ["The passwords do not match.", "两次密码不一致。"],
    RATE_LIMITED: ["Too many attempts. Please wait before trying again.", "尝试次数过多，请稍后再试。"],
    AUTH_STORE_UNAVAILABLE: ["Account services are temporarily unavailable. Please try again later.", "账号服务暂不可用，请稍后重试。"],
  };
  return code ? errors[code]?.[locale === "zh" ? 1 : 0] : undefined;
}

export default function AccountExperience({ locale: initialLocale, returnTo, initialResetToken }: { locale: Locale; returnTo: string; initialResetToken: string }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const text = copy[locale];
  const [data, setData] = useState<AccountData>(emptyData);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [authMode, setAuthMode] = useState<AuthMode>(initialResetToken ? "reset" : "login");
  const [resetToken, setResetToken] = useState(initialResetToken);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  const home = locale === "zh" ? "/?locale=zh" : "/";
  const accountPath = locale === "zh" ? "/account?locale=zh" : "/account";
  const toolsPath = locale === "zh" ? "/tools?locale=zh" : "/tools";
  const returnReport = returnTo.startsWith("/report/");
  const loadAccount = useCallback(async () => {
    try { setData(await fetchAccount()); setLoadState("ready"); }
    catch { setLoadState("error"); }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void fetchAccount(controller.signal).then((next) => {
      if (!controller.signal.aborted) { setData(next); setLoadState("ready"); }
    }).catch(() => { if (!controller.signal.aborted) setLoadState("error"); });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (initialResetToken) window.history.replaceState(null, "", locale === "zh" ? "/account?locale=zh" : "/account");
  }, [initialResetToken, locale]);

  function changeMode(mode: AuthMode) { setAuthMode(mode); setMessage(""); setMessageError(false); setPassword(""); setConfirmPassword(""); }
  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setMessage(""); setMessageError(false);
    if ((authMode === "register" || authMode === "reset") && password !== confirmPassword) { setMessage(text.mismatch); setMessageError(true); return; }
    setBusy(true);
    try {
      const action = authMode === "recovery" ? "request-reset" : authMode;
      const payload = authMode === "recovery" ? { email, locale } : authMode === "reset" ? { token: resetToken, password, passwordConfirm: confirmPassword } : { name, email, password, passwordConfirm: confirmPassword };
      const response = await fetch(`/api/members/auth/${action}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json();
      if (!response.ok) {
        if (body.code === "INVALID_RESET_TOKEN") throw new Error(text.invalidReset);
        if (body.code === "PASSWORD_RESET_UNAVAILABLE") throw new Error(text.resetUnavailable);
        throw new Error(localizedAuthError(body.code, locale) ?? (typeof body.error === "string" ? body.error : text.authError));
      }
      if (authMode === "recovery") { setMessage(text.resetSent); return; }
      if (authMode === "reset") { setResetToken(""); setPassword(""); setConfirmPassword(""); setAuthMode("login"); setMessage(text.resetDone); await loadAccount(); return; }
      if (!body.member) throw new Error(text.authError);
      trackToolEvent(authMode === "register" ? "account_created" : "login_success", "member_account");
      setPassword(""); setConfirmPassword("");
      if (returnReport) { window.location.assign(returnTo); return; }
      await loadAccount();
    } catch (error) { setMessage(error instanceof Error ? error.message : text.authError); setMessageError(true); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/members/auth/logout", { method: "POST", credentials: "include" });
      if (!response.ok) throw new Error(text.authError);
      await loadAccount(); setAuthMode("login");
    } catch { setMessage(text.authError); setMessageError(true); }
    finally { setBusy(false); }
  }

  return <main className={styles.page} lang={locale === "zh" ? "zh-Hans" : "en"}>
    <header className={styles.header}>
      <Link className={styles.brand} href={home}><span aria-hidden="true" />DestinyPixel</Link>
      <nav aria-label={locale === "zh" ? "主导航" : "Main navigation"}><Link href={home}>{text.home}</Link><Link href={toolsPath}>{text.tools}</Link><Link href={accountPath} aria-current="page">{text.account}</Link></nav>
      <nav className={styles.languages} aria-label={text.localeLabel}>{resetToken ? <><button type="button" lang="en" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button><button type="button" lang="zh-Hans" aria-pressed={locale === "zh"} onClick={() => setLocale("zh")}>中文</button></> : <><Link href={`/account${returnReport ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`} lang="en" aria-current={locale === "en" ? "page" : undefined}>EN</Link><Link href={`/account?locale=zh${returnReport ? `&returnTo=${encodeURIComponent(returnTo)}` : ""}`} lang="zh-Hans" aria-current={locale === "zh" ? "page" : undefined}>中文</Link></>}</nav>
    </header>
    <div className={styles.container}>
      <section className={styles.hero}><p className={styles.eyebrow}><Sparkles size={15} aria-hidden="true" />{text.eyebrow}</p><h1>{text.title}</h1><p>{text.intro}</p>{returnReport && <Link className={styles.textLink} href={returnTo}><ChevronLeft size={15} aria-hidden="true" />{text.returnReport}</Link>}</section>
      {loadState === "loading" ? <div className={styles.state} role="status"><Loader2 size={22} className={styles.spin} aria-hidden="true" /><p>{text.loading}</p></div> : loadState === "error" ? <div className={styles.state} role="alert"><p>{text.loadError}</p><button className={styles.secondaryButton} onClick={() => { setLoadState("loading"); void loadAccount(); }}>{text.retry}</button></div> : <div className={styles.accountLayout}>
        <div className={styles.mainColumn}>
          {!data.member || authMode === "reset" ? <section className={styles.authCard}>
            <div className={styles.cardHeading}><span className={styles.iconTile}>{authMode === "reset" || authMode === "recovery" ? <KeyRound size={21} /> : <UserRound size={21} />}</span><div><h2>{authMode === "reset" ? text.resetTitle : authMode === "recovery" ? text.recovery : text.guestTitle}</h2><p>{authMode === "reset" ? text.resetIntro : authMode === "recovery" ? text.recoveryIntro : text.guestIntro}</p></div></div>
            {(authMode === "login" || authMode === "register") && <div className={styles.authTabs} role="group" aria-label={text.account}><button type="button" onClick={() => changeMode("login")} disabled={busy} data-active={authMode === "login"}>{text.signIn}</button><button type="button" onClick={() => changeMode("register")} disabled={busy} data-active={authMode === "register"}>{text.register}</button></div>}
            <form className={styles.form} onSubmit={submitAuth}>
              {authMode === "register" && <label>{text.name}<input name="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={100} /></label>}
              {authMode !== "reset" && <label>{text.email}<input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required maxLength={254} /></label>}
              {authMode !== "recovery" && <label>{text.password}<input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={authMode === "login" ? "current-password" : "new-password"} minLength={authMode === "login" ? undefined : 8} maxLength={128} required />{authMode !== "login" && <small>{text.passwordHint}</small>}</label>}
              {(authMode === "register" || authMode === "reset") && <label>{text.confirm}<input type="password" name="passwordConfirm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" minLength={8} maxLength={128} required /></label>}
              <button className={styles.primaryButton} type="submit" disabled={busy}>{busy ? <Loader2 className={styles.spin} size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}{busy ? text.busy : authMode === "register" ? text.register : authMode === "recovery" ? text.sendReset : authMode === "reset" ? text.resetAction : text.signIn}</button>
            </form>
            {authMode === "register" && <p className={styles.policyLinks}>{locale === "zh" ? "注册前请阅读：" : "Before creating an account, read our "}<Link href={locale === "zh" ? "/privacy?locale=zh" : "/privacy"}>{locale === "zh" ? "隐私说明" : "Privacy notice"}</Link>{locale === "zh" ? "与" : " and "}<Link href={locale === "zh" ? "/service?locale=zh" : "/service"}>{locale === "zh" ? "服务说明" : "Service terms"}</Link>{locale === "zh" ? "。" : "."}</p>}
            {authMode === "login" && data.passwordResetAvailable && <button type="button" className={styles.linkButton} onClick={() => changeMode("recovery")}>{text.forgot}</button>}
            {(authMode === "recovery" || authMode === "reset") && <button type="button" className={styles.linkButton} onClick={() => { setResetToken(""); changeMode("login"); }}>{text.backLogin}</button>}
            {message && <p className={styles.message} data-error={messageError} role={messageError ? "alert" : "status"}>{message}</p>}
          </section> : <>
            <section className={styles.identity}><div><span className={styles.eyebrow}>{text.signedIn}</span><strong>{data.member.name || data.member.email}</strong>{data.member.name && <span>{data.member.email}</span>}</div><button className={styles.linkButton} type="button" onClick={logout} disabled={busy}><LogOut size={15} aria-hidden="true" />{text.logout}</button></section>
            {data.member.isAdmin && <section className={styles.panel}><h2>{text.adminTesting}</h2><p>{text.adminTestingDetail}</p><Link href={locale === "zh" ? "/admin?locale=zh" : "/admin"} className={styles.textLink}>{text.admin}<ArrowRight size={15} aria-hidden="true" /></Link></section>}
            <AdminSandboxCheckout locale={locale} isAdmin={data.member.isAdmin} offer={data.checkout} reports={data.reports} />
            {message && <p className={styles.message} data-error={messageError} role={messageError ? "alert" : "status"}>{message}</p>}
            <section className={styles.section}><div className={styles.sectionHeading}><div><h2>{text.reports}</h2><p>{text.reportsIntro}</p></div><span className={styles.count}>{data.reports.length}</span></div>
              {data.reports.length ? <div className={styles.reportList}>{data.reports.map((report) => <article key={report.id} className={styles.reportCard}><div className={styles.reportTop}><span className={styles.iconTile}><BookOpen size={19} aria-hidden="true" /></span><span className={styles.badge} data-full={report.access === "full"}>{report.access === "full" ? text.full : text.basic}</span></div><h3>{report.title}</h3><p className={styles.reportMeta}>{formatAccountDate(report.createdAt, locale)} · {report.locale.toUpperCase()}</p>{report.status && <p className={styles.reportMeta}>{accountStatus(report.status, locale)}</p>}<Link href={reportHref(report)} className={styles.textLink}>{text.open}<ArrowRight size={15} aria-hidden="true" /></Link></article>)}</div> : <div className={styles.empty}><BookOpen size={25} aria-hidden="true" /><h3>{text.noReports}</h3><p>{text.noReportsBody}</p><Link href={`${home}#report`} className={styles.primaryButton}>{text.createReport}<ArrowRight size={15} aria-hidden="true" /></Link></div>}
            </section>
            <section className={styles.section}><div className={styles.sectionHeading}><h2>{text.orders}</h2><CreditCard size={19} aria-hidden="true" /></div>{data.orders.length ? <div className={styles.orderList}>{data.orders.map((order) => <article className={styles.order} key={order.id}><div><strong>{text.full}</strong>{order.mode === "sandbox" && <span className={styles.badge}>{locale === "zh" ? "沙盒测试订单" : "Sandbox order"}</span>}<span>{formatAccountDate(order.createdAt, locale)} · {text.orderId} {order.id.slice(0, 12)}</span>{order.reportId && <Link href={`/report/${encodeURIComponent(order.reportId)}?locale=${locale}`}>{text.open}<ArrowRight size={12} aria-hidden="true" /></Link>}</div><div><strong>{formatAccountMoney(order.amount, order.currency, locale)}</strong><span className={styles.badge} data-status={order.status}>{accountStatus(order.status, locale)}</span></div></article>)}</div> : <div className={styles.emptyCompact}><p>{text.noOrders}</p><span>{text.noOrdersBody}</span></div>}</section>
          </>}
        </div>
        <aside className={styles.sideColumn}><section className={styles.accessCard}><span className={styles.iconTile}><Sparkles size={22} aria-hidden="true" /></span><h2>{data.member?.isAdmin ? text.adminTesting : text.accessTitle}</h2>{data.member?.isAdmin ? <p>{text.adminTestingDetail}</p> : <><p><Check size={15} aria-hidden="true" />{text.basicDetail}</p><p><Check size={15} aria-hidden="true" />{text.fullDetail}</p>{data.checkout.available && data.checkout.price ? <div className={styles.price}><strong>{formatAccountMoney(data.checkout.price, data.checkout.currency, locale)}</strong><span>{text.perReport}</span><small>{text.noSubscription}</small></div> : <p className={styles.availability}>{text.checkoutOff}</p>}{data.checkout.available && data.checkout.mode === "sandbox" && <p className={styles.availability}>{text.sandbox}</p>}<p className={styles.smallNote}>{text.viewReportHint}</p></>}</section><a className={styles.support} href={destinySupportHref}><Mail size={16} aria-hidden="true" />{text.contact}<ArrowRight size={14} aria-hidden="true" /></a></aside>
      </div>}
    </div>
    <footer className={styles.footer}><span>DestinyPixel</span><Link href={home}>{text.home}</Link><Link href={locale === "zh" ? "/privacy?locale=zh" : "/privacy"}>{locale === "zh" ? "隐私说明" : "Privacy"}</Link><Link href={locale === "zh" ? "/service?locale=zh" : "/service"}>{locale === "zh" ? "服务说明" : "Service terms"}</Link><a href={destinySupportHref}>{text.contact}</a></footer>
  </main>;
}
