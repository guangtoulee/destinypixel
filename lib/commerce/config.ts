import "server-only";
import { databaseConfigured } from "./database";

export function reportPriceCents(): number | null {
  const raw = process.env.DESTINY_REPORT_PRICE_USD || "";
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(raw)) return null;
  const value = Math.round(Number(raw) * 100);
  return value >= 50 && value <= 99_900 ? value : null;
}

export function paypalMode(): "disabled" | "sandbox" | "live" {
  const mode = process.env.PAYPAL_MODE;
  return mode === "live" || mode === "sandbox" ? mode : "disabled";
}

export function paidReportsEnabled() { return process.env.DESTINY_PAID_REPORTS_ENABLED === "true"; }
export function paypalConfigured() { return paypalMode() !== "disabled" && Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET && process.env.PAYPAL_WEBHOOK_ID); }
export function isAdminMember(member: { id: string; email: string; email_verified_at?: string | null } | null) {
  if (!member) return false;
  const ids = (process.env.DESTINY_ADMIN_MEMBER_IDS || "").split(",").map(v => v.trim()).filter(Boolean);
  const emails = (process.env.DESTINY_ADMIN_EMAILS || "").split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
  return ids.includes(member.id) || Boolean(member.email_verified_at && emails.includes(member.email.toLowerCase()));
}

export function checkoutOffer(member: Parameters<typeof isAdminMember>[0] = null) {
  const cents = reportPriceCents();
  const mode = paypalMode();
  const sandboxAllowed = mode !== "sandbox" || process.env.VERCEL_ENV !== "production" || isAdminMember(member);
  return {
    available: Boolean(paidReportsEnabled() && paypalConfigured() && databaseConfigured() && process.env.DEEPSEEK_API_KEY && cents && sandboxAllowed),
    price: cents === null ? null : (cents / 100).toFixed(2), currency: "USD" as const, mode,
  };
}
