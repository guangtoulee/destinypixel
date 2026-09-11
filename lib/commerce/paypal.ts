import "server-only";
import { paypalMode } from "./config";
import type { PaypalOrder, PaypalCapture } from "./paypal-validation";

export class PaymentUnavailableError extends Error { constructor() { super("Payment could not be confirmed. No report access has been changed. Please retry or contact support."); } }
const paypalApi = () => paypalMode() === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";

async function paypalRequest<T>(path: string, method: "GET" | "POST", body?: unknown, requestId?: string): Promise<T> {
  const client = process.env.PAYPAL_CLIENT_ID; const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!client || !secret || paypalMode() === "disabled") throw new PaymentUnavailableError();
  try {
    const tokenResponse = await fetch(`${paypalApi()}/v1/oauth2/token`, { method: "POST", cache: "no-store", signal: AbortSignal.timeout(12_000), headers: { Authorization: `Basic ${Buffer.from(`${client}:${secret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials" });
    if (!tokenResponse.ok) throw new PaymentUnavailableError();
    const token = await tokenResponse.json() as { access_token?: string };
    if (!token.access_token) throw new PaymentUnavailableError();
    const response = await fetch(`${paypalApi()}${path}`, { method, cache: "no-store", signal: AbortSignal.timeout(20_000), headers: { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json", Prefer: "return=representation", ...(requestId ? { "PayPal-Request-Id": requestId } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
    if (!response.ok) throw new PaymentUnavailableError();
    return await response.json() as T;
  } catch { throw new PaymentUnavailableError(); }
}

export function createPaypalOrder(input: { localId: string; amount: string; origin: string }) {
  return paypalRequest<PaypalOrder>("/v2/checkout/orders", "POST", { intent: "CAPTURE", purchase_units: [{ reference_id: "full_report", custom_id: input.localId, description: "DestinyPixel full birth report", amount: { currency_code: "USD", value: input.amount } }], payment_source: { paypal: { experience_context: { brand_name: "DestinyPixel", shipping_preference: "NO_SHIPPING", user_action: "PAY_NOW", return_url: `${input.origin}/checkout/paypal/return?order=${input.localId}`, cancel_url: `${input.origin}/checkout/paypal/cancel?order=${input.localId}` } } } }, `create-${input.localId}`);
}
export const fetchPaypalOrder = (id: string) => paypalRequest<PaypalOrder>(`/v2/checkout/orders/${encodeURIComponent(id)}`, "GET");
export const capturePaypalOrder = (id: string, localId: string) => paypalRequest<PaypalOrder>(`/v2/checkout/orders/${encodeURIComponent(id)}/capture`, "POST", {}, `capture-${localId}`);
export const fetchPaypalCapture = (id: string) => paypalRequest<PaypalCapture>(`/v2/payments/captures/${encodeURIComponent(id)}`, "GET");

export async function verifyPaypalWebhook(request: Request, event: unknown) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const transmissionId = request.headers.get("paypal-transmission-id");
  const transmissionTime = request.headers.get("paypal-transmission-time");
  const signature = request.headers.get("paypal-transmission-sig");
  const certUrl = request.headers.get("paypal-cert-url");
  const algorithm = request.headers.get("paypal-auth-algo");
  if (!webhookId || !transmissionId || !transmissionTime || !signature || !certUrl || !algorithm) return false;
  const result = await paypalRequest<{ verification_status: string }>("/v1/notifications/verify-webhook-signature", "POST", { auth_algo: algorithm, cert_url: certUrl, transmission_id: transmissionId, transmission_sig: signature, transmission_time: transmissionTime, webhook_id: webhookId, webhook_event: event });
  return result.verification_status === "SUCCESS";
}
