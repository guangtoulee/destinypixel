import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import { calculateNatalChart, parseNatalInput } from "./astrology";
import { initialTable, takeCard } from "./tarot";
import { parseCelestialSnapshot, readRecordBody, recordLimitBytes, recordPrefix } from "./records";
import { natalReadingTargets } from "./natal-reading";
import { celestialCopy } from "./copy";
import { sanitizeAnalyticsUrl } from "../analytics";
const chart = calculateNatalChart(parseNatalInput({birthDate:"1990-05-15",birthTime:"12:00",cityId:"custom",latitude:0,longitude:0,timezone:"UTC",locale:"en"}).input);
const astro = {version:1,kind:"astrology",locale:"en",chart,reading:null};
const tarot = {version:1,kind:"tarot",locale:"en",table:takeCard(initialTable(),0,0),question:"Synthetic question",reading:null};
test("bounded snapshots preserve every planet, house, card and supplied interpretation",()=>{
  const reading={summary:"Synthetic summary. ".repeat(8).trim(),entries:natalReadingTargets(chart,celestialCopy("en"),"en").map(t=>({id:t.id,meaning:"Synthetic symbol explanation. ".repeat(4).trim(),reading:"Synthetic contextual interpretation. ".repeat(14).trim(),practice:"Synthetic practice for this position."})),reflection:"A synthetic reflection question?"};
  const value=parseCelestialSnapshot({...astro,reading,member_id:"untrusted",access:"full"});
  assert.equal(value.kind,"astrology");if(value.kind!=="astrology")return;
  assert.deepEqual(value.chart,chart);assert.deepEqual(value.reading,reading);assert.equal("member_id" in value,false);assert.equal("access" in value,false);
  const t=parseCelestialSnapshot(tarot);assert.deepEqual(t,tarot);
  assert.throws(()=>parseCelestialSnapshot({...astro,reading:{...reading,entries:reading.entries.slice(1)}}));
});
test("invalid snapshots cannot contain duplicate cards, broken houses, oversized questions or fake AI targets",()=>{
  const cases=[{...tarot,question:"x".repeat(501)},{...tarot,table:{...tarot.table,deck:[...tarot.table.deck.slice(1),tarot.table.deck[1]]}},{...astro,chart:{...chart,houses:[...chart.houses.slice(1),0]}},{...astro,chart:{...chart,placements:chart.placements.slice(1)}},{...astro,chart:{...chart,latitude:NaN}},{...tarot,locale:"xx"}];
  cases.forEach(s=>assert.throws(()=>parseCelestialSnapshot(s)));
  assert.throws(()=>parseCelestialSnapshot({...tarot,reading:{summary:"Summary",sections:[0,1,2].map(()=>({title:"Title",body:"A body paragraph"})),reflection:"Question?"}}));
});
test("request cap uses bytes, including streamed requests; private URLs never reach analytics",async()=>{
  const request=(body:string)=>new Request("https://site.test/api",{method:"POST",headers:{"Content-Type":"application/json"},body});
  assert.equal((await readRecordBody(request('{"id":"ok"}'))).id,"ok");
  await assert.rejects(()=>readRecordBody(request(JSON.stringify({text:"中".repeat(recordLimitBytes/2)}))),/RECORD_TOO_LARGE/);
  assert.equal(sanitizeAnalyticsUrl(`https://www.destinypixel.com/account/readings/${randomUUID()}?locale=zh`),null);
});
test("member and administrator routes enforce ownership, origin, namespace, pagination and idempotent persistence",async()=>{
  const require=createRequire(import.meta.url), runtimeModule=require("node:module"),originalLoad=runtimeModule._load,originalFetch=globalThis.fetch;
  const env={SUPABASE_URL:"https://database.example.test",SUPABASE_SERVICE_ROLE_KEY:"synthetic-key",DESTINY_ADMIN_MEMBER_IDS:"",DESTINY_MEMBER_LOCAL_STORE_ENABLED:"false"};
  const oldEnv=Object.fromEntries(Object.keys(env).map(k=>[k,process.env[k]]));Object.assign(process.env,env);
  const tokens=[randomBytes(32).toString("base64url"),randomBytes(32).toString("base64url")];
  const members=tokens.map((token,i)=>({id:randomUUID(),email:`test-${i}@example.test`,plan:"free",session_token_hash:createHash("sha256").update(token).digest("hex"),session_expires_at:new Date(Date.now()+86400000).toISOString()}));
  let token:string|undefined;
  const rows:Record<string,any>[]=[];const writes:string[]=[];
  runtimeModule._load=(name:string,parent:unknown,isMain:boolean)=>name==="server-only"?{}:name==="next/headers"?{cookies:async()=>({get:()=>token?{value:token}:undefined})}:originalLoad(name,parent,isMain);
  globalThis.fetch=async(input,init)=>{
    const url=new URL(String(input)),table=url.pathname.split("/").at(-1),method=init?.method||"GET";
    if(table==="destiny_members")return Response.json(members.filter(m=>`eq.${m.session_token_hash}`===url.searchParams.get("session_token_hash")));
    assert.equal(table,"saved_reports","must never read AI, commerce or unrelated tables");
    if(method==="POST"){
      assert.equal(url.searchParams.get("on_conflict"),"member_id,report_id");assert.match(new Headers(init?.headers).get("prefer")||"",/merge-duplicates/);
      const body=JSON.parse(String(init?.body));writes.push(body.report_id);const old=rows.find(r=>r.member_id===body.member_id&&r.report_id===body.report_id);
      if(old)Object.assign(old,body);else rows.push({...body,created_at:new Date().toISOString()});return Response.json([rows.find(r=>r.member_id===body.member_id&&r.report_id===body.report_id)]);
    }
    let found=rows.filter(r=>{const member=url.searchParams.get("member_id"),id=url.searchParams.get("report_id");return (!member||member===`eq.${r.member_id}`)&&(id?.startsWith("like.")?r.report_id.startsWith(recordPrefix):id===`eq.${r.report_id}`);});
    if(method==="DELETE"){found.forEach(r=>rows.splice(rows.indexOf(r),1));return Response.json(found);}
    found=found.slice(Number(url.searchParams.get("offset")||0),Number(url.searchParams.get("offset")||0)+Number(url.searchParams.get("limit")||100));
    if(url.searchParams.get("select")?.includes("has_reading:"))found=found.map(({report_snapshot,...r})=>({...r,has_reading:report_snapshot.hasReading}));
    return Response.json(found);
  };
  try{
    const list=require("../../app/api/members/celestial-records/route"), detail=require("../../app/api/members/celestial-records/[id]/route"),admin=require("../../app/api/admin/celestial-records/route"),adminDelete=require("../../app/api/admin/celestial-records/[id]/route");
    const id=randomUUID(),context={params:Promise.resolve({id})};
    const request=(method="GET",body?:unknown,origin="https://site.test",suffix="")=>new Request(`https://site.test/api/members/celestial-records${suffix}`,{method,headers:{origin,"Content-Type":"application/json"},...(body?{body:JSON.stringify(body)}:{})});
    assert.equal((await list.GET(request())).status,401);assert.equal((await list.POST(request("POST",{id,snapshot:astro}))).status,401);
    token=tokens[0];assert.equal((await list.POST(request("POST",{id,snapshot:astro},"https://evil.test"))).status,403);
    assert.equal((await list.POST(request("POST",{id,snapshot:astro,member_id:members[1].id}))).status,200);
    assert.equal(rows[0].member_id,members[0].id);assert.equal(rows[0].report_id,recordPrefix+id);
    await list.POST(request("POST",{id,snapshot:astro}));assert.equal(rows.length,1,"retries must not duplicate saved records");
    const saved=await (await detail.GET(request(),context)).json();assert.deepEqual(saved.record.snapshot.chart,chart);
    const summaries=await (await list.GET(request())).json();assert.equal(summaries.records.length,1);assert.equal(JSON.stringify(summaries).includes("placements"),false);
    token=tokens[1];assert.equal((await detail.GET(request(),context)).status,404);assert.equal((await detail.DELETE(request("DELETE"),context)).status,404);assert.equal((await admin.GET(request())).status,403);assert.equal(rows.length,1);
    assert.equal((await detail.GET(request(),{params:Promise.resolve({id:"a-real-paid-report"})})).status,404);
    process.env.DESTINY_ADMIN_MEMBER_IDS=members[1].id;
    assert.equal((await admin.GET(request())).status,200);
    assert.equal((await adminDelete.DELETE(request("DELETE",undefined,"https://evil.test",`/${id}?memberId=${members[0].id}`),context)).status,403);
    assert.equal((await adminDelete.DELETE(request("DELETE",undefined,"https://site.test",`/${id}?memberId=${members[0].id}`),context)).status,200);assert.equal(rows.length,0);
    token=tokens[0];assert.equal((await detail.GET(request(),context)).status,404);
    await list.POST(request("POST",{id:randomUUID(),snapshot:tarot}));assert.equal(rows.length,1);
    for(let i=0;i<21;i++)await list.POST(request("POST",{id:randomUUID(),snapshot:astro}));
    const page=await(await list.GET(request())).json();assert.equal(page.records.length,20);assert.equal(page.nextOffset,20);
    const page2=await(await list.GET(request("GET",undefined,"https://site.test","?offset=20"))).json();assert.equal(page2.records.length,2);assert.equal(page2.nextOffset,null);
    assert.ok(writes.every(id=>id.startsWith(recordPrefix)));
  }finally{runtimeModule._load=originalLoad;globalThis.fetch=originalFetch;for(const [k,v]of Object.entries(oldEnv)){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});
