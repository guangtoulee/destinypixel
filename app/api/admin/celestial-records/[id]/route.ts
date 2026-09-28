import { assertMutation, privateJson } from "@/lib/commerce/http";
import { requireRecordMember, recordError } from "@/lib/celestial/record-http";
import { deleteCelestialRecord } from "@/lib/celestial/record-store";
import { validRecordId } from "@/lib/celestial/records";
export const runtime = "nodejs";
export async function DELETE(request: Request, context: { params: Promise<{id:string}> }) {
  try { assertMutation(request); await requireRecordMember(true); const {id}=await context.params; const memberId=new URL(request.url).searchParams.get("memberId"); if (!validRecordId(id) || !memberId || !/^[0-9a-f-]{36}$/i.test(memberId)) return privateJson({code:"INVALID_RECORD"},400); const deleted=await deleteCelestialRecord(memberId,id); return privateJson({deleted},deleted?200:404); } catch(error) { return recordError(error); }
}
