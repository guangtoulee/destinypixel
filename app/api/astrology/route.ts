import { celestialCopy } from "@/lib/celestial/copy";
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
export const maxDuration = 60;
export async function POST(request: Request) {
  try {
    assertMutation(request);
    const ip = celestialGuard(request),
      raw = await readBody(request),
      { input, locale, mode } = parseNatalInput(raw),
      chart = calculateNatalChart(input);
    if (mode === "calculate") return privateJson({ chart });
    const { placements, ascendant, midheaven, houses, aspects, houseSystem } =
      chart;
    const angle = (longitude: number) => ({
      longitude,
      sign: celestialCopy("en").signs[Math.floor(longitude / 30)],
    });
    return celestialInterpret(
      "astrology",
      {
        placements,
        ascendant: angle(ascendant),
        midheaven: angle(midheaven),
        houses,
        aspects,
        houseSystem,
      },
      locale,
      ip,
    );
  } catch (error) {
    if (error instanceof BirthTimeValidationError)
      return privateJson({ code: error.code }, 400);
    return celestialError(error);
  }
}
