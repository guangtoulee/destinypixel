"use client";

import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  Globe2,
  LockKeyhole,
  MapPinned,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import type { SalesUser } from "@/lib/xiaoshou/types";
import { salesApi, tx, type SalesLanguage } from "./client";
import { ErrorBanner, Spinner } from "./ui";

type Mode = "login" | "register" | "activate";

export function AuthScreen({
  language,
  onLanguage,
  onAuthenticated,
}: {
  language: SalesLanguage;
  onLanguage: (language: SalesLanguage) => void;
  onAuthenticated: (user: SalesUser) => void;
}) {
  const [mode, setMode] = useState<Mode>("login");
  const [adminEntry, setAdminEntry] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    if (next !== "login") setAdminEntry(next === "activate");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const data = new FormData(event.currentTarget);
    try {
      if (mode === "login") {
        const result = await salesApi<{ user: SalesUser }>("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: data.get("email"),
            password: data.get("password"),
          }),
        });
        onAuthenticated(result.user);
      } else {
        const result = await salesApi<{ user: SalesUser }>("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            email: data.get("email"),
            name: data.get("name"),
            phone: data.get("phone"),
            region: data.get("region"),
            password: data.get("password"),
            passwordConfirm: data.get("passwordConfirm"),
            adminCode: mode === "activate" ? data.get("adminCode") : undefined,
          }),
        });
        onAuthenticated(result.user);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx(language, "提交失败。", "Unable to continue."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="xs-auth-shell">
      <section className="xs-auth-story">
        <div className="xs-auth-topbar">
          <a className="xs-brand-lockup" href="/" aria-label="PACKOM China">
            <span className="xs-brand-mark">P</span>
            <span><strong>PACKOM</strong><small>SALES OS · CHINA</small></span>
          </a>
          <div className="xs-auth-actions">
            <button className="xs-language-button" onClick={() => onLanguage(language === "zh" ? "en" : "zh")}>
              <Globe2 size={16} /> {language === "zh" ? "EN" : "中文"}
            </button>
            <button className="xs-admin-entry" onClick={() => { setAdminEntry(true); switchMode("login"); }}>
              <Building2 size={16} /> {tx(language, "公司后台", "Company console")}
            </button>
          </div>
        </div>

        <div className="xs-auth-hero">
          <p className="xs-auth-kicker">FIELD SALES · ONE SOURCE OF TRUTH</p>
          <h1>{tx(language, "让每一次到店，\n都变成可见的增长。", "Turn every store visit\ninto visible growth.")}</h1>
          <p>{tx(
            language,
            "为 PACKOM 中国市场打造的销售执行系统，连接人员、客户、拜访、订单与管理决策。",
            "A sales execution system for PACKOM China, connecting people, accounts, visits, orders and management decisions.",
          )}</p>
          <div className="xs-auth-feature-grid">
            <article><MapPinned size={21} /><strong>{tx(language, "客户与拜访", "Accounts & visits")}</strong><span>{tx(language, "计划、定位签到、结果记录", "Planning, geo check-in and outcomes")}</span></article>
            <article><BarChart3 size={21} /><strong>{tx(language, "订单与目标", "Orders & targets")}</strong><span>{tx(language, "真实订单、审核与团队进度", "Live orders, approvals and progress")}</span></article>
            <article><UsersRound size={21} /><strong>{tx(language, "人员管理", "Team management")}</strong><span>{tx(language, "审批、区域、权限与绩效", "Approvals, territories, roles and performance")}</span></article>
            <article><ShieldCheck size={21} /><strong>{tx(language, "权限与审计", "Security & audit")}</strong><span>{tx(language, "服务端鉴权，全程操作留痕", "Server-side access control and audit trails")}</span></article>
          </div>
        </div>

        <footer className="xs-auth-proof">
          <span><Check size={14} /> RBAC</span>
          <span><Check size={14} /> HTTPS</span>
          <span><Check size={14} /> CLOUD DATA</span>
          <span>v2.0</span>
        </footer>
      </section>

      <section className="xs-auth-panel">
        <div className="xs-auth-card">
          <span className="xs-form-symbol"><LockKeyhole size={22} /></span>
          <p className="xs-eyebrow">
            {mode === "activate"
              ? tx(language, "首次部署", "FIRST-TIME SETUP")
              : adminEntry
                ? tx(language, "公司管理端", "COMPANY CONSOLE")
                : tx(language, "销售人员入口", "SALES TEAM ACCESS")}
          </p>
          <h2>
            {mode === "login"
              ? tx(language, "欢迎回来", "Welcome back")
              : mode === "activate"
                ? tx(language, "激活公司后台", "Activate company console")
                : tx(language, "申请加入团队", "Request team access")}
          </h2>
          <p className="xs-auth-card-copy">
            {mode === "login"
              ? tx(language, "使用公司账户登录，系统会根据角色进入对应工作台。", "Sign in with your company account. Your role determines the workspace you see.")
              : mode === "activate"
                ? tx(language, "仅供公司负责人首次建立系统。激活成功后此入口自动关闭。", "For the company owner’s one-time setup only. This route closes after activation.")
                : tx(language, "注册后由公司管理员审核，批准后即可访问客户与订单。", "A company administrator must approve your account before customer and order access is enabled.")}
          </p>

          <div className="xs-auth-tabs" role="tablist">
            <button className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")} type="button">
              {tx(language, "登录", "Sign in")}
            </button>
            <button className={mode === "register" ? "active" : ""} onClick={() => switchMode("register")} type="button">
              {tx(language, "注册", "Register")}
            </button>
          </div>

          {error ? <ErrorBanner message={error} /> : null}

          <form className="xs-auth-form" onSubmit={submit}>
            {mode !== "login" ? (
              <div className="xs-form-row">
                <label><span>{tx(language, "姓名", "Full name")}</span><input name="name" autoComplete="name" required maxLength={60} placeholder={tx(language, "真实姓名", "Your full name")} /></label>
                <label><span>{tx(language, "手机号", "Mobile")}</span><input name="phone" autoComplete="tel" required maxLength={30} placeholder="138 0000 0000" /></label>
              </div>
            ) : null}
            <label><span>{tx(language, "工作邮箱", "Work email")}</span><input name="email" type="email" autoComplete="email" required maxLength={160} placeholder="name@company.com" /></label>
            {mode !== "login" ? (
              <label><span>{tx(language, "负责区域", "Territory")}</span><input name="region" required maxLength={80} placeholder={tx(language, "例如：上海 / 华东", "e.g. Shanghai / East China")} /></label>
            ) : null}
            <label><span>{tx(language, "密码", "Password")}</span><input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={mode === "login" ? 1 : 8} maxLength={128} placeholder={mode === "login" ? "••••••••" : tx(language, "至少 8 位，含字母和数字", "8+ characters with letters and numbers")} /></label>
            {mode !== "login" ? (
              <label><span>{tx(language, "确认密码", "Confirm password")}</span><input name="passwordConfirm" type="password" autoComplete="new-password" required minLength={8} maxLength={128} placeholder="••••••••" /></label>
            ) : null}
            {mode === "activate" ? (
              <label><span>{tx(language, "公司激活码", "Company activation code")}</span><input name="adminCode" type="password" autoComplete="one-time-code" required maxLength={160} placeholder={tx(language, "输入一次性激活码", "Enter the one-time activation code")} /></label>
            ) : null}
            <button className="xs-primary-button xs-auth-submit" disabled={submitting} type="submit">
              {submitting ? <Spinner label="Submitting" /> : null}
              {mode === "login"
                ? tx(language, "安全登录", "Secure sign in")
                : mode === "activate"
                  ? tx(language, "激活并进入后台", "Activate console")
                  : tx(language, "提交注册申请", "Submit request")}
              {!submitting ? <ArrowRight size={18} /> : null}
            </button>
          </form>

          <div className="xs-auth-footnote">
            {mode === "activate" ? (
              <button onClick={() => switchMode("register")}>{tx(language, "返回销售人员注册", "Back to team registration")}</button>
            ) : (
              <button onClick={() => switchMode("activate")}>{tx(language, "首次部署？激活公司后台", "First deployment? Activate company console")}</button>
            )}
            <span>{tx(language, "登录即表示同意公司数据与隐私政策", "By signing in you agree to company data and privacy policies")}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
