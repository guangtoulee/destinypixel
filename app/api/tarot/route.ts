import { assertMutation, readBody } from "@/lib/commerce/http";
import { normalizeReportLocale } from "@/lib/report-i18n";
import { parseTarotInput } from "@/lib/celestial/tarot";
import { celestialCopy } from "@/lib/celestial/copy";
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
      draw = parseTarotInput(raw),
      locale = normalizeReportLocale(
        typeof raw.locale === "string" ? raw.locale : "en",
      );
    const copy = celestialCopy(locale);
    return celestialInterpret(
      "tarot",
      {
        ...draw,
        cards: draw.cards.map((c) => ({
          ...c,
          position:
            draw.mode === "free"
              ? `Draw ${c.slot + 1}`
              : copy.positions[draw.spread][c.slot],
        })),
      },
      locale,
      ip,
    );
  } catch (error) {
    return celestialError(error);
  }
}
