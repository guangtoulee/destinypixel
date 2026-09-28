import { natalReadingPayload } from "@/lib/celestial/natal-reading-ai";
import { assertMutation, readBody, privateJson } from "@/lib/commerce/http";
import { BirthTimeValidationError } from "@/lib/engines/time";
import {
  calculateNatalChart,
  parseNatalInput,
} from "@/lib/celestial/astrology";
import {
  celestialError,
  celestialGuard,
  celestialInterpret,
} from "@/lib/celestial/api";
export const runtime = "nodejs";
export const maxDuration = 180;
export async function POST(request: Request) {
  try {
    assertMutation(request);
    const ip = celestialGuard(request),
      raw = await readBody(request),
      { input, locale, mode } = parseNatalInput(raw),
      chart = calculateNatalChart(input);
    if (mode === "calculate") return privateJson({ chart });
    return celestialInterpret(
      "astrology",
      natalReadingPayload(chart),
      locale,
      ip,
    );
  } catch (error) {
    if (error instanceof BirthTimeValidationError)
      return privateJson({ code: error.code }, 400);
    return celestialError(error);
  }
}
