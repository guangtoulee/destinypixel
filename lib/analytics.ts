import { track } from "@vercel/analytics";

export const analyticsTools = [
  "birth_report", "birth_transits", "totem", "day_pillar", "compatibility", "temple_sticks", "prompt_expand", "prompt_image", "prompt_copy", "member_account", "report_checkout",
] as const;
export type AnalyticsTool = (typeof analyticsTools)[number];
const toolEvents = [
  "form_submit", "tool_start", "tool_success", "tool_error", "tool_fallback",
  "tool_export", "tool_share", "copy_success", "account_created", "login_success", "checkout_start", "payment_confirmed",
] as const;
export type ToolEvent = (typeof toolEvents)[number];

const publicPaths = new Set([
  "/", "/tools", "/learn", "/tuteng", "/palm", "/face", "/oracle",
  "/sticks", "/compatibility", "/atelier", "/insights", "/prompt", "/prompt/articles", "/juben",
  "/daoyan", "/image", "/english", "/danci", "/xingpan", "/ultra", "/day-pillar", "/discover", "/journal",
]);

const mainSitePaths = new Set([
  "/", "/white", "/tools", "/learn", "/tuteng", "/palm", "/face",
  "/oracle", "/sticks", "/compatibility", "/atelier", "/insights", "/xingpan", "/ultra", "/day-pillar", "/discover", "/journal",
]);

export function isMainSitePath(pathname: string): boolean {
  return mainSitePaths.has(pathname) || ["/report/", "/journal/", "/learn/", "/insights/"].some((prefix) => pathname.startsWith(prefix));
}

/** Only fixed product identifiers are sent, never field values or generated content. */
export function trackToolEvent(event: ToolEvent, tool: AnalyticsTool) {
  try {
    if (typeof window === "undefined" || !analyticsTools.includes(tool) || !toolEvents.includes(event)) return;
    if (!window.va) {
      window.va = (command, properties) => {
        window.vaq ??= [];
        window.vaq.push([command, properties]);
      };
      window.va("beforeSend", (pending: { url: string }) => {
        const url = sanitizeAnalyticsUrl(pending.url);
        return url ? { ...pending, url } : null;
      });
    }
    track(event, { tool, area: tool.startsWith("prompt_") ? "prompt" : "main" });
  } catch {
    // A blocked analytics script must never interrupt a user's work.
  }
}

export function analyticsPage(pathname: string): string {
  if (publicPaths.has(pathname)) return pathname;
  if (["/account", "/service", "/privacy", "/checkout/paypal/return", "/checkout/paypal/cancel"].includes(pathname)) return pathname;
  if (pathname.startsWith("/journal/")) return "/journal/[slug]";
  if (pathname.startsWith("/learn/")) return "/learn/[slug]";
  if (pathname.startsWith("/insights/")) return "/insights/[slug]";
  if (pathname.startsWith("/report/")) return "/report/[id]";
  if (pathname.startsWith("/prompt/case/")) return "/prompt/case/[id]";
  if (pathname.startsWith("/prompt/article/")) return "/prompt/article/[id]";
  if (pathname.startsWith("/prompt/category/")) return "/prompt/category/[slug]";
  return "other";
}

export function toolForForm(value: string | undefined): AnalyticsTool | null {
  return analyticsTools.includes(value as AnalyticsTool) ? value as AnalyticsTool : null;
}

/** Preserve controlled campaign attribution; remove personal query/fragment payloads. */
export function sanitizeAnalyticsUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (/^\/(api|work|admin)(\/|$)/.test(url.pathname)) return null;
    if (url.pathname.startsWith("/report/")) url.pathname = "/report/[id]";
    url.hash = "";
    const allowed: Record<string, readonly string[]> = {
      locale: ["en", "zh", "zh-TW", "ru"],
      utm_source: ["xiaohongshu", "bilibili", "douyin", "wechat", "x", "youtube", "newsletter", "instagram", "tiktok", "facebook", "pinterest", "reddit", "quora", "threads"],
      utm_medium: ["social", "video", "email", "referral"],
      utm_campaign: ["totem_demo", "prompt_tutorial", "creator_tools", "day_card", "love_compatibility", "temple_sticks"],
    };
    const clean = new URLSearchParams();
    for (const [key, values] of Object.entries(allowed)) {
      const value = url.searchParams.get(key);
      if (value && values.includes(value)) clean.set(key, value);
    }
    url.search = clean.toString();
    return url.toString();
  } catch {
    return null;
  }
}
