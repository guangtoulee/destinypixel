import { assertMutation, privateJson } from "@/lib/commerce/http";
import { requireRecordMember, recordError } from "@/lib/celestial/record-http";
import { getCelestialRecord, deleteCelestialRecord } from "@/lib/celestial/record-store";
import { validRecordId } from "@/lib/celestial/records";
type Context = { params: Promise<{ id: string }> };
export const runtime = "nodejs";
export async function GET(_request: Request, context: Context) {
  try { const member = await requireRecordMember(), { id } = await context.params; if (!validRecordId(id)) return privateJson({code:"NOT_FOUND"},404); const record = await getCelestialRecord(member.id, id); return privateJson(record ? { record } : { code: "NOT_FOUND" }, record ? 200 : 404); } catch (error) { return recordError(error); }
}
export async function DELETE(request: Request, context: Context) {
  try { assertMutation(request); const member = await requireRecordMember(), { id } = await context.params; if (!validRecordId(id)) return privateJson({code:"NOT_FOUND"},404); const deleted = await deleteCelestialRecord(member.id, id); return privateJson({ deleted }, deleted ? 200 : 404); } catch (error) { return recordError(error); }
}
