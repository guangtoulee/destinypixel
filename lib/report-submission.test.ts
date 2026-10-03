import assert from "node:assert/strict";
import test from "node:test";
import Module, { createRequire } from "node:module";
import { birthFormFeedback } from "./birth-form-feedback";

const writes: Array<{ path: string; options: { body: { p_payload: { birth: { birthDate: string; locale: string } } } } }> = [];
const savedCookies: unknown[][] = [];
let storageFails = false;
const loader = Module as unknown as { _load: (id: string, ...args: unknown[]) => unknown };
const originalLoad = loader._load;
loader._load = function (id, ...args) {
  if (id === "next/navigation") return { redirect: (url: string) => { throw Object.assign(new Error("redirect"), { destination: url }); } };
  if (id === "next/headers") return { headers: async () => new Headers(), cookies: async () => ({ set: (...values: unknown[]) => savedCookies.push(values) }) };
  if (id.endsWith("/commerce/access")) return { currentMember: async () => null, newGuestToken: () => "mock-token", guestHash: () => "mock-hash", guestCookieName: () => "mock-cookie" };
  if (id.endsWith("/commerce/rate-limit")) return { limitCommerceAction: async () => {} };
  if (id.endsWith("/commerce/database")) return { databaseRequest: async (path: string, options: typeof writes[number]["options"]) => { if (storageFails) throw new Error("Mock storage timeout"); writes.push({path,options}); return "mock-private-report"; } };
  return originalLoad.call(this, id, ...args);
};
let action: (data: FormData) => Promise<never>;
try { ({ createFusionReportAction: action } = createRequire(import.meta.url)("../app/actions")); }
finally { loader._load = originalLoad; }
function form(overrides: Record<string,string> = {}) {
 const data = new FormData();
 for (const [key,value] of Object.entries({name:"Fixture",gender:"female",birthDate:"1990-01-01",birthTime:"09:30",birthPlace:"上海",locale:"zh",...overrides}))data.set(key,value);
 return data;
}
async function destination(data: FormData) {
 try { await action(data); throw new Error("Expected redirect"); }
 catch (error) { assert.ok(error && typeof error === "object" && "destination" in error); return String(error.destination); }
}
test("real report action completes for all four languages using mocked persistence and no network",async()=>{
 const fetch = globalThis.fetch;
 globalThis.fetch = async()=>{throw new Error("Network forbidden");};
 try { for (const locale of ["en","zh","zh-TW","ru"]) {
  assert.equal(await destination(form({locale})),`/report/mock-private-report?locale=${locale}`);
  const write=writes.at(-1)!;
  assert.equal(write.path,"rpc/destiny_create_private_report");
  assert.equal(write.options.body.p_payload.birth.birthDate,"1990-01-01");
  assert.equal(write.options.body.p_payload.birth.locale,locale);
 } assert.equal(savedCookies.length,4); } finally {globalThis.fetch=fetch;}
});
test("missing date/time and unsupported cities identify the failed field before persistence",async()=>{
 const before=writes.length;
 for (const [values,code] of [[{birthDate:""},"missing-birth-date"],[{birthTime:""},"missing-birth-time"],[{birthPlace:"深圳"},"unsupported-birth-city"]] as const) {
  assert.equal(await destination(form(values)),`/?locale=zh&error=${code}#report`);
  for(const locale of ["en","zh","zh-TW","ru"] as const) assert.ok(birthFormFeedback(code,locale));
 }
 assert.equal(writes.length,before);
});
test("storage failure returns readable localized feedback without an unhandled exception",async()=>{
 storageFails=true;
 try {assert.equal(await destination(form()),"/?locale=zh&error=report-storage-unavailable#report");}
 finally {storageFails=false;}
});
