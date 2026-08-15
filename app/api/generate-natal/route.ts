import {
  buildNatalMessages,
  fallbackNatalText,
  streamDeepSeekText,
  type ReportGenerationContext,
} from "@/lib/ai/streaming";

export const runtime = "edge";
export const maxDuration = 60;

export async function POST(request: Request) {
  const context = (await request.json()) as ReportGenerationContext;
  const stream = await streamDeepSeekText({
    messages: buildNatalMessages(context),
    fallbackText: fallbackNatalText(context),
    requiredMarkers: [
      "DAY_MASTER",
      "OUTER_PERSONA",
      "DEEP_SELF",
      "CAREER",
      "LOVE",
      "GROWTH",
      "HEALTH",
    ],
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
