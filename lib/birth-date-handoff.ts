/** One-use, short-lived handoff inside this tab only, created on an explicit continue click. */
export const birthDateHandoffKey = "destinypixel-birthday-handoff";
export const birthDateDraftKey = "destinypixel-report-birthday-draft";
const maxAge = 15 * 60 * 1000;
type StorageAccess = Pick<Storage, "getItem" | "setItem" | "removeItem">;
function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value && value >= "1800-01-01" && value <= "2100-12-31";
}
export function offerBirthDate(storage: StorageAccess, birthDate: string, now = Date.now()) {
  try { if (validDate(birthDate)) storage.setItem(birthDateHandoffKey, JSON.stringify({ birthDate, expiresAt: now + maxAge })); } catch { /* Storage can be disabled; ordinary navigation still works. */ }
}
export function takeBirthDate(storage: StorageAccess, now = Date.now()): string | null {
  try {
    const value = storage.getItem(birthDateHandoffKey);
    storage.removeItem(birthDateHandoffKey);
    if (!value) return null;
    const parsed = JSON.parse(value);
    return validDate(parsed.birthDate) && Number.isFinite(parsed.expiresAt) && parsed.expiresAt > now && parsed.expiresAt <= now + maxAge ? parsed.birthDate : null;
  } catch { return null; }
}

/** Only the explicitly handed-off birthday survives locale navigation; its original expiry never extends. */
export function resumeBirthDate(storage: StorageAccess, now = Date.now()): { birthDate: string; expiresAt: number } | null {
  try {
    const incoming = storage.getItem(birthDateHandoffKey);
    storage.removeItem(birthDateHandoffKey);
    const raw = incoming ?? storage.getItem(birthDateDraftKey);
    const draft = raw ? JSON.parse(raw) : null;
    if (!draft || !validDate(draft.birthDate) || !Number.isFinite(draft.expiresAt) || draft.expiresAt <= now || draft.expiresAt > now + maxAge) {
      clearBirthDateDraft(storage); return null;
    }
    const result = { birthDate: draft.birthDate, expiresAt: draft.expiresAt };
    storage.setItem(birthDateDraftKey, JSON.stringify(result));
    return result;
  } catch { clearBirthDateDraft(storage); return null; }
}
export function updateBirthDateDraft(storage: StorageAccess, birthDate: string, now = Date.now()) {
  const draft = resumeBirthDate(storage, now);
  if (!draft) return; // Ordinary report entry never starts persistence.
  if (!validDate(birthDate)) { clearBirthDateDraft(storage); return; }
  try { storage.setItem(birthDateDraftKey, JSON.stringify({ birthDate, expiresAt: draft.expiresAt })); } catch { /* Optional storage. */ }
}
export function clearBirthDateDraft(storage: StorageAccess) {
  try { storage.removeItem(birthDateDraftKey); storage.removeItem(birthDateHandoffKey); } catch { /* Optional storage. */ }
}
