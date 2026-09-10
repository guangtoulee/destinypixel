"use client";

import {
  Bell,
  Building2,
  CheckCircle2,
  Clock3,
  Database,
  KeyRound,
  LockKeyhole,
  MapPinned,
  Save,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { CompanySettings, SalesUser } from "@/lib/xiaoshou/types";
import {
  formatDate,
  roleLabel,
  salesApi,
  tx,
  type SalesLanguage,
} from "./client";
import { Avatar, ErrorBanner, Modal, PageHeader, Spinner, StatusPill } from "./ui";

export function ProfileView({
  user,
  language,
}: {
  user: SalesUser;
  language: SalesLanguage;
}) {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const canManage = user.role === "owner" || user.role === "admin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await salesApi<{ settings: CompanySettings }>("/company");
      setSettings(result.settings);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx(language, "读取设置失败。", "Unable to load settings."));
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveCompany = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    const data = new FormData(event.currentTarget);
    try {
      const result = await salesApi<{ settings: CompanySettings }>("/company", {
        method: "PATCH",
        body: JSON.stringify({
          companyName: data.get("companyName"),
          companyNameEn: data.get("companyNameEn"),
          visitRadiusMeters: Number(data.get("visitRadiusMeters")),
          requireVisitLocation: data.get("requireVisitLocation") === "on",
          registrationEnabled: data.get("registrationEnabled") === "on",
        }),
      });
      setSettings(result.settings);
      setSuccess(tx(language, "公司设置已保存。", "Company settings saved."));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx(language, "保存失败。", "Unable to save."));
    } finally {
      setSubmitting(false);
    }
  };

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await salesApi("/auth/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: data.get("currentPassword"),
          newPassword: data.get("newPassword"),
          passwordConfirm: data.get("passwordConfirm"),
        }),
      });
      setPasswordOpen(false);
      setSuccess(tx(language, "密码已更新。", "Password updated."));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx(language, "修改密码失败。", "Unable to update password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="xs-view">
      <PageHeader
        eyebrow={tx(language, "账户与系统", "ACCOUNT & SYSTEM")}
        title={tx(language, "我的账户", "My account")}
        copy={tx(language, "查看个人权限、负责区域，并管理账户安全。", "Review your role, territory and account security.")}
      />
      {error ? <ErrorBanner message={error} /> : null}
      {success ? <div className="xs-success-banner"><CheckCircle2 size={18} /> {success}</div> : null}

      <section className="xs-profile-grid">
        <article className="xs-profile-card">
          <div className="xs-profile-identity"><Avatar name={user.name} size="large" /><div><h2>{user.name}</h2><p>{user.email}</p><StatusPill status="active">{roleLabel(user.role, language)}</StatusPill></div></div>
          <dl>
            <div><dt><Smartphone size={16} /> {tx(language, "手机号", "Mobile")}</dt><dd>{user.phone || "—"}</dd></div>
            <div><dt><MapPinned size={16} /> {tx(language, "负责区域", "Territory")}</dt><dd>{user.territory || user.region || "—"}</dd></div>
            <div><dt><UserRound size={16} /> {tx(language, "职位", "Job title")}</dt><dd>{user.jobTitle || "—"}</dd></div>
            <div><dt><Clock3 size={16} /> {tx(language, "最近登录", "Last sign-in")}</dt><dd>{formatDate(user.lastLoginAt, language)}</dd></div>
          </dl>
          <button className="xs-secondary-button xs-full-button" onClick={() => setPasswordOpen(true)}><KeyRound size={17} /> {tx(language, "修改登录密码", "Change password")}</button>
        </article>

        <article className="xs-security-card">
          <p className="xs-eyebrow">{tx(language, "安全状态", "SECURITY STATUS")}</p>
          <h2>{tx(language, "账户保护已启用", "Account protection is active")}</h2>
          <div className="xs-security-list">
            <span><i><LockKeyhole size={17} /></i><div><strong>{tx(language, "加密密码", "Hashed password")}</strong><small>{tx(language, "密码不会以明文保存", "Passwords are never stored in plain text")}</small></div><CheckCircle2 size={18} /></span>
            <span><i><ShieldCheck size={17} /></i><div><strong>{tx(language, "角色权限", "Role-based access")}</strong><small>{tx(language, "所有数据访问均在服务端校验", "Every data request is authorised server-side")}</small></div><CheckCircle2 size={18} /></span>
            <span><i><Database size={17} /></i><div><strong>{tx(language, "云端持久化", "Cloud persistence")}</strong><small>{tx(language, "业务数据不依赖浏览器缓存", "Business records do not depend on browser storage")}</small></div><CheckCircle2 size={18} /></span>
            <span><i><Bell size={17} /></i><div><strong>{tx(language, "操作审计", "Audit history")}</strong><small>{tx(language, "关键业务操作均记录人员与时间", "Key actions retain actor and timestamp")}</small></div><CheckCircle2 size={18} /></span>
          </div>
        </article>
      </section>

      {canManage ? (
        <section className="xs-panel xs-company-settings">
          <header className="xs-panel-head"><div><span>{tx(language, "管理员设置", "ADMIN SETTINGS")}</span><h2>{tx(language, "公司与执行规则", "Company & field rules")}</h2></div><Building2 size={22} /></header>
          {loading || !settings ? <div className="xs-loading-panel"><Spinner /></div> : (
            <form className="xs-form-grid" onSubmit={saveCompany}>
              <label><span>{tx(language, "公司名称（中文）", "Company name (Chinese)")}</span><input name="companyName" defaultValue={settings.companyName} required maxLength={120} /></label>
              <label><span>{tx(language, "公司名称（英文）", "Company name (English)")}</span><input name="companyNameEn" defaultValue={settings.companyNameEn} required maxLength={120} /></label>
              <label><span>{tx(language, "有效签到半径（米）", "Valid check-in radius (m)")}</span><input name="visitRadiusMeters" type="number" min="50" max="10000" defaultValue={settings.visitRadiusMeters} /></label>
              <div className="xs-switch-stack">
                <label className="xs-switch-row"><input name="requireVisitLocation" type="checkbox" defaultChecked={settings.requireVisitLocation} /><span><strong>{tx(language, "签到必须定位", "Require location at check-in")}</strong><small>{tx(language, "超出客户范围时拒绝签到", "Reject check-ins outside the account radius")}</small></span></label>
                <label className="xs-switch-row"><input name="registrationEnabled" type="checkbox" defaultChecked={settings.registrationEnabled} /><span><strong>{tx(language, "允许新用户申请", "Allow access requests")}</strong><small>{tx(language, "新注册仍需管理员审批", "New registrations still require approval")}</small></span></label>
              </div>
              <div className="xs-form-actions span-2"><button className="xs-primary-button" disabled={submitting}>{submitting ? <Spinner /> : <Save size={17} />}{tx(language, "保存公司设置", "Save company settings")}</button></div>
            </form>
          )}
        </section>
      ) : null}

      {passwordOpen ? (
        <Modal title={tx(language, "修改登录密码", "Change password")} eyebrow={tx(language, "账户安全", "ACCOUNT SECURITY")} onClose={() => setPasswordOpen(false)}>
          <form className="xs-form-grid" onSubmit={changePassword}>
            <label className="span-2"><span>{tx(language, "当前密码", "Current password")}</span><input name="currentPassword" type="password" autoComplete="current-password" required maxLength={128} /></label>
            <label className="span-2"><span>{tx(language, "新密码", "New password")}</span><input name="newPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={128} placeholder={tx(language, "至少 8 位，包含字母和数字", "8+ characters with letters and numbers")} /></label>
            <label className="span-2"><span>{tx(language, "确认新密码", "Confirm new password")}</span><input name="passwordConfirm" type="password" autoComplete="new-password" required minLength={8} maxLength={128} /></label>
            <div className="xs-form-actions span-2"><button type="button" className="xs-secondary-button" onClick={() => setPasswordOpen(false)}>{tx(language, "取消", "Cancel")}</button><button className="xs-primary-button" disabled={submitting}>{submitting ? <Spinner /> : <KeyRound size={17} />}{tx(language, "更新密码", "Update password")}</button></div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
