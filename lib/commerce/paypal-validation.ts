export type PaypalCapture = { id?: string; status?: string; amount?: { value?: string; currency_code?: string }; supplementary_data?: { related_ids?: { order_id?: string } } };
export type PaypalOrder = { id?: string; status?: string; purchase_units?: Array<{ custom_id?: string; payee?: { merchant_id?: string }; amount?: { value?: string; currency_code?: string }; payments?: { captures?: PaypalCapture[] } }>; links?: Array<{ rel: string; href: string }> };

export function paymentAmountCents(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d{1,9}\.\d{2}$/.test(value)) return null;
  const [whole, fraction] = value.split(".");
  const cents = Number(whole) * 100 + Number(fraction);
  return Number.isSafeInteger(cents) ? cents : null;
}

export function validateOrderIdentity(order: PaypalOrder, expected: { localId: string; paypalId: string; amountCents: number; currency: string; merchantId?: string }) {
  const unit = order.purchase_units?.[0];
  return order.id === expected.paypalId && order.purchase_units?.length === 1 && unit?.custom_id === expected.localId
    && unit.amount?.currency_code === expected.currency && paymentAmountCents(unit.amount?.value) === expected.amountCents
    && (!expected.merchantId || unit.payee?.merchant_id === expected.merchantId);
}

export function validateCompletedOrder(order: PaypalOrder, expected: { localId: string; paypalId: string; amountCents: number; currency: string; merchantId?: string }) {
  const units = order.purchase_units;
  const unit = units?.[0];
  const captures = unit?.payments?.captures;
  const capture = captures?.[0];
  if (order.id !== expected.paypalId || order.status !== "COMPLETED" || units?.length !== 1 || unit?.custom_id !== expected.localId || captures?.length !== 1 || !capture?.id || capture.status !== "COMPLETED") return null;
  if (capture.amount?.currency_code !== expected.currency || paymentAmountCents(capture.amount?.value) !== expected.amountCents) return null;
  if (unit.amount && (unit.amount.currency_code !== expected.currency || paymentAmountCents(unit.amount.value) !== expected.amountCents)) return null;
  if (expected.merchantId && unit.payee?.merchant_id !== expected.merchantId) return null;
  return { captureId: capture.id };
}

export function approvedPaypalUrl(order: PaypalOrder, sandbox: boolean): string | null {
  const link = order.links?.find(item => item.rel === "payer-action" || item.rel === "approve");
  if (!link) return null;
  try { const url = new URL(link.href); return url.protocol === "https:" && url.hostname === (sandbox ? "www.sandbox.paypal.com" : "www.paypal.com") ? url.toString() : null; } catch { return null; }
}
