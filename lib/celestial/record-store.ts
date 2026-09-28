import "server-only";
import { databaseRequest } from "@/lib/commerce/database";
import { recordPrefix, validRecordId, type CelestialSnapshot, type CelestialRecordSummary } from "./records";
type Row = { report_id: string; member_id: string; locale: CelestialSnapshot["locale"]; title: string; created_at: string; updated_at: string; has_reading?: boolean; report_snapshot?: CelestialSnapshot };
const namespace = `report_id=like.${recordPrefix}*`;
const owner = (memberId: string) => `&member_id=eq.${encodeURIComponent(memberId)}`;
const idFilter = (id: string) => { if (!validRecordId(id)) throw new Error("INVALID_RECORD"); return `report_id=eq.${recordPrefix}${id}`; };
const summary = (r: Row, admin = false): CelestialRecordSummary => ({ id: r.report_id.slice(recordPrefix.length), kind: r.title === "tarot" ? "tarot" : "astrology", locale: r.locale, createdAt: r.created_at, updatedAt: r.updated_at, hasReading: Boolean(r.has_reading ?? r.report_snapshot?.reading), ...(admin ? { memberId: r.member_id } : {}) });
export async function listCelestialRecords(memberId: string | null, offset: number) {
  // Read only summary fields, never private questions, birth data or AI text in lists.
  const rows = await databaseRequest<Row[]>(`saved_reports?${namespace}${memberId ? owner(memberId) : ""}&select=report_id,member_id,locale,title,created_at,updated_at,has_reading:report_snapshot->hasReading&order=updated_at.desc,report_id.asc&limit=21&offset=${offset}`);
  return { records: rows.slice(0,20).map(r => summary(r, !memberId)), nextOffset: rows.length > 20 ? offset + 20 : null };
}
export async function saveCelestialRecord(memberId: string, id: string, snapshot: CelestialSnapshot) {
  if (!validRecordId(id)) throw new Error("INVALID_RECORD");
  const rows = await databaseRequest<Row[]>("saved_reports?on_conflict=member_id,report_id", { method: "POST", prefer: "resolution=merge-duplicates,return=representation", body: { member_id: memberId, report_id: recordPrefix + id, title: snapshot.kind, locale: snapshot.locale, report_snapshot: { ...snapshot, hasReading: Boolean(snapshot.reading) }, updated_at: new Date().toISOString() } });
  return summary(rows[0]);
}
export async function getCelestialRecord(memberId: string, id: string) {
  const rows = await databaseRequest<Row[]>(`saved_reports?${idFilter(id)}${owner(memberId)}&select=report_id,member_id,locale,title,created_at,updated_at,report_snapshot&limit=1`);
  return rows[0] ? { ...summary(rows[0]), snapshot: rows[0].report_snapshot! } : null;
}
export async function deleteCelestialRecord(memberId: string, id: string) {
  const rows = await databaseRequest<Row[]>(`saved_reports?${idFilter(id)}${owner(memberId)}`, { method: "DELETE" });
  return rows.length > 0;
}
