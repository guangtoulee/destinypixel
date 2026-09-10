"use client";

import {
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  LocateFixed,
  MapPin,
  Plus,
  Route,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Customer, SalesUser, Visit } from "@/lib/xiaoshou/types";
import {
  formatDate,
  salesApi,
  statusLabel,
  tx,
  type SalesLanguage,
  type TeamMember,
} from "./client";
import { EmptyState, ErrorBanner, Modal, PageHeader, Spinner, StatusPill } from "./ui";

type VisitFilter = "today" | "upcoming" | "completed" | "all";

export function VisitsView({
  user,
  language,
  onChanged,
}: {
  user: SalesUser;
  language: SalesLanguage;
  onChanged: () => void;
}) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [filter, setFilter] = useState<VisitFilter>("today");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [completeVisit, setCompleteVisit] = useState<Visit | null>(null);

  const companyRole = user.role !== "sales";
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [visitResult, customerResult, teamResult] = await Promise.all([
        salesApi<{ visits: Visit[] }>("/visits"),
        salesApi<{ customers: Customer[] }>("/customers"),
        companyRole
          ? salesApi<{ members: TeamMember[] }>("/team").catch(() => ({ members: [] }))
          : Promise.resolve({ members: [] as TeamMember[] }),
      ]);
      setVisits(visitResult.visits);
      setCustomers(customerResult.customers);
      setTeam(teamResult.members.filter((member) => member.status === "active"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx(language, "读取拜访任务失败。", "Unable to load visits."));
    } finally {
      setLoading(false);
    }
  }, [companyRole, language]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleVisits = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const end = start + 24 * 60 * 60 * 1000;
    return visits.filter((visit) => {
      const scheduled = new Date(visit.scheduledAt).getTime();
      if (filter === "today") return scheduled >= start && scheduled < end;
      if (filter === "upcoming") return scheduled >= end && visit.status === "planned";
      if (filter === "completed") return visit.status === "completed";
      return true;
    });
  }, [filter, visits]);

  const createVisit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await salesApi("/visits", {
        method: "POST",
        body: JSON.stringify({
          customerId: data.get("customerId"),
          salespersonId: data.get("salespersonId") || undefined,
          scheduledAt: new Date(String(data.get("scheduledAt"))).toISOString(),
          purpose: data.get("purpose"),
        }),
      });
      setScheduleOpen(false);
      await load();
      onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx(language, "创建拜访失败。", "Unable to create visit."));
    } finally {
      setSubmitting(false);
    }
  };

  const updateVisit = async (visit: Visit, payload: Record<string, unknown>) => {
    setSubmitting(true);
    setError("");
    try {
      await salesApi(`/visits/${visit.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      setCompleteVisit(null);
      await load();
      onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx(language, "更新拜访失败。", "Unable to update visit."));
    } finally {
      setSubmitting(false);
    }
  };

  const checkIn = (visit: Visit) => {
    if (!navigator.geolocation) {
      setError(tx(language, "当前设备不支持定位签到。", "Location is not available on this device."));
      return;
    }
    setSubmitting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void updateVisit(visit, {
          action: "checkin",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setSubmitting(false);
        setError(tx(language, "无法获取位置，请在浏览器中允许定位后重试。", "Unable to read your location. Allow location access and try again."));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  };

  const submitCompletion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!completeVisit) return;
    const data = new FormData(event.currentTarget);
    await updateVisit(completeVisit, {
      action: "complete",
      notes: data.get("notes"),
      displayScore: Number(data.get("displayScore")),
      stockStatus: data.get("stockStatus"),
      nextAction: data.get("nextAction"),
    });
  };

  const filters: Array<[VisitFilter, string, string]> = [
    ["today", "今天", "Today"],
    ["upcoming", "后续", "Upcoming"],
    ["completed", "已完成", "Completed"],
    ["all", "全部", "All"],
  ];

  return (
    <div className="xs-view">
      <PageHeader
        eyebrow={tx(language, "一线执行", "FIELD EXECUTION")}
        title={tx(language, "拜访管理", "Visit management")}
        copy={tx(language, "从计划、定位签到到结果复盘，每一步都形成真实记录。", "Plan, geo check in and capture outcomes as a complete activity record.")}
        action={<button className="xs-primary-button" onClick={() => setScheduleOpen(true)}><Plus size={17} /> {tx(language, "安排拜访", "Schedule visit")}</button>}
      />
      {error ? <ErrorBanner message={error} /> : null}

      <section className="xs-toolbar xs-toolbar-tabs">
        <div className="xs-segmented">
          {filters.map(([value, zh, en]) => <button className={filter === value ? "active" : ""} onClick={() => setFilter(value)} key={value}>{tx(language, zh, en)}</button>)}
        </div>
        <span className="xs-result-count">{visibleVisits.length} {tx(language, "项日程", "scheduled items")}</span>
      </section>

      {loading ? (
        <div className="xs-loading-panel"><Spinner /><span>{tx(language, "正在加载拜访…", "Loading visits…")}</span></div>
      ) : visibleVisits.length ? (
        <section className="xs-visit-list">
          {visibleVisits.map((visit) => {
            const ownVisit = visit.salespersonId === user.id;
            return (
              <article className={`xs-visit-card status-${visit.status}`} key={visit.id}>
                <div className="xs-visit-date">
                  <strong>{formatDate(visit.scheduledAt, language, { hour: "2-digit", minute: "2-digit" }).split(" ").at(-1)}</strong>
                  <span>{formatDate(visit.scheduledAt, language, { month: "short", day: "numeric", hour: undefined, minute: undefined })}</span>
                  <i />
                </div>
                <div className="xs-visit-main">
                  <header><div><p>{visit.customerName || tx(language, "客户拜访", "Customer visit")}</p><h2>{visit.purpose}</h2></div><StatusPill status={visit.status}>{statusLabel(visit.status, language)}</StatusPill></header>
                  <div className="xs-visit-meta">
                    <span><MapPin size={15} /> {visit.checkInAt ? tx(language, "已记录签到位置", "Check-in location recorded") : tx(language, "等待现场签到", "Awaiting on-site check-in")}</span>
                    {companyRole ? <span><Route size={15} /> {visit.salespersonName || tx(language, "未分配", "Unassigned")}</span> : null}
                    {visit.checkInAt ? <span><Clock3 size={15} /> {tx(language, "签到", "Checked in")} {formatDate(visit.checkInAt, language)}</span> : null}
                  </div>
                  {visit.status === "completed" ? (
                    <div className="xs-visit-result">
                      <span><small>{tx(language, "陈列评分", "Display score")}</small><strong>{visit.displayScore ? `${visit.displayScore}/5` : "—"}</strong></span>
                      <span><small>{tx(language, "库存反馈", "Stock update")}</small><strong>{visit.stockStatus || "—"}</strong></span>
                      <span><small>{tx(language, "下一步", "Next action")}</small><strong>{visit.nextAction || "—"}</strong></span>
                    </div>
                  ) : null}
                  <footer>
                    {visit.status === "planned" && ownVisit ? <button className="xs-action-blue" disabled={submitting} onClick={() => checkIn(visit)}><LocateFixed size={16} /> {tx(language, "现场签到", "Check in")}</button> : null}
                    {visit.status === "in_progress" && ownVisit ? <button className="xs-action-green" onClick={() => setCompleteVisit(visit)}><ClipboardCheck size={16} /> {tx(language, "完成并记录结果", "Complete visit")}</button> : null}
                    {visit.status === "planned" ? <button className="xs-ghost-danger" disabled={submitting} onClick={() => void updateVisit(visit, { action: "cancel" })}><XCircle size={15} /> {tx(language, "取消", "Cancel")}</button> : null}
                    {visit.status === "completed" ? <span className="xs-complete-note"><CheckCircle2 size={15} /> {formatDate(visit.checkOutAt, language)}</span> : null}
                  </footer>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <EmptyState language={language} title={tx(language, "这个范围内没有拜访", "No visits in this view")} copy={tx(language, "选择其他时间范围，或安排一项新拜访。", "Choose another range or schedule a new visit.")} action={<button className="xs-primary-button" onClick={() => setScheduleOpen(true)}><CalendarPlus size={17} /> {tx(language, "安排拜访", "Schedule visit")}</button>} />
      )}

      {scheduleOpen ? (
        <Modal title={tx(language, "安排新拜访", "Schedule a visit")} eyebrow={tx(language, "日程与任务", "SCHEDULE & PURPOSE")} onClose={() => setScheduleOpen(false)}>
          <form className="xs-form-grid" onSubmit={createVisit}>
            <label className="span-2"><span>{tx(language, "客户", "Customer")}</span><select name="customerId" required defaultValue=""><option value="" disabled>{tx(language, "选择客户", "Select a customer")}</option>{customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.name} · {customer.city}</option>)}</select></label>
            <label className="span-2"><span>{tx(language, "日期与时间", "Date & time")}</span><input name="scheduledAt" type="datetime-local" required /></label>
            {companyRole ? <label className="span-2"><span>{tx(language, "执行人员", "Salesperson")}</span><select name="salespersonId" defaultValue={user.id}>{team.map((member) => <option value={member.id} key={member.id}>{member.name} · {member.territory || member.region}</option>)}</select></label> : null}
            <label className="span-2"><span>{tx(language, "拜访目的", "Purpose")}</span><textarea name="purpose" rows={3} required maxLength={300} /></label>
            <div className="xs-form-actions span-2"><button type="button" className="xs-secondary-button" onClick={() => setScheduleOpen(false)}>{tx(language, "取消", "Cancel")}</button><button className="xs-primary-button" disabled={submitting}>{submitting ? <Spinner /> : <CalendarClock size={17} />}{tx(language, "保存日程", "Save schedule")}</button></div>
          </form>
        </Modal>
      ) : null}

      {completeVisit ? (
        <Modal title={tx(language, "完成拜访记录", "Complete visit record")} eyebrow={completeVisit.customerName} onClose={() => setCompleteVisit(null)} wide>
          <form className="xs-form-grid" onSubmit={submitCompletion}>
            <label><span>{tx(language, "陈列评分", "Display score")}</span><select name="displayScore" defaultValue="5"><option value="5">5 · {tx(language, "优秀", "Excellent")}</option><option value="4">4 · {tx(language, "良好", "Good")}</option><option value="3">3 · {tx(language, "一般", "Average")}</option><option value="2">2 · {tx(language, "待改善", "Needs work")}</option><option value="1">1 · {tx(language, "严重问题", "Critical")}</option></select></label>
            <label><span>{tx(language, "库存反馈", "Stock status")}</span><select name="stockStatus" defaultValue="库存正常"><option value="库存正常">{tx(language, "库存正常", "Healthy stock")}</option><option value="库存偏低">{tx(language, "库存偏低", "Low stock")}</option><option value="缺货">{tx(language, "缺货", "Out of stock")}</option><option value="库存过高">{tx(language, "库存过高", "Overstocked")}</option></select></label>
            <label className="span-2"><span>{tx(language, "拜访纪要", "Visit notes")}</span><textarea name="notes" rows={4} required maxLength={2000} placeholder={tx(language, "沟通内容、客户反馈、竞品情况…", "Discussion, customer feedback and competitor notes…")} /></label>
            <label className="span-2"><span>{tx(language, "下一步行动", "Next action")}</span><textarea name="nextAction" rows={2} required maxLength={500} /></label>
            <div className="xs-form-actions span-2"><button type="button" className="xs-secondary-button" onClick={() => setCompleteVisit(null)}>{tx(language, "暂不完成", "Not yet")}</button><button className="xs-primary-button" disabled={submitting}>{submitting ? <Spinner /> : <CheckCircle2 size={17} />}{tx(language, "提交拜访结果", "Submit visit outcome")}</button></div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
