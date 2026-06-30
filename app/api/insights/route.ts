import {
  buildInsightMessages,
  fallbackInsightText,
  normalizeInsightLocale,
  normalizeInsightMode,
  type InsightRequestBody,
} from "@/lib/ai/insights";
import { streamDeepSeekText } from "@/lib/ai/streaming";

export const runtime = "edge";
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: InsightRequestBody;

  try {
    body = (await request.json()) as InsightRequestBody;
  } catch {
    return new Response("Invalid request body.", { status: 400 });
  }

  const mode = normalizeInsightMode(body.mode);
  const locale = normalizeInsightLocale(body.locale);
  const payload =
    body.payload && typeof body.payload === "object" ? body.payload : {};
  const stream = await streamDeepSeekText({
    messages: buildInsightMessages({ mode, locale, payload }),
    fallbackText: fallbackInsightText({ mode, locale, payload }),
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Accel-Buffering": "no",
    },
  });
}
