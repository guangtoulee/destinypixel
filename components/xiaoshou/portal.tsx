"use client";

import {
  BarChart3,
  Building2,
  CheckCircle2,
  CircleAlert,
  Cloud,
  Database,
  Globe2,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Route,
  ShieldCheck,
  ShoppingBag,
  Store,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SalesUser, SessionPayload } from "@/lib/xiaoshou/types";
import { AuthScreen } from "./auth-screen";
import {
  salesApi,
  tx,
  type AppView,
  type HealthPayload,
  type SalesLanguage,
} from "./client";
import { CustomersView } from "./customers-view";
import { DashboardView } from "./dashboard-view";
import { OrdersView } from "./orders-view";
import { ProfileView } from "./profile-view";
import { TeamView } from "./team-view";
import { Avatar, Spinner } from "./ui";
import { VisitsView } from "./visits-view";

type BootstrapState = "loading" | "ready" | "not_configured" | "schema_required" | "unavailable";

export function SalesPortal() {
  const [language, setLanguage] = useState<SalesLanguage>("zh");
  const [bootstrap, setBootstrap] = useState<BootstrapState>("loading");
  const [user, setUser] = useState<SalesUser | null>(null);
  const [view, setView] = useState<AppView>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const stored = window.localStorage.getItem("packom-sales-language");
    if (stored === "en" || stored === "zh") setLanguage(stored);
  }, []);

  const changeLanguage = (next: SalesLanguage) => {
    setLanguage(next);
    window.localStorage.setItem("packom-sales-language", next);
  };

  const boot = useCallback(async () => {
    setBootstrap("loading");
    try {
      const healthResponse = await fetch("/api/xiaoshou/health", { cache: "no-store" });
      const health = (await healthResponse.json()) as HealthPayload;
      if (!health.ok) {
        setBootstrap(health.storage || "unavailable");
        setUser(null);
        return;
      }
      const session = await salesApi<SessionPayload>("/session");
      setUser(session.user);
      setBootstrap("ready");
    } catch {
      setBootstrap("unavailable");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void boot();
  }, [boot]);

  if (bootstrap === "loading") {
    return <LaunchScreen language={language} />;
  }

  if (bootstrap !== "ready") {
    return (
      <SetupScreen
        language={language}
        state={bootstrap}
        onRetry={() => void boot()}
        onLanguage={changeLanguage}
      />
    );
  }

  if (!user) {
    return (
      <AuthScreen
        language={language}
        onLanguage={changeLanguage}
        onAuthenticated={(nextUser) => {
          setUser(nextUser);
          setView("dashboard");
        }}
      />
    );
  }

  if (user.status === "pending") {
    return (
      <PendingScreen
        user={user}
        language={language}
        onLanguage={changeLanguage}
        onRefresh={async () => {
          const session = await salesApi<SessionPayload>("/session");
          setUser(session.user);
        }}
        onLogout={async () => {
          await salesApi("/auth/logout", { method: "POST" }).catch(() => undefined);
          setUser(null);
        }}
      />
    );
  }

  return (
    <ApplicationShell
      user={user}
      language={language}
      view={view}
      menuOpen={menuOpen}
      refreshKey={refreshKey}
      onView={(next) => {
        setView(next);
        setMenuOpen(false);
      }}
      onMenu={setMenuOpen}
      onLanguage={changeLanguage}
      onChanged={() => setRefreshKey((value) => value + 1)}
      onLogout={async () => {
        await salesApi("/auth/logout", { method: "POST" }).catch(() => undefined);
        setUser(null);
        setView("dashboard");
      }}
    />
  );
}

function LaunchScreen({ language }: { language: SalesLanguage }) {
  return (
    <main className="xs-launch-screen">
      <span className="xs-launch-mark">P</span>
      <strong>PACKOM</strong>
      <p>SALES OS · CHINA</p>
      <div><Spinner label="Launching" /> {tx(language, "正在安全连接…", "Connecting securely…")}</div>
    </main>
  );
}

function SetupScreen({
  language,
  state,
  onRetry,
  onLanguage,
}: {
  language: SalesLanguage;
  state: Exclude<BootstrapState, "loading" | "ready">;
  onRetry: () => void;
  onLanguage: (language: SalesLanguage) => void;
}) {
  const unavailable = state === "unavailable";
  return (
    <main className="xs-setup-screen">
      <header>
        <a className="xs-brand-lockup" href="/"><span className="xs-brand-mark">P</span><span><strong>PACKOM</strong><small>SALES OS · CHINA</small></span></a>
        <button className="xs-language-button" onClick={() => onLanguage(language === "zh" ? "en" : "zh")}><Globe2 size={16} /> {language === "zh" ? "EN" : "中文"}</button>
      </header>
      <section className="xs-setup-card">
        <span className={unavailable ? "warning" : ""}>{unavailable ? <CircleAlert size={30} /> : <Database size={30} />}</span>
        <p className="xs-eyebrow">{unavailable ? "SERVICE STATUS" : "PRODUCTION SETUP"}</p>
        <h1>{unavailable ? tx(language, "数据服务暂时不可用", "Data service is temporarily unavailable") : tx(language, "正式系统代码已就绪，等待初始化云数据库", "The production application is ready for cloud database setup")}</h1>
        <p>{unavailable
          ? tx(language, "系统没有切换到模拟数据，以免销售记录丢失或出现错误。请稍后重试。", "The application will not fall back to fake data, preventing lost or inconsistent sales records. Please retry shortly.")
          : tx(language, "需要在已连接的 Supabase 项目执行一次数据库结构文件，随后即可激活公司管理员并开放注册。", "Run the supplied database schema once in the connected Supabase project, then activate the company owner and open team registration.")}</p>
        <div className="xs-setup-steps">
          <article className={state === "schema_required" ? "current" : "done"}><span>{state === "schema_required" ? "01" : <CheckCircle2 size={17} />}</span><div><strong>{tx(language, "建立业务数据表", "Create business tables")}</strong><small>{tx(language, "账户、会话、客户、拜访、订单、产品与审计", "Accounts, sessions, customers, visits, orders, products and audit")}</small></div></article>
          <article><span>02</span><div><strong>{tx(language, "激活公司负责人", "Activate company owner")}</strong><small>{tx(language, "使用一次性激活码，建立首个管理账户", "Use the one-time code to establish the first administrator")}</small></div></article>
          <article><span>03</span><div><strong>{tx(language, "审批销售团队", "Approve the sales team")}</strong><small>{tx(language, "分配角色、区域和月度目标后开始使用", "Assign roles, territories and targets, then go live")}</small></div></article>
        </div>
        <button className="xs-primary-button" onClick={onRetry}><RefreshCw size={17} /> {tx(language, "重新检查", "Check again")}</button>
        <small className="xs-setup-note"><ShieldCheck size={14} /> {tx(language, "出于数据安全考虑，生产环境不会使用浏览器缓存或临时文件代替数据库。", "For data safety, production never substitutes browser storage or temporary files for the database.")}</small>
      </section>
    </main>
  );
}

function PendingScreen({
  user,
  language,
  onLanguage,
  onRefresh,
  onLogout,
}: {
  user: SalesUser;
  language: SalesLanguage;
  onLanguage: (language: SalesLanguage) => void;
  onRefresh: () => Promise<void>;
  onLogout: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <main className="xs-pending-screen">
      <header><a className="xs-brand-lockup" href="/"><span className="xs-brand-mark">P</span><span><strong>PACKOM</strong><small>SALES OS · CHINA</small></span></a><button className="xs-language-button" onClick={() => onLanguage(language === "zh" ? "en" : "zh")}><Globe2 size={16} /> {language === "zh" ? "EN" : "中文"}</button></header>
      <section>
        <Avatar name={user.name} size="large" />
        <p className="xs-eyebrow">ACCESS REQUEST RECEIVED</p>
        <h1>{tx(language, `${user.name}，你的申请已提交`, `${user.name}, your request has been received`)}</h1>
        <p>{tx(language, "公司管理员需要确认你的身份、负责区域和权限。审批完成后，刷新状态即可进入系统。", "A company administrator needs to confirm your identity, territory and access. Refresh once your request is approved.")}</p>
        <div className="xs-pending-details"><span><strong>{tx(language, "工作邮箱", "Work email")}</strong>{user.email}</span><span><strong>{tx(language, "申请区域", "Requested territory")}</strong>{user.region}</span><span><strong>{tx(language, "当前状态", "Current status")}</strong>{tx(language, "待管理员审核", "Awaiting administrator approval")}</span></div>
        <div className="xs-pending-buttons"><button className="xs-primary-button" disabled={loading} onClick={async () => { setLoading(true); await onRefresh().finally(() => setLoading(false)); }}>{loading ? <Spinner /> : <RefreshCw size={17} />}{tx(language, "刷新审批状态", "Refresh approval status")}</button><button className="xs-secondary-button" onClick={() => void onLogout()}><LogOut size={17} /> {tx(language, "退出账户", "Sign out")}</button></div>
      </section>
    </main>
  );
}

function ApplicationShell({
  user,
  language,
  view,
  menuOpen,
  refreshKey,
  onView,
  onMenu,
  onLanguage,
  onChanged,
  onLogout,
}: {
  user: SalesUser;
  language: SalesLanguage;
  view: AppView;
  menuOpen: boolean;
  refreshKey: number;
  onView: (view: AppView) => void;
  onMenu: (open: boolean) => void;
  onLanguage: (language: SalesLanguage) => void;
  onChanged: () => void;
  onLogout: () => Promise<void>;
}) {
  const companyRole = user.role !== "sales";
  const nav = useMemo(() => {
    const items: Array<{ view: AppView; zh: string; en: string; icon: typeof LayoutDashboard }> = [
      { view: "dashboard", zh: companyRole ? "经营总览" : "今日首页", en: companyRole ? "Company overview" : "My day", icon: LayoutDashboard },
      { view: "customers", zh: "客户门店", en: "Customers", icon: Store },
      { view: "visits", zh: "拜访执行", en: "Visits", icon: Route },
      { view: "orders", zh: "销售订单", en: "Orders", icon: ShoppingBag },
    ];
    if (companyRole) items.push({ view: "team", zh: "销售团队", en: "Team", icon: UsersRound });
    items.push({ view: "profile", zh: "账户设置", en: "Account", icon: UserRound });
    return items;
  }, [companyRole]);

  return (
    <main className="xs-app-shell">
      <aside className={`xs-sidebar ${menuOpen ? "open" : ""}`}>
        <div className="xs-sidebar-brand"><span className="xs-brand-mark">P</span><span><strong>PACKOM</strong><small>{companyRole ? tx(language, "公司管理端", "COMPANY CONSOLE") : tx(language, "销售执行端", "FIELD SALES")}</small></span><button className="xs-mobile-close" onClick={() => onMenu(false)}><X size={19} /></button></div>
        <nav aria-label={tx(language, "系统导航", "Application navigation")}>
          <p>{tx(language, "工作区", "WORKSPACE")}</p>
          {nav.map((item) => {
            const Icon = item.icon;
            return <button className={view === item.view ? "active" : ""} onClick={() => onView(item.view)} key={item.view}><Icon size={19} /><span>{tx(language, item.zh, item.en)}</span></button>;
          })}
        </nav>
        <div className="xs-sidebar-system"><span><Cloud size={15} /><i /> {tx(language, "云端数据已连接", "Cloud data connected")}</span><small>PACKOM SALES OS · v2.0.0</small></div>
        <div className="xs-sidebar-user"><Avatar name={user.name} /><span><strong>{user.name}</strong><small>{user.jobTitle || user.region}</small></span><button onClick={() => void onLogout()} aria-label={tx(language, "退出", "Sign out")}><LogOut size={17} /></button></div>
      </aside>
      {menuOpen ? <button className="xs-menu-scrim" onClick={() => onMenu(false)} aria-label="Close menu" /> : null}

      <section className="xs-app-main">
        <header className="xs-app-topbar">
          <button className="xs-menu-button" onClick={() => onMenu(true)}><Menu size={20} /></button>
          <div className="xs-context-label"><span>{companyRole ? <Building2 size={16} /> : <BarChart3 size={16} />}</span><strong>{companyRole ? tx(language, "公司实时数据", "Company live data") : tx(language, "我的销售工作台", "My sales workspace")}</strong><small>{tx(language, "中国标准时间", "China Standard Time")}</small></div>
          <div className="xs-topbar-actions"><span className="xs-live-status"><i /> {tx(language, "实时", "Live")}</span><button className="xs-language-button" onClick={() => onLanguage(language === "zh" ? "en" : "zh")}><Globe2 size={16} /> {language === "zh" ? "EN" : "中文"}</button><button className="xs-topbar-profile" onClick={() => onView("profile")}><Avatar name={user.name} size="small" /><span><strong>{user.name}</strong><small>{user.region}</small></span></button></div>
        </header>
        <div className="xs-view-scroll">
          {view === "dashboard" ? <DashboardView user={user} language={language} onNavigate={onView} refreshKey={refreshKey} /> : null}
          {view === "customers" ? <CustomersView user={user} language={language} onChanged={onChanged} /> : null}
          {view === "visits" ? <VisitsView user={user} language={language} onChanged={onChanged} /> : null}
          {view === "orders" ? <OrdersView user={user} language={language} onChanged={onChanged} /> : null}
          {view === "team" && companyRole ? <TeamView user={user} language={language} onChanged={onChanged} /> : null}
          {view === "profile" ? <ProfileView user={user} language={language} /> : null}
        </div>
      </section>

      <nav className="xs-mobile-nav" aria-label={tx(language, "移动导航", "Mobile navigation")}>
        {nav.slice(0, companyRole ? 5 : 5).map((item) => {
          const Icon = item.icon;
          return <button className={view === item.view ? "active" : ""} onClick={() => onView(item.view)} key={item.view}><Icon size={19} /><span>{tx(language, item.zh, item.en)}</span></button>;
        })}
      </nav>
    </main>
  );
}
