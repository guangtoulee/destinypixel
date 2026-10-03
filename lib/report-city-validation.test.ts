import assert from "node:assert/strict";
import test from "node:test";
import Module, { createRequire } from "node:module";
// Next's client navigation module cannot run in a react-server Node test.
// Replace only the redirect boundary; the real action, parser and early validation run.
const loader = Module as unknown as { _load: (id: string, ...args: unknown[]) => unknown };
const originalLoad = loader._load;
loader._load = function (id, ...args) {
  if (id === "next/navigation") return { redirect: (url: string) => { throw Object.assign(new Error("redirect"), { digest: `NEXT_REDIRECT;${url}` }); } };
  return originalLoad.call(this, id, ...args);
};
let createFusionReportAction: (data: FormData) => Promise<never>;
try { ({ createFusionReportAction } = createRequire(import.meta.url)("../app/actions")); }
finally { loader._load = originalLoad; }
// Unknown places must exit before auth, rate limits, AI or database calls.
test("unrecognized report cities redirect before any network or persistence",async()=>{
 const originalFetch=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;throw new Error("No network allowed in this regression");};
 try { for(const city of ["深圳","杭州","乌鲁木齐",""]) {
  const data=new FormData();for(const [key,value] of Object.entries({name:"Fixture",gender:"female",locale:"zh",birthDate:"1990-05-12",birthTime:"09:30",birthPlace:city}))data.set(key,value);
  await assert.rejects(createFusionReportAction(data),(error:unknown)=> Boolean(error&&typeof error==="object"&&"digest" in error&&String(error.digest).includes("unsupported-birth-city")));
 }assert.equal(calls,0); }finally{globalThis.fetch=originalFetch;}
});
