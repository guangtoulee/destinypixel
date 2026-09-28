import { assertMutation, privateJson } from "@/lib/commerce/http";
import { requireRecordMember, recordError, recordOffset } from "@/lib/celestial/record-http";
import { listCelestialRecords, saveCelestialRecord } from "@/lib/celestial/record-store";
import { readRecordBody, parseCelestialSnapshot, validRecordId } from "@/lib/celestial/records";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try { const member = await requireRecordMember(); return privateJson(await listCelestialRecords(member.id, recordOffset(request))); } catch (error) { return recordError(error); }
}
export async function POST(request: Request) {
  try {
    assertMutation(request); const member = await requireRecordMember();
    const body = await readRecordBody(request);
    if (!validRecordId(body.id)) return privateJson({ code: "INVALID_RECORD" }, 400);
    const snapshot = parseCelestialSnapshot(body.snapshot);
    return privateJson({ record: await saveCelestialRecord(member.id, body.id, snapshot) });
  } catch (error) { return recordError(error); }
}
