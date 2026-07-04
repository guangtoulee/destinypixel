import {
  buildStickMessages,
  fallbackStickText,
  normalizeStickLocale,
  normalizeStickNumber,
  normalizeStickType,
  type StickInterpretRequestBody,
} from "@/lib/ai/sticks";
import { streamDeepSeekText } from "@/lib/ai/streaming";
import { getStickSign } from "@/lib/sticks/catalog";

export const runtime = "edge";
export const maxDuration = 60;

export async function POST(request: Request) {
  let body: StickInterpretRequestBody;

  try {
    body = (await request.json()) as StickInterpretRequestBody;
  } catch {
    return new Response("Invalid request body.", { status: 400 });
  }

  const type = normalizeStickType(body.type);
  const locale = normalizeStickLocale(body.locale);
  const number = normalizeStickNumber(body.number, type);
  const sign = body.sign ?? getStickSign(type, number, locale);
  const topic = typeof body.topic === "string" ? body.topic : "";
  const question = typeof body.question === "string" ? body.question : "";

  const stream = await streamDeepSeekText({
    messages: buildStickMessages({ locale, type, sign, topic, question }),
    fallbackText: fallbackStickText({ locale, sign, topic, question }),
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Accel-Buffering": "no",
    },
  });
}
