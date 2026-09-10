"use client";

import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  MapPin,
  ShoppingBag,
  Store,
  Target,
  UserCheck,
  UsersRound,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { DashboardData, SalesUser } from "@/lib/xiaoshou/types";
import {
  formatDate,
  formatMoney,
  salesApi,
  statusLabel,
  tx,
  type AppView,
  type SalesLanguage,
} from "./client";
import { EmptyState, ErrorBanner, PageHeader, Spinner, StatusPill } from "./ui";

export function DashboardView({
  user,
  language,
  onNavigate,
  refreshKey,
}: {
  user: SalesUser;
  language: SalesLanguage;
  onNavigate: (view: AppView) => void;
  refreshKey: number;
}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await salesApi<{ dashboard: DashboardData }>("/dashboard");
      setData(result.dashboard);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx(language, "读取工作台失败。", "Unable to load dashboard."));
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const company = data?.scope === "company";
  const progress = data?.metrics.monthlyTarget
    ? Math.min(100, Math.round((data.metrics.monthRevenue / data.metrics.monthlyTarget) * 100))
    : 0;

  return (
    <div className="xs-view">
      <PageHeader
        eyebrow={company ? tx(language, "公司实时经营", "COMPANY LIVE VIEW") : tx(language, "我的今日", "MY DAY")}
        title={tx(language, `你好，${user.name}`, `Hello, ${user.name}`)}
        copy={company
          ? tx(language, "人员、拜访、订单与目标集中在一个视图。", "People, visits, orders and targets in one decision view.")
          : tx(language, "今天的计划、客户与订单，按优先级清楚展开。", "Your priorities, customers and orders for today, clearly organised.")}
        action={<button className="xs-secondary-button" onClick={() => void load()}>{loading ? <Spinner /> : tx(language, "刷新数据", "Refresh")}</button>}
      />

      {error ? <ErrorBanner message={error} /> : null}

      {loading && !data ? (
        <div className="xs-loading-panel"><Spinner label="Loading dashboard" /><span>{tx(language, "正在同步公司数据…", "Syncing company data…")}</span></div>
      ) : data ? (
        <>
          <section className="xs-kpi-grid">
            <article className="xs-kpi-card xs-kpi-primary">
              <span className="xs-kpi-icon"><CircleDollarSign size={21} /></span>
              <p>{tx(language, "本月已审核销售额", "Approved revenue this month")}</p>
              <strong>{formatMoney(data.metrics.monthRevenue, language)}</strong>
              <div className="xs-progress-track"><span style={{ width: `${progress}%` }} /></div>
              <small>{data.metrics.monthlyTarget > 0
                ? tx(language, `目标完成 ${progress}%`, `${progress}% of target`)
                : tx(language, "管理员尚未设置月度目标", "Monthly target not set")}</small>
            </article>
            <article className="xs-kpi-card">
              <span className="xs-kpi-icon blue"><CalendarCheck size={20} /></span>
              <p>{tx(language, "今日拜访", "Visits today")}</p>
              <strong>{data.metrics.completedVisits}<em> / {data.metrics.todayVisits}</em></strong>
              <small>{tx(language, "已完成 / 已计划", "completed / scheduled")}</small>
            </article>
            <article className="xs-kpi-card">
              <span className="xs-kpi-icon green"><ShoppingBag size={20} /></span>
              <p>{tx(language, "本月订单", "Orders this month")}</p>
              <strong>{data.metrics.monthOrders}</strong>
              <small>{tx(language, "含待审核与已完成", "including pending and completed")}</small>
            </article>
            <article className="xs-kpi-card">
              <span className="xs-kpi-icon violet">{company ? <UsersRound size={20} /> : <Store size={20} />}</span>
              <p>{company ? tx(language, "活跃销售人员", "Active salespeople") : tx(language, "负责客户", "Assigned accounts")}</p>
              <strong>{company ? data.metrics.activeSalespeople : data.metrics.activeCustomers}</strong>
              <small>{company && data.metrics.pendingMembers > 0
                ? tx(language, `${data.metrics.pendingMembers} 人待审批`, `${data.metrics.pendingMembers} awaiting approval`)
                : tx(language, "当前有效范围", "current active scope")}</small>
            </article>
          </section>

          <section className="xs-dashboard-grid">
            <article className="xs-panel xs-next-panel">
              <header className="xs-panel-head">
                <div><span>{tx(language, "接下来", "UP NEXT")}</span><h2>{tx(language, "拜访日程", "Visit schedule")}</h2></div>
                <button onClick={() => onNavigate("visits")}>{tx(language, "全部日程", "All visits")} <ArrowRight size={15} /></button>
              </header>
              {data.nextVisits.length ? (
                <div className="xs-agenda-list">
                  {data.nextVisits.map((visit, index) => (
                    <button className="xs-agenda-item" key={visit.id} onClick={() => onNavigate("visits")}>
                      <span className="xs-agenda-time"><strong>{formatDate(visit.scheduledAt, language, { hour: "2-digit", minute: "2-digit" }).split(" ").at(-1)}</strong><small>{formatDate(visit.scheduledAt, language, { month: "short", day: "numeric" }).split(" ").slice(0, 2).join(" ")}</small></span>
                      <span className="xs-agenda-line"><i className={index === 0 ? "active" : ""} /></span>
                      <span className="xs-agenda-copy"><strong>{visit.customerName || tx(language, "客户拜访", "Customer visit")}</strong><small><MapPin size={13} /> {visit.purpose}</small></span>
                      <ArrowRight size={16} />
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState language={language} title={tx(language, "暂无后续拜访", "No upcoming visits")} copy={tx(language, "从客户页创建下一次拜访计划。", "Schedule the next visit from the accounts page.")} />
              )}
            </article>

            <article className="xs-panel">
              <header className="xs-panel-head">
                <div><span>{tx(language, "订单流", "ORDER FLOW")}</span><h2>{tx(language, "最近订单", "Recent orders")}</h2></div>
                <button onClick={() => onNavigate("orders")}>{tx(language, "查看订单", "View orders")} <ArrowRight size={15} /></button>
              </header>
              {data.recentOrders.length ? (
                <div className="xs-order-compact-list">
                  {data.recentOrders.map((order) => (
                    <button key={order.id} onClick={() => onNavigate("orders")}>
                      <span className="xs-order-symbol"><ShoppingBag size={17} /></span>
                      <span><strong>{order.customerName || order.orderNo}</strong><small>{order.orderNo} · {formatDate(order.createdAt, language)}</small></span>
                      <span className="xs-order-value"><strong>{formatMoney(order.amount, language)}</strong><StatusPill status={order.status}>{statusLabel(order.status, language)}</StatusPill></span>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState language={language} title={tx(language, "还没有订单", "No orders yet")} />
              )}
            </article>
          </section>

          {company ? (
            <section className="xs-panel xs-team-snapshot">
              <header className="xs-panel-head">
                <div><span>{tx(language, "团队表现", "TEAM PERFORMANCE")}</span><h2>{tx(language, "本月销售进度", "Sales progress this month")}</h2></div>
                <button onClick={() => onNavigate("team")}>{tx(language, "管理团队", "Manage team")} <ArrowRight size={15} /></button>
              </header>
              {data.topSalespeople.length ? (
                <div className="xs-ranking-list">
                  {data.topSalespeople.map((member, index) => {
                    const targetProgress = member.target ? Math.min(100, Math.round((member.revenue / member.target) * 100)) : 0;
                    return (
                      <div className="xs-ranking-row" key={member.id}>
                        <span className="xs-rank">{String(index + 1).padStart(2, "0")}</span>
                        <span className="xs-rank-person"><strong>{member.name}</strong><small><CheckCircle2 size={13} /> {member.visits} {tx(language, "次完成拜访", "completed visits")}</small></span>
                        <span className="xs-rank-bar"><i style={{ width: `${targetProgress}%` }} /></span>
                        <span className="xs-rank-value"><strong>{formatMoney(member.revenue, language)}</strong><small>{member.target ? `${targetProgress}%` : tx(language, "未设目标", "No target")}</small></span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState language={language} title={tx(language, "还没有已启用销售人员", "No active salespeople yet")} action={<button className="xs-primary-button" onClick={() => onNavigate("team")}><UserCheck size={17} /> {tx(language, "审批团队成员", "Approve team members")}</button>} />
              )}
            </section>
          ) : (
            <section className="xs-quick-grid">
              <button onClick={() => onNavigate("customers")}><Store size={22} /><span><strong>{tx(language, "客户档案", "Customer accounts")}</strong><small>{tx(language, "联系人、地址与跟进", "Contacts, locations and follow-up")}</small></span><ArrowRight size={17} /></button>
              <button onClick={() => onNavigate("visits")}><Clock3 size={22} /><span><strong>{tx(language, "开始拜访", "Start a visit")}</strong><small>{tx(language, "定位签到并记录结果", "Check in and capture outcomes")}</small></span><ArrowRight size={17} /></button>
              <button onClick={() => onNavigate("orders")}><Target size={22} /><span><strong>{tx(language, "创建订单", "Create an order")}</strong><small>{tx(language, "从产品目录快速下单", "Order from the live catalogue")}</small></span><ArrowRight size={17} /></button>
            </section>
          )}
        </>
      ) : null}
    </div>
  );
}
