"use client";

import {
  CalendarPlus,
  MapPin,
  Phone,
  Plus,
  Search,
  Store,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Customer, SalesUser } from "@/lib/xiaoshou/types";
import {
  formatDate,
  formatMoney,
  salesApi,
  statusLabel,
  tx,
  type SalesLanguage,
  type TeamMember,
} from "./client";
import { EmptyState, ErrorBanner, Modal, PageHeader, Spinner, StatusPill } from "./ui";

export function CustomersView({
  user,
  language,
  onChanged,
}: {
  user: SalesUser;
  language: SalesLanguage;
  onChanged: () => void;
}) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState("");
  const [tier, setTier] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [visitCustomer, setVisitCustomer] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const companyRole = user.role !== "sales";
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [customerResult, teamResult] = await Promise.all([
        salesApi<{ customers: Customer[] }>("/customers"),
        companyRole
          ? salesApi<{ members: TeamMember[] }>("/team").catch(() => ({ members: [] }))
          : Promise.resolve({ members: [] as TeamMember[] }),
      ]);
      setCustomers(customerResult.customers);
      setTeam(teamResult.members.filter((member) => member.status === "active"));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx(language, "读取客户失败。", "Unable to load customers."));
    } finally {
      setLoading(false);
    }
  }, [companyRole, language]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchesSearch = !keyword || [customer.name, customer.code, customer.city, customer.channel, customer.contact].some((value) => value.toLowerCase().includes(keyword));
      return matchesSearch && (tier === "all" || customer.tier === tier);
    });
  }, [customers, search, tier]);

  const createCustomer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await salesApi("/customers", {
        method: "POST",
        body: JSON.stringify({
          name: data.get("name"),
          shortName: data.get("shortName"),
          channel: data.get("channel"),
          tier: data.get("tier"),
          status: data.get("status"),
          city: data.get("city"),
          address: data.get("address"),
          contact: data.get("contact"),
          phone: data.get("phone"),
          assignedTo: data.get("assignedTo") || undefined,
          notes: data.get("notes"),
        }),
      });
      setCreateOpen(false);
      await load();
      onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx(language, "创建失败。", "Unable to create customer."));
    } finally {
      setSubmitting(false);
    }
  };

  const scheduleVisit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!visitCustomer) return;
    setSubmitting(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const localDate = new Date(String(data.get("scheduledAt")));
      await salesApi("/visits", {
        method: "POST",
        body: JSON.stringify({
          customerId: visitCustomer.id,
          scheduledAt: localDate.toISOString(),
          purpose: data.get("purpose"),
          salespersonId: data.get("salespersonId") || undefined,
        }),
      });
      setVisitCustomer(null);
      await load();
      onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx(language, "安排拜访失败。", "Unable to schedule visit."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="xs-view">
      <PageHeader
        eyebrow={tx(language, "客户资产", "CUSTOMER PORTFOLIO")}
        title={tx(language, "客户与门店", "Customers & stores")}
        copy={tx(language, "集中维护联系人、地址、负责人员和下一次跟进。", "Maintain contacts, locations, owners and next actions in one place.")}
        action={<button className="xs-primary-button" onClick={() => setCreateOpen(true)}><Plus size={17} /> {tx(language, "新建客户", "New customer")}</button>}
      />
      {error ? <ErrorBanner message={error} /> : null}

      <section className="xs-toolbar">
        <label className="xs-search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={tx(language, "搜索名称、城市、联系人…", "Search name, city or contact…")} /></label>
        <div className="xs-segmented">
          {["all", "A", "B", "C"].map((value) => (
            <button className={tier === value ? "active" : ""} onClick={() => setTier(value)} key={value}>{value === "all" ? tx(language, "全部", "All") : `${value} ${tx(language, "级", "tier")}`}</button>
          ))}
        </div>
        <span className="xs-result-count">{filtered.length} {tx(language, "个客户", "accounts")}</span>
      </section>

      {loading ? (
        <div className="xs-loading-panel"><Spinner /><span>{tx(language, "正在加载客户…", "Loading customers…")}</span></div>
      ) : filtered.length ? (
        <section className="xs-customer-grid">
          {filtered.map((customer) => (
            <article className="xs-customer-card" key={customer.id}>
              <header>
                <span className={`xs-store-avatar tier-${customer.tier}`}>{customer.shortName || customer.name.slice(0, 2)}</span>
                <div><h2>{customer.name}</h2><p>{customer.code} · {customer.channel}</p></div>
                <span className="xs-tier-badge">{customer.tier}</span>
              </header>
              <div className="xs-customer-meta">
                <span><MapPin size={15} /><strong>{customer.city}</strong>{customer.address}</span>
                <span><UserRound size={15} /><strong>{customer.contact}</strong>{customer.phone || "—"}</span>
                <span><Store size={15} /><strong>{tx(language, "负责人", "Owner")}</strong>{customer.assignedName || tx(language, "未分配", "Unassigned")}</span>
              </div>
              <div className="xs-customer-stats">
                <span><small>{tx(language, "本月销售", "Monthly sales")}</small><strong>{formatMoney(customer.monthlySales, language)}</strong></span>
                <span><small>{tx(language, "上次拜访", "Last visit")}</small><strong>{formatDate(customer.lastVisitAt, language, { year: undefined, hour: undefined, minute: undefined })}</strong></span>
              </div>
              <footer>
                <StatusPill status={customer.status}>{statusLabel(customer.status, language)}</StatusPill>
                {customer.phone ? <a href={`tel:${customer.phone}`}><Phone size={15} /> {tx(language, "联系", "Call")}</a> : null}
                <button onClick={() => setVisitCustomer(customer)}><CalendarPlus size={15} /> {tx(language, "安排拜访", "Schedule")}</button>
              </footer>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState language={language} title={tx(language, "没有匹配的客户", "No matching customers")} copy={tx(language, "调整筛选条件，或创建第一位客户。", "Adjust the filters or create the first customer.")} action={<button className="xs-primary-button" onClick={() => setCreateOpen(true)}><Plus size={17} /> {tx(language, "新建客户", "New customer")}</button>} />
      )}

      {createOpen ? (
        <Modal title={tx(language, "新建客户档案", "Create customer account")} eyebrow={tx(language, "客户主数据", "CUSTOMER MASTER DATA")} onClose={() => setCreateOpen(false)} wide>
          <form className="xs-form-grid" onSubmit={createCustomer}>
            <label className="span-2"><span>{tx(language, "客户 / 门店名称", "Customer / store name")}</span><input name="name" required maxLength={160} placeholder={tx(language, "例如：CitySuper 国金中心店", "e.g. CitySuper IFC Mall")} /></label>
            <label><span>{tx(language, "简称", "Short name")}</span><input name="shortName" maxLength={12} placeholder="CS" /></label>
            <label><span>{tx(language, "渠道", "Channel")}</span><select name="channel" defaultValue="精品商超"><option value="精品商超">{tx(language, "精品商超", "Premium supermarket")}</option><option value="便利店">{tx(language, "便利店", "Convenience")}</option><option value="连锁药房">{tx(language, "连锁药房", "Pharmacy")}</option><option value="经销商">{tx(language, "经销商", "Distributor")}</option><option value="电商">{tx(language, "电商", "E-commerce")}</option><option value="其他">{tx(language, "其他", "Other")}</option></select></label>
            <label><span>{tx(language, "客户级别", "Account tier")}</span><select name="tier" defaultValue="B"><option>A</option><option>B</option><option>C</option></select></label>
            <label><span>{tx(language, "状态", "Status")}</span><select name="status" defaultValue="prospect"><option value="prospect">{tx(language, "潜在客户", "Prospect")}</option><option value="active">{tx(language, "合作中", "Active")}</option><option value="paused">{tx(language, "已暂停", "Paused")}</option></select></label>
            <label><span>{tx(language, "城市", "City")}</span><input name="city" required maxLength={80} /></label>
            <label className="span-2"><span>{tx(language, "详细地址", "Street address")}</span><input name="address" required maxLength={240} /></label>
            <label><span>{tx(language, "联系人", "Contact")}</span><input name="contact" required maxLength={80} /></label>
            <label><span>{tx(language, "联系电话", "Phone")}</span><input name="phone" maxLength={30} /></label>
            {companyRole ? <label><span>{tx(language, "分配给", "Assign to")}</span><select name="assignedTo" defaultValue={user.id}><option value="">{tx(language, "暂不分配", "Unassigned")}</option>{team.map((member) => <option value={member.id} key={member.id}>{member.name} · {member.region}</option>)}</select></label> : null}
            <label className="span-2"><span>{tx(language, "备注", "Notes")}</span><textarea name="notes" maxLength={1000} rows={3} /></label>
            <div className="xs-form-actions span-2"><button type="button" className="xs-secondary-button" onClick={() => setCreateOpen(false)}>{tx(language, "取消", "Cancel")}</button><button className="xs-primary-button" disabled={submitting}>{submitting ? <Spinner /> : <Plus size={17} />}{tx(language, "保存客户", "Save customer")}</button></div>
          </form>
        </Modal>
      ) : null}

      {visitCustomer ? (
        <Modal title={tx(language, "安排客户拜访", "Schedule customer visit")} eyebrow={visitCustomer.name} onClose={() => setVisitCustomer(null)}>
          <form className="xs-form-grid" onSubmit={scheduleVisit}>
            <label className="span-2"><span>{tx(language, "拜访时间", "Visit date & time")}</span><input name="scheduledAt" type="datetime-local" required /></label>
            <label className="span-2"><span>{tx(language, "拜访目的", "Purpose")}</span><textarea name="purpose" required maxLength={300} rows={3} placeholder={tx(language, "例如：新品上架沟通、库存盘点、陈列复核", "e.g. New listing, stock review, display check")} /></label>
            {companyRole ? <label className="span-2"><span>{tx(language, "执行人员", "Salesperson")}</span><select name="salespersonId" defaultValue={visitCustomer.assignedTo || user.id}>{team.map((member) => <option value={member.id} key={member.id}>{member.name} · {member.region}</option>)}</select></label> : null}
            <div className="xs-form-actions span-2"><button type="button" className="xs-secondary-button" onClick={() => setVisitCustomer(null)}>{tx(language, "取消", "Cancel")}</button><button className="xs-primary-button" disabled={submitting}>{submitting ? <Spinner /> : <CalendarPlus size={17} />}{tx(language, "加入日程", "Add to schedule")}</button></div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
