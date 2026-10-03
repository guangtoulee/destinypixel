/** One-use, short-lived handoff inside this tab only, created on an explicit continue click. */
export const birthDateHandoffKey = "destinypixel-birthday-handoff";
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
