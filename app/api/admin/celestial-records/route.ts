import { privateJson } from "@/lib/commerce/http";
import { requireRecordMember, recordError, recordOffset } from "@/lib/celestial/record-http";
import { listCelestialRecords } from "@/lib/celestial/record-store";
export const runtime = "nodejs";
export async function GET(request: Request) { try { await requireRecordMember(true); return privateJson(await listCelestialRecords(null, recordOffset(request))); } catch (error) { return recordError(error); } }
