"use client";

import {
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  PackageCheck,
  Plus,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import type { Customer, SalesOrder, SalesProduct, SalesUser } from "@/lib/xiaoshou/types";
import {
  formatDate,
  formatMoney,
  salesApi,
  statusLabel,
  tx,
  type SalesLanguage,
} from "./client";
import { EmptyState, ErrorBanner, Modal, PageHeader, Spinner, StatusPill } from "./ui";

type OrderFilter = "all" | "pending" | "approved" | "fulfilled" | "cancelled";

export function OrdersView({
  user,
  language,
  onChanged,
}: {
  user: SalesUser;
  language: SalesLanguage;
  onChanged: () => void;
}) {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<SalesProduct[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const companyRole = user.role !== "sales";
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [orderResult, customerResult, productResult] = await Promise.all([
        salesApi<{ orders: SalesOrder[] }>("/orders"),
        salesApi<{ customers: Customer[] }>("/customers"),
        salesApi<{ products: SalesProduct[] }>("/products"),
      ]);
      setOrders(orderResult.orders);
      setCustomers(customerResult.customers);
      setProducts(productResult.products);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx(language, "读取订单失败。", "Unable to load orders."));
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleOrders = useMemo(
    () => (filter === "all" ? orders : orders.filter((order) => order.status === filter)),
    [filter, orders],
  );
  const draftAmount = products.reduce((sum, product) => sum + product.price * (quantities[product.id] || 0), 0);

  const createOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const items = Object.entries(quantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([productId, quantity]) => ({ productId, quantity }));
    try {
      await salesApi("/orders", {
        method: "POST",
        body: JSON.stringify({ customerId: data.get("customerId"), items, notes: data.get("notes") }),
      });
      setQuantities({});
      setCreateOpen(false);
      await load();
      onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx(language, "创建订单失败。", "Unable to create order."));
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (order: SalesOrder, status: "approved" | "fulfilled" | "cancelled") => {
    setSubmitting(true);
    setError("");
    try {
      await salesApi(`/orders/${order.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      await load();
      onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : tx(language, "更新订单失败。", "Unable to update order."));
    } finally {
      setSubmitting(false);
    }
  };

  const filters: Array<[OrderFilter, string, string]> = [
    ["all", "全部", "All"],
    ["pending", "待审核", "Pending"],
    ["approved", "已审核", "Approved"],
    ["fulfilled", "已发货", "Fulfilled"],
    ["cancelled", "已取消", "Cancelled"],
  ];

  return (
    <div className="xs-view">
      <PageHeader
        eyebrow={tx(language, "订单到回款", "ORDER OPERATIONS")}
        title={tx(language, "销售订单", "Sales orders")}
        copy={companyRole
          ? tx(language, "审核一线提交的订单，掌握金额、商品与履约状态。", "Review field orders and track value, products and fulfilment.")
          : tx(language, "按公司价格目录创建订单，并实时查看审核状态。", "Create orders from the company catalogue and track approval status.")}
        action={<button className="xs-primary-button" onClick={() => setCreateOpen(true)}><Plus size={17} /> {tx(language, "新建订单", "New order")}</button>}
      />
      {error ? <ErrorBanner message={error} /> : null}

      <section className="xs-order-summary">
        <article><span><ShoppingBag size={19} /></span><div><small>{tx(language, "订单总数", "Total orders")}</small><strong>{orders.length}</strong></div></article>
        <article><span className="orange"><Clock3 size={19} /></span><div><small>{tx(language, "待审核", "Awaiting review")}</small><strong>{orders.filter((order) => order.status === "pending").length}</strong></div></article>
        <article><span className="green"><CircleDollarSign size={19} /></span><div><small>{tx(language, "已审核金额", "Approved value")}</small><strong>{formatMoney(orders.filter((order) => order.status === "approved" || order.status === "fulfilled").reduce((sum, order) => sum + order.amount, 0), language)}</strong></div></article>
      </section>

      <section className="xs-toolbar xs-toolbar-tabs">
        <div className="xs-segmented">{filters.map(([value, zh, en]) => <button className={filter === value ? "active" : ""} onClick={() => setFilter(value)} key={value}>{tx(language, zh, en)}</button>)}</div>
        <span className="xs-result-count">{visibleOrders.length} {tx(language, "张订单", "orders")}</span>
      </section>

      {loading ? (
        <div className="xs-loading-panel"><Spinner /><span>{tx(language, "正在加载订单…", "Loading orders…")}</span></div>
      ) : visibleOrders.length ? (
        <section className="xs-orders-table-wrap">
          <div className="xs-orders-table-head"><span>{tx(language, "订单 / 客户", "Order / customer")}</span><span>{tx(language, "销售人员", "Salesperson")}</span><span>{tx(language, "金额", "Value")}</span><span>{tx(language, "状态", "Status")}</span><span /></div>
          {visibleOrders.map((order) => (
            <article className={`xs-order-row ${expanded === order.id ? "expanded" : ""}`} key={order.id}>
              <button className="xs-order-row-main" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <span><strong>{order.orderNo}</strong><small>{order.customerName} · {formatDate(order.createdAt, language)}</small></span>
                <span><strong>{order.salespersonName || "—"}</strong><small>{order.items.reduce((sum, item) => sum + item.quantity, 0)} {tx(language, "件", "units")}</small></span>
                <span className="xs-table-money">{formatMoney(order.amount, language)}</span>
                <span><StatusPill status={order.status}>{statusLabel(order.status, language)}</StatusPill></span>
                <ChevronDown size={17} />
              </button>
              {expanded === order.id ? (
                <div className="xs-order-detail">
                  <div className="xs-order-lines">
                    {order.items.map((item) => <div key={item.productId}><span><strong>{item.name}</strong><small>{item.sku}</small></span><span>{item.quantity} × {formatMoney(item.unitPrice, language)}</span><strong>{formatMoney(item.subtotal, language)}</strong></div>)}
                  </div>
                  {order.notes ? <p className="xs-order-notes">{order.notes}</p> : null}
                  <div className="xs-order-actions">
                    {companyRole && order.status === "pending" ? <button className="xs-action-green" disabled={submitting} onClick={() => void updateStatus(order, "approved")}><CheckCircle2 size={16} /> {tx(language, "审核通过", "Approve")}</button> : null}
                    {companyRole && order.status === "approved" ? <button className="xs-action-blue" disabled={submitting} onClick={() => void updateStatus(order, "fulfilled")}><Truck size={16} /> {tx(language, "标记已发货", "Mark fulfilled")}</button> : null}
                    {(companyRole || user.id === order.salespersonId) && order.status === "pending" ? <button className="xs-ghost-danger" disabled={submitting} onClick={() => void updateStatus(order, "cancelled")}><XCircle size={15} /> {tx(language, "取消订单", "Cancel order")}</button> : null}
                    {order.reviewedAt ? <span><PackageCheck size={15} /> {tx(language, "审核于", "Reviewed")} {formatDate(order.reviewedAt, language)}</span> : null}
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      ) : (
        <EmptyState language={language} title={tx(language, "这个状态下没有订单", "No orders in this status")} action={<button className="xs-primary-button" onClick={() => setCreateOpen(true)}><Plus size={17} /> {tx(language, "创建订单", "Create order")}</button>} />
      )}

      {createOpen ? (
        <Modal title={tx(language, "创建销售订单", "Create sales order")} eyebrow={tx(language, "实时产品目录", "LIVE PRODUCT CATALOGUE")} onClose={() => setCreateOpen(false)} wide>
          <form className="xs-order-form" onSubmit={createOrder}>
            <label><span>{tx(language, "客户", "Customer")}</span><select name="customerId" required defaultValue=""><option value="" disabled>{tx(language, "选择下单客户", "Select a customer")}</option>{customers.map((customer) => <option value={customer.id} key={customer.id}>{customer.name} · {customer.city}</option>)}</select></label>
            <div className="xs-product-picker">
              {products.map((product) => {
                const quantity = quantities[product.id] || 0;
                return (
                  <article key={product.id}>
                    <img src={product.image} alt="" />
                    <div><strong>{language === "zh" ? product.nameZh : product.nameEn}</strong><small>{product.sku} · {product.specification}</small><span>{formatMoney(product.price, language)}</span></div>
                    <div className="xs-quantity"><button type="button" onClick={() => setQuantities((current) => ({ ...current, [product.id]: Math.max(0, quantity - 1) }))}>−</button><input aria-label="Quantity" inputMode="numeric" value={quantity} onChange={(event) => setQuantities((current) => ({ ...current, [product.id]: Math.max(0, Math.min(9999, Number(event.target.value) || 0)) }))} /><button type="button" onClick={() => setQuantities((current) => ({ ...current, [product.id]: quantity + 1 }))}>+</button></div>
                  </article>
                );
              })}
            </div>
            <label><span>{tx(language, "订单备注", "Order notes")}</span><textarea name="notes" rows={3} maxLength={1000} /></label>
            <div className="xs-order-total"><span>{tx(language, "订单合计", "Order total")}</span><strong>{formatMoney(draftAmount, language)}</strong></div>
            <div className="xs-form-actions"><button type="button" className="xs-secondary-button" onClick={() => setCreateOpen(false)}>{tx(language, "取消", "Cancel")}</button><button className="xs-primary-button" disabled={submitting || draftAmount <= 0}>{submitting ? <Spinner /> : <ShoppingBag size={17} />}{tx(language, "提交审核", "Submit for approval")}</button></div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
