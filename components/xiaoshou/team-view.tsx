"use client";

import {
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  Clock3,
  MapPinned,
  Pencil,
  ShieldCheck,
  Target,
  UserCheck,
  UsersRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { SalesUser } from "@/lib/xiaoshou/types";
import {
  formatDate,
  formatMoney,
  roleLabel,
  salesApi,
  statusLabel,
  tx,
  type SalesLanguage,
  type TeamMember,
} from "./client";
import { Avatar, EmptyState, ErrorBanner, Modal, PageHeader, Spinner, StatusPill } from "./ui";

export function TeamView({
  user,
  language,
  onChanged,
}: {
  user: SalesUser;
  language: SalesLanguage;
  onChanged: () => void;
}) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canManage = user.role === "owner" || user.role === "admin";
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await salesApi<{ members: TeamMember[] }>("/team");
      setMembers(result.members);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx(language, "读取团队失败。", "Unable to load team."));
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    void load();
  }, [load]);

  const pending = members.filter((member) => member.status === "pending");
  const visible = useMemo(
    () => (filter === "all" ? members : members.filter((member) => member.status === filter)),
    [filter, members],
  );

  const patchMember = async (member: TeamMember, input: Record<string, unknown>) => {
    setSubmitting(true);
    setError("");
    try {
      await salesApi(`/team/${member.id}`, { method: "PATCH", body: JSON.stringify(input) });
      setEditing(null);
      await load();
      onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx(language, "更新成员失败。", "Unable to update member."));
    } finally {
      setSubmitting(false);
    }
  };

  const saveMember = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    await patchMember(editing, {
      status: data.get("status"),
      role: data.get("role"),
      jobTitle: data.get("jobTitle"),
      region: data.get("region"),
      territory: data.get("territory"),
      monthlyTarget: Number(data.get("monthlyTarget")),
    });
  };

  return (
    <div className="xs-view">
      <PageHeader
        eyebrow={tx(language, "组织与权限", "PEOPLE & ACCESS")}
        title={tx(language, "销售团队", "Sales team")}
        copy={tx(language, "公司端统一管理账户审批、角色、负责区域、销售目标与执行数据。", "Manage approvals, roles, territories, targets and field performance from one console.")}
      />
      {error ? <ErrorBanner message={error} /> : null}

      <section className="xs-team-kpis">
        <article><UsersRound size={20} /><div><small>{tx(language, "团队成员", "Team members")}</small><strong>{members.length}</strong></div></article>
        <article><UserCheck size={20} /><div><small>{tx(language, "已启用", "Active")}</small><strong>{members.filter((member) => member.status === "active").length}</strong></div></article>
        <article className={pending.length ? "attention" : ""}><Clock3 size={20} /><div><small>{tx(language, "待审批", "Pending approval")}</small><strong>{pending.length}</strong></div></article>
        <article><Target size={20} /><div><small>{tx(language, "团队月目标", "Team monthly target")}</small><strong>{formatMoney(members.filter((member) => member.status === "active").reduce((sum, member) => sum + member.monthlyTarget, 0), language)}</strong></div></article>
      </section>

      {canManage && pending.length ? (
        <section className="xs-pending-section">
          <header><div><p className="xs-eyebrow">{tx(language, "需要处理", "ACTION REQUIRED")}</p><h2>{tx(language, "待审批注册申请", "Pending access requests")}</h2></div><span>{pending.length}</span></header>
          <div className="xs-pending-grid">
            {pending.map((member) => (
              <article key={member.id}>
                <Avatar name={member.name} size="large" />
                <div><h3>{member.name}</h3><p>{member.email}</p><span><MapPinned size={14} /> {member.region || tx(language, "未填写区域", "No territory")}</span></div>
                <div className="xs-pending-actions"><button className="xs-action-green" disabled={submitting} onClick={() => void patchMember(member, { status: "active" })}><Check size={16} /> {tx(language, "批准", "Approve")}</button><button className="xs-secondary-button" onClick={() => setEditing(member)}>{tx(language, "设置后批准", "Review")}</button></div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="xs-toolbar xs-toolbar-tabs">
        <div className="xs-segmented">
          {[['all', '全部', 'All'], ['active', '已启用', 'Active'], ['pending', '待审批', 'Pending'], ['suspended', '已停用', 'Suspended']].map(([value, zh, en]) => <button className={filter === value ? "active" : ""} key={value} onClick={() => setFilter(value)}>{tx(language, zh, en)}</button>)}
        </div>
        <span className="xs-result-count">{visible.length} {tx(language, "位成员", "members")}</span>
      </section>

      {loading ? (
        <div className="xs-loading-panel"><Spinner /><span>{tx(language, "正在加载团队…", "Loading team…")}</span></div>
      ) : visible.length ? (
        <section className="xs-team-table-wrap">
          <div className="xs-team-table-head"><span>{tx(language, "成员", "Member")}</span><span>{tx(language, "角色与区域", "Role & territory")}</span><span>{tx(language, "执行数据", "Activity")}</span><span>{tx(language, "销售额 / 目标", "Revenue / target")}</span><span>{tx(language, "状态", "Status")}</span><span /></div>
          {visible.map((member) => {
            const progress = member.monthlyTarget ? Math.min(100, Math.round((member.revenue / member.monthlyTarget) * 100)) : 0;
            return (
              <article className="xs-team-row" key={member.id}>
                <span className="xs-member-cell"><Avatar name={member.name} /><span><strong>{member.name}</strong><small>{member.email}<br />{member.phone}</small></span></span>
                <span><strong>{roleLabel(member.role, language)}</strong><small>{member.jobTitle || "—"}<br />{member.territory || member.region || "—"}</small></span>
                <span><strong>{member.completedVisits} / {member.visits}</strong><small>{tx(language, "完成拜访 / 全部", "completed / total visits")}<br />{member.orders} {tx(language, "张订单", "orders")}</small></span>
                <span className="xs-member-performance"><strong>{formatMoney(member.revenue, language)}</strong><small>{member.monthlyTarget ? `${progress}% · ${formatMoney(member.monthlyTarget, language)}` : tx(language, "未设置目标", "No target")}</small><i><b style={{ width: `${progress}%` }} /></i></span>
                <span><StatusPill status={member.status}>{statusLabel(member.status, language)}</StatusPill><small>{tx(language, "最近登录", "Last sign-in")}<br />{formatDate(member.lastLoginAt, language)}</small></span>
                <span>{canManage && member.role !== "owner" ? <button className="xs-icon-button" onClick={() => setEditing(member)} aria-label={tx(language, "编辑成员", "Edit member")}><Pencil size={17} /></button> : <BadgeCheck size={18} />}</span>
              </article>
            );
          })}
        </section>
      ) : (
        <EmptyState language={language} title={tx(language, "这个状态下没有成员", "No members in this status")} />
      )}

      {editing ? (
        <Modal title={tx(language, "成员与权限设置", "Member & access settings")} eyebrow={`${editing.name} · ${editing.email}`} onClose={() => setEditing(null)} wide>
          <form className="xs-form-grid" onSubmit={saveMember}>
            <label><span>{tx(language, "账户状态", "Account status")}</span><select name="status" defaultValue={editing.status}><option value="pending">{tx(language, "待审核", "Pending")}</option><option value="active">{tx(language, "已启用", "Active")}</option><option value="suspended">{tx(language, "已停用", "Suspended")}</option></select></label>
            <label><span>{tx(language, "系统角色", "System role")}</span><select name="role" defaultValue={editing.role}><option value="sales">{tx(language, "销售代表", "Sales representative")}</option><option value="manager">{tx(language, "销售经理", "Sales manager")}</option>{user.role === "owner" ? <option value="admin">{tx(language, "管理员", "Administrator")}</option> : null}</select></label>
            <label><span>{tx(language, "职位", "Job title")}</span><input name="jobTitle" defaultValue={editing.jobTitle} maxLength={100} /></label>
            <label><span>{tx(language, "大区", "Region")}</span><input name="region" defaultValue={editing.region} maxLength={80} /></label>
            <label><span>{tx(language, "负责区域", "Territory")}</span><input name="territory" defaultValue={editing.territory} maxLength={120} /></label>
            <label><span>{tx(language, "月度销售目标（元）", "Monthly sales target (CNY)")}</span><input name="monthlyTarget" type="number" min="0" max="100000000" step="100" defaultValue={editing.monthlyTarget} /></label>
            <div className="xs-permission-note span-2"><ShieldCheck size={20} /><div><strong>{tx(language, "权限由服务端强制执行", "Permissions are enforced server-side")}</strong><p>{tx(language, "销售代表只可访问分配给自己的业务；经理可查看公司数据；管理员可审批、分配与审核。", "Sales representatives only access assigned business; managers can view company data; administrators can approve, assign and review.")}</p></div></div>
            <div className="xs-form-actions span-2"><button type="button" className="xs-secondary-button" onClick={() => setEditing(null)}>{tx(language, "取消", "Cancel")}</button><button className="xs-primary-button" disabled={submitting}>{submitting ? <Spinner /> : <BriefcaseBusiness size={17} />}{tx(language, "保存成员设置", "Save member settings")}</button></div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
